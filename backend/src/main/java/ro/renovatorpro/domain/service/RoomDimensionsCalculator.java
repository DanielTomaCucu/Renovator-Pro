package ro.renovatorpro.domain.service;

import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;

import java.util.List;
import java.util.Map;

/**
 * Calculele de necesar de material pentru configurarea tehnică a unei camere (pardoseală, plintă,
 * faianță, vopsea/tapet, glaf de fereastră) — port 1:1 din {@code frontend/src/shared/functions/dimensions.ts}.
 * Toate suprafețele/lungimile sunt {@code double} (mp/ml), NU {@code Money} — nu sunt sume de bani.
 */
public final class RoomDimensionsCalculator {

    /** Pierdere estimată la tăiere/așezare — aplicată la pardoseală și la faianță. */
    private static final double WASTE_RATIO_MATERIAL = 0.1;
    /** Pierdere estimată la plintă (tăieri la colțuri). */
    private static final double WASTE_RATIO_BASEBOARD = 0.05;
    /** Pierdere estimată la vopsea (al 2-lea strat, scurgeri). */
    private static final double WASTE_RATIO_PAINT = 0.1;
    /** Pierdere estimată la tapet (potrivire model/motiv la îmbinări) — mai mare decât la vopsea. */
    private static final double WASTE_RATIO_WALLPAPER = 0.15;
    /** Pierdere estimată la glaful de bordură al ferestrelor (tăieri la colțuri) — la fel ca la plintă. */
    private static final double WASTE_RATIO_WINDOW_TRIM = 0.05;

    private static final List<Wall> WALL_ORDER = List.of(Wall.NORD, Wall.EST, Wall.SUD, Wall.VEST);

    private RoomDimensionsCalculator() {
    }

    /**
     * Lungimea sugerată a unui perete, dacă am presupune camera pătrată (√suprafață) — folosită doar ca
     * valoare implicită la activarea faianței/finisajului de pereți, ca userul să nu pornească de la 0
     * la fiecare perete. Rămâne complet editabilă după aceea (nu se resincronizează automat).
     */
    public static double estimatedSquareWallSide(Room room) {
        if (room.floorArea() == null || room.floorArea() <= 0) return 0;
        return Math.sqrt(room.floorArea());
    }

    /** Suma lățimilor tuturor ușilor camerei (indiferent de perete). */
    public static double totalDoorWidth(Room room) {
        return room.doors().values().stream().mapToDouble(RoomDoor::width).sum();
    }

    /** Aria ușii de pe un perete dat (0 dacă nu are ușă). */
    public static double doorArea(Room room, Wall wall) {
        RoomDoor d = room.doors().get(wall);
        return d == null ? 0 : d.width() * d.height();
    }

    /** Aria ferestrei de pe un perete dat (0 dacă nu are fereastră). */
    public static double windowArea(Room room, Wall wall) {
        RoomWindow w = room.windows().get(wall);
        return w == null ? 0 : w.width() * w.height();
    }

    /** Aria golurilor (ușă + fereastră) de pe un perete dat — folosită la scăderea din faianță/vopsea/tapet. */
    private static double openingsArea(Room room, Wall wall) {
        return doorArea(room, wall) + windowArea(room, wall);
    }

    /**
     * Lungimea totală de glaf/bordură necesară pentru toate ferestrele camerei (perimetrul fiecărei
     * ferestre, 2×(lățime+înălțime)), cu pierdere de tăiere la colțuri — indiferent de tipul de pardoseală.
     */
    public static double windowTrimLength(Room room) {
        double totalPerimeter = 0;
        for (Wall wall : WALL_ORDER) {
            RoomWindow w = room.windows().get(wall);
            if (w != null) totalPerimeter += 2 * (w.width() + w.height());
        }
        return totalPerimeter * (1 + WASTE_RATIO_WINDOW_TRIM);
    }

    /** O cameră are pardoseala configurată dacă are material și suprafață completate. */
    public static boolean hasFloorConfig(Room room) {
        return room.floorMaterial() != null && room.floorArea() != null && room.floorArea() > 0;
    }

    /**
     * Perimetrul camerei — explicit dacă a fost completat, altfel derivat din suprafață presupunând
     * camera pătrată (4×√mp). Așa plinta se calculează direct din suprafața introdusă la Pardoseală,
     * fără să ceară userului un câmp separat de perimetru — port 1:1 din dimensions.ts.
     */
    public static double roomPerimeter(Room room) {
        if (room.perimeter() != null) return room.perimeter();
        if (room.floorArea() == null || room.floorArea() <= 0) return 0;
        return 4 * Math.sqrt(room.floorArea());
    }

    /** Lungimea de plintă necesară — perimetrul camerei minus golurile tuturor ușilor, cu pierdere de tăiere. */
    public static double baseboardLength(Room room) {
        double perimeter = roomPerimeter(room);
        if (perimeter <= 0) return 0;
        return Math.max(0, perimeter - totalDoorWidth(room)) * (1 + WASTE_RATIO_BASEBOARD);
    }

    /**
     * La Gresie, plinta e tăiată din aceleași plăci — suprafața ei (lungime × înălțime plintă) se adaugă
     * la necesarul total de gresie, nu e un produs separat. La celelalte pardoseli plinta e produs distinct
     * (nu se face din parchet/mochetă), deci funcția întoarce 0.
     */
    public static double baseboardTileArea(Room room) {
        if (room.floorMaterial() != FlooringType.GRESIE || room.baseboardHeight() == null) return 0;
        return baseboardLength(room) * room.baseboardHeight();
    }

    /**
     * Necesar de material pentru pardoseală, cu pierdere de tăiere inclusă. La Gresie include și
     * suprafața de plintă tăiată din plăci ({@link #baseboardTileArea}) — vezi comentariul funcției de mai sus.
     */
    public static double floorMaterialNeeded(Room room) {
        if (!hasFloorConfig(room)) return 0;
        double floor = room.floorArea() * (1 + WASTE_RATIO_MATERIAL);
        return floor + baseboardTileArea(room);
    }

    /** Pereții efectiv placați cu faianță, în ordinea N, E, S, V, limitați la {@code tiledWallsCount}. */
    private static List<Wall> tiledWalls(Room room) {
        WallTiling tiling = room.wallTiling();
        if (tiling == null) return List.of();
        return WALL_ORDER.subList(0, Math.min(tiling.tiledWallsCount(), WALL_ORDER.size()));
    }

    /** Suprafață de faianță necesară — suma pereților placați × înălțime, minus golurile ușilor și ferestrelor, cu pierdere. Doar la Gresie. */
    public static double wallTilingArea(Room room) {
        WallTiling tiling = room.wallTiling();
        if (tiling == null || room.floorMaterial() != FlooringType.GRESIE) return 0;
        List<Wall> walls = tiledWalls(room);
        Map<Wall, Double> lengths = tiling.wallLengths();
        double totalLength = walls.stream().mapToDouble(w -> lengths.getOrDefault(w, 0.0)).sum();
        double grossArea = totalLength * tiling.tileHeight();
        double openings = walls.stream().mapToDouble(w -> openingsArea(room, w)).sum();
        return Math.max(0, grossArea - openings) * (1 + WASTE_RATIO_MATERIAL);
    }

    /** Pereții cu finisajul cerut ({@code Vopsea} sau {@code Tapet}), din configurarea {@code wallFinish} — doar la Parchet/Mochetă. */
    private static List<Wall> wallsWithFinish(Room room, WallFinishType type) {
        WallFinish finish = room.wallFinish();
        if (finish == null || room.floorMaterial() == FlooringType.GRESIE) return List.of();
        return WALL_ORDER.stream().filter(w -> finish.finishes().get(w) == type).toList();
    }

    /** Suprafață de vopsea/tapet pe pereții cu finisajul respectiv, minus golurile ușilor și ferestrelor, cu pierdere specifică. Doar la Parchet/Mochetă. */
    public static double wallFinishArea(Room room, WallFinishType type) {
        WallFinish finish = room.wallFinish();
        if (finish == null) return 0;
        List<Wall> walls = wallsWithFinish(room, type);
        if (walls.isEmpty()) return 0;
        Map<Wall, Double> lengths = finish.wallLengths();
        double totalLength = walls.stream().mapToDouble(w -> lengths.getOrDefault(w, 0.0)).sum();
        double grossArea = totalLength * finish.wallHeight();
        double openings = walls.stream().mapToDouble(w -> openingsArea(room, w)).sum();
        double wasteRatio = type == WallFinishType.VOPSEA ? WASTE_RATIO_PAINT : WASTE_RATIO_WALLPAPER;
        return Math.max(0, grossArea - openings) * (1 + wasteRatio);
    }

    /** Sumar tehnic agregat pe tot proiectul — suprafață utilă totală + progres de configurare. */
    public record ProjectTechnicalSummary(double totalFloorArea, double configuredRoomsRatio) {
    }

    public static ProjectTechnicalSummary projectTechnicalSummary(List<Room> rooms) {
        double totalFloorArea = rooms.stream().mapToDouble(r -> r.floorArea() == null ? 0 : r.floorArea()).sum();
        long configuredCount = rooms.stream()
                .filter(r -> hasFloorConfig(r) && !r.doors().isEmpty() && r.perimeter() != null)
                .count();
        double ratio = rooms.isEmpty() ? 0 : (double) configuredCount / rooms.size();
        return new ProjectTechnicalSummary(totalFloorArea, ratio);
    }
}
