import { DonutSegment, SpendingTimelinePoint } from "../types";

/**
 * Transformă o distribuție {name, total} în segmente cumulative pentru un donut chart SVG
 * (stroke-dasharray). Suma fracțiilor acoperă cercul complet. Geometrie de PREZENTARE (nu regulă de
 * business) — rămâne client-side; datele (`costPerRoom`) vin din agregarea server-side (Problema 2).
 */
export function donutSegments(
  data: { name: string; total: number }[]
): DonutSegment[] {
  const sum = data.reduce((s, d) => s + d.total, 0);
  if (sum === 0) return [];
  let acc = 0;
  return data.map((d) => {
    const start = acc / sum;
    acc += d.total;
    return { ...d, start, end: acc / sum };
  });
}

/** Un punct normalizat pt. graficul „Evoluția Cheltuielilor" — x,y ∈ [0,1] (stânga→dreapta, jos→sus). */
export interface NormalizedTimelinePoint {
  x: number;
  y: number;
  month: string;
  cumulativeSpent: number;
}

/**
 * Normalizează seria reală de cheltuieli cumulate (`GET .../spending-timeline`) în puncte {x,y} ∈ [0,1],
 * gata de scalat într-un viewBox SVG. Geometrie de PREZENTARE (nu regulă de business) — datele rămân
 * server-side (Problema 2/3 din audit); randarea (polilinie sau bare) rămâne concern al componentei.
 * Listă goală → listă goală (empty-state se afișează în componentă, nu o curbă falsă — Problema 3).
 */
export function timelinePoints(data: SpendingTimelinePoint[]): NormalizedTimelinePoint[] {
  if (data.length === 0) return [];
  const max = Math.max(...data.map((d) => d.cumulativeSpent), 0);
  return data.map((d, i) => ({
    x: data.length === 1 ? 0 : i / (data.length - 1),
    y: max === 0 ? 0 : d.cumulativeSpent / max,
    month: d.month,
    cumulativeSpent: d.cumulativeSpent,
  }));
}
