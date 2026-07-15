import { Currency } from "../types";

/** Formatare monetară ro-RO, fără zecimale (sumele din acest proiect nu au nevoie de precizie sub-unitară). Folosește-o pentru ORICE sumă afișată. */
export function formatMoney(value: number, currency: Currency = Currency.EUR): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
