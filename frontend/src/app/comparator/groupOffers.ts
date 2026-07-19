import { Offer } from "@/shared/types";

/** Intervalul de preț (min–max) al ofertelor CU preț completat — null dacă niciuna nu are preț. */
export function offerPriceRange(offers: Offer[]): { min: number; max: number } | null {
  const prices = offers.map((o) => o.unitPrice).filter((p): p is number => p !== undefined);
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
