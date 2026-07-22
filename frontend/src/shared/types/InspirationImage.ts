import { InspirationType } from "./InspirationType";

/**
 * O poză din Galeria de Inspirație a proiectului: poză proprie, randare, sau inspirație online,
 * opțional legată de o cameră. `image`: URL http(s) sau `data:image/...;base64,...` (poză din telefon,
 * comprimată client-side) — aceeași convenție ca `Item.imageUrl`/`Offer.images`.
 */
export interface InspirationImage {
  id: string;
  projectId: string;
  roomId?: string;
  type: InspirationType;
  image: string;
  caption?: string;
  sourceUrl?: string;
  createdAt: string;
}
