/**
 * O ofertă dintr-un grup de comparație. TOATE câmpurile descriptive sunt opționale — fluxul principal
 * e „fac poze în magazin, completez restul acasă": o ofertă poate fi doar câteva poze, fără preț/magazin.
 * `images`: max 8, fiecare un URL http(s) SAU o poză `data:image/...;base64,...` (poză din telefon,
 * comprimată client-side) — aceeași convenție ca `Item.imageUrl`.
 */
export interface Offer {
  id: string;
  groupId: string;
  name?: string;
  store?: string;
  unitPrice?: number;
  quantity?: number;
  productUrl?: string;
  images: string[];
  notes?: string;
  createdAt: string;
}
