package ro.renovatorpro.adapter.in.web.dto;

/**
 * Breakdown-ul de necesar de material al unei camere, calculat SERVER-SIDE (sursa de adevăr) din
 * {@code RoomDimensionsCalculator} — expus pe fiecare {@link RoomResponse} (Problema 2 din audit).
 * Frontend-ul păstrează un calcul client identic DOAR ca preview instant la editare; valorile salvate,
 * autoritative, sunt acestea. Toate în mp/ml (nu sume de bani). Oglinda TS: {@code RoomDimensions.ts}.
 */
public record RoomDimensionsDto(
        boolean hasFloorConfig,
        double floorMaterialNeeded,
        double baseboardLength,
        double baseboardTileArea,
        double wallTilingArea,
        double paintArea,
        double wallpaperArea,
        double windowTrimLength,
        double totalDoorWidth
) {
}
