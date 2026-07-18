# Renovator Pro — Planificator Buget Renovare

Monorepo cu aplicația de management al bugetului pentru renovări de locuințe.

## Structură monorepo

```
project-renovation/
  frontend/    ← aplicația Next.js 16 (App Router, React 19, Tailwind 4) — conectată la backend-ul real prin store.tsx
  backend/     ← Spring Boot + PostgreSQL, arhitectură hexagonală (API REST complet — vezi blueprint-ul)
  docs/        ← documentație comună (contract API, jurnal de progres, blueprint backend)
```

## Frontend

```bash
cd frontend
npm install        # prima dată
npm run dev -- --port 3001   # portul 3000 e ocupat de alt proiect; folosește 3001
```

Deschide [http://localhost:3001](http://localhost:3001). Vezi `CLAUDE.md` (rădăcină) pentru convențiile de cod,
design system și workflow-ul Git obligatoriu.

Verificări înainte de a considera o schimbare gata (din `frontend/`):

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Backend

Spring Boot + PostgreSQL, arhitectură hexagonală. Fazele 0–7 finalizate (API REST complet, autentificare
JWT + partajare proiect prin cod de invitație, conectat la frontend, deployat pe Render + Supabase). Plan
complet în **[docs/backend-blueprint.md](docs/backend-blueprint.md)**.

Rulare locală: `cd backend && docker compose up -d && mvn spring-boot:run -Dspring-boot.run.profiles=dev`.
Pentru login/register local ai nevoie de `JWT_SECRET` — vezi `backend/.env.example` (pe `dev` are deja un
fallback, nu e obligatoriu de setat local).

## Documentație

- **[docs/audit-remedieri.md](docs/audit-remedieri.md)** — 🔴 probleme cunoscute + plan detaliat de remediere (de citit înainte de a lucra la fixuri).
- **[docs/cerinte-loading-states.md](docs/cerinte-loading-states.md)** — 🟡 specificație de implementat: skeleton la încărcarea paginii + spinner în butoane pe durata requesturilor.
- **[docs/cerinte-autentificare.md](docs/cerinte-autentificare.md)** — ✅ Faza 5 implementată (register/login pe username + parolă, JWT, autorizare pe membership, partajare proiect prin cod de invitație). Rămâne manual doar setarea `JWT_SECRET` pe Render (vezi „Deploy” mai jos).
- **[docs/cerinte-keepalive-render.md](docs/cerinte-keepalive-render.md)** — ✅ implementat (`.github/workflows/keepalive.yml`): keep-alive Render 08:00–21:00 (GitHub Actions cron; ~403 h/lună din cele 750 gratuite). Rămâne manual doar setarea variabilei `RENDER_APP_URL` (vezi „Deploy” mai jos).
- **[docs/backend-blueprint.md](docs/backend-blueprint.md)** — blueprint-ul oficial al backend-ului (arhitect-șef → executori).
- **[docs/api-contract.md](docs/api-contract.md)** — contractul API REST (sursă unică de adevăr pentru shape-uri).
- **[docs/progress.md](docs/progress.md)** — jurnal cronologic de schimbări + registru de funcții.

## Deploy (Vercel)

⚠️ **Pas manual necesar după această restructurare:** în setările proiectului Vercel, schimbă
**Root Directory → `frontend`** (Settings → General → Root Directory). Fără asta, build-ul Vercel nu mai găsește
aplicația Next.js, fiindcă a fost mutată din rădăcină în `frontend/`.

## Deploy (Render) — Faza 5

⚠️ **Pas manual necesar:** în Render → serviciul backend → Environment, adaugă `JWT_SECRET` (generat, ex.
`openssl rand -base64 48`) — fără el, backend-ul nu pornește pe prod (`application.yml` cere explicit
`${JWT_SECRET}`, fără fallback, la fel ca `APP_CORS_ALLOWED_ORIGINS`). CORS-ul deja acceptă cookie-uri
cross-site (`allowCredentials`); cookie-ul de refresh pleacă `Secure; SameSite=None` automat pe orice
profil diferit de `dev`. **De verificat manual după deploy, pe Safari/iOS** — ITP poate bloca cookie-uri
third-party chiar cu `SameSite=None`; dacă se confirmă, e nevoie de o decizie separată (nu se improvizează,
vezi `docs/cerinte-autentificare.md` AUTH-6).

### Keep-alive (`.github/workflows/keepalive.yml`)

Ping automat pe `/actuator/health` la fiecare ~10 minute, doar în fereastra **08:00–21:00** (ora României) —
ține treaz backend-ul Render (spin-down după 15 min de inactivitate pe planul gratuit) și, implicit, DB-ul
Supabase. ⚠️ **Pas manual necesar:** GitHub → repo → Settings → Secrets and variables → Actions → tab
**Variables** → **New repository variable** → `RENDER_APP_URL` = URL-ul public al serviciului Render
(ex. `https://renovator-pro-backend.onrender.com`, fără slash final). Fără această variabilă, workflow-ul
rulează dar pasul de ping eșuează explicit.

Test manual: Actions → „Keep-alive Render” → **Run workflow**. Dacă workflow-ul rămâne inactiv 60 de zile,
GitHub îl dezactivează automat — reactivare din Actions → workflow → **Enable workflow**.
