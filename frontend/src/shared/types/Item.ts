import { ItemOrigin } from "./ItemOrigin";
import { ItemStatus } from "./ItemStatus";
import { MaterialType } from "./MaterialType";

/** Un element de cumpărat, aparținând unei camere (FK roomId). */
export interface Item {
  id: string;
  roomId: string;
  name: string;
  materialType: MaterialType;
  source: string;
  status: ItemStatus;
  quantity: number;
  unitPrice: number;
  productUrl?: string;
  imageUrl?: string;
  /** Manual (adăugat de user) sau Configurare (generat automat din pardoseală/plintă/faianță). */
  origin: ItemOrigin;
  /** Momentul adăugării (ISO 8601), setat de server — imutabil, nu editabil de user. */
  createdAt: string;
  /**
   * Momentul ultimei tranziții spre `ItemStatus.Cumparat` (ISO 8601), setat de server — absent dacă
   * elementul nu a fost niciodată cumpărat. Folosit de graficul „Evoluția Cheltuielilor" (Problema 3).
   */
  purchasedAt?: string;
}
