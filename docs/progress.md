# Jurnal de progres — Renovator Pro

> Reguli de întreținere a acestui fișier: vezi `CLAUDE.md` → secțiunea „Documentație vie”.
> Adaugi la final, nu rescrii istoricul. O intrare = o sesiune de lucru cu impact real pe cod.

## Registru de funcții

Actualizează acest tabel de fiecare dată când adaugi, ștergi sau redenumești o funcție (locală de pagină
SAU din `src/shared/functions/`). La ștergere: rulează `grep -rn "numeFunctie" src/` înainte, actualizează
toate apelurile, apoi șterge rândul. Coloana „Locație” spune dacă e locală unei pagini (candidat la
promovare în shared dacă mai apare nevoie de ea în altă parte) sau deja partajată.

| Funcție | Fișier / Locație | Ce face | Folosită în |
|---|---|---|---|
| `formatMoney(value, currency?)` | `shared/functions/money.ts` | formatare Intl ro-RO, 2 zecimale, implicit `Currency.EUR` | peste tot unde se afișează bani |
| `itemTotal(item)` | `shared/functions/items.ts` | cantitate × preț unitar | `elemente`, `centralizator`, `analiza`, intern în `items.ts`/`charts.ts` |
| `totalEstimated(items)` | `shared/functions/items.ts` | suma tuturor elementelor, indiferent de status | `elemente`, `centralizator`, `analiza` |
| `totalSpent(items)` | `shared/functions/items.ts` | suma elementelor cu status `ItemStatus.Cumparat` | `elemente`, `centralizator`, `analiza`, intern în `budget.ts` |
| `boughtCount(items)` | `shared/functions/items.ts` | număr elemente `ItemStatus.Cumparat` | `elemente`, `analiza`, intern în `items.ts` (purchaseProgress) |
| `purchaseProgress(items)` | `shared/functions/items.ts` | % achiziții finalizate (0 dacă listă goală) | `elemente`, `centralizator` |
| `itemsForRoom(items, roomId)` | `shared/functions/items.ts` | filtrare elemente după cameră | `elemente`, `centralizator`, intern (roomSubtotal, roomSpent) |
| `roomSubtotal(items, roomId)` | `shared/functions/items.ts` | total estimat al unei camere | `elemente`, `centralizator`, intern în `charts.ts` (costPerRoom) |
| `roomSpent(items, roomId)` | `shared/functions/items.ts` | cheltuit efectiv într-o cameră | `elemente` |
| `budgetRemaining(totalBudget, items)` | `shared/functions/budget.ts` | buget total − cheltuit | `analiza` |
| `costPerRoom(rooms, items)` | `shared/functions/charts.ts` | distribuție cost pe cameră, sortată desc, fără camere goale | `analiza` (donut chart) |
| `costPerCategory(items)` | `shared/functions/charts.ts` | agregare {total, spent} per `MaterialType`, sortată desc | `analiza` (progress bars) |
| `donutSegments(data)` | `shared/functions/charts.ts` | transformă `{name, total}[]` în `DonutSegment[]` cumulative (start/end 0–1) pt. SVG donut | `analiza` |

_Momentan nu există funcții locale de pagină — orice calcul existent e deja folosit în ≥2 locuri, deci
toate au fost promovate direct în shared. Prima funcție cu adevărat locală va porni într-un fișier în
folderul paginii respective (vezi CLAUDE.md → „Funcții și tipuri per pagină")._

## Registru de tipuri (`src/shared/types/`, un fișier per tip)

| Tip | Fișier | Fel |
|---|---|---|
| `RoomType` | `RoomType.ts` | enum |
| `ItemStatus` | `ItemStatus.ts` | enum |
| `MaterialType` | `MaterialType.ts` | enum |
| `Currency` | `Currency.ts` | enum |
| `Room` | `Room.ts` | interface |
| `Item` | `Item.ts` | interface |
| `Project` | `Project.ts` | interface |
| `RenovationStore` | `RenovationStore.ts` | interface |
| `DonutSegment` | `DonutSegment.ts` | interface |

Tipuri locale de pagină (nu în `shared/`, deocamdată folosite într-un singur loc):

| Tip | Fișier | Pagină |
|---|---|---|
| `DeleteTarget` | `src/app/elemente/DeleteTarget.ts` | `/elemente` |
| `ItemDrawerState` | `src/app/elemente/ItemDrawerState.ts` | `/elemente` |

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

### 2026-07-10 — Extragere iconițe reale din Stitch + `icons.ts`
**De ce:** iconițele listate inițial în `CLAUDE.md` (secțiunea Iconițe) erau presupuneri, nu extrase din design. Userul a cerut extragerea reală din HTML-ul generat de Stitch, ca referință de folosit la implementare.

- Descărcat HTML-ul a 6+ ecrane Stitch (desktop + mobil: Elemente de Cumpărat, Tabel Centralizator, Analiză Bugetară — variante Meniu Restrâns / Premium Black Theme, Volet Adăugare Cameră) și extras toate ocurențele `material-symbols-outlined`.
- Actualizat `CLAUDE.md` → secțiunea „Iconițe” cu tabele complete, verificate, grupate pe: navigare sidebar, tipuri de cameră, acțiuni CRUD & formulare, status elemente, export/document, pagina Analiză. Adăugat și snippet de setup (Google Fonts link / pachet npm `material-symbols`).
- Creat `src/lib/icons.ts` — mapare centralizată nume-Material-Symbol (`NAV_ICONS`, `ROOM_TYPE_ICONS`, `ACTION_ICONS`, `STATUS_ICONS`, `DOCUMENT_ICONS`, `ANALYTICS_ICONS`), ca implementarea viitoare (backlog item 2: „Înlocuire emoji cu Material Symbols”) să importe din acest fișier, nu să hardcodeze string-uri de iconiță în JSX.
- **Nu s-a schimbat încă UI-ul** — emoji-urile din componente rămân placeholder până la implementarea efectivă a înlocuirii (task separat, backlog item 2). Acest pas a produs doar referința + fișierul de mapare.

**Fișiere atinse:** `CLAUDE.md`, `src/lib/icons.ts` (nou).

### 2026-07-10 — Restructurare majoră: `shared/`, enums în loc de string-uri, tipuri per fișier, workflow de branch
**De ce:** userul a cerut patru schimbări de convenție simultan: (1) niciun string brut unde poate exista un tip/interfață — statusuri, tipuri de cameră/material, monedă devin enums verificate de compilator; (2) un fișier separat per interfață/enum; (3) funcțiile de pagină pornesc local în folderul paginii și migrează în shared doar când sunt reutilizate, nu direct într-un fișier mare; (4) niciun push direct pe `main` — totul prin branch numerotat, pentru review.

- **Enums noi** în `src/shared/types/`: `RoomType`, `ItemStatus`, `MaterialType`, `Currency` — chei fără diacritice (`RoomType.Bucatarie`), valori cu diacritice (`"Bucătărie"`). Înlocuiesc toate comparațiile/atribuirile cu string literal din `mock-data.ts`, `functions.ts` (acum `charts.ts`/`items.ts`), `StatusChip.tsx`, `ItemFormDrawer.tsx`, `RoomFormDrawer.tsx`, `analiza/page.tsx`.
- **`src/lib/` șters complet**, înlocuit cu **`src/shared/`**:
  - `shared/types/` — un fișier per interfață/enum: `RoomType.ts`, `ItemStatus.ts`, `MaterialType.ts`, `Currency.ts`, `Room.ts`, `Item.ts`, `Project.ts`, `RenovationStore.ts` (extras din `store.tsx`), `DonutSegment.ts` (extras din `charts.ts`), plus `index.ts` barrel.
  - `shared/functions/` — fostul `functions.ts` unic, împărțit pe domeniu: `money.ts`, `items.ts`, `budget.ts`, `charts.ts`, plus `index.ts` barrel.
  - `shared/store.tsx`, `shared/mock-data.ts`, `shared/icons.ts` — mutate 1:1, actualizate să folosească enums.
- **Tipuri locale de pagină**: create `src/app/elemente/DeleteTarget.ts` și `ItemDrawerState.ts` — stare de UI specifică paginii Elemente, care înainte era un union type inline (`{ kind: "item" | "room"; ... } | null`) direct în `page.tsx`.
- Toate importurile din `app/` și `components/` actualizate de la `@/lib/*` la `@/shared/*` (`grep -rln "@/lib" src/` → 0 rezultate după refactor).
- `RoomFormDrawer.tsx`: am încercat inițial să folosesc clasa `material-symbols-outlined` direct (profitând de `ROOM_TYPE_ICONS` din `icons.ts`), dar fontul Material Symbols nu e încărcat încă în `layout.tsx` — ar fi afișat text literal („bed”) în loc de iconiță. Revenit la emoji, dar tipate pe enum (`ROOM_TYPE_EMOJI: Record<RoomType, string>`), cu TODO explicit spre `ROOM_TYPE_ICONS` când se face migrarea reală (backlog item 2).
- Verificat: `npm run lint` → 0 erori, `npx tsc --noEmit` → 0 erori, testat vizual în browser toate cele 4 pagini + adăugare cameră (grid 6 tipuri din `RoomType` afișat corect) — zero erori console după curățare cache Turbopack.
- **Workflow Git nou**: pornit branch `003-shared-structure-and-enums` din `main` înainte de orice modificare; push-ul acestei sesiuni merge pe branch, NU pe `main` — userul face review.
- `CLAUDE.md` rescris substanțial: secțiune nouă „Workflow Git — OBLIGATORIU”, „Regula de aur #1” (enums, nu string-uri) cu explicație + listă completă de enums/interfețe, „Regula de aur #2” actualizată (funcții locale de pagină → migrare la a doua utilizare, nu direct în shared), structura de foldere actualizată complet.
- `docs/progress.md`: Registrul de funcții extins cu coloană „Fișier/Locație”, adăugat Registru de tipuri nou (un rând per fișier din `shared/types/` + tipuri locale de pagină).

**Fișiere atinse:** toate din `src/lib/*` (șterse) → `src/shared/**` (create: 9 fișiere types + index, 4 fișiere functions + index, store.tsx, mock-data.ts, icons.ts), `src/app/elemente/DeleteTarget.ts` (nou), `src/app/elemente/ItemDrawerState.ts` (nou), `src/app/elemente/page.tsx`, `src/app/centralizator/page.tsx`, `src/app/analiza/page.tsx`, `src/app/configurare/page.tsx`, `src/app/layout.tsx`, `src/components/StatusChip.tsx`, `src/components/ItemFormDrawer.tsx`, `src/components/RoomFormDrawer.tsx`, `CLAUDE.md`, `docs/progress.md`.

**Branch:** `003-shared-structure-and-enums` (nu pe `main` — în așteptarea review-ului userului).
