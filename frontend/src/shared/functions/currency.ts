import { Currency } from "../types";

/**
 * Conversie pură a unei sume între monede, la cursul dat (RON per 1 EUR).
 * EUR→RON: sumă × rate; RON→EUR: sumă ÷ rate; aceeași monedă: identitate.
 *
 * OGLINDĂ a `domain/service/CurrencyConverter.java` — sursa de adevăr e backend-ul (endpoint
 * `POST /api/projects/{id}/currency`); această funcție e folosită DOAR de store-ul mock offline
 * (demo, `NEXT_PUBLIC_USE_MOCK_DATA=true`), nu în fluxul real API.
 */
export function convertAmount(
  value: number,
  from: Currency,
  to: Currency,
  rate: number,
): number {
  if (rate <= 0) {
    throw new Error("Cursul valutar trebuie să fie strict pozitiv");
  }
  if (from === to) return value;
  const converted =
    from === Currency.EUR && to === Currency.RON ? value * rate : value / rate;
  // Rotunjire la 2 zecimale (HALF_UP) — identic cu invariantul Money de pe backend.
  return Math.round(converted * 100) / 100;
}
