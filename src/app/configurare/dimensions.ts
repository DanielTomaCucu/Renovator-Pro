import { Room, Wall } from "@/shared/types";

/** Pierdere estimată la tăiere/așezare — aplicată la pardoseală și la faianță. */
const WASTE_RATIO_MATERIAL = 0.1;
/** Pierdere estimată la plintă (tăieri la colțuri). */
const WASTE_RATIO_BASEBOARD = 0.05;

const wallOrder: Wall[] = [Wall.Nord, Wall.Est, Wall.Sud, Wall.Vest];

/** O cameră are pardoseala configurată dacă are material și suprafață completate. */
export function hasFloorConfig(room: Room): boolean {
  return !!room.floorMaterial && !!room.floorArea && room.floorArea > 0;
}

/** Necesar de material pentru pardoseală, cu pierdere de tăiere inclusă. */
export function floorMaterialNeeded(room: Room): number {
  if (!hasFloorConfig(room)) return 0;
  return room.floorArea! * (1 + WASTE_RATIO_MATERIAL);
}

/** Lungimea de plintă necesară — perimetrul camerei minus golul ușii, cu pierdere de tăiere. */
export function baseboardLength(room: Room): number {
  if (!room.perimeter) return 0;
  const doorWidth = room.door?.width ?? 0;
  return Math.max(0, room.perimeter - doorWidth) * (1 + WASTE_RATIO_BASEBOARD);
}

/** Pereții efectiv placați cu faianță, în ordinea N, E, S, V, limitați la `tiledWallsCount`. */
function tiledWalls(room: Room): Wall[] {
  if (!room.wallTiling) return [];
  return wallOrder.slice(0, room.wallTiling.tiledWallsCount);
}

/** Suprafață de faianță necesară — suma pereților placați × înălțime, minus golul ușii, cu pierdere. */
export function wallTilingArea(room: Room): number {
  const tiling = room.wallTiling;
  if (!tiling) return 0;
  const walls = tiledWalls(room);
  const totalLength = walls.reduce((sum, wall) => sum + (tiling.wallLengths[wall] ?? 0), 0);
  const grossArea = totalLength * tiling.tileHeight;
  const doorOnTiledWall = room.door && walls.includes(room.door.wall);
  const doorArea = doorOnTiledWall ? room.door!.width * room.door!.height : 0;
  return Math.max(0, grossArea - doorArea) * (1 + WASTE_RATIO_MATERIAL);
}

/** Plinta specifică peretelui pe care e amplasată ușa (relevant doar când există placare de pereți). */
export function doorWallBaseboardLength(room: Room): number {
  const tiling = room.wallTiling;
  if (!tiling || !room.door) return 0;
  const wallLength = tiling.wallLengths[room.door.wall] ?? 0;
  return Math.max(0, wallLength - room.door.width) * (1 + WASTE_RATIO_BASEBOARD);
}

/** Sumar tehnic agregat pe tot proiectul — suprafață utilă totală + progres de configurare. */
export function projectTechnicalSummary(rooms: Room[]): {
  totalFloorArea: number;
  configuredRoomsRatio: number;
} {
  const totalFloorArea = rooms.reduce((sum, r) => sum + (r.floorArea ?? 0), 0);
  const configuredCount = rooms.filter(
    (r) => hasFloorConfig(r) && !!r.door && !!r.perimeter
  ).length;
  const configuredRoomsRatio = rooms.length > 0 ? configuredCount / rooms.length : 0;
  return { totalFloorArea, configuredRoomsRatio };
}
