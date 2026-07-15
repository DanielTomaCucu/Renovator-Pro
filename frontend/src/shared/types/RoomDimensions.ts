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
}
