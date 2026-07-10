import { Currency } from "../types";

/** Formatare monetară ro-RO, mereu 2 zecimale. Folosește-o pentru ORICE sumă afișată. */
export function formatMoney(value: number, currency: Currency = Currency.EUR): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
