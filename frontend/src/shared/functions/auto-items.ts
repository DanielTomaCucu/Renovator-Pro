import {
  FlooringType,
  Item,
  ItemOrigin,
  ItemStatus,
  MaterialType,
  Room,
  WallFinishType,
} from "@/shared/types";
import {
  baseboardLength,
  baseboardTileArea,
  floorMaterialNeeded,
  hasFloorConfig,
  wallFinishArea,
  wallTilingArea,
  windowTrimLength,
} from "./dimensions";

/** Categoria de element potrivită fiecărui tip de pardoseală — Mochetă nu are o categorie dedicată încă. */
const FLOOR_MATERIAL_TYPE: Record<FlooringType, MaterialType> = {
  [FlooringType.Gresie]: MaterialType.Gresie,
  [FlooringType.ParchetLaminat]: MaterialType.Parchet,
  [FlooringType.Mocheta]: MaterialType.Altele,
};

const WALL_FINISH_MATERIAL_TYPE: Record<WallFinishType, MaterialType> = {
  [WallFinishType.Vopsea]: MaterialType.Vopsea,
  [WallFinishType.Tapet]: MaterialType.Tapet,
};

/**
 * Elementele „de cumpărat" derivate din măsurătorile tehnice ale unei camere (pardoseală, plintă,
 * faianță la Gresie, vopsea/tapet la Parchet/Mochetă). Apar fără preț (0) — doar cantitatea calculată
 * contează până când userul completează prețul manual în /elemente.
 */
export function generateAutoItems(room: Room): Omit<Item, "id">[] {
  const autoItems: Omit<Item, "id">[] = [];
  const isGresie = room.floorMaterial === FlooringType.Gresie;

  if (hasFloorConfig(room)) {
    // La Gresie, cantitatea de mai jos include deja plinta (tăiată din aceleași plăci) — vezi `floorMaterialNeeded`.
    const includesBaseboard = isGresie && baseboardTileArea(room) > 0;
    autoItems.push({
      roomId: room.id,
      name: `${room.floorMaterial} (Pardoseală${includesBaseboard ? " + Plintă" : ""})`,
      materialType: FLOOR_MATERIAL_TYPE[room.floorMaterial!],
      source: "",
      status: ItemStatus.InAsteptare,
      quantity: Number(floorMaterialNeeded(room).toFixed(2)),
      unitPrice: 0,
      origin: ItemOrigin.Configurare,
    });
  }

  // Plintă separată — doar când NU e Gresie (la Gresie e deja inclusă în pardoseală, mai sus).
  const plinta = baseboardLength(room);
  if (!isGresie && plinta > 0) {
    autoItems.push({
      roomId: room.id,
      name: "Plintă",
      materialType: MaterialType.Plinta,
      source: "",
      status: ItemStatus.InAsteptare,
      quantity: Number(plinta.toFixed(2)),
      unitPrice: 0,
      origin: ItemOrigin.Configurare,
    });
  }

  // Faianță — doar la Gresie.
  const faianta = wallTilingArea(room);
  if (isGresie && room.wallTiling && room.wallTiling.tiledWallsCount > 0 && faianta > 0) {
    autoItems.push({
      roomId: room.id,
      name: `Faianță (${room.wallTiling.tiledWallsCount} pereți)`,
      materialType: MaterialType.Faianta,
      source: "",
      status: ItemStatus.InAsteptare,
      quantity: Number(faianta.toFixed(2)),
      unitPrice: 0,
      origin: ItemOrigin.Configurare,
    });
  }

  // Vopsea / Tapet — doar la Parchet/Mochetă (alternativa la faianță).
  if (!isGresie && room.wallFinish) {
    for (const type of [WallFinishType.Vopsea, WallFinishType.Tapet]) {
      const area = wallFinishArea(room, type);
      const wallCount = Object.values(room.wallFinish.finishes).filter((f) => f === type).length;
      if (area > 0) {
        autoItems.push({
          roomId: room.id,
          name: `${type} (${wallCount} pereți)`,
          materialType: WALL_FINISH_MATERIAL_TYPE[type],
          source: "",
          status: ItemStatus.InAsteptare,
          quantity: Number(area.toFixed(2)),
          unitPrice: 0,
          origin: ItemOrigin.Configurare,
        });
      }
    }
  }

  // Glaf/bordură ferestre — indiferent de tipul de pardoseală, ori de câte ori sunt ferestre configurate.
  const trim = windowTrimLength(room);
  if (trim > 0) {
    const windowCount = Object.values(room.windows ?? {}).length;
    autoItems.push({
      roomId: room.id,
      name: `Glaf Fereastră (${windowCount} ${windowCount === 1 ? "fereastră" : "ferestre"})`,
      materialType: MaterialType.GlafFereastra,
      source: "",
      status: ItemStatus.InAsteptare,
      quantity: Number(trim.toFixed(2)),
      unitPrice: 0,
      origin: ItemOrigin.Configurare,
    });
  }

  return autoItems;
}

/**
 * Reconciliază elementele auto-generate (origin Configurare) ale unei camere cu noua configurare tehnică:
 * păstrează id/preț/status ale celor existente (pot fi editate manual de user), le actualizează doar
 * numele/cantitatea, adaugă cele noi apărute și elimină cele a căror măsurătoare a fost ștearsă.
 * Elementele adăugate manual de user (origin Manual) nu sunt niciodată atinse.
 */
export function syncAutoItemsForRoom(items: Item[], room: Room, createId: () => string): Item[] {
  const freshAutoItems = generateAutoItems(room);
  const untouchedItems = items.filter(
    (i) => !(i.roomId === room.id && i.origin === ItemOrigin.Configurare)
  );
  const existingAutoItems = items.filter(
    (i) => i.roomId === room.id && i.origin === ItemOrigin.Configurare
  );

  const mergedAutoItems = freshAutoItems.map((fresh) => {
    const existing = existingAutoItems.find((i) => i.materialType === fresh.materialType);
    return existing
      ? { ...existing, name: fresh.name, quantity: fresh.quantity }
      : { ...fresh, id: createId() };
  });

  return [...untouchedItems, ...mergedAutoItems];
}
