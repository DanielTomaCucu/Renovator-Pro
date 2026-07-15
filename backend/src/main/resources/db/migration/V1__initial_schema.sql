-- V1 — schema de bază Renovator Pro.
-- Enums stocate ca VARCHAR cu valorile string din frontend (cu diacritice) — nu enum PG (migrări dureroase),
-- nu ordinal (fragil la reordonare). Sumele = NUMERIC(12,2). ID-uri = UUID.
-- users + project_members sunt create acum, dar autorizarea „pe drepturi" e activată efectiv în Faza 5.

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(120),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id           UUID PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    total_budget NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency     VARCHAR(8) NOT NULL,
    total_area   DOUBLE PRECISION,
    owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_owner ON projects(owner_id);

-- Membri + rol per proiect (OWNER/EDITOR/VIEWER). PK compus (un rol per user per proiect).
CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       VARCHAR(16) NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_user ON project_members(user_id);

CREATE TABLE rooms (
    id                UUID PRIMARY KEY,
    project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type              VARCHAR(32) NOT NULL,
    name              VARCHAR(120) NOT NULL,
    allocated_budget  NUMERIC(12,2) NOT NULL DEFAULT 0,
    -- Câmpuri tehnice (opționale, completate din „Configurare Apartament").
    floor_material    VARCHAR(32),
    floor_area        DOUBLE PRECISION,
    perimeter         DOUBLE PRECISION,
    tile_size         VARCHAR(64),
    installation_type VARCHAR(32),
    baseboard_height  DOUBLE PRECISION,
    wall_shape        VARCHAR(32),
    -- Structuri per-perete stocate ca JSONB (nu relații interogate individual).
    doors             JSONB,
    windows           JSONB,
    wall_tiling       JSONB,
    wall_finish       JSONB
);

CREATE INDEX idx_rooms_project ON rooms(project_id);

CREATE TABLE items (
    id            UUID PRIMARY KEY,
    room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL,
    material_type VARCHAR(48) NOT NULL,
    source        VARCHAR(200) NOT NULL DEFAULT '',
    status        VARCHAR(32) NOT NULL,
    quantity      NUMERIC(12,3) NOT NULL DEFAULT 1,
    unit_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
    product_url   TEXT,
    image_url     TEXT,
    origin        VARCHAR(32) NOT NULL
);

CREATE INDEX idx_items_room ON items(room_id);
