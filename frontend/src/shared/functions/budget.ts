/**
 * Eficiență bugetară: cât din totalul estimat s-a cheltuit efectiv, în procente (0 dacă nu există estimat).
 * Rație de prezentare peste totalurile din `summary` (server-side) — `budgetRemaining`/`totalSpent` etc.
 * NU se mai recalculează client-side, vin din agregarea server-side (Problema 2 din audit).
 */
export const budgetEfficiency = (estimated: number, spent: number): number =>
  estimated ? Math.round((spent / estimated) * 100) : 0;
