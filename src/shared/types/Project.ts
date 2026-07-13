import { Currency } from "./Currency";

/** Proiectul de renovare (azi: un singur proiect implicit per aplicație). */
export interface Project {
  id: string;
  title: string;
  totalBudget: number;
  currency: Currency;
  /** Suprafață totală introdusă manual (mp) — folosită pt. progresul de proiect, nu suma camerelor. */
  totalArea?: number;
}
