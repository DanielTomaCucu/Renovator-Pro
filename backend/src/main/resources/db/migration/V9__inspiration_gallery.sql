-- V9 — Galerie Inspirație (poze/randări/inspirații per cameră, CLAUDE.md backlog #4). O intrare = o
-- singură poză (URL extern SAU data URI base64 comprimată client-side — aceeași convenție ca
-- Item.imageUrl/Offer.images, fără upload/backend de fișiere real) + tip (Poză Proprie/Randare/
-- Inspirație Online) + notiță opțională.
--
-- Legată de project_id DIRECT (nu doar prin room_id): o poză NU trebuie ștearsă când camera ei e ștearsă
-- — rămâne în galerie, doar devine neasignată (secțiunea „General"), de asta room_id e nullable cu
-- ON DELETE SET NULL, nu CASCADE.

CREATE TABLE inspiration_images (
    id          VARCHAR(36) PRIMARY KEY,
    project_id  VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    room_id     VARCHAR(36) REFERENCES rooms(id) ON DELETE SET NULL,
    type        VARCHAR(24) NOT NULL,
    image       TEXT NOT NULL,
    caption     VARCHAR(300),
    source_url  VARCHAR(2048),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inspiration_images_project ON inspiration_images(project_id);
CREATE INDEX idx_inspiration_images_room ON inspiration_images(room_id);
