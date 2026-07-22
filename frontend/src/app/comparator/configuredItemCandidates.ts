import { Item, ItemOrigin, MaterialType } from "@/shared/types";

/**
 * Elementele „Din Configurare" ale unei camere ce pot fi ținta unui grup de comparație pentru un anumit
 * material (docs/cerinte-comparator-config-sync.md) — oglindă client-side a
 * `AutoItemReconciler.resolveLinkedItem` din backend, folosită DOAR pentru afișare/alegere în
 * `GroupFormDrawer` (backend-ul re-validează/re-rezolvă oricum la creare și la choose). Sortate după
 * `createdAt` crescător, ca „primul" candidat (folosit ca sugestie implicită) să fie mereu același.
 */
export function configuredItemCandidates(items: Item[], roomId: string, materialType: MaterialType): Item[] {
  return items
    .filter((i) => i.roomId === roomId && i.origin === ItemOrigin.Configurare && i.materialType === materialType)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
