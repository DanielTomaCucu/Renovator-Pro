import { ComparisonGroup } from "@/shared/types";

/** Starea drawerului de adăugare/editare grup de comparație pe pagina Comparator Oferte. */
export interface GroupDrawerState {
  open: boolean;
  group?: ComparisonGroup | null;
}
