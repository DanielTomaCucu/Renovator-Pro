import { Wall } from "./Wall";

/** Configurarea ușii unei camere — se scade din plinta/faianța peretelui pe care e amplasată. */
export interface RoomDoor {
  width: number;
  height: number;
  wall: Wall;
}
