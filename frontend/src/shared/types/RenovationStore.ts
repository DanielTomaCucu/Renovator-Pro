import { ComparisonGroup } from "./ComparisonGroup";
import { Currency } from "./Currency";
import { Item } from "./Item";
import { MaterialType } from "./MaterialType";
import { Offer } from "./Offer";
import { Project } from "./Project";
import { ProjectSummary } from "./ProjectSummary";
import { Room } from "./Room";
import { SpendingTimelinePoint } from "./SpendingTimelinePoint";

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
  /**
   * Serie temporală de cheltuieli cumulate (`GET /api/projects/{id}/spending-timeline`), pe baza
   * momentului cumpărării — sursa graficului „Evoluția Cheltuielilor" (Problema 3 din audit). Goală
   * dacă nimic nu a fost încă marcat Cumpărat. Reîncărcată după fiecare mutație de item.
   */
  spendingTimeline: SpendingTimelinePoint[];
  /** Grupurile de comparație ale proiectului (Comparator de Oferte), cu ofertele lor nested — reîncărcate după fiecare mutație. */
  comparisonGroups: ComparisonGroup[];
  /**
   * Mesajul ultimei erori de mutație (request API eșuat — validare, rețea, server jos), sau `null` dacă
   * nimic nu a eșuat. Mutațiile NU aruncă — starea locală nu se schimbă dacă requestul eșuează, iar
   * eroarea ajunge aici ca UI-ul să o poată afișa (altfel eșecul trecea neobservat).
   */
  error: string | null;
  /** Șterge mesajul de eroare curent (ex. la închiderea unui toast). */
  dismissError: () => void;
  updateProject: (patch: Partial<Project>) => Promise<void>;
  /**
   * Conversie REALĂ a monedei: recalculează toate sumele (buget proiect, buget alocat pe camere,
   * preț unitar pe elemente) la cursul dat (RON per 1 EUR) și setează moneda țintă. Distructivă —
   * vezi `POST /api/projects/{id}/currency` în api-contract.md.
   */
  convertCurrency: (targetCurrency: Currency, exchangeRate: number) => Promise<void>;
  addRoom: (room: Omit<Room, "id">) => Promise<void>;
  /**
   * `null` explicit pe un câmp = ȘTERGE valoarea existentă (nu doar „nu se modifică", ca `undefined`/absent).
   * Necesar ca să poți dezactiva placarea/finisajul de pereți sau goli suprafața pardoselii prin PATCH
   * (Problema 6 din audit) — vezi `POST/PATCH /api/rooms/{id}` în api-contract.md.
   */
  updateRoom: (id: string, patch: { [K in keyof Room]?: Room[K] | null }) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  /** `createdAt`/`purchasedAt` sunt gestionate exclusiv de server — niciodată furnizate de client la creare. */
  addItem: (item: Omit<Item, "id" | "createdAt" | "purchasedAt">) => Promise<void>;
  updateItem: (id: string, patch: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  addComparisonGroup: (roomId: string, data: { name: string; materialType: MaterialType }) => Promise<void>;
  /** `roomId` mută grupul în altă cameră — permis doar cât timp grupul e „În analiză" (eroare altfel). */
  updateComparisonGroup: (id: string, patch: { name?: string; materialType?: MaterialType; roomId?: string }) => Promise<void>;
  /** Șterge grupul ȘI ofertele lui — NU atinge elementul deja creat din el. */
  deleteComparisonGroup: (id: string) => Promise<void>;
  addOffer: (groupId: string, data: Omit<Offer, "id" | "groupId" | "createdAt">) => Promise<void>;
  /** `null` explicit pe un câmp = ȘTERGE valoarea existentă (toate câmpurile ofertei sunt opționale prin design). */
  updateOffer: (id: string, patch: { [K in keyof Offer]?: Offer[K] | null }) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  /** Alege o ofertă: creează elementul de cumpărat în camera grupului și marchează grupul „Decis". */
  chooseOffer: (groupId: string, offerId: string, quantity?: number) => Promise<void>;
}
