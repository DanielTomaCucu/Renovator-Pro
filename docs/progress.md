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
| `itemTotal(item)` | `shared/functions/items.ts` | cantitate × preț unitar (randare per-rând) | `elemente`, `centralizator`, intern în `items.ts` |
| `totalEstimated(items)` | `shared/functions/items.ts` | suma unei liste (indiferent de status) — subtotaluri ad-hoc; totalul de proiect vine din `summary` | `analiza` (pendingTotal), intern (`totalSpent`, `roomSubtotal`) |
| `totalSpent(items)` | `shared/functions/items.ts` | suma elementelor cu status `ItemStatus.Cumparat` | intern (`roomSpent`) — totalul de proiect vine din `summary` |
| `boughtCount(items)` | `shared/functions/items.ts` | număr elemente `ItemStatus.Cumparat` (per-cameră) | `elemente` (per-cameră) — totalul de proiect vine din `summary` |
| `itemsForRoom(items, roomId)` | `shared/functions/items.ts` | filtrare elemente după cameră | `elemente`, `centralizator`, intern (roomSubtotal, roomSpent) |
| `roomSubtotal(items, roomId)` | `shared/functions/items.ts` | total estimat al unei camere (randare per-cameră) | `centralizator` |
| `roomSpent(items, roomId)` | `shared/functions/items.ts` | cheltuit efectiv într-o cameră (randare per-cameră) | `elemente` |
| `budgetEfficiency(estimated, spent)` | `shared/functions/budget.ts` | % din estimat efectiv cheltuit — rație de prezentare peste totalurile din `summary` | `centralizator` |
| `donutSegments(data)` | `shared/functions/charts.ts` | transformă `{name, total}[]` (din `summary.costPerRoom`) în `DonutSegment[]` cumulative — geometrie de prezentare | `analiza` |
| `hasFloorConfig(room)` | `shared/functions/dimensions.ts` | `true` dacă material + suprafață pardoseală sunt completate | `configurare`, intern (`computeRoomDimensions`, `floorMaterialNeeded`) |
| `totalDoorWidth(room)` | `shared/functions/dimensions.ts` | suma lățimilor tuturor ușilor camerei (indiferent de perete) | intern (`baseboardLength`, `computeRoomDimensions`) |
| `doorArea(room, wall)` | `shared/functions/dimensions.ts` | aria ușii unui perete dat (0 dacă nu are ușă) | intern în `wallTilingArea`/`wallFinishArea` |
| `baseboardLength(room)` | `shared/functions/dimensions.ts` | plintă (ml) = (perimetru − Σ lățime uși) + 5% pierdere | intern (`baseboardTileArea`, `computeRoomDimensions`) |
| `baseboardTileArea(room)` | `shared/functions/dimensions.ts` | suprafață de plintă (mp) tăiată din plăcile de gresie — 0 dacă pardoseala nu e Gresie sau nu are `baseboardHeight` completat | intern (`floorMaterialNeeded`, `computeRoomDimensions`) |
| `floorMaterialNeeded(room)` | `shared/functions/dimensions.ts` | necesar material pardoseală (+10% pierdere) — la Gresie include și `baseboardTileArea` | intern (`computeRoomDimensions`) |
| `wallTilingArea(room)` | `shared/functions/dimensions.ts` | suprafață faianță pe pereții placați, minus golurile ușilor și ferestrelor — doar la Gresie | intern (`computeRoomDimensions`) |
| `wallFinishArea(room, type)` | `shared/functions/dimensions.ts` | suprafață vopsea/tapet, minus goluri — doar la Parchet/Mochetă; pierdere 10% (vopsea) / 15% (tapet) | intern (`computeRoomDimensions`) |
| `estimatedSquareWallSide(room)` | `shared/functions/dimensions.ts` | lungime sugerată de perete (√suprafață) — valoare implicită la activarea faianței/finisajului | `configurare` (RoomTechnicalCard) |
| `windowArea(room, wall)` | `shared/functions/dimensions.ts` | aria ferestrei unui perete dat (0 dacă nu are fereastră) | intern în `wallTilingArea`/`wallFinishArea` |
| `windowTrimLength(room)` | `shared/functions/dimensions.ts` | lungime totală de glaf/bordură pt. toate ferestrele (Σ perimetru) + 5% pierdere | intern (`computeRoomDimensions`) |
| `computeRoomDimensions(room)` | `shared/functions/dimensions.ts` | breakdown complet de necesar material (oglinda `RoomDimensionsCalculator.java`) — PREVIEW client la editare + fallback; sursa de adevăr e `room.dimensions` de la server | `configurare` (RoomTechnicalCard preview), `ApartmentPdfDocument` (fallback), `roomCalcRows.ts` |
| `buildRoomCalcRows(room, dims)` | `app/configurare/roomCalcRows.ts` (local) | rândurile din „Calcule Detaliate" (label/valoare/formulă/math) din `dims` (server sau preview) | `RoomTechnicalCard`, `ApartmentPdfDocument` |
| `timelinePoints(data)` | `shared/functions/charts.ts` | normalizează `SpendingTimelinePoint[]` (din `spending-timeline`) în puncte {x,y}∈[0,1] pt. graficul de evoluție — geometrie de prezentare | `analiza` |
| `formatMonthLabel(month)` | `app/analiza/dates.ts` (local) | formatează "yyyy-MM" într-o etichetă scurtă RO ("Ian", "Ian 2025" dacă anul diferă de cel curent) | `analiza` (axa graficului de evoluție) |

### Funcții locale de pagină

_(niciuna momentan — `dimensions.ts` a fost promovat în `shared/functions/` de îndată ce a devenit necesar și din `store.tsx`, nu doar din pagina `configurare`)_

## Registru de tipuri (`src/shared/types/`, un fișier per tip)

| Tip | Fișier | Fel |
|---|---|---|
| `RoomType` | `RoomType.ts` | enum |
| `ItemStatus` | `ItemStatus.ts` | enum |
| `ItemOrigin` | `ItemOrigin.ts` | enum (Manual / Configurare — proveniența unui element) |
| `MaterialType` | `MaterialType.ts` | enum (extins cu `Plinta`, `Tapet`, `GlafFereastra`) |
| `Currency` | `Currency.ts` | enum |
| `FlooringType` | `FlooringType.ts` | enum (Parchet Laminat / Gresie / Mochetă) |
| `TileSize` | `TileSize.ts` | enum |
| `InstallationType` | `InstallationType.ts` | enum |
| `Wall` | `Wall.ts` | enum (N/E/S/V) |
| `RoomDoor` | `RoomDoor.ts` | interface (width, height) — o ușă, max. 1 per perete |
| `WallTiling` | `WallTiling.ts` | interface (tiledWallsCount, tileHeight, wallLengths per `Wall`) — doar la Gresie |
| `WallFinishType` | `WallFinishType.ts` | enum (Vopsea / Tapet) |
| `WallFinish` | `WallFinish.ts` | interface (wallHeight, wallLengths per `Wall`, finishes: `Partial<Record<Wall, WallFinishType>>`) — doar la Parchet/Mochetă, alternativa la `WallTiling` |
| `RoomWindow` | `RoomWindow.ts` | interface (width, height) — o fereastră, max. 1 per perete |
| `RoomShape` | `RoomShape.ts` | enum (Pătrat / Dreptunghi / Neregulată) — controlează câte lungimi de perete cere UI-ul la `wallTiling`/`wallFinish` |
| `RoomDimensions` | `RoomDimensions.ts` | interface (breakdown necesar material, autoritativ de la server — `hasFloorConfig`, `floorMaterialNeeded`, `baseboardLength`, `baseboardTileArea`, `wallTilingArea`, `paintArea`, `wallpaperArea`, `windowTrimLength`, `totalDoorWidth`) |
| `Room` | `Room.ts` | interface (extins cu `floorMaterial?`, `floorArea?`, `perimeter?`, `tileSize?`, `installationType?`, `doors?: Partial<Record<Wall, RoomDoor>>`, `baseboardHeight?: number`, `wallShape?: RoomShape`, `wallTiling?: WallTiling`, `wallFinish?: WallFinish`, `windows?: Partial<Record<Wall, RoomWindow>>`, `dimensions?: RoomDimensions`) |
| `Item` | `Item.ts` | interface (extins cu `origin: ItemOrigin`, `createdAt: string`, `purchasedAt?: string`) |
| `Project` | `Project.ts` | interface (extins cu `totalArea?: number`) |
| `ProjectSummary` | `ProjectSummary.ts` | interface (agregări server-side: `totalEstimated`, `totalSpent`, `budgetRemaining`, `purchaseProgress`, `boughtCount`, `costPerRoom: RoomCost[]`, `costPerCategory: CategoryCost[]`, `technical: TechnicalSummary`) |
| `SpendingTimelinePoint` | `SpendingTimelinePoint.ts` | interface (`month: string` "yyyy-MM", `cumulativeSpent: number`) — serie cumulativă pe luna cumpărării |
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

### 2026-07-12 — `DashboardSummaryCard`: layout compact pe mobil (2 coloane în loc de 1)
**De ce:** userul a semnalat că pe telefon cardul de sumar (aplicat pe toate paginile) ocupa mult spațiu vertical inutil — pe mobil grila era `grid-cols-1` (toate metricile stivuite), iar etichetele lungi și footer-ele se trunchiau cu `truncate`.

- Grid schimbat din `grid-cols-1 sm:grid-cols-2 lg:grid-cols-{n}` în **`grid-cols-2` mereu** (inclusiv pe telefon), cu `lg:grid-cols-{n}` doar de la 1024px în sus — reduce înălțimea cardului la jumătate pe mobil (2×2 în loc de 4×1 pt. 4 metrici).
- Adăugate separatoare vizuale (`border-r`/`border-b`) calculate per-index, ca grila 2 coloane să arate intenționat, nu doar înghesuit — dacă numărul de metrici e impar (ex. 3 pe `/centralizator`), ultimul ocupă `col-span-2` pe rândul lui.
- Eliminat `truncate` de pe etichete și pe footer-ul `SummaryAccentFooter` — acum fac wrap pe 2 rânduri în loc să taie textul cu „…” (ex. „Buget total estimat", „38% din total estimat").
- Mărimea cifrei mari trece de la `clamp(16px, 1.6vw, 26px)` la `clamp(13px, 4vw, 26px)` — pe coloane înguste de mobil (jumătate din lățimea ecranului) cifrele încap acum complet (ex. „12.500,00 EUR" pe `/configurare`, care se trunchia înainte).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual pe toate cele 4 pagini la 375px (card compact, fără trunchiere) și reconfirmat 900px/1440px (desktop neschimbat, fără suprapuneri).

**Fișiere atinse:** `src/components/DashboardSummaryCard.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — `/configurare`: card „Suprafață Totală Apartament (MP)" + aliniere inputuri la ecranul Stitch nou
**De ce:** userul a adăugat în Stitch un ecran nou, „Configurare Tehnică - cu Input Suprafață Totală" (proiect `14594146001803528847`), cu un card nou de input manual pentru suprafața totală a apartamentului, plus inputuri/selecturi cu colțuri `rounded-lg` (nu `rounded-xl` ca în implementarea anterioară). A cerut implementarea cardului și alinierea stilului de input la acest ecran.

- **Model de date extins**: `Project` (`src/shared/types/Project.ts`) primește `totalArea?: number` — suprafața totală introdusă manual de user, sursa de adevăr pt. „Suprafață Utilă" din cardul de sumar (înainte calculată doar ca sumă a `floorArea` per cameră). Opțional: dacă nu e completată, cardul de sumar cade back pe suma camerelor (`projectTechnicalSummary(rooms).totalFloorArea`), ca să nu afișeze 0 pe un proiect nou.
- **`RenovationStore`** (`src/shared/types/RenovationStore.ts`) primește metodă nouă `updateProject(patch: Partial<Project>)`, implementată în `store.tsx` (`setProject` + merge shallow, la fel ca `updateRoom`/`updateItem`).
- **Card nou** în `configurare/page.tsx`, imediat sub sumarul global: icon `square_foot` (adăugat în `TECHNICAL_ICONS.totalArea`, plus `TECHNICAL_ICONS.info` pt. iconița de subtitlu), titlu, subtitlu explicativ, input numeric cu sufix „mp" — markup extras direct din HTML-ul ecranului Stitch (`bg-surface-container-lowest` → `bg-surface-low` pe token-urile noastre).
- **Aliniere colțuri inputuri**: `selectCls`/`inputCls` din `RoomTechnicalCard.tsx` trec de la `rounded-xl` la `rounded-lg` (diferența vizibilă exactă față de HTML-ul noului ecran Stitch, unde toate `<input>`/`<select>` de configurare tehnică folosesc `rounded-lg`). Containerele mai mari (blueprint placeholder, panoul „Calcule Detaliate") rămân `rounded-xl`, neschimbate — Stitch le păstrează la fel. Inputul „Buget alocat" per cameră din `page.tsx` aliniat la aceeași convenție (`rounded-md` → `rounded-lg`).
- `mock-data.ts`: `mockProject.totalArea = 85` (aceeași valoare ca în mockup-ul Stitch), ca noul câmp să aibă o valoare vizibilă din start.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent, nelegat, pe `<img>` din `/elemente`). Testat vizual desktop (1440px) și mobil (375px): cardul nou randează identic cu mockup-ul, editarea valorii actualizează live „Suprafață Utilă" din cardul de sumar, zero erori în consolă.

**Fișiere atinse:** `src/shared/types/Project.ts`, `src/shared/types/RenovationStore.ts`, `src/shared/store.tsx`, `src/shared/mock-data.ts`, `src/shared/icons.ts`, `src/app/configurare/page.tsx`, `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — `/configurare`: bordură nouă `line-strong` pt. delimitare clară a inputurilor/selecturilor
**De ce:** userul a semnalat că, deși inputurile/selecturile fuseseră deja aliniate la noul ecran Stitch, delimitarea vizuală tot nu era suficient de clară — bordura `border-line` (#e2e8f0) e prea deschisă, aproape invizibilă pe fundal alb. Ecranul Stitch de referință folosește `outline-variant` (#c6c6cd), o bordură mult mai vizibilă, identică pe input ȘI select (fără diferențiere de fundal între ele).

- **Token nou** în `globals.css`: `--border-strong: #cbd5e1` (slate-300), expus ca `--color-line-strong` → clasa Tailwind `border-line-strong`. Adăugat lângă `--border` existent, nu îl înlocuiește (restul aplicației, carduri/containere, rămâne pe `border-line`, neatins — schimbarea e scopată strict la câmpurile de input/select din `/configurare`, unde a fost cerută).
- **`RoomTechnicalCard.tsx`**: `selectCls`/`inputCls` trec de la `border-line` + fundaluri diferite (`bg-surface-low` pt. select, `bg-surface` pt. input) la `border-line-strong` + fundal alb unitar (`bg-surface`) pe ambele — diferențierea select/input rămâne clară doar prin chevron-ul custom (`SelectField`), nu prin culoare de fundal, exact ca în mockup.
- **`page.tsx`**: inputul „Suprafață Totală Apartament" și „Buget alocat" per cameră aliniate la același `border-line-strong`.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual desktop (1440px): bordurile se disting clar pe fundal alb, select-urile au chevron vizibil distinct de inputurile numerice simple, zero erori în consolă.

**Fișiere atinse:** `src/app/globals.css`, `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/configurare/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — Cardurile de cameră (Baie, Bucătărie etc.) refăcute 1:1 după „Configurare Tehnică - cu Input Suprafață Totală"
**De ce:** userul a cerut ca structura internă a cardurilor de cameră din `/configurare` să corespundă exact ecranului Stitch de referință — sub-secțiuni numerotate, colapsabile individual, nu un singur bloc plat „1. Configurare Tehnică" cu titluri simple.

- **`RoomTechnicalCard.tsx` restructurat**: componentă nouă `TechnicalSection` (accordion nativ `<details>`/`<summary>`, cu `group/section` + chevron care se rotește la `group-open/section:rotate-180`, exact markup-ul din Stitch) — înlocuiește vechile `<h5>` simple. Fiecare cameră are acum: „1. Pardoseală & Pereți" (mereu deschisă implicit), „2. Placări Detaliate" (doar dacă placarea e activată pt. cameră) și „Configurare Ușă" — numerotată dinamic 2 sau 3 în funcție de prezența secțiunii de placare (`doorSectionNumber = wallTilingEnabled ? 3 : 2`), la fel ca în mockup (Living Room fără placare → Configurare Ușă e a 2-a secțiune; Baie cu placare → a 3-a).
- **Rândul de sumar colapsat** (când cardul camerei e închis) diferă acum pe tip de cameră, ca în Stitch: camere cu placare afișează „X mp Pardoseală / Y mp Faianță / Înălțime placare: Zm"; restul afișează „X mp / Material / Y ml Plintă" (comportamentul vechi).
- **Toggle-ul de placare pereți** ("+ Adaugă placare" / "Elimină placare") mutat din antet separat în `action` al `TechnicalSection` (când activat) sau, când dezactivat, redat ca buton dedicat cu bordură punctată — mockup-ul nu are acest toggle explicit (fiecare cameră din Stitch e presetată wet/dry), dar păstrăm funcționalitatea existentă (orice cameră poate activa placarea), doar restilizată.
- **Deviații deliberate, documentate și de această dată** (consecvente cu deciziile anterioare din 2026-07-12): (1) inputul „Perimetru" rămâne — mockup-ul nu are un input explicit pt. el (calculul de „Plintă" din exemplul Living Room pare să folosească o valoare hardcodată invizibilă în design), dar fără el calculul de plintă ar fi decorativ pt. camerele fără placare pereți; (2) butonul „Salvează Configurarea" din mockup (per card, la finalul rezultatelor) NU a fost adăugat — store-ul scrie deja instant la fiecare modificare, un buton de „salvare" separat ar fi decorativ/mincinos vizual, aceeași motivație documentată la 2026-07-12 pt. „Salvare Plan" global.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual desktop (1440px): accordion-urile se deschid/închid independent (native `<details>`), numerotarea dinamică corectă pe Baie Principală (3 secțiuni, cu placare) și Bucătărie (2 secțiuni, fără placare), zero erori reale în consolă (după curățare completă cache Turbopack — `.next` șters, server repornit — confirmat că erorile de parsing raportate inițial de `read_console_messages` erau istoric stale dintr-o versiune intermediară a fișierului, nu erori curente).

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — „Buget alocat" lipit de cardul camerei + header-e de accordion pe fundal alb
**De ce:** userul a semnalat două probleme din capturi: (1) rândul „Buget alocat (€)" era o cutie separată, cu bordură/colțuri proprii și un gap vizibil sub cardul camerei, în loc să pară parte din el; (2) header-ele de accordion (header-ul camerei „Baie Principală" și cele de sub-secțiune „1. Pardoseală & Pereți") aveau fundal albăstrui (`bg-surface-low`), cerut să fie alb.

- **„Buget alocat" mutat în `RoomTechnicalCard.tsx`**: rând nou, direct sub `<button>`-ul header-ului camerei, în interiorul aceluiași container cu `overflow-hidden rounded-lg` — fără gap, fără bordură/colțuri proprii (doar `border-b` de separare), deci vizual lipit de card. Editarea bugetului folosește `patch()` (același helper local ca restul câmpurilor camerei), nu mai trece prin `updateRoom` din `page.tsx`.
- **`page.tsx` simplificat**: bucla `rooms.map` nu mai randează un `<div>` wrapper cu cardul + cutia de buget separată, doar `<RoomTechnicalCard key={room.id} room={room} />`. `updateRoom` eliminat din destructurarea `useStore()` (nu mai e folosit direct în `page.tsx`).
- **Fundal alb pe header-e**: `bg-surface-low` → `bg-surface` pe header-ul `<button>` al camerei și pe `<summary>` din `TechnicalSection`. Restul utilizărilor de `bg-surface-low` (formula din `ResultRow`, hover pe butonul „Adaugă placare", placeholder-ul de schiță) au rămas neschimbate — nu sunt header-e de dropdown.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual: „Buget alocat" apare acum imediat sub header-ul camerei, în aceeași cutie; header-ele de accordion sunt albe, delimitate doar prin bordură subtilă.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/configurare/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — Eliminare „Perimetru", „Mărime plăci" condiționat de Gresie, pereți placați afișați doar câți sunt selectați
**De ce:** userul a cerut, pe bază de capturi: (1) eliminarea completă a câmpului „Perimetru" (nu mai e necesar); (2) „Mărime plăci" să apară doar când tipul de material e Gresie (nu are sens la Parchet/Mochetă); (3) la „Placări Detaliate", să vadă doar inputurile pentru pereții pe care chiar îi placă (conform „Număr pereți placați"), nu toate cele 4 (N/E/S/V) mereu; (4) select-urile să rămână albe, la fel ca inputurile (revenire asupra fundalului subtil `bg-background` adăugat în sesiunea anterioară).

- **Câmpul „Perimetru" șters** din `RoomTechnicalCard.tsx`. **Consecință de reținut**: `baseboardLength()` (funcția care calculează „Plintă") folosește în continuare `room.perimeter`, dar acesta nu mai are un editor UI — rândul „Plintă" din panoul de rezultate se afișează doar dacă o cameră are deja o valoare de perimetru (ex. din `mock-data.ts`); camerele noi nu vor avea acest calcul până nu se decide un nou mod de completare (of. viitor: derivare din pereții placați, sau reintroducere ca și câmp).
- **„Mărime plăci" condiționat**: `SelectField` randat doar dacă `room.floorMaterial === FlooringType.Gresie`.
- **Pereți placați afișați condiționat**: în secțiunea „Placări Detaliate", inputurile de lungime pt. pereți (`Perete N/E/S/V`) sunt acum `walls.slice(0, tiledWallsCount)` — dacă „Număr pereți placați" = 3, apar doar primii 3 (N, E, S), nu și V; dacă = 0, blocul de inputuri nu se afișează deloc. Ordinea (N→E→S→V) e aceeași folosită deja de `dimensions.ts` (`wallOrder`) pt. calculul de faianță, deci UI-ul reflectă exact ce se calculează.
- **Select-uri revenite la fundal alb**: `selectCls` de la `bg-background` înapoi la `bg-surface` — identic cu inputurile, la cererea explicită a userului.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual: Baie Principală (Gresie, 3 pereți placați) — „Mărime plăci" vizibil, doar Perete N/E/S afișate; fără „Perimetru" nicăieri.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — Buget alocat opțional (hide/show) + statisticile din header ascunse pe mobil în loc să strice layout-ul
**De ce:** userul a semnalat două probleme, cu capturi de pe telefon: (1) „Buget alocat" era mereu vizibil și obligatoriu vizual, deși nu toate camerele au nevoie de el; (2) pe mobil, rândul de statistici din header-ul camerei („5.40 mp pardoseală" etc.) nu încăpea și, din cauza `flex-wrap`, împingea butoanele de expand/ștergere în stânga, sub titlu — layout complet stricat.

- **Buget alocat opțional**: `RoomTechnicalCard` primește state local `budgetOpen`, inițializat `true` doar dacă `room.allocatedBudget > 0`. Dacă e închis, se afișează un rând subțire „+ Adaugă buget alocat" (link, nu ocupă spațiu vizual greu); la click se deschide inputul. Când e deschis, are acum și un buton „×" care resetează bugetul la 0 și ascunde rândul din nou — bugetul nu mai pare o cerință obligatorie.
- **Header cameră restructurat pe mobil**: butonul header nu mai e `flex-wrap` (cauza reflow-ului greșit) — rămâne `flex items-center justify-between`, cu `min-w-0`/`truncate` pe blocul titlu (nume lung de cameră nu mai împinge restul), și `shrink-0` pe blocul de butoane (chevron + ștergere), ca acestea să rămână mereu fixate în dreapta, pe același rând cu titlul.
- **Statisticile din header** ([]„mp pardoseală”, „mp faianță” etc.) mutate de la `flex flex-wrap` (vizibil peste tot, dar se rupea urât pe ecrane mici) la `hidden lg:flex` — **complet ascunse sub 1024px**, vizibile doar pe ecrane suficient de late încât să încapă pe un singur rând lângă titlu. Comportament conform cerinței explicite: „dacă nu ajung toate datele pe telefon, nu le pui” — mai bine lipsă decât layout stricat.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual: mobil (375px) — header cu titlu stânga + butoane dreapta, fără statistici, fără reflow; desktop (1440px) — statisticile revin, aliniate corect pe un singur rând; toggle buget alocat funcțional (adaugă/elimină) pe ambele camere.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — Padding redus pe mobil + fundal subtil pe corpul secțiunilor (grupare vizuală)
**De ce:** userul a semnalat, cu capturi de pe telefon: (1) inputurile arată mici/înghesuite pe mobil — padding-ul generos (`p-6`, `gap-6`) gândit pt. desktop lasă prea puțin spațiu efectiv câmpurilor pe ecran îngust; (2) corpul secțiunilor („Pardoseală & Pereți" etc.) e alb identic cu restul cardului, greu de distins vizual ca grup separat.

- **Padding/gap responsive** în `RoomTechnicalCard.tsx`: `p-6`/`gap-6`/`gap-8` (fix, gândite pt. desktop) devin `p-3 sm:p-6` / `gap-3 sm:gap-6` / `gap-6 sm:gap-8` — mai puțin spațiu irosit pe mobil (sub breakpoint-ul `sm`, 640px), identic cu înainte pe desktop. Aplicat pe: wrapper-ul principal al conținutului cardului, corpul `TechnicalSection`, și toate grid-urile de câmpuri (Pardoseală & Pereți, Placări Detaliate, Configurare Ușă).
- **Fundal subtil pe corpul secțiunilor**: `<div className="space-y-6 bg-surface p-6">` (corpul din `TechnicalSection`) trece la `bg-background` (`#f8f9ff`, tokenul de fundal al paginii — foarte apropiat de alb, dar suficient de diferit cât să delimiteze vizual grupul de restul cardului alb). Header-ul (`<summary>`) rămâne `bg-surface` (alb), deci acum header vs. corp au o diferență subtilă suplimentară față de bordura existentă.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual mobil (375px): inputurile au vizibil mai mult spațiu relativ, secțiunile se disting clar ca grupuri prin nuanța de fundal; desktop (1440px) neschimbat.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — Rafinament final inputuri `/configurare`: border pe header-e, fără sufixe de unitate, „Tip montaj" full-width, fundal subtil pe select-uri
**De ce:** userul a semnalat, pe bază de capturi: (1) header-ele de sub-secțiune („1. Pardoseală & Pereți" etc.) și corpul lor sunt acum ambele albe (schimbare din sesiunea anterioară) și se pierd vizual una în alta, fără o linie de separare; (2) sufixele de unitate afișate lângă inputuri (`ml`, `mp`, `m`) sunt redundante — informația e deja în label; (3) „Tip montaj", ultimul câmp dintr-un grid cu număr impar de elemente, rămâne singur pe ultimul rând dar ocupă doar jumătate din lățime; (4) select-urile (dropdown-urile) sunt greu de distins de inputurile simple pe fundal alb identic.

- **`TechnicalSection`**: `<summary>` primește `border-b border-line`, separă vizual clar header-ul de corpul secțiunii (ambele rămân albe, dar acum delimitate).
- **Sufixe de unitate eliminate** din toate inputurile din `RoomTechnicalCard.tsx` (`Suprafață`, `Perimetru`, `Înălțime Placare`) și din inputul „Suprafață Totală Apartament" din `page.tsx` — unitatea e mutată în text în label (`Perimetru (ML)`), inputul redevine un `<input>` simplu, fără `<div className="flex items-center gap-2">` de împachetare.
- **„Tip montaj" full-width**: `SelectField` primește prop nou `wrapperClassName`, folosit aici cu `"md:col-span-2"` ca să ocupe tot rândul din grid-ul cu 2 coloane, în loc să rămână pe jumătate cu spațiu gol lângă el.
- **Fundal subtil pe select-uri**: `selectCls` trece de la `bg-surface` (alb, identic cu inputurile) la `bg-background` (`#f8f9ff`, tokenul de fundal al paginii — o nuanță foarte discretă, aproape imperceptibilă, dar suficientă cât să distingă vizual un dropdown de un input simplu, fără să introducă o culoare nouă în paletă).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual: header-ele de secțiune au acum o linie de separare clară, niciun input nu mai are text de unitate alături, „Tip montaj" ocupă tot rândul, select-urile au un fundal ușor diferit de inputurile numerice.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/configurare/page.tsx`, `docs/progress.md`.

**Branch:** `004-configurare-apartament-design-tehnic`.

### 2026-07-13 — Revert `border-line-strong`: bordurile de pe `/configurare` ieșeau prea închise
**De ce:** userul a semnalat că inputurile/select-urile de pe `/configurare` au o bordură vizibil mai închisă decât restul aplicației (arăta „negru"), inconsistent cu convenția existentă — restul paginilor (`/elemente`, `PageHeader`, `Drawer` etc.) folosesc mereu `border-line` (`#e2e8f0`), niciodată o variantă mai puternică.

- Toate utilizările `border-line-strong` din `RoomTechnicalCard.tsx` și `page.tsx` (introduse în două sesiuni anterioare din aceeași zi, ca reacție la o cerere de bordură „mai vizibilă") revenite la `border-line` — aliniat cu restul aplicației.
- Token-ul `--border-strong` / `--color-line-strong` șters din `globals.css` (nefolosit nicăieri altundeva).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual desktop (1440px): bordurile de pe `/configurare` sunt acum identice ca nuanță cu restul aplicației.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/configurare/page.tsx`, `src/app/globals.css`, `docs/progress.md`.

**Branch:** `005-padding-mobil-fundal-sectiuni`.

### 2026-07-13 — Fix: scroll-ul paginii din spate nu se bloca la deschiderea drawer-elor/dialogurilor
**De ce:** userul a semnalat că, la orice drawer sau dialog deschis (Adaugă/Editează Cameră, Adaugă/Editează Element, Confirmare Ștergere, meniul hamburger mobil), pagina din spate tot făcea scroll în loc să rămână fixă — pe telefon și pe desktop deopotrivă. Comportament greșit: doar conținutul overlay-ului ar trebui să facă scroll.

- **Hook nou** `useLockBodyScroll(locked: boolean)` în `src/shared/useLockBodyScroll.ts` — setează `document.body.style.overflow = "hidden"` cât timp `locked` e `true`, restaurează valoarea anterioară la `false`/unmount.
- Folosit în toate cele 3 componente cu overlay `fixed inset-0`: `Drawer.tsx` (RoomFormDrawer, ItemFormDrawer), `ConfirmDialog.tsx`, și meniul hamburger mobil din `Sidebar.tsx`.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat în browser: cu drawer-ul „Adaugă Cameră" deschis, scroll cu rotița peste zona de fundal (backdrop) nu mai mișcă pagina (`window.scrollY` neschimbat); la închidere, `body.style.overflow` revine la normal și scroll-ul funcționează din nou.

**Fișiere atinse:** `src/shared/useLockBodyScroll.ts` (nou), `src/components/Drawer.tsx`, `src/components/ConfirmDialog.tsx`, `src/components/Sidebar.tsx`, `docs/progress.md`.

**Branch:** `005-padding-mobil-fundal-sectiuni`.

### 2026-07-13 — Pagina nouă `/setari` — Configurare Monedă (ecran Stitch „Setări Proiect - Configurare Monedă")
**De ce:** userul a cerut crearea paginii de Setări (existentă doar ca link dezactivat în sidebar până acum) cu conținutul exact al ecranului Stitch dedicat — doar cardul „Configurare Monedă", nu întregul mockup de admin generic (sidebar/topbar proprii din Stitch, irelevante — aplicația are deja `Sidebar`/`PageHeader`).

- **Pagină nouă** `src/app/setari/page.tsx`: card „Configurare Monedă" (toggle segmentat RON/EUR, câmp „Curs Valutar" vizibil doar la EUR — decorativ, nu există încă sursă reală de curs, backlog item 6), card lateral „De Reținut" (fundal `bg-primary`, text alb) și card „Istoric Curs" (2 rânduri exemplu, marcate explicit „Exemplu — istoric real, neimplementat încă").
- **Toggle-ul de monedă e real, nu doar decorativ**: `Project.currency` există deja în model — butonul „Salvează Setările" apelează `updateProject({ currency })` din store (stare locală „pending" până la salvare, ca în design, nu se scrie live la fiecare click pe toggle).
- **Sidebar**: linkul „Setări" (înainte `<span>` needitabil, `cursor-not-allowed`, opacity-50) devine `<Link href="/setari">` real, cu stare activă (highlight) ca restul navigării; adăugat și în array-ul `nav` folosit de dropdown-ul mobil, plus în calculul titlului din bara mobilă.
- **`PageHeader`**: prop nou opțional `showSearch` (implicit `true`) — bara de căutare nu are sens pe Setări, deci pagina o dezactivează explicit (`showSearch={false}`), fără să afecteze restul paginilor.
- **Iconițe noi** în `icons.ts`: `SETTINGS_ICONS.currencyExchange`, `SETTINGS_ICONS.verifiedUser`.
- **Bug descoperit, NEATINS (în afara scopului „doar UI" cerut explicit)**: toate apelurile `formatMoney()` din `/configurare`, `/elemente`, `/centralizator`, `/analiza` sunt fără al doilea argument (`currency`), deci ignoră mereu `project.currency` și afișează implicit EUR — schimbarea monedei din Setări nu are niciun efect vizibil în restul aplicației până nu se corectează toate aceste apeluri (~30 locuri, în 4 fișiere). Semnalat userului, nu corectat acum.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat). Testat vizual desktop (1440px) și mobil (375px): layout identic cu mockup-ul, toggle funcțional (RON ascunde corect câmpul de curs), buton salvează scrie real în store (`updateProject`, confirmat prin navigare SPA — currency se schimbă în state, deși neafișat corect din cauza bug-ului de mai sus).

**Fișiere atinse:** `src/app/setari/page.tsx` (nou), `src/components/Sidebar.tsx`, `src/components/PageHeader.tsx`, `src/shared/icons.ts`, `docs/progress.md`.

**Branch:** `007-pagina-setari-configurare-moneda`.

### 2026-07-13 — Bani fără zecimale peste tot + conversia RON/EUR chiar funcțională (persistă în localStorage)
**De ce:** userul a cerut două reparații globale: (1) sumele afișate cu `,00` la final (ex. „3.585,00") ocupă spațiu inutil — vrea doar „3.585"; (2) toggle-ul de monedă din Setări (sesiunea trecută) nu avea niciun efect vizibil altundeva în aplicație, și oricum nu ținea minte alegerea userului între sesiuni.

- **`formatMoney()`** (`shared/functions/money.ts`): `minimumFractionDigits`/`maximumFractionDigits` de la 2 la 0 — toate sumele se afișează acum ca întregi (`3.585 EUR`, nu `3.585,00 EUR`).
- **Bug real reparat**: toate apelurile `formatMoney()` din `/configurare`, `/elemente`, `/centralizator`, `/analiza` (identificat în sesiunea trecută, ~30 de locuri) nu primeau `project.currency` — foloseau mereu implicit EUR. Fiecare pagină primește acum un helper local `money = (value) => formatMoney(value, project.currency)`, iar toate apelurile brute `formatMoney(` au fost înlocuite cu `money(`. `centralizator/page.tsx` nu avea `project` deloc în destructurarea `useStore()` — adăugat.
- **Persistare în `localStorage`** (`shared/store.tsx`): cheie `renovator-pro:currency`. La montare, un `useEffect` citește valoarea salvată și actualizează `project.currency` (citire doar client-side, ca să nu difere de randarea server — SSR pornește mereu cu `mockProject.currency`, evită mismatch de hidratare). `updateProject()` scrie în `localStorage` de fiecare dată când patch-ul conține `currency`.
- **Fix conex găsit în timpul testării**: pagina `/setari` își inițializa `pendingCurrency` local din `project.currency` direct la montare (`useState(project.currency)`) — dar store-ul citește din `localStorage` puțin mai târziu (efectul lui rulează după montare), deci toggle-ul rămânea vizual pe EUR chiar și când `localStorage` avea RON salvat. Reparat cu pattern-ul „adjusting state during render" deja folosit în `ItemFormDrawer`/`RoomFormDrawer` (comparare cu valoarea anterioară ținută în state, fără `useEffect` suplimentar).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (warning preexistent nelegat, plus un `eslint-disable-next-line react-hooks/set-state-in-effect` documentat în `store.tsx` — sincronizare legitimă cu un sistem extern, nu anti-pattern-ul de randare interzis). Testat end-to-end în browser: schimbat moneda în Setări → RON, salvat, verificat `localStorage.getItem('renovator-pro:currency') === 'RON'`, navigat SPA la `/elemente` → toate sumele afișate corect în RON; refresh complet al paginii (`navigate`) → RON persistă corect din `localStorage`, toggle-ul din Setări arată selecția corectă (nu revine la EUR).

**Fișiere atinse:** `src/shared/functions/money.ts`, `src/shared/store.tsx`, `src/app/setari/page.tsx`, `src/app/configurare/page.tsx`, `src/app/elemente/page.tsx`, `src/app/centralizator/page.tsx`, `src/app/analiza/page.tsx`, `docs/progress.md`.

**Branch:** `008-bani-fara-zecimale-si-conversie-functionala`.

### 2026-07-14 — Sincronizare automată „Configurare Apartament" → „Elemente de Cumpărat"
**De ce:** userul a cerut ca elementele de pardoseală/plintă/faianță calculate în `/configurare` să apară automat în `/elemente` (fără preț, doar cantitate) de îndată ce sunt măsurate, vizual distincte de intrările adăugate manual — ca să nu le uite la calculul bugetului. A confirmat separat că adăugarea unei camere noi propagă deja peste tot: `rooms` vine dintr-un singur `useStore()` global (React Context), nu există liste de camere separate per pagină — deci acea parte a cerinței era deja satisfăcută de arhitectura existentă, fără cod nou.

- **Enum nou** `ItemOrigin` (`src/shared/types/ItemOrigin.ts`): `Manual` / `Configurare`. Adăugat ca prop obligatorie pe `Item` (`origin: ItemOrigin`) — toate punctele de creare (`quickAdd` în `elemente/page.tsx`, `ItemFormDrawer.tsx`, `mock-data.ts`) setează explicit `ItemOrigin.Manual`.
- **`MaterialType`** extins cu `Plinta = "Plintă"` — categorie nouă, nu exista deloc înainte (plinta nu avea nicio reprezentare în lista de cumpărături).
- **`dimensions.ts` promovat din `app/configurare/` în `shared/functions/`** (regula „a doua utilizare → shared" din `CLAUDE.md`): acum e folosit și din `store.tsx`, nu doar din pagina `configurare`. Toate importurile actualizate (`RoomTechnicalCard.tsx`, `configurare/page.tsx`).
- **Funcție nouă** `generateAutoItems(room)` (`shared/functions/auto-items.ts`): din câmpurile tehnice ale unei camere (`floorMaterial`/`floorArea`, `perimeter`/`door`, `wallTiling`) generează până la 3 elemente — pardoseală (Gresie/Parchet, mapat din `FlooringType`; `Mochetă` cade pe `MaterialType.Altele`, nu are categorie proprie), Plintă, Faianță — toate cu `unitPrice: 0`, `origin: ItemOrigin.Configurare`.
- **Funcție nouă** `syncAutoItemsForRoom(items, room, createId)`: reconciliază elementele auto ale unei camere cu configurarea curentă — elementele existente (identificate după `roomId` + `materialType`, `origin: Configurare`) își păstrează `id`/`unitPrice`/`status` (userul poate completa prețul manual în `/elemente` fără să fie suprascris la următoarea editare din `/configurare`), doar numele/cantitatea se actualizează; elementele noi apărute se creează, cele a căror măsurătoare a fost ștearsă dispar. Elementele `ItemOrigin.Manual` nu sunt niciodată atinse.
- **`store.tsx` → `updateRoom`**: după ce aplică patch-ul pe `rooms`, apelează `syncAutoItemsForRoom` pe `items` — orice modificare tehnică din `RoomTechnicalCard` (care scrie mereu prin `updateRoom`) declanșează sincronizarea, fără cod nou în pagina `configurare` însăși. `store.tsx` rămâne orchestrare CRUD (regula „store fără calcule" respectată — calculul propriu-zis trăiește în `auto-items.ts`).
- **Component nou** `OriginBadge.tsx` (`src/components/`): capsulă mică „Din Configurare" (culoare `secondary`, iconiță `calculate`), randată doar când `item.origin === ItemOrigin.Configurare`. Folosit în `/elemente` lângă numele elementului (desktop + mobil); rândul respectiv primește și un fundal `bg-secondary/5` + bordură stângă `border-l-secondary` pt. evidențiere suplimentară în tabel/listă.
- Verificat: `npx tsc --noEmit` → 0 erori (a necesitat completarea `MATERIAL_BADGE_STYLES` din `centralizator/page.tsx` cu noua cheie `Plinta`), `npm run lint` → 0 erori (warning preexistent nelegat, `no-img-element`). Testat end-to-end în browser: modificat suprafața pardoselii la „Baie Principală" în `/configurare` → în `/elemente` au apărut instant 3 rânduri noi („Gresie (Pardoseală)", „Plintă", „Faianță (3 pereți)") cu badge „Din Configurare", evidențiere vizuală, cantități corecte, preț 0 RON editabil; total elemente cameră 3→6 confirmat.

**Fișiere atinse:** `src/shared/types/ItemOrigin.ts` (nou), `src/shared/types/Item.ts`, `src/shared/types/MaterialType.ts`, `src/shared/types/index.ts`, `src/shared/functions/dimensions.ts` (mutat din `app/configurare/dimensions.ts`), `src/shared/functions/auto-items.ts` (nou), `src/shared/functions/index.ts`, `src/shared/store.tsx`, `src/shared/mock-data.ts`, `src/app/configurare/page.tsx`, `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/elemente/page.tsx`, `src/app/centralizator/page.tsx`, `src/components/ItemFormDrawer.tsx`, `src/components/OriginBadge.tsx` (nou), `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Placeholder-uri reale în loc de `0` pe toate inputurile numerice fără date
**De ce:** userul a semnalat că orice input numeric fără valoare încă (suprafață, buget, lățime ușă etc.) afișa `0` ca valoare reală controlată — trebuia să apeși Delete înainte de a scrie, și nu exista niciun indiciu de format așteptat (ex: la lățime ușă, „ce bag acolo, 08 sau 0.8?”).

- Toate inputurile numerice fără o valoare reală încă (optionale pe `Room`, sau state local de formular fără prefill din date existente) au trecut de la `value={x ?? 0}` la `value={x ?? ""}` (sau `value={x || ""}` pt. câmpuri unde 0 nu are sens fizic — lățime/înălțime/suprafață), cu `placeholder="ex: <valoare tipică, formatul corect>"`. La blur/schimbare, string gol → `undefined` (pt. câmpuri opționale pe `Room`) sau `0` (pt. sub-structuri obligatorii ca `door`/`wallTiling`).
- Atinse: `RoomTechnicalCard.tsx` (buget alocat, suprafață, înălțime placare, lungimi pereți, lățime/înălțime ușă), `RoomFormDrawer.tsx` (buget cameră nouă — stare locală trecută din `number` în `string`), `ItemFormDrawer.tsx` (cantitate, preț unitar — idem, parsate la submit cu fallback `1`/`0`). `/elemente` (adăugare rapidă), `/configurare` (suprafață totală apartament) și `/setari` (curs valutar) erau deja implementate corect — folosite ca referință.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat în browser: câmpul „Lățime (m)” de la o cameră neconfigurată arată acum `ex: 0.80` (nu `0`), scris direct fără Delete în prealabil.

**Fișiere atinse:** `src/app/configurare/RoomTechnicalCard.tsx`, `src/components/RoomFormDrawer.tsx`, `src/components/ItemFormDrawer.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Corectare logică de calcul: plintă inclusă în gresie, faianță doar la Gresie, vopsea/tapet la Parchet/Mochetă
**De ce:** userul a semnalat că logica de calcul tehnic era „extraordinar de greșită”: (1) la Gresie, plinta era tratată ca produs separat, deși în realitate se taie din aceleași plăci — deci trebuie adăugată la necesarul total de gresie, cu pierderile ei proprii; (2) faianța nu are sens la Parchet (nu poți placa cu faianță un perete lângă parchet fără sens tehnic) — trebuia eliminată complet din UI la Parchet; (3) la Parchet, userul vrea în schimb vopsea și/sau tapet, calculate pe mp, alese independent per perete (poate vrea tapet doar pe un perete, vopsea pe restul). Confirmat cu userul (3 întrebări clarificatoare): înălțime plintă editabilă per cameră, config per-perete pt. vopsea/tapet (ca la faianță), Mochetă se comportă ca Parchet.

- **Model de date** (`Room.ts`): câmp nou `baseboardHeight?: number` (m) — înălțimea plintei, folosită doar la Gresie pt. a calcula suprafața ei. Câmp nou `wallFinish?: WallFinish` — alternativa la `wallTiling`, disponibilă doar la Parchet/Mochetă.
- **Tipuri noi**: `WallFinishType` (enum: Vopsea/Tapet), `WallFinish` (interface: `wallHeight`, `wallLengths` per `Wall`, `finishes: Partial<Record<Wall, WallFinishType>>` — fiecare perete independent, poate fi Vopsea, Tapet, sau neconfigurat). `MaterialType` extins cu `Tapet` (`Vopsea` exista deja).
- **`dimensions.ts` rescris**:
  - `baseboardTileArea(room)` (nou) — `baseboardLength(room) × baseboardHeight`, doar dacă `floorMaterial === Gresie` și `baseboardHeight` completat; altfel 0 (plinta la Parchet/Mochetă rămâne produs separat, nu se face din parchet).
  - `floorMaterialNeeded(room)` — acum include `baseboardTileArea` când e Gresie (suma celor două componente, fiecare cu propria pierdere aplicată deja — nu se dublează pierderea).
  - `wallTilingArea`/`doorWallBaseboardLength` — întorc explicit 0 dacă `floorMaterial !== Gresie` (siguranță suplimentară, chiar dacă UI-ul deja nu permite combinația).
  - `wallFinishArea(room, type)` (nou) — suprafață vopsea/tapet pe pereții cu `finishes[wall] === type`, minus golul ușii dacă e pe un perete cu acel finisaj; pierdere 10% la Vopsea, 15% la Tapet (tapetul are pierdere mai mare din potrivirea modelului la îmbinări).
- **`auto-items.ts` actualizat**: la Gresie, elementul de pardoseală se numește „Gresie (Pardoseală + Plintă)” când plinta e inclusă, și NU mai generează un element „Plintă” separat (era dublare de cantitate înainte de fix). La Parchet/Mochetă, plinta rămâne element separat ca înainte; apar elemente noi „Vopsea (N pereți)”/„Tapet (N pereți)” quando `wallFinish` are pereți configurați cu aria > 0.
- **`RoomTechnicalCard.tsx` rescris semnificativ**: câmp nou „Înălțime plintă (m)” (doar la Gresie, lângă „Mărime plăci”). Secțiunea 2 (`Placări Detaliate`/`Finisaj Pereți`) e acum condiționată de `isGresie`: la Gresie rămâne UI-ul de faianță neschimbat; la Parchet/Mochetă apare un UI nou — un `select` „Tip Material” schimbă automat între cele două (funcția `changeFloorMaterial` curăță `wallTiling`/`wallFinish` la comutare, ca să nu rămână date orfane invizibile), grid de 4 pereți (N/E/S/V) fiecare cu lungime + `select` „— Fără —”/Vopsea/Tapet independent, plus o înălțime comună a pereților. Panoul „Calcule Detaliate” actualizat: rândul de pardoseală arată formula compusă (bază + plintă) când e cazul, rând „Plintă” apare doar la Parchet/Mochetă, rândurile de Faianță doar la Gresie, rânduri noi Vopsea/Tapet doar la Parchet/Mochetă cu aria > 0.
- Verificat: `npx tsc --noEmit` → 0 erori (a necesitat completarea `MATERIAL_BADGE_STYLES` din `centralizator/page.tsx` cu noua cheie `Tapet`), `npm run lint` → 0 erori. Testat end-to-end în browser: Baie Principală (Gresie) — completat „Înălțime plintă” 0.08m → rândul „Gresie (Pardoseală + Plintă)” a devenit 6.65 mp = (5.40×1.10) + (8.93 ml × 0.08 m) = 5.94 + 0.71, verificat manual; „Elemente de Cumpărat” nu mai are un rând „Plintă” separat pt. această cameră. Living & Dining (Parchet) — activat „Finisaj Pereți”, perete N 5m Vopsea + perete E 4m Tapet, înălțime 2.5m, ușă pe peretele N (0.9×2.1m): Vopsea calculat 11.67 mp = (5×2.5 − 0.9×2.1) × 1.10, Tapet 11.50 mp = (4×2.5) × 1.15 — ambele confirmate manual și reflectate identic în „Elemente de Cumpărat” cu badge „Din Configurare”, plus „Plintă” 21.11 ml ca element separat (corect, Parchet nu consumă plinta din parchet).

**Fișiere atinse:** `src/shared/types/WallFinishType.ts` (nou), `src/shared/types/WallFinish.ts` (nou), `src/shared/types/Room.ts`, `src/shared/types/MaterialType.ts`, `src/shared/types/index.ts`, `src/shared/functions/dimensions.ts`, `src/shared/functions/auto-items.ts`, `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/centralizator/page.tsx`, `docs/progress.md`, `docs/api-contract.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Auto-completare lungime pereți (√suprafață) + ferestre cu calcul de arie și glaf
**De ce:** userul a semnalat două lucruri: (1) la activarea faianței (Gresie) sau a finisajului (Parchet/Mochetă), toate cele 4 câmpuri de lungime perete porneau de la 0 — voia o valoare implicită plauzibilă, pornind de la ipoteza „cameră pătrată" derivată din suprafața pardoselii, ca să nu completeze de la zero fiecare perete; (2) voia să poată adăuga ferestre (max. 1 per perete, cu lățime+înălțime), care să scadă aria geamului din necesarul de faianță/vopsea/tapet al peretelui respectiv, PLUS să adauge un calcul separat pt. „colțurile de unire perete-fereastră" (glaful/bordura din jurul ferestrei) — confirmat cu userul: glaf ca o cantitate separată în ml (analog plintei), nu doar scăderea ariei.

- **`estimatedSquareWallSide(room)`** (nou, `dimensions.ts`): `√floorArea`, folosită DOAR ca valoare implicită la `toggleWallTiling`/`toggleWallFinish` (momentul activării) — nu se resincronizează ulterior dacă userul schimbă suprafața, exact ca să nu suprascrie o editare manuală a lungimilor.
- **Tip nou `RoomWindow`** (`width`, `height`) și câmp nou `Room.windows?: Partial<Record<Wall, RoomWindow>>` — max. o fereastră per perete (N/E/S/V), indiferent de tipul de pardoseală (fereastra există independent de faianță/vopsea/tapet).
- **`windowArea(room, wall)`** (nou) — scăzută acum în `wallTilingArea` și `wallFinishArea` la fel ca golul ușii (pe lângă ușă, nu în locul ei — pot coexista pe același perete).
- **`windowTrimLength(room)`** (nou) — Σ perimetrul fiecărei ferestre (2×(lățime+înălțime)) + 5% pierdere la tăiere, indiferent de pardoseală; generează un element nou de cumpărat „Glaf Fereastră (N ferestre)”, `MaterialType.GlafFereastra` (enum nou), în `auto-items.ts`.
- **`RoomTechnicalCard.tsx`**: secțiune nouă „Ferestre” (întotdeauna prezentă, numerotare dinamică — locul 2 sau 3 după cum e activă faianța/finisajul), grid de 4 pereți cu buton „+ Fereastră”/„Elimină” per perete și, când activă, 2 inputuri (lățime/înălțime). Panoul „Calcule Detaliate” are un rând nou „Glaf Fereastră” (ml) când există cel puțin o fereastră.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat end-to-end în browser: Bucătărie (Gresie, 10 mp) — activat faianța pe 4 pereți → toate lungimile s-au completat automat cu 3.16 (√10); adăugat fereastră pe Perete N (1.2×1.4 m, înălțime placare 2.5m) → „Faianță (4 pereți)” = 32.91 mp = ((4×3.16×2.5) − 1.2×1.4) × 1.10, verificat manual; „Glaf Fereastră (1 fereastră)” = 5.46 ml = 2×(1.2+1.4)×1.05, verificat manual.

**Fișiere atinse:** `src/shared/types/RoomWindow.ts` (nou), `src/shared/types/Room.ts`, `src/shared/types/MaterialType.ts`, `src/shared/types/index.ts`, `src/shared/functions/dimensions.ts`, `src/shared/functions/auto-items.ts`, `src/app/configurare/RoomTechnicalCard.tsx`, `src/app/centralizator/page.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Fix: eliminat calcul „Plintă (Perete X)” rămas orfan la Gresie + UI ferestre îmbunătățit
**De ce:** userul a semnalat o eroare de calcul: la o cameră cu Gresie și faianță pe toți pereții, tot mai apărea un rând „Plintă (Perete V)” separat, deși plinta e deja inclusă integral în necesarul de gresie de la fix-ul sesiunii anterioare — acel rând nu se aduna nicăieri, era doar un calcul afișat rămas din modelul vechi (dinainte de folosirea plintei în gresie) și devenise confuz/incorect conceptual. A cerut și clarificarea UI-ului la ferestre: label-uri explicite (nu se știa dacă „lățime” înseamnă `08` sau `0.8`) și înlocuirea celor 4 sloturi fixe de perete cu un buton unic „+ Adaugă fereastră”, cu mai mult spațiu pe mobil (nu 2 câmpuri înghesuite pe un rând).

- **Șters `doorWallBaseboardLength()`** din `dimensions.ts` — funcția nu alimenta niciun total real (nici `floorMaterialNeeded`, nici vreun item din `auto-items.ts`), era folosită DOAR pentru acel rând de afișaj acum eliminat. Verificat cu `grep -rn` înainte de ștergere — un singur loc de apel, în `RoomTechnicalCard.tsx`.
- **`RoomTechnicalCard.tsx`**: eliminat rândul `ResultRow` „Plintă (Perete X)” + variabila `doorBaseboard`.
- **Ferestre — UI rescris**: din grid de 4 carduri fixe (unul per perete, mereu vizibile) într-o listă de ferestre existente + un singur buton „+ Adaugă fereastră” (ca la restul secțiunilor toggle-abile). Fiecare fereastră din listă are acum: `select` „Perete” (poate fi schimbat, opțiunile exclud pereții deja ocupați), label explicit „Lățime (m) — L” și „Înălțime (m) — H” (deci nu mai există ambiguitatea „08 sau 0.8”), buton de ștergere dedicat. Layout `grid-cols-1` pe mobil (fiecare câmp pe lățime completă, nu 2 pe rând) → `sm:grid-cols-[1fr_1fr_1fr_auto]` pe ecrane mai late.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat în browser (viewport îngust): Baie Principală — rândul „Plintă (Perete V)” a dispărut din Calcule Detaliate; adăugat o fereastră 1×1.2m pe peretele N prin noul buton „+ Adaugă fereastră” → „Faianță (3 pereți)” a scăzut corect de la 18.61 la 17.29 mp, „Glaf Fereastră (1 fereastră)” = 4.62 ml = 2×(1+1.2)×1.05, verificat manual.

**Fișiere atinse:** `src/shared/functions/dimensions.ts`, `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Uși multiple (ca ferestrele), redenumire secțiuni, plintă în cm, select-uri cu iconițe
**De ce:** userul a cerut cinci modificări: (1) redenumirea secțiunilor din card-ul de cameră pentru claritate — „Pardoseală & Pereți" → „Pardoseală", „Placări Detaliate"/„Finisaj Pereți" → „Pereți", „Configurare Ușă" → „Uși"; (2) posibilitatea de a adăuga mai multe uși per cameră (până acum era o singură ușă per cameră, nu per perete) — la fel ca la ferestre; (3) „Înălțime plintă" în cm, nu în m (valorile tipice sunt 6–10, nu 0.06–0.10 — mai natural în cm); (4) iconițe sugestive în select-urile „Tip Material" și „Mărime plăci", cu iconiță înainte de text, mai vizual.

- **Model de date**: `RoomDoor` simplificat — a pierdut câmpul `wall` (nu mai are sens ca proprietate a ușii, e cheia din record acum). `Room.door?: RoomDoor` (o singură ușă) → `Room.doors?: Partial<Record<Wall, RoomDoor>>` (până la 4 uși, una per perete) — exact simetric cu `Room.windows` de la sesiunea trecută.
- **`dimensions.ts`**: `totalDoorWidth(room)` (nou) — suma lățimilor tuturor ușilor, folosită acum în `baseboardLength` (înainte scădea o singură `door.width`). `doorArea(room, wall)` (nou), extras din logica dublă anterioară (`doorOnTiledWall`/`doorOnFinishedWall`) — `wallTilingArea`/`wallFinishArea` scad acum suma golurilor de uși ȘI ferestre de pe fiecare perete (`openingsArea`, funcție internă), nu doar fereastra sau doar ușa.
- **`RoomTechnicalCard.tsx`**:
  - Secțiunea „Uși" rescrisă complet după modelul „Ferestre" (aceeași structură de listă + „+ Adaugă ușă", select Perete, `Lățime (m) — L` / `Înălțime (m) — H`, buton de ștergere per ușă, max. 4).
  - „Înălțime plintă" — input afișează/editează în cm (`Math.round(baseboardHeight×100)`), convertește la submit (`/100`) — `Room.baseboardHeight` rămâne stocat în metri intern (fără schimbare de tip/contract), doar UI-ul e în cm.
  - **`IconSelectField`** (component nou) — select custom (buton + listă absolută cu iconiță+text per opțiune), pentru că `<option>` nativ nu poate reda iconițe cross-browser. Folosit la „Tip Material" (`FLOORING_TYPE_ICONS`) și „Mărime plăci" (`TILE_SIZE_ICONS`, mapare nouă în `icons.ts` — iconițe cu mărime vizuală crescândă: `grid_on`→`grid_view`→`crop_square`→`crop_din`). `FLOORING_TYPE_ICONS` rafinat (Parchet Laminat și Mochetă foloseau amândouă `texture`, acum distincte: `view_column`/`texture`).
  - Adăugat `TECHNICAL_ICONS.windowConfig` (`window`) — secțiunea Ferestre nu mai reutilizează iconița de ușă.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat în browser: titluri renumerotate/redenumite corect (1. Pardoseală, 2. Pereți, 3. Ferestre, 4. Uși), „Tip Material" arată iconiță+text și dropdown-ul custom cu iconiță pe fiecare rând, „Înălțime plintă (cm)" afișează „8" (nu „0.08"), adăugat o a doua ușă pe cameră (Perete N) pe lângă cea existentă (Perete V) prin „+ Adaugă ușă" — funcțional, fără conflict.

**Fișiere atinse:** `src/shared/types/RoomDoor.ts`, `src/shared/types/Room.ts`, `src/shared/functions/dimensions.ts`, `src/shared/mock-data.ts`, `src/shared/icons.ts`, `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Fix-uri UI: nume complete de perete, iconițe la Tip montaj, dropdown tăiat de overflow, label-uri de lungime
**De ce:** userul a semnalat patru probleme mici la `RoomTechnicalCard`: (1) codurile de perete (N/E/S/V) sunt greu de citit, voia numele complete (Nord/Est/Sud/Vest); (2) select-ul „Tip montaj" nu avea iconițe ca „Tip Material"/„Mărime plăci"; (3) **bug real**: dropdown-ul `IconSelectField` (introdus sesiunea trecută) era tăiat de `overflow-hidden` al cardului/secțiunii părinte quando avea mai multe opțiuni decât spațiul rămas vizibil, deci nu se mai vedeau toate opțiunile; (4) label-urile câmpurilor de lungime perete („Perete N” etc.) nu spuneau explicit că e vorba de lungime.

- **`WALL_LABELS`** (nou, local în `RoomTechnicalCard.tsx`) — mapare `Wall` → nume complet („N" → „Nord" etc.). Aplicată peste tot unde apărea codul brut: label-urile de lungime perete din secțiunile Pereți (Gresie/Parchet), și opțiunile select-ului „Perete” din Ferestre/Uși.
- **Label-uri de lungime**: „Perete N” → „Nord — Lungime (m)” (și analog pt. celelalte 3 pereți), în ambele secțiuni „Pereți” (faianță la Gresie, vopsea/tapet la Parchet/Mochetă) — acum e explicit ce reprezintă cifra.
- **`INSTALLATION_TYPE_ICONS`** (nou, `icons.ts`): `Drept` → `straighten` (riglă), `Diagonal` → `north_east` (săgeată diagonală), `Herringbone` → `grain` (textură cu model). „Tip montaj" convertit din `SelectField` (text simplu) în `IconSelectField` (icon + text), la fel ca „Tip Material”/„Mărime plăci”.
- **Fix bug overflow dropdown** — cauza reală: `IconSelectField` randa lista de opțiuni `position: absolute` în interiorul unui `<details>` cu `overflow-hidden` (pt. colțuri rotunjite), la rândul lui în cardul camerei care are TOT `overflow-hidden` (pt. colțurile lui rotunjite) — orice conținut absolut ce depășea înălțimea vizibilă curentă a cardului era pur și simplu tăiat, indiferent de propriul scroll intern. Rezolvat randând dropdown-ul într-un **portal** (`createPortal` pe `document.body`), poziționat `fixed` după coordonatele reale ale butonului (`getBoundingClientRect`) — scapă complet de orice `overflow-hidden` ancestor. Adăugat și `max-h-64 overflow-y-auto` pe lista propriu-zisă, ca să rămână complet accesibilă (scroll intern) chiar și cu multe opțiuni.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat în browser: „Tip Material” deschis pe cameră cu card scurt — dropdown-ul apare complet, cu toate cele 3 opțiuni vizibile (nu mai e tăiat); „Tip montaj” arată iconiță (`straighten`) + „Drept”; secțiunea Pereți arată „NORD — LUNGIME (M)” etc.; secțiunea Uși arată „Vest” (nu „V”) în select-ul Perete.

**Fișiere atinse:** `src/shared/icons.ts`, `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Formă cameră (Pătrat/Dreptunghi/Neregulată) la secțiunea Pereți + validare suprafață
**De ce:** userul a semnalat un bug real: la secțiunea „Pereți" (faianță/vopsea-tapet) puteai introduce o lungime de perete oricât de mare, fără nicio legătură cu suprafața (mp) introdusă la Pardoseală — rezultatul: schița generată (`RoomSketch`) și necesarul de faianță/plintă divergeau silențios de mp-ii reali ai camerei. Cerința: alege întâi forma camerei (Pătrat/Dreptunghi/Neregulată), completează doar câte dimensiuni sunt necesare pentru acea formă (1/2/4), și nu permite ca suprafața rezultată din pereți să depășească `floorArea`.

- **Enum nou** `RoomShape` (`src/shared/types/RoomShape.ts`): `Patrat` / `Dreptunghi` / `Neregulata`.
- **`Room.wallShape?: RoomShape`** (nou, `Room.ts`) — o singură alegere de formă, partajată între `wallTiling` și `wallFinish` (mutual exclusive oricum, în funcție de `floorMaterial`).
- **Component nou** `src/app/configurare/RoomShapeWallsEditor.tsx`: select „Formă cameră” + input(uri) specifice formei — Pătrat: 1 input (Latura), clamped la `√floorArea`; Dreptunghi: 2 inputuri (Lungime N–S / Lățime E–V), clamped ca produsul lor să nu depășească `floorArea` (dimensiunea tocmai editată se reduce automat, cealaltă rămâne); Neregulată: 4 inputuri per perete (comportamentul vechi, fără validare — formă liberă, fără geometrie de validat). La schimbarea formei, valorile existente se renormalizează imediat (nu doar la următoarea editare), ca schița să reflecte instant noua formă.
- **`RoomTechnicalCard.tsx`**: secțiunea „Pereți" (atât la Gresie/faianță cât și la Parchet-Mochetă/vopsea-tapet) folosește acum `RoomShapeWallsEditor` pentru lungimi, în loc de grila veche (la faianță: doar primele N pereți din `tiledWallsCount`; la vopsea/tapet: toate cele 4, întotdeauna). La vopsea/tapet, select-ul de finisaj per perete rămâne, dar arată lungimea calculată read-only în loc de un input separat. `toggleWallTiling`/`toggleWallFinish` setează `wallShape: Patrat` implicit la prima activare (păstrând comportamentul anterior de estimare pătrată), fără să suprascrie o alegere existentă.
- Exportate din `RoomTechnicalCard.tsx` (`IconSelectField`, `WALL_LABELS`, `labelCls`, `inputCls`) pentru reutilizare în noul component.
- **Iconițe noi** (`icons.ts` → `TECHNICAL_ICONS`): `shapeSquare` (`crop_square`), `shapeRectangle` (`crop_landscape`), `shapeIrregular` (`gesture`).
- Fix precizie flotantă la clamp (`5.4/2.25` → `2.4000000000000004` în input) — rotunjire la 2 zecimale (`round2`) pe toate valorile calculate din clamp.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual: fără formă aleasă → mesaj + niciun input; Dreptunghi cu lungime introdusă prea mare → clamp automat la `floorArea / lățime`, afișat curat (2 zecimale); Pătrat ales direct → schița se actualizează instant la o formă pătrată corectă, fără a necesita o editare manuală suplimentară.

**Fișiere atinse:** `src/shared/types/RoomShape.ts` (nou), `src/shared/types/Room.ts`, `src/shared/types/index.ts`, `src/shared/icons.ts`, `src/app/configurare/RoomShapeWallsEditor.tsx` (nou), `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Ajustări formă cameră: schiță SVG cu formă neregulată reală, layout, avertisment vizibil
**De ce:** trei fix-uri cerute de user pe funcționalitatea de mai sus: (1) schița SVG desena mereu un dreptunghi (medie Nord/Sud, medie Est/Vest), deci „Formă neregulată" cu un perete mai lung nu se vedea deloc ca atare; (2) depășirea suprafeței era doar clampată silențios, fără notificare vizibilă; (3) „Număr pereți placați" (selector separat) nu mai are sens lângă noul selector de formă — cerința a fost să dispară, iar „Formă cameră" să-i ia locul în grid; inputurile Dreptunghi trebuiau responsive și pe toată lățimea cardului.

- **`RoomSketch.tsx` rescris**: `roomDimensions()` (dreptunghi mediat) înlocuit cu `roomQuad()` — un patrulater real, calculat direct din cele 4 lungimi de perete (Nord/Sud/Est/Vest), rezolvând un sistem de 2 ecuații (2 necunoscute: decalaj orizontal + înălțime) din lungimile laturilor Est/Vest. La Pătrat/Dreptunghi, Nord=Sud și Est=Vest (impuse de editor) → rezultă exact dreptunghiul de dinainte; la Neregulată, un perete Est mai lung ca Vest se vede acum ca latură oblică reală (trapez), nu mai e „ascuns" într-o medie. Fiecare perete are acum și o etichetă cu lungimea lui reală (nu doar o singură etichetă globală „lățime × înălțime").
- **`RoomShapeWallsEditor.tsx` despărțit în 2 componente** (`RoomShapeSelect` + `RoomShapeLengthInputs`, logica de calcul/clamp extrasă în hook-ul intern `useShapeHandlers`) — ca selectorul de formă să poată sta ÎN grid-ul cu „Înălțime Placare"/„Înălțime Pereți", iar inputurile de dimensiuni să stea separat, pe rândul următor, pe toată lățimea cardului.
- **Eliminat selectorul „Număr pereți placați"** din secțiunea Pereți (faianță) — `tiledWallsCount` e acum fix `4` la activare (toți cei 4 pereți ai formei sunt placați, nu mai există alegere manuală de „câți"). `RoomShapeSelect` ia locul lui în grid, lângă „Înălțime Placare (M)". La fel la vopsea/tapet: `RoomShapeSelect` lângă „Înălțime Pereți (M)”.
- **Avertisment vizibil la atingerea maximului** (nu doar text neutru): când suprafața implicată de dimensiuni (latură² la Pătrat, lungime×lățime la Dreptunghi) atinge/depășește `floorArea`, textul devine bold, culoare `text-tertiary`, cu iconiță `warning` — „Ai atins maximul — suprafața ... nu poate depăși pardoseala (...)".
- **Responsive real la Dreptunghi**: grid `grid-cols-1 sm:grid-cols-2` (fără `max-w-md`) — inputurile stau pe toată lățimea cardului, stivuite complet pe mobil (375px), side-by-side de la breakpoint `sm`.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori. Testat vizual: Neregulată cu perete Est 4.50m vs. Vest 2.25m → schiță afișează un patrulater vizibil asimetric (nu dreptunghi), cu etichetă per perete; Dreptunghi la limită (5.40 mp) → avertisment portocaliu cu iconiță; mobil 375px → cele 2 inputuri Dreptunghi complet stivuite, full width.

**Fișiere atinse:** `src/app/configurare/RoomSketch.tsx` (rescris), `src/app/configurare/RoomShapeWallsEditor.tsx` (restructurat: 2 exporturi în loc de 1), `src/app/configurare/RoomTechnicalCard.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Export PDF „Configurare Apartament" (raport dedicat, nu print al paginii)
**De ce:** userul a cerut un PDF descărcabil cu datele tehnice completate (nu un screenshot/print al paginii) — per cameră, cotele introduse (pardoseală/pereți/uși/ferestre), schița tehnică și calculele de necesar de materiale, afișate simplu, ușor de citit de un constructor pe șantier. Buton „Export PDF" lângă „+ Adaugă Cameră".

- **Dependință nouă**: `@react-pdf/renderer` (generare PDF vectorial client-side, din componente React cu primitive proprii — `Document`, `Page`, `View`, `Text`, `Svg`, `Line`, `Path`).
- **Geometria schiței extrasă** în `src/app/configurare/roomSketchGeometry.ts` (funcții pure, fără JSX: `buildRoomSketch`, `arcPath`) — folosită acum de AMBELE randări: `RoomSketch.tsx` (DOM `<svg>`, în UI) și noul `RoomSketchPdf.tsx` (primitivele `@react-pdf/renderer`). Aceeași schiță, aceleași cifre, în UI și în PDF — nu două implementări care pot diverge.
- **Calculele extrase** în `src/app/configurare/roomCalcRows.ts` (`buildRoomCalcRows`, funcție pură) — mutate din JSX-ul inline din `RoomTechnicalCard.tsx` (panoul „Calcule Detaliate") într-o funcție reutilizabilă, folosită acum și de PDF. `RoomTechnicalCard.tsx` simplificat: randează `calcRows.map(...)` în loc de 6 blocuri `<ResultRow>` condiționale duplicate.
- **`ApartmentPdfDocument.tsx`** (nou): 1 pagină de sumar (titlu proiect, suprafață/buget/status, cuprins camere) + câte 1 pagină per cameră (nume + zonă, buget alocat, specificații tehnice grupate pe secțiuni — Pardoseală/Pereți/Uși/Ferestre, schiță tehnică, tabel „Calcule Detaliate" cu formulă + calcul per rând, exact ca în UI). Camere fără configurare tehnică → mesaj explicit, nu pagină goală.
- **Buton „Export PDF"** (`configurare/page.tsx`, lângă „+ Adaugă Cameră", pe același rând): `@react-pdf/renderer` și `ApartmentPdfDocument` importate dinamic (`import()`) doar la apăsare — nu îngreunează bundle-ul inițial al paginii. Generează blob-ul PDF (`pdf(<Document/>).toBlob()`), declanșează descărcarea printr-un `<a download>` temporar. Dezactivat dacă nu există nicio cameră; text „Se generează..." + iconiță alternativă cât timp durează generarea.
- Export-uri noi din `RoomTechnicalCard.tsx` pentru reutilizare: `ROOM_TYPE_DESCRIPTION`.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori, `npm run build` → succes (build de producție complet, fără erori de bundling pt. `@react-pdf/renderer`). Testat efectiv generarea: blob rezultat `application/pdf`, ~11.7 KB pentru un proiect cu o cameră configurată.

**Fișiere atinse:** `package.json`/`package-lock.json` (dependință nouă), `src/app/configurare/roomSketchGeometry.ts` (nou), `src/app/configurare/RoomSketch.tsx` (refactorizat pe geometria partajată), `src/app/configurare/RoomSketchPdf.tsx` (nou), `src/app/configurare/roomCalcRows.ts` (nou), `src/app/configurare/ApartmentPdfDocument.tsx` (nou), `src/app/configurare/RoomTechnicalCard.tsx` (refactorizat pe `buildRoomCalcRows`), `src/app/configurare/page.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Fix Export PDF: diacritice, camere goale ascunse, layout compact tip factură
**De ce:** userul a semnalat 3 probleme reale la PDF-ul din sesiunea anterioară: (1) diacriticele românești (ă/â/î/ș/ț) nu se afișau deloc (fontul implicit al PDF-ului, Helvetica, nu le are); (2) o cameră fără nicio dată tehnică completată tot apărea în PDF (cu mesaj „nu are configurare”) — nu trebuie afișată deloc; (3) design cu prea mult spațiu gol și culoare — cerere explicită: „ca o factură”, simplu, alb-negru, compact.

- **Font `Inter` (subset `latin-ext`, are ă/â/î/ș/ț)** auto-hostat în `public/fonts/` (2 fișiere `.woff`, 400/700, extrase din `@fontsource/inter` — pachetul a fost dezinstalat după, nu e nevoie de el la runtime, doar fișierele rămase în `public/`). Înregistrat cu `Font.register` în `ApartmentPdfDocument.tsx`, aplicat pe toate paginile (`fontFamily: "Inter"` pe stilul de pagină) + explicit pe `RoomSketchPdf.tsx` (siguranță, textul din `<Svg>` nu moștenește garantat).
- **Camere fără nicio dată tehnică → excluse complet din PDF** (nu doar ascunse cu un mesaj): `ApartmentPdfDocument` filtrează `rooms` cu `buildRoomSpecs(r).length > 0` înainte de cuprins ȘI înainte de generarea paginilor — o cameră netratată încă nu ocupă nicio pagină.
- **Design rescris „tip factură”**: eliminate fundalurile colorate (`headerCard`/`sketchWrap` cu `COLOR_SURFACE_LOW`) și accentul albastru de pe procent — acum alb-negru/gri, linii subțiri (`COLOR_LINE`), tabele cu chenar simplu. Singura culoare rămasă e cea funcțională din schiță (simbolurile ușă/fereastră, care trebuie să rămână distinctă vizual). Spațieri reduse global (margini/padding-uri înjumătățite aprox.) — conținutul stă mai aproape, mai puțin spațiu gol.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori, `npm run build` → succes. Testat efectiv: extras blob-ul PDF generat (capturat `URL.createObjectURL` din consolă), convertit în data-URL și inspectat brut — `/Pages /Count 3` (1 sumar + 2 camere configurate, a treia cameră mock fără date exclusă corect), fonturile `Inter-Regular`/`Inter-Bold` înglobate ca `CIDFontType2` (nu `Helvetica`).

**Fișiere atinse:** `public/fonts/inter-latin-ext-400-normal.woff` (nou), `public/fonts/inter-latin-ext-700-normal.woff` (nou), `package.json`/`package-lock.json` (dependință temporară adăugată și eliminată), `src/app/configurare/ApartmentPdfDocument.tsx` (rescris), `src/app/configurare/RoomSketchPdf.tsx`, `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Fix `DashboardSummaryCard`: linii despărțitoare centrate corect + prag desktop la 768px
**De ce:** userul a semnalat că liniile verticale dintre metrici (card negru de sumar, pe toate paginile) nu „porneau din centru” când cardul avea 2 rânduri de metrici (mobil/tabletă) — cauza reală: `border-r` pe o grilă cu `gap` lasă linia lipită de coloana din stânga, nu exact la mijlocul spațiului dintre coloane. Pe `/centralizator` (3 metrici), la o lățime „de desktop” (~810–900px) a treia metrică tot sărea pe un rând nou, pentru că pragul vechi de comutare la un singur rând era `lg` (1024px), nu `md` (768px) — pragul „desktop” real al aplicației, conform CLAUDE.md.

- **Rescris layout-ul** din CSS Grid (`grid-cols-2 lg:grid-cols-N` + `border-r`/`border-b` calculate manual pe index) în flexbox cu `divide-x`/`divide-y` (`MetricRow`, `MetricContent`) — `divide-x` pe coloane `flex-1` egale garantează geometric că linia cade exact la mijlocul spațiului dintre 2 elemente, indiferent de conținut.
- **Prag de comutare mutat de la `lg` (1024px) la `md` (768px)** — sub 768px, metricile stau în perechi de câte 2 (linie verticală per rând + linie orizontală subțire între rânduri, în loc de linii „rupte” care arătau inconsecvent); de la 768px în sus, toate metricile stau pe un singur rând.
- **Fix regresie**: mutarea pragului la 768px a scos la iveală trunchiere de text („12.500 RO…”) la lățimi „laptop” (768–1024px) cu 4 metrici (coloane mai multe, mai înguste, la o lățime mai mică decât înainte). Rezolvat cu un prop nou `compact` pe `MetricRow`/`MetricContent`: font mai mic (`text-sm`→`text-2xl` pe trepte `md`/`lg`/`xl`, în loc de un singur `clamp()` bazat pe viewport width, care nu ținea cont de lățimea reală a coloanei) + padding mai mic la `md`, crescând progresiv spre `xl`.
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori, `npm run build` → succes. Testat vizual la 375px (mobil, 2 rânduri + linie orizontală), 853px și 900px (desktop îngust — toate metricile pe un rând, fără trunchiere, teste cu 3 și 4 metrici), 1400px (desktop larg) — linii verticale corect centrate la toate lățimile.

**Fișiere atinse:** `src/components/DashboardSummaryCard.tsx` (rescris), `docs/progress.md`.

**Branch:** `009-sync-configurare-elemente-cumparat`.

### 2026-07-14 — Fix poză element: disponibilă pe tabletă + thumbnail lipsă pe mobil
**De ce:** userul a semnalat că poza de element (capturată cu camera) se putea adăuga doar pe mobil, nu și pe tabletă; și că poza „nu se salvează" — investigație (agent Explore) a arătat că `imageUrl` chiar ajungea corect pe `Item` (`qaImage` → `quickAdd` → `addItem`, nimic pierdut în `store.tsx`), dar rândul de element din lista **mobilă** (`/elemente`, secțiunea `md:hidden`) nu avea deloc un `<img>` care să afișeze `item.imageUrl` — spre deosebire de tabelul desktop, care îl afișa deja. De-asta părea „nesalvată": userul o făcea pe mobil, dar nu o vedea nicăieri.

- **Poză disponibilă pe tabletă**: butonul „Fă o poză" (input `capture="environment"`) exista doar în formularul mobil (`md:hidden`). Adăugat același bloc (adaptat la tema închisă a formularului desktop) și în formularul „Adăugare Rapidă" de pe secțiunea desktop (`hidden ... md:block`) — de la 768px în sus (tabletă inclusiv, per convenția unică de breakpoint a proiectului), userul are acum acces la capture foto.
- **Fix afișare pe mobil**: rândul de element din acordionul de cameră mobil (`roomItems.map` din secțiunea `md:hidden`) primește acum un thumbnail `item.imageUrl` (40×40px, cadru + colț rotunjit), identic ca logică cu cel din tabelul desktop (`item.imageUrl && <img ... />`).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori, `npm run build` → succes. Testat efectiv (nu doar citit codul): la 820px (tabletă) — capturat o poză de test prin formularul desktop, salvat, elementul apare cu thumbnail în tabel; la 375px (mobil) — capturat o poză prin formularul mobil, salvat, elementul apare cu thumbnail în lista de cameră (unde înainte nu apărea deloc).

**Fișiere atinse:** `src/app/elemente/page.tsx`, `docs/progress.md`.

**Branch:** `011-fix-poza-element-tableta-mobil`.

### 2026-07-15 — Faza 0 backend: restructurare în monorepo (`frontend/` + `backend/`)
**De ce:** primul task din `docs/backend-blueprint.md` (Faza 0). Pregătește repo-ul pentru adăugarea backend-ului Spring Boot, mutând întreaga aplicație Next.js din rădăcină într-un folder `frontend/` dedicat, ca cele două aplicații să stea alături fără să se amestece config-urile.

- **Mutat tot codul Next.js în `frontend/`** cu `git mv` (istoric păstrat): `src/`, `public/`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vercel.json`. Artefactele gitignorate (`node_modules/`, `.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`) mutate cu `mv` simplu. La rădăcină rămân: `docs/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `.gitignore`.
- **`.gitignore` rescris pentru monorepo**: pattern-uri deroot-ate (`node_modules`, `.next/`, `*.tsbuildinfo` prind acum și în `frontend/` și în viitorul `backend/`), adăugate `.idea/`, `*.iml`, `target/` (Maven), `.env.example` whitelistuit.
- **`~/.claude/launch.json`**: config `renovator-web` → `--prefix .../frontend` (dev server pornește din noua cale, tot pe 3001).
- **`README.md`** rescris ca index de monorepo (structură, cum se pornește frontend-ul, link la blueprint). **`CLAUDE.md`**: secțiunea Structură + Stack & comenzi actualizate (căi `frontend/src/...`, comenzile se rulează din `frontend/`).
- **Backend NU a fost creat** — folderul `backend/` apare în Faza 1. Aici doar s-a pregătit terenul.
- Verificat din `frontend/`: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (1 warning preexistent `<img>`), `npm run build` → succes (toate 7 rutele generate). Testat efectiv: dev server repornit din noua cale (`cwd` nou), `/elemente` se încarcă corect în browser pe 3001.

**⚠️ Pas manual rămas pentru user:** în dashboard-ul Vercel, setează **Root Directory → `frontend`** (Settings → General), altfel deploy-ul nu mai găsește aplicația.

**Fișiere atinse:** mutare `frontend/**` (fost rădăcină), `.gitignore`, `README.md`, `CLAUDE.md`, `~/.claude/launch.json` (în afara repo), `docs/backend-blueprint.md` (nou, din sesiunea de planificare), `docs/progress.md`.

**Branch:** `012-monorepo-frontend-backend-split`.

### 2026-07-15 — Faza 1 backend: schelet Spring Boot + infrastructură DB + model de domeniu
**De ce:** task-urile 1.1–1.3 din `docs/backend-blueprint.md` (Faza 1). Produce scheletul backend-ului: proiect care compilează și pornește, Postgres local reproductibil cu prima migrare, și modelul de domeniu pur (oglindă a `frontend/src/shared/types/`). Toate cele 3 task-uri într-un singur PR fiindcă sunt interdependente (1.2 și 1.3 nu compilează fără proiectul din 1.1).

- **Task 1.1 — schelet:** proiect Maven (`backend/pom.xml`, Spring Boot 3.4.1, Java 21 ca nivel de limbaj, deps: web, validation, data-jpa, postgresql, flyway, actuator, springdoc). Structura hexagonală de pachete cu `package-info.java` care descrie regula de dependență (domain ← application ← adapter/config). Profiluri `dev`/`prod` (`application.yml` safe-pt-prod cu secrete din env + Swagger dezactivat; `application-dev.yml` cu Postgres local + Swagger). Port 8080, health check actuator. `backend/README.md`.
- **Task 1.2 — DB:** `docker-compose.yml` (Postgres 16, port 5433 ca să nu ciocnească un Postgres existent), `.env.example`, `V1__initial_schema.sql` (users, projects, project_members, rooms, items — FK-uri cu ON DELETE CASCADE, structuri per-perete ca JSONB, enums ca VARCHAR cu valorile TS). Test `SchemaMigrationTest` (Testcontainers, `disabledWithoutDocker=true`).
- **Task 1.3 — domeniu:** toate enums (Currency, ItemStatus, ItemOrigin, RoomType, MaterialType, FlooringType, InstallationType, TileSize, RoomShape, WallFinishType, Wall) cu cheie fără diacritice + `label` cu diacritice identic cu TS + `fromLabel`. Value objects (`Money` — BigDecimal 2 zecimale, non-negativ; RoomDoor, RoomWindow, WallTiling, WallFinish). Entități (Project, Item records; Room record cu builder pt. câmpurile tehnice opționale). `user/User` + `user/ProjectRole` (OWNER/EDITOR/VIEWER, folosite efectiv în Faza 5). Zero importuri de framework în `domain/`. Teste de invarianți (Money, domeniu, enum labels).
- Verificat: `mvn verify` → **BUILD SUCCESS**, 12 teste de domeniu trec (`SchemaMigrationTest` dezactivat corect local — Docker daemon oprit). Testat efectiv boot-ul: `mvn spring-boot:run -Pdev` pe JDK 25 → Spring pornește complet (Tomcat pe 8080, Hikari, Flyway autoconfig), se oprește DOAR la conexiunea Postgres (localhost:5433 refuzat, fiindcă DB-ul nu rula) — deci wiring-ul de bean-uri e corect și versiunea Spring merge pe JDK-ul instalat. Cu `docker compose up -d` pornit, boot-ul se completează.

**Nefăcut aici (conform blueprint):** `domain/service` (reguli de business) e gol — apare în Faza 2. Fără use cases (Faza 3), fără API (Faza 4), fără auth (Faza 5).

**Fișiere atinse:** `backend/**` (nou: pom.xml, docker-compose.yml, .env.example, README.md, `src/main/java/ro/renovatorpro/**`, `src/main/resources/{application.yml,application-dev.yml,db/migration/V1__initial_schema.sql}`, `src/test/java/ro/renovatorpro/**`), `docs/backend-blueprint.md` (tabel stadiu), `docs/progress.md`.

**Branch:** `013-faza1-schelet-backend-domeniu`.

### 2026-07-15 — Faza 2 backend: reguli de business în domain/service
**De ce:** task-urile 2.1–2.2 din `docs/backend-blueprint.md` (Faza 2), condiție necesară pentru Faza 3 (Task 3.2, `UpdateRoomService` invocă `AutoItemReconciler`). Portează regulile de business din `frontend/src/shared/functions/` în domeniul Java, fidel — nu reinventat.

- **Task 2.1 — `BudgetCalculator`** (port din `items.ts` + `budget.ts` + agregările din `charts.ts`): `itemTotal`, `totalEstimated`, `totalSpent` (**doar `ItemStatus.CUMPARAT`** — regula critică), `boughtCount`, `purchaseProgress`, `itemsForRoom`, `roomSubtotal`, `roomSpent`, `budgetRemaining` (întoarce `BigDecimal`, nu `Money` — poate fi negativ la depășire de buget), `budgetEfficiency`, `costPerRoom`, `costPerCategory`. **`donutSegments` NU a fost portat** — e geometrie SVG pentru randare (stroke-dasharray), concern de prezentare, nu regulă de business; rămâne exclusiv client-side.
- **Task 2.2 — `RoomDimensionsCalculator`** (port din `dimensions.ts`): toate formulele de necesar de material cu waste ratio propriu fiecărei categorii (`floorMaterialNeeded` 10%, `baseboardLength` 5%, `wallTilingArea` 10%, `wallFinishArea` — Vopsea 10%/Tapet 15%, `windowTrimLength` 5%), inclusiv regula delicată „la Gresie plinta e inclusă în necesarul de pardoseală" (`baseboardTileArea`).
- **Task 2.2 — `AutoItemReconciler`** (port din `auto-items.ts`): `generateAutoItems` (produce `ItemDraft`-uri fără id, oglindă a `Omit<Item,"id">`) + `reconcile` (fostul `syncAutoItemsForRoom`) — elementele existente `origin: Din Configurare` păstrează `id`/`unitPrice`/`status`/`source`, doar `name`/`quantity` se recalculează; orfanele (măsurătoare ștearsă) se elimină; elementele `origin: Manual` nu sunt niciodată atinse, indiferent de cameră.
- Verificat: `mvn verify` → **BUILD SUCCESS**, 37 teste (25 noi față de Faza 1), acoperă fiecare ramură de decizie documentată în `api-contract.md` §Room/§Item (Gresie vs Parchet/Mochetă, Vopsea vs Tapet, camere fără nicio măsurătoare, elemente pe alte camere neatinse).

**Nefăcut aici (conform blueprint):** fără use cases (Faza 3 — acolo `AutoItemReconciler` e invocat efectiv din `UpdateRoomService`), fără API (Faza 4), fără auth (Faza 5).

**Fișiere atinse:** `backend/src/main/java/ro/renovatorpro/domain/service/{BudgetCalculator,RoomDimensionsCalculator,AutoItemReconciler,package-info}.java`, `backend/src/test/java/ro/renovatorpro/domain/service/*Test.java`, `docs/backend-blueprint.md` (tabel stadiu), `docs/progress.md`.

**Branch:** `016-faza2-domain-service-business-logic`.

### 2026-07-15 — Faza 3 backend: use cases + persistență JPA
**De ce:** task-urile 3.1–3.2 din `docs/backend-blueprint.md` (Faza 3) — primul strat care conectează efectiv domeniul la o bază de date reală și expune use cases gata de conectat la API (Faza 4).

- **Task 3.1 — porturi + adaptere JPA**: entități `@Entity` separate de `domain.model` (`ProjectEntity`, `RoomEntity`, `ItemEntity`, `UserEntity`), cu `AttributeConverter` pentru fiecare enum (persistate ca `label()` cu diacritice — `LabelEnumConverter<E>` generic, o subclasă de 5 linii per enum) și pentru `Money` (BigDecimal). Structurile per-perete (`doors`/`windows`/`wallTiling`/`wallFinish`) persistate ca JSONB prin `@JdbcTypeCode(SqlTypes.JSON)`, refolosind DIRECT tipurile de domeniu (Wall, RoomDoor, RoomWindow, WallTiling, WallFinish) — rămân POJO-uri/records fără nicio adnotare JPA/Jackson, doar entitatea (adapter) știe că sunt JSON. Mapper entity↔domeniu cu **MapStruct** (decizie revizuită cu userul — blueprint-ul zicea inițial „manual, fără MapStruct"; userul a aprobat MapStruct ca alternativă la Lombok, fiindcă generează cod la compilare, nu reflecție runtime). `RoomEntityMapper`/`ProjectEntityMapper` primesc `projectId`/`ownerId` ca parametru separat (domeniul nu le cunoaște — single-project azi).
- **V2 migrare nouă**: seed temporar — un user „stub" + un proiect implicit (ID-uri fixe cunoscute), fiindcă `projects.owner_id` e `NOT NULL FK` dar autentificarea reală vine abia în Faza 5. Documentat explicit ca punte temporară, nu soluție de producție.
- **Fix critic descoperit la testare**: `V1` declara coloanele ID ca tip nativ Postgres `UUID`, dar entitățile Java au `id: String` (Hibernate se așteaptă implicit la VARCHAR) — `Schema-validation: wrong column type`. Amendat `V1` direct (nu adăugată o migrare nouă doar pt. fix — migrarea a fost introdusă azi, nimic persistent partajat încă) — toate coloanele ID din `UUID` în `VARCHAR(36)`. **Efect advers pt. dezvoltatori cu DB local deja pornit din Faza 1**: necesar `docker compose down -v` o singură dată (checksum Flyway diferit pe migrarea amendată).
- **Task 3.2 — use case-urile CRUD**: porturi `port/in` (`GetProjectSnapshotUseCase`, `UpdateProjectUseCase`, `AddRoomUseCase`, `UpdateRoomUseCase`, `DeleteRoomUseCase`, `AddItemUseCase`, `UpdateItemUseCase`, `DeleteItemUseCase`), fiecare cu un `Command` record nested (câmp `null` = nu se modifică, oglindă a `Partial<T>` din TS). Implementările (`application/usecase/`) sunt `@Service` + `@Transactional`. **`DeleteRoomService`** șterge explicit item-urile înainte de cameră (regulă de business independentă de `ON DELETE CASCADE` din schemă). **`UpdateRoomService`** invocă `AutoItemReconciler` doar când patch-ul atinge un câmp tehnic (`Command.touchesTechnicalFields()`), și șterge elementele orfane rămase în afara rezultatului reconcilierii. `currentUserId` acceptat pe fiecare metodă, neutilizat operațional (comentat explicit) — evită retrofit la Faza 5. Port nou `IdGenerator` (+ adaptor `UuidIdGenerator`) — ID-urile nu se generează direct cu `UUID.randomUUID()` în use case, ca testele să poată fixa ID-uri predictibile.
- Verificat: `mvn verify` → **BUILD SUCCESS**, 52 teste (15 noi: 7 Testcontainers pt. adaptere, 8 cu repository-uri FAKE in-memory pt. use cases — fără Spring, conform DoD). Testat efectiv: `mvn spring-boot:run -Pdev` contra Postgres local (volum resetat) → `Started RenovatorProApplication`, `/actuator/health` → `{"status":"UP"}`.

**Nefăcut aici (conform blueprint):** fără API REST (Faza 4 — use case-urile există dar nu sunt încă expuse prin HTTP), fără auth (Faza 5).

**Fișiere atinse:** `backend/pom.xml` (MapStruct), `backend/src/main/java/ro/renovatorpro/{adapter/out/persistence/**,adapter/out/id/**,application/port/**,application/usecase/**,domain/exception/*NotFoundException.java}`, `backend/src/main/resources/db/migration/{V1 amendat,V2 nou}`, `backend/src/test/java/ro/renovatorpro/{adapter/out/persistence/**,application/usecase/**}`, `docs/backend-blueprint.md` (tabel stadiu), `docs/progress.md`.

**Branch:** `017-faza3-usecases-persistenta`.

### 2026-07-15 — Backend: adoptare Lombok (entități JPA + injecție prin constructor)
**De ce:** userul a cerut explicit adoptarea Lombok „în tot proiectul unde e necesar". Decizie revizuită față de blueprint (care inițial evita Lombok pt. mapper, cu MapStruct ca alternativă) — acum cele două coexistă: Lombok elimină boilerplate-ul de entități/constructori, MapStruct rămâne mapper-ul entity↔domeniu.

- **Scop delimitat explicit**: Lombok se aplică DOAR în `adapter` (entitățile JPA: `@Getter`/`@Setter`/`@NoArgsConstructor`/`@AllArgsConstructor` unde exista deja constructor all-args) și `application` (`@RequiredArgsConstructor` pe cele 11 clase Spring cu injecție prin constructor — 8 use case services + 3 repository adapters). **Domeniul (`domain/model`, records + enums) rămâne neatins** — nu au nevoie de Lombok (record-urile deja generează accesori), și regula „domeniul fără nicio adnotare de framework" rămâne curată ca principiu, chiar dacă tehnic Lombok n-ar lăsa urmă la runtime (`scope=provided`).
- **`pom.xml`**: dependință `org.projectlombok:lombok` (`provided`), `lombok-mapstruct-binding` + reordonarea `annotationProcessorPaths` (Lombok → binding → MapStruct — ordinea contează, Lombok trebuie să genereze getters/setters înainte ca MapStruct să le vadă).
- **Fix compatibilitate JDK**: versiunea de Lombok gestionată implicit de `spring-boot-starter-parent` 3.4.1 (`1.18.36`) nu suportă JDK 25 (instalat local) — `java.lang.ExceptionInInitializerError: TypeTag :: UNKNOWN` la compilare. Suprascrisă explicit proprietatea `lombok.version` → `1.18.46`.
- Verificat: `mvn verify` → **BUILD SUCCESS**, toate cele 52 de teste trec neschimbate (MapStruct generează mapper-ele corect peste entitățile cu accesori Lombok). Testat efectiv boot-ul complet: `mvn spring-boot:run -Pdev` → `Started RenovatorProApplication`, `/actuator/health` → `{"status":"UP"}`.

**Fișiere atinse:** `backend/pom.xml`, cele 4 entități JPA (`UserEntity`, `ProjectEntity`, `RoomEntity`, `ItemEntity`), 8 use case services (`application/usecase/*.java`), 3 repository adapters (`ItemRepositoryAdapter`, `ProjectRepositoryAdapter`, `RoomRepositoryAdapter`), `docs/backend-blueprint.md` (§1 + nota Task 3.1), `docs/progress.md`.

**Branch:** `018-adopta-lombok`.

### 2026-07-15 — Faza 4 backend: API REST (Task 4.1 + 4.2)
**De ce:** task-urile 4.1–4.2 din `docs/backend-blueprint.md` (Faza 4) — expune use case-urile din Faza 3 prin HTTP, conform `docs/api-contract.md`.

- **Gol de contract descoperit și reparat înainte de cod** (regula „contract-first"): `updateProject` (deja în `RenovationStore`) nu avea rând în tabelul de endpoint-uri — adăugat `PATCH /api/projects/{id}`. Clarificat și că `addRoom` acceptă opțional toate câmpurile tehnice la creare (`Omit<Room,"id"|"projectId">` literal), nu doar type/name/allocatedBudget.
- **Refactor Task 3.2 minor**: `GetProjectSnapshotUseCase` (o interogare combinată proiect+camere+elemente, introdusă în Faza 3 fără să fie documentată în contract) a fost înlocuit cu 3 use case-uri distincte (`GetProjectUseCase`, `GetRoomsUseCase`, `GetItemsUseCase`), ca să corespundă exact celor 3 endpoint-uri GET separate din contract, fără interogări risipite.
- **`AddRoomUseCase.Command` extins**: de la 3 câmpuri (type/name/allocatedBudget) la toate cele 14 din `Room` minus id/projectId, conform contractului literal.
- **`UpdateRoomUseCase`**: schimbat să întoarcă `Result(Room, projectId)` în loc de doar `Room` — `RoomResponse` are nevoie de `projectId`, pe care domeniul nu-l cunoaște; adăugat `RoomRepository.findProjectIdById`.
- **DTO-uri** (`adapter/in/web/dto`): Project/Room/Item request+response, toate enum-urile ca `String` (niciodată tip de domeniu direct în JSON — regulă blueprint §3). Bean Validation pe câmpurile obligatorii/numerice.
- **`DtoConversionSupport`**: clasă de suport cu conversii `label()`/`fromLabel()` + `Money`↔`BigDecimal`, refolosită de toate mapper-ele MapStruct (oglindă a `LabelEnumConverter` din adapter/out/persistence, dar pt. JSON).
- **Controllere**: `ProjectController`, `RoomController`, `ItemController` — toate endpoint-urile din contract. `currentUserId` stub (Faza 5 îl înlocuiește cu extragerea din SecurityContext).
- **`GlobalExceptionHandler`**: `ProblemDetail` (RFC 7807) — 404 not found, 422 regulă de business/constrângere DB, 400 validare/enum invalid.
- **Task 4.2**: CORS configurabil per profil (`CorsConfig` + `app.cors.allowed-origins`) — dev: `localhost:3001`; prod: `APP_CORS_ALLOWED_ORIGINS` din env, FĂRĂ fallback (obligă setare explicită pe Render).
- **Bug real găsit prin testare manuală end-to-end** (nu doar teste automate): `POST /api/rooms/{roomId}/items` cu `source` omis din body → `DataIntegrityViolationException` necaptată (500 brut, nu `ProblemDetail`) — coloana `items.source` e `NOT NULL`. Reparat în 2 straturi: `AddItemService` normalizează `null→""` (source e non-opțional în frontend, deci această normalizare reflectă exact contractul TS), și `GlobalExceptionHandler` prinde acum și `DataIntegrityViolationException` generic (apărare în adâncime pt. orice altă constrângere DB viitoare care ar scăpa de validare).
- **Fix siguranță**: `POST /api/rooms/{roomId}/items` ignoră `roomId` din body (chiar dacă DTO-ul îl are, per `Omit<Item,"id">`) — path-ul e sursa de adevăr, nu poate fi redirecționat elementul către altă cameră printr-un body divergent.
- Verificat: `mvn verify` → **BUILD SUCCESS**, 67 teste (15 noi — `@WebMvcTest`-style cu `MockMvc` standalone per controller, happy path + validare + 404, verifică JSON cu diacritice). Testat efectiv END-TO-END pe API-ul real (nu doar mock-uri): GET proiect, 404 ProblemDetail, POST/GET/PATCH cameră (a declanșat corect `AutoItemReconciler` — element „Gresie (Pardoseală)" auto-generat cu cantitatea calculată corect), POST/PATCH/DELETE element, DELETE cameră (cascade), Swagger UI accesibil pe dev.

**Nefăcut aici (conform blueprint):** fără autentificare (Faza 5) — `currentUserId` rămâne stub.

**Fișiere atinse:** `backend/src/main/java/ro/renovatorpro/adapter/in/web/**` (nou), `application/port/in/{AddRoomUseCase,UpdateRoomUseCase,GetProjectUseCase,GetRoomsUseCase,GetItemsUseCase}.java`, `application/usecase/{AddRoomService,UpdateRoomService,GetProjectService,GetRoomsService,GetItemsService,AddItemService}.java` (șters `GetProjectSnapshotUseCase`/`Service`), `application/port/out/RoomRepository.java` + `adapter/out/persistence/RoomRepositoryAdapter.java` (+`findProjectIdById`), `config/CorsConfig.java`, `application.yml`/`application-dev.yml`/`.env.example`, `docs/api-contract.md`, `docs/backend-blueprint.md`, `docs/progress.md`, teste noi în `adapter/in/web/*ControllerTest.java` + `src/test/resources/application.yml`.

**Branch:** `019-faza4-api-rest`.

### 2026-07-15 — Faza 6 backend/frontend: integrarea frontend ↔ backend (Faza 5 amânată intenționat)
**De ce:** userul a cerut explicit să sară Faza 5 (auth) și să treacă direct la Faza 6 — auth se face ultima, `currentUserId` rămâne stub pe backend până atunci.

- **`RenovationStore` peste fetch** (Task 6.1): `store.tsx` rescris cu 2 provideri — `ApiStoreProvider` (nou, implicit) apelează backend-ul real prin `api-client.ts`; `MockStoreProvider` (fostul comportament) rămâne ca fallback demo, activat cu `NEXT_PUBLIC_USE_MOCK_DATA=true`. Interfața `RenovationStore` nu s-a schimbat deloc — nicio pagină/componentă a trebuit atinsă, dovada că abstracția a ținut.
- **`api-client.ts`** (nou): fetch wrapper JSON + `DEFAULT_PROJECT_ID` (ID-ul fix seedat de backend, `V2__seed_default_project.sql`) — aplicația rămâne single-project.
- **`updateRoom`**: după PATCH, reîncarcă lista de elemente de la server (nu doar camera) — reconcilierea `AutoItemReconciler` rulează acum server-side, iar frontend-ul trebuie să reflecte exact ce a calculat backend-ul.
- **`deleteRoom`**: filtrare locală a elementelor camerei șterse (cascade e server-side, dar starea locală trebuie actualizată fără round-trip suplimentar).
- Verificat: `npx tsc --noEmit` → 0 erori, `npm run lint` → 0 erori (1 warning preexistent), `npm run build` → succes. **Testat efectiv în browser**, nu doar cod scris: pornit backend (Postgres local) + frontend, creat o cameră prin UI (`POST` real, confirmat în DB via curl), șters camera prin UI (dialog de confirmare → `DELETE` real, confirmat DB gol după).

**Nefăcut aici (conform cerinței userului):** Faza 5 (auth) rămâne neimplementată — `currentUserId` pe backend e stub, frontend-ul nu are login/sesiune.

**Fișiere atinse:** `frontend/src/shared/{store.tsx (rescris), api-client.ts (nou)}`, `frontend/.env.example` (nou), `CLAUDE.md`, `docs/backend-blueprint.md`, `docs/progress.md`.

**Branch:** `020-faza6-integrare-frontend`.

### 2026-07-15 — Faza 7: CI (GitHub Actions) + audit securitate rapid (Task 7.1)
- **Task 7.1**: audit OWASP API rapid pe codul existent — BOLA/IDOR (n/a, auth amânată intenționat, documentat), mass assignment (verificat: niciun DTO de update nu expune `id`/`projectId`/`origin`), injection (zero SQL brut, doar Spring Data parametrizat), excessive data exposure (controllere întorc DTO-uri, niciodată entități), actuator restricționat la `health` pe prod, Swagger dezactivat pe prod, CORS fără wildcard. Niciun fix necesar.
- **Task 7.2 (parțial)**: `.github/workflows/ci.yml` — job `frontend` (lint+tsc+build) + job `backend` (`mvn verify`, Testcontainers pe runner-ul GitHub cu Docker preinstalat), pe fiecare PR + push pe `main`.

**Branch:** `021-faza7-ci-deploy`.

### 2026-07-15 — Audit: probleme identificate + plan de remediere (`docs/audit-remedieri.md`)
**De ce:** userul a cerut un audit al aplicației (front + back) după Faza 6/7 — ce merge, ce nu, ce trebuie schimbat — documentat detaliat pentru ca alt model să execute remedierile. Nu s-a modificat cod, doar s-a produs documentul.

- **8 probleme documentate** în `docs/audit-remedieri.md`, fiecare cu simptom / ce e greșit + unde (fișiere+linii) / ce e corect deja / cum se remediază + ordine de implementare:
  1. Schimbarea monedei nu convertește valorile (doar simbolul).
  2. Logică de business duplicată frontend↔backend (dimensions/budget/charts/auto-items ↔ domain/service); recomandat endpoint `/summary` consumat din front.
  3. Graficul „Evoluția Cheltuielilor" e hardcodat (SVG fals), nu date reale.
  4. `Item` nu are timestamp → imposibil grafic temporal real (necesită `created_at`, migrare V3).
  5. `project.totalBudget`/`title` needitabile în UI → buget 0 pe date reale, calcule de buget sparte.
  6. PATCH cu `null`/`undefined` nu poate ȘTERGE câmpuri opționale (nu poți dezactiva placarea).
  7. La activarea placării, `tileHeight`/`wallHeight` = 0 implicit → arie 0 → „pereții nu contează".
  8. Header-ele sunt reactive, dar moștenesc bug-urile 1/2/5.
- **Confirmat live (nu presupus):** backend-ul calculează corect datele de la pereți — la `PATCH` cu wallTiling generează `Faianță (2 pereți)` = 16.5mp corect. Problema „pereții nu contează" e frontend/UX, nu calcul backend.

**Fișiere atinse:** `docs/audit-remedieri.md` (nou), `README.md`, `docs/progress.md`.

**Branch:** `022-audit-probleme-remedieri`.

### 2026-07-15 — Audit Problema 1: conversie REALĂ de monedă EUR↔RON (nu doar schimbare de simbol)
**De ce:** din `docs/audit-remedieri.md` (Problema 1, severitate mare, cerută explicit de user): comutarea RON↔EUR din Setări schimba doar eticheta monedei, nu convertea valorile; câmpul „Curs Valutar" era pur decorativ. Abordarea aleasă: conversie reală, persistată, în backend (sursa de adevăr), ca să nu dublăm logica.

- **Contract-first** (`docs/api-contract.md`): endpoint nou `POST /api/projects/{id}/currency`, body `{ targetCurrency, exchangeRate }` (rate = câți RON per 1 EUR). Documentat caveat-ul distructiv + bifat item-ul „curs valutar" din „De decis".
- **Backend** (arhitectură hexagonală, `BigDecimal`/`HALF_UP`):
  - `domain/service/CurrencyConverter.java` (nou) — funcție pură de conversie (EUR→RON ×rate; RON→EUR ÷rate; aceeași monedă = identitate; rate ≤ 0 respins). Sursa unică de adevăr a regulii.
  - `application/port/in/ConvertProjectCurrencyUseCase.java` + `application/usecase/ConvertProjectCurrencyService.java` (noi) — o singură tranzacție care convertește `project.totalBudget` + toate `room.allocatedBudget` + toate `item.unitPrice`, apoi setează `project.currency = target`. Câmpurile tehnice ale camerelor și restul câmpurilor elementelor rămân neatinse (reconstruite via builder/constructor).
  - `adapter/in/web/dto/ConvertCurrencyRequest.java` (nou, `@NotNull` + `@Positive` pe rate), endpoint în `ProjectController`, mapare `toConvertCommand` în `ProjectDtoMapper` (String label → `Currency` via `DtoConversionSupport`).
  - Teste: `CurrencyConverterTest` (6, regula pură + rotunjire + dus-întors), `UseCasesTest.convertCurrency...` (end-to-end pe fake repos), 3 teste noi în `ProjectControllerTest` (happy path + rate 0 → 400 + rate lipsă → 400). **Total: 77 teste, toate verzi.**
- **Frontend:**
  - `shared/functions/currency.ts` (nou) — `convertAmount`, OGLINDA `CurrencyConverter.java`, folosită DOAR de store-ul mock offline (demo). Adăugat în barrel.
  - `RenovationStore` + `store.tsx`: metodă nouă `convertCurrency(target, rate)`. `ApiStoreProvider` apelează endpoint-ul și **reîncarcă snapshot-ul complet** (project+rooms+items) ca toate paginile/headerele să reflecte sumele convertite. `MockStoreProvider` aplică conversia local (3 updatere pure, fără setState imbricat — sigur în StrictMode).
  - `app/setari/page.tsx`: butonul Salvează apelează acum `convertCurrency` când moneda diferă (nu `updateProject({currency})`); câmpul de curs apare ori de câte ori e nevoie de conversie (ambele direcții), cu hint direcțional; validare rate > 0 cu mesaj de eroare; butonul devine „Convertește și Salvează"; textul „De Reținut" rescris să descrie corect conversia + caveat-ul distructiv.
- **Verificat efectiv** (nu doar compilat): `mvn test` (77 verzi), `npx tsc --noEmit` + `npm run lint` (0 erori, 1 warning preexistent) + `npm run build` (succes). **Testat end-to-end pe backend-ul real local** (Postgres via docker compose + `spring-boot:run` profil dev): `curl` conversie EUR→RON @5 → project 1000→5000, room 500→2500, item 100→500; invers RON→EUR @5 → revine la original; validări 400 (rate 0/negativ/lipsă, monedă invalidă) + 404 (proiect inexistent). **Testat în browser** (`/setari`): selectat RON → apărut câmp curs + buton „Convertește și Salvează"; setat 5, convertit → moneda proiectului RON, valorile scrise prin backend (confirmat `curl`), iar `/centralizator` afișează „1.000 RON" (Robinet 2×500 RON). Datele de test curățate, proiectul readus la starea seed.

**Nefăcut aici:** conversia nu are sursă automată de curs (userul introduce rata manual, ca în cerință). Restul problemelor din audit (2–8) rămân neatinse.

**Fișiere atinse:** `docs/api-contract.md`, `docs/progress.md`; backend nou: `domain/service/CurrencyConverter.java`, `application/port/in/ConvertProjectCurrencyUseCase.java`, `application/usecase/ConvertProjectCurrencyService.java`, `adapter/in/web/dto/ConvertCurrencyRequest.java`; backend modificat: `adapter/in/web/ProjectController.java`, `adapter/in/web/mapper/ProjectDtoMapper.java`; teste: `domain/service/CurrencyConverterTest.java` (nou), `application/usecase/UseCasesTest.java`, `adapter/in/web/ProjectControllerTest.java`; frontend nou: `shared/functions/currency.ts`; frontend modificat: `shared/functions/index.ts`, `shared/types/RenovationStore.ts`, `shared/store.tsx`, `app/setari/page.tsx`.

**Branch:** `023-conversie-moneda-reala`.

### 2026-07-15 — Audit Problema 2: de-duplicare logică frontend↔backend (agregări + dimensiuni server-side)
**De ce:** din `docs/audit-remedieri.md` (Problema 2, severitate mare arhitecturală, cerută explicit de user): fiecare regulă de business exista în DOUĂ locuri (TS + Java), risc de divergență silențioasă. Decizii luate cu userul: **(1)** scope complet, inclusiv dimensiuni; **(2)** dimensiuni = backend autoritativ + preview client; **(3)** ștergere mock store + cod mort.

- **Backend — endpoint de agregare** (`GET /api/projects/{id}/summary`, contract-first în `api-contract.md`): `GetProjectSummaryUseCase`/`Service` (nou) compune într-o citire `{ totalEstimated, totalSpent, budgetRemaining, purchaseProgress, boughtCount, costPerRoom[], costPerCategory[], technical{totalFloorArea, configuredRoomsRatio} }`, TOT din `BudgetCalculator`/`RoomDimensionsCalculator` (nereinventat). DTO `ProjectSummaryResponse` + mapper scris de mână (`ProjectSummaryDtoMapper`).
- **Backend — dimensiuni autoritative**: `RoomResponse` primește un câmp `dimensions` (`RoomDimensionsDto`) calculat server-side din `RoomDimensionsCalculator` (via `RoomDtoMapper.toDimensions`) — sursa de adevăr pentru necesarul de material.
- **Frontend — consum**: `store.tsx` rescris — expune `summary`, reîncărcat după FIECARE mutație. `RenovationStore.summary` (tip nou `ProjectSummary`). Paginile `analiza`/`centralizator`/`elemente` consumă `summary` pentru KPI + donut + progress bars; `configurare` consumă `summary.technical` pentru cardul „Sumar Tehnic Global". `Room.dimensions` (tip nou `RoomDimensions`) vine de la server; `buildRoomCalcRows(room, dims)` refactorizat să primească dims (server pentru PDF, `computeRoomDimensions(draft)` ca preview client la editare — documentat ne-autoritativ).
- **Ștergeri (cod mort/duplicat)**: `MockStoreProvider` + `mock-data.ts` + `auto-items.ts` (`syncAutoItemsForRoom`/`generateAutoItems`, folosite doar de mock) + `currency.ts` (`convertAmount`, folosit doar de mock) — API-ul e acum singurul mod. Funcțiile de agregare acum inutile client-side ȘTERSE: `costPerRoom`, `costPerCategory` (`charts.ts`), `budgetRemaining` (`budget.ts`), `purchaseProgress` (`items.ts`), `projectTechnicalSummary` (`dimensions.ts`). Grep confirmat 0 utilizări înainte de ștergere. `NEXT_PUBLIC_USE_MOCK_DATA` eliminat din `.env.example`.
- **Verificat efectiv**: backend `mvn test` → **79 teste verzi** (nou: `GetProjectSummaryService` end-to-end în `UseCasesTest`, endpoint în `ProjectControllerTest`). Frontend `tsc`/`lint`/`build` OK (1 warning preexistent). **Testat end-to-end pe backend real** (curl): `/summary` agregă corect (estimat 370, cheltuit 250 doar Cumparat, progres, cost/cameră, cost/categorie cu label diacritice, technical); `room.dimensions` calculat corect (Gresie 20mp → floorMaterialNeeded 23.89 = 22 + plintă 1.89). **Testat în browser**: `/analiza` afișează KPI + donut din summary (cheltuit 250, rămas 9.750, 1/3 33%, donut Dormitor Mare 370); `/configurare` afișează sumarul tehnic din server; panoul „Calcule Detaliate" randează preview-ul client (23.89 mp) IDENTIC cu valoarea server (paritate confirmată); 0 erori în consolă.

**Nefăcut aici:** calculele per-RÂND/per-cameră de detaliu (`itemTotal`, `roomSubtotal`, `roomSpent`, `itemsForRoom`, `boughtCount` per-cameră) rămân client-side — sunt randare de tabel, nu agregat de dashboard (documentat). Restul problemelor din audit (3–8) neatinse.

**Fișiere atinse:** `docs/{api-contract,progress}.md`, `CLAUDE.md`, `README.md`, `frontend/.env.example`; backend nou: `application/port/in/GetProjectSummaryUseCase.java`, `application/usecase/GetProjectSummaryService.java`, `adapter/in/web/dto/{ProjectSummaryResponse,RoomDimensionsDto}.java`, `adapter/in/web/mapper/ProjectSummaryDtoMapper.java`; backend modificat: `adapter/in/web/ProjectController.java`, `adapter/in/web/dto/RoomResponse.java`, `adapter/in/web/mapper/RoomDtoMapper.java`, teste `UseCasesTest`/`ProjectControllerTest`; frontend nou: `shared/types/{ProjectSummary,RoomDimensions}.ts`; frontend modificat: `shared/types/{index,Room,RenovationStore}.ts`, `shared/store.tsx`, `shared/functions/{index,items,budget,charts,dimensions}.ts`, `app/{analiza,centralizator,elemente,configurare}/page.tsx`, `app/configurare/{roomCalcRows,RoomTechnicalCard,ApartmentPdfDocument}.tsx`; ȘTERSE: `shared/mock-data.ts`, `shared/functions/{auto-items,currency}.ts`.

**Branch:** `023-conversie-moneda-reala` (același MR ca Problema 1).

### 2026-07-16 — Audit Problemele 3+4: timestamp-uri pe items + grafic „Evoluția Cheltuielilor" real
**De ce:** din `docs/audit-remedieri.md`. Problema 4 (severitate mare): `Item` nu avea niciun câmp de dată — imposibil de construit o evoluție reală. Problema 3 (severitate mare): graficul „Evoluția Cheltuielilor" era o curbă SVG hardcodată + bare mobile fixe, indiferent de date. Auditul le leagă explicit (3 depinde de 4) și recomandă „evoluție = după momentul cumpărării" — decizie aplicată (nu doar `createdAt`, ci și `purchasedAt` separat).

- **Migrare** `V3__items_timestamps.sql` (nouă, nu modifică V1/V2): `items.created_at TIMESTAMPTZ NOT NULL DEFAULT now()` + `items.purchased_at TIMESTAMPTZ` (nullable — elementele deja Cumpărate înainte de migrare nu au un moment real cunoscut, rămân NULL).
- **Backend — port nou** `TimeProvider` (`application/port/out` + `adapter/out/time/SystemTimeProvider`) — `Instant.now()` niciodată direct în use case, testabil via `FakeTimeProvider`.
- **`Item.java`** (domain): +`Instant createdAt` (obligatoriu), +`Instant purchasedAt` (nullable). Toate cele ~15 puncte de construcție (`AddItemService`, `UpdateItemService`, `AutoItemReconciler`, `ConvertProjectCurrencyService`, + teste) actualizate.
  - `AddItemService`: `createdAt = now()`; `purchasedAt = now()` DOAR dacă elementul e creat direct cu status Cumpărat (rar, dar posibil).
  - `UpdateItemService`: `purchasedAt` se actualizează DOAR la tranziția SPRE Cumpărat (era altceva → devine Cumpărat) — nu se „reîmprospătează" dacă rămâne Cumpărat, nu se șterge dacă revine la alt status (istoric).
  - `AutoItemReconciler.reconcile`: semnătură nouă cu `Instant now` — elementele auto existente păstrează `createdAt`/`purchasedAt` neschimbate (la fel ca id/preț/status), cele noi primesc `createdAt = now`, `purchasedAt = null`.
- **Backend — endpoint nou** `GET /api/projects/{id}/spending-timeline` (`GetSpendingTimelineUseCase`/`Service`): grupează elementele Cumpărate pe luna (UTC) lui `purchasedAt`, însumează `itemTotal` (din `BudgetCalculator`, nereinventat), calculează suma cumulativă crescătoare (`TreeMap<YearMonth,...>`, sortare naturală). Listă goală dacă nimic nu-i cumpărat.
- **`ItemEntity`/`ItemResponse`**: +2 coloane/`Instant` (Jackson serializează ISO-8601 automat, fără conversie custom — la fel ca `Double floorArea` pe `RoomResponse`).
- Teste: `mvn test` → **85 verzi** (+6 față de sesiunea Problema 1+2): `addItem`/`updateItem` setează corect `createdAt`/`purchasedAt` (tranziție, non-reîmprospătare, păstrare la revenire), `spendingTimeline` agregă cumulativ corect + listă goală, endpoint nou în `ProjectControllerTest`, round-trip Postgres real pe `PersistenceAdapterIntegrationTest` (cu trunchiere la microsecunde — Postgres TIMESTAMPTZ nu păstrează nanosecunde).
- **Frontend:**
  - `Item.ts`: +`createdAt: string`, +`purchasedAt?: string` (gestionate exclusiv de server — `RenovationStore.addItem` exclude ambele din tipul param, `Omit<Item, "id" | "createdAt" | "purchasedAt">`).
  - `SpendingTimelinePoint.ts` (nou, shared) — oglinda răspunsului.
  - `store.tsx`: `reloadSummary` redenumit `reloadAggregates` — reîncarcă ACUM `summary` + `spendingTimeline` în paralel, la fiecare mutație + load inițial.
  - `shared/functions/charts.ts`: +`timelinePoints(data)` (normalizare {x,y}∈[0,1], geometrie de prezentare, alături de `donutSegments`).
  - `app/analiza/dates.ts` (nou, LOCAL — folosit doar în `/analiza`, nu promovat în shared): `formatMonthLabel("yyyy-MM")` → etichetă RO scurtă, cu anul doar dacă diferă de cel curent.
  - `app/analiza/page.tsx`: graficul desktop (SVG hardcodat cu curbă Bezier falsă) înlocuit cu polilinie reală prin punctele din `spendingTimeline` (sau un singur punct → cerc, sau listă goală → empty-state explicit, NICIODATĂ o curbă falsă — regulă explicită din audit); graficul mobil (bare cu înălțimi fixe) înlocuit cu bare reale, o bară per lună. Legenda „Realizat/Estimare" (implica două serii) simplificată la o singură etichetă „Cheltuit cumulat" (avem o singură serie reală).
- **Verificat efectiv**: `mvn test` (85 verzi), `npx tsc --noEmit`/`npm run lint`/`npm run build` (0 erori, 1 warning preexistent).

**Nefăcut aici:** restul problemelor din audit (5–8) neatinse. Nu există sursă automată de curs sau alt element în afara scopului celor două probleme.

**Fișiere atinse:** `docs/{api-contract,progress}.md`, `CLAUDE.md`; backend nou: `db/migration/V3__items_timestamps.sql`, `application/port/out/TimeProvider.java`, `adapter/out/time/{SystemTimeProvider,package-info}.java`, `application/port/in/GetSpendingTimelineUseCase.java`, `application/usecase/GetSpendingTimelineService.java`, `adapter/in/web/dto/SpendingTimelinePointResponse.java`, `adapter/in/web/mapper/SpendingTimelineDtoMapper.java`; backend modificat: `domain/model/Item.java`, `application/usecase/{AddItemService,UpdateItemService,ConvertProjectCurrencyService,UpdateRoomService}.java`, `domain/service/AutoItemReconciler.java`, `adapter/out/persistence/entity/ItemEntity.java`, `adapter/in/web/dto/ItemResponse.java`, `adapter/in/web/ProjectController.java`; teste noi/modificate: `FakeTimeProvider.java` (nou), `UseCasesTest`, `ItemControllerTest`, `ProjectControllerTest`, `PersistenceAdapterIntegrationTest`, `DomainInvariantsTest`, `BudgetCalculatorTest`, `AutoItemReconcilerTest`; frontend nou: `shared/types/SpendingTimelinePoint.ts`, `app/analiza/dates.ts`; frontend modificat: `shared/types/{Item,RenovationStore,index}.ts`, `shared/store.tsx`, `shared/functions/charts.ts`, `app/analiza/page.tsx`.

**Branch:** `024-timestamp-si-grafic-evolutie`.
