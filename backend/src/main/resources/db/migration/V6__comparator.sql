-- V6 — Comparator de Oferte (docs/cerinte-comparator-oferte.md). Un grup de comparație = un produs de
-- decis pentru o cameră (ex. „Gresie baie"), cu N oferte. Toate câmpurile descriptive ale unei oferte
-- sunt NULLABLE — fluxul principal e „fac poze în magazin, completez restul acasă", o ofertă poate fi
-- doar câteva poze. Pozele (URL extern SAU data URI base64, ca la Item.imageUrl) trăiesc în JSONB
-- `images`, nu într-un tabel separat — nu există upload/backend de fișiere real, la fel ca la elemente.

CREATE TABLE comparison_groups (
    id              VARCHAR(36) PRIMARY KEY,
    room_id         VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    material_type   VARCHAR(32) NOT NULL,
    status          VARCHAR(16) NOT NULL,
    chosen_offer_id VARCHAR(36),
    -- Fără FK spre items — istoricul grupului supraviețuiește ștergerii elementului creat din el.
    created_item_id VARCHAR(36),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comparison_groups_room ON comparison_groups(room_id);

-- Toate câmpurile descriptive NULLABLE — o ofertă poate fi doar câteva poze făcute în magazin.
CREATE TABLE offers (
    id          VARCHAR(36) PRIMARY KEY,
    group_id    VARCHAR(36) NOT NULL REFERENCES comparison_groups(id) ON DELETE CASCADE,
    name        VARCHAR(200),
    store       VARCHAR(120),
    unit_price  NUMERIC(12,2),
    quantity    NUMERIC(12,2),
    product_url VARCHAR(2048),
    images      JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes       VARCHAR(2000),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_offers_group ON offers(group_id);
