import { Item } from "./Item";
import { Project } from "./Project";
import { Room } from "./Room";

/** Contractul stării globale a aplicației — implementat azi de StoreProvider (mock in-memory). */
export interface RenovationStore {
  project: Project;
  rooms: Room[];
  items: Item[];
  updateProject: (patch: Partial<Project>) => void;
  addRoom: (room: Omit<Room, "id">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}
