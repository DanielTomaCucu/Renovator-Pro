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
| `budgetEfficiency(estimated, spent)` | `shared/functions/budget.ts` | % din estimat efectiv cheltuit (0 dacă nu există estimat) | `centralizator` |
| `costPerRoom(rooms, items)` | `shared/functions/charts.ts` | distribuție cost pe cameră, sortată desc, fără camere goale | `analiza` (donut chart) |
| `costPerCategory(items)` | `shared/functions/charts.ts` | agregare {total, spent} per `MaterialType`, sortată desc | `analiza` (progress bars) |
| `donutSegments(data)` | `shared/functions/charts.ts` | transformă `{name, total}[]` în `DonutSegment[]` cumulative (start/end 0–1) pt. SVG donut | `analiza` |

### Funcții locale de pagină

| Funcție | Fișier / Locație | Ce face | Folosită în |
|---|---|---|---|
| `hasFloorConfig(room)` | `app/configurare/dimensions.ts` | `true` dacă material + suprafață pardoseală sunt completate | `configurare`, intern în `dimensions.ts` |
| `floorMaterialNeeded(room)` | `app/configurare/dimensions.ts` | necesar material pardoseală, +10% pierdere tăiere | `configurare` |
| `baseboardLength(room)` | `app/configurare/dimensions.ts` | plintă = (perimetru − lățime ușă) + 5% pierdere | `configurare` |
| `wallTilingArea(room)` | `app/configurare/dimensions.ts` | suprafață faianță pe pereții placați, minus golul ușii dacă e pe un perete placat, +10% pierdere | `configurare` |
| `doorWallBaseboardLength(room)` | `app/configurare/dimensions.ts` | plintă specifică peretelui cu ușă (relevant doar cu placare pereți) | `configurare` |
| `projectTechnicalSummary(rooms)` | `app/configurare/dimensions.ts` | suprafață utilă totală + % camere complet configurate | `configurare` (card „Sumar Proiect”, bara de progres) |

## Registru de tipuri (`src/shared/types/`, un fișier per tip)

| Tip | Fișier | Fel |
|---|---|---|
| `RoomType` | `RoomType.ts` | enum |
| `ItemStatus` | `ItemStatus.ts` | enum |
| `MaterialType` | `MaterialType.ts` | enum |
| `Currency` | `Currency.ts` | enum |
| `FlooringType` | `FlooringType.ts` | enum (Parchet Laminat / Gresie / Mochetă) |
| `TileSize` | `TileSize.ts` | enum |
| `InstallationType` | `InstallationType.ts` | enum |
| `Wall` | `Wall.ts` | enum (N/E/S/V) |
| `RoomDoor` | `RoomDoor.ts` | interface (width, height, wall) |
| `WallTiling` | `WallTiling.ts` | interface (tiledWallsCount, tileHeight, wallLengths per `Wall`) |
| `Room` | `Room.ts` | interface (extins cu `floorMaterial?`, `floorArea?`, `perimeter?`, `tileSize?`, `installationType?`, `door?: RoomDoor`, `wallTiling?: WallTiling`) |
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

### 2026-07-12 — Corectare `ROOM_TYPE_ICONS` după verificare directă în Stitch
**De ce:** userul a semnalat că iconițele tipurilor de cameră din `src/shared/icons.ts` nu sunt corecte. Verificare: am descărcat HTML-ul a 12+ ecrane Stitch (proiect `14594146001803528847`) și am extras toate ocurențele `material-symbols-outlined`. Grid-ul de selecție tip cameră apare în două ecrane cu seturi diferite — cel vechi („Elemente de Cumpărat - cu Volet Adăugare Cameră Deschis") și cel din seria „Precision Blueprint" (ultima din listă, deci varianta finală de design system). Userul a confirmat explicit că Precision Blueprint e sursa de adevăr.

- `ROOM_TYPE_ICONS` (`src/shared/icons.ts`) actualizat: `Dormitor` `bed`→`king_bed`, `Baie` `shower`→`bathtub`, `Bucatarie` `kitchen`→`soup_kitchen`. `Living` (`chair`), `Terasa` (`deck`), `Balcon` (`balcony`) rămân neschimbate — confirmate identice în ambele ecrane.
- Restul mapărilor din `icons.ts` (`NAV_ICONS`, `ACTION_ICONS`, `STATUS_ICONS`, `DOCUMENT_ICONS`, `ANALYTICS_ICONS` — cu excepția `economii`/`actualizare`/`overview`, pentru care n-am găsit încă un ecran de referință) au fost verificate din nou direct în HTML și confirmate corecte, nemodificate.
- `CLAUDE.md` → tabelul „Tipuri de cameră” actualizat cu aceleași valori.
- **Fără impact vizual în UI**: `ROOM_TYPE_ICONS` nu e importat nicăieri încă (backlog item 2, migrare emoji → Material Symbols, netratată). `RoomFormDrawer.tsx` folosește în continuare `ROOM_TYPE_EMOJI` (placeholder emoji), neschimbat.

**Fișiere atinse:** `src/shared/icons.ts`, `CLAUDE.md`, `docs/progress.md`.

### 2026-07-12 — Implementare completă design „Configurare Apartament” (Stitch) + prima migrare reală la Material Symbols
**De ce:** userul a cerut implementarea integrală a designului Stitch pentru pagina `/configurare` (ecranul „Configurare Apartament (Mobile)”, proiect `14594146001803528847`), nu doar o listă simplă de camere cu buget alocat.

- **Model de date extins**: `Room` (`src/shared/types/Room.ts`) primește câmpuri tehnice opționale — `length`, `width`, `height`, `flooringType?: FlooringType`, `hasStandardDoorGap?: boolean`. Opționale intenționat: o cameră nouă n-are configurare tehnică până când userul o completează explicit.
- **Enum nou**: `FlooringType` (`Parchet` | `Gresie`) în `src/shared/types/FlooringType.ts`.
- **Funcții noi, locale paginii** (prima utilizare reală a regulii „local până la a 2-a folosire” — vezi Registrul de funcții de mai sus): `src/app/configurare/dimensions.ts` — `hasTechnicalSpecs`, `floorArea`, `perimeter`, `flooringLossArea`, `baseboardLength`, `wallArea`, `projectDimensionsSummary`, `estimatedMaterialCost`. Formulele de suprafață/perimetru sunt geometrie exactă; costul estimat de materiale folosește rate placeholder (120 RON/m² pardoseală, 45 RON/m² pereți) — nu vine din catalogul `Item`/`MaterialType`, e doar o estimare rapidă afișată în modalul de calcule, documentată explicit ca atare în cod.
- **Prima migrare reală de la emoji la Material Symbols** (backlog item 2, dar scopată strict la pagina asta): font-ul Material Symbols Outlined e acum încărcat global în `src/app/layout.tsx` (`<link>` în `<head>`), plus regula CSS `.material-symbols-outlined` în `globals.css`. Restul aplicației (Sidebar, RoomFormDrawer, StatusChip) rămâne neatins — încă emoji, migrare completă e task separat.
- **Iconițe noi** în `src/shared/icons.ts`: `FLOORING_TYPE_ICONS` (`texture`/`grid_view`) și `TECHNICAL_ICONS` (`projectEfficiency`, `doorGap`, `wallTile`, `emptySpecs`, `detailedCalc`) — extrase din HTML-ul ecranului Stitch.
- **Componente noi** (`src/app/configurare/`): `RoomTechnicalCard.tsx` (card per cameră — stare goală cu CTA „Editează Acum” dacă nu are dimensiuni, altfel formular complet: 3 inputuri dimensiuni, selector tip pardoseală cu pierdere afișată live, 2 toggle-uri — „Gol Ușă Standard” funcțional, „Faianță Pereți” dezactivat intenționat ca în design, feature neimplementată), `CalculationModal.tsx` (modal cu toate rândurile de calcul + total estimat în RON), `MobileBottomNav.tsx` (navigare inferioară doar pe mobil, `md:hidden`, tab „Setări” dezactivat — nu există încă pagina).
- **`page.tsx` rescris**: header sticky cu titlu + căutare + avatar, card „Sumar Proiect” (total mp/ml + eficiență materiale, recalculate live din `projectDimensionsSummary`), secțiunea de buget per cameră păstrată din varianta anterioară, listă de `RoomTechnicalCard`, buton flotant (+) pentru adăugare cameră (redeschide `RoomFormDrawer` existent, nu un component nou).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (după fix `display=swap` + `eslint-disable` documentat pt. `no-page-custom-font`, regulă gândită pt. Pages Router, fals-pozitiv în App Router). Testat vizual în browser: completare dimensiuni + selectare parchet → recalculare live corectă a cardului și a sumarului de proiect, toggle „Gol Ușă Standard” funcțional, modal de calcule detaliate afișează toate rândurile cu semnul/culoarea corectă, responsive mobil (375px) cu bottom nav vizibil și sidebar ascuns — zero erori în consolă.

**Fișiere atinse:** `src/shared/types/FlooringType.ts` (nou), `src/shared/types/Room.ts`, `src/shared/types/index.ts`, `src/shared/icons.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/configurare/dimensions.ts` (nou), `src/app/configurare/RoomTechnicalCard.tsx` (nou), `src/app/configurare/CalculationModal.tsx` (nou), `src/app/configurare/MobileBottomNav.tsx` (nou), `src/app/configurare/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic` (din `003-shared-structure-and-enums`, nu pe `main` — în așteptarea review-ului userului).

> ⚠️ **Corectat în intrarea următoare**: implementarea de mai sus s-a bazat pe ecranul Stitch greșit (mobil,
> „Configurare Apartament (Mobile)"). Userul a clarificat că sursa de adevăr pentru paginile aplicației e
> varianta desktop. Modelul de date (`length`/`width`/`height`/`flooringType`/`hasStandardDoorGap`),
> `dimensions.ts`, `RoomTechnicalCard.tsx`, `CalculationModal.tsx` și `MobileBottomNav.tsx` din intrarea de
> mai sus au fost **înlocuite complet** — vezi jos. Las intrarea originală neștearsă (regula fișierului: nu
> rescrie istoricul), dar codul descris acolo nu mai există în branch.

### 2026-07-12 — Rescriere „Configurare Apartament” pe baza ecranului desktop corect + model tehnic complet
**De ce:** userul a corectat sesiunea anterioară — trebuia folosit ecranul Stitch **desktop** „Configurare Tehnică - Layout Optimizat Rezultate" (titlu intern „Renovator Pro - Configurare Tehnică Apartament"), nu varianta mobilă folosită greșit înainte. Modelul tehnic din ecranul corect e mult mai bogat: material pardoseală cu 3 opțiuni, mărime plăci, tip montaj, configurare ușă (lățime/înălțime/perete), și — doar la camerele cu zonă umedă — placare detaliată pe 4 pereți (N/E/S/V) cu înălțime și lungimi individuale. Rezultatele (plintă, faianță, material pardoseală) sunt afișate cu formulă + calcul, nu doar valoarea finală.

- **Model de date rescris** (`Room.ts`): șterse complet câmpurile din varianta mobilă greșită (`length`, `width`, `height`, `hasStandardDoorGap`). Adăugate: `floorMaterial?: FlooringType`, `floorArea?: number` (mp, input direct — nu calculat din lungime×lățime, ecranul desktop nu are aceste inputuri), `perimeter?: number` (ml — adăugare deliberată față de mockup: ecranul desktop nu are un input explicit de perimetru, dar fără el „Plintă” ar fi un număr decorativ, nu un calcul real; am preferat un calculator funcțional unei fidelități literale cu date fictive), `tileSize?: TileSize`, `installationType?: InstallationType`, `door?: RoomDoor`, `wallTiling?: WallTiling`.
- **Enums/interfețe noi** în `src/shared/types/`: `FlooringType` (rescris: „Parchet Laminat" / „Gresie" / „Mochetă" — 3 opțiuni reale din `<select>`-ul Stitch, nu cele 2 ghicite greșit înainte), `TileSize` (4 praguri de dimensiune plăci), `InstallationType` (Drept/Diagonal/Herringbone), `Wall` (N/E/S/V), `RoomDoor` (width, height, wall), `WallTiling` (tiledWallsCount, tileHeight, wallLengths per `Wall`).
- **Funcții de calcul rescrise** (`app/configurare/dimensions.ts`, tot locale paginii — vezi Registrul de funcții): `hasFloorConfig`, `floorMaterialNeeded` (+10% pierdere), `baseboardLength` ((perimetru − lățime ușă) + 5% pierdere), `wallTilingArea` (sumă pereți placați × înălțime, minus golul ușii dacă ușa e pe un perete placat, +10% pierdere), `doorWallBaseboardLength` (plinta specifică peretelui cu ușă), `projectTechnicalSummary` (suprafață utilă totală + % camere configurate). Toate formulele verificate manual pe datele mock (ex. Baie: faianță 3 pereți = 18.61 mp, plintă perete V = 1.52 ml — coincide exact cu exemplul din mockup Stitch).
- **`RoomTechnicalCard.tsx` rescris complet**: card colapsabil (buton, nu `<details>` nativ, pentru control React) cu rând de sumar când e închis (mp, material, plintă), secțiune „1. Configurare Tehnică" (Pardoseală: material/suprafață/perimetru/mărime plăci/tip montaj; Configurare Detaliată Placări — opțională, activabilă per cameră cu buton „+ Adaugă placare pereți", 4 inputuri de lungime pe perete; Configurare Ușă: lățime/înălțime/perete), secțiune „Schiță & Rezultat" cu placeholder de schiță + panou „Calcule Detaliate" ce afișează fiecare rezultat cu formula și calculul explicit (ex. „Formulă: (Perimetru − lățime ușă) + 5% pierdere / Calcul: (9.30 − 0.80) × 1.05 = 8.93 ml"). Ștergere cameră prin `ConfirmDialog` existent (nu `window.confirm`).
- **Șterse**: `CalculationModal.tsx` (rezultatele sunt acum inline în card, nu într-un modal separat — modelul desktop le arată direct în layout, nu ascunse după un click) și `MobileBottomNav.tsx` (userul a cerut explicit focus pe desktop; navigarea mobilă rămâne cea existentă din `Sidebar.tsx`, neatinsă).
- **`page.tsx` rescris**: header cu tab-uri „Măsurători" (activ) / „Materiale" (inert, pagina nu există), căutare (decorativă, fără funcționalitate încă), card „Sumar Tehnic Global" (proiect curent, suprafață utilă totală, status derivat din progres — Neînceput/În Lucru/Finalizat, buget total, bară de progres calculată din `projectTechnicalSummary`), listă de `RoomTechnicalCard` + rândul de buget alocat per cameră (păstrat din implementarea originală, nu există pe ecranul tehnic dar e funcționalitate reală existentă în `Room.allocatedBudget`), stare goală „Adaugă Cameră Nouă" (dashed box, deschide `RoomFormDrawer` existent). **Nu am adăugat** butonul „Salvare Plan" din mockup — store-ul scrie deja instant la fiecare modificare (`updateRoom`), un buton de „salvare" separat ar fi minciună vizuală (nimic de salvat suplimentar).
- **Fix iconiță**: `floorplan` (folosită inițial pentru placeholder-ul de schiță) nu există în setul Material Symbols — apărea ca tofu/glyph lipsă în browser. Înlocuită cu `design_services` (verificat vizual, se randează corect).
- `mock-data.ts`: adăugat exemplu complet de configurare tehnică pe „Baie Principală" (cu placare 3 pereți, ca în mockup) și „Living & Dining" (doar pardoseală + ușă, fără placare) — restul camerelor rămân neconfigurate, pentru a arăta ambele stări (empty state + formular completat).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual în browser (desktop, 1057px+): toate cele 4 rezultate calculate corect (verificate manual), toggle placare pereți, ștergere cameră cu confirmare, buton „Adaugă Cameră Nouă" deschide drawer-ul existent — zero erori în consolă (după restart server, cache-ul Turbopack avea referințe stale către fișierele șterse).

**Fișiere atinse:** `src/shared/types/FlooringType.ts` (rescris), `src/shared/types/TileSize.ts` (nou), `src/shared/types/InstallationType.ts` (nou), `src/shared/types/Wall.ts` (nou), `src/shared/types/RoomDoor.ts` (nou), `src/shared/types/WallTiling.ts` (nou), `src/shared/types/Room.ts` (rescris), `src/shared/types/index.ts`, `src/shared/icons.ts`, `src/shared/mock-data.ts`, `src/app/configurare/dimensions.ts` (rescris), `src/app/configurare/RoomTechnicalCard.tsx` (rescris), `src/app/configurare/CalculationModal.tsx` (șters), `src/app/configurare/MobileBottomNav.tsx` (șters), `src/app/configurare/page.tsx` (rescris), `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic` (continuare pe același branch — nu pe `main`).

### 2026-07-12 — Sidebar global rescris după Stitch (expandat + colaps), restul paginilor neatins
**De ce:** userul a cerut ca meniul principal (stânga, global pe toate paginile) să fie identic cu ecranele Stitch „Tabel Centralizator - Redesign Carduri Rezumat Premium" (stare expandată) și „Tabel Centralizator - Meniu Restrâns Premium" (stare colapsată) — explicit doar meniul, nu restul conținutului paginilor.

- Descărcat HTML-ul ambelor ecrane și extras markup-ul exact al `<aside>`: expandat `w-72`/`p-6`, colaps `w-20`/`p-4`, logo pătrat `bg-primary` cu iconița `architecture` (FILL 1), 5 iteme de navigare (al 5-lea, „Galerie Inspirație", nou față de sidebar-ul vechi), buton „Adaugă Cameră", „Setări", buton de colaps cu iconița `menu_open` care se rotește 180°.
- **`src/components/Sidebar.tsx` rescris complet**: stare de colaps prin `useState` (React, nu scriptul JS din mockup), lățime/padding animate cu `transition-all duration-300`. Etichetă activă pe ruta curentă cu fundal `bg-secondary/10 text-secondary` (echivalentul cel mai apropiat din paleta existentă pentru `secondary-fixed` din mockup, care nu există ca token în acest proiect).
- **Decizii de scop, ca să nu introduc funcționalitate falsă:**
  - „Galerie Inspirație" și „Setări" — pagini inexistente încă (confirmate în backlog `CLAUDE.md`) — randate ca iteme inerte (`opacity-50`, `cursor-not-allowed`, fără `href`), nu linkuri moarte.
  - Butonul „Adaugă Cameră" din sidebar duce la `/configurare` (unde adăugarea de cameră chiar există), nu deschide un drawer global nou — a lifta `RoomFormDrawer` la nivel de layout ar fi o schimbare de arhitectură dincolo de „doar meniul", cerută explicit să rămână neatinsă.
  - Eticheta pentru `/analiza` schimbată din „Analiză Bugetară" în „Grafice Buget", exact ca în mockup (fidelitate cerută explicit) — ruta rămâne aceeași.
- **`icons.ts`**: adăugat `NAV_ICONS.logo` (`architecture`), `NAV_ICONS.sidebarAddRoom` (`add_circle`); corectat `NAV_ICONS.collapseSidebar` din `keyboard_double_arrow_left` (presupunere veche, niciodată verificată) în `menu_open` (confirmat din HTML-ul ambelor ecrane).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual pe `/configurare` și `/elemente`: stare expandată + colapsată, hover/active state, toggle funcțional, restul fiecărei pagini neschimbat, zero erori în consolă.

**Fișiere atinse:** `src/components/Sidebar.tsx` (rescris), `src/shared/icons.ts`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — Sidebar: ajustări de spacing (padding/margin) + `PageHeader` unificat pe toate paginile
**De ce:** userul a semnalat că textul din sidebar iese din butoane (prea mare/bold, prea mult padding orizontal) — ajustat. Apoi a cerut header alb identic pe toate cele 4 pagini, cu titlul paginii + search, exact ca în ecranul Stitch „Tabel Centralizator - Meniu Restrâns Premium".

- **Sidebar** (`src/components/Sidebar.tsx`): text iteme navigare `text-sm font-medium` (nu `font-bold`), padding orizontal redus (`px-4`→`px-3`), lățime `w-72`→`w-64`, padding container `p-6`→`p-4`, spațiu între iteme `space-y-1`→`space-y-0.5`. Adăugat separator (`border-b`) sub secțiunea de titlu „Renovator Pro" + `py-4` pe zona de navigare, pentru delimitare vizuală clară titlu/meniu.
- **`PageHeader` nou** (`src/components/PageHeader.tsx`, folosit de la început în ≥2 pagini → direct shared, nu local): header alb (`bg-white`), sticky, `border-b`, titlu stânga + input de căutare dreapta cu iconiță (decorativ — nu există încă funcție de căutare cablată, la fel ca restul căutărilor din app). Markup extras exact din HTML-ul ecranului „Tabel Centralizator - Meniu Restrâns Premium".
- Aplicat pe toate cele 4 pagini (`configurare`, `elemente`, `centralizator`, `analiza`), înlocuind fiecare `<h1>` inline: pe `configurare` a înlocuit un header custom mai vechi (cu tab-uri „Măsurători"/„Materiale" + avatar) — unificare explicit cerută de user, tab-urile/avatarul au fost scoase. Pe `elemente`/`centralizator`, butoanele de acțiune specifice paginii („+ Adaugă Cameră", „Imprimă Raport") au rămas funcționale, mutate sub header (aliniate dreapta) în loc să fie lângă titlu.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual toate cele 4 pagini + ambele stări sidebar (expandat/colaps) — header identic peste tot, restul conținutului fiecărei pagini neschimbat, zero erori reale în consolă (erorile inițial raportate de `read_console_messages` erau istoricul cache-ului Turbopack dintr-un tab vechi, reconfirmat curat într-un tab nou).

**Fișiere atinse:** `src/components/Sidebar.tsx`, `src/components/PageHeader.tsx` (nou), `src/app/configurare/page.tsx`, `src/app/elemente/page.tsx`, `src/app/centralizator/page.tsx`, `src/app/analiza/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/elemente` rescris după Stitch („Elemente de Cumpărat - Meniu Restrâns") + responsive real
**De ce:** userul a semnalat că pagina `/elemente` nu semăna cu designul Stitch și nu era deloc responsive (câmpurile din Adăugare Rapidă aveau `min-w` fixe care produceau overflow orizontal pe ecrane înguste, tabelele nu aveau scroll orizontal).

- Descărcat HTML-ul ecranului „Elemente de Cumpărat - Meniu Restrâns" (proiect Stitch `14594146001803528847`) și aliniat layout-ul: stat cards `rounded-xl shadow-sm`, widget „Adăugare Rapidă" cu iconiță `bolt`, câmpuri pe fundal `bg-white/10` peste `bg-primary`, buton „Salvează" cu iconiță `save`; carduri de cameră cu iconiță `ROOM_TYPE_ICONS`, tabel cu iconițe `unfold_more` decorative pe headerele sortabile (fără sortare reală cablată — pur vizual, ca în design), acțiuni editare/ștergere cu Material Symbols (`edit`/`delete`) în loc de emoji.
- **`StatusChip.tsx`** (shared, afectează și `/centralizator`): adăugată iconița de status (`STATUS_ICONS`, deja existentă) lângă text, pentru fidelitate cu badge-urile din design.
- **Responsive real**: eliminat toate `min-w-*` fixe din formularul de Adăugare Rapidă (cauza principală a overflow-ului), înlocuite cu `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; fiecare tabel de cameră e acum învelit în `overflow-x-auto` (lipsea complet înainte); stat cards `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; header-ul cardului de cameră (`flex flex-wrap`) se rearanjează pe ecrane înguste. Testat efectiv la 375px (mobil), 768px (tabletă) și desktop — zero overflow orizontal la nicio lățime.
- Element cu `imageUrl` completat (câmp deja existent în `Item`) afișează acum o miniatură 8×8 în tabel, ca în design — nu s-a inventat date, doar afișat ce exista deja în model dar nu era randat.
- `icons.ts`: adăugate `ACTION_ICONS.save`, `ACTION_ICONS.link`, `ACTION_ICONS.image`, `ACTION_ICONS.sortIndicator` (`unfold_more`).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual desktop + mobil (375px) + tabletă (768px) — sidebar dispare corect sub `md`, tabele cu scroll orizontal pe ecrane înguste, formular de adăugare rapidă complet responsive, zero erori în consolă.

**Fișiere atinse:** `src/app/elemente/page.tsx` (rescris), `src/components/StatusChip.tsx`, `src/shared/icons.ts`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/elemente`: tabele fără wrap pe 2 rânduri, status chip mai mic, header cameră alb + scroll
**De ce:** userul a cerut, doar pentru `/elemente`: niciun conținut de tabel să nu se rupă pe 2 rânduri (scroll orizontal în loc de wrap), badge-urile de status mai mici și ne-bold, iar header-ul fiecărei secțiuni de cameră ("Baie Principală" etc.) responsive — scroll orizontal la nevoie, font mai mic, fundal alb în loc de albastru deschis.

- **`StatusChip.tsx`** (shared): adăugat prop opțional `size?: "sm" | "md"` (implicit `"md"`, neschimbat pentru `/centralizator`). `size="sm"` → text `9px`/`font-medium` (nu bold) în loc de `11px`/`font-bold`, folosit doar în `/elemente`. Component rămâne shared, dar comportamentul implicit e neatins — schimbarea e opt-in per pagină.
- **Header cameră** (`elemente/page.tsx`): `bg-surface-low` (albăstrui) → `bg-surface` (alb); text titlu `text-lg` → `text-sm`; întregul rând (icon + nume + buget + butoane) e acum într-un container `overflow-x-auto` cu `min-w-max whitespace-nowrap`, deci pe ecran îngust apare scroll orizontal în loc de wrap pe 2 rânduri.
- **Celulele din tabel**: adăugat `whitespace-nowrap` pe toate coloanele (element, sursă, buc, preț, total, status) — tabelul (deja în `overflow-x-auto`) face acum scroll orizontal complet în loc să rupă text pe mai multe linii la orice lățime.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat la 375px (mobil): header-ele de cameră rămân pe un rând cu scroll orizontal vizibil, tabelele idem, zero wrap pe 2 rânduri nicăieri, zero erori în consolă.

**Fișiere atinse:** `src/app/elemente/page.tsx`, `src/components/StatusChip.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/elemente`: dimensiune uniformă iconițe de buton + fix axă `opsz`
**De ce:** userul a semnalat că iconițele de pe butoane (Salvează, edit/delete din tabel) sunt disproporționat de mari față de textul din jur.

- Cauza reală: `.material-symbols-outlined` avea `opsz` (optical size) fixat la 24 global — la randare sub 20px, traseul glifei rămâne desenat pt. 24px, deci apare gros/mare indiferent de `font-size`.
- `globals.css`: `opsz` global coborât la 20; adăugată clasa nouă `.icon-btn` (font-size 13px, `opsz` 14) — standardul pt. toate iconițele din butoane (edit/delete/adaugă/salvează).
- Aplicat `.icon-btn` pe toate iconițele de buton din `elemente/page.tsx` și pe iconița delete din `RoomTechnicalCard.tsx`; ordinea butoanelor din header-ul de secțiune cameră schimbată (Șterge înaintea lui Adaugă).
- `StatusChip.tsx`: iconița de status redusă la 10/12px cu `opsz` ajustat inline (nu folosește `.icon-btn`, are nevoie de mărime proprie, mai mică).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Verificat vizual.

**Fișiere atinse:** `src/app/globals.css`, `src/app/elemente/page.tsx`, `src/app/configurare/RoomTechnicalCard.tsx`, `src/components/StatusChip.tsx`, `CLAUDE.md`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/centralizator` rescris pixel-apropiat de Stitch („Tabel Centralizator - Meniu Restrâns Premium")
**De ce:** userul a cerut ca pagina Centralizator Costuri să semene cât mai fidel cu ecranul Stitch dedicat.

- Descărcat HTML-ul sursă al ecranului (proiect Stitch `14594146001803528847`) și rescris `centralizator/page.tsx`: 3 stat cards cu bară colorată pe margine stângă (estimat/cheltuit/eficiență), donut SVG de eficiență bugetară, tabel cu secțiuni per cameră **colapsabile** (click pe header, `expand_more` rotit), toggle „Afișează Subtotaluri" (checkbox), badge-uri de tip material colorate per categorie, iconițe de status (`check_circle`/`schedule`) în loc de `StatusChip` (design-ul specific acestui ecran folosește iconițe simple, nu pastile), footer negru cu „TOTAL GENERAL ESTIMAT", card de acțiuni cu butoanele „Imprimă Raport" + „Partajează Detalii" (vizual, fără funcționalitate reală de partajare — nu există backend).
- Adăugată funcția nouă `budgetEfficiency(estimated, spent)` în `shared/functions/budget.ts` (% din estimat efectiv cheltuit) — designul calculează „Eficiență Bugetară" ca spent/estimated, diferit de `purchaseProgress` (raport pe număr de elemente) folosit greșit anterior pe această pagină.
- `icons.ts`: adăugat `DOCUMENT_ICONS.share` și un grup nou `CENTRALIZATOR_ICONS` (payments, account_balance_wallet, monitoring, analytics, schedule) — toate numele de iconițe noi centralizate, nu hardcodate în JSX.
- **Omis intenționat față de design:** coloana „U.M." (unitate de măsură) — `Item` nu are un câmp de unitate de măsură în model, iar adăugarea lui ar fi fost o schimbare de schemă de date nerelaționată cu cererea de stilizare; blocul de echivalent valutar RON→EUR din design a fost omis, pentru că proiectul nu are curs valutar real (backlog item 6, neimplementat) și moneda proiectului e deja EUR.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual: carduri, donut, colaps/expand secțiuni, toggle subtotaluri — toate funcționale.

**Fișiere atinse:** `src/app/centralizator/page.tsx` (rescris), `src/shared/functions/budget.ts`, `src/shared/icons.ts`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/analiza` rescris pixel-apropiat de Stitch („Analiză Bugetară - Meniu Restrâns Premium v2")
**De ce:** userul a cerut ca pagina Analiză Bugetară să semene cât mai fidel cu ecranul Stitch dedicat.

- Descărcat HTML-ul sursă al ecranului (proiect Stitch `14594146001803528847`) și rescris `analiza/page.tsx`: 4 stat cards cu progress bars (Cheltuieli/Achiziții), bento grid cu grafic linie „Evoluția Cheltuielilor" (col-span-8) + donut „Cost per Cameră" cu paletă pastel și callout „Top Room" în centru (col-span-4), secțiune „Stadiul Achizițiilor pe Categorii" convertită din listă în grid de carduri cu progress bar, 3 carduri de recomandări restilizate (icon box cu bordură, culoare per tip: secondary/tertiary sau emerald/emerald).
- **`PageHeader.tsx`** (shared): adăugat prop opțional `actions?: React.ReactNode` — slot generic lângă căutare, folosit aici pt. butonul „Export PDF" (vizual, fără export real cablat — backlog item 5, neimplementat). Celelalte pagini nu sunt afectate (prop opțional, fără valoare implicită vizibilă).
- **Grafic „Evoluția Cheltuielilor":** randat ca SVG static (path fix, aceleași luni Ian–Iul ca în design) — **nu există date lunare reale** în modelul `Item` (backlog item 4, neimplementat), deci graficul e intenționat decorativ/placeholder, la fel ca în mockup-ul Stitch original.
- Card „Total Alocat": eliminat textul static „+12% față de plan" din design (nu are echivalent calculabil din date reale), înlocuit cu eticheta „Buget de referință" (consecvent cu tratamentul din `/centralizator`).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual: cardurile de sumar, donut, cardurile de categorie (fix inițial: suma și procentul se suprapuneau pe carduri înguste — rezolvat cu `flex-wrap` + `font-mono`), cardurile de recomandări.

**Fișiere atinse:** `src/app/analiza/page.tsx` (rescris), `src/components/PageHeader.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/analiza`: variantă mobilă 1:1 cu Stitch („Analiză Bugetară - Mobile Premium Black Theme")
**De ce:** userul a cerut varianta de telefon a paginii Analiză Bugetară, identică cu mockup-ul mobil dedicat — explicit FĂRĂ bottom nav (acela se implementează în aplicația Flutter, nu în web).

- Layout-ul desktop existent (bento grid) e acum înfășurat în `hidden lg:block`; sub breakpoint-ul `lg` (1024px) se randează un bloc nou `lg:hidden` cu structura mockup-ului mobil: 4 KPI cards verticale cu progress bar full-width, grafic bare static „Evoluția Cheltuielilor" (decorativ, aceeași lipsă de date lunare reale ca la varianta desktop), donut „Cost per Cameră" cu paletă **monocromă** (`MOBILE_PIE_COLORS`, negru→gri deschis — temă distinctă de paleta pastel de pe desktop, conform design-ului „Premium Black Theme"), listă „Stadiul pe Categorii", 3 carduri „Sugestii & Analiză" cu iconițe în cerc (`trending_down`/`warning`/`update`).
- Date reale peste tot (nu s-a fabricat nimic): aceleași calcule ca varianta desktop (`spentPct`, `remainingPct`, `progress`, `perCategory`, `costPerRoom`/`donutSegments`, `pendingTotal`, `overBudget`).
- Fix aplicat în timpul verificării vizuale: eticheta din centrul donut-ului mobil ieșea din cerc la `text-[14px]` — redusă la `text-[10px]` + `leading-tight` + padding, acum încape complet.
- **Intenționat omis, la cererea userului:** bottom navigation bar din mockup (Overview/Rooms/Analiză/Settings) — rămâne să fie construit în aplicația Flutter, nu în web.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 375px (mobil, sub breakpoint `lg`) și 1440px (desktop neschimbat, confirmă breakpoint-ul corect).

**Fișiere atinse:** `src/app/analiza/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — Meniu hamburger mobil (`Sidebar.tsx`) + fix breakpoint `/analiza` (aplicație întreagă)
**De ce:** userul a semnalat două probleme: (1) `<aside>` (`Sidebar.tsx`) e `hidden md:flex` de la început — sub 768px dispărea complet și nu exista nimic în loc, deci pe telefon nu mai exista NICI un meniu de navigare; (2) `/analiza` comuta pe layout-ul mobil la breakpoint-ul `lg` (1024px), deschis mai devreme decât breakpoint-ul `md` (768px) la care dispare sidebar-ul — rezultatul: pe ecrane medii (768–1024px, cu sidebar vizibil) pagina "sărea" deja în modul telefon cu o singură coloană.

- **`Sidebar.tsx`**: adăugat un header + meniu dropdown mobil (`md:hidden`), randate din același array `nav` folosit de `<aside>` (o singură sursă de adevăr, zero duplicare de linkuri). Header sticky sus, cu logo + buton hamburger (iconiță nouă `NAV_ICONS.mobileMenu` = `menu`, devine `ACTION_ICONS.close` când e deschis). La click se deschide un panou dropdown (de sus în jos, `scale-y` + `opacity`, `aria-expanded`) cu overlay semi-transparent care închide meniul la click în afara lui; fiecare link închide meniul la navigare.
- **`layout.tsx`**: containerul rădăcină trece din `flex` (rând, fix) în `flex flex-col md:flex-row`, ca header-ul mobil din `Sidebar` să stea deasupra conținutului (nu lângă el) sub 768px, și lângă el (ca înainte) de la 768px în sus.
- **`/analiza`**: breakpoint-ul de comutare mobil/desktop schimbat din `lg` (1024px) în `md` (768px), aliniat cu breakpoint-ul la care dispare/apare `<aside>`-ul — acum layout-ul cu o singură coloană apare DOAR sub 768px (telefon real), nu și pe ecrane medii/tablete.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual: 375px (meniu hamburger funcțional, deschide/închide, navighează, overlay), 900px (sidebar complet vizibil, `/analiza` afișează layout-ul desktop, NU mai sare pe o coloană), 1440px (neschimbat).

**Fișiere atinse:** `src/components/Sidebar.tsx`, `src/app/layout.tsx`, `src/app/analiza/page.tsx`, `src/shared/icons.ts`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/centralizator`: variantă mobilă 1:1 cu Stitch („Centralizator Costuri - Mobile Table View")
**De ce:** userul a cerut varianta de telefon a paginii Centralizator Costuri, identică cu mockup-ul mobil dedicat.

- Layout-ul desktop existent (nu avea încă un wrapper `hidden`/breakpoint dedicat — era doar responsive prin `overflow-x-auto`) e acum înfășurat explicit în `hidden md:block`, aliniat la breakpoint-ul `md` folosit deja de `Sidebar`/`/analiza`. Sub `md` se randează un bloc nou `md:hidden`: carduri de sumar cu scroll orizontal (Total Estimat/Cheltuit/Eficiență), secțiuni per cameră ca acordeon cu bară stânga `border-l-4 border-primary` (reutilizează exact același state `collapsed`/`toggleRoom` ca varianta desktop — un singur „adevăr" pt. ce cameră e restrânsă, nu duplicat), fiecare cu tabel real scrollabil orizontal (`min-w-[600px]` + `overflow-x-auto`, la fel ca în design — NU listă de carduri), rând de subtotal per cameră, footer sticky (`fixed bottom-0`) cu „Total General Estimat" + buton „PDF" (vizual, fără export real — la fel ca butoanele Imprimă/Partajează de pe desktop).
- Date reale peste tot: aceleași `estimated`/`spent`/`efficiency`/`itemsForRoom`/`roomSubtotal`/`MATERIAL_BADGE_STYLES`/`STATUS_DOT` ca varianta desktop — zero duplicare de logică, doar markup diferit.
- `icons.ts`: adăugat `DOCUMENT_ICONS.download` (glyph distinct de `exportPdf`, folosit explicit în acest ecran) și `CENTRALIZATOR_ICONS.trendUp` (`trending_up`, badge-ul de eficiență).
- **Intenționat omis, la cererea userului (consecvent cu `/analiza` mobil):** bottom navigation bar din mockup — rămâne să fie construit în aplicația Flutter, nu în web.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 375px (carduri scroll orizontal, acordeon funcțional — colaps/expand testat interactiv, tabel scrollabil, footer sticky) și 1440px (desktop neschimbat).

**Fișiere atinse:** `src/app/centralizator/page.tsx`, `src/shared/icons.ts`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/elemente`: variantă mobilă 1:1 cu Stitch + `ConfirmDialog` devine bottom sheet pe mobil
**De ce:** userul a cerut varianta de telefon a paginii Elemente de Cumpărat, identică cu ecranul „Confirmare Ștergere - Bottom Sheet Mobile" (care conține atât pagina de listă, cât și dialogul de ștergere ca bottom sheet).

- **`ConfirmDialog.tsx`** (shared — afectează global orice ștergere, nu doar `/elemente`): sub breakpoint-ul `sm`, dialogul se randează acum ca bottom sheet (`items-end`, colțuri sus rotunjite `rounded-t-[24px]`, handle bar, titlu/mesaj centrate, buton „Șterge" roșu full-width sus + „Anulează" text dedesubt, ambele cu `active:scale`), fidel design-ului Stitch. De la `sm` în sus, comportamentul rămâne EXACT ca înainte (modal centrat, butoane side-by-side) — zero regresie pe desktop.
- **`/elemente`**: layout desktop existent (nu avea încă wrapper `hidden`/breakpoint) înfășurat explicit în `hidden md:block`. Bloc nou `md:hidden` cu: card de sumar (buget/cheltuit + bară de progres), chip-uri de filtrare pe cameră (fully funcționale — `mobileFilterRoomId`, „Toate" resetează), acordeon „Adăugare Rapidă" (colapsat implicit, reutilizează `quickAdd` existent), carduri de cameră ca acordeon cu iconițe inline adaugă/șterge în header (`role="button"` în interiorul unui `<button>` — nu `<button>` imbricat, pattern deja folosit în `RoomTechnicalCard.tsx`), rânduri de elemente cu edit/șterge (iconița „visibility" din design nu are echivalent — un singur creion de editare, documentat ca simplificare).
- State nou, local paginii: `mobileQuickAddOpen`, `mobileFilterRoomId`, `mobileOpenRooms` (`Set<string>`, separat de accordion state-ul desktop-ului — cele două view-uri nu sunt randate simultan, deci nu există sincronizare de făcut).
- **Simplificare documentată:** design-ul are și un bottom sheet separat „Detalii Articol" (read-only + edit/delete) — nu a fost construit un componentă nouă pt. asta; iconița de vizualizare din listă ar deschide același `ItemFormDrawer` folosit la editare (nu există încă un view read-only dedicat).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 375px: filtrare pe cameră, acordeon adăugare rapidă, acordeon cameră cu add/delete, editare/ștergere element, bottom sheet-ul de confirmare (screenshot confirmă potrivire exactă cu design: handle bar, text centrat, buton roșu full-width, Anulează dedesubt). 1440px: desktop neschimbat.

**Fișiere atinse:** `src/app/elemente/page.tsx`, `src/components/ConfirmDialog.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/elemente`: FAB „Adaugă Cameră" doar pe mobil
**De ce:** userul a cerut butonul flotant din colțul jos-dreapta al design-ului Stitch (vizibil doar pe telefon), care deschide același formular ca butonul „+ Adaugă Cameră" de pe desktop.

- Buton rotund `fixed bottom-6 right-6`, `md:hidden`, deschide `RoomFormDrawer` existent (`setRoomDrawerOpen(true)`) — zero logică nouă, doar un trigger vizual suplimentar pt. mobil.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 375px — FAB vizibil jos-dreapta, deschide corect drawer-ul „Adaugă Cameră Nouă"; la 1440px FAB-ul nu apare (desktop neschimbat).

**Fișiere atinse:** `src/app/elemente/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — Bara mobilă: titlu paginii sus (nu logo), branding mutat în dropdown (aplicație întreagă)
**De ce:** userul a semnalat că pe mobil titlul paginii era afișat DE DOUĂ ORI (o dată logo+"Renovator Pro" în bara sus din `Sidebar.tsx`, o dată titlul real al paginii sub ea, din `PageHeader.tsx`) — voia ca bara de sus, când meniul e închis, să arate direct numele paginii curente; iar logo-ul + numele aplicației să apară doar când deschizi meniul (dropdown-ul), sub buton.

- **`Sidebar.tsx`**: bara mobilă sticky nu mai arată logo+"Renovator Pro" — arată titlul paginii curente (`nav.find((item) => pathname.startsWith(item.href))?.label`, fallback `"Renovator Pro"` pt. rute fără match, ex. `/`). Logo-ul + „Renovator Pro / Management Buget" s-au mutat în panoul dropdown (randate deasupra listei de linkuri, sub bara sus), vizibile doar când `mobileOpen` e `true`.
- **`PageHeader.tsx`**: header-ul întreg (titlu + căutare + acțiuni) e acum `hidden md:block` — pe mobil titlul e deja afișat o singură dată în bara din `Sidebar`, deci nu mai are rost să fie randat și aici (ar fi fost duplicat). De la `md` în sus, comportamentul e identic cu înainte.
- Schimbarea e la nivel de componente shared (`Sidebar`, `PageHeader`), deci se aplică automat pe TOATE paginile, nu doar `/elemente` — testat pe `/elemente` și `/configurare`.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 375px (titlu unic sus pe fiecare pagină, meniu deschis arată corect logo+brand deasupra linkurilor) și 1440px (desktop neschimbat — sidebar complet + `PageHeader` cu titlu/căutare ca înainte).

**Fișiere atinse:** `src/components/Sidebar.tsx`, `src/components/PageHeader.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/analiza` mobil: cele 4 carduri KPI → un singur card compact cu gradient
**De ce:** userul a semnalat că cele 4 carduri KPI stivuite ocupau prea mult spațiu vertical pe telefon; a cerut înlocuirea cu cardul unic din „Analiză Bugetară - Mobile Premium Light Gradient Layout" — aceleași date, doar aranjate diferit.

- Cele 4 carduri separate (`Total Alocat`, `Cheltuieli Totale`, `Buget Rămas`, `Achiziții Finalizate`, fiecare cu propriul chenar + bară de progres) înlocuite cu un singur card cu fundal gradient (`linear-gradient(135deg, #ffffff 0%, var(--surface-low) 100%)`), grid 2×2: rândul de sus (Total Alocat / Cheltuieli Totale) separat printr-o linie de rândul de jos (Buget Rămas, valoare mare / Achiziții Finalizate, cu bară de progres subțire) — fidel design-ului.
- Date identice, zero calcule noi: `formatMoney(project.totalBudget)`, `formatMoney(spent)`, `formatMoney(remaining)`, `bought`/`items.length`, `progress` — toate deja existente.
- Doar secțiunea mobilă (`md:hidden`) a fost atinsă — cele 4 carduri de pe desktop (`hidden md:block`) rămân neschimbate.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 375px (card compact, mult mai puțin spațiu ocupat) și 1440px (desktop neschimbat, cele 4 carduri separate).

**Fișiere atinse:** `src/app/analiza/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/analiza` desktop: cele 4 carduri KPI → card unic cu gradient închis (Dashboard Premium Consolidat)
**De ce:** userul a cerut înlocuirea celor 4 carduri albe separate de pe desktop cu design-ul consolidat din „Analiză Bugetară - Dashboard Premium Consolidat Desktop".

- Cele 4 carduri albe (`border border-line bg-surface`, fiecare cu umbră proprie) înlocuite cu un singur card cu gradient închis (`linear-gradient(135deg, #1e293b 0%, #000000 100%)`), text alb, 4 coloane separate prin `border-r border-white/10` (md+), fidel design-ului: Total Alocat / Cheltuieli Totale (cu bară de progres albă) / Buget Rămas / Achiziții Finalizate (cu bară secundară).
- Date identice, aceleași variabile deja calculate (`formatMoney`, `spentPct`, `remainingPct`, `bought`, `progress`) — zero logică nouă.
- Accentul verde „+12% față de plan" din design (fără echivalent real calculabil) a fost înlocuit cu eticheta reală „Buget de referință" (consecvent cu decizia anterioară de pe această pagină și pe `/centralizator`).
- Doar secțiunea desktop (`hidden md:block`) a fost atinsă — cardul mobil (light gradient, cerut anterior) rămâne neschimbat.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 1440px (card unic cu gradient, cele 4 metrici aliniate) și 375px (mobil neschimbat).

**Fișiere atinse:** `src/app/analiza/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — `/analiza` desktop: fix responsive pe cardul unic KPI (text se suprapunea pe ecrane medii)
**De ce:** userul a semnalat că pe ecrane de lățime medie (ex. 900px) textul din cardul consolidat KPI (introdus în sesiunea anterioară) se suprapunea — `grid-cols-1 md:grid-cols-4` sărea direct la 4 coloane la 768px, iar cifrele la `text-[32px]` font-mono nu încăpeau, provocând overflow vizual peste coloana vecină.

- Grid schimbat din `grid-cols-1 md:grid-cols-4` în `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — 2 coloane pe ecrane medii (768–1024px), 4 doar de la `lg` (1024px) în sus, unde există loc real.
- Mărimea cifrelor mari (Total Alocat / Cheltuieli Totale / Buget Rămas / Achiziții %) trece de la `text-[32px]` fix la `clamp(18px, 2.2vw, 32px)` (inline style) — se micșorează fluid odată cu ecranul în loc să sară brusc între breakpoints sau să deborde.
- Adăugat `min-w-0` pe fiecare coloană + `truncate`/`shrink-0` pe elementele care puteau împinge conținutul peste lățimea coloanei (border-uri divizoare mutate la `lg:border-r`, ca să nu rămână vizual „rupte" pe layout-ul de 2 coloane).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual la 768px, 900px, 1440px și 1600px — text lizibil, fără suprapuneri la nicio lățime; sub `md` (mobil) cardul light-gradient separat rămâne neatins.

**Fișiere atinse:** `src/app/analiza/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-12 — Header de statistici unificat pe toate paginile: `DashboardSummaryCard`
**De ce:** userul a confirmat că îi place cardul cu gradient închis introdus pe `/analiza` desktop și a cerut explicit ca ACELAȘI design (culori, font, poziționare) să fie folosit pe toate paginile, indiferent de mobil/desktop — dar cu datele reale ale fiecărei pagini, nu date copiate.

- **Component nou** `src/components/DashboardSummaryCard.tsx` — extras din implementarea de pe `/analiza`, generic: primește `metrics: SummaryMetric[]` (2–4 elemente, `{label, value, footer?}`), randează gradientul, grid-ul responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-{n}`, `border-r` doar la `lg`) și tipografia. Exportă și `SummaryProgressFooter` (bară + %) și `SummaryAccentFooter` (punct colorat + text) pt. footer-ul fiecărui metric — evită duplicarea celor două „stiluri" de footer văzute în design.
- **Aplicat pe toate paginile**, înlocuind headerele de statistici anterioare (fiecare avea propriul stil, uneori diferit pe mobil vs. desktop):
  - `/analiza` — unificat cele două variante (light-gradient mobil + dark-gradient desktop) într-una singură, afișată necondiționat (nu mai există split `md:hidden`/`hidden md:block` pt. acest bloc).
  - `/elemente` — înlocuit grid-ul de `StatCard` (desktop) + cardul light propriu (mobil) cu `DashboardSummaryCard` (4 metrici: Buget total estimat, Total cheltuit, Elemente achiziționate, Progres achiziții).
  - `/centralizator` — înlocuit cele 3 carduri cu bară colorată + donut de eficiență (desktop) și cardurile cu scroll orizontal (mobil) cu `DashboardSummaryCard` (3 metrici: Total Estimat Proiect, Total Cheltuit la Zi, Eficiență Bugetară — donut-ul de eficiență a fost eliminat, înlocuit cu bară de progres în footer).
  - `/configurare` — înlocuit „Sumar Tehnic Global" (card alb) cu `DashboardSummaryCard` (4 metrici: Suprafață Utilă, Status, Buget Total, Progres Calcul); titlul „Proiect Curent" + numele proiectului rămân deasupra cardului (conținut real, nu un metric generic).
- **Fix responsive găsit în timpul verificării:** la 1440px, pe `/configurare` (container `max-w-6xl`, mai îngust decât `max-w-7xl` de pe celelalte pagini), valoarea „12.500,00 EUR" se trunchia (`clamp(18px, 2.2vw, 32px)` prea mare pt. coloana disponibilă). Redus la `clamp(16px, 1.6vw, 26px)` — încape pe toate paginile la toate lățimile testate.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual pe toate cele 4 pagini, la 375px și 1440px — design identic (gradient, font, poziționare), doar datele diferă per pagină.

**Fișiere atinse:** `src/components/DashboardSummaryCard.tsx` (nou), `src/app/analiza/page.tsx`, `src/app/elemente/page.tsx`, `src/app/centralizator/page.tsx`, `src/app/configurare/page.tsx`, `CLAUDE.md`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.
