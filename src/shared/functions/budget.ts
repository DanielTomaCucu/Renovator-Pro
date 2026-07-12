import { Item } from "../types";
import { totalSpent } from "./items";

/** Bugetul rămas din bugetul total; negativ = depășire (afișează cu tertiary/orange). */
export const budgetRemaining = (totalBudget: number, items: Item[]): number =>
  totalBudget - totalSpent(items);
