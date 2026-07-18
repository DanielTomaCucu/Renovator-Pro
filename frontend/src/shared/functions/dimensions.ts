import { FlooringType, Room, RoomDimensions, Wall, WallFinishType } from "@/shared/types";

/** Pierdere estimată la tăiere/așezare — aplicată la pardoseală și la faianță. */
const WASTE_RATIO_MATERIAL = 0.1;
/** Pierdere estimată la plintă (tăieri la colțuri). */
const WASTE_RATIO_BASEBOARD = 0.05;
/** Pierdere estimată la vopsea (al 2-lea strat, scurgeri). */
const WASTE_RATIO_PAINT = 0.1;
/** Pierdere estimată la tapet (potrivire model/motiv la îmbinări) — mai mare decât la vopsea. */
const WASTE_RATIO_WALLPAPER = 0.15;
/** Pierdere estimată la glaful de bordură al ferestrelor (tăieri la colțuri) — la fel ca la plintă. */
const WASTE_RATIO_WINDOW_TRIM = 0.05;

const wallOrder: Wall[] = [Wall.Nord, Wall.Est, Wall.Sud, Wall.Vest];

/**
 * Lungimea sugerată a unui perete, dacă am presupune camera pătrată (√suprafață) — folosită doar ca
 * valoare implicită la activarea faianței/finisajului de pereți, ca userul să nu pornească de la 0
 * la fiecare perete. Rămâne complet editabilă după aceea (nu se resincronizează automat).
 */
export function estimatedSquareWallSide(room: Room): number {
  if (!room.floorArea || room.floorArea <= 0) return 0;
  return Math.sqrt(room.floorArea);
}

/** Suma lățimilor tuturor ușilor camerei (indiferent de perete). */
export function totalDoorWidth(room: Room): number {
  if (!room.doors) return 0;
  return Object.values(room.doors).reduce((sum, d) => sum + (d?.width ?? 0), 0);
}

/** Aria ușii de pe un perete dat (0 dacă nu are ușă). */
export function doorArea(room: Room, wall: Wall): number {
  const d = room.doors?.[wall];
  return d ? d.width * d.height : 0;
}

/** Aria ferestrei de pe un perete dat (0 dacă nu are fereastră). */
export function windowArea(room: Room, wall: Wall): number {
  const w = room.windows?.[wall];
  return w ? w.width * w.height : 0;
}

/** Aria golurilor (ușă + fereastră) de pe un perete dat — folosită la scăderea din faianță/vopsea/tapet. */
function openingsArea(room: Room, wall: Wall): number {
  return doorArea(room, wall) + windowArea(room, wall);
}

/**
 * Lungimea totală de glaf/bordură necesară pentru toate ferestrele camerei (perimetrul fiecărei
 * ferestre, 2×(lățime+înălțime)), cu pierdere de tăiere la colțuri — indiferent de tipul de pardoseală.
 */
export function windowTrimLength(room: Room): number {
  if (!room.windows) return 0;
  const totalPerimeter = wallOrder.reduce((sum, wall) => {
    const w = room.windows![wall];
    return sum + (w ? 2 * (w.width + w.height) : 0);
  }, 0);
  return totalPerimeter * (1 + WASTE_RATIO_WINDOW_TRIM);
}

/** O cameră are pardoseala configurată dacă are material și suprafață completate. */
export function hasFloorConfig(room: Room): boolean {
  return !!room.floorMaterial && !!room.floorArea && room.floorArea > 0;
}

/**
 * Perimetrul camerei — explicit dacă a fost completat, altfel derivat din suprafață presupunând
 * camera pătrată (4×√mp). Așa plinta se calculează direct din suprafața introdusă la Pardoseală,
 * fără să ceară userului un câmp separat de perimetru.
 */
export function roomPerimeter(room: Room): number {
  if (room.perimeter) return room.perimeter;
  if (!room.floorArea || room.floorArea <= 0) return 0;
  return 4 * Math.sqrt(room.floorArea);
}

/** Lungimea de plintă necesară — perimetrul camerei minus golurile tuturor ușilor, cu pierdere de tăiere. */
export function baseboardLength(room: Room): number {
  const perimeter = roomPerimeter(room);
  if (!perimeter) return 0;
  return Math.max(0, perimeter - totalDoorWidth(room)) * (1 + WASTE_RATIO_BASEBOARD);
}

/**
 * La Gresie, plinta e tăiată din aceleași plăci — suprafața ei (lungime × înălțime plintă) se adaugă
 * la necesarul total de gresie, nu e un produs separat. La celelalte pardoseli plinta e produs distinct
 * (nu se face din parchet/mochetă), deci funcția întoarce 0.
 */
export function baseboardTileArea(room: Room): number {
  if (room.floorMaterial !== FlooringType.Gresie || !room.baseboardHeight) return 0;
  return baseboardLength(room) * room.baseboardHeight;
}

/**
 * Necesar de material pentru pardoseală, cu pierdere de tăiere inclusă. La Gresie include și
 * suprafața de plintă tăiată din plăci (`baseboardTileArea`) — vezi comentariul funcției de mai sus.
 */
export function floorMaterialNeeded(room: Room): number {
  if (!hasFloorConfig(room)) return 0;
  const floor = room.floorArea! * (1 + WASTE_RATIO_MATERIAL);
  return floor + baseboardTileArea(room);
}

/** Pereții efectiv placați cu faianță, în ordinea N, E, S, V, limitați la `tiledWallsCount`. */
function tiledWalls(room: Room): Wall[] {
  if (!room.wallTiling) return [];
  return wallOrder.slice(0, room.wallTiling.tiledWallsCount);
}

/** Suprafață de faianță necesară — suma pereților placați × înălțime, minus golurile ușilor și ferestrelor, cu pierdere. Doar la Gresie. */
export function wallTilingArea(room: Room): number {
  const tiling = room.wallTiling;
  if (!tiling || room.floorMaterial !== FlooringType.Gresie) return 0;
  const walls = tiledWalls(room);
  const totalLength = walls.reduce((sum, wall) => sum + (tiling.wallLengths[wall] ?? 0), 0);
  const grossArea = totalLength * tiling.tileHeight;
  const openings = walls.reduce((sum, wall) => sum + openingsArea(room, wall), 0);
  return Math.max(0, grossArea - openings) * (1 + WASTE_RATIO_MATERIAL);
}

/** Pereții cu finisajul cerut (`Vopsea` sau `Tapet`), din configurarea `wallFinish` — doar la Parchet/Mochetă. */
function wallsWithFinish(room: Room, type: WallFinishType): Wall[] {
  if (!room.wallFinish || room.floorMaterial === FlooringType.Gresie) return [];
  return wallOrder.filter((w) => room.wallFinish!.finishes[w] === type);
}

/** Suprafață de vopsea/tapet pe pereții cu finisajul respectiv, minus golurile ușilor și ferestrelor, cu pierdere specifică. Doar la Parchet/Mochetă. */
export function wallFinishArea(room: Room, type: WallFinishType): number {
  const finish = room.wallFinish;
  if (!finish) return 0;
  const walls = wallsWithFinish(room, type);
  if (walls.length === 0) return 0;
  const totalLength = walls.reduce((sum, wall) => sum + (finish.wallLengths[wall] ?? 0), 0);
  const grossArea = totalLength * finish.wallHeight;
  const openings = walls.reduce((sum, wall) => sum + openingsArea(room, wall), 0);
  const wasteRatio = type === WallFinishType.Vopsea ? WASTE_RATIO_PAINT : WASTE_RATIO_WALLPAPER;
  return Math.max(0, grossArea - openings) * (1 + wasteRatio);
}

/**
 * Breakdown-ul complet de dimensiuni al unei camere — OGLINDĂ a `RoomDtoMapper.toDimensions` de pe backend
 * (sursa de adevăr). Folosit ca PREVIEW instant la editarea unei camere (pe `draft`, înainte de salvare) și
 * ca fallback când `room.dimensions` de la server lipsește. Aceleași formule ca funcțiile de mai sus.
 */
export function computeRoomDimensions(room: Room): RoomDimensions {
  return {
    hasFloorConfig: hasFloorConfig(room),
    floorMaterialNeeded: floorMaterialNeeded(room),
    baseboardLength: baseboardLength(room),
    baseboardTileArea: baseboardTileArea(room),
    wallTilingArea: wallTilingArea(room),
    paintArea: wallFinishArea(room, WallFinishType.Vopsea),
    wallpaperArea: wallFinishArea(room, WallFinishType.Tapet),
    windowTrimLength: windowTrimLength(room),
    totalDoorWidth: totalDoorWidth(room),
  };
}
