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
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardLength;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardTileArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorMaterialNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.hasFloorConfig;
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

        // Vopsea / Tapet — doar la Parchet/Mochetă (alternativa la faianță).
        if (!isGresie && room.wallFinish() != null) {
            for (WallFinishType type : new WallFinishType[]{WallFinishType.VOPSEA, WallFinishType.TAPET}) {
                double area = wallFinishArea(room, type);
                long wallCount = room.wallFinish().finishes().values().stream().filter(f -> f == type).count();
                if (area > 0) {
                    drafts.add(new ItemDraft(
                            room.id(),
                            type.label() + " (" + wallCount + " pereți)",
                            WALL_FINISH_MATERIAL_TYPE.get(type),
                            round2(area)
                    ));
                }
            }
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
    public static List<Item> reconcile(List<Item> items, Room room, Supplier<String> idGenerator) {
        List<ItemDraft> freshAutoItems = generateAutoItems(room);

        List<Item> untouchedItems = items.stream()
                .filter(i -> !(i.roomId().equals(room.id()) && i.origin() == ItemOrigin.CONFIGURARE))
                .toList();
        List<Item> existingAutoItems = items.stream()
                .filter(i -> i.roomId().equals(room.id()) && i.origin() == ItemOrigin.CONFIGURARE)
                .toList();

        List<Item> mergedAutoItems = new ArrayList<>();
        for (ItemDraft fresh : freshAutoItems) {
            Item existing = existingAutoItems.stream()
                    .filter(i -> i.materialType() == fresh.materialType())
                    .findFirst()
                    .orElse(null);
            if (existing != null) {
                mergedAutoItems.add(new Item(
                        existing.id(), existing.roomId(), fresh.name(), existing.materialType(),
                        existing.source(), existing.status(), fresh.quantity(), existing.unitPrice(),
                        existing.productUrl(), existing.imageUrl(), existing.origin()
                ));
            } else {
                mergedAutoItems.add(new Item(
                        idGenerator.get(), fresh.roomId(), fresh.name(), fresh.materialType(),
                        "", ItemStatus.IN_ASTEPTARE, fresh.quantity(), Money.zero(),
                        null, null, ItemOrigin.CONFIGURARE
                ));
            }
        }

        List<Item> result = new ArrayList<>(untouchedItems);
        result.addAll(mergedAutoItems);
        return result;
    }
}
