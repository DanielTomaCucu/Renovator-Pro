import { Item } from "@/shared/types";

/** Starea voletului de detalii (read-only) pentru un element, pe pagina Elemente de Cumpărat. */
export interface ItemDetailsState {
  open: boolean;
  item?: Item | null;
}
