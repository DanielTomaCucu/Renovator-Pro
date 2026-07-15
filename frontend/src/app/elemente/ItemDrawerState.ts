import { Item } from "@/shared/types";

/** Starea drawerului de adăugare/editare element pe pagina Elemente de Cumpărat. */
export interface ItemDrawerState {
  open: boolean;
  roomId?: string;
  item?: Item | null;
}
