import { Currency } from "../types";

/**
 * Formatare monetară ro-RO. Zecimalele apar DOAR când suma nu e întreagă (100 EUR, dar 99,50 EUR) —
 * altfel se rotunjeau silențios (99.5 → afișat „100 EUR"), înșelător pe o aplicație de buget.
 * Folosește-o pentru ORICE sumă afișată.
 */
export function formatMoney(value: number, currency: Currency = Currency.EUR): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
