import { Item } from "../types";
import { totalSpent } from "./items";

/** Bugetul rămas din bugetul total; negativ = depășire (afișează cu tertiary/orange). */
export const budgetRemaining = (totalBudget: number, items: Item[]): number =>
  totalBudget - totalSpent(items);

/** Eficiență bugetară: cât din totalul estimat s-a cheltuit efectiv, în procente (0 dacă nu există estimat). */
export const budgetEfficiency = (estimated: number, spent: number): number =>
  estimated ? Math.round((spent / estimated) * 100) : 0;
