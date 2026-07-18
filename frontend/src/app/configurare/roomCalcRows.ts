import { FlooringType, Room, RoomDimensions } from "@/shared/types";
import { roomPerimeter, wallTilingWasteRatio } from "@/shared/functions/dimensions";

export type RoomCalcRow = { label: string; value: string; formula: string; math: string; note?: string };

/** Formatează un factor (0.15) ca procent întreg pt. afișare în formule ("15%"). */
const pct = (ratio: number) => `${Math.round(ratio * 100)}%`;

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
  const windowTrim = dims.windowTrimLength;
  const windowCount = Object.keys(room.windows ?? {}).length;

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
    rows.push({
      label: "Plintă",
      value: `${baseboard.toFixed(2)} ml`,
      formula: "(Perimetru − Σ lățime uși) + 5% pierdere",
      math: `(${perimeter.toFixed(2)} − ${dims.totalDoorWidth.toFixed(2)}) × 1.05 = ${baseboard.toFixed(2)} ml`,
      note: dims.baseboardBars > 0 ? `≈ ${dims.baseboardBars} bare de 2 ml` : undefined,
    });
  }

  if (isGresie && room.wallTiling && room.wallTiling.tiledWallsCount > 0) {
    rows.push({
      label: `Faianță (${room.wallTiling.tiledWallsCount} pereți)`,
      value: `${tilingArea.toFixed(2)} mp`,
      formula: `(Σ lungime pereți placați × înălțime − gol ușă) + ${pct(tilingWaste)} pierdere`,
      math: `${tilingArea.toFixed(2)} mp`,
      note:
        tilingWaste > 0.1
          ? "Pierdere ridicată la 12% — mai mult de un gol (ușă/fereastră) pe pereții placați înseamnă mai multe tăieturi în jurul lor."
          : undefined,
    });
  }

  if (!isGresie && paintArea > 0) {
    rows.push({
      label: "Vopsea",
      value: `${paintArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți cu vopsea × înălțime − gol ușă) + 10% pierdere",
      math: `${paintArea.toFixed(2)} mp`,
      note: `≈ ${dims.paintLiters.toFixed(1)} litri (2 straturi, ~11 mp/litru/strat)`,
    });
  }

  if (!isGresie && wallpaperArea > 0) {
    rows.push({
      label: "Tapet",
      value: `${wallpaperArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți cu tapet × înălțime − gol ușă) + 15% pierdere",
      math: `${wallpaperArea.toFixed(2)} mp`,
      note: "15% e o estimare medie (model cu potrivire dreaptă). La modele cu raport mare (>26 cm) sau potrivire „half-drop”, comandă 20-25%.",
    });
  }

  if (windowTrim > 0) {
    rows.push({
      label: `Glaf Fereastră (${windowCount} ${windowCount === 1 ? "fereastră" : "ferestre"})`,
      value: `${windowTrim.toFixed(2)} ml`,
      formula: "Σ perimetru ferestre (2×(lățime+înălțime)) + 5% pierdere",
      math: `${windowTrim.toFixed(2)} ml`,
      note: dims.windowTrimBars > 0 ? `≈ ${dims.windowTrimBars} bare de 2 ml` : undefined,
    });
  }

  return rows;
}
