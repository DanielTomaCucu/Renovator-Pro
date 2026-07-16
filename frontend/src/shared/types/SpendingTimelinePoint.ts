/**
 * Un punct din seria „Evoluția Cheltuielilor" (Problema 3 din audit) — oglinda 1:1 a
 * `SpendingTimelinePointResponse` din backend (`GET /api/projects/{id}/spending-timeline`).
 */
export interface SpendingTimelinePoint {
  /** Format ISO "yyyy-MM" — eticheta de afișare se derivă din el pe frontend. */
  month: string;
  /** Suma cumulată a tuturor lunilor până la și inclusiv aceasta. */
  cumulativeSpent: number;
}
