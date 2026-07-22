import { Room } from "@/shared/types";

/** Starea drawerului de adăugare/editare cameră pe pagina Elemente de Cumpărat. */
export interface RoomDrawerState {
  open: boolean;
  room?: Room | null;
}
