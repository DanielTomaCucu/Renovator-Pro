import { Offer } from "@/shared/types";

/** Id-ul ofertei cu cel mai mic preț — doar între ofertele CU preț completat; `null` dacă niciuna nu are preț. */
export function cheapestOfferId(offers: Offer[]): string | null {
  const withPrice = offers.filter((o) => o.unitPrice !== undefined);
  if (withPrice.length === 0) return null;
  return withPrice.reduce((min, o) => (o.unitPrice! < min.unitPrice! ? o : min)).id;
}
