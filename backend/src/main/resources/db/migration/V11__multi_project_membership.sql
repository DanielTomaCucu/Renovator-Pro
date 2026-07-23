-- V11 — Multi-proiect per user (revizuire D4/D6 din docs/cerinte-autentificare.md): un user poate fi
-- membru al mai multor proiecte simultan, cu UN singur proiect "activ" per sesiune. Sesiunea (nu userul)
-- e cea care poartă proiectul activ — de-asta project_id se adaugă pe refresh_tokens, nu pe users:
-- comutarea de proiect (POST /api/auth/switch-project) rotește refresh token-ul spre noul proiect, fără
-- să atingă apartenențele existente.

-- joined_at: ordonare deterministă a proiectelor unui user (implicit la login = cel mai vechi, adică
-- "proiectul de-acasă") — coloană absentă până acum (project_members n-a avut niciodată nevoie de ea
-- cât timp era garantat un singur rând per user).
ALTER TABLE project_members ADD COLUMN joined_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE refresh_tokens ADD COLUMN project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE;

-- Backfill: la momentul acestei migrări, invarianta D4 (o singură apartenență per user) încă ținea peste
-- tot — deci JOIN-ul de mai jos potrivește cel mult un rând per token, sigur.
UPDATE refresh_tokens rt SET project_id = pm.project_id
  FROM project_members pm WHERE pm.user_id = rt.user_id;

-- Apărare defensivă: un refresh token al cărui user n-are nicio apartenență (teoretic imposibil azi) ar
-- rămâne fără project_id — mai bine invalidăm explicit tokenul decât să eșueze migrarea sau să rămână
-- o sesiune orfană.
DELETE FROM refresh_tokens WHERE project_id IS NULL;

ALTER TABLE refresh_tokens ALTER COLUMN project_id SET NOT NULL;
CREATE INDEX idx_refresh_tokens_project ON refresh_tokens(project_id);
