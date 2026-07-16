-- V3 — timestamp-uri pe items: created_at (adăugare) + purchased_at (momentul marcării ca Cumpărat).
-- De ce: fundație pentru graficul „Evoluția Cheltuielilor" (Problema 3 din audit) — imposibil de desenat
-- o evoluție reală fără date temporale (Problema 4 din audit). NU modifică V1/V2 — deja aplicate în prod.
ALTER TABLE items ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
-- Nullable: elementele deja Cumpărate înainte de această migrare nu au un moment real de cumpărare
-- cunoscut — rămân NULL (nu apar în serie temporală) până la o eventuală retranziție de status.
ALTER TABLE items ADD COLUMN purchased_at TIMESTAMPTZ;
