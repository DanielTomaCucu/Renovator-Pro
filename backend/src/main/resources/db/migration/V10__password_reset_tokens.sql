-- V10 — Resetare parolă (mod dev: tokenul e expus direct în răspunsul API, nu trimis prin email real —
-- proiectul n-are niciun serviciu de email configurat). Pattern identic cu refresh_tokens: valoare opacă
-- generată random, stocată DOAR hash-uită, cu expirare scurtă și marcaj de folosire unică.

CREATE TABLE password_reset_tokens (
    id          VARCHAR(36) PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
