# Contract API — Renovator Pro Backend (Spring Boot)

> Status: **backend încă neimplementat.** Acest document e sursa unică de adevăr pentru shape-ul
> endpoint-urilor înainte de a fi scrise — orice decizie despre request/response se scrie AICI întâi.
> Frontend-ul (`src/shared/store.tsx`) e deja scris ca să mapeze 1:1 pe acest contract, ca migrarea de la
> mock la API real să fie doar o schimbare de implementare a `useStore()`, nu de shape de date.

## Principii

1. **Tipurile din `src/shared/types/` sunt sursa de adevăr pentru shape-urile de date** (`Project`, `Room`, `Item`, plus enums `RoomType`/`ItemStatus`/`MaterialType`/`Currency` — câte un fișier per tip). Backend-ul Spring Boot trebuie să producă JSON care mapează exact pe aceste interfețe (aceleași nume de câmp, camelCase). Enums TS ↔ enums Java, aceleași valori string (cu diacritice).
2. **Logica de business NU se duplică în backend prin reimplementare liberă.** Regulile din `docs/progress.md` → „Registru de funcții" (ex: doar `ItemStatus.Cumparat` contează la cheltuit) trebuie portate identic în Java. Dacă o regulă se schimbă, se schimbă întâi aici + în `src/shared/functions/`, apoi în backend.
3. Toate sumele sunt `number` (double/BigDecimal în Java, serializat ca number în JSON, nu string).
4. Toate ID-urile sunt `string` (UUID recomandat pe backend).
5. Autentificare/autorizare: **implementate (Faza 5)** — vezi secțiunea „Autentificare" mai jos și `docs/cerinte-autentificare.md`.

## Resurse

### `Project`
```ts
{
  id: string;
  title: string;
  totalBudget: number;
  currency: Currency; // enum: "EUR" | "RON"
}
```

### `Room`
```ts
{
  id: string;
  projectId: string;          // FK — absent în tipul TS actual (frontend e single-project); de adăugat la conectarea reală
  type: RoomType;             // enum: "Dormitor" | "Baie" | "Living" | "Bucătărie" | "Terasă" | "Balcon"
  name: string;
  allocatedBudget: number;
}
```

**Câmpuri tehnice** (`floorMaterial`, `floorArea`, `perimeter`, `tileSize`, `installationType`, `doors`, `baseboardHeight`, `wallShape`, `wallTiling`, `wallFinish`, `windows`, `ceilingPaint`, `underfloorHeating`) — vezi `src/shared/types/Room.ts` pentru shape-ul complet, omis aici din motive istorice (contractul nu a fost actualizat la fiecare extindere a modelului tehnic; sursa de adevăr rămâne codul TS, regula #1 de mai sus). `doors`/`windows` sunt ambele `Partial<Record<Wall, { width, height }>>` — max. o ușă ȘI o fereastră per perete (pot coexista pe același perete). `wallShape` e un enum (`"Pătrat" | "Dreptunghi" | "Neregulată"`), doar UI (nu afectează formulele) — controlează câte din cele 4 chei ale `wallLengths` sunt independente în interfață și validează client-side ca suprafața implicată de `wallLengths` să nu depășească `floorArea`; backend-ul poate stoca valoarea dar nu are nevoie s-o valideze suplimentar. `ceilingPaint?: boolean` — zugrăvirea tavanului, activată explicit, disponibilă la orice pardoseală. `underfloorHeating?: boolean` — încălzire în pardoseală, doar la Parchet Laminat, schimbă tipul foliei de sub parchet (nu afectează aria). `WallTiling` primește și el două câmpuri noi opționale: `roomHeight?: number` (înălțimea totală a camerei, pt. vopseaua de deasupra faianței, trebuie `> tileHeight`, `≤ 6`) și `tileSize?: TileSize` (mărimea plăcilor de faianță, pt. consumul de adeziv/chit; absent → Medie).

**Regulă de business critică pt. backend** (`shared/functions/dimensions.ts`): `wallTiling` (faianță) și `wallFinish` (vopsea/tapet) sunt **mutual exclusive**, determinate de `floorMaterial` — `wallTiling` doar când `floorMaterial === "Gresie"`, `wallFinish` doar altfel (Parchet Laminat/Mochetă). La Gresie, plinta (`baseboardHeight × perimetru`) se adaugă la necesarul de gresie (nu e produs separat); la celelalte pardoseli, plinta rămâne element `MaterialType.Plintă` separat. `windows` (max. o fereastră per perete, `width`/`height`) se scade din aria de faianță/vopsea/tapet a peretelui respectiv (pe lângă golul ușii, nu în locul lui) și generează separat un element `MaterialType.GlafFereastra` (Σ perimetrul ferestrelor, +5% pierdere). Orice implementare server-side a recalculării trebuie să replice exact aceste ramificații — nu doar formulele individuale.

### `Item`
```ts
{
  id: string;
  roomId: string;
  name: string;
  materialType: MaterialType; // enum: "Gresie" | "Faianță" | "Plintă" | "Parchet" | "Vopsea" | "Tapet" | "Glaf Fereastră"
                               //     | "Amorsă" | "Adeziv plăci" | "Chit de rosturi" | "Folie parchet" | "Sanitare"
                               //     | "Mobilă" | "Electrocasnice" | "Corpuri de iluminat" | "Altele"
  source: string;
  status: ItemStatus;         // enum: "În așteptare" | "Planificat" | "Cumpărat"
  quantity: number;
  unitPrice: number;
  productUrl?: string;
  imageUrl?: string;
  origin: ItemOrigin;         // enum: "Manual" | "Din Configurare" | "Din Comparator" — proveniența elementului
  createdAt: string;          // ISO 8601 — setat de server la creare, imutabil, NU trimis de client
  purchasedAt?: string;       // ISO 8601 — setat de server la tranziția spre Cumpărat, absent dacă nu a fost cumpărat încă
}
```

**`createdAt`/`purchasedAt`** (Problema 4 din audit): gestionate exclusiv de server, niciodată acceptate în
body-ul de creare/actualizare (`Omit<Item, "id" | "createdAt" | "purchasedAt">` la creare). `purchasedAt` se
actualizează DOAR la tranziția SPRE `Cumpărat` (era altceva → devine Cumpărat); rămâne neschimbat dacă statusul
e deja Cumpărat (nu se „reîmprospătează" la fiecare editare) sau dacă revine la alt status (istoric, nu se șterge).
Elementele deja `Cumpărat` înainte de migrarea acestor coloane au `purchasedAt: null` (nu există un moment real
cunoscut) — nu apar în `spending-timeline` până la o eventuală retranziție de status.

**`origin: ItemOrigin.Configurare`** marchează elemente generate automat de server din configurarea tehnică a
unei camere (`Room.floorMaterial`/`floorArea`/`perimeter`/`wallTiling`) — vezi `domain/service/AutoItemReconciler`
(server-side, sursă unică; nu mai există echivalent client-side, șters odată cu Problema 2 din audit). Backend-ul
recreează reconcilierea la fiecare `PATCH /api/rooms/{id}`: elementele existente cu `origin: "Din Configurare"`
pentru acea cameră își păstrează `id`/`unitPrice`/`status`/`createdAt`/`purchasedAt`, doar `name`/`quantity` se
recalculează; cele fără corespondent nou se șterg; elementele `origin: "Manual"` nu sunt niciodată atinse de acest proces.

### `ComparisonGroup` + `Offer` — Comparator de Oferte

**Implementat.** Un grup de comparație = un produs de decis pentru o cameră (ex. „Gresie baie"), cu N
oferte comparate. Vezi `docs/cerinte-comparator-oferte.md` pentru descrierea funcțională completă.

```ts
// ComparisonGroup
{
  id: string;
  roomId: string;
  name: string;
  materialType: MaterialType;
  status: ComparisonGroupStatus;  // enum: "În analiză" | "Decis"
  chosenOfferId?: string;         // setat DOAR de POST .../choose
  createdItemId?: string;         // idem — Item-ul creat/actualizat la alegere (poate fi un item „Din Configurare")
  linkedItemId?: string;          // vezi „Sincronizare cu Configurare" mai jos — ținta pe care choose o va ACTUALIZA
  createdAt: string;              // ISO 8601, server-side
  offers: Offer[];                // nested — un singur GET pt. toată pagina /comparator
}

// Offer — TOATE câmpurile descriptive OPȚIONALE (fluxul principal: „fac poze în magazin, completez restul acasă")
{
  id: string;
  groupId: string;
  name?: string;
  store?: string;
  unitPrice?: number;
  quantity?: number;
  productUrl?: string;
  images: string[];       // max 8 — fiecare URL http(s) SAU `data:image/...;base64,...` (poză din telefon, comprimată client-side), ca `Item.imageUrl`. NICIODATĂ absent — `[]` dacă nu are poze.
  notes?: string;
  createdAt: string;      // ISO 8601, server-side
}
```

⚠️ **Deviere deliberată de la designul inițial:** pozele NU trăiesc într-un tabel separat cu upload
multipart/BYTEA — sunt string-uri simple (URL sau data-URI), refolosind exact convenția deja existentă
pt. `Item.imageUrl` (validare `ItemUrlValidation`, compresie canvas client-side înainte de encodare —
`app/comparator/[groupId]/compressImage.ts`). Mai simplu, consistent cu restul aplicației, fără infra nouă.

### Sincronizare cu Configurare — `linkedItemId` (docs/cerinte-comparator-config-sync.md)

Problemă rezolvată: fără această legătură, un grup de comparație pentru un material deja generat de
`/configurare` (ex. „Gresie baie") ar produce la `choose` un **al doilea** `Item` pentru același material —
două surse de adevăr, totaluri dublate. Soluția: comparatorul nu creează un item paralel când există deja
unul „Din Configurare" pentru acea combinație cameră+material — îl **actualizează**.

- **La `POST /api/rooms/{roomId}/comparison-groups`** și la **`PATCH .../{id}`** (dacă schimbă `roomId`/
  `materialType`), backend-ul rezolvă `linkedItemId` = elementul `Item` cu `roomId` identic,
  `origin: "Din Configurare"`, `materialType` identic al grupului (`AutoItemReconciler.resolveLinkedItem`,
  primul după `createdAt` la ambiguitate — ex. „Amorsă zugrăveală" vs. „Amorsă placări", ambele
  `MaterialType.Amorsă`). Body-ul ambelor endpoint-uri acceptă opțional `linkedItemId` explicit (userul
  alege manual la ambiguitate în UI) — validat ca fiind un candidat real, altfel `400`.
- **Zero candidați** (materiale care nu vin NICIODATĂ din configurator — Mobilă, Electrocasnice, Sanitare,
  Corpuri de iluminat, Altele — sau camera încă neconfigurată) → `linkedItemId: null`, comportamentul de
  `choose` rămâne EXACT cel de azi (creează item nou).

**`POST /api/comparison-groups/{id}/choose`** — body `{offerId, quantity?}`, response `{group, item}`.
Comportament în DOUĂ ramuri, decis de `linkedItemId` (re-validat la fiecare choose — poate fi stale dacă
reconcilierea camerei a șters/recreat itemul între timp; re-rezolvat automat dacă e invalid):

1. **`linkedItemId` valid** (item există, `origin: "Din Configurare"`, `materialType` al grupului) →
   **PATCH pe item-ul existent**, DOAR câmpurile `source` (= `offer.store` ?? valoarea existentă),
   `unitPrice` (= `offer.unitPrice` ?? valoarea existentă), `productUrl`, `imageUrl` (idem, oferta parțială
   NU golește un câmp deja completat). `name`/`quantity`/`status`/`origin`/`createdAt`/`purchasedAt` NEATINSE
   — cantitatea rămâne cea calculată din măsurători, nu cea din ofertă/body. `origin` rămâne
   `"Din Configurare"` (NU devine `"Din Comparator"`).
2. **Fără `linkedItemId`** (fallback, comportament de azi neschimbat) → creează `Item` nou:
   `name` = `offer.name` ?? numele grupului; `source` = `offer.store` ?? `""`; `unitPrice` = `offer.unitPrice`
   ?? 0; `quantity` = din body, altfel `offer.quantity`, altfel 1; `imageUrl` = prima poză de tip URL din
   `offer.images` (pozele data-URI nu se copiază); `origin: "Din Comparator"`.

În ambele ramuri: `chosenOfferId`/`createdItemId` se actualizează pe grup, statusul devine „Decis”. Oferta
trebuie să aparțină grupului indicat, altfel `400`. Re-alegerea pe un grup deja Decis: ramura 1 actualizează
din nou ACELAȘI item (nu se creează dubluri); ramura 2 (fallback) creează un ALT item nou (comportament de
azi, neschimbat) și suprascrie referințele.

**Conversia de monedă** (`POST /api/projects/{id}/currency`) convertește și `offers.unitPrice` ale
proiectului (ofertele fără preț se sar). **Ștergerea unei camere** șterge cascade și grupurile ei + ofertele.
**Ștergerea unui grup** șterge ofertele lui, dar NU atinge `Item`-ul deja creat/actualizat din el
(`createdItemId` rămâne în istoric, poate ajunge să pointeze spre un item de mult șters — nu e problemă, e
doar istoric).

## Endpoint-uri planificate

Maparea e directă pe metodele din interfața `RenovationStore` (`src/shared/types/RenovationStore.ts`) —
fiecare metodă client devine un apel HTTP. Nu inventa endpoint-uri suplimentare fără să le documentezi aici întâi.

| Metodă store (client) | Endpoint | Verb | Note |
|---|---|---|---|
| — (load inițial) | `/api/projects/{id}` | `GET` | Returnează `Project` |
| — (load inițial) | `/api/projects/{id}/rooms` | `GET` | Returnează `Room[]` |
| — (load inițial) | `/api/projects/{id}/items` | `GET` | Returnează `Item[]` — **decis (Faza 4): plat, nu nested sub rooms** (frontend-ul filtrează client-side per cameră, ca azi cu mock data) |
| `updateProject(patch)` | `/api/projects/{id}` | `PATCH` | Body: `Partial<Project>`. **Lipsea din contract — adăugat la implementarea Fazei 4** (era deja în `RenovationStore`, omisă din tabel din motive istorice) |
| `addRoom(room)` | `/api/projects/{id}/rooms` | `POST` | Body: `Omit<Room, "id" \| "projectId">` — camera completă, câmpurile tehnice sunt opționale (pot lipsi la creare; fluxul real din UI le adaugă ulterior prin `PATCH`, dar API-ul acceptă oricare din ele direct la creare, dacă un client viitor vrea asta). Response: `Room` complet |
| `updateRoom(id, patch)` | `/api/rooms/{id}` | `PATCH` | Body: `Partial<Room>` — câmpurile tehnice opționale au semantică specială, vezi secțiunea dedicată mai jos (Problema 6) |
| `deleteRoom(id)` | `/api/rooms/{id}` | `DELETE` | **Cascade obligatoriu** — șterge și `Item`-urile din cameră (regulă deja implementată client-side, trebuie replicată server-side) |
| `addItem(item)` | `/api/rooms/{roomId}/items` | `POST` | Body: `Omit<Item, "id">`. Response: `Item` complet |
| `updateItem(id, patch)` | `/api/items/{id}` | `PATCH` | Body: `Partial<Item>` |
| `deleteItem(id)` | `/api/items/{id}` | `DELETE` | — |
| `convertCurrency(target, rate)` | `/api/projects/{id}/currency` | `POST` | Conversie reală a TUTUROR sumelor proiectului — vezi secțiunea dedicată mai jos |
| `summary` (store) | `/api/projects/{id}/summary` | `GET` | Agregările calculate server-side — vezi secțiunea „Agregări server-side" |
| `spendingTimeline` (store) | `/api/projects/{id}/spending-timeline` | `GET` | Serie temporală de cheltuieli cumulate — vezi secțiunea dedicată mai jos |
| `comparisonGroups` (store) | `/api/projects/{id}/comparison-groups` | `GET` | `ComparisonGroup[]`, cu `offers` nested — vezi secțiunea „Comparator de Oferte" |
| `addComparisonGroup(roomId, data)` | `/api/rooms/{roomId}/comparison-groups` | `POST` | Body: `{name, materialType, linkedItemId?}`. Response: `ComparisonGroup` (offers `[]`, `linkedItemId` auto-rezolvat dacă nu e furnizat explicit) |
| `updateComparisonGroup(id, patch)` | `/api/comparison-groups/{id}` | `PATCH` | Body: `Partial<{name, materialType, roomId, linkedItemId}>` |
| `deleteComparisonGroup(id)` | `/api/comparison-groups/{id}` | `DELETE` | Șterge și ofertele (cascade); NU atinge `Item`-ul creat/actualizat din grup |
| `addOffer(groupId, data)` | `/api/comparison-groups/{groupId}/offers` | `POST` | Body: `Omit<Offer, "id"\|"groupId"\|"createdAt">` — TOATE câmpurile opționale, `{}` valid |
| `updateOffer(id, patch)` | `/api/offers/{id}` | `PATCH` | `null` explicit pe un câmp = șterge valoarea (ca la `Room`) |
| `deleteOffer(id)` | `/api/offers/{id}` | `DELETE` | Dacă era `chosenOfferId`, referința devine `null` (statusul grupului rămâne Decis) |
| `chooseOffer(groupId, offerId, quantity?)` | `/api/comparison-groups/{groupId}/choose` | `POST` | Actualizează itemul `linkedItemId` (dacă există) SAU creează unul nou (origin `Din Comparator`) — vezi secțiunea „Sincronizare cu Configurare" |

## Autentificare (Faza 5)

Toate rutele de mai sus, EXCEPTÂND `/api/auth/**` și `/actuator/health`, cer un header
`Authorization: Bearer <accessToken>` — fără el, `401`. Deciziile complete (login pe username, cod de
invitație, 404 uniform la refuz de autorizare) sunt în `docs/cerinte-autentificare.md`; aici doar shape-urile.

| Endpoint | Verb | Body / Auth | Response |
|---|---|---|---|
| `/api/auth/register` | `POST` | `{ username, password, projectName? }` SAU `{ username, password, inviteCode? }` — exact unul din `projectName`/`inviteCode` | `201 { accessToken, user: {id, username}, project: Project, role }` + cookie `rp_refresh` (httpOnly) |
| `/api/auth/login` | `POST` | `{ username, password }` | `200`, același shape ca register |
| `/api/auth/refresh` | `POST` | fără body, cookie `rp_refresh` | `200 { accessToken }` + cookie NOU (rotire — cel vechi devine invalid) |
| `/api/auth/logout` | `POST` | cookie `rp_refresh` | `204`, revocă refresh token-ul |
| `/api/auth/me` | `GET` | `Authorization: Bearer` | `200 { user, project, role }` |
| `/api/projects/{id}/invite-code` | `GET` | `Authorization` — doar OWNER | `200 { inviteCode }` (generat leneș la prima cerere) |
| `/api/projects/{id}/invite-code/regenerate` | `POST` | `Authorization` — doar OWNER | `200 { inviteCode }` nou; cel vechi devine invalid |
| `/api/projects/{id}/members` | `GET` | `Authorization` — orice membru | `200 [{ userId, username, role }]` |
| `/api/projects/{id}/members/{userId}` | `DELETE` | `Authorization` — doar OWNER | `204`; revocă și refresh token-urile membrului șters |

Erori: `401` credențiale/token invalid, `409` username deja folosit, `404` (uniform, IDOR — nu confirmă
existența resursei) pentru orice acces fără membership sau rol suficient, `400` payload invalid (ex. nici
`projectName` nici `inviteCode`).

## Conversie monedă — `POST /api/projects/{id}/currency`

Schimbarea monedei unui proiect **convertește efectiv** toate sumele stocate (nu doar schimbă simbolul).
Operația e o singură tranzacție pe backend care recalculează, cu factorul potrivit:
`project.totalBudget`, toate `room.allocatedBudget` și toate `item.unitPrice` ale proiectului, apoi setează
`project.currency = targetCurrency`. Formula pură trăiește în `domain/service/CurrencyConverter` (nu se
reimplementează în frontend — regula de aur #2 anti-duplicare; modul mock offline o oglindește doar pt. demo).

**Request body:**
```ts
{
  targetCurrency: Currency; // "EUR" | "RON" — moneda țintă
  exchangeRate: number;     // curs: câți RON per 1 EUR (strict pozitiv). EUR→RON: sumă × rate; RON→EUR: sumă ÷ rate
}
```

**Response:** `Project` complet, cu `currency` = target și `totalBudget` deja convertit. Frontend-ul reîncarcă
apoi snapshot-ul complet (project + rooms + items), fiindcă și `allocatedBudget`/`unitPrice` s-au schimbat.

**Rotunjire:** `BigDecimal`, `RoundingMode.HALF_UP`, 2 zecimale (invariantul `Money`). Conversia în aceeași
monedă (`targetCurrency === currency` curent) e identitate — nicio valoare nu se schimbă.

**Caveat (de reținut la afișare/UX):** conversia e **distructivă** — dus-întors repetat (RON→EUR→RON) pierde
precizie prin rotunjire. Alternativa non-distructivă (stocare într-o monedă de bază + conversie la afișare) a
fost respinsă intenționat: userul a cerut explicit ca schimbarea monedei să **modifice** valorile stocate.

**Erori:** `exchangeRate` absent/≤0 sau `targetCurrency` invalid → `400`; proiect inexistent → `404`.

## Agregări server-side — `GET /api/projects/{id}/summary`

**Implementat (Problema 2 din audit).** Sursa unică de adevăr pentru totalurile pe care paginile le afișau
recalculând client-side. Toate formulele vin din `BudgetCalculator` / `RoomDimensionsCalculator` (aceleași
ca în `shared/functions/`), doar mutate server-side — NU reinventate. Store-ul frontend îl reîncarcă după
FIECARE mutație (add/update/delete item/room, update/convert project), ca headerele/graficele să fie mereu la zi.

**Response** (oglinda TS: `src/shared/types/ProjectSummary.ts`):
```ts
{
  totalEstimated: number;
  totalSpent: number;      // doar ItemStatus.Cumparat
  budgetRemaining: number; // totalBudget − totalSpent (poate fi negativ)
  purchaseProgress: number;// % întregi 0–100
  boughtCount: number;
  costPerRoom: { name: string; total: number }[];            // sortat desc, fără camere goale
  costPerCategory: { materialType: MaterialType; total: number; spent: number }[]; // sortat desc
  technical: { totalFloorArea: number; configuredRoomsRatio: number }; // projectTechnicalSummary
}
```

Consumat de: `/analiza` (KPI + donut + progress bars), `/centralizator` (KPI), `/elemente` (KPI), `/configurare`
(card „Sumar Tehnic Global" din `technical`). Calculele per-RÂND/per-cameră de detaliu (`itemTotal`, `roomSubtotal`,
`roomSpent`, `itemsForRoom`) rămân client-side — sunt randare de tabel, nu agregat de dashboard.

### `Room.dimensions` — necesarul de material, autoritativ

Fiecare `RoomResponse` include acum un câmp `dimensions` (oglinda TS: `RoomDimensions.ts`), calculat server-side
din `RoomDimensionsCalculator` (sursa de adevăr):
```ts
dimensions: {
  hasFloorConfig: boolean;
  floorMaterialNeeded: number; baseboardLength: number; baseboardTileArea: number;
  wallTilingArea: number; paintArea: number; wallpaperArea: number;
  windowTrimLength: number; totalDoorWidth: number;
  // Adăugate în auditul de calcule de șantier (docs/tickete-audit-calcule-securitate.md, CALC-1…8):
  floorWasteRatio: number;   // pierderea reală aplicată pardoselii (0.10/0.15/0.18 + 0.02 la plăci mari)
  paintLiters: number;       // vopsea recomandată AGREGATĂ (pereți+tavan+deasupra faianței), în litri (2 straturi, 11 mp/litru/strat)
  baseboardBars: number;     // câte bare de plintă (2 ml/bară) trebuie cumpărate
  windowTrimBars: number;    // câte bare de glaf (2 ml/bară) trebuie cumpărate
  // Adăugate în docs/cerinte-zugraveli.md (zugrăveli complete + consumabile de montaj):
  ceilingPaintArea: number;      // mp, cu pierdere — A.1
  paintAboveTilingArea: number;  // mp, cu pierdere — A.2 (doar Gresie, roomHeight > tileHeight)
  paintPrimerLiters: number;     // litri amorsă zugrăveală, rotunjit ↑ la 1 l — B.4
  tilingPrimerLiters: number;    // litri amorsă sub placări, rotunjit ↑ la 1 l — B.5
  floorAdhesiveKg: number;       // kg adeziv pardoseală (doar Gresie) — C.6
  wallAdhesiveKg: number;        // kg adeziv faianță — C.7
  adhesiveBags: number;          // saci de 25 kg (floor+wall), ceil — C.8
  groutKg: number;               // kg chit rosturi (pardoseală+faianță), ceil — C.9
  underlayArea: number;          // mp folie sub parchet laminat, ceil — D.10
}
```
Frontend-ul păstrează un calcul client identic (`shared/functions/dimensions.ts` → `computeRoomDimensions`)
DOAR ca preview instant la editarea unei camere (pe `draft`, înainte de salvare) și ca fallback; PDF-ul exportat
folosește `room.dimensions` de la server. Formulele client oglindesc 1:1 backend-ul.

**Zugrăveli complete + consumabile de montaj** (`docs/cerinte-zugraveli.md`): `paintLiters` e acum agregatul
camerei (pereți la Parchet/Mochetă + tavan la orice pardoseală + deasupra faianței la Gresie), nu doar
vopseaua pereților. Elementul auto-generat `Vopsea` reflectă acest agregat (cantitate în LITRI, nu mp — singurul
element auto-generat cu unitate diferită de mp/ml). Arii NETE (fără pierderea de tăiere) sunt expuse intern în
`RoomDimensionsCalculator`/`dimensions.ts` (`netFloorTilingArea`/`netWallTilingArea`) pt. amorsă/adeziv/chit —
acestea acoperă suprafața reală, nu plăcile tăiate. 4 valori noi `MaterialType`: `Amorsă`, `Adeziv plăci`,
`Chit de rosturi`, `Folie parchet`. `Folie parchet` are DOUĂ nume posibile (XPS 3mm / încălzire în pardoseală,
după `Room.underfloorHeating`) dar rămâne UN SINGUR slot logic la reconciliere (același `materialType`).

**Pierderile de material NU mai sunt procente flat** (audit 2026-07-18, `docs/tickete-audit-calcule-securitate.md`):
- Pardoseală/faianță: 10% montaj drept, 15% diagonal, 18% herringbone (`Room.installationType`), +2% la
  plăci mari/foarte mari (`Room.tileSize`) — vezi `floorWasteRatio` (`dimensions.ts`/`RoomDimensionsCalculator`).
- Faianță: 12% (nu 10%) când sunt >1 goluri (uși+ferestre) pe pereții placați.
- Perimetrul (`roomPerimeter`) preferă suma celor 4 lungimi de perete introduse la faianță/finisaj (dacă
  toate sunt completate) în locul presupunerii de cameră pătrată (4×√mp), pentru plintă mai precisă.
- Toate calibrate pe norme reale de șantier — surse citate în tichetul de audit.

## PATCH `/api/rooms/{id}` — semantica „absent" vs. „null explicit" (Problema 6)

**Implementat.** Pentru câmpurile OBLIGATORII pe `Room` (`type`, `name`, `allocatedBudget`): convenția rămâne
simplă — `null`/absent = nu se modifică (nu pot fi șterse, nu are sens).

Pentru câmpurile tehnice OPȚIONALE (`floorMaterial`, `floorArea`, `perimeter`, `tileSize`, `installationType`,
`doors`, `baseboardHeight`, `wallShape`, `wallTiling`, `wallFinish`, `windows`, `ceilingPaint`,
`underfloorHeating`) body-ul JSON distinge acum **trei** stări, nu două:
1. **cheia absentă din body** → câmpul nu se modifică (comportamentul vechi, neschimbat);
2. **cheia prezentă cu valoare `null`** → câmpul se **ȘTERGE explicit** (nou — înainte era indistinguibil de #1,
   motiv pentru care dezactivarea placării/finisajului de pereți sau golirea suprafeței pardoselii nu se
   persista niciodată, chiar dacă UI-ul arăta local dezactivat);
3. **cheia prezentă cu o valoare** → câmpul se setează (neschimbat).

**Implementare backend:** DTO-ul (`RoomUpdateRequest`) folosește `JsonNullable<T>` (`org.openapitools:jackson-databind-nullable`,
modul înregistrat în `config/JacksonConfig`) pe fiecare câmp tehnic opțional, tradus în `Patch<T>`
(`application/port/in/Patch` — tip domeniu-agnostic, independent de Jackson) prin `DtoConversionSupport.toPatch(...)`.
`UpdateRoomService` aplică `command.câmp().resolve(existing.câmp())` pentru fiecare — `Patch.absent()` păstrează
valoarea veche, `Patch.of(null)` o șterge, `Patch.of(value)` o înlocuiește.

**Frontend:** `RoomTechnicalCard.handleSave()` normalizează explicit `undefined` → `null` pe toate câmpurile
tehnice opționale ale draftului înainte de a apela `updateRoom` (altfel `JSON.stringify` ar omite cheia,
recreând bug-ul). `RenovationStore.updateRoom` acceptă `{ [K in keyof Room]?: Room[K] | null }`.

**Test de referință** (cerut explicit de audit): dezactivarea `wallTiling` → `GET /api/rooms/{id}` arată
`wallTiling: null`, iar elementul auto-generat „Faianță" e eliminat de reconciliere. Verificat în
`RoomControllerTest`/`UseCasesTest` + manual pe backend real (`curl`).

## Serie temporală de cheltuieli — `GET /api/projects/{id}/spending-timeline`

**Implementat (Problema 3 din audit, fundamentată pe Problema 4 — `Item.createdAt`/`purchasedAt`).** Sursa
graficului „Evoluția Cheltuielilor" din `/analiza` — înlocuiește curba SVG hardcodată. Grupează elementele
`ItemStatus.Cumparat` pe luna calendaristică (UTC) a lui `purchasedAt`, însumează `itemTotal` per lună, apoi
calculează suma **cumulativă** crescătoare. Elementele fără `purchasedAt` (niciodată cumpărate, sau cumpărate
înainte de migrarea `V3`) sunt ignorate.

**Response** (oglinda TS: `src/shared/types/SpendingTimelinePoint.ts`), sortat cronologic ascendent:
```ts
{ month: string; cumulativeSpent: number }[]  // month = "yyyy-MM" (ISO); cumulativeSpent = sumă cumulativă
```

**Listă goală** dacă nimic nu a fost încă marcat Cumpărat — frontend-ul afișează un empty-state explicit
(„Niciun element cumpărat încă"), NICIODATĂ o curbă falsă (regulă explicită din audit). Etichetele de lună
(„Ian", „Feb 2025" etc.) se derivă pe frontend din `month` (`app/analiza/dates.ts` → `formatMonthLabel`) —
formatarea locală RO nu e concern de backend. Reîncărcat de store după fiecare mutație de item.

## De decis înainte de prima implementare

- [ ] Multi-proiect per user, sau single-project ca acum? (afectează dacă `Room` are `projectId`)
- [ ] Autentificare (JWT? sesiune?) și cine are acces la un proiect
- [ ] Paginare pe `/items` dacă un proiect crește mult
- [ ] Upload real de imagini (`imageUrl`) — azi e doar text liber, un URL extern
- [x] Rate/curs valutar pentru conversia EUR↔RON (backlog frontend, item 6 din `CLAUDE.md`) — **rezolvat**: cursul e furnizat de user la conversie (`POST /api/projects/{id}/currency`, câmp `exchangeRate`); nu există (încă) sursă automată de curs.
