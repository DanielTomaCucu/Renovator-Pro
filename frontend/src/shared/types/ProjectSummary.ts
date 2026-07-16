import { MaterialType } from "./MaterialType";

/** O intrare din distribuția cost-per-cameră (donut chart /analiza). */
export interface RoomCost {
  name: string;
  total: number;
}

/** Agregare {total, spent} per categorie de material (progress bars /analiza). */
export interface CategoryCost {
  materialType: MaterialType;
  total: number;
  spent: number;
}

/** Sumar tehnic agregat (card „Sumar Tehnic Global" din /configurare). */
export interface TechnicalSummary {
  totalFloorArea: number;
  configuredRoomsRatio: number;
}

/**
 * Agregările proiectului calculate SERVER-SIDE (`GET /api/projects/{id}/summary`) — sursa de adevăr pentru
 * totalurile pe care paginile le afișau recalculând local (Problema 2 din audit). Oglinda 1:1 a
 * `ProjectSummaryResponse` din backend.
 */
export interface ProjectSummary {
  totalEstimated: number;
  totalSpent: number;
  budgetRemaining: number;
  purchaseProgress: number;
  boughtCount: number;
  costPerRoom: RoomCost[];
  costPerCategory: CategoryCost[];
  technical: TechnicalSummary;
}
