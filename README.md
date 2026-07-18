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

Spring Boot + PostgreSQL, arhitectură hexagonală. Fazele 0–4, 6, 7 finalizate (API REST complet, conectat la frontend,
deployat pe Render + Supabase). **Faza 5 (autentificare) amânată intenționat** — se face ultima. Plan complet în
**[docs/backend-blueprint.md](docs/backend-blueprint.md)**.

Rulare locală: `cd backend && docker compose up -d && mvn spring-boot:run -Dspring-boot.run.profiles=dev`.

## Documentație

- **[docs/audit-remedieri.md](docs/audit-remedieri.md)** — 🔴 probleme cunoscute + plan detaliat de remediere (de citit înainte de a lucra la fixuri).
- **[docs/cerinte-loading-states.md](docs/cerinte-loading-states.md)** — 🟡 specificație de implementat: skeleton la încărcarea paginii + spinner în butoane pe durata requesturilor.
- **[docs/cerinte-autentificare.md](docs/cerinte-autentificare.md)** — 🟡 ticketele Fazei 5 (register/login cu nume + parolă + numele proiectului, JWT, autorizare pe membership).
- **[docs/cerinte-keepalive-render.md](docs/cerinte-keepalive-render.md)** — 🟡 keep-alive Render 08:00–21:00 (GitHub Actions cron; ~403 h/lună din cele 750 gratuite).
- **[docs/backend-blueprint.md](docs/backend-blueprint.md)** — blueprint-ul oficial al backend-ului (arhitect-șef → executori).
- **[docs/api-contract.md](docs/api-contract.md)** — contractul API REST (sursă unică de adevăr pentru shape-uri).
- **[docs/progress.md](docs/progress.md)** — jurnal cronologic de schimbări + registru de funcții.

## Deploy (Vercel)

⚠️ **Pas manual necesar după această restructurare:** în setările proiectului Vercel, schimbă
**Root Directory → `frontend`** (Settings → General → Root Directory). Fără asta, build-ul Vercel nu mai găsește
aplicația Next.js, fiindcă a fost mutată din rădăcină în `frontend/`.
