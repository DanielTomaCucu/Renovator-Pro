import { FlooringType, Room } from "@/shared/types";
import {
  baseboardLength,
  baseboardTileArea,
  floorMaterialNeeded,
  hasFloorConfig,
  totalDoorWidth,
  wallFinishArea,
  wallTilingArea,
  windowTrimLength,
} from "@/shared/functions";
import { WallFinishType } from "@/shared/types";

export type RoomCalcRow = { label: string; value: string; formula: string; math: string };

/**
 * Rândurile din panoul „Calcule Detaliate" al unui card de cameră — extrase într-o funcție pură ca să
 * poată fi refolosite identic în PDF-ul exportat (`ApartmentPdfDocument.tsx`), nu doar în UI
 * (`RoomTechnicalCard.tsx`). Aceleași formule, exact același text — un constructor care compară PDF-ul
 * cu ecranul trebuie să vadă mereu aceleași cifre.
 */
export function buildRoomCalcRows(room: Room): RoomCalcRow[] {
  const isGresie = room.floorMaterial === FlooringType.Gresie;
  const baseboard = baseboardLength(room);
  const baseboardTiles = baseboardTileArea(room);
  const materialNeeded = floorMaterialNeeded(room);
  const tilingArea = wallTilingArea(room);
  const paintArea = wallFinishArea(room, WallFinishType.Vopsea);
  const wallpaperArea = wallFinishArea(room, WallFinishType.Tapet);
  const windowTrim = windowTrimLength(room);
  const windowCount = Object.keys(room.windows ?? {}).length;

  const rows: RoomCalcRow[] = [];

  if (hasFloorConfig(room)) {
    rows.push({
      label: `${room.floorMaterial} (Pardoseală${baseboardTiles > 0 ? " + Plintă" : ""})`,
      value: `${materialNeeded.toFixed(2)} mp`,
      formula:
        baseboardTiles > 0
          ? `(${room.floorArea!.toFixed(2)} mp + 10% pierdere) + (plintă ${baseboard.toFixed(2)} ml × ${Math.round(room.baseboardHeight! * 100)} cm)`
          : `${room.floorArea!.toFixed(2)} mp + 10% pierdere`,
      math:
        baseboardTiles > 0
          ? `${(room.floorArea! * 1.1).toFixed(2)} + ${baseboardTiles.toFixed(2)} = ${materialNeeded.toFixed(2)} mp`
          : `${room.floorArea!.toFixed(2)} × 1.10 = ${materialNeeded.toFixed(2)} mp`,
    });
  }

  if (!isGresie && !!room.perimeter) {
    rows.push({
      label: "Plintă",
      value: `${baseboard.toFixed(2)} ml`,
      formula: "(Perimetru − Σ lățime uși) + 5% pierdere",
      math: `(${room.perimeter.toFixed(2)} − ${totalDoorWidth(room).toFixed(2)}) × 1.05 = ${baseboard.toFixed(2)} ml`,
    });
  }

  if (isGresie && room.wallTiling && room.wallTiling.tiledWallsCount > 0) {
    rows.push({
      label: `Faianță (${room.wallTiling.tiledWallsCount} pereți)`,
      value: `${tilingArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți placați × înălțime − gol ușă) + 10% pierdere",
      math: `${tilingArea.toFixed(2)} mp`,
    });
  }

  if (!isGresie && paintArea > 0) {
    rows.push({
      label: "Vopsea",
      value: `${paintArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți cu vopsea × înălțime − gol ușă) + 10% pierdere",
      math: `${paintArea.toFixed(2)} mp`,
    });
  }

  if (!isGresie && wallpaperArea > 0) {
    rows.push({
      label: "Tapet",
      value: `${wallpaperArea.toFixed(2)} mp`,
      formula: "(Σ lungime pereți cu tapet × înălțime − gol ușă) + 15% pierdere",
      math: `${wallpaperArea.toFixed(2)} mp`,
    });
  }

  if (windowTrim > 0) {
    rows.push({
      label: `Glaf Fereastră (${windowCount} ${windowCount === 1 ? "fereastră" : "ferestre"})`,
      value: `${windowTrim.toFixed(2)} ml`,
      formula: "Σ perimetru ferestre (2×(lățime+înălțime)) + 5% pierdere",
      math: `${windowTrim.toFixed(2)} ml`,
    });
  }

  return rows;
}
