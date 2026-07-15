/** Un segment cumulativ al unui donut chart SVG (produs de `donutSegments()`). */
export interface DonutSegment {
  name: string;
  total: number;
  /** Fracție 0–1 unde începe segmentul pe cerc. */
  start: number;
  /** Fracție 0–1 unde se termină segmentul pe cerc. */
  end: number;
}
