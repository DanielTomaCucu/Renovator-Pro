-- V2 — seed temporar: un user „stub" + un proiect implicit.
-- De ce: schema cere `projects.owner_id NOT NULL REFERENCES users(id)`, dar autentificarea reală
-- (înregistrare/login) nu există încă — vine în Faza 5. Până atunci, aplicația e single-project,
-- single-user (conform frontend-ului actual, care are un singur proiect mock). ID-urile sunt fixe
-- și cunoscute, ca use case-urile din Faza 3 să poată opera pe „proiectul curent" fără auth.
--
-- La Faza 5 (Task 5.1/5.2): acest user stub e înlocuit de fluxul real de register/login; proiectul
-- rămâne (userul real devine owner la primul login, sau se creează un proiect nou per user — decizie
-- la momentul respectiv). Acest seed NU e o soluție de producție, e o punte până la auth.

INSERT INTO users (id, email, password_hash, display_name, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'stub@renovatorpro.local', 'stub-no-login-until-faza-5', 'Utilizator Implicit', now());

INSERT INTO projects (id, title, total_budget, currency, total_area, owner_id)
VALUES ('00000000-0000-0000-0000-000000000010', 'Proiectul Meu', 0, 'EUR', NULL, '00000000-0000-0000-0000-000000000001');
