import { InspirationImage } from "@/shared/types";

/** Stare locală a voletului de adăugare/editare poză — `image` prezent = editare, absent = adăugare nouă. */
export interface GalleryDrawerState {
  open: boolean;
  image?: InspirationImage;
  /** Preselectează camera la deschidere din secțiunea pe care s-a apăsat „Adaugă Poză" (opțional). */
  defaultRoomId?: string;
}
