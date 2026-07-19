import { Wall } from "./Wall";
import { TileSize } from "./TileSize";

/**
 * Configurare detaliată de placare a pereților (faianță), pentru camerele cu zonă umedă.
 * `tiledWallsCount` = câți din cei 4 pereți sunt placați, în ordinea N, E, S, V din `wallLengths`.
 */
export interface WallTiling {
  tiledWallsCount: number;
  tileHeight: number;
  wallLengths: Record<Wall, number>;
  /** Înălțimea totală a camerei (m), pardoseală→tavan — pt. vopseaua de deasupra faianței. Trebuie > tileHeight, ≤ 6. */
  roomHeight?: number;
  /** Mărimea plăcilor de faianță — pt. consumul de adeziv/chit al pereților. Absent → se calculează ca Medie. */
  tileSize?: TileSize;
}
