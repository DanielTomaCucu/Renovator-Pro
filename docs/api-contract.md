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
5. Autentificare/autorizare: **neconcepute încă** — de definit înainte de prima implementare de endpoint protejat.

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

**Câmpuri tehnice** (`floorMaterial`, `floorArea`, `perimeter`, `tileSize`, `installationType`, `doors`, `baseboardHeight`, `wallShape`, `wallTiling`, `wallFinish`, `windows`) — vezi `src/shared/types/Room.ts` pentru shape-ul complet, omis aici din motive istorice (contractul nu a fost actualizat la fiecare extindere a modelului tehnic; sursa de adevăr rămâne codul TS, regula #1 de mai sus). `doors`/`windows` sunt ambele `Partial<Record<Wall, { width, height }>>` — max. o ușă ȘI o fereastră per perete (pot coexista pe același perete). `wallShape` e un enum (`"Pătrat" | "Dreptunghi" | "Neregulată"`), doar UI (nu afectează formulele) — controlează câte din cele 4 chei ale `wallLengths` sunt independente în interfață și validează client-side ca suprafața implicată de `wallLengths` să nu depășească `floorArea`; backend-ul poate stoca valoarea dar nu are nevoie s-o valideze suplimentar.

**Regulă de business critică pt. backend** (`shared/functions/dimensions.ts`): `wallTiling` (faianță) și `wallFinish` (vopsea/tapet) sunt **mutual exclusive**, determinate de `floorMaterial` — `wallTiling` doar când `floorMaterial === "Gresie"`, `wallFinish` doar altfel (Parchet Laminat/Mochetă). La Gresie, plinta (`baseboardHeight × perimetru`) se adaugă la necesarul de gresie (nu e produs separat); la celelalte pardoseli, plinta rămâne element `MaterialType.Plintă` separat. `windows` (max. o fereastră per perete, `width`/`height`) se scade din aria de faianță/vopsea/tapet a peretelui respectiv (pe lângă golul ușii, nu în locul lui) și generează separat un element `MaterialType.GlafFereastra` (Σ perimetrul ferestrelor, +5% pierdere). Orice implementare server-side a recalculării trebuie să replice exact aceste ramificații — nu doar formulele individuale.

### `Item`
```ts
{
  id: string;
  roomId: string;
  name: string;
  materialType: MaterialType; // enum: "Gresie" | "Faianță" | "Plintă" | "Parchet" | "Vopsea" | "Tapet" | "Glaf Fereastră" | "Sanitare"
                               //     | "Mobilă" | "Electrocasnice" | "Corpuri de iluminat" | "Altele"
  source: string;
  status: ItemStatus;         // enum: "În așteptare" | "Planificat" | "Cumpărat"
  quantity: number;
  unitPrice: number;
  productUrl?: string;
  imageUrl?: string;
  origin: ItemOrigin;         // enum: "Manual" | "Din Configurare" — proveniența elementului
}
```

**`origin: ItemOrigin.Configurare`** marchează elemente generate automat de server (sau client, până la migrare) din configurarea tehnică a unei camere (`Room.floorMaterial`/`floorArea`/`perimeter`/`wallTiling`) — vezi `shared/functions/auto-items.ts`. Backend-ul trebuie să recreeze aceeași reconciliere la fiecare `PATCH /api/rooms/{id}` (nu doar clientul): elementele existente cu `origin: "Din Configurare"` pentru acea cameră își păstrează `id`/`unitPrice`/`status`, doar `name`/`quantity` se recalculează; cele fără corespondent nou se șterg; elementele `origin: "Manual"` nu sunt niciodată atinse de acest proces.

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
| `updateRoom(id, patch)` | `/api/rooms/{id}` | `PATCH` | Body: `Partial<Room>` |
| `deleteRoom(id)` | `/api/rooms/{id}` | `DELETE` | **Cascade obligatoriu** — șterge și `Item`-urile din cameră (regulă deja implementată client-side, trebuie replicată server-side) |
| `addItem(item)` | `/api/rooms/{roomId}/items` | `POST` | Body: `Omit<Item, "id">`. Response: `Item` complet |
| `updateItem(id, patch)` | `/api/items/{id}` | `PATCH` | Body: `Partial<Item>` |
| `deleteItem(id)` | `/api/items/{id}` | `DELETE` | — |
| `convertCurrency(target, rate)` | `/api/projects/{id}/currency` | `POST` | Conversie reală a TUTUROR sumelor proiectului — vezi secțiunea dedicată mai jos |
| `summary` (store) | `/api/projects/{id}/summary` | `GET` | Agregările calculate server-side — vezi secțiunea „Agregări server-side" |

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
}
```
Frontend-ul păstrează un calcul client identic (`shared/functions/dimensions.ts` → `computeRoomDimensions`)
DOAR ca preview instant la editarea unei camere (pe `draft`, înainte de salvare) și ca fallback; PDF-ul exportat
folosește `room.dimensions` de la server. Formulele client oglindesc 1:1 backend-ul.

## De decis înainte de prima implementare

- [ ] Multi-proiect per user, sau single-project ca acum? (afectează dacă `Room` are `projectId`)
- [ ] Autentificare (JWT? sesiune?) și cine are acces la un proiect
- [ ] Paginare pe `/items` dacă un proiect crește mult
- [ ] Upload real de imagini (`imageUrl`) — azi e doar text liber, un URL extern
- [x] Rate/curs valutar pentru conversia EUR↔RON (backlog frontend, item 6 din `CLAUDE.md`) — **rezolvat**: cursul e furnizat de user la conversie (`POST /api/projects/{id}/currency`, câmp `exchangeRate`); nu există (încă) sursă automată de curs.
