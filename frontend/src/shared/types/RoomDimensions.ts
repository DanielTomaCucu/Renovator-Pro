/**
 * Necesarul de material al unei camere, calculat SERVER-SIDE (sursa de adevăr) — expus pe fiecare `Room`
 * din răspunsul API (`RoomResponse.dimensions`). Oglinda 1:1 a `RoomDimensionsDto` din backend.
 *
 * Frontend-ul păstrează un calcul client identic (`shared/functions/dimensions.ts`) DOAR ca preview instant
 * la editarea unei camere (înainte de salvare); valorile salvate, autoritative, sunt acestea. Toate în mp/ml.
 */
export interface RoomDimensions {
  hasFloorConfig: boolean;
  floorMaterialNeeded: number;
  baseboardLength: number;
  baseboardTileArea: number;
  wallTilingArea: number;
  paintArea: number;
  wallpaperArea: number;
  windowTrimLength: number;
  totalDoorWidth: number;
  /** Pierderea reală aplicată pardoselii (0.10/0.15/0.18 + 0.02 la plăci mari) — CALC-1/CALC-2. */
  floorWasteRatio: number;
  /** Cantitate de vopsea recomandată, în litri (2 straturi, 11 mp/l) — CALC-4. */
  paintLiters: number;
  /** Câte bare de plintă (2 ml/bară) trebuie cumpărate — CALC-8. */
  baseboardBars: number;
  /** Câte bare de glaf fereastră (2 ml/bară) trebuie cumpărate — CALC-8. */
  windowTrimBars: number;
  /** mp, cu pierdere — A.1. */
  ceilingPaintArea: number;
  /** mp, cu pierdere — A.2. */
  paintAboveTilingArea: number;
  /** litri amorsă zugrăveală, rotunjit ↑ la 1 l — B.4. */
  paintPrimerLiters: number;
  /** litri amorsă sub placări, rotunjit ↑ la 1 l — B.5. */
  tilingPrimerLiters: number;
  /** kg adeziv pardoseală — C.6. */
  floorAdhesiveKg: number;
  /** kg adeziv faianță — C.7. */
  wallAdhesiveKg: number;
  /** saci 25 kg, ceil — C.8. */
  adhesiveBags: number;
  /** kg chit rosturi, ceil — C.9. */
  groutKg: number;
  /** mp folie parchet, ceil — D.10. */
  underlayArea: number;
}
