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
| — (load inițial) | `/api/projects/{id}/items` | `GET` | Returnează `Item[]` (sau nested sub rooms — de decis) |
| `addRoom(room)` | `/api/projects/{id}/rooms` | `POST` | Body: `Omit<Room, "id" \| "projectId">`. Response: `Room` complet |
| `updateRoom(id, patch)` | `/api/rooms/{id}` | `PATCH` | Body: `Partial<Room>` |
| `deleteRoom(id)` | `/api/rooms/{id}` | `DELETE` | **Cascade obligatoriu** — șterge și `Item`-urile din cameră (regulă deja implementată client-side, trebuie replicată server-side) |
| `addItem(item)` | `/api/rooms/{roomId}/items` | `POST` | Body: `Omit<Item, "id">`. Response: `Item` complet |
| `updateItem(id, patch)` | `/api/items/{id}` | `PATCH` | Body: `Partial<Item>` |
| `deleteItem(id)` | `/api/items/{id}` | `DELETE` | — |

## Agregări server-side (de evaluat)

Funcțiile din `src/shared/functions/` (`totalSpent`, `costPerRoom`, `costPerCategory` etc.) rulează azi
client-side pe toată colecția de `items`. La scară mică rămân client-side fără probleme. Dacă proiectul
ajunge să aibă multe elemente/camere per proiect, evaluează endpoint-uri de agregare dedicate (ex:
`GET /api/projects/{id}/summary` returnând direct `{ totalEstimated, totalSpent, purchaseProgress, ... }`)
— **dar formula rămâne cea din `shared/functions/`, doar mutată server-side**, nu reinventată.

## De decis înainte de prima implementare

- [ ] Multi-proiect per user, sau single-project ca acum? (afectează dacă `Room` are `projectId`)
- [ ] Autentificare (JWT? sesiune?) și cine are acces la un proiect
- [ ] Paginare pe `/items` dacă un proiect crește mult
- [ ] Upload real de imagini (`imageUrl`) — azi e doar text liber, un URL extern
- [ ] Rate/curs valutar pentru conversia EUR↔RON (backlog frontend, item 6 din `CLAUDE.md`)
