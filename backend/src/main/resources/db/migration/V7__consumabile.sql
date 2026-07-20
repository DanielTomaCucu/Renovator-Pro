-- V7 — Zugrăveli complete + consumabile de montaj (docs/cerinte-zugraveli.md). Zugrăvirea tavanului și
-- încălzirea în pardoseală sunt flag-uri explicite pe cameră; roomHeight/tileSize (pt. vopseaua deasupra
-- faianței și consumul de adeziv/chit) trăiesc în JSONB-ul `wall_tiling` existent, fără migrare separată.

ALTER TABLE rooms ADD COLUMN ceiling_paint BOOLEAN;
ALTER TABLE rooms ADD COLUMN underfloor_heating BOOLEAN;
