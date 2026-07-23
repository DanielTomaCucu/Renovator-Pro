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
| `materialUnit(materialType)` | `shared/functions/items.ts` | unitatea de măsură după categoria de material (mp/ml/l/kg/saci/buc) | `elemente`, `centralizator`, `ItemFormDrawer`, `ItemDetailsDrawer`, `CentralizatorPdfDocument`, `comparator/GroupFormDrawer` |
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
| `netWallTilingArea(room)` | `shared/functions/dimensions.ts` | suprafață NETĂ de faianță (fără pierdere de tăiere) — pt. amorsă/adeziv/chit, nu plăcile tăiate | intern (`wallTilingArea`, `tilingPrimerLiters`, `wallAdhesiveKg`, `groutKg`) |
| `netFloorTilingArea(room)` | `shared/functions/dimensions.ts` | suprafață NETĂ de pardoseală gresie (= `floorArea`, doar la Gresie) | intern (`tilingPrimerLiters`, `floorAdhesiveKg`, `groutKg`) |
| `ceilingPaintArea(room)` | `shared/functions/dimensions.ts` | aria zugrăvirii tavanului (`floorArea × 1.10`), activată explicit, orice pardoseală — A.1 | intern (`computeRoomDimensions`, `paintPrimerLiters`), `roomCalcRows.ts` |
| `paintAboveTilingArea(room)` | `shared/functions/dimensions.ts` | aria vopselei deasupra faianței, doar Gresie cu `roomHeight > tileHeight` — A.2 | intern (`computeRoomDimensions`, `paintPrimerLiters`), `roomCalcRows.ts` |
| `paintPrimerLiters(room)` | `shared/functions/dimensions.ts` | amorsă sub zugrăveală (pereți+tavan+deasupra faianței), litri rotunjiți ↑ — B.4 | `computeRoomDimensions`, `roomCalcRows.ts` |
| `tilingPrimerLiters(room)` | `shared/functions/dimensions.ts` | amorsă sub adezivul de plăci (arii nete pardoseală+faianță), litri rotunjiți ↑ — B.5 | `computeRoomDimensions`, `roomCalcRows.ts` |
| `floorAdhesiveKg(room)` / `wallAdhesiveKg(room)` | `shared/functions/dimensions.ts` | adeziv de plăci (kg) după `TileSize`, doar Gresie/faianță — C.6/C.7 | `computeRoomDimensions`, `adhesiveBags`, `roomCalcRows.ts` |
| `adhesiveBags(room)` | `shared/functions/dimensions.ts` | saci de 25kg (floor+wall adeziv, produs comun), ceil — C.8 | `computeRoomDimensions`, `roomCalcRows.ts` |
| `groutKg(room)` | `shared/functions/dimensions.ts` | chit de rosturi (pardoseală+faianță), kg rotunjit ↑ — C.9 | `computeRoomDimensions`, `roomCalcRows.ts` |
| `underlayArea(room)` | `shared/functions/dimensions.ts` | folie sub parchet laminat (mp, ceil), doar `FlooringType.ParchetLaminat` — D.10 | `computeRoomDimensions`, `roomCalcRows.ts` |
| `buildRoomCalcRows(room, dims)` | `app/configurare/roomCalcRows.ts` (local) | rândurile din „Calcule Detaliate" (label/valoare/formulă/math) din `dims` (server sau preview) | `RoomTechnicalCard`, `ApartmentPdfDocument` |
| `timelinePoints(data)` | `shared/functions/charts.ts` | normalizează `SpendingTimelinePoint[]` (din `spending-timeline`, 2 serii: cumulativeSpent + cumulativeTotal) în puncte {x,ySpent,yTotal}∈[0,1] pe ACEEAȘI scală — geometrie de prezentare | `analiza` (`SpendingTimelineChart`) |
| `useAsyncAction(action)` | `shared/useAsyncAction.ts` | hook — rulează o acțiune (mutație de store), expune `{ run, pending }` pt. spinner-ul din butoane; ignoră apeluri re-entrante, guard de unmount | `ItemFormDrawer`, `RoomFormDrawer`, `ConfirmDialog`, `elemente/page.tsx` (Adăugare Rapidă), `RoomTechnicalCard` (Salvează), `setari/page.tsx` (ambele butoane) |
| `formatMonthLabel(month)` | `app/analiza/dates.ts` (local) | formatează "yyyy-MM" într-o etichetă scurtă RO ("Ian", "Ian 2025" dacă anul diferă de cel curent) | `analiza` (axa graficului de evoluție) |
| `compressImage(file, maxSide?, quality?)` | `shared/functions/image.ts` | comprimă o poză (canvas, redimensionare + reencodare JPEG) înainte de a o encoda ca data URI | `comparator/[groupId]/OfferFormDrawer`, `galerie/GalleryFormDrawer` — promovată din local în shared când a doua pagină a avut nevoie de ea |

### Funcții locale de pagină

| Funcție | Fișier / Locație | Ce face | Folosită în |
|---|---|---|---|
| `offerPriceRange(offers)` | `app/comparator/groupOffers.ts` (local) | interval min–max al ofertelor CU preț completat (null dacă niciuna) | `/comparator` (carduri de grup) |
| `cheapestOfferId(offers)` | `app/comparator/[groupId]/offerCompare.ts` (local) | id-ul ofertei cu cel mai mic preț, doar între cele CU preț | `/comparator/[groupId]` (badge „Cel mai bun preț") |
| `detectStoreName()` | `app/comparator/[groupId]/detectStore.ts` (local) | geolocation → reverse-geocoding Nominatim, best-effort (null la refuz/timeout) | `OfferFormDrawer` (buton „Detectează magazinul") |
| `configuredItemCandidates(items, roomId, materialType)` | `app/comparator/configuredItemCandidates.ts` (local) | elementele „Din Configurare" candidate pt. legarea unui grup (oglindă client-side a `AutoItemReconciler.resolveLinkedItem`) | `GroupFormDrawer` (panou țintă legătură) |
| `decidedGroupForItem(groups, itemId)` | `app/elemente/decidedGroupForItem.ts` (local) | grupul Decis al cărui `createdItemId` e acest element — pt. chip-ul „Ofertă aleasă" | `elemente/page.tsx` (lângă `OriginBadge`) |

_(`dimensions.ts` a fost promovat în `shared/functions/` de îndată ce a devenit necesar și din `store.tsx`, nu doar din pagina `configurare`)_

## Registru de tipuri (`src/shared/types/`, un fișier per tip)

| Tip | Fișier | Fel |
|---|---|---|
| `RoomType` | `RoomType.ts` | enum |
| `ItemStatus` | `ItemStatus.ts` | enum |
| `ItemOrigin` | `ItemOrigin.ts` | enum (Manual / Configurare / Comparator — proveniența unui element) |
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
| `RenovationStore` | `RenovationStore.ts` | interface (extins cu `comparisonGroups` + 7 mutații ale Comparatorului de Oferte, `inspirationImages` + 3 mutații ale Galeriei de Inspirație) |
| `DonutSegment` | `DonutSegment.ts` | interface |
| `ComparisonGroupStatus` | `ComparisonGroupStatus.ts` | enum (În analiză / Decis) |
| `Offer` | `Offer.ts` | interface (o ofertă dintr-un grup de comparație — TOATE câmpurile descriptive opționale; `images: string[]`, URL sau data-URI, ca `Item.imageUrl`) |
| `ComparisonGroup` | `ComparisonGroup.ts` | interface (grup de comparație pt. o cameră, cu `offers: Offer[]` nested) |
| `InspirationType` | `InspirationType.ts` | enum (Poză Proprie / Randare / Inspirație Online) |
| `InspirationImage` | `InspirationImage.ts` | interface (o poză din Galeria de Inspirație, `roomId?` opțional, `image: string` URL sau data-URI ca `Item.imageUrl`) |

Tipuri locale de pagină (nu în `shared/`, deocamdată folosite într-un singur loc):

| Tip | Fișier | Pagină |
|---|---|---|
| `DeleteTarget` | `src/app/elemente/DeleteTarget.ts` | `/elemente` |
| `ItemDrawerState` | `src/app/elemente/ItemDrawerState.ts` | `/elemente` |
| `GalleryDrawerState` | `src/app/galerie/GalleryDrawerState.ts` | `/galerie` |

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

### 2026-07-16 — Audit Problemele 5–8: buget/titlu editabile, PATCH cu ștergere explicită, defaults UX, verificare finală
**De ce:** userul a cerut rezolvarea rândului pe rând a Problemelor 5–8 din `docs/audit-remedieri.md`, într-o singură sesiune. Branch nou din `main` la zi (conform workflow-ului Git obligatoriu) — NU include Problemele 3+4 (timestamp/grafic evoluție), care stau pe branch-ul separat `024-timestamp-si-grafic-evolutie`, local, nepus încă.

- **Problema 5 (buget/titlu needitabile):** card nou „Detalii Proiect" în `/setari` (titlu + buget total), separat de „Configurare Monedă" — apelează `updateProject({ title, totalBudget })` cu validare client (titlu nevid, buget ≥ 0). Nimic pe backend (endpointul + validarea existau deja).
- **Problema 6 (PATCH nu poate ȘTERGE câmpuri opționale — cea mai complexă tehnic):**
  - **Backend:** `Patch<T>` (nou, `application/port/in`) — tip domeniu-agnostic ce distinge `absent()` (nu se modifică) de `of(value)` (setează, `value` poate fi `null` = șterge explicit). `UpdateRoomUseCase.Command` schimbă toate câmpurile tehnice OPȚIONALE (`floorMaterial`…`windows`) la `Patch<T>`; `type`/`name`/`allocatedBudget` rămân cu convenția veche (obligatorii, nu pot fi șterse). `UpdateRoomService` aplică `command.câmp().resolve(existing.câmp())`.
  - DTO (`RoomUpdateRequest`) folosește `JsonNullable<T>` (dependință nouă `org.openapitools:jackson-databind-nullable`) pe câmpurile tehnice — distinge „cheie absentă" de „cheie prezentă cu null" la deserializare JSON. Modul înregistrat via bean nou `config/JacksonConfig`. `RoomDtoMapper.toUpdateCommand` rescris manual (nu MapStruct auto) — traduce `JsonNullable` → `Patch` prin helper-e noi `DtoConversionSupport.toPatch(...)`.
  - **Frontend:** `RoomTechnicalCard.handleSave()` normalizează explicit `undefined` → `null` pe toate câmpurile tehnice opționale ale draftului (altfel `JSON.stringify` omite cheia = „nu se modifică", nu „șterge"). `RenovationStore.updateRoom`/`store.tsx` acceptă acum `{ [K in keyof Room]?: Room[K] | null }` (nu doar `Partial<Room>`).
  - Teste noi: `RoomControllerTest` (2, HTTP real prin `MockMvc` cu `ObjectMapper` + `JsonNullableModule` înregistrat manual în `standaloneSetup` — altfel NPE, `JsonNullable` nu se instanțiază fără modul), `UseCasesTest` (1 nou, `Patch.absent()` vs `Patch.of(null)` explicit). **82 teste backend, toate verzi.**
  - Verificat end-to-end pe backend real (`curl`): configurat `wallTiling`, apoi PATCH cu alt câmp (fără `wallTiling` în body) → păstrat; apoi PATCH cu `"wallTiling": null` explicit → șters (`None`), elementul auto-generat „Faianță” dispărut din reconciliere, `floorMaterial` neatins.
- **Problema 7 (tileHeight/wallHeight = 0 implicit):** `toggleWallTiling`/`toggleWallFinish` în `RoomTechnicalCard.tsx` inițializează acum `tileHeight`/`wallHeight` la `2.5` (înălțime tipică cameră), nu `0`. Plus hint explicit în panoul „Calcule Detaliate" dacă totuși ajung la 0 (editare manuală ulterioară): „Înălțime Placare e 0 → aria de faianță e 0. Completează câmpul mai sus." (similar pt. wallFinish). Verificat vizual în browser: activarea placării arată acum 2.5 implicit.
- **Problema 8 (verificare finală reactivitate):** confirmat că rezolvarea 5 (buget real) + 2 (summary server-side, deja mergeuit) fac header-ele corecte peste tot — `/analiza` arată „Buget Rămas” = suma corectă (nu negativ implicit), reîncărcat automat din `summary` la fiecare mutație. Nicio schimbare de cod suplimentară necesară — doar verificare.
- **Verificat efectiv:** `mvn test` (82 verzi), `npx tsc --noEmit`/`npm run lint`/`npm run build` (0 erori, 1 warning preexistent). End-to-end pe backend real (Postgres local + `curl`) + în browser: Problema 5 (title/totalBudget salvate prin UI, confirmate pe backend + reflectate în `/analiza`), Problema 6 (absent vs. null explicit, ambele direcții), Problema 7 (default 2.5 confirmat în input). Date de test curățate, proiect + cameră readuse la starea seed.

**Fișiere atinse:** `docs/{api-contract,progress}.md`, `backend/pom.xml` (dependință nouă); backend nou: `application/port/in/Patch.java`, `config/JacksonConfig.java`; backend modificat: `application/port/in/UpdateRoomUseCase.java`, `application/usecase/UpdateRoomService.java`, `adapter/in/web/dto/RoomUpdateRequest.java`, `adapter/in/web/mapper/{RoomDtoMapper,DtoConversionSupport}.java`, teste `UseCasesTest`/`RoomControllerTest`; frontend modificat: `shared/types/RenovationStore.ts`, `shared/store.tsx`, `app/setari/page.tsx`, `app/configurare/RoomTechnicalCard.tsx`.

**Branch:** `025-buget-titlu-editabil-patch-null-defaults` (merge-uit ulterior peste `024-timestamp-si-grafic-evolutie` pe branch-ul `026-fix-buguri-confirmate`, pentru remedierea buguri lor confirmate din audit live).

### 2026-07-16 — Fix buguri confirmate din auditul live (rotunjire bani, grafic fals, erori înghițite, FOUT iconițe)
**De ce:** userul a cerut testarea funcțională live a aplicației (nu doar citirea codului). Testare directă în browser + API a scos la iveală 5 buguri reale, dincolo de cele deja documentate în `docs/audit-remedieri.md`. Branch nou din `origin/main` la zi — a inclus întâi merge-ul local al `024-timestamp-si-grafic-evolutie` (Probleme 3+4 din audit, scris dar niciodată pus/mergeuit), care era încă ne-integrat și bloca verificarea graficului real.

- **Merge `024` → `026`:** 3 conflicte (`UseCasesTest.java` — două importuri distincte, combinate; `docs/api-contract.md` și `docs/progress.md` — secțiuni/intrări de jurnal independente, concatenate cronologic, fără pierdere de conținut). Backend recompilat + `mvn test` → **88 teste verzi** după merge.
- **Bug 1 — rotunjire silențioasă a banilor:** `formatMoney` (`shared/functions/money.ts`) avea `maximumFractionDigits: 0` — un element de 99.5 EUR apărea peste tot ca „100 EUR" (tabel, donut, totaluri), înșelător pe o aplicație de buget. Fix: `maximumFractionDigits: 2`, zecimalele apar doar când suma nu e întreagă (100 EUR rămâne „100 EUR", dar 99.5 devine „99,5 EUR"). Verificat live: element de 99.5 EUR afișat corect pe `/elemente`, `/analiza`, `/centralizator`.
- **Bug 3 — store.tsx înghițea toate erorile de mutație:** nicio mutație (`updateProject`, `addItem`, etc.) nu avea `.catch` — un request eșuat (validare, rețea, backend jos) pierdea datele în tăcere, iar UI-ul (ex. Setări) arăta „Salvat ✓" oricum, imediat, fără să aștepte răspunsul. Plus: `if (!value) return null` la încărcarea inițială → ecran alb fără feedback (grav pe Render free tier, cu cold-start de zeci de secunde).
  - `store.tsx` rescris: toate mutațiile devin `async`/`try-catch`, eșecul NU schimbă starea locală și ajunge în `error` (nou în `RenovationStore`) — afișat ca toast global (colț dreapta-jos) cu buton de închidere (`dismissError`).
  - Încărcarea inițială: `initialLoadError`/`loadAttempt` separate de starea de mutație — ecran dedicat cu mesaj + buton „Reîncearcă” în loc de pagină albă; spinner cât timp datele se încarcă prima dată.
  - `app/setari/page.tsx`: `handleSaveDetails`/`handleSave` devin `async`, `await updateProject(...)`/`await convertCurrency(...)` înainte de a arăta „Salvat ✓” — confirmarea reflectă acum rezultatul real al requestului.
  - Verificat live: oprire intenționată a backend-ului → ecran „Nu am putut încărca datele proiectului” cu buton Reîncearcă (nu pagină albă); repornire backend + reload → aplicația se încarcă normal.
- **Bug 5 — FOUT pe iconițe (text literal „home_work” etc. la fiecare încărcare):** fontul Material Symbols venea printr-un `<link>` extern spre Google Fonts în `app/layout.tsx` — până se descarcă fontul, span-urile arătau numele iconiței ca text brut. Fix: pachetul npm `material-symbols` (self-hosted, `font-display: block` — ascunde span-ul până se încarcă fontul, în loc să afișeze text), importat direct în `layout.tsx` (`import "material-symbols/outlined.css"`), `<link>`-ul extern eliminat. `CLAUDE.md` (secțiunea Iconițe) actualizat — nu mai descrie asta ca „de făcut”, ci ca implementat.
- **Bug 2 (graficul fals) și Bug 4 (branch-uri paralele `024`/`025`)** — rezolvate implicit prin merge-ul `024` descris mai sus (graficul real era deja scris pe acel branch, doar nu era integrat).
- **Verificat efectiv:** `npx tsc --noEmit` (0 erori), `npm run lint` (0 erori, 1 warning preexistent `no-img-element`), `npm run build` (succes, toate cele 7 rute). Backend: `mvn test` → 88 verzi. **Testat live, end-to-end** (backend local repornit cu codul nou după merge, ca să preia endpoint-ul `/spending-timeline`): element de 99.5 EUR adăugat prin UI → afișat corect cu zecimale peste tot; marcat Cumpărat → graficul „Evoluția Cheltuielilor” arată un punct real (99,5 EUR, luna curentă), nu mai curba SVG falsă; header-ele (`Cheltuieli totale`, `Buget rămas`, `Achiziții finalizate`) reflectă corect suma reală. Date de test șterse, proiect readus la starea seed (`totalBudget: 0`) după verificare.

**Nefăcut aici:** restul recomandărilor din auditul live (etichete inconsistente „estimat”, poză base64 nelimitată, căutare decorativă, istoric curs fals, pluralizare RO) rămân neatinse — sunt de severitate mai mică, task-uri separate.

**Fișiere atinse:** merge `024`→`026` (vezi fișierele listate în intrarea „Audit Problemele 3+4” de mai sus); plus, direct în această sesiune: `CLAUDE.md`, `frontend/package.json`/`package-lock.json` (dependință nouă `material-symbols`), `frontend/src/app/layout.tsx`, `frontend/src/app/setari/page.tsx`, `frontend/src/shared/functions/money.ts`, `frontend/src/shared/store.tsx` (rescris), `frontend/src/shared/types/RenovationStore.ts`.

**Branch:** `026-fix-buguri-confirmate` (din `origin/main`, include merge-ul `024-timestamp-si-grafic-evolutie`).

### 2026-07-16 — Loading states: skeleton la încărcare + spinner în butoane
**De ce:** userul a semnalat că backend-ul (Render free tier) e lent — cold-start de zeci de secunde. Fără feedback vizual, aplicația pare blocată. Specificat complet în `docs/cerinte-loading-states.md` (inventar exact al butoanelor, decizii de design, pași de verificare) — implementat 1:1 după acel document.

- **Task 1 — Infrastructură:**
  - `RenovationStore.ts`: toate mutațiile (`updateProject`, `convertCurrency`, `addRoom`, `updateRoom`, `deleteRoom`, `addItem`, `updateItem`, `deleteItem`) tipate `=> Promise<void>` (erau `=> void`, deși implementarea era deja `async` — tipul mințea).
  - `components/Spinner.tsx` (nou) — spinner mic reutilizabil, `border-current` (moștenește culoarea textului, merge pe fundal negru și alb fără prop de culoare).
  - `shared/useAsyncAction.ts` (nou) — hook care rulează o acțiune și expune `{ run, pending }`; ignoră apeluri re-entrante (dublu-click), `finally` cu guard de unmount (`useRef`) ca să nu dea warning React dacă componenta se demontează exact la finalul acțiunii.
- **Task 2 — Loading la nivel de pagină:**
  - `app/layout.tsx`: `<Sidebar />` mutat ÎN AFARA `<StoreProvider>` (nu folosește `useStore()`) — rămâne vizibil și navigabil cât timp datele se încarcă, în loc să dispară tot ecranul.
  - `components/PageSkeleton.tsx` (nou) — UN SINGUR skeleton comun tuturor paginilor (store-ul e global, datele se încarcă o singură dată la montare); imită structura comună (titlu + card sumar gradient + blocuri de conținut), titlul rămâne bloc pulse (sidebar-ul evidențiază deja ruta activă).
  - `shared/store.tsx`: spinner-ul full-screen vechi înlocuit cu `<PageSkeleton />`; ecranul de eroare la încărcare (cu „Reîncearcă") rămâne, ajustat să se randeze corect lângă sidebar (nu mai `min-h-screen` centrat pe tot ecranul).
- **Task 3 — Spinner pe butoane (8 locuri, conform inventarului din spec):**
  - `components/forms.tsx` — `PrimaryButton` primește prop `pending?: boolean`, randează `<Spinner />` + `disabled` + `aria-busy`.
  - `components/ItemFormDrawer.tsx`, `components/RoomFormDrawer.tsx` — `submit` împachetat în `useAsyncAction`, `await` mutația înainte de `onClose()` (înainte se închideau instant, înainte de răspunsul serverului); `PrimaryButton` primește `pending`; „Anulează” disabled cât timp e pending.
  - `components/ConfirmDialog.tsx` — gestionează `pending` INTERN (`useAsyncAction` peste `onConfirm`), consumatorii doar dau mutația; buton „Șterge” cu spinner, „Anulează” disabled, click pe overlay ignorat cât timp e pending. Consumatorii (`elemente/page.tsx`, `RoomTechnicalCard.tsx`) actualizați să facă `await` pe `deleteRoom`/`deleteItem` înainte de a închide dialogul local.
  - `app/elemente/page.tsx` — `quickAdd` (Adăugare Rapidă) împachetat în `useAsyncAction`, un singur `pending` pentru butoanele desktop ȘI mobil (nu pot fi apăsate simultan); formularul de pe mobil își aștepta închiderea panoului (`setMobileQuickAddOpen(false)`) DUPĂ `await`, nu înainte (bug similar cu drawerele).
  - `app/configurare/RoomTechnicalCard.tsx` — `handleSave` împachetat în `useAsyncAction`, `await updateRoom(...)` înainte de `setOpen(false)`; fiecare card are propriul `useAsyncAction` (salvarea unei camere nu blochează altă cameră).
  - `app/setari/page.tsx` — `handleSaveDetails`/`handleSave` împachetate în `useAsyncAction`, spinner înlocuiește iconița `ACTION_ICONS.save` pe ambele butoane.
  - `app/configurare/page.tsx` — butonul „Export PDF” (avea deja `exportingPdf` propriu, stare locală de generare PDF, nereconvertită la `useAsyncAction`) aliniat vizual: `<Spinner />` în loc de iconița statică `TECHNICAL_ICONS.calculatedResults`.
- **Verificat efectiv, cu delay artificial de 2s** (temporar în `api-client.ts`, șters înainte de commit — confirmat cu `grep -rn "setTimeout" src/shared/api-client.ts` → 0 rezultate): sidebar vizibil + skeleton la refresh; spinner corect pe toate cele 8 butoane (Adăugare Rapidă desktop confirmat vizual cu `zoom`); `ItemFormDrawer`/`RoomFormDrawer` rămân deschise cu spinner până la răspuns; `ConfirmDialog` — „Șterge”/„Anulează” disabled, dialogul se închide după răspuns; `/setari` — spinner înlocuiește iconița pe „Salvează Detaliile”. Zero erori/warning-uri în consolă (verificat explicit, inclusiv absența warning-urilor de „state update on unmounted component”). `npx tsc --noEmit`, `npm run lint`, `npm run build` — 0 erori (1 warning preexistent). Date de test șterse, proiect readus la starea seed.
- **Netestat interactiv** (blocat de un dropdown custom cu portal, poziționare offset în unelte de automatizare browser, nelegat de schimbările din acest task): butonul „Salvează” din `RoomTechnicalCard` — verificat static (cod identic ca pattern cu celelalte 7 butoane, `tsc`/`lint`/`build` curate).

**Nefăcut aici** (documentat explicit ca fiind neatins, în `docs/cerinte-loading-states.md`): debounce pe inputul „Suprafață Totală Apartament” din `/configurare` (trimite PATCH la fiecare tastă apăsată) și butonul „PDF” fără `onClick` din `/centralizator` — semnalate, nu rezolvate, task-uri separate.

**Fișiere atinse:** `docs/cerinte-loading-states.md` (nou, specificația), `frontend/src/components/{Spinner,PageSkeleton}.tsx` (noi), `frontend/src/shared/useAsyncAction.ts` (nou); modificate: `frontend/src/shared/types/RenovationStore.ts`, `frontend/src/shared/store.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/components/{forms,ItemFormDrawer,RoomFormDrawer,ConfirmDialog}.tsx`, `frontend/src/app/elemente/page.tsx`, `frontend/src/app/configurare/{page,RoomTechnicalCard}.tsx`, `frontend/src/app/setari/page.tsx`, `README.md`, `CLAUDE.md`.

**Branch:** `027-loading-states`.

### 2026-07-18 — Specificații noi: autentificare (Faza 5) + keep-alive Render (doar tickete, fără implementare)
**De ce:** userul a cerut (1) securizarea aplicației cu cont propriu — login minimal cu nume + parolă, register cu nume + parolă + numele proiectului — adică execuția Fazei 5 din blueprint, amânată până acum intenționat; (2) aplicația trează zilnic 08:00–21:00 (Render free face spin-down după 15 min de inactivitate). Sesiunea a produs DOAR specificațiile; implementarea urmează în sesiuni separate, ticket cu ticket.

- `docs/cerinte-autentificare.md` (nou) — 6 tickete ordonate (AUTH-1…AUTH-6): contract API întâi, migrare Flyway V5 (users.username + refresh_tokens), backend register/login/JWT/refresh/logout, autorizare pe project_members + ștergerea stub-ului `WebConstants.STUB_USER_ID`, pagini frontend `/login`+`/register` + sesiune în `api-client.ts` (dispare `DEFAULT_PROJECT_ID` hardcodat), config producție (JWT_SECRET, CORS cu credentials, cookie `SameSite=None`). Decizii documentate: login pe username (nu email), fără reset de parolă (consecință asumată), primul cont înregistrat adoptă proiectul seed cu datele existente.
- `docs/cerinte-keepalive-render.md` (nou) — 1 ticket principal (KEEP-1): workflow GitHub Actions cu cron `*/10 4-19 * * *` UTC + gardă de oră locală `Europe/Bucharest` (fereastră exactă 08:00–21:00 indiferent de DST), ping pe `/actuator/health` (atinge și Postgres-ul Supabase prin health indicator — previne și pauza Supabase de 7 zile). Aritmetică verificată: 13 h/zi ≈ 403 h/lună din plafonul de 750 h instance-hours Render free. Plan B (KEEP-2): cron-job.org.

**Fișiere atinse:** `docs/cerinte-autentificare.md` (nou), `docs/cerinte-keepalive-render.md` (nou), `README.md` (linkuri în secțiunea Documentație), `docs/progress.md`.

**Addendum (2026-07-18, aceeași sesiune):** userul a cerut și partajarea unui proiect între 2+ persoane. `docs/cerinte-autentificare.md` extins: deciziile D6 (cod de invitație introdus la înregistrare — „Creez proiect nou" vs „Mă alătur unui proiect"; cine se alătură devine EDITOR) și D7 (rol fix EDITOR în v1), coloană `projects.invite_code` în migrarea V5 (AUTH-2), calea „register cu inviteCode" în contract + backend (AUTH-1/3/4), toggle pe pagina `/register` (AUTH-5) și ticket nou **AUTH-7** (endpoint-uri invite-code/members + secțiunea „Partajare proiect" în `/setari`, cu DoD end-to-end pe două conturi). Alăturarea unui cont deja existent la alt proiect = explicit în afara scope-ului v1.

### 2026-07-18 — Faza 5 implementată: autentificare JWT + partajare proiect prin cod de invitație
**De ce:** execuția completă a ticketelor AUTH-1…AUTH-7 din `docs/cerinte-autentificare.md` (specificația scrisă mai devreme aceeași zi) — userul a cerut implementarea integrală, nu doar planul.

**Backend** (branch `036-autentificare-faza5`):
- `V5__auth.sql` — `users.username` (unic, case-insensitive, `email` devine opțional), `refresh_tokens`, `projects.invite_code`.
- Spring Security stateless + JJWT 0.13.0 (HS256, access token 15 min), refresh token opac (256 biți) rotit la fiecare folosire + hash SHA-256 în DB, cookie httpOnly/Secure/SameSite (`None` pe prod, `Lax` pe dev). Rate limiting in-memory pe `/api/auth/**` (10 req/min/IP, configurabil, relaxat în teste).
- `MembershipGuard` — toate use case-urile Room/Item/Project existente (13 servicii) verifică acum rolul (`OWNER`/`EDITOR`/`VIEWER`) userului curent pe proiectul resursei; refuz = 404 uniform, niciodată 403 (decizie D8 — nu distinge „nemembru" de „membru fără rol", ambele ar scurge existența resursei). `WebConstants.STUB_USER_ID` șters — `CurrentUser.id()` citește din `SecurityContext`, populat de `JwtAuthenticationFilter`.
- `RegisterUserService`: două căi — `projectName` (creează proiect nou SAU adoptă automat proiectul seed `...-010` dacă e primul cont real din sistem, D3) sau `inviteCode` (devine EDITOR pe proiectul existent, D6).
- AUTH-7: `ProjectMembersController` — cod de invitație (get/regenerate, generat leneș, doar OWNER) + membri (listă vizibilă tuturor, ștergere doar OWNER, revocă refresh tokens la eliminare).
- `CorsConfig` rescris ca `CorsConfigurationSource` explicit (`allowCredentials(true)`), partajat cu `SecurityConfig` — necesar pentru cookie-ul de refresh cross-site (Vercel ↔ Render).
- Teste: 98/98 verzi (`mvn verify`, cu Testcontainers/Postgres real) — `AuthFlowIntegrationTest` (register→login→acces→refresh→logout→refresh eșuează, username duplicat→409, parolă greșită→401, cod invitație inexistent→404) și `IdorAuthorizationIntegrationTest` (user A nu accesează resursele lui B pe niciun endpoint; EDITOR invitat scrie dar nu administrează proiectul; regenerarea codului invalidează codul vechi; ștergerea unui membru îi revocă refresh-ul; OWNER nu se poate autoșterge).

**Frontend:**
- `shared/api-client.ts` — access token JWT în memorie (nu localStorage), header `Authorization` pe toate cererile, retry-o-singură-dată pe 401 cu refresh silențios; `DEFAULT_PROJECT_ID` hardcodat ELIMINAT — `store.tsx` ia acum `projectId` din sesiune (`useAuth().session.project.id`).
- `shared/AuthProvider.tsx` (nou) — sesiune globală, refresh silențios la boot (cookie httpOnly), `login`/`registerNewProject`/`registerWithInviteCode`/`logout`.
- `components/AppShell.tsx` (nou) — gardă de rute client-side: fără sesiune → redirect `/login`; `/login`+`/register` randate FĂRĂ Sidebar/StoreProvider.
- `app/login/page.tsx`, `app/register/page.tsx` (noi) — register cu toggle „Creez proiect nou" / „Mă alătur unui proiect" (cod de invitație).
- `Sidebar.tsx` — username + buton logout (desktop și dropdown mobil).
- `components/ProjectSharingCard.tsx` (nou, în `/setari`) — cod de invitație (doar OWNER, copiază, regenerează cu confirmare) + listă membri (ștergere doar OWNER, cu confirmare).
- Tipuri noi: `User`, `ProjectRole`, `ProjectMember`, `AuthSession`.
- Verificat manual în browser (nu doar `tsc`/`lint`/`build`, toate curate): register cu proiect nou → adoptă automat datele seed existente; logout; register cu cod de invitație → al doilea cont vede aceleași date ca EDITOR, nu vede codul de invitație (doar OWNER); lista de membri corectă pentru ambele conturi; redirect automat `/login` fără sesiune, inclusiv pe mobil (375px).

**Nefăcut aici** (documentat explicit în `docs/cerinte-autentificare.md` ca fiind în afara scope-ului v1): resetare parolă, roluri configurabile la invitație (mereu EDITOR), alăturarea unui cont deja existent la alt proiect, multi-proiect per user. **AUTH-6 parțial**: codul e gata (CORS credentials, cookie `SameSite=None` pe prod), dar `JWT_SECRET` pe Render și verificarea pe Safari/iOS rămân pași manuali (vezi README.md → „Deploy (Render) — Faza 5").

**Fișiere atinse:** ~70 fișiere noi/modificate în `backend/src/main/java/ro/renovatorpro/**` (domain/application/adapter/config), `backend/src/main/resources/{application.yml,application-dev.yml,db/migration/V5__auth.sql}`, `backend/src/test/**`, `backend/pom.xml`, `backend/.env.example`; frontend: `shared/{api-client.ts,AuthProvider.tsx,store.tsx,icons.ts,types/*}`, `components/{AppShell,Sidebar,ProjectSharingCard}.tsx`, `app/{layout.tsx,login/page.tsx,register/page.tsx,setari/page.tsx}`; `README.md`, `CLAUDE.md`, `docs/api-contract.md`.

**Branch:** `036-autentificare-faza5`.

### 2026-07-18 — Fix: plintă la Parchet/Mochetă, login case-insensitive, mesaje de eroare per-câmp
**De ce:** verificare end-to-end cerută de user a scos 3 bug-uri confirmate (`docs/tickete-verificare.md`, TICKET-1/2/3).

- **TICKET-1 — plintă lipsă la Parchet/Mochetă:** `baseboardLength` depindea de `room.perimeter`, care nu era
  setat niciodată din UI (nu exista input pentru el). Fix: `roomPerimeter(room)` (nou, `shared/functions/dimensions.ts`
  + port 1:1 în `RoomDimensionsCalculator.java`) — folosește `room.perimeter` dacă e explicit, altfel îl derivă
  automat din suprafață presupunând camera pătrată (`4×√mp`), fără niciun câmp nou de completat. `baseboardLength`
  (front + back) și `roomCalcRows.ts`/`RoomTechnicalCard.tsx` (hint-uri) folosesc acum `roomPerimeter`.
- **TICKET-2 — login eșua pentru username-uri cu majuscule:** `RegisterUserService` normalizează username-ul
  la `toLowerCase()` înainte de a-l salva, dar `LoginService` căuta cu username-ul brut (fără lowercase) →
  mismatch → 401 fals. Fix: `LoginService` normalizează identic (`trim().toLowerCase(Locale.ROOT)`).
- **TICKET-3 — „Payload invalid" opac:** `GlobalExceptionHandler` atașează `fieldErrors` la eroarea de
  validare, dar `api-client.ts` citea doar `detail` (mesajul generic). Fix: `problemMessage()` (nou) compune
  mesajul din `fieldErrors` când există, afișat acum în `/login`+`/register`.

**Fișiere atinse:** `frontend/src/shared/functions/dimensions.ts`, `frontend/src/app/configurare/{roomCalcRows.ts,RoomTechnicalCard.tsx}`,
`frontend/src/shared/api-client.ts`, `backend/.../domain/service/RoomDimensionsCalculator.java`,
`backend/.../application/usecase/LoginService.java`.

**Branch:** `039-fix-plinta-login-payload`.

### 2026-07-18 — Fix: empty states pentru proiect fără camere + layout Analiză mobil
**De ce:** cu proiectul gol (fără nicio cameră), toate paginile principale afișau blocuri goale fără
niciun text — percepția era de aplicație stricată, nu de „nu ai date încă". În plus, pagina `/analiza`
avea un container `max-w-md` propriu pe secțiunea mobilă (diferit de `max-w-7xl`/fără constrângere
folosit de restul paginilor), ceea ce producea un gutter stânga/dreapta inconsistent cu restul aplicației.

- **`components/EmptyState.tsx`** (nou) — icon + titlu + descriere + CTA opțional (link sau buton),
  reutilizat de toate paginile de mai jos (regula „zero duplicare" din CLAUDE.md).
- `app/configurare/page.tsx`, `app/elemente/page.tsx` (desktop + mobil) — `EmptyState` când
  `rooms.length === 0`, cu CTA „+ Adaugă Cameră" care deschide drawer-ul existent.
- `app/centralizator/page.tsx` (desktop + mobil) — `EmptyState` când `items.length === 0` (tabelul era
  gol chiar cu camere existente, dacă nu au elemente), cu CTA spre `/elemente`.
- `app/analiza/page.tsx` — `EmptyState` când `rooms.length === 0` (înlocuiește bento grid-ul desktop și
  secțiunea mobilă, ambele ascunse în acest caz); **fix layout**: eliminat `mx-auto max-w-md` din
  wrapper-ul mobil — acum `px-4 py-6 md:hidden`, consistent cu paddingul celorlalte pagini.

**Fișiere atinse:** `frontend/src/components/EmptyState.tsx` (nou),
`frontend/src/app/{configurare,elemente,centralizator,analiza}/page.tsx`.

**Branch:** `039-fix-plinta-login-payload`.

### 2026-07-18 — Rezolvat toate ticketele din auditul de calcule/securitate/business logic
**De ce:** execuția completă a ticketelor CALC-1…8, SEC-1…7, BIZ-1…5 din
`docs/tickete-audit-calcule-securitate.md` (audit cerut explicit de user, cu cercetare de norme reale
de șantier). Toate implementate în aceeași sesiune, cu teste + verificare manuală în browser.

**CALC (calcule de șantier, `RoomDimensionsCalculator.java` ↔ `dimensions.ts`, port 1:1):**
- **CALC-1/CALC-2:** `floorWasteRatio(room)` (nou) — pierderea de pardoseală nu mai e 10% flat, ci
  calibrată pe `installationType` (10% drept / 15% diagonal / 18% herringbone) + supliment 2% la
  `tileSize` Mare/Foarte Mare. `floorMaterialNeeded` o folosește acum.
- **CALC-3:** `roomPerimeter(room)` preferă suma celor 4 lungimi de perete deja introduse la
  faianță/finisaj (dacă toate 4 sunt completate) în locul presupunerii de cameră pătrată (4×√mp) —
  plintă mai precisă la camere dreptunghiulare/neregulate.
- **CALC-7:** `wallTilingArea`/`faiantaWasteRatio` urcă pierderea faianței la 12% (din 10%) când sunt
  >1 goluri (uși+ferestre) pe pereții placați.
- **CALC-4/CALC-8:** câmpuri noi derivate în `RoomDimensions`/`RoomDimensionsDto`: `paintLiters`
  (litri de vopsea, 2 straturi × 11 mp/l), `baseboardBars`/`windowTrimBars` (bare de 2 ml), afișate în
  panoul „Calcule Detaliate" (`roomCalcRows.ts`, câmp nou `note` pe `RoomCalcRow`, randat în
  `RoomTechnicalCard.tsx`).
- **CALC-5/CALC-6:** note explicative în „Calcule Detaliate" — tapet (15% e medie, model cu raport mare
  cere 20-25%) și mochetă (verifică lățimea rolei, poate depăși 10%). Fără schimbare de calcul (decizie
  „a" din tichet — documentare, nu recalibrare).
- Teste noi: 14 teste în `RoomDimensionsCalculatorTest` (montaj/mărime plăci/perimetru/goluri
  multiple/litri/bare) — toate cele 20 treceau înainte de commit, toate 20 (acum) trec după.

**SEC (securitate):**
- **SEC-1:** `AuthRateLimitFilter` folosea PRIMUL element din `X-Forwarded-For` (falsificabil de client
  → bypass rate limit + creștere nelimitată de memorie). Fix: ULTIMUL element (adăugat de proxy-ul de
  încredere Render) + curățare periodică a hărții (fiecare 500 cereri).
- **SEC-2:** `productUrl`/`imageUrl` fără nicio validare → stored XSS prin `javascript:` în `href` +
  imagini base64 nelimitate. Fix: `@Pattern`/`@Size` pe `ItemCreateRequest`/`ItemUpdateRequest` (doar
  http(s) sau `data:image/...`, plafon 700KB), + `safeHttpUrl()` (nou, `shared/functions/url.ts`) ca
  apărare în adâncime pe frontend înainte de a pune un URL în `href` (`ItemDetailsDrawer.tsx`).
- **SEC-3:** Swagger `permitAll` era necondiționat în `SecurityConfig` (depindea doar de flag-ul
  springdoc din yml). Fix: matcher-ele de swagger se adaugă doar pe profilul `dev`.
- **SEC-4:** parolă până la 200 caractere, dar BCrypt procesează doar 72 bytes. Fix: `@Size(max = 72)`
  pe `RegisterRequest`/`LoginRequest` + `maxLength={72}` pe inputul din `/register`.
- **SEC-5:** `IllegalArgumentException` scurgea mesajul original (nume de clase, detalii Jackson) către
  client. Fix: mesaj generic „Valoare invalidă în cerere", originalul doar loghează server-side.
- **SEC-6:** cookie-ul de refresh `SameSite=None` pe prod permite POST-uri cross-site „oarbe" către
  `/refresh`/`/logout`. Fix: header custom `X-Requested-With` obligatoriu pe ambele (verificat în
  `AuthController`, trimis din `api-client.ts`) — un formular/link cross-site nu-l poate seta fără
  preflight CORS, blocat de allowlist-ul nostru.
- **SEC-7:** rate limiter-ul era doar per-IP — un atac distribuit pe același username nu era oprit.
  Fix: `LoginLockoutGuard` (nou, `application.security`) — lockout per-username (in-memory, 5 eșecuri
  → 15 min), integrat în `LoginService`. `AccountLockedException` → 429.
- Toate suitele de test (inclusiv `AuthFlowIntegrationTest`/`IdorAuthorizationIntegrationTest` cu
  Testcontainers reale) trec după modificări — actualizat header-ul `X-Requested-With` în cele 2 teste
  de integrare care apelau `/refresh`/`/logout`.

**BIZ (business logic):**
- **BIZ-1:** conversia de monedă accepta orice curs pozitiv (o typo distrugea ireversibil toate sumele).
  Fix: `ImplausibleExchangeRateException` — backend respinge curs RON/EUR în afara intervalului 3.0-8.0
  (configurabil); frontend adaugă `ConfirmDialog` cu exemplu concret („100 EUR → X RON") înainte de
  conversie; eliminat istoricul de curs FICTIV din `/setari` (`EXCHANGE_RATE_HISTORY`), înlocuit cu
  panoul de exemplu real.
- **BIZ-2:** eticheta „Progres achiziții" (bazată pe NUMĂR de elemente) putea fi confundată cu eficiența
  bugetară (valorică). Redenumit „Progres achiziții (buc.)" în `/elemente`.
- **BIZ-3:** elementele auto-generate din configurare au preț 0 și nu se distingeau vizual. Badge „Fără
  preț" pe rândurile cu `unitPrice === 0` în `/elemente` (desktop + mobil) + hint în `/analiza` (desktop
  + mobil) cu numărul de elemente fără preț.
- **BIZ-4:** `budgetEfficiency` folosea `float` (pierdere de precizie), contrar convenției „toate sumele
  BigDecimal". Fix: împărțire `BigDecimal` cu `RoundingMode.HALF_UP`.
- **BIZ-5:** nicio verificare dacă suma suprafețelor camerelor depășește suprafața totală declarată a
  apartamentului. Avertisment non-blocant în `/configurare` (nu eroare — pot exista motive legitime).

**Fișiere atinse:** backend — `RoomDimensionsCalculator.java`, `RoomDimensionsDto.java`,
`RoomDtoMapper.java`, `AuthRateLimitFilter.java`, `SecurityConfig.java`, `GlobalExceptionHandler.java`,
`AuthController.java`, `LoginService.java`, `BudgetCalculator.java`, `ConvertProjectCurrencyService.java`,
`ItemCreateRequest.java`, `ItemUpdateRequest.java`, `ItemUrlValidation.java` (nou), `RegisterRequest.java`,
`LoginRequest.java`, `LoginLockoutGuard.java` (nou), `AccountLockedException.java` (nou),
`ImplausibleExchangeRateException.java` (nou), + teste (`RoomDimensionsCalculatorTest`,
`AuthFlowIntegrationTest`, `IdorAuthorizationIntegrationTest`); frontend —
`shared/functions/{dimensions.ts,url.ts (nou)}`, `shared/api-client.ts`, `shared/types/RoomDimensions.ts`,
`app/configurare/{roomCalcRows.ts,RoomTechnicalCard.tsx,page.tsx}`, `app/{elemente,analiza,setari}/page.tsx`,
`app/register/page.tsx`, `components/ItemDetailsDrawer.tsx`; `docs/api-contract.md`.

**Branch:** `040-audit-calcule-securitate`.

---

### 2026-07-19 — Comparator de Oferte (pagină nouă `/comparator`)

Implementat `docs/cerinte-comparator-oferte.md` complet (backend + frontend), cu o singură deviere
deliberată de la document: **pozele sunt `string[]` (URL http(s) sau `data:image/...;base64,...`, ca
`Item.imageUrl`), NU un tabel separat `offer_images` cu BYTEA + upload multipart.** Motiv: codul avea deja
pattern-ul „poză din telefon → FileReader → data URL" (`elemente/page.tsx`, Adăugare Rapidă) — l-am
extins cu compresie canvas (`compressImage.ts`, lipsă înainte) în loc să introduc o arhitectură de storage
nouă, nefolosită nicăieri altundeva în aplicație.

**Backend** (arhitectură hexagonală, oglinda Room/Item): `ComparisonGroup` (roomId, name, materialType,
status, chosenOfferId?, createdItemId?) + `Offer` (groupId + TOATE câmpurile descriptive opționale —
niciun câmp obligatoriu, fluxul principal e „fac poze în magazin, completez restul acasă"). `V6__comparator.sql`.
Endpoint-uri: `GET /api/projects/{id}/comparison-groups` (nested, un singur GET pt. toată pagina),
`POST /api/rooms/{roomId}/comparison-groups`, `PATCH`/`DELETE /api/comparison-groups/{id}`,
`POST .../offers`, `PATCH`/`DELETE /api/offers/{id}`, `POST /api/comparison-groups/{id}/choose`
(creează `Item` cu `origin: "Din Comparator"`, fallback-uri explicite pe fiecare câmp opțional lipsă;
re-alegerea suprascrie `chosenOfferId`/`createdItemId` fără să șteargă itemul vechi). `ItemOrigin` +
`COMPARATOR`. Conversia de monedă (`ConvertProjectCurrencyService`) și ștergerea de cameră (`DeleteRoomService`)
extinse să acopere și grupurile/ofertele. Toate câmpurile ofertei folosesc `Patch<T>`/`JsonNullable` la
PATCH (ca la `Room`), ca userul să poată goli explicit un preț introdus greșit. 126 teste (unit + controller
+ `SchemaMigrationTest` pe Postgres real via Testcontainers).

**Frontend:** tipuri noi (`ComparisonGroupStatus`, `Offer`, `ComparisonGroup`), `RenovationStore` +
`store.tsx` extinse cu `comparisonGroups` + 7 mutații. Pagina listă `/comparator` (filtru pe cameră,
`DashboardSummaryCard`, carduri cu interval de preț). Pagina de detaliu `/comparator/[groupId]`:
oferte una lângă alta (desktop) / stivuite (mobil) prin `flex-col sm:flex-row sm:flex-wrap` — un singur
DOM tree responsive, ca `Drawer`/`ConfirmDialog`, nu randare dublă. `OfferFormDrawer` — niciun câmp
obligatoriu, poze prin capture foto (compresie client-side) SAU URL, buton „📍 Detectează magazinul"
(geolocation + reverse-geocoding Nominatim, best-effort, coordonatele nu se salvează). Navigare: `secondaryNav`
din `shared/nav.ts` a devenit array (`Comparator Oferte` + `Setări`) — bottom nav mobil rămâne neschimbat
(4 tab-uri fixe din `mainNav`).

**Bug prins la verificarea vizuală (Browser pane):** backend-ul (Jackson) serializează câmpurile opționale
absente ca `null` explicit, nu le omite — dar `Offer`/`ComparisonGroup` le declară `T | undefined` (regula
de aur #1). Fără normalizare, un preț neintrodus (`null`) trecea verificări `unitPrice !== undefined` ca
valid, iar `formatMoney(null, …)` afișa „0 EUR" (Intl coercitivizează `null` la 0) — inclusiv badge-ul fals
„Cel mai bun preț" pe o ofertă fără preț. Fix: `normalizeOffer`/`normalizeComparisonGroup` în `store.tsx`,
aplicate la fiecare punct unde datele intră din API (load inițial, add/update/choose).

**Fișiere atinse:** backend — 56 fișiere noi (`domain/model/{ComparisonGroup,ComparisonGroupStatus,Offer}.java`,
`application/{port,usecase}/*ComparisonGroup*.java`, `*Offer*.java`, `adapter/**/*ComparisonGroup*`,
`*Offer*`, `V6__comparator.sql`), + `ItemOrigin.java`, `DtoConversionSupport.java`, `GlobalExceptionHandler.java`,
`DeleteRoomService.java`, `ConvertProjectCurrencyService.java`, teste; frontend —
`shared/types/{ComparisonGroupStatus,Offer,ComparisonGroup}.ts` (noi), `shared/types/{ItemOrigin,RenovationStore}.ts`,
`shared/store.tsx`, `shared/{nav.ts,icons.ts}`, `components/{Sidebar,OriginBadge}.tsx`,
`components/ComparisonGroupStatusChip.tsx` (nou), `app/comparator/**` (pagină nouă completă).
`docs/api-contract.md` actualizat cu endpoint-urile noi.

**Branch:** `041-comparator-oferte`.

---

### 2026-07-19 — Zugrăveli complete + consumabile de montaj în Configurator

Implementat `docs/cerinte-zugraveli.md` complet (backend + frontend): tavan zugrăvit + vopsea deasupra
faianței (la Gresie) și consumabilele de montaj lipsă: amorsă (zugrăveală + sub placări, DOUĂ elemente
distincte cu același `MaterialType.Amorsa`), adeziv de plăci, chit de rosturi, folie sub parchet
(XPS/încălzire în pardoseală). Toate devin elemente auto-generate în `/elemente`, ca gresia/vopseaua azi.

**Model de date:** `WallTiling` primește `roomHeight?`/`tileSize?` (JSONB, fără migrare SQL — record cu
constructor de compatibilitate pt. call site-urile vechi cu 3 argumente). `Room` primește `ceilingPaint?`/
`underfloorHeating?` (`V7__consumabile.sql`, `ceiling_paint`/`underfloor_heating BOOLEAN`).

**`RoomDimensionsCalculator`:** 10 formule noi (A.1–D.10, constante cu comentariu-sursă lângă cele
existente) + două helpere interne (`netWallTilingArea`/`netFloorTilingArea`) — ariile NETE (fără pierderea
de tăiere) sunt expuse separat de cele cu pierdere, nu derivate prin împărțire înapoi. `paintLiters` devine
agregatul camerei (pereți + tavan + deasupra faianței), nu doar vopseaua pereților.

**Bug prins înainte de a ajunge în producție (nu în UI, în design-ul reconcilierii):** `AutoItemReconciler`
matcha elementele existente cu drafturile proaspete DOAR după `materialType` (`findFirst`, fără să consume
din pool) — sigur cât timp fiecare `MaterialType` apărea o singură dată per cameră. Amorsă zugrăveală +
Amorsă placări introduc DOUĂ drafturi cu același `MaterialType.Amorsa` simultan — fără fix, al doilea
draft ar fi „furat" id-ul primului existent, coliziune la salvare (un element pierdut silențios). Fix:
`reconcile()` consumă elementele existente dintr-un pool mutabil (`unmatchedExisting.remove(existing)`),
nu doar `findFirst` pe lista originală — fiecare element existent se potrivește cu UN SINGUR draft.

**Elementul `Vopsea`:** singurul element auto-generat cu unitate ≠ mp/ml — cantitatea e în LITRI
(`paintLiters` agregat), nu arie. Generat acum și la Gresie (tavan/deasupra faianței), nu doar Parchet/
Mochetă. `Folie parchet` are nume dublu (XPS 3mm / încălzire în pardoseală) după `underfloorHeating`, dar
rămâne UN SINGUR slot logic la reconciliere (același `materialType`, doar numele se recalculează).

**UI (`RoomTechnicalCard`):** toggle „Zugrăvește tavanul" (orice pardoseală, cu `floorArea` completată),
la faianță — input „Înălțime cameră (m)" + select „Mărime plăci faianță" (opțional, hint „implicit:
Medie"), la Parchet Laminat — toggle „Încălzire în pardoseală". Panoul „Calcule Detaliate" (`roomCalcRows.ts`):
8 rânduri noi cu formula explicită + numerele reale (inclusiv rândul „Vopsea Total" cerut explicit în
`cerinte-zugraveli.md`: `30.0 mp × 2 straturi ÷ 11 mp/l = 5.5 l`, nu doar rezultatul).

**Verificat manual în browser** (Baie, Gresie 6mp + tavan + faianță 2 pereți, plăci Mari, roomHeight 2.7m):
toate cele 6 elemente auto-generate apar corect în `/elemente` cu cantitățile calculate server-side
(Gresie 6.6mp, Vopsea (tavan) 1.5l, Amorsă zugrăveală 1l, Amorsă placări 1l, Adeziv 1 sac, Chit 2kg);
preview client (`computeRoomDimensions`) identic cu valorile server după salvare.

**Fișiere atinse:** backend — `domain/model/{Room,WallTiling,MaterialType}.java`,
`domain/service/{RoomDimensionsCalculator,AutoItemReconciler}.java`, `V7__consumabile.sql`,
`adapter/in/web/dto/{RoomDimensionsDto,RoomResponse,RoomCreateRequest,RoomUpdateRequest,WallTilingDto}.java`,
`adapter/in/web/mapper/RoomDtoMapper.java`, `adapter/out/persistence/entity/RoomEntity.java`,
`application/port/in/{AddRoomUseCase,UpdateRoomUseCase}.java`,
`application/usecase/{AddRoomService,UpdateRoomService}.java`, teste
(`RoomDimensionsCalculatorTest`, `AutoItemReconcilerTest`, `UseCasesTest` — call sites actualizate la
noile câmpuri); frontend — `shared/types/{Room,WallTiling,RoomDimensions,MaterialType}.ts`,
`shared/functions/dimensions.ts`, `app/configurare/{RoomTechnicalCard.tsx,roomCalcRows.ts}`,
`app/centralizator/page.tsx` (badge-uri culoare pt. cele 4 `MaterialType` noi); `docs/api-contract.md`.

**Branch:** `042-cerinte-zugraveli-consumabile`.

---

### 2026-07-20 — Sincronizare Comparator ↔ Configurare (o singură sursă de adevăr per material)

Implementat `docs/cerinte-comparator-config-sync.md` complet (backend + frontend). **Problema:** un grup de
comparație pentru un material deja generat de `/configurare` (ex. „Parchet Laminat (Pardoseală)") producea
la „Alege ofertă" un element NOU `Din Comparator`, în paralel cu cel `Din Configurare` deja existent —
două rânduri pentru același material fizic, totaluri dublate, fără să fie clar care preț e „cel adevărat".

**Soluție:** `ComparisonGroup` primește `linkedItemId?` — elementul `Din Configurare` pe care „choose" îl
ACTUALIZEAZĂ (preț/sursă/link/poză) în loc să creeze un item nou. Rezolvat automat la creare/mutare de
grup (`AutoItemReconciler.resolveLinkedItem(items, roomId, materialType)` — candidați: `roomId` +
`origin Configurare` + `materialType` identic; 0 candidați → `null`, comportament fallback NESCHIMBAT
pt. categorii care nu vin niciodată din configurator: Mobilă, Electrocasnice, Sanitare, Corpuri de
iluminat, Altele). La ambiguitate (≥2 candidați, ex. „Amorsă zugrăveală" vs. „Amorsă placări", ambele
`MaterialType.Amorsa`) userul alege explicit în `GroupFormDrawer` (`linkedItemId` trimis în request,
validat server-side). Legătura se RE-VALIDEAZĂ la fiecare `choose` (poate fi stale — reconcilierea
camerei șterge/recreează elementele „Din Configurare" la fiecare `PATCH /rooms/{id}`).

**`ChooseOfferService`** (backend): două ramuri. Legătură validă → PATCH pe itemul existent, DOAR
`source`/`unitPrice`/`productUrl`/`imageUrl` (fallback pe valoarea existentă dacă oferta e parțială —
nu golește un câmp deja completat); `name`/`quantity`/`status`/`origin`/`createdAt`/`purchasedAt` NEATINSE
(cantitatea rămâne cea din măsurători, nu din ofertă). Fără legătură → comportamentul de azi, neschimbat
(item nou `Din Comparator`).

**Bug prins în `store.tsx` înainte de verificarea vizuală:** `chooseOffer` făcea `setItems((prev) =>
[...prev, result.item])` necondiționat — pe ramura „legată" (update, nu create), asta ar fi ADĂUGAT un
duplicat local al itemului deja existent în stare (backend-ul întorcea corect un singur item actualizat,
dar frontend-ul l-ar fi arătat de două ori până la următorul reload). Fix: `setItems` verifică dacă
`result.item.id` există deja în listă și îl înlocuiește în loc să adauge.

**Verificat manual în browser** (creat grup nou „Parchet" pt. camera „dormitoe" cu pardoseală Parchet
Laminat deja configurată → panoul din formular a arătat corect ținta „Parchet Laminat (Pardoseală) —
23.6"; ales o ofertă Dedeman/77 EUR → elementul din `/elemente` a rămas UN SINGUR rând, `Din Configurare`,
cantitate 23.6 neschimbată, preț/sursă actualizate, chip nou „Ofertă aleasă" lângă `OriginBadge`; testat și
cazurile 0 candidați — Mobilă — și ≥2 candidați — Amorsă în baie).

**Fișiere atinse:** backend — `V8__comparator_linked_item.sql`,
`domain/model/ComparisonGroup.java`, `domain/service/AutoItemReconciler.java` (+ `resolveLinkedItem`),
`adapter/out/persistence/entity/ComparisonGroupEntity.java`,
`adapter/in/web/dto/{ComparisonGroupResponse,ComparisonGroupCreateRequest,ComparisonGroupUpdateRequest}.java`,
`application/port/in/{AddComparisonGroupUseCase,UpdateComparisonGroupUseCase}.java`,
`application/usecase/{AddComparisonGroupService,UpdateComparisonGroupService,ChooseOfferService,DeleteOfferService}.java`,
teste (`AutoItemReconcilerTest`, `UseCasesTest`, `ComparisonGroupControllerTest`); frontend —
`shared/types/{ComparisonGroup,RenovationStore}.ts`, `shared/store.tsx`,
`app/comparator/{GroupFormDrawer.tsx,configuredItemCandidates.ts}` (nou),
`app/comparator/[groupId]/page.tsx`, `app/elemente/{page.tsx,decidedGroupForItem.ts}` (nou);
`docs/api-contract.md`.

**Branch:** `043-comparator-config-sync`.

---

### 2026-07-22 — Comparator: carduri grupate pe cameră + banner „Ofertă aleasă” mai subtil

Feedback vizual pe `/comparator`: eticheta „cameră · material" de pe fiecare card era prea mică (11px,
`text-muted`) — greu de citit din care cameră e fiecare grup la un scan rapid al listei.

**Fix:** cardurile se randează acum grupate pe secțiuni per cameră (`roomSections` — camera + numărul de
grupuri, ordinea camerelor din apartament; grupurile orfane — cameră ștearsă — într-o secțiune finală).
Fiecare secțiune are un header de secțiune standard (iconiță + nume cameră, uppercase 12px bold, regula
de design existentă). Cardul individual (extras în componenta locală `GroupCard`) nu mai repetă numele
camerei (spus deja de secțiune) — arată doar `materialType`, acum vizibil (`text-xs font-semibold
text-secondary`, nu `text-[11px] text-muted`).

Separat, bannerul verde „Ofertă aleasă → element creat" din `/comparator/[groupId]` era prea proeminent
pentru un mesaj informativ non-critic — micșorat (padding, font, iconiță 14px) și culoare mai discretă
(`bg-emerald-50/60`, `border-emerald-100`).

**Fișiere atinse:** frontend — `app/comparator/page.tsx` (`roomSections`/`orphanGroups`, componenta locală
`GroupCard`), `app/comparator/[groupId]/page.tsx` (banner).

**Branch:** `044-comparator-ui-polish`.

---

### 2026-07-22 — Configurare: calcule reale în panoul „Calcule Detaliate" + elimină rândul Glaf Fereastră

Feedback: pe mai multe rânduri din „Calcule Detaliate" (`/configurare`), coloana „Calcul" repeta pur și
simplu valoarea finală (ex. „Calcul: 35.03 mp") în loc să arate substituția reală a formulei — userul nu
putea verifica de unde vine numărul. Afecta: Faianță, Vopsea Pereți, Vopsea Deasupra Faianței, Amorsă
Placări, Chit de Rosturi, Tapet.

**Fix, în `buildRoomCalcRows` (`app/configurare/roomCalcRows.ts`):**
- **Faianță/Amorsă Placări/Chit de Rosturi**: substituție cu ariile NETE reale, calculate direct din
  cameră (`netWallTilingArea`/`netFloorTilingArea`, deja existente în `shared/functions/dimensions.ts` —
  nicio logică nouă, doar apelate aici pt. afișare). Chit de Rosturi arată acum și rata kg/mp per mărime
  de placă (`groutKgPerSqm`, exportată — era funcție privată).
- **Vopsea Pereți/Vopsea Deasupra Faianței/Tapet**: aria brută nu e expusă separat în `RoomDimensions`
  (doar rezultatul cu pierdere inclusă) — recuperată exact prin împărțire la factorul de pierdere deja
  hardcodat în formula afișată (10%/15%, ca la „Vopsea Tavan"/„Folie Parchet", care procedau deja așa).

**Eliminat complet rândul „Glaf Fereastră"** din panoul „Calcule Detaliate" (cerere explicită) — DOAR din
afișarea de aici; elementul de cumpărat generat automat de configurator în `/elemente` (glaful e totuși un
produs fizic de cumpărat) NU a fost atins, `AutoItemReconciler` (backend) rămâne neschimbat.

**Verificat manual în browser:** Vopsea Pereți arată acum „31.84 × 1.10 = 35.03 mp", Tapet „6.49 × 1.15 =
7.47 mp", Amorsă Placări „(6.00 + 0.00) × 0.15 = 1 l", Chit de Rosturi „(6.00 × 0.24 + 0.00 × 0.24) × 1.10
= 2.00 kg" — toate cu numere reale, nu valoarea finală repetată; Glaf Fereastră nu mai apare în listă.

**Fișiere atinse:** frontend — `shared/functions/dimensions.ts` (`groutKgPerSqm` exportată),
`app/configurare/roomCalcRows.ts`.

**Branch:** `044-comparator-ui-polish`.

---

### 2026-07-22 — Audit exhaustiv de calcule (Configurare + tot proiectul) + remedieri

Verificare completă, la cererea userului, a tuturor calculelor: `RoomDimensionsCalculator.java` ↔
`dimensions.ts` (paritate 1:1), `roomCalcRows.ts` (afișare), `AutoItemReconciler` (generare elemente),
`BudgetCalculator`/`items.ts`/`budget.ts` (buget), `GetProjectSummaryService`/`GetSpendingTimelineService`
(agregări). Verificate manual scenarii cu parchet/gresie, uși pe diverși pereți, ferestre, montaj
drept/diagonal/herringbone, mărimi de plăci. **Concluzie: nicio eroare de aritmetică** — toate formulele
identice FE↔BE, calibrate pe norme de șantier citate în `docs/tickete-audit-calcule-securitate.md`, 88 de
teste de calcul treceau deja. Găsite 1 bug real (agregare, nu calcul) + 2 probleme de afișare, toate reparate:

**BUG real — progresul de configurare blocat la 0% permanent.** `RoomDimensionsCalculator.projectTechnicalSummary`
considera o cameră „configurată" doar dacă avea `perimeter() != null` ȘI cel puțin o ușă — dar câmpul de
perimetru a fost eliminat din UI la un refactor anterior (perimetrul se derivă azi din lungimile pereților
sau din suprafață, `roomPerimeter`), deci nicio cameră configurată prin fluxul actual nu satisfăcea
condiția. Fix: o cameră e „configurată" dacă are pardoseală (`hasFloorConfig`) — fără cerința de
uși/perimetru explicit. Test nou `projectTechnicalSummaryConsideraCameraConfigurataDoarDupaPardoseala`.
Verificat manual: STATUS a trecut din „Neînceput"/0% în „În Lucru"/50% (2 din 4 camere configurate).

**Afișare — rotunjirea ascundea pasul intermediar.** La Chit de Rosturi, Amorsă Placări, Amorsă Zugrăveală,
Vopsea Total, Folie Parchet, coloana „Calcul" sărea direct la valoarea rotunjită în sus (ex. „= 2.00 kg"),
ca și cum ar fi rezultatul exact al formulei — acum arată ambele: „1.58 → 2.00 kg". Cantitățile finale
NU s-au schimbat (rotunjirea în sus era deja corectă), doar transparența calculului.

**Afișare — textul „gol ușă" era incomplet.** La Faianță/Vopsea Pereți/Tapet, codul scade corect ariile
uȘILOR ȘI FERESTRELOR din pereții relevanți, dar formula afișată zicea doar „− gol ușă" — corectat la
„− goluri uși/ferestre" (nicio schimbare de calcul, doar text).

**Nou — avertisment perimetru estimat.** Funcție locală `isPerimeterEstimated(room)` (`roomCalcRows.ts`) —
dacă userul n-a completat nici perimetrul explicit, nici toate cele 4 lungimi de perete, plinta se
calculează dintr-un perimetru presupunând camera PĂTRATĂ (4×√suprafață) — poate subestima la camere
alungite/neregulate. Nota apare acum lângă rândul „Plintă" când e cazul (nu modifică niciun calcul).

**Fișiere atinse:** backend — `domain/service/RoomDimensionsCalculator.java` (`projectTechnicalSummary`),
test `RoomDimensionsCalculatorTest`; frontend — `app/configurare/roomCalcRows.ts`
(`isPerimeterEstimated`, rotunjiri afișate, text goluri).

**Branch:** `045-fix-calcule-configurator` (peste `044-comparator-ui-polish`, nemergeuit încă).

---

### 2026-07-22 — Audit de UX: 4 bug-uri reparate (căutare moartă, cameră needitabilă, unitate greșită, coerciție silențioasă)

Audit exhaustiv al aplicației (la cererea userului) a găsit 4 probleme reale, toate reparate în această sesiune:

**1. Căutare moartă pe `/configurare` și `/analiza`.** Ambele pagini afișau o bară de căutare vizibilă
fără `searchValue`/`onSearchChange` — scriai în ea și nu se întâmpla nimic. Fix: `/configurare` filtrează
acum camerele după nume (`visibleRooms`, cu empty-state dedicat „Nicio cameră găsită"); `/analiza` nu are
nicio listă filtrabilă (doar grafice/agregări), deci bara de căutare a fost eliminată (`showSearch={false}`,
ca la `/setari`) — nu are rost un input care nu poate face nimic.

**2. Camerele nu puteau fi editate după creare** — nici nume, nici tip, nici `allocatedBudget` (afișat
peste tot ca „Buget utilizat X / Y", dar Y era blocat pe valoarea de la creare). `RoomFormDrawer` primește
acum un prop opțional `room` (ca `ItemFormDrawer`/`GroupFormDrawer`): dacă e dat, editează camera
(`updateRoom`) în loc să creeze una nouă. Buton nou „Editează" (iconiță `edit_square`, lângă „Șterge") pe
header-ul `RoomTechnicalCard` (`/configurare`) și pe header-ul de cameră din `/elemente` (desktop + mobil).

**3. Cantitatea elementelor era mereu afișată ca „buc"**, chiar și pentru materiale în mp/ml/l/kg (ex.
„23.6 buc" de parchet, în loc de „23.6 mp"). Funcție nouă partajată `materialUnit(materialType)`
(`shared/functions/items.ts`) — mapează fiecare `MaterialType` pe unitatea lui reală (mp: Gresie/Faianță/
Parchet/Tapet/FolieParchet; ml: Plintă/GlafFereastră; l: Vopsea/Amorsă; kg: ChitRosturi; saci: AdezivPlacari;
buc: restul — Mobilă/Electrocasnice/Sanitare/CorpuriIluminat/Altele, adăugate manual). Folosită peste tot
unde apare cantitatea: `/elemente` (header „Cant." în loc de „Buc" + celulă), `/centralizator` (desktop +
mobil), `ItemDetailsDrawer`, `CentralizatorPdfDocument`, `GroupFormDrawer` (panoul de candidați din
Comparator). Eticheta din `ItemFormDrawer` („Cantitate (mp)" etc.) e acum reactivă la `materialType`-ul ales.

**4. `Number(quantity) || 1` transforma silențios 0 (sau câmp gol) în 1**, fără nicio explicație — userul
nu-și dădea seama că valoarea introdusă a fost ignorată. `ItemFormDrawer`: validare explicită înainte de
submit (cantitate goală/0/negativă/NaN → eroare „Cantitatea trebuie să fie un număr strict pozitiv.",
afișată lângă butonul de salvare, submit blocat) în loc de coerciție tăcută; `min`/`step` ale inputului
devin dinamice (`step="1"` la „buc", `"0.01"` altfel; `min={0}` — cantitățile fracționare <1 sunt valide
la mp/l/kg). Cantitatea implicită la un element NOU e „1" (nu gol), ca fluxul comun să rămână fricțiune-zero.

**Verificat manual în browser** (end-to-end, cu backend real): căutare „baie" pe `/configurare` filtrează
corect la o singură cameră; editat bugetul camerei „dormitoe" din 0 în 1500 EUR, persistat după reload;
toate cantitățile din `/elemente` arată unitatea corectă („23.6 mp", „17.09 ml", „1 saci", „2 kg", „1 buc");
setat cantitatea unui element la 0 → eroare afișată, drawer rămas deschis, nimic salvat; corectat la 3 →
salvat, totalul recalculat corect (3×20=60 EUR).

**Fișiere atinse:** frontend — `components/RoomFormDrawer.tsx` (mod editare), `components/ItemFormDrawer.tsx`
(validare + unitate + min/step dinamice), `components/ItemDetailsDrawer.tsx`, `app/configurare/page.tsx`
(căutare cameră), `app/configurare/RoomTechnicalCard.tsx` (buton editare + drawer), `app/analiza/page.tsx`
(căutare eliminată), `app/elemente/page.tsx` (buton editare cameră ×2, unitate cantitate),
`app/elemente/RoomDrawerState.ts` (nou), `app/centralizator/page.tsx` (unitate cantitate ×2),
`app/centralizator/CentralizatorPdfDocument.tsx` (unitate cantitate), `app/comparator/GroupFormDrawer.tsx`
(unitate pe candidați), `shared/functions/items.ts` (`materialUnit`, nou).

**Branch:** `046-fix-bugs-audit`.

---

### 2026-07-22 — Pagină nouă „Galerie Inspirație" (poze/randări/inspirație, pe cameră)

Implementat backlog item #4 din `CLAUDE.md` (existent în design Stitch, neimplementat până acum), la
cererea userului: „vreau să-mi adaug poze, randări, inspirații, pe camere". Feature full-stack, pattern-ul
urmat e cel mai apropiat existent — Comparatorul de Oferte (poze ca string, URL http(s) sau `data:image/...
;base64,...` comprimată client-side, fără upload real de fișiere/tabel `BYTEA` separat).

**Model:** `InspirationImage` — id, `projectId`, `roomId?` (opțional — poze „generale", neasignate),
`type: InspirationType` (Poză Proprie / Randare / Inspirație Online), `image` (URL/data-URI, obligatoriu),
`caption?`, `sourceUrl?`, `createdAt`. Decizie cheie: **ștergerea unei camere NU șterge pozele ei** — doar
le dezasignează (`roomId → null`, mută-le la „General"), spre deosebire de `Item`/`ComparisonGroup` (cascade
de ștergere). Motiv: pozele sunt conținut al userului (poze proprii de telefon, randări plătite), nu date
derivate din configurarea tehnică a camerei — pierderea lor la o simplă redenumire/refacere de cameră ar fi
un regres de UX, nu o curățare așteptată.

**Backend** (arhitectură hexagonală, ca la Item/Offer): migrare `V9__inspiration_gallery.sql` (tabel
`inspiration_images`, `project_id` FK direct — nu doar prin `room_id` — cu `ON DELETE CASCADE`; `room_id`
nullable cu `ON DELETE SET NULL`, backup de schemă pt. regula de mai sus). Model domeniu pur
(`InspirationImage`/`InspirationType`), porturi in/out, 4 use cases (`Get`/`Add`/`Update`/`Delete`,
autorizare `MembershipGuard` VIEWER/EDITOR ca peste tot), `roomId` validat să aparțină aceluiași proiect la
add/update (altfel IDOR — cameră din alt proiect). `DeleteRoomService` extins cu apelul de dezasignare
(`inspirationImageRepository.clearRoomId`) lângă cascade-urile existente. Endpoint-uri: `GET`/`POST
/api/projects/{id}/inspiration-images`, `PATCH`/`DELETE /api/inspiration-images/{id}` (semantică `Patch`
cu `null` explicit = șterge, ca la `Offer`). Teste noi: `InspirationImageControllerTest` (7 teste),
`EnumLabelTest` extins, `UseCasesTest` (test dedicat „dezasignează, nu șterge" la ștergere de cameră).
**`mvn verify`: 167/167 teste verzi**, inclusiv `SchemaMigrationTest` (migrarea V9 rulează curat pe Postgres
real via Testcontainers).

**Frontend:** tipuri noi (`InspirationType.ts`, `InspirationImage.ts`) + `RenovationStore` extins
(`inspirationImages` + `addInspirationImage`/`updateInspirationImage`/`deleteInspirationImage`) +
`store.tsx` (încărcat la boot cu restul snapshotului; `deleteRoom` dezasignează local, nu filtrează, ca să
oglindească exact comportamentul serverului). Pagina **`/galerie`**: grid Pinterest-style (pătrate uniforme,
NU masonry — mai robust cross-breakpoint), grupat pe cameră ca la `/comparator` + secțiune „General" pt.
poze neasignate, filtre pe cameră (chips), `DashboardSummaryCard` (Total poze / Camere ilustrate /
Neasignate), `GalleryFormDrawer` (upload cu compresie canvas SAU URL, selector tip cu 3 butoane, select
cameră opțional, notiță, link sursă), `Lightbox` local (poză mărită full-screen). `compressImage` **promovată
din local (`comparator/[groupId]/`) în `shared/functions/image.ts`** — a doua pagină avea nevoie de ea
(regula din `CLAUDE.md`). Intrare nouă în `secondaryNav` (iconiță `auto_awesome`, deja documentată în
`CLAUDE.md` ca rezervată pt. Galerie Inspirație) — NU în bottom nav mobil (4 tab-uri fixe, ca Comparatorul).

**Verificat:** `npm run build && npm run lint && npx tsc --noEmit` — toate curate. Verificare vizuală completă
în browser (cu backend real): adăugare poză cu URL + notiță + cameră, card apărut corect în secțiunea camerei,
sumar actualizat (1/1/0), lightbox cu notiță, ștergere cu `ConfirmDialog` → empty state, responsive 375px
(grid 2 coloane, bottom nav neschimbat, meniu hamburger cu „Galerie Inspirație" activ), zero erori în consolă.
Notă operațională: backend-ul de dev rula cu clase compilate ÎNAINTE de această sesiune (proces pornit la
12:31) — a trebuit repornit ca să preia `InspirationImageController` (altfel 401 doar pe rutele noi, restul
API-ului răspundea normal cu același token — semnal clar de proces stale, nu bug de autorizare).

**Fișiere atinse (highlights):** backend — `V9__inspiration_gallery.sql`, `domain/model/InspirationImage.java`
+ `InspirationType.java`, `application/{port,usecase}/*Inspiration*`, `adapter/**/InspirationImage*`,
`DeleteRoomService.java`, `GlobalExceptionHandler.java`, `DtoConversionSupport.java`; frontend —
`shared/types/InspirationImage.ts` + `InspirationType.ts`, `shared/types/RenovationStore.ts`, `shared/store.tsx`,
`shared/icons.ts` (`GALLERY_ICONS`, `INSPIRATION_TYPE_ICONS`, `NAV_ICONS.galerie`), `shared/nav.ts`,
`shared/functions/image.ts` (nou, mutat), `app/galerie/` (nou: `page.tsx`, `GalleryFormDrawer.tsx`,
`GalleryDrawerState.ts`, `Lightbox.tsx`).

**Branch:** `047-galerie-inspiratie`.

---

### 2026-07-22 — Fix sistemic butoane rotunde + grafic „Evoluția Cheltuielilor" cu 2 linii interactive

**1. Fix UI la cererea userului: butoane-iconiță „ovale" care se suprapun peste text.** Cauza: butoane
dimensionate DOAR din `padding` + `rounded-full`/`rounded-lg`/`rounded-md`, fără `h-*`/`w-*` egal explicit —
glifele Material Symbols nu au o cutie perfect pătrată, deci padding-box-ul rezultat nu era pătrat
(`rounded-full` desena un oval, nu un cerc), vizibil grav pe cardurile din Galerie (edit/delete peste
badge-ul de tip). Găsit sistemic în toată aplicația (19 locuri, nu doar Galeria): overlay-uri `rounded-full`
(galerie, `Lightbox`, `OfferGallery`), `Sidebar` (logout ×2, toggle mobil), `/elemente` (5 butoane),
`/comparator` (listă + `OfferCard`, 4 butoane), `/configurare` (`RoomTechnicalCard`, 4 butoane), X-ul desktop
din `Drawer`. Fix uniform: `inline-flex h-N w-N shrink-0 items-center justify-center` (N proporțional cu
padding-ul vechi: p-1→h-7, p-1.5→h-8, p-2→h-9, p-3→h-10), păstrând culorile/hover-urile existente.

**2. `costPerRoom` (donut „Cost per Cameră" din `/analiza`) folosea total estimat, nu cheltuit.** Bug real,
găsit la cererea userului („doar cumpărate"): `BudgetCalculator.costPerRoom` apela `roomSubtotal` (toate
elementele, orice status) în loc de `roomSpent` (doar `ItemStatus.Cumparat`), amestecând planificat cu
cumpărat în donut. Fix: o linie în `BudgetCalculator.java` (`roomSubtotal` → `roomSpent`) — `RoomCost` nu
mai apare deloc pentru o cameră fără NIMIC cumpărat (poate avea elemente planificate, tot dispare din donut).
Nicio cameră existentă nu folosea `costPerRoom` altundeva (verificat cu grep) — schimbare sigură, izolată.

**3. Grafic „Evoluția Cheltuielilor" — 2 linii + interactivitate reală (cerere userului).** Linia principală
(„Cheltuit cumulat", solidă, proeminentă) exista deja corect (doar `Cumparat`, pe luna `purchasedAt`); adăugată
linia secundară („Total", punctată, mai puțin vizibilă) — TOATE elementele indiferent de status, pe luna
`createdAt`, pe ACEEAȘI axă de luni (reuniunea lunilor din ambele serii, `cumulativeTotal >= cumulativeSpent`
garantat structural). Backend: `GetSpendingTimelineService` calculează acum ambele cumulative aliniate;
`TimelinePoint`/DTO/mapper extinse cu `cumulativeTotal`. **Empty state schimbat**: goală DOAR dacă proiectul
n-are NICIUN element (înainte: goală dacă nimic cumpărat — dar linia de total are nevoie de elementele
neachiziționate ca să crească, deci un proiect cu elemente dar 0 cumpărate acum arată graficul, cu linia de
cheltuit la 0 și linia de total crescând).

Interactivitate (cerere explicită: hover cu linie punctată verticală + snap pe lună + sumă, pe desktop ȘI
echivalent pe mobil): componentă nouă `app/analiza/SpendingTimelineChart.tsx`, folosită IDENTIC pe desktop
și mobil (înlocuiește vechiul bar-chart mobil separat — un singur cod de întreținut). Un singur handler
`onPointerMove` (Pointer Events) servește ambele cazuri: pentru mouse se declanșează la orice mișcare
deasupra graficului (hover clasic), pentru touch doar cât timp degetul atinge ecranul (glisare = echivalentul
„hover" pe mobil) — nu există cod separat mouse/touch. Linia verticală punctată face „snap" pe cea mai
apropiată lună (nu urmărește cursorul pixel cu pixel); tooltip-ul arată ambele sume ale lunii, cu poziție
orizontală clamped (8–92%) ca să nu iasă din card lângă margini — verificat manual la ambele capete ale
graficului.

**Date mock pentru testare** (doar local, DB dev): 2 camere noi + 12 elemente cu prețuri/statusuri variate,
`created_at`/`purchased_at` distribuite manual (SQL direct, `docker exec renovatorpro-db psql`) pe 5 luni
(martie–iulie 2026) — API-ul nu acceptă timestamp-uri istorice la creare (setate server-side), deci backdatarea
s-a făcut direct în DB, doar pentru verificare vizuală locală, nu cod de producție.

**Verificat:** `mvn verify` 169/169 (10 teste noi/actualizate: `costPerRoomIgnoraElementeleNeachizitionate`,
`spendingTimelineAgregaCumulativPeLunaCumparariiSiSeparatPeLunaAdaugarii` actualizat,
`spendingTimelineAratatCumulativeTotalChiarDacaNimicNuECumparat` nou, `spendingTimelineEsteGoalaCandProiectulNuAreNiciUnElement`
redenumit); `npm run build && npm run lint && npx tsc --noEmit` curate; verificat vizual complet în browser cu
date reale (backend repornit ca să preia codul nou) — hover desktop la 3 puncte diferite (stânga/mijloc/dreapta,
inclusiv clamp la margini), drag touch pe mobil (identic ca UX), donut arată doar Bucătărie+Living+Baie cu
sumele cheltuite corecte, butoanele rotunde verificate pe `/galerie` și `/elemente` (cercuri/pătrate perfecte,
măsurate exact prin JS: 28–36px, egal pe ambele axe).

**Fișiere atinse (highlights):** backend — `BudgetCalculator.java` (`costPerRoom`), `GetSpendingTimelineService.java`
(2 serii unificate), `GetSpendingTimelineUseCase.java`, `SpendingTimelinePointResponse.java`,
`SpendingTimelineDtoMapper.java`, teste (`BudgetCalculatorTest`, `UseCasesTest`, `ProjectControllerTest`);
frontend — `shared/types/SpendingTimelinePoint.ts`, `shared/functions/charts.ts` (`timelinePoints`),
`app/analiza/page.tsx` (rescris, cod de grafic mutat în componentă), `app/analiza/SpendingTimelineChart.tsx`
(nou), plus cele 19 fixuri de butoane (`components/Sidebar.tsx`, `components/Drawer.tsx`, `app/elemente/page.tsx`,
`app/comparator/page.tsx`, `app/comparator/[groupId]/OfferCard.tsx`, `app/comparator/[groupId]/OfferGallery.tsx`,
`app/configurare/RoomTechnicalCard.tsx`, `app/galerie/page.tsx`, `app/galerie/GalleryFormDrawer.tsx`,
`app/galerie/Lightbox.tsx`).

**Branch:** `047-galerie-inspiratie` (continuare, aceeași sesiune).

---

### 2026-07-22 — Autentificare: email + resetare parolă (mod dev) + multi-proiect

Set de 4 cereri explicite ale userului, toate implementate în aceeași sesiune (vezi `docs/cerinte-autentificare.md`
D1/D2/D4/D6/D8 revizuite pt. deciziile complete): (1) email obligatoriu la register, (2) resetare parolă,
(3) confirmare parolă la register + reset, (4) alăturare la alt proiect pentru un cont DEJA existent, nu
doar la înregistrare — ceea ce a cerut o revizuire reală de arhitectură (D4 originalul zicea explicit
„single-project per user").

**Decizie cheie — multi-proiect fără JWT nou:** `MembershipGuard` verifica DEJA `projectId`-ul din
URL/body la fiecare request (nu din JWT) — asta a însemnat că backend-ul era deja „multi-proiect-agnostic"
per-request; singura limitare reală era `ProjectMemberRepository.findByUserId` (Optional, presupunea o
singură apartenență) folosită de login/refresh/`/me`. Soluție: `refresh_tokens` capătă `project_id` (V11) —
proiectul „activ" e al SESIUNII (tokenul de refresh), nu al userului. Comutarea de proiect
(`POST /api/auth/switch-project`) doar rotește refresh token-ul spre alt proiect unde userul e deja membru,
fără să atingă schema JWT-ului de access (rămâne `sub`+`username`, neschimbat). Alăturarea unui user
EXISTENT (`POST /api/auth/join-project`, spre deosebire de calea „register cu cod") creează apartenența
(dacă nu exista deja — idempotent) și comută automat. `project_members` a primit `joinedAt` (ordonare
determinist㠗 login-ul alege implicit cel mai vechi proiect, „de-acasă"; `GET /api/auth/me/projects` le
listează pe toate pt. selectorul din UI).

**Resetare parolă — mod dev, ales explicit de user** (fără infra de email reală pe proiect): tabel nou
`password_reset_tokens` (V10, pattern identic `refresh_tokens` — token opac, hash SHA, expirare 30 min,
single-use). `POST /api/auth/forgot-password` expune tokenul BRUT direct în răspuns (nu-l trimite pe email)
— deviere asumată de la practica standard „răspuns uniform indiferent dacă emailul există" (`PasswordResetAccountNotFoundException`,
404 dacă nu găsește contul — documentată explicit ca simplificare de dev, nu practică de producție).
`POST /api/auth/reset-password` schimbă parola și revocă TOATE refresh token-urile userului (relogare
obligatorie peste tot, apărare dacă cineva avea deja acces cu parola veche).

**Email la register:** `users.email` exista deja în schemă (NULLABLE de la Faza 5/D1, login rămâne strict
username+parolă) — nicio migrare nouă, doar `RegisterRequest`/`RegisterUserService` extinse (`@Email`,
unicitate verificată cu `findByEmail`, normalizat la lowercase ca username-ul). `DuplicateEmailException` nouă,
409.

**Confirmare parolă:** câmp `confirmPassword` (register + reset-password) verificat STRICT client-side —
nu ajunge în request-ul către backend (nu e regulă de business, doar plasă de siguranță la tastare).

**Backend — fișiere noi:** migrări `V10__password_reset_tokens.sql`, `V11__multi_project_membership.sql`;
`PasswordResetTokenRepository` (port+entity+JPA+adapter), `RequestPasswordResetService`, `ResetPasswordService`,
`JoinProjectService`, `SwitchProjectService`, `ListMyProjectsService` (+ use case-uri/DTO-uri corespunzătoare),
`DuplicateEmailException`, `InvalidPasswordResetTokenException`, `PasswordResetAccountNotFoundException`.
**Modificate:** `User`/`UserRepository`/`UserRepositoryAdapter` (`findByEmail`, `updatePasswordHash`),
`ProjectMember` (+ `joinedAt`), `ProjectMemberRepository` (`findByUserId` → `findAllByUserId`),
`RefreshTokenRepository`/`RefreshTokenEntity` (+ `projectId`), `SessionIssuer` (stochează `projectId` pe
sesiune), `RefreshTokenService`/`GetCurrentUserService`/`LoginService` (rescrise pt. multi-proiect),
`RegisterUserService` (email), `AuthController` (5 endpoint-uri noi), `GlobalExceptionHandler`.

**Frontend — fișiere noi:** `shared/types/MyProject.ts`, `app/forgot-password/page.tsx`,
`app/reset-password/page.tsx`, `components/ProjectSwitcherCard.tsx`. **Modificate:** `shared/types/User.ts`
(+`email`), `shared/api-client.ts` (`authApi` extins: `forgotPassword`, `resetPassword`, `joinProject`,
`switchProject`, `listMyProjects`; `registerNewProject`/`registerWithInviteCode` cu `email`),
`shared/AuthProvider.tsx` (+`projects`, `joinProject`, `switchProject`), `app/register/page.tsx` (câmpuri
email + confirmare parolă), `app/login/page.tsx` (link „Ai uitat parola?"), `components/AppShell.tsx`
(rute publice noi), `components/ProjectSharingCard.tsx` (text actualizat), `app/setari/page.tsx`
(`ProjectSwitcherCard` adăugat), `shared/icons.ts` (`SETTINGS_ICONS.switchProject`).

**Verificat:** `mvn verify` **175/175** (teste noi: flux complet reset parolă în `AuthFlowIntegrationTest`
inclusiv „token single-use eșuează a doua oară”, `userExistentSeAlaturaAltuiProiectSiComutaIntreEle` în
`IdorAuthorizationIntegrationTest` inclusiv „switch pe proiect străin → 404”); `npm run build && npm run lint
&& npx tsc --noEmit` curate. Testat end-to-end în browser (backend repornit): register cu parole diferite →
eroare „Parolele nu coincid” blocează submit-ul; register valid → cont creat; forgot-password → link de
resetare afișat; reset-password prin link → succes; login cu parola veche → `401`; login cu parola nouă →
succes; cont B creat separat, cod de invitație obținut; din Setări (cont A, deja logat), „Alătură-te” cu
codul lui B → comutare automată pe proiectul B (rol Editor), „Proiectele mele” arată ambele proiecte;
„Comută” înapoi pe proiectul A → date reîncărcate corect; zero erori în consolă.

**Branch:** `047-galerie-inspiratie` (continuare, aceeași sesiune).

## 2026-07-22 — Trimitere reală a emailului de resetare parolă (Resend)

Înlocuit modul dev de resetare parolă (token expus direct în răspunsul `POST /api/auth/forgot-password`)
cu trimitere efectivă prin **Resend**. `RequestPasswordResetUseCase.execute` nu mai întoarce tokenul —
trimite emailul prin noul port `PasswordResetEmailSender` și răspunde uniform (`204`, mereu, indiferent
dacă emailul există), corectând deviera de securitate documentată în D2 (nu mai confirmăm existența
conturilor). Fără `RESEND_API_KEY` (dev local fără cont Resend), linkul se scrie în logul backend-ului
în loc să eșueze fluxul.

**Backend — fișiere noi:** `application/port/out/PasswordResetEmailSender.java`,
`adapter/out/email/ResendPasswordResetEmailSender.java` (+ `package-info.java`),
`domain/exception/EmailDeliveryException.java`. **Șterse:** `ForgotPasswordResponse.java`,
`PasswordResetAccountNotFoundException.java` (nu mai există caz „cont negăsit" vizibil apelantului).
**Modificate:** `RequestPasswordResetUseCase`/`RequestPasswordResetService` (`String` → `void`, swallow
silențios pe cont negăsit), `AuthController` (`forgot-password` → `204` fără body），`GlobalExceptionHandler`
(handler-ul pt. `PasswordResetAccountNotFoundException` eliminat), `pom.xml` (+`com.resend:resend-java`),
`application.yml`/`application-dev.yml`/test `application.yml` (+`app.frontend.base-url`,
`app.email.resend-api-key`, `app.email.from-address`), `.env.example` (+`APP_FRONTEND_URL`,
`RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`).

**Frontend — modificate:** `shared/api-client.ts` (`forgotPassword` întoarce `void`),
`app/forgot-password/page.tsx` (rescrisă — mesaj generic „dacă există un cont..." în loc de linkul afișat
direct).

**Teste:** `AuthFlowIntegrationTest` — `fakePasswordResetEmailSender` (`@TestConfiguration`, bean fals care
capturează linkul „trimis" în loc de a lovi API-ul real Resend) înlocuiește citirea `resetToken` din body;
test nou pt. cazul „email inexistent" verifică răspuns uniform `204` (nu mai există `404` distinctiv).
`mvn verify` verde (13/13 în `AuthFlowIntegrationTest`).

**Rămâne manual:** cont Resend + `RESEND_API_KEY` pe Render (prod), `APP_FRONTEND_URL` = domeniul Vercel real.

**Branch:** `047-galerie-inspiratie` (continuare, aceeași sesiune).

## 2026-07-22 — Suită extinsă de teste (frontend + backend) + fix bug virgulă zecimală

Bug raportat de user: la editarea/adăugarea unui element, prețul cu virgulă (separator zecimal RO,
ex. "12,50") nu se salva corect. Cauză: toate input-urile `type="number"` din aplicație resping virgula
indiferent de `lang="ro"` (spec HTML — formatul e mereu cu punct), lăsând câmpul invalid/gol la tastare,
deci prețul/cantitatea salvate deveneau tăcut 0.

**Fix:** componentă nouă `DecimalInput` (`frontend/src/components/forms.tsx`) — `type="text"
inputMode="decimal"`, acceptă virgulă SAU punct, normalizează intern la punct, respinge litere/al doilea
separator, păstrează stări intermediare valide de tastare ("", "12."). Ține un `draft` local resincronizat
din prop DOAR când valoarea numerică s-a schimbat cu adevărat din afară (nu ecoul propriului `onChange`)
— altfel câmpurile care fac round-trip prin `Number()` la fiecare tastă (ex. `RoomTechnicalCard`) pierdeau
punctul zecimal în timpul tastării caracter-cu-caracter. Aplicată pe toate cele 21 de input-uri numerice
zecimale din aplicație (`ItemFormDrawer`, `OfferFormDrawer`, `RoomFormDrawer`, `RoomShapeWallsEditor`,
`RoomTechnicalCard`, `elemente/page.tsx`, `setari/page.tsx`, `configurare/page.tsx`).

**Infra de testare frontend adăugată de la zero** (nu exista deloc): Vitest + Testing Library
(`vitest.config.mts`, `vitest.setup.ts`, environment `happy-dom`), `npm test`/`npm run test:watch`.

**Teste noi:**
- Frontend: 243 teste — toate funcțiile pure din `shared/functions/` (money, items, budget, charts,
  dimensions, image), `DecimalInput` (inclusiv tastare caracter-cu-caracter), migrarea la `DecimalInput`
  în toate fișierele atinse.
- Backend: +34 teste peste cele deja existente (231 → 265) — validare URL/XSS pe `productUrl`/`imageUrl`
  (SEC-2), matrice completă de autorizare pe rol (VIEWER/EDITOR/OWNER) peste rooms/items/proiect/comparator,
  edge cases `BudgetCalculator` (proiect fără camere, buget 0, toate elementele necumpărate).

**Verificat:** `npm test` (243/243), `npx tsc --noEmit`, `npm run lint`, `npm run build` — toate curate;
`mvn verify` — BUILD SUCCESS, toate testele verzi (Testcontainers/Docker disponibil în mediu).

**Branch:** `047-galerie-inspiratie` (continuare, aceeași sesiune).

## 2026-07-23 — Curs valutar EUR/RON preluat automat (BNR), nu doar manual

Cerință user: cursul valutar din Setări → Configurare Monedă era 100% manual (câmp gol cu placeholder
"4.97"). User a cerut o sursă automată, apelată o dată pe zi, cu indicație clară dacă valoarea afișată
vine din API sau a fost introdusă manual.

**Sursă aleasă:** feed XML public BNR (Banca Națională a României) — gratuit, fără cheie API, actualizat
zilnic de BNR însuși.

**Backend:** endpoint nou `GET /api/exchange-rate` (autentificat, ca restul aplicației). Cache server-side
24h în tabela nouă `exchange_rate_cache` (`V12__exchange_rate_cache.sql`) — sursa externă e interogată
efectiv o dată pe zi, indiferent de câte requesturi vin. Fallback: dacă BNR e jos dar există cache
(chiar expirat), se servește cache-ul vechi în loc de eroare; fără niciun cache → `502` cu mesaj clar.
Fișiere noi: `domain/model/ExchangeRateSnapshot.java`, `domain/exception/ExchangeRateFetchException.java`,
`application/port/{in/GetExchangeRateUseCase, out/ExchangeRateFetcher, out/ExchangeRateCacheRepository}.java`,
`application/usecase/GetExchangeRateService.java`, `adapter/out/exchangerate/BnrExchangeRateFetcher.java`
(parsare XML cu `java.net.http.HttpClient` + DOM din JDK, fără dependințe noi), persistență
(`ExchangeRateCacheEntity`/`ExchangeRateCacheJpaRepository`/`ExchangeRateCacheRepositoryAdapter`),
`adapter/in/web/ExchangeRateController.java` + `dto/ExchangeRateResponse.java`. `GlobalExceptionHandler`
mapează `ExchangeRateFetchException` → `502`.

**Frontend:** `setari/page.tsx` preîncarcă automat câmpul de curs la montare (`exchangeRateApi.get()` în
`api-client.ts`) și afișează un badge sub câmp: „✓ Curs automat (BNR), actualizat [dată]" / „✎ Curs
introdus manual" (comutat instant la prima editare a câmpului) / „⚠ nu e disponibil" la eroare (fallback
rămâne „4.97", editabil manual ca înainte). Userul poate oricând suprascrie manual — badge-ul reflectă
mereu proveniența reală a valorii curente.

**Verificat:** `GetExchangeRateServiceTest` (5 teste noi, fake-uri: fără cache → fetch+save; cache <24h
→ nu refetch; cache >24h → refetch; sursă externă jos + cache vechi → servește cache-ul; sursă jos +
fără cache → excepție). Testat end-to-end contra BNR real (nu mockat) pe backend local: primul apel
aduce curs live, al doilea apel (aceeași sesiune) întoarce EXACT același `fetchedAt` — cache-ul
funcționează. `mvn verify` — 236 teste, toate verzi. Frontend: 3 teste noi (`setari/__tests__/
exchangeRate.test.tsx`) — preîncărcare + badge automat, comutare pe manual la editare, fallback la eroare
API. `npm test` 246/246, `tsc`, `lint`, `build` — toate curate.

**Branch:** `047-galerie-inspiratie` (continuare, aceeași sesiune).

## 2026-07-23 — Fix-uri de design: aliniere Setări, iconițe cameră, responsive Adăugare Rapidă

Trei reparații de UI cerute de user (branch nou, separat de PR-ul anterior):

1. **Aliniere „Configurare Monedă"**: rândul toggle monedă + curs valutar folosea `sm:items-end`,
   ceea ce alinia FUNDUL celor două coloane (nu vârful) — coloana mai scurtă (toggle) era împinsă
   în jos, dezaliniind etichetele „MONEDA DE BAZĂ" / „CURS (...)". Schimbat la `sm:items-start`.
2. **Iconițe tip cameră (`RoomFormDrawer.tsx`)**: emoji (🛏️🛁🛋️🍳🌿🪟) înlocuite cu Material Symbols
   din `ROOM_TYPE_ICONS` (`shared/icons.ts`) — rezolvă TODO-ul din `CLAUDE.md` („migrare parțială,
   netratată complet"), consecvent cu restul aplicației.
3. **Responsive „Adăugare Rapidă" (`elemente/page.tsx`)**: la lățime de tabletă (768-1024px), titlul
   secțiunii stătea deasupra grid-ului până la `lg`, iar cele 3 câmpuri foloseau `sm:grid-cols-2`
   (împărțire asimetrică 2+1). Acum grid-ul e mereu 3 coloane egale de la `sm` în sus, iar titlul se
   așază lângă grid abia de la `xl` (spațiu suficient doar pe desktop lat) — testat vizual la 768px,
   1400px și 1920px.

**Teste noi:** `RoomFormDrawer.test.tsx` — regresie „iconițele sunt Material Symbols, nu emoji".

**Verificat:** `npm test` 248/248, `tsc`, `lint`, `build` — toate curate. Verificat vizual în browser
la 3 lățimi (tabletă/laptop/desktop lat) pentru Adăugare Rapidă, ambele stări EUR/RON pentru aliniere.

**Branch:** `048-fix-aliniere-iconite-responsive` (nou, din `047-galerie-inspiratie`).

## 2026-07-23 — Fix: iOS Safari face zoom la focus pe input-uri (bug UX)

User a raportat: pe iPhone, atingerea unui câmp de input face zoom in automat pe pagină, iar zoom-ul nu
revine singur — experiență proastă. Cauză cunoscută: Safari pe iOS mărește automat orice `input`/
`select`/`textarea` cu `font-size` calculat sub 16px la focus; design system-ul aplicației folosește
`text-sm` (14px) pe toate câmpurile.

**Fix:** `globals.css` — regulă nouă `@media (max-width: 767px) { input, select, textarea { font-size:
16px !important; } }`. Aplicată STRICT sub breakpoint-ul `md` (mobil) — desktop rămâne neschimbat la
14px. Nu s-a atins `user-scalable`/`maximum-scale` din viewport (ar fi blocat zoom-ul manual al userului,
anti-pattern de accesibilitate) — soluția corectă e să nu mai existe motivul pt. care Safari zoom-ează.

**Verificat:** computed `font-size` pe toate input/select/textarea confirmat 16px la 375px lățime,
14px neschimbat la 1280px (JS direct în browser, nu presupunere). `npm test` 248/248, `tsc`, `lint`,
`build` — curate.

**Branch:** `048-fix-aliniere-iconite-responsive` (continuare).

## 2026-07-23 — Fix: închiderea sheet-urilor prin atingerea fundalului nu mergea fiabil pe iOS

User a raportat: pe iPhone, tap pe fundalul întunecat al unui bottom sheet/dialog/lightbox nu-l închide
— doar tragerea de bara de sus (handle) funcționează. Cauză: toate aceste overlay-uri foloseau DOAR
`onClick` pe `div`-ul de fundal pentru închidere; pe iOS Safari, `onClick` pe un element non-nativ
(fără `cursor:pointer`/rol de buton) nu se declanșează mereu fiabil la o atingere reală, deși
funcționează perfect cu click de mouse (motiv pt. care bug-ul nu era vizibil în teste/browser desktop).
Handle-ul de tragere folosea deja `onPointerDown/Move/Up` (Pointer Events) — dovedit funcțional pe
device-ul userului — deci am aliniat toate fundalurile de overlay la același mecanism.

**Fix:** adăugat `onPointerUp` alături de `onClick` (nu în locul lui — păstrează comportamentul de mouse
neschimbat) pe fundalul din: `Drawer.tsx`, `ConfirmDialog.tsx`, `galerie/Lightbox.tsx`,
`comparator/[groupId]/OfferGallery.tsx` (lightbox propriu), `Sidebar.tsx` (meniul mobil). Pe
`Lightbox`/`OfferGallery`, poza din interior oprește propagarea pentru AMBELE evenimente
(`stopPropagation` pe click ȘI pe pointerup), altfel un tap pe poză ar fi închis lightbox-ul prin
bubbling de `pointerup` neoprit.

**Teste noi:** `Drawer.test.tsx` — 3 teste (close pe click, close pe pointerup, NU se închide la
click/pointerup în interiorul conținutului).

**Verificat:** `npm test` 251/251, `tsc`, `lint`, `build` — curate. Confirmat vizual în browser la
375px lățime: tap pe zona întunecată de deasupra sheet-ului închide drawer-ul „Editează Cameră".

**Branch:** `048-fix-aliniere-iconite-responsive` (continuare).

## 2026-07-23 — Fix: header-ul (titlul) unui sheet nu închidea la tap pe mobil

User a cerut explicit: pe mobil, tap pe zona de titlu a unui bottom sheet (nu doar pe bara mică de
tragere de deasupra ei) trebuie să-l închidă — zonă de atingere prea mică altfel.

**Fix:** `Drawer.tsx` — `onClick`+`onPointerUp` adăugate pe tot header-ul (div-ul care conține `h2` +
butonul X), nu doar pe backdrop. Pe desktop rămâne funcțional neschimbat (X vizibil, click pe restul
header-ului închide și el acum — comportament comun la bottom sheets, inofensiv).

**Teste noi:** 2 teste în `Drawer.test.tsx` — close la click pe titlu, close la pointerup pe titlu.

**Verificat:** `npm test` 253/253, `tsc`, `lint`, `build` — curate. Confirmat în browser (click DOM
direct pe titlu): drawer-ul se închide.

**Branch:** `048-fix-aliniere-iconite-responsive` (continuare).

## 2026-07-23 — Keep-alive Render: migrat de la GitHub Actions la cron extern (cron-job.org)

User a raportat: cron-ul GitHub Actions (`*/10 4-19 * * *`, fereastra 08:00–21:00) nu era punctual —
ping-uri trimise cu întârzieri de ordinul orei, nu al minutelor, ceea ce lăsa serviciul Render să adoarmă
în ferestre în care ar fi trebuit să fie treaz. A cerut o soluție „batch job" nouă.

**Decizie:** NU un job intern (Spring `@Scheduled`) — nu poate reînvia procesul din stare oprită (JVM-ul
nu rulează dacă Render a făcut spin-down, deci n-are cine să execute jobul); ar avea nevoie oricum de un
trigger extern pentru primul ping al zilei, deci nu elimină dependența de un serviciu extern, doar adaugă
cod fără beneficiu real. Am confirmat cu userul: **cron extern (cron-job.org)** — precizie reală la minut,
suport nativ timezone + fereastră orară, funcționează chiar dacă serviciul e complet oprit.

**Schimbat:**
- Șters `.github/workflows/keepalive.yml` (GitHub Actions) — înlocuit de un job pe cron-job.org
  (configurare manuală, cont extern — nu se automatizează din repo).
- Fereastra extinsă de la 08:00–21:00 la **08:00–22:00** (cerință user), ~434h/lună din cele 750 gratuite.
- `docs/cerinte-keepalive-render.md` — KEEP-1 marcat eliminat (istoric păstrat, cu motivul eliminării),
  KEEP-2 (cron extern) promovat la implementare curentă, cu pașii exacți de configurare pe cron-job.org.
- `README.md` — secțiunea „Keep-alive" actualizată (cron-job.org în loc de GitHub Actions Variable).

**Rămâne manual:** userul creează cont pe cron-job.org și configurează job-ul (URL `/actuator/health`,
la 10 min, fereastră 08:00–22:00 `Europe/Bucharest`, timeout ≥90s) — nu se poate automatiza din agent/CI.

**Branch:** `049-keepalive-cron-extern` (nou, din `main`).

## 2026-07-23 — Alegerea magazinului: hartă interactivă cu pin, nu doar detecție silențioasă

User a raportat: butonul „Detectează magazinul din locație" (Comparator de Oferte) „nu prea merge" —
implementarea veche făcea un singur apel silențios (geolocation → reverse-geocode Nominatim) și fie
completa câmpul, fie arăta „Nu am putut detecta magazinul", fără nicio interacțiune vizuală. Cauza reală
a eșecurilor: reverse-geocoding la zoom de stradă găsește rar exact numele unui magazin (de obicei
întoarce doar adresa), plus geolocația poate fi refuzată — dar userul nu avea nicio cale să corecteze,
doar textul liber din câmp.

**Fix — hartă interactivă (`StoreLocationPicker.tsx`, Leaflet + tile-uri OpenStreetMap, gratuit, fără
cheie API):** click pe iconița de locație deschide un modal cu hartă, centrată pe locația curentă a
telefonului (fallback: București, dacă geolocația e refuzată/indisponibilă). Pin portocaliu (Material
Symbol `location_on` ca `divIcon` — evită problema clasică Leaflet+bundler cu path-urile de imagini
implicite care nu supraviețuiesc Turbopack). Userul poate trage pinul SAU atinge harta oriunde ca să-l
mute; la fiecare mutare, reverse-geocode pe Nominatim sugerează un nume (afișat editabil într-un câmp de
text) + adresa completă ca context. „Folosește acest magazin" completează câmpul Magazin din formular.

**Refactor `detectStore.ts`:** din „un singur `detectStoreName()` silențios" în funcții pure reutilizabile:
`getCurrentPosition()` (geolocation) + `reverseGeocode(lat, lon)` (apelabil de câte ori userul mută pinul).

**Bug real găsit și reparat pe parcurs:** `getCurrentPosition` verifica `"geolocation" in navigator`, care
e `true` chiar și când proprietatea există dar e `null`/`undefined` (unele medii/webview-uri) — ar fi
aruncat o eroare necontrolată în loc să întoarcă `null` grațios. Schimbat la verificare directă de
adevăr (`if (!navigator.geolocation)`).

**Fișiere noi:** `StoreLocationPicker.tsx`, `__tests__/detectStore.test.ts` (9 teste),
`__tests__/OfferFormDrawer.test.tsx` (3 teste, StoreLocationPicker mockuit — Leaflet cere DOM/rețea
reală, netestabil util în jsdom/happy-dom). **Modificate:** `detectStore.ts` (refactor complet),
`OfferFormDrawer.tsx` (buton deschide harta în loc de fetch silențios). **Dependință nouă:** `leaflet`
+ `@types/leaflet` (gratuit, fără cheie API, la fel ca restul integrărilor externe din proiect — BNR,
Resend, Nominatim).

**Verificat:** `npm test` 265/265, `tsc`, `lint`, `build` — curate. Testat end-to-end în browser: hartă
randată corect (fallback București, geolocația refuzată în mediul de test), click pe hartă mută pinul,
reverse-geocode real completează numele + adresa, „Folosește acest magazin" completează corect câmpul.

**Branch:** `050-harta-detectare-magazin` (nou, din `main`).

## 2026-07-23 — PWA: aplicația se poate instala pe Android/iPhone (fără magazin de aplicații)

User a întrebat cum poate face aplicația „nativă" pe Android/iPhone. Am explicat cele 3 opțiuni
(PWA / Capacitor / rescriere nativă Flutter — deja notat ca plan separat în `CLAUDE.md`) și, la cerere,
implementat PWA (cea mai rapidă, zero rescriere UI).

**Ce înseamnă:** userul poate instala aplicația direct din browser (Chrome pe Android: prompt automat
„Adaugă pe ecranul principal"; Safari pe iOS: Share → „Add to Home Screen") — apare cu icon propriu,
pornește fără bara de adresă a browserului (mod `standalone`), fără să treacă prin App Store/Play Store.

**Implementare (convenții native Next.js App Router, nu pachetul `next-pwa`, incompatibil cu Turbopack):**
- `src/app/manifest.ts` — Web App Manifest (nume, icons, `theme_color` #000000, `background_color`,
  `display: standalone`), servit automat la `/manifest.webmanifest` și legat automat în `<head>`.
- `src/app/icon.png` + `src/app/apple-icon.png` — convenția specială Next.js (`app/icon.png`,
  `app/apple-icon.png`) generează automat tag-urile `<link rel="icon">`/`<link rel="apple-touch-icon">`.
- Iconițe generate cu `rsvg-convert` (deja instalat pe mașină) dintr-un SVG simplu în tema aplicației
  (fundal negru #000000, simbol alb) — 512×512 (icon principal + manifest), 192×192 (manifest), 180×180
  (apple-touch-icon), plus variantă „maskable" (fundal edge-to-edge, simbol în zona sigură centrală 60%,
  pt. iconițe adaptive Android). Fișiere: `public/icon-192.png`, `public/icon-512.png`,
  `public/icon-maskable-512.png` (referite de manifest).
- `layout.tsx` — `viewport.themeColor` (export separat, NU în `metadata` — breaking change Next 14+) +
  `metadata.appleWebApp` (`capable`, `title`, `statusBarStyle: "black-translucent"`) — Safari pe iOS nu
  citește manifestul pt. comportamentul de „aplicație", are nevoie de meta tag-uri `apple-mobile-web-app-*`
  separate.
- `public/sw.js` + `PwaRegister.tsx` (înregistrează SW-ul la montare) — service worker minim, DOAR pt.
  instalabilitate (Android/iOS cer un SW activ cu handler de `fetch`) + un shell offline de bază
  (network-first cu fallback la cache pt. pagini/assets proprii same-origin). **NU cache-uiește
  requesturile către backend** (alt origin, Render) — datele proiectului rămân mereu proaspete/
  autentificate corect, fără riscul de a servi date vechi dintr-un cache local.

**Verificat:** `tsc`, `lint`, `npm test` (265/265), `build` — curate; build-ul confirmă rutele noi
(`/manifest.webmanifest`, `/icon.png`, `/apple-icon.png`). Confirmat în browser: manifest servit corect
cu toate câmpurile, toate tag-urile din `<head>` prezente (`theme-color`, `manifest`,
`apple-mobile-web-app-*`, `apple-touch-icon`), service worker înregistrat și activ.

**Rămâne de testat manual (nu se poate simula complet în acest mediu):** promptul real de instalare pe
un Android/iPhone fizic, după deploy pe Vercel (necesită HTTPS — funcționează doar pe `localhost` sau
producție, nu pe alte medii de test fără certificat).

**Branch:** `051-pwa` (nou, din `main`).

## 2026-07-23 — Padding bottom pe mobil: conținutul nu mai e lipit de meniul de jos

User a raportat: pe mobil, conținutul ultimei secțiuni dintr-o pagină atinge direct meniul de jos
(bottom nav), fără respirație vizuală; a cerut și puțin mai mult padding în meniul însuși.

**Fix — un singur loc, aplicat egal pe toate paginile** (nu s-a atins fiecare pagină individual, ci
wrapper-ul comun din `AppShell.tsx` care înfășoară `children` pt. toate rutele):
- `AppShell.tsx` — `<main>`: `pb-16` (exact înălțimea meniului, zero respirație) → `pb-28` (112px,
  ~32px marjă vizibilă peste meniu).
- `BottomNav.tsx` — eliminat `h-16` fix (risc de tăiere a conținutului pe telefoane cu safe-area-inset-
  bottom mare, ex. iPhone cu bară de home — dacă padding-ul + safe-area depășeau înălțimea fixă de 64px,
  conținutul putea fi tăiat); înălțimea e acum dată de conținut + padding (`pt-2.5` sus, `paddingBottom`
  inline = `env(safe-area-inset-bottom) + 0.5rem` jos — 8px în plus față de simplul safe-area de dinainte).

**Verificat:** `tsc`, `lint`, `npm test` (265/265), `build` — curate. Confirmat vizual în browser la
375px lățime, pagina `/elemente` scrollată complet jos: ultimul card are spațiu vizibil față de meniu,
meniul însuși are mai multă respirație internă.

**Branch:** `052-padding-bottom-mobil` (nou, din `main`).
