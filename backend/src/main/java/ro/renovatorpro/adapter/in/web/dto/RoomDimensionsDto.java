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
        double totalDoorWidth,
        /** Pierderea reală aplicată pardoselii (0.10/0.15/0.18 +0.02 la plăci mari) — CALC-1/CALC-2. */
        double floorWasteRatio,
        /** Cantitate de vopsea recomandată, în litri (2 straturi, 11 mp/l) — CALC-4. */
        double paintLiters,
        /** Câte bare de plintă (2 ml/bară) trebuie cumpărate — CALC-8. */
        int baseboardBars,
        /** Câte bare de glaf fereastră (2 ml/bară) trebuie cumpărate — CALC-8. */
        int windowTrimBars,
        /** mp, cu pierdere — A.1. */
        double ceilingPaintArea,
        /** mp, cu pierdere — A.2. */
        double paintAboveTilingArea,
        /** litri amorsă zugrăveală, rotunjit în sus la 1 l — B.4. */
        double paintPrimerLiters,
        /** litri amorsă sub placări, rotunjit în sus la 1 l — B.5. */
        double tilingPrimerLiters,
        /** kg adeziv pardoseală — C.6. */
        double floorAdhesiveKg,
        /** kg adeziv faianță — C.7. */
        double wallAdhesiveKg,
        /** saci 25 kg, ceil — C.8. */
        int adhesiveBags,
        /** kg chit rosturi, ceil — C.9. */
        double groutKg,
        /** mp folie parchet, ceil — D.10. */
        double underlayArea
) {
}
