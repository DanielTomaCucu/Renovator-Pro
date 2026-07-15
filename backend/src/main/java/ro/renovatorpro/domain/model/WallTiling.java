package ro.renovatorpro.domain.model;

import java.util.Map;

/**
 * Configurare de placare faianță pe pereți (camere cu zonă umedă, pardoseală Gresie).
 * `tiledWallsCount` = câți din cei 4 pereți sunt placați, în ordinea N, E, S, V din `wallLengths`.
 */
public record WallTiling(int tiledWallsCount, double tileHeight, Map<Wall, Double> wallLengths) {

    public WallTiling {
        wallLengths = wallLengths == null ? Map.of() : Map.copyOf(wallLengths);
    }
}
