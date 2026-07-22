import { FlooringType, Room, RoomDimensions, Wall } from "@/shared/types";
import {
  groutKgPerSqm,
  netFloorTilingArea,
  netWallTilingArea,
  roomPerimeter,
  wallTilingWasteRatio,
} from "@/shared/functions/dimensions";

/** Formatează un număr cu 2 zecimale, ca la celelalte formule din panou. */
const mp = (value: number) => value.toFixed(2);

export type RoomCalcRow = { label: string; value: string; formula: string; math: string; note?: string };

/** Formatează un factor (0.15) ca procent întreg pt. afișare în formule ("15%"). */
const pct = (ratio: number) => `${Math.round(ratio * 100)}%`;

/**
 * `true` dacă perimetrul afișat la Plintă e o ESTIMARE (cameră presupusă pătrată, 4×√mp) — userul n-a
 * completat nici perimetrul explicit, nici toate cele 4 lungimi de perete (`roomPerimeter` din
 * `shared/functions/dimensions.ts`, aceeași prioritate). Pur informativ pt. panoul „Calcule Detaliate" —
 * nu schimbă calculul, doar avertizează că plinta poate fi subestimată la camere alungite/neregulate.
 */
function isPerimeterEstimated(room: Room): boolean {
  if (room.perimeter) return false;
  const lengths = room.wallTiling?.wallLengths ?? room.wallFinish?.wallLengths;
  if (!lengths) return true;
  return !Object.values(Wall).every((w) => (lengths[w] ?? 0) > 0);
}

/**
 * Rândurile din panoul „Calcule Detaliate" al unui card de cameră — extrase într-o funcție pură ca să
 * poată fi refolosite identic în PDF-ul exportat (`ApartmentPdfDocument.tsx`), nu doar în UI
 * (`RoomTechnicalCard.tsx`). Aceleași formule, exact același text.
 *
 * `dims` = breakdown-ul numeric (necesarul de material). SURSA DE ADEVĂR e backend-ul: se pasează
 * `room.dimensions` (valorile salvate) pentru camerele venite din API, sau `computeRoomDimensions(draft)`
 * ca preview instant la editare (Problema 2 din audit — nu recalculăm aici regulile de business).
 *
 * Procentele afișate NU mai sunt hardcodate — vin din `dims`/`wallTilingWasteRatio(room)`, calibrate pe
 * norme reale de șantier (montaj, mărime plăci, goluri) — vezi `docs/tickete-audit-calcule-securitate.md`.
 */
export function buildRoomCalcRows(room: Room, dims: RoomDimensions): RoomCalcRow[] {
  const isGresie = room.floorMaterial === FlooringType.Gresie;
  const isMocheta = room.floorMaterial === FlooringType.Mocheta;
  const baseboard = dims.baseboardLength;
  const baseboardTiles = dims.baseboardTileArea;
  const materialNeeded = dims.floorMaterialNeeded;
  const floorWaste = dims.floorWasteRatio;
  const tilingArea = dims.wallTilingArea;
  const tilingWaste = wallTilingWasteRatio(room);
  const paintArea = dims.paintArea;
  const wallpaperArea = dims.wallpaperArea;

  const rows: RoomCalcRow[] = [];

  if (dims.hasFloorConfig) {
    rows.push({
      label: `${room.floorMaterial} (Pardoseală${baseboardTiles > 0 ? " + Plintă" : ""})`,
      value: `${materialNeeded.toFixed(2)} mp`,
      formula:
        baseboardTiles > 0
          ? `(${room.floorArea!.toFixed(2)} mp + ${pct(floorWaste)} pierdere) + (plintă ${baseboard.toFixed(2)} ml × ${Math.round(room.baseboardHeight! * 100)} cm)`
          : `${room.floorArea!.toFixed(2)} mp + ${pct(floorWaste)} pierdere`,
      math:
        baseboardTiles > 0
          ? `${(room.floorArea! * (1 + floorWaste)).toFixed(2)} + ${baseboardTiles.toFixed(2)} = ${materialNeeded.toFixed(2)} mp`
          : `${room.floorArea!.toFixed(2)} × ${(1 + floorWaste).toFixed(2)} = ${materialNeeded.toFixed(2)} mp`,
      note: isMocheta
        ? "Mocheta se vinde la rolă cu lățime fixă (uzual 4-5 m) — dacă o latură a camerei depășește lățimea rolei, pierderea reală poate ajunge la 15-20%. Verifică lățimea rolei cu furnizorul."
        : undefined,
    });
  }

  const perimeter = roomPerimeter(room);
  if (!isGresie && perimeter > 0) {
    const barsNote = dims.baseboardBars > 0 ? `≈ ${dims.baseboardBars} bare de 2 ml.` : "";
    const estimateNote = isPerimeterEstimated(room)
      ? " Perimetru ESTIMAT presupunând camera pătrată (4×√suprafață) — la camere alungite/neregulate, completează lungimile celor 4 pereți (secțiunea Pereți) pentru o valoare exactă."
      : "";
    rows.push({
      label: "Plintă",
      value: `${baseboard.toFixed(2)} ml`,
      formula: "(Perimetru − Σ lățime uși) + 5% pierdere",
      math: `(${perimeter.toFixed(2)} − ${dims.totalDoorWidth.toFixed(2)}) × 1.05 = ${baseboard.toFixed(2)} ml`,
      note: barsNote || estimateNote ? `${barsNote}${estimateNote}` : undefined,
    });
  }

  if (isGresie && room.wallTiling && room.wallTiling.tiledWallsCount > 0) {
    const netTilingArea = netWallTilingArea(room);
    rows.push({
      label: `Faianță (${room.wallTiling.tiledWallsCount} pereți)`,
      value: `${tilingArea.toFixed(2)} mp`,
      formula: `(Σ lungime pereți placați × înălțime − goluri uși/ferestre) + ${pct(tilingWaste)} pierdere`,
      math: `${mp(netTilingArea)} × ${(1 + tilingWaste).toFixed(2)} = ${tilingArea.toFixed(2)} mp`,
      note:
        tilingWaste > 0.1
          ? "Pierdere ridicată la 12% — mai mult de un gol (ușă/fereastră) pe pereții placați înseamnă mai multe tăieturi în jurul lor."
          : undefined,
    });
  }

  if (!isGresie && paintArea > 0) {
    const netPaintArea = paintArea / 1.1;
    rows.push({
      label: "Vopsea Pereți",
      value: `${paintArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți cu vopsea × înălțime − goluri uși/ferestre) + 10% pierdere",
      math: `${mp(netPaintArea)} × 1.10 = ${paintArea.toFixed(2)} mp`,
    });
  }

  if (dims.ceilingPaintArea > 0) {
    rows.push({
      label: "Vopsea Tavan",
      value: `${mp(dims.ceilingPaintArea)} mp`,
      formula: "Suprafață utilă (tavan = pardoseală) + 10% pierdere",
      math: `${mp(room.floorArea ?? 0)} × 1.10 = ${mp(dims.ceilingPaintArea)} mp`,
    });
  }

  if (dims.paintAboveTilingArea > 0) {
    const netAboveTilingArea = dims.paintAboveTilingArea / 1.1;
    rows.push({
      label: "Vopsea Deasupra Faianței",
      value: `${mp(dims.paintAboveTilingArea)} mp`,
      formula:
        "(pereți placați × (înălțime cameră − înălțime placare) + pereți neplacați × înălțime cameră − goluri) + 10% pierdere",
      math: `${mp(netAboveTilingArea)} × 1.10 = ${mp(dims.paintAboveTilingArea)} mp`,
    });
  }

  const totalPaintArea = paintArea + dims.ceilingPaintArea + dims.paintAboveTilingArea;
  if (dims.paintLiters > 0) {
    const rawPaintLiters = (totalPaintArea * 2) / 11;
    rows.push({
      label: "Vopsea Total",
      value: `${dims.paintLiters.toFixed(1)} l`,
      formula: "Suprafață totală (pereți + tavan + deasupra faianței) × 2 straturi ÷ 11 mp/l",
      math: `${mp(totalPaintArea)} mp × 2 straturi ÷ 11 mp/l = ${rawPaintLiters.toFixed(2)} → ${dims.paintLiters.toFixed(1)} l`,
      note: "Rotunjit în sus la 0.5 litri — se vinde în ambalaje standard.",
    });
  }

  const totalPrimerPaintArea = paintArea + wallpaperArea + dims.ceilingPaintArea + dims.paintAboveTilingArea;
  if (dims.paintPrimerLiters > 0) {
    const rawPrimerPaintLiters = totalPrimerPaintArea * 0.1;
    rows.push({
      label: "Amorsă Zugrăveală",
      value: `${dims.paintPrimerLiters.toFixed(0)} l`,
      formula: "Σ arii de vopsit/tapetat (pereți + tavan + deasupra faianței) × 0.10 l/mp",
      math: `${mp(totalPrimerPaintArea)} mp × 0.10 = ${rawPrimerPaintLiters.toFixed(2)} → ${dims.paintPrimerLiters.toFixed(0)} l`,
      note: "Rotunjit în sus la litru întreg — se vinde la 1/4/10 l.",
    });
  }

  if (dims.tilingPrimerLiters > 0) {
    const netFloor = netFloorTilingArea(room);
    const netWall = netWallTilingArea(room);
    const rawTilingPrimerLiters = (netFloor + netWall) * 0.15;
    rows.push({
      label: "Amorsă Placări",
      value: `${dims.tilingPrimerLiters.toFixed(0)} l`,
      formula: "(arie netă pardoseală gresie + arie netă faianță) × 0.15 l/mp",
      math: `(${mp(netFloor)} + ${mp(netWall)}) × 0.15 = ${rawTilingPrimerLiters.toFixed(2)} → ${dims.tilingPrimerLiters.toFixed(0)} l`,
      note: "Arii NETE, fără pierderea de tăiere — amorsa acoperă suprafața reală, nu plăcile tăiate.",
    });
  }

  const adhesiveKg = dims.floorAdhesiveKg + dims.wallAdhesiveKg;
  if (dims.adhesiveBags > 0) {
    rows.push({
      label: "Adeziv Gresie și Faianță",
      value: `${mp(adhesiveKg)} kg (${dims.adhesiveBags} saci)`,
      formula: "Arie netă × kg/mp (după mărime plăci, dublă încleiere la Mare/Foarte mare) + 10% marjă",
      math: `${mp(dims.floorAdhesiveKg)} + ${mp(dims.wallAdhesiveKg)} = ${mp(adhesiveKg)} kg → ${dims.adhesiveBags} saci de 25 kg`,
    });
  }

  if (dims.groutKg > 0) {
    const netFloor = netFloorTilingArea(room);
    const netWall = netWallTilingArea(room);
    const floorRate = groutKgPerSqm(room.tileSize);
    const wallRate = groutKgPerSqm(room.wallTiling?.tileSize);
    const rawGroutKg = (netFloor * floorRate + netWall * wallRate) * 1.1;
    rows.push({
      label: "Chit de Rosturi",
      value: `${mp(dims.groutKg)} kg`,
      formula: "(arie netă pardoseală × kg/mp + arie netă faianță × kg/mp) + 10% marjă",
      math: `(${mp(netFloor)} × ${floorRate} + ${mp(netWall)} × ${wallRate}) × 1.10 = ${rawGroutKg.toFixed(2)} → ${mp(dims.groutKg)} kg`,
      note: "Rotunjit în sus la kg întreg.",
    });
  }

  if (dims.underlayArea > 0 && room.floorMaterial === FlooringType.ParchetLaminat) {
    const rawUnderlayArea = (room.floorArea ?? 0) * 1.05;
    rows.push({
      label: room.underfloorHeating
        ? "Folie Parchet — Încălzire în Pardoseală"
        : "Folie Parchet — XPS 3 mm",
      value: `${dims.underlayArea.toFixed(0)} mp`,
      formula: "Suprafață pardoseală + 5% suprapuneri la îmbinări",
      math: `${mp(room.floorArea ?? 0)} × 1.05 = ${rawUnderlayArea.toFixed(2)} → ${dims.underlayArea.toFixed(0)} mp`,
      note: "Rotunjit în sus la mp întreg.",
    });
  }

  if (!isGresie && wallpaperArea > 0) {
    const netWallpaperArea = wallpaperArea / 1.15;
    rows.push({
      label: "Tapet",
      value: `${wallpaperArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți cu tapet × înălțime − goluri uși/ferestre) + 15% pierdere",
      math: `${mp(netWallpaperArea)} × 1.15 = ${wallpaperArea.toFixed(2)} mp`,
      note: "15% e o estimare medie (model cu potrivire dreaptă). La modele cu raport mare (>26 cm) sau potrivire „half-drop”, comandă 20-25%.",
    });
  }

  return rows;
}
