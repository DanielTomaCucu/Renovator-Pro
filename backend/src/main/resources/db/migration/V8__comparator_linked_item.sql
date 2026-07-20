-- V8 — leagă un grup de comparație de elementul „Din Configurare" pe care îl va completa la alegerea unei
-- oferte (docs/cerinte-comparator-config-sync.md). Fără FK spre items: legătura se re-validează la runtime
-- (item-ul poate fi șters/recreat de AutoItemReconciler), la fel ca created_item_id.
ALTER TABLE comparison_groups ADD COLUMN linked_item_id VARCHAR(36);
