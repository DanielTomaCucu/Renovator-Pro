import { DonutSegment, Item, ItemStatus, Room } from "../types";
import { itemTotal, roomSubtotal } from "./items";

/**
 * Distribuția costurilor pe camere, sortată descrescător, fără camerele goale.
 * Folosită de donut chart-ul din /analiza.
 */
export function costPerRoom(
  rooms: Room[],
  items: Item[]
): { name: string; total: number }[] {
  return rooms
    .map((r) => ({ name: r.name, total: roomSubtotal(items, r.id) }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * Agregare pe categorii de materiale: total estimat + cheltuit per categorie,
 * sortat descrescător după total. Folosită de progress bars din /analiza.
 */
export function costPerCategory(
  items: Item[]
): [string, { total: number; spent: number }][] {
  const map = new Map<string, { total: number; spent: number }>();
  for (const i of items) {
    const e = map.get(i.materialType) ?? { total: 0, spent: 0 };
    e.total += itemTotal(i);
    if (i.status === ItemStatus.Cumparat) e.spent += itemTotal(i);
    map.set(i.materialType, e);
  }
  return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
}

/**
 * Transformă o distribuție {name, total} în segmente cumulative pentru un
 * donut chart SVG (stroke-dasharray). Suma fracțiilor acoperă cercul complet.
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
