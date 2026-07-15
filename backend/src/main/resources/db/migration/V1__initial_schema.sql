-- V1 — schema de bază Renovator Pro.
-- Enums stocate ca VARCHAR cu valorile string din frontend (cu diacritice) — nu enum PG (migrări dureroase),
-- nu ordinal (fragil la reordonare). Sumele = NUMERIC(12,2). ID-uri = UUID v4, stocate ca VARCHAR(36)
-- (nu tipul nativ Postgres UUID) — domeniul Java folosește String pentru id-uri (oglindă a `string`-ului
-- din TS), iar Hibernate/JPA mapează implicit String la VARCHAR; VARCHAR(36) evită casting-ul JDBC
-- suplimentar cerut de tipul nativ UUID, cu cost neglijabil la scara acestei aplicații.
-- users + project_members sunt create acum, dar autorizarea „pe drepturi" e activată efectiv în Faza 5.

CREATE TABLE users (
    id            VARCHAR(36) PRIMARY KEY,
    email         VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(120),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id           VARCHAR(36) PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    total_budget NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency     VARCHAR(8) NOT NULL,
    total_area   DOUBLE PRECISION,
    owner_id     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_owner ON projects(owner_id);

-- Membri + rol per proiect (OWNER/EDITOR/VIEWER). PK compus (un rol per user per proiect).
CREATE TABLE project_members (
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       VARCHAR(16) NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_user ON project_members(user_id);

CREATE TABLE rooms (
    id                VARCHAR(36) PRIMARY KEY,
    project_id        VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
    id            VARCHAR(36) PRIMARY KEY,
    room_id       VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
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
