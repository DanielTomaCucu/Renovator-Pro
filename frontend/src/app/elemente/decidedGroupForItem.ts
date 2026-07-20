import { ComparisonGroup, ComparisonGroupStatus } from "@/shared/types";

/**
 * Grupul de comparație „Decis" care a completat/creat acest element (docs/cerinte-comparator-config-sync.md)
 * — folosit pentru chip-ul „Ofertă aleasă" de lângă `OriginBadge` în /elemente, ca userul să vadă de unde
 * vine prețul unui element „Din Configurare" completat prin comparator.
 */
export function decidedGroupForItem(groups: ComparisonGroup[], itemId: string): ComparisonGroup | undefined {
  return groups.find((g) => g.status === ComparisonGroupStatus.Decis && g.createdItemId === itemId);
}
