import { RoomType } from "./RoomType";
import { FlooringType } from "./FlooringType";
import { TileSize } from "./TileSize";
import { InstallationType } from "./InstallationType";
import { RoomDoor } from "./RoomDoor";
import { WallTiling } from "./WallTiling";
import { WallFinish } from "./WallFinish";
import { Wall } from "./Wall";
import { RoomWindow } from "./RoomWindow";
import { RoomShape } from "./RoomShape";
import { RoomDimensions } from "./RoomDimensions";

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
  /**
   * Forma asumată a camerei — controlează câte lungimi de perete cere UI-ul (Pătrat: 1, Dreptunghi: 2,
   * Neregulată: 4) la `wallTiling`/`wallFinish` și limitează superior lungimile introduse, ca suprafața
   * rezultată din pereți să nu depășească niciodată `floorArea`.
   */
  wallShape?: RoomShape;
  /** Placare faianță pe pereți — doar la pardoseală Gresie (zonă umedă). */
  wallTiling?: WallTiling;
  /** Finisaj pereți (vopsea/tapet) — doar la pardoseală Parchet/Mochetă, alternativă la `wallTiling`. */
  wallFinish?: WallFinish;
  /** Ferestre — max. o fereastră per perete, indiferent de tipul de pardoseală. Reduc aria de faianță/vopsea/tapet a peretelui și adaugă glaf de bordură. */
  windows?: Partial<Record<Wall, RoomWindow>>;
  /**
   * Necesarul de material calculat server-side (sursa de adevăr). Prezent pe camerele venite din API
   * (`GET .../rooms`); absent pe o cameră construită local (ex. `draft` în curs de editare). Vezi `RoomDimensions`.
   */
  dimensions?: RoomDimensions;
  /** Zugrăvirea tavanului — activată explicit. Aria = floorArea. Disponibilă la ORICE pardoseală. */
  ceilingPaint?: boolean;
  /** Încălzire în pardoseală — schimbă tipul foliei de sub parchet. Doar la Parchet Laminat. */
  underfloorHeating?: boolean;
}
