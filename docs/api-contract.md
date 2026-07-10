# Contract API — Renovator Pro Backend (Spring Boot)

> Status: **backend încă neimplementat.** Acest document e sursa unică de adevăr pentru shape-ul
> endpoint-urilor înainte de a fi scrise — orice decizie despre request/response se scrie AICI întâi.
> Frontend-ul (`src/lib/store.tsx`) e deja scris ca să mapeze 1:1 pe acest contract, ca migrarea de la
> mock la API real să fie doar o schimbare de implementare a `useStore()`, nu de shape de date.

## Principii

1. **Tipurile din `src/lib/types.ts` sunt sursa de adevăr pentru shape-urile de date** (Project, Room, Item). Backend-ul Spring Boot trebuie să producă JSON care mapează exact pe aceste interfețe (aceleași nume de câmp, camelCase).
2. **Logica de business NU se duplică în backend prin reimplementare liberă.** Regulile din `docs/progress.md` → „Registru de funcții" (ex: doar „Cumpărat" contează la cheltuit) trebuie portate identic în Java. Dacă o regulă se schimbă, se schimbă întâi aici + în `functions.ts`, apoi în backend.
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
  currency: "EUR" | "RON";
}
```

### `Room`
```ts
{
  id: string;
  projectId: string;          // FK — absent în tipul TS actual (frontend e single-project); de adăugat la conectarea reală
  type: "Dormitor" | "Baie" | "Living" | "Bucătărie" | "Terasă" | "Balcon";
  name: string;
  allocatedBudget: number;
}
```

### `Item`
```ts
{
  id: string;
  roomId: string;
  name: string;
  materialType: "Gresie" | "Faianță" | "Parchet" | "Vopsea" | "Sanitare"
              | "Mobilă" | "Electrocasnice" | "Corpuri de iluminat" | "Altele";
  source: string;
  status: "În așteptare" | "Planificat" | "Cumpărat";
  quantity: number;
  unitPrice: number;
  productUrl?: string;
  imageUrl?: string;
}
```

## Endpoint-uri planificate

Maparea e directă pe metodele din interfața `RenovationStore` (`src/lib/store.tsx`) — fiecare metodă
client devine un apel HTTP. Nu inventa endpoint-uri suplimentare fără să le documentezi aici întâi.

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

Funcțiile din `functions.ts` (`totalSpent`, `costPerRoom`, `costPerCategory` etc.) rulează azi client-side
pe toată colecția de `items`. La scară mică rămân client-side fără probleme. Dacă proiectul ajunge să aibă
multe elemente/camere per proiect, evaluează endpoint-uri de agregare dedicate (ex: `GET /api/projects/{id}/summary`
returnând direct `{ totalEstimated, totalSpent, purchaseProgress, ... }`) — **dar formula rămâne cea din
`functions.ts`, doar mutată server-side**, nu reinventată.

## De decis înainte de prima implementare

- [ ] Multi-proiect per user, sau single-project ca acum? (afectează dacă `Room` are `projectId`)
- [ ] Autentificare (JWT? sesiune?) și cine are acces la un proiect
- [ ] Paginare pe `/items` dacă un proiect crește mult
- [ ] Upload real de imagini (`imageUrl`) — azi e doar text liber, un URL extern
- [ ] Rate/curs valutar pentru conversia EUR↔RON (backlog frontend, item 6 din `CLAUDE.md`)
