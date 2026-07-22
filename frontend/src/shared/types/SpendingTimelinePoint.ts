/**
 * Un punct din seria „Evoluția Cheltuielilor" (Problema 3 din audit) — oglinda 1:1 a
 * `SpendingTimelinePointResponse` din backend (`GET /api/projects/{id}/spending-timeline`). DOUĂ serii:
 * `cumulativeSpent` (linia principală, doar Cumpărat) și `cumulativeTotal` (linia secundară, toate
 * elementele) — `cumulativeTotal >= cumulativeSpent` întotdeauna (garantat de backend).
 */
export interface SpendingTimelinePoint {
  /** Format ISO "yyyy-MM" — eticheta de afișare se derivă din el pe frontend. */
  month: string;
  /** Suma cumulată a elementelor Cumpărate, pe luna cumpărării, până la și inclusiv această lună. */
  cumulativeSpent: number;
  /** Suma cumulată a TUTUROR elementelor (orice status), pe luna adăugării, până la și inclusiv această lună. */
  cumulativeTotal: number;
}
