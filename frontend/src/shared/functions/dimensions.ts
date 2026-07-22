import { FlooringType, InstallationType, Room, RoomDimensions, TileSize, Wall, WallFinishType } from "@/shared/types";

/**
 * Procentele de pierdere sunt calibrate pe norme reale de șantier (surse în
 * `docs/tickete-audit-calcule-securitate.md` — CALC-1…CALC-8), nu valori arbitrare.
 */
/** Pierdere de bază la montaj drept (pardoseală/faianță) — norma industrială pt. montaj simplu. */
const WASTE_RATIO_DREPT = 0.1;
/** Pierdere la montaj diagonal — tăieturi în unghi la fiecare margine, mai mult rebut. */
const WASTE_RATIO_DIAGONAL = 0.15;
/** Pierdere la montaj herringbone/chevron — fiecare bucată tăiată la ambele capete, rând de start sacrificat. */
const WASTE_RATIO_HERRINGBONE = 0.18;
/** Supliment de pierdere pt. plăci mari/foarte mari (600mm+) — mai puține tăieturi, dar fiecare irosește mai mult. */
const WASTE_SUPPLEMENT_TILE_MARE = 0.02;
/** Pierdere estimată la plintă (tăieri la colțuri). */
const WASTE_RATIO_BASEBOARD = 0.05;
/** Pierdere estimată la vopsea (al 2-lea strat, scurgeri, retușuri). */
const WASTE_RATIO_PAINT = 0.1;
/** Pierdere estimată la tapet — medie industrială; modelele cu raport mare de potrivire (half-drop, >26cm) cer 20-25%. */
const WASTE_RATIO_WALLPAPER = 0.15;
/** Pierdere estimată la glaful de bordură al ferestrelor (tăieri la colțuri) — la fel ca la plintă. */
const WASTE_RATIO_WINDOW_TRIM = 0.05;
/** Pierdere de bază la faianță (montaj drept, ≤1 gol pe pereții placați). */
const WASTE_RATIO_FAIANTA_BAZA = 0.1;
/** Pierdere la faianță când sunt >1 goluri (uși+ferestre) pe pereții placați — mai multe tăieturi în jurul golurilor. */
const WASTE_RATIO_FAIANTA_GOLURI_MULTIPLE = 0.12;
/** Straturi standard de vopsea pt. pereți interiori — a doua mână e norma, nu excepția. */
const PAINT_COATS = 2;
/** Randament mediu de acoperire a vopselei per litru per strat (norma industrială: 10-12 mp/l). */
const PAINT_COVERAGE_SQM_PER_LITER = 11;
/** Lungimea standard a unei bare de plintă/glaf pe piața RO — pt. cantitatea „câte bare trebuie cumpărate". */
const BASEBOARD_BAR_LENGTH_M = 2;
/** Pierdere estimată la zugrăveala tavanului — aceeași normă ca la pereți. */
const WASTE_RATIO_CEILING = 0.1;
/** Consum amorsă sub zugrăveală (perete/tavan gletuit), 1 strat — sursă: fișe tehnice, 0.05-0.20 l/mp/strat. */
const PRIMER_PAINT_L_PER_SQM = 0.1;
/** Consum amorsă sub adezivul de plăci (șapă/perete absorbant), 1 strat — șapa e mai absorbantă decât gletul. */
const PRIMER_TILING_L_PER_SQM = 0.15;
/** Marjă de siguranță la cumpărarea adezivului de plăci (denivelări de suport). */
const ADHESIVE_SAFETY_RATIO = 0.1;
/** Greutatea unui sac de adeziv cimentos (RO, standard). */
const ADHESIVE_BAG_KG = 25;
/** Marjă de siguranță la cumpărarea chitului de rosturi. */
const GROUT_SAFETY_RATIO = 0.1;
/** Suprapuneri la îmbinări + margini ridicate pe perete pt. folia de sub parchet. */
const UNDERLAY_OVERLAP_RATIO = 0.05;

/**
 * Consum adeziv de plăci (kg/mp) după mărimea plăcii — mărimea dintelui gletierei; la plăci ≥60cm
 * include dubla încleiere (back-buttering, +20-30%) — surse: iTiles/Unimat/Rechenportal/GoTiles.
 */
const ADHESIVE_KG_PER_SQM: Record<TileSize, number> = {
  [TileSize.Mica]: 2.5,
  [TileSize.Medie]: 3.5,
  [TileSize.Mare]: 5.5,
  [TileSize.FoarteMare]: 7.0,
};

/**
 * Consum chit de rosturi (kg/mp) precalculat per `TileSize`, din formula standard de industrie
 * `kg/mp = ((A+B)/(A×B)) × E × R × 1.6` (A,B = laturi placă mm, E = grosime mm, R = rost mm,
 * 1.6 = densitate chit cimentos kg/dm³ — surse Ceresit/Weber/iTiles), cu dimensiuni REPREZENTATIVE:
 * Mică 150×150×7mm rost 3mm, Medie 330×330×8mm rost 3mm, Mare 600×600×9mm rost 2mm,
 * FoarteMare 1200×600×10mm rost 2mm.
 */
const GROUT_KG_PER_SQM: Record<TileSize, number> = {
  [TileSize.Mica]: 0.45,
  [TileSize.Medie]: 0.24,
  [TileSize.Mare]: 0.1,
  [TileSize.FoarteMare]: 0.08,
};

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

/** Suma celor 4 lungimi de perete introduse la faianță/finisaj, dacă TOATE sunt completate (>0); altfel 0. */
function perimeterFromWallLengths(room: Room): number {
  const lengths = room.wallTiling?.wallLengths ?? room.wallFinish?.wallLengths;
  if (!lengths) return 0;
  let sum = 0;
  for (const wall of wallOrder) {
    const length = lengths[wall];
    if (!length || length <= 0) return 0;
    sum += length;
  }
  return sum;
}

/**
 * Perimetrul camerei — explicit dacă a fost completat; altfel suma celor 4 lungimi de perete deja
 * introduse la faianță/finisaj (dacă toate 4 sunt completate — cameră dreptunghiulară/neregulată
 * reală, mai precisă decât presupunerea de cameră pătrată); altfel derivat din suprafață presupunând
 * camera pătrată (4×√mp). Așa plinta se calculează direct din datele introduse, fără câmp separat
 * de perimetru (CALC-3, docs/tickete-audit-calcule-securitate.md).
 */
export function roomPerimeter(room: Room): number {
  if (room.perimeter) return room.perimeter;
  const fromWalls = perimeterFromWallLengths(room);
  if (fromWalls > 0) return fromWalls;
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
 * Pierderea de material aplicată pardoselii (și faianței la montaj — vezi `wallTilingArea`), calibrată
 * pe tipul de montaj + mărimea plăcilor (CALC-1/CALC-2): montaj drept 10%, diagonal 15%, herringbone/
 * chevron 18% (fiecare bucată tăiată la ambele capete, rând de start sacrificat); +2% supliment pt.
 * plăci mari/foarte mari (mai puține tăieturi, dar fiecare irosește mai multă suprafață). Fără
 * `installationType` completat → 10% (alegerea sigură, echivalentă cu comportamentul vechi).
 */
export function floorWasteRatio(room: Room): number {
  const base =
    room.installationType === InstallationType.Diagonal
      ? WASTE_RATIO_DIAGONAL
      : room.installationType === InstallationType.Herringbone
        ? WASTE_RATIO_HERRINGBONE
        : WASTE_RATIO_DREPT;
  const placiMari = room.tileSize === TileSize.Mare || room.tileSize === TileSize.FoarteMare;
  return placiMari ? base + WASTE_SUPPLEMENT_TILE_MARE : base;
}

/**
 * Necesar de material pentru pardoseală, cu pierdere de tăiere inclusă (calibrată pe montaj + mărime
 * plăci — `floorWasteRatio`). La Gresie include și suprafața de plintă tăiată din plăci
 * (`baseboardTileArea`) — vezi comentariul funcției de mai sus.
 */
export function floorMaterialNeeded(room: Room): number {
  if (!hasFloorConfig(room)) return 0;
  const floor = room.floorArea! * (1 + floorWasteRatio(room));
  return floor + baseboardTileArea(room);
}

/** Numărul de bare de plintă/glaf (lungime standard `BASEBOARD_BAR_LENGTH_M`) necesare pt. o lungime dată, în ml. */
export function barsNeeded(lengthMeters: number): number {
  if (lengthMeters <= 0) return 0;
  return Math.ceil(lengthMeters / BASEBOARD_BAR_LENGTH_M);
}

/**
 * Cantitatea de vopsea recomandată, în litri, pt. `wallFinishArea` de tip Vopsea — `PAINT_COATS`
 * straturi (norma pt. interior), randament `PAINT_COVERAGE_SQM_PER_LITER` mp/litru/strat. Rotunjit în
 * sus la 0.5 litri (CALC-4) — aria în mp, singură, nu e direct utilizabilă la cumpărare.
 */
export function paintLiters(paintAreaSqm: number): number {
  if (paintAreaSqm <= 0) return 0;
  const liters = (paintAreaSqm * PAINT_COATS) / PAINT_COVERAGE_SQM_PER_LITER;
  return Math.ceil(liters * 2) / 2;
}

/** Pereții efectiv placați cu faianță, în ordinea N, E, S, V, limitați la `tiledWallsCount`. */
function tiledWalls(room: Room): Wall[] {
  if (!room.wallTiling) return [];
  return wallOrder.slice(0, room.wallTiling.tiledWallsCount);
}

/** Câte goluri (uși+ferestre, fiecare contând separat) sunt pe pereții placați cu faianță — pt. pierderea CALC-7. */
function openingsCount(room: Room, walls: Wall[]): number {
  let count = 0;
  for (const wall of walls) {
    if (room.doors?.[wall]) count++;
    if (room.windows?.[wall]) count++;
  }
  return count;
}

/**
 * Pierderea aplicată faianței — 10% la montaj simplu (≤1 gol pe pereții placați), 12% când sunt >1
 * goluri (fiecare gol suplimentar adaugă tăieturi în jurul lui care nu se refolosesc — CALC-7).
 */
function faiantaWasteRatio(room: Room, walls: Wall[]): number {
  return openingsCount(room, walls) > 1 ? WASTE_RATIO_FAIANTA_GOLURI_MULTIPLE : WASTE_RATIO_FAIANTA_BAZA;
}

/** Pierderea aplicată faianței camerei — 10% sau 12% (CALC-7) — expusă pt. afișare în panoul „Calcule Detaliate". */
export function wallTilingWasteRatio(room: Room): number {
  return faiantaWasteRatio(room, tiledWalls(room));
}

/**
 * Suprafață NETĂ de faianță (fără pierderea de tăiere) — pereții placați × înălțime, minus golurile
 * ușilor și ferestrelor. Expusă separat de `wallTilingArea` pt. că amorsa/adezivul/chitul acoperă
 * suprafața reală, nu plăcile tăiate (B.5, C.6, C.9 din docs/cerinte-zugraveli.md) — nu se derivă prin
 * împărțire înapoi din valoarea cu pierdere.
 */
export function netWallTilingArea(room: Room): number {
  const tiling = room.wallTiling;
  if (!tiling || room.floorMaterial !== FlooringType.Gresie) return 0;
  const walls = tiledWalls(room);
  const totalLength = walls.reduce((sum, wall) => sum + (tiling.wallLengths[wall] ?? 0), 0);
  const grossArea = totalLength * tiling.tileHeight;
  const openings = walls.reduce((sum, wall) => sum + openingsArea(room, wall), 0);
  return Math.max(0, grossArea - openings);
}

/** Suprafață de faianță necesară — suma pereților placați × înălțime, minus golurile ușilor și ferestrelor, cu pierdere. Doar la Gresie. */
export function wallTilingArea(room: Room): number {
  const tiling = room.wallTiling;
  if (!tiling || room.floorMaterial !== FlooringType.Gresie) return 0;
  return netWallTilingArea(room) * (1 + faiantaWasteRatio(room, tiledWalls(room)));
}

/** Suprafață NETĂ de pardoseală — doar la Gresie (amorsa/adezivul/chitul de pardoseală, fără pierderea de tăiere). */
export function netFloorTilingArea(room: Room): number {
  if (room.floorMaterial !== FlooringType.Gresie || !room.floorArea) return 0;
  return room.floorArea;
}

/**
 * Aria zugrăvirii tavanului — `floorArea × 1.10`, activată explicit, disponibilă la ORICE pardoseală
 * (A.1 din docs/cerinte-zugraveli.md).
 */
export function ceilingPaintArea(room: Room): number {
  if (!room.ceilingPaint || !room.floorArea || room.floorArea <= 0) return 0;
  return room.floorArea * (1 + WASTE_RATIO_CEILING);
}

/**
 * Aria vopselei de deasupra faianței — doar la Gresie, când `wallTiling.roomHeight > tileHeight` (A.2).
 * Pereții PLACAȚI nu scad golurile (asumpție: ușile/ferestrele stau în zona placată); pereții NEPLACAȚI
 * cu lungime completată scad golurile, ca la vopseaua obișnuită.
 */
export function paintAboveTilingArea(room: Room): number {
  const tiling = room.wallTiling;
  if (!tiling || room.floorMaterial !== FlooringType.Gresie) return 0;
  if (!tiling.roomHeight || tiling.roomHeight <= tiling.tileHeight) return 0;
  const extraHeight = tiling.roomHeight - tiling.tileHeight;
  const tiled = tiledWalls(room);

  const tiledWallsArea = tiled.reduce((sum, wall) => sum + (tiling.wallLengths[wall] ?? 0) * extraHeight, 0);

  const untiledWallsArea = wallOrder
    .filter((w) => !tiled.includes(w))
    .reduce((sum, wall) => {
      const length = tiling.wallLengths[wall] ?? 0;
      if (length <= 0) return sum;
      return sum + Math.max(0, length * tiling.roomHeight! - openingsArea(room, wall));
    }, 0);

  return (tiledWallsArea + untiledWallsArea) * (1 + WASTE_RATIO_PAINT);
}

/**
 * Necesar de amorsă sub zugrăveală, în litri, rotunjit în sus la litru întreg (se vinde la 1/4/10 l) —
 * B.4. Se aplică pe toate ariile de vopsit/tapetat (tapetul cere aceeași pregătire a suportului).
 */
export function paintPrimerLiters(room: Room): number {
  const area =
    wallFinishArea(room, WallFinishType.Vopsea) +
    wallFinishArea(room, WallFinishType.Tapet) +
    ceilingPaintArea(room) +
    paintAboveTilingArea(room);
  if (area <= 0) return 0;
  return Math.ceil(area * PRIMER_PAINT_L_PER_SQM);
}

/**
 * Necesar de amorsă sub adezivul de plăci (pardoseală + faianță), în litri, rotunjit în sus la litru
 * întreg — B.5. Arii NETE (fără pierderea de tăiere) — amorsa acoperă suprafața reală.
 */
export function tilingPrimerLiters(room: Room): number {
  const area = netFloorTilingArea(room) + netWallTilingArea(room);
  if (area <= 0) return 0;
  return Math.ceil(area * PRIMER_TILING_L_PER_SQM);
}

function adhesiveKgPerSqm(size?: TileSize): number {
  return ADHESIVE_KG_PER_SQM[size ?? TileSize.Medie];
}

/** Consum chit de rosturi (kg/mp) după mărimea plăcii — expus (nu doar intern) pt. afișarea calculului real în „Calcule Detaliate". */
export function groutKgPerSqm(size?: TileSize): number {
  return GROUT_KG_PER_SQM[size ?? TileSize.Medie];
}

/** Necesar de adeziv pentru pardoseala de gresie, în kg — C.6. Aria NETĂ (plinta lipită intră în marja de 10%). */
export function floorAdhesiveKg(room: Room): number {
  const area = netFloorTilingArea(room);
  if (area <= 0) return 0;
  return area * adhesiveKgPerSqm(room.tileSize) * (1 + ADHESIVE_SAFETY_RATIO);
}

/** Necesar de adeziv pentru faianță, în kg — C.7. */
export function wallAdhesiveKg(room: Room): number {
  const area = netWallTilingArea(room);
  if (area <= 0) return 0;
  return area * adhesiveKgPerSqm(room.wallTiling?.tileSize) * (1 + ADHESIVE_SAFETY_RATIO);
}

/** Saci de 25kg de adeziv (pardoseală + faianță sunt același produs cimentos) — C.8. */
export function adhesiveBags(room: Room): number {
  const totalKg = floorAdhesiveKg(room) + wallAdhesiveKg(room);
  if (totalKg <= 0) return 0;
  return Math.ceil(totalKg / ADHESIVE_BAG_KG);
}

/** Necesar de chit de rosturi (pardoseală + faianță), în kg, rotunjit în sus la kg întreg — C.9. */
export function groutKg(room: Room): number {
  const floorKg = netFloorTilingArea(room) * groutKgPerSqm(room.tileSize);
  const wallKg = netWallTilingArea(room) * groutKgPerSqm(room.wallTiling?.tileSize);
  const total = (floorKg + wallKg) * (1 + GROUT_SAFETY_RATIO);
  if (total <= 0) return 0;
  return Math.ceil(total);
}

/**
 * Aria de folie sub parchetul laminat, în mp, rotunjit în sus la mp întreg (se vinde la rolă, pe mp) —
 * D.10. 0 dacă pardoseala nu e Parchet Laminat (la Mochetă nu se generează — în afara scopului).
 */
export function underlayArea(room: Room): number {
  if (room.floorMaterial !== FlooringType.ParchetLaminat || !room.floorArea || room.floorArea <= 0) return 0;
  return Math.ceil(room.floorArea * (1 + UNDERLAY_OVERLAP_RATIO));
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
  const baseboard = baseboardLength(room);
  const windowTrim = windowTrimLength(room);
  const paintArea = wallFinishArea(room, WallFinishType.Vopsea);
  const ceilingArea = ceilingPaintArea(room);
  const aboveTilingArea = paintAboveTilingArea(room);
  return {
    hasFloorConfig: hasFloorConfig(room),
    floorMaterialNeeded: floorMaterialNeeded(room),
    baseboardLength: baseboard,
    baseboardTileArea: baseboardTileArea(room),
    wallTilingArea: wallTilingArea(room),
    paintArea,
    wallpaperArea: wallFinishArea(room, WallFinishType.Tapet),
    windowTrimLength: windowTrim,
    totalDoorWidth: totalDoorWidth(room),
    floorWasteRatio: floorWasteRatio(room),
    paintLiters: paintLiters(paintArea + ceilingArea + aboveTilingArea),
    baseboardBars: barsNeeded(baseboard),
    windowTrimBars: barsNeeded(windowTrim),
    ceilingPaintArea: ceilingArea,
    paintAboveTilingArea: aboveTilingArea,
    paintPrimerLiters: paintPrimerLiters(room),
    tilingPrimerLiters: tilingPrimerLiters(room),
    floorAdhesiveKg: floorAdhesiveKg(room),
    wallAdhesiveKg: wallAdhesiveKg(room),
    adhesiveBags: adhesiveBags(room),
    groutKg: groutKg(room),
    underlayArea: underlayArea(room),
  };
}
