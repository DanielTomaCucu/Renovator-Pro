-- V5 — Faza 5: autentificare (username + parolă), refresh tokens, cod de invitație de proiect.
-- Decizii (docs/cerinte-autentificare.md): D1 login pe username (nu email, care rămâne dar devine opțional
-- și neutilizat); D6 partajarea proiectului printr-un cod de invitație generat leneș, nu la crearea proiectului.

-- Userul stub (seed V2) nu are username — îi dăm unul temporar, oricum nu va mai fi folosit după
-- adopția proiectului seed la primul register real (vezi RegisterUserService).
ALTER TABLE users ADD COLUMN username VARCHAR(40);
UPDATE users SET username = 'stub' WHERE username IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
-- Unicitate case-insensitive (username-urile se normalizează la lowercase înainte de a fi scrise,
-- dar indexul e o a doua linie de apărare independentă de disciplina codului aplicației).
CREATE UNIQUE INDEX idx_users_username_lower ON users (lower(username));

-- Emailul nu mai e obligatoriu (D1) — rămâne în schemă, neutilizat de fluxul curent.
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

CREATE TABLE refresh_tokens (
    id          VARCHAR(36) PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Codul de invitație (D6) se generează LENEȘ (la prima cerere a OWNER-ului din /setari), nu aici —
-- coloana rămâne NULL până atunci. Alfabet fără caractere ambigue (vezi SecureRandomInviteCodeGenerator),
-- unicitate impusă de index, verificată aplicativ înainte de scriere (retry pe coliziune improbabilă).
ALTER TABLE projects ADD COLUMN invite_code VARCHAR(16);
CREATE UNIQUE INDEX idx_projects_invite_code ON projects (invite_code) WHERE invite_code IS NOT NULL;
