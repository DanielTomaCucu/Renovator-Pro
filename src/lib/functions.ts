/**
 * Logica de business a aplicației — DOAR funcții pure, fără React.
 *
 * REGULĂ (vezi CLAUDE.md + FUNCTIONS.md): orice calcul, transformare sau
 * regulă de business trăiește aici (sau într-un alt fișier functions.ts
 * dedicat unui domeniu), niciodată inline în pagini/componente.
 * Orice funcție adăugată/ștearsă aici se reflectă OBLIGATORIU în FUNCTIONS.md.
 */

import { Item, Room } from "./types";

/** Totalul unui element: cantitate × preț unitar. */
export const itemTotal = (i: Item): number => i.quantity * i.unitPrice;

/** Suma totală estimată a unei liste de elemente, indiferent de status. */
export const totalEstimated = (items: Item[]): number =>
  items.reduce((s, i) => s + itemTotal(i), 0);

/** Suma efectiv cheltuită: DOAR elementele cu status "Cumpărat". */
export const totalSpent = (items: Item[]): number =>
  totalEstimated(items.filter((i) => i.status === "Cumpărat"));

/** Numărul de elemente achiziționate (status "Cumpărat"). */
export const boughtCount = (items: Item[]): number =>
  items.filter((i) => i.status === "Cumpărat").length;

/** Progresul achizițiilor în procente întregi (0–100). 0 dacă lista e goală. */
export const purchaseProgress = (items: Item[]): number =>
  items.length ? Math.round((boughtCount(items) / items.length) * 100) : 0;

/** Bugetul rămas din bugetul total; negativ = depășire (afișează cu tertiary/orange). */
export const budgetRemaining = (totalBudget: number, items: Item[]): number =>
  totalBudget - totalSpent(items);

/** Elementele care aparțin unei camere. */
export const itemsForRoom = (items: Item[], roomId: string): Item[] =>
  items.filter((i) => i.roomId === roomId);

/** Subtotalul estimat al unei camere (toate elementele ei). */
export const roomSubtotal = (items: Item[], roomId: string): number =>
  totalEstimated(itemsForRoom(items, roomId));

/** Cât s-a cheltuit efectiv într-o cameră (doar "Cumpărat"). */
export const roomSpent = (items: Item[], roomId: string): number =>
  totalSpent(itemsForRoom(items, roomId));

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
    if (i.status === "Cumpărat") e.spent += itemTotal(i);
    map.set(i.materialType, e);
  }
  return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
}

export interface DonutSegment {
  name: string;
  total: number;
  /** Fracție 0–1 unde începe segmentul pe cerc. */
  start: number;
  /** Fracție 0–1 unde se termină segmentul pe cerc. */
  end: number;
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

/** Formatare monetară ro-RO, mereu 2 zecimale. Folosește-o pentru ORICE sumă afișată. */
export function formatMoney(
  value: number,
  currency: "EUR" | "RON" = "EUR"
): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
