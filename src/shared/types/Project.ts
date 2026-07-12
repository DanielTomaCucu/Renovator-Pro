import { Currency } from "./Currency";

/** Proiectul de renovare (azi: un singur proiect implicit per aplicație). */
export interface Project {
  id: string;
  title: string;
  totalBudget: number;
  currency: Currency;
}
