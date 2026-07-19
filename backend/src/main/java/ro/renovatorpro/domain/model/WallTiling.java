package ro.renovatorpro.domain.model;

import java.util.Map;

/**
 * Configurare de placare faianță pe pereți (camere cu zonă umedă, pardoseală Gresie).
 * `tiledWallsCount` = câți din cei 4 pereți sunt placați, în ordinea N, E, S, V din `wallLengths`.
 * `roomHeight` = înălțimea totală a camerei (pardoseală→tavan), pt. vopseaua de deasupra faianței —
 * trebuie {@code > tileHeight}, absentă dacă zugrăveala deasupra faianței nu e configurată.
 * `tileSize` = mărimea plăcilor de faianță, pt. consumul de adeziv/chit al pereților — absentă → Medie.
 */
public record WallTiling(int tiledWallsCount, double tileHeight, Map<Wall, Double> wallLengths,
                          Double roomHeight, TileSize tileSize) {

    public WallTiling {
        wallLengths = wallLengths == null ? Map.of() : Map.copyOf(wallLengths);
    }

    /** Constructor de compatibilitate — fără roomHeight/tileSize (zugrăveală deasupra faianței neconfigurată). */
    public WallTiling(int tiledWallsCount, double tileHeight, Map<Wall, Double> wallLengths) {
        this(tiledWallsCount, tileHeight, wallLengths, null, null);
    }
}
