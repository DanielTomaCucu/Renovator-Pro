import { RoomType } from "./RoomType";
import { FlooringType } from "./FlooringType";
import { TileSize } from "./TileSize";
import { InstallationType } from "./InstallationType";
import { RoomDoor } from "./RoomDoor";
import { WallTiling } from "./WallTiling";
import { WallFinish } from "./WallFinish";
import { Wall } from "./Wall";
import { RoomWindow } from "./RoomWindow";

/**
 * O cameră a apartamentului, cu buget alocat propriu.
 * Câmpurile tehnice (pardoseală, ușă, placare pereți) sunt opționale — o cameră
 * nou creată nu are configurare tehnică până când userul o completează explicit
 * în pagina „Configurare Apartament".
 */
export interface Room {
  id: string;
  type: RoomType;
  name: string;
  allocatedBudget: number;
  floorMaterial?: FlooringType;
  floorArea?: number;
  perimeter?: number;
  tileSize?: TileSize;
  installationType?: InstallationType;
  /** Uși — max. o ușă per perete, indiferent de tipul de pardoseală. */
  doors?: Partial<Record<Wall, RoomDoor>>;
  /** Înălțimea plintei (m) — doar la Gresie: plinta e tăiată din plăci de gresie, deci consumă din același material. */
  baseboardHeight?: number;
  /** Placare faianță pe pereți — doar la pardoseală Gresie (zonă umedă). */
  wallTiling?: WallTiling;
  /** Finisaj pereți (vopsea/tapet) — doar la pardoseală Parchet/Mochetă, alternativă la `wallTiling`. */
  wallFinish?: WallFinish;
  /** Ferestre — max. o fereastră per perete, indiferent de tipul de pardoseală. Reduc aria de faianță/vopsea/tapet a peretelui și adaugă glaf de bordură. */
  windows?: Partial<Record<Wall, RoomWindow>>;
}
