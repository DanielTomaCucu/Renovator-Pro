import { RoomType } from "./RoomType";
import { FlooringType } from "./FlooringType";
import { TileSize } from "./TileSize";
import { InstallationType } from "./InstallationType";
import { RoomDoor } from "./RoomDoor";
import { WallTiling } from "./WallTiling";

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
  door?: RoomDoor;
  wallTiling?: WallTiling;
}
