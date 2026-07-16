import { DonutSegment } from "../types";

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
