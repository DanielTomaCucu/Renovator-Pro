import { Offer } from "@/shared/types";

/** Starea drawerului de adăugare/editare ofertă pe pagina de comparare a unui grup. */
export interface OfferDrawerState {
  open: boolean;
  offer?: Offer | null;
}
