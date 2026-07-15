import { Currency } from "./Currency";
import { Item } from "./Item";
import { Project } from "./Project";
import { Room } from "./Room";

/** Contractul stării globale a aplicației — implementat azi de StoreProvider (mock in-memory). */
export interface RenovationStore {
  project: Project;
  rooms: Room[];
  items: Item[];
  updateProject: (patch: Partial<Project>) => void;
  /**
   * Conversie REALĂ a monedei: recalculează toate sumele (buget proiect, buget alocat pe camere,
   * preț unitar pe elemente) la cursul dat (RON per 1 EUR) și setează moneda țintă. Distructivă —
   * vezi `POST /api/projects/{id}/currency` în api-contract.md.
   */
  convertCurrency: (targetCurrency: Currency, exchangeRate: number) => void;
  addRoom: (room: Omit<Room, "id">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}
