import { Currency } from "./Currency";
import { Item } from "./Item";
import { Project } from "./Project";
import { ProjectSummary } from "./ProjectSummary";
import { Room } from "./Room";

/** Contractul stării globale a aplicației — implementat de StoreProvider peste API-ul real. */
export interface RenovationStore {
  project: Project;
  rooms: Room[];
  items: Item[];
  /**
   * Agregările calculate SERVER-SIDE (`GET /api/projects/{id}/summary`) — sursa de adevăr pentru totaluri,
   * cost/cameră, cost/categorie și sumarul tehnic. Reîncărcat după FIECARE mutație (Problema 2 din audit).
   */
  summary: ProjectSummary;
  updateProject: (patch: Partial<Project>) => void;
  /**
   * Conversie REALĂ a monedei: recalculează toate sumele (buget proiect, buget alocat pe camere,
   * preț unitar pe elemente) la cursul dat (RON per 1 EUR) și setează moneda țintă. Distructivă —
   * vezi `POST /api/projects/{id}/currency` în api-contract.md.
   */
  convertCurrency: (targetCurrency: Currency, exchangeRate: number) => void;
  addRoom: (room: Omit<Room, "id">) => void;
  /**
   * `null` explicit pe un câmp = ȘTERGE valoarea existentă (nu doar „nu se modifică", ca `undefined`/absent).
   * Necesar ca să poți dezactiva placarea/finisajul de pereți sau goli suprafața pardoselii prin PATCH
   * (Problema 6 din audit) — vezi `POST/PATCH /api/rooms/{id}` în api-contract.md.
   */
  updateRoom: (id: string, patch: { [K in keyof Room]?: Room[K] | null }) => void;
  deleteRoom: (id: string) => void;
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}
