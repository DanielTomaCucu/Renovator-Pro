# Jurnal de progres — Renovator Pro

> Reguli de întreținere a acestui fișier: vezi `CLAUDE.md` → secțiunea „Documentație vie”.
> Adaugi la final, nu rescrii istoricul. O intrare = o sesiune de lucru cu impact real pe cod.

## Registru de funcții (`src/lib/functions.ts`)

Actualizează acest tabel de fiecare dată când adaugi, ștergi sau redenumești o funcție din `functions.ts`
(sau dintr-un alt fișier de domeniu, ex. `auth-functions.ts`). La ștergere: rulează
`grep -rn "numeFunctie" src/` înainte, actualizează toate apelurile, apoi șterge rândul.

| Funcție | Ce face | Folosită în |
|---|---|---|
| `itemTotal(item)` | cantitate × preț unitar | `elemente`, `centralizator`, `analiza`, `functions.ts` intern |
| `totalEstimated(items)` | suma tuturor elementelor, indiferent de status | `elemente`, `centralizator`, `analiza` |
| `totalSpent(items)` | suma elementelor cu status „Cumpărat" | `elemente`, `centralizator`, `analiza` |
| `boughtCount(items)` | număr elemente „Cumpărat" | `elemente`, `analiza` |
| `purchaseProgress(items)` | % achiziții finalizate (0 dacă listă goală) | `elemente`, `centralizator` |
| `budgetRemaining(totalBudget, items)` | buget total − cheltuit | `analiza` |
| `itemsForRoom(items, roomId)` | filtrare elemente după cameră | `elemente`, `centralizator` |
| `roomSubtotal(items, roomId)` | total estimat al unei camere | `elemente`, `centralizator` |
| `roomSpent(items, roomId)` | cheltuit efectiv într-o cameră | `elemente` |
| `costPerRoom(rooms, items)` | distribuție cost pe cameră, sortată desc, fără camere goale | `analiza` (donut chart) |
| `costPerCategory(items)` | agregare {total, spent} per tip material, sortată desc | `analiza` (progress bars) |
| `donutSegments(data)` | transformă `{name, total}[]` în segmente cumulative (start/end 0–1) pt. SVG donut | `analiza` |
| `formatMoney(value, currency?)` | formatare Intl ro-RO, 2 zecimale, implicit EUR | peste tot unde se afișează bani |

## Jurnal cronologic

### 2026-07-10 — Setup inițial + design system + pagini de bază
- Inițializat proiect Next.js 16 (App Router, TypeScript, Tailwind 4) în `project-renovation/`.
- Implementate cele 4 pagini principale conform design-urilor din Stitch (proiect `14594146001803528847`): `/elemente`, `/centralizator`, `/analiza`, `/configurare`.
- Store client-side (`lib/store.tsx`) cu date mock (`lib/mock-data.ts`) — CRUD complet pentru `Room`/`Item`, cascade delete cameră → elemente.
- Componente reutilizabile: `Sidebar`, `StatCard`, `StatusChip`, `Drawer`, `ItemFormDrawer`, `RoomFormDrawer`, `ConfirmDialog`, `forms.tsx`.
- Fonturi configurate: Hanken Grotesk (headlines), Inter (body), JetBrains Mono (cifre/bani).
- Creat `CLAUDE.md` cu design system complet (fonturi, culori, iconițe, responsive), model de date, backlog.
- Adăugat `vercel.json` pentru deploy explicit pe Vercel.
- Push inițial pe `github.com/DanielTomaCucu/Renovator-Pro`.

### 2026-07-10 — Refactor: centralizare logică de business în `functions.ts`
**De ce:** calculele (totaluri, progres, subtotaluri pe cameră) erau duplicate/inline în fiecare pagină (`elemente`, `centralizator`, `analiza`), risc de divergență între implementări echivalente.

- Creat `src/lib/functions.ts` — toate funcțiile pure de business extrase din pagini + din `store.tsx`.
- `store.tsx` curățat: rămâne DOAR stare + CRUD (`itemTotal`/`formatMoney` mutate, nu mai există acolo).
- Toate cele 4 pagini actualizate să importe din `@/lib/functions` în loc să recalculeze inline.
- Adăugat `donutSegments()` — extrage logica donut chart din `/analiza` (elimina un `let acc` cu reassign în timpul render-ului, care dădea eroare de lint `react-hooks/immutability`).
- Fix `react-hooks/set-state-in-effect` în `ItemFormDrawer.tsx` și `RoomFormDrawer.tsx`: înlocuit `useEffect` de reset-formular cu pattern-ul oficial React „adjusting state during render" (comparare cu `prevOpen` ținut în state, fără efect).
- Fix escapare ghilimele românești în `/analiza` (`react/no-unescaped-entities`).
- Verificat: `npm run lint` → 0 erori, `npx tsc --noEmit` → 0 erori, testat vizual în browser (toate paginile randează corect, fără erori console după curățare cache Turbopack).
- Actualizat `CLAUDE.md`: regulă nouă „logica de business trăiește DOAR în `functions.ts`", explicație de ce (portabilitate spre Spring Boot + Flutter), reguli de organizare (funcție folosită în ≥2 locuri → obligatoriu extrasă, fișiere de domeniu separate dacă crește scope-ul, registru de funcții obligatoriu la orice adăugare/ștergere).
- Creat `docs/progress.md` (acest fișier) și `docs/api-contract.md`.

**Fișiere atinse:** `src/lib/functions.ts` (nou), `src/lib/store.tsx`, `src/app/elemente/page.tsx`, `src/app/centralizator/page.tsx`, `src/app/analiza/page.tsx`, `src/app/configurare/page.tsx`, `src/components/ItemFormDrawer.tsx`, `src/components/RoomFormDrawer.tsx`, `CLAUDE.md`.
