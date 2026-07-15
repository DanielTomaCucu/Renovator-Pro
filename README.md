# Renovator Pro — Planificator Buget Renovare

Monorepo cu aplicația de management al bugetului pentru renovări de locuințe.

## Structură monorepo

```
project-renovation/
  frontend/    ← aplicația Next.js 16 (App Router, React 19, Tailwind 4) — UI cu date mock (client-side store)
  backend/     ← Spring Boot + PostgreSQL, arhitectură hexagonală (NEÎNCEPUT — vezi blueprint-ul)
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

Neimplementat încă. Planul complet de implementare (faze + task-uri, arhitectură hexagonală, securitate,
schema PostgreSQL) e în **[docs/backend-blueprint.md](docs/backend-blueprint.md)**. Faza 0 (această restructurare
în monorepo) e finalizată; Faza 1 (schelet Spring Boot) urmează.

## Documentație

- **[docs/backend-blueprint.md](docs/backend-blueprint.md)** — blueprint-ul oficial al backend-ului (arhitect-șef → executori).
- **[docs/api-contract.md](docs/api-contract.md)** — contractul API REST (sursă unică de adevăr pentru shape-uri).
- **[docs/progress.md](docs/progress.md)** — jurnal cronologic de schimbări + registru de funcții.

## Deploy (Vercel)

⚠️ **Pas manual necesar după această restructurare:** în setările proiectului Vercel, schimbă
**Root Directory → `frontend`** (Settings → General → Root Directory). Fără asta, build-ul Vercel nu mai găsește
aplicația Next.js, fiindcă a fost mutată din rădăcină în `frontend/`.
