import { Wall } from "./Wall";

/**
 * Configurare detaliată de placare a pereților (faianță), pentru camerele cu zonă umedă.
 * `tiledWallsCount` = câți din cei 4 pereți sunt placați, în ordinea N, E, S, V din `wallLengths`.
 */
export interface WallTiling {
  tiledWallsCount: number;
  tileHeight: number;
  wallLengths: Record<Wall, number>;
}
