package ro.renovatorpro.adapter.in.web.dto;

import java.util.Map;

/**
 * {@code wallLengths}: cheie = Wall.label() ("N"/"E"/"S"/"V"), nu numele enum-ului Java.
 * {@code tileSize}: label {@link ro.renovatorpro.domain.model.TileSize} ("Mică"/"Medie"/...), absent → Medie.
 */
public record WallTilingDto(Integer tiledWallsCount, Double tileHeight, Map<String, Double> wallLengths,
                             Double roomHeight, String tileSize) {
}
