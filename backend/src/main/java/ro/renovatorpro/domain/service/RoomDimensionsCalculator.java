package ro.renovatorpro.domain.service;

import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.InstallationType;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.TileSize;
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
 *
 * <p>Procentele de pierdere sunt calibrate pe norme reale de șantier (surse în
 * {@code docs/tickete-audit-calcule-securitate.md} — CALC-1…CALC-8), nu valori arbitrare.
 */
public final class RoomDimensionsCalculator {

    /** Pierdere de bază la montaj drept (pardoseală/faianță) — norma industrială pt. montaj simplu. */
    private static final double WASTE_RATIO_DREPT = 0.10;
    /** Pierdere la montaj diagonal — tăieturi în unghi la fiecare margine, mai mult rebut. */
    private static final double WASTE_RATIO_DIAGONAL = 0.15;
    /** Pierdere la montaj herringbone/chevron — fiecare bucată tăiată la ambele capete, rând de start sacrificat. */
    private static final double WASTE_RATIO_HERRINGBONE = 0.18;
    /** Supliment de pierdere pt. plăci mari/foarte mari (600mm+) — mai puține tăieturi, dar fiecare irosește mai mult. */
    private static final double WASTE_SUPPLEMENT_TILE_MARE = 0.02;
    /** Pierdere estimată la plintă (tăieri la colțuri). */
    private static final double WASTE_RATIO_BASEBOARD = 0.05;
    /** Pierdere estimată la vopsea (al 2-lea strat, scurgeri, retușuri). */
    private static final double WASTE_RATIO_PAINT = 0.1;
    /** Pierdere estimată la tapet — medie industrială; modelele cu raport mare de potrivire (half-drop, >26cm) cer 20-25%. */
    private static final double WASTE_RATIO_WALLPAPER = 0.15;
    /** Pierdere estimată la glaful de bordură al ferestrelor (tăieri la colțuri) — la fel ca la plintă. */
    private static final double WASTE_RATIO_WINDOW_TRIM = 0.05;
    /** Pierdere de bază la faianță (montaj drept, ≤1 gol pe pereții placați). */
    private static final double WASTE_RATIO_FAIANTA_BAZA = 0.10;
    /** Pierdere la faianță când sunt >1 goluri (uși+ferestre) pe pereții placați — mai multe tăieturi în jurul golurilor. */
    private static final double WASTE_RATIO_FAIANTA_GOLURI_MULTIPLE = 0.12;
    /** Straturi standard de vopsea pt. pereți interiori — a doua mână e norma, nu excepția. */
    private static final int PAINT_COATS = 2;
    /** Randament mediu de acoperire a vopselei per litru per strat (norma industrială: 10-12 mp/l). */
    private static final double PAINT_COVERAGE_SQM_PER_LITER = 11.0;
    /** Lungimea standard a unei bare de plintă/glaf pe piața RO — pt. cantitatea „câte bare trebuie cumpărate". */
    private static final double BASEBOARD_BAR_LENGTH_M = 2.0;

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

    /** Suma celor 4 lungimi de perete introduse la faianță/finisaj, dacă TOATE sunt completate (>0); altfel 0. */
    private static double perimeterFromWallLengths(Room room) {
        Map<Wall, Double> lengths = room.wallTiling() != null ? room.wallTiling().wallLengths()
                : room.wallFinish() != null ? room.wallFinish().wallLengths() : null;
        if (lengths == null) return 0;
        double sum = 0;
        for (Wall wall : WALL_ORDER) {
            Double length = lengths.get(wall);
            if (length == null || length <= 0) return 0;
            sum += length;
        }
        return sum;
    }

    /**
     * Perimetrul camerei — explicit dacă a fost completat; altfel suma celor 4 lungimi de perete deja
     * introduse la faianță/finisaj (dacă toate 4 sunt completate — cameră dreptunghiulară/neregulată
     * reală, mai precisă decât presupunerea de cameră pătrată); altfel derivat din suprafață presupunând
     * camera pătrată (4×√mp). Așa plinta se calculează direct din datele introduse, fără câmp separat
     * de perimetru — port 1:1 din dimensions.ts (CALC-3, docs/tickete-audit-calcule-securitate.md).
     */
    public static double roomPerimeter(Room room) {
        if (room.perimeter() != null) return room.perimeter();
        double fromWalls = perimeterFromWallLengths(room);
        if (fromWalls > 0) return fromWalls;
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
     * Pierderea de material aplicată pardoselii (și faianței la montaj — vezi {@link #wallTilingArea}),
     * calibrată pe tipul de montaj + mărimea plăcilor (CALC-1/CALC-2): montaj drept 10%, diagonal 15%,
     * herringbone/chevron 18% (fiecare bucată tăiată la ambele capete, rând de start sacrificat); +2%
     * supliment pt. plăci mari/foarte mari (mai puține tăieturi, dar fiecare irosește mai multă suprafață).
     * Fără {@code installationType} completat → 10% (alegerea sigură, echivalentă cu comportamentul vechi).
     */
    public static double floorWasteRatio(Room room) {
        double base = switch (room.installationType() == null ? InstallationType.DREPT : room.installationType()) {
            case DREPT -> WASTE_RATIO_DREPT;
            case DIAGONAL -> WASTE_RATIO_DIAGONAL;
            case HERRINGBONE -> WASTE_RATIO_HERRINGBONE;
        };
        boolean placiMari = room.tileSize() == TileSize.MARE || room.tileSize() == TileSize.FOARTE_MARE;
        return placiMari ? base + WASTE_SUPPLEMENT_TILE_MARE : base;
    }

    /**
     * Necesar de material pentru pardoseală, cu pierdere de tăiere inclusă (calibrată pe montaj + mărime
     * plăci — {@link #floorWasteRatio}). La Gresie include și suprafața de plintă tăiată din plăci
     * ({@link #baseboardTileArea}) — vezi comentariul funcției de mai sus.
     */
    public static double floorMaterialNeeded(Room room) {
        if (!hasFloorConfig(room)) return 0;
        double floor = room.floorArea() * (1 + floorWasteRatio(room));
        return floor + baseboardTileArea(room);
    }

    /** Numărul de bare de plintă/glaf (lungime standard {@link #BASEBOARD_BAR_LENGTH_M}) necesare pt. o lungime dată, în ml. */
    public static int barsNeeded(double lengthMeters) {
        if (lengthMeters <= 0) return 0;
        return (int) Math.ceil(lengthMeters / BASEBOARD_BAR_LENGTH_M);
    }

    /**
     * Cantitatea de vopsea recomandată, în litri, pt. {@link #wallFinishArea} de tip VOPSEA — {@value #PAINT_COATS}
     * straturi (norma pt. interior), randament {@value #PAINT_COVERAGE_SQM_PER_LITER} mp/litru/strat.
     * Rotunjit în sus la 0.5 litri (CALC-4) — aria în mp, singură, nu e direct utilizabilă la cumpărare.
     */
    public static double paintLiters(double paintAreaSqm) {
        if (paintAreaSqm <= 0) return 0;
        double liters = paintAreaSqm * PAINT_COATS / PAINT_COVERAGE_SQM_PER_LITER;
        return Math.ceil(liters * 2) / 2.0;
    }

    /** Pereții efectiv placați cu faianță, în ordinea N, E, S, V, limitați la {@code tiledWallsCount}. */
    private static List<Wall> tiledWalls(Room room) {
        WallTiling tiling = room.wallTiling();
        if (tiling == null) return List.of();
        return WALL_ORDER.subList(0, Math.min(tiling.tiledWallsCount(), WALL_ORDER.size()));
    }

    /** Câte goluri (uși+ferestre, fiecare contând separat) sunt pe pereții placați cu faianță — pt. pierderea CALC-7. */
    private static long openingsCount(Room room, List<Wall> walls) {
        long count = 0;
        for (Wall wall : walls) {
            if (room.doors().get(wall) != null) count++;
            if (room.windows().get(wall) != null) count++;
        }
        return count;
    }

    /**
     * Pierderea aplicată faianței — 10% la montaj simplu (≤1 gol pe pereții placați), 12% quando sunt
     * >1 goluri (fiecare gol suplimentar adaugă tăieturi în jurul lui care nu se refolosesc — CALC-7).
     */
    private static double faiantaWasteRatio(Room room, List<Wall> walls) {
        return openingsCount(room, walls) > 1 ? WASTE_RATIO_FAIANTA_GOLURI_MULTIPLE : WASTE_RATIO_FAIANTA_BAZA;
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
        return Math.max(0, grossArea - openings) * (1 + faiantaWasteRatio(room, walls));
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
