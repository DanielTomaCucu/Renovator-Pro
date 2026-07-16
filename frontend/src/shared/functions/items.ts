import { Item, ItemStatus } from "../types";

/** Totalul unui element: cantitate × preț unitar. */
export const itemTotal = (i: Item): number => i.quantity * i.unitPrice;

/** Suma totală estimată a unei liste de elemente, indiferent de status. */
export const totalEstimated = (items: Item[]): number =>
  items.reduce((s, i) => s + itemTotal(i), 0);

/** Suma efectiv cheltuită: DOAR elementele cu status Cumparat. */
export const totalSpent = (items: Item[]): number =>
  totalEstimated(items.filter((i) => i.status === ItemStatus.Cumparat));

/** Numărul de elemente Cumparat dintr-o listă (folosit per-cameră; totalul de proiect vine din `summary`). */
export const boughtCount = (items: Item[]): number =>
  items.filter((i) => i.status === ItemStatus.Cumparat).length;

/** Elementele care aparțin unei camere. */
export const itemsForRoom = (items: Item[], roomId: string): Item[] =>
  items.filter((i) => i.roomId === roomId);

/** Subtotalul estimat al unei camere (toate elementele ei). */
export const roomSubtotal = (items: Item[], roomId: string): number =>
  totalEstimated(itemsForRoom(items, roomId));

/** Cât s-a cheltuit efectiv într-o cameră (doar Cumparat). */
export const roomSpent = (items: Item[], roomId: string): number =>
  totalSpent(itemsForRoom(items, roomId));
