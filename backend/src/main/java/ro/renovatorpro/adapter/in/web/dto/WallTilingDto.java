package ro.renovatorpro.adapter.in.web.dto;

import java.util.Map;

/** {@code wallLengths}: cheie = Wall.label() ("N"/"E"/"S"/"V"), nu numele enum-ului Java. */
public record WallTilingDto(Integer tiledWallsCount, Double tileHeight, Map<String, Double> wallLengths) {
}
