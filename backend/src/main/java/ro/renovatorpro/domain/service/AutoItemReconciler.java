package ro.renovatorpro.domain.service;

import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.adhesiveBags;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardLength;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardTileArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.ceilingPaintArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorMaterialNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.groutKg;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.hasFloorConfig;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintAboveTilingArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintPrimerLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.tilingPrimerLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.underlayArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.wallFinishArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.wallTilingArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.windowTrimLength;

/**
 * Reconcilierea elementelor „Din Configurare" (origin {@link ItemOrigin#CONFIGURARE}) ale unei camere
 * cu măsurătorile tehnice curente — port 1:1 din {@code frontend/src/shared/functions/auto-items.ts}.
 * Regula din {@code docs/api-contract.md} §Item: elementele existente își păstrează id/preț/status/sursă
 * (editabile manual de user), doar name/quantity se recalculează; cele orfane se elimină; elementele
 * {@link ItemOrigin#MANUAL} nu sunt NICIODATĂ atinse de acest proces.
 */
public final class AutoItemReconciler {

    private static final Map<FlooringType, MaterialType> FLOOR_MATERIAL_TYPE = new EnumMap<>(FlooringType.class);
    private static final Map<WallFinishType, MaterialType> WALL_FINISH_MATERIAL_TYPE = new EnumMap<>(WallFinishType.class);

    static {
        FLOOR_MATERIAL_TYPE.put(FlooringType.GRESIE, MaterialType.GRESIE);
        FLOOR_MATERIAL_TYPE.put(FlooringType.PARCHET_LAMINAT, MaterialType.PARCHET);
        FLOOR_MATERIAL_TYPE.put(FlooringType.MOCHETA, MaterialType.ALTELE);

        WALL_FINISH_MATERIAL_TYPE.put(WallFinishType.VOPSEA, MaterialType.VOPSEA);
        WALL_FINISH_MATERIAL_TYPE.put(WallFinishType.TAPET, MaterialType.TAPET);
    }

    private AutoItemReconciler() {
    }

    /**
     * Un element auto-generat, încă fără id (id-ul se atribuie la reconciliere — vezi {@link #reconcile}).
     * Oglindă a {@code Omit<Item, "id">} din TS.
     */
    public record ItemDraft(
            String roomId,
            String name,
            MaterialType materialType,
            BigDecimal quantity
    ) {
    }

    private static BigDecimal round2(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Elementele „de cumpărat" derivate din măsurătorile tehnice ale unei camere (pardoseală, plintă,
     * faianță la Gresie, vopsea/tapet la Parchet/Mochetă, glaf ferestre). Fără preț (0) — doar cantitatea
     * calculată contează până când userul completează prețul manual în /elemente.
     */
    public static List<ItemDraft> generateAutoItems(Room room) {
        List<ItemDraft> drafts = new ArrayList<>();
        boolean isGresie = room.floorMaterial() == FlooringType.GRESIE;

        if (hasFloorConfig(room)) {
            // La Gresie, cantitatea de mai jos include deja plinta (tăiată din aceleași plăci) — vezi floorMaterialNeeded.
            boolean includesBaseboard = isGresie && baseboardTileArea(room) > 0;
            drafts.add(new ItemDraft(
                    room.id(),
                    room.floorMaterial().label() + " (Pardoseală" + (includesBaseboard ? " + Plintă" : "") + ")",
                    FLOOR_MATERIAL_TYPE.get(room.floorMaterial()),
                    round2(floorMaterialNeeded(room))
            ));
        }

        // Plintă separată — doar când NU e Gresie (la Gresie e deja inclusă în pardoseală, mai sus).
        double plinta = baseboardLength(room);
        if (!isGresie && plinta > 0) {
            drafts.add(new ItemDraft(room.id(), "Plintă", MaterialType.PLINTA, round2(plinta)));
        }

        // Faianță — doar la Gresie.
        double faianta = wallTilingArea(room);
        WallTiling tiling = room.wallTiling();
        if (isGresie && tiling != null && tiling.tiledWallsCount() > 0 && faianta > 0) {
            drafts.add(new ItemDraft(
                    room.id(),
                    "Faianță (" + tiling.tiledWallsCount() + " pereți)",
                    MaterialType.FAIANTA,
                    round2(faianta)
            ));
        }

        // Tapet — doar la Parchet/Mochetă (alternativa la faianță).
        if (!isGresie && room.wallFinish() != null) {
            double wallpaperArea = wallFinishArea(room, WallFinishType.TAPET);
            long wallCount = room.wallFinish().finishes().values().stream()
                    .filter(f -> f == WallFinishType.TAPET).count();
            if (wallpaperArea > 0) {
                drafts.add(new ItemDraft(
                        room.id(),
                        WallFinishType.TAPET.label() + " (" + wallCount + " pereți)",
                        MaterialType.TAPET,
                        round2(wallpaperArea)
                ));
            }
        }

        // Vopsea — agregată pe cameră (pereți la Parchet/Mochetă + tavan + deasupra faianței la Gresie,
        // ACUM la orice pardoseală, nu doar Parchet/Mochetă — docs/cerinte-zugraveli.md secțiunea A).
        // Cantitatea e în LITRI (paintLiters), nu mp — spre deosebire de celelalte elemente auto-generate.
        double wallPaintArea = wallFinishArea(room, WallFinishType.VOPSEA);
        double ceilingArea = ceilingPaintArea(room);
        double aboveTilingArea = paintAboveTilingArea(room);
        double totalPaintLiters = paintLiters(wallPaintArea + ceilingArea + aboveTilingArea);
        if (totalPaintLiters > 0) {
            long paintedWallCount = room.wallFinish() == null ? 0 : room.wallFinish().finishes().values().stream()
                    .filter(f -> f == WallFinishType.VOPSEA).count();
            List<String> parts = new ArrayList<>();
            if (paintedWallCount > 0) parts.add(paintedWallCount + " pereți");
            if (ceilingArea > 0) parts.add("tavan");
            if (aboveTilingArea > 0) parts.add("deasupra faianței");
            String suffix = parts.isEmpty() ? "" : " (" + String.join(" + ", parts) + ")";
            drafts.add(new ItemDraft(room.id(), "Vopsea" + suffix, MaterialType.VOPSEA, round2(totalPaintLiters)));
        }

        // Amorsă zugrăveală — sub vopsea/tapet (pereți + tavan + deasupra faianței).
        double paintPrimer = paintPrimerLiters(room);
        if (paintPrimer > 0) {
            drafts.add(new ItemDraft(room.id(), "Amorsă zugrăveală", MaterialType.AMORSA, round2(paintPrimer)));
        }

        // Amorsă placări — sub adezivul de pardoseală/faianță.
        double tilingPrimer = tilingPrimerLiters(room);
        if (tilingPrimer > 0) {
            drafts.add(new ItemDraft(room.id(), "Amorsă placări", MaterialType.AMORSA, round2(tilingPrimer)));
        }

        // Adeziv gresie și faianță — un singur produs cimentos, cantitate comună în saci de 25 kg.
        int bags = adhesiveBags(room);
        if (bags > 0) {
            drafts.add(new ItemDraft(room.id(), "Adeziv gresie și faianță", MaterialType.ADEZIV_PLACARI, round2(bags)));
        }

        // Chit de rosturi — pardoseală gresie + faianță, cantitate comună în kg.
        double grout = groutKg(room);
        if (grout > 0) {
            drafts.add(new ItemDraft(room.id(), "Chit de rosturi", MaterialType.CHIT_ROSTURI, round2(grout)));
        }

        // Folie sub parchet laminat — tipul (nume) depinde de underfloorHeating; același slot logic (materialType).
        double underlay = underlayArea(room);
        if (underlay > 0) {
            String name = Boolean.TRUE.equals(room.underfloorHeating())
                    ? "Folie parchet — încălzire în pardoseală (R mic)"
                    : "Folie parchet — XPS 3 mm";
            drafts.add(new ItemDraft(room.id(), name, MaterialType.FOLIE_PARCHET, round2(underlay)));
        }

        // Glaf/bordură ferestre — indiferent de tipul de pardoseală, ori de câte ori sunt ferestre configurate.
        double trim = windowTrimLength(room);
        if (trim > 0) {
            long windowCount = room.windows().size();
            drafts.add(new ItemDraft(
                    room.id(),
                    "Glaf Fereastră (" + windowCount + " " + (windowCount == 1 ? "fereastră" : "ferestre") + ")",
                    MaterialType.GLAF_FEREASTRA,
                    round2(trim)
            ));
        }

        return drafts;
    }

    /**
     * Reconciliază elementele auto-generate (origin Configurare) ale unei camere cu noua configurare tehnică:
     * păstrează id/preț/status/sursă ale celor existente (pot fi editate manual de user), le actualizează
     * doar numele/cantitatea, adaugă cele noi apărute (via {@code idGenerator}) și elimină cele a căror
     * măsurătoare a fost ștearsă. Elementele adăugate manual de user (origin Manual) nu sunt niciodată atinse.
     */
    public static List<Item> reconcile(List<Item> items, Room room, Supplier<String> idGenerator, Instant now) {
        List<ItemDraft> freshAutoItems = generateAutoItems(room);

        List<Item> untouchedItems = items.stream()
                .filter(i -> !(i.roomId().equals(room.id()) && i.origin() == ItemOrigin.CONFIGURARE))
                .toList();
        List<Item> existingAutoItems = items.stream()
                .filter(i -> i.roomId().equals(room.id()) && i.origin() == ItemOrigin.CONFIGURARE)
                .toList();

        // Pool mutabil, NU stream direct pe existingAutoItems — mai multe drafts proaspete pot avea
        // ACELAȘI materialType (ex. Amorsă zugrăveală + Amorsă placări, ambele MaterialType.AMORSA);
        // fiecare element existent trebuie consumat o singură dată, altfel două drafts ar „fura"
        // id-ul aceluiași element existent (coliziune la salvare).
        List<Item> unmatchedExisting = new ArrayList<>(existingAutoItems);
        List<Item> mergedAutoItems = new ArrayList<>();
        for (ItemDraft fresh : freshAutoItems) {
            Item existing = unmatchedExisting.stream()
                    .filter(i -> i.materialType() == fresh.materialType())
                    .findFirst()
                    .orElse(null);
            if (existing != null) {
                unmatchedExisting.remove(existing);
                // createdAt/purchasedAt se păstrează neschimbate — la fel ca id/preț/status/sursă.
                mergedAutoItems.add(new Item(
                        existing.id(), existing.roomId(), fresh.name(), existing.materialType(),
                        existing.source(), existing.status(), fresh.quantity(), existing.unitPrice(),
                        existing.productUrl(), existing.imageUrl(), existing.origin(),
                        existing.createdAt(), existing.purchasedAt()
                ));
            } else {
                mergedAutoItems.add(new Item(
                        idGenerator.get(), fresh.roomId(), fresh.name(), fresh.materialType(),
                        "", ItemStatus.IN_ASTEPTARE, fresh.quantity(), Money.zero(),
                        null, null, ItemOrigin.CONFIGURARE, now, null
                ));
            }
        }

        List<Item> result = new ArrayList<>(untouchedItems);
        result.addAll(mergedAutoItems);
        return result;
    }
}
