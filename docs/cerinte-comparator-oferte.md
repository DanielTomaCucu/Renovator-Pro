# Cerințe — Comparator de Oferte (pagină nouă `/comparator`)

> Status: ✅ **implementat** (branch `041-comparator-oferte`, `docs/progress.md` → 2026-07-19). Funcționalitate
> nouă: userul compară mai multe oferte (magazine/prețuri/poze) pentru un produs de renovare (ex. „gresie baie"),
> pe camere, și transformă oferta aleasă într-un element de cumpărat. De citit împreună cu `docs/api-contract.md`
> (secțiunea „ComparisonGroup + Offer") și `CLAUDE.md` (design system, workflow Git).
>
> ⚠️ **Deviere de la documentul original:** pozele NU folosesc tabelul separat `offer_images` (BYTEA +
> upload multipart) descris mai jos — sunt string-uri simple (URL http(s) sau `data:image/...;base64,...`,
> comprimate client-side prin canvas), refolosind convenția deja existentă pt. `Item.imageUrl`. Secțiunea
> „Poze — upload real din telefon" de mai jos rămâne ca istoric al deciziei inițiale; implementarea reală
> e mai simplă și consistentă cu restul aplicației — vezi `docs/api-contract.md` pentru shape-ul final.

## Descriere funcțională

1. Userul deschide pagina **`/comparator`** (intrare nouă în Sidebar + bottom nav mobil când va exista).
2. Creează un **grup de comparație** legat de o cameră: ex. camera „Baie", produs „Gresie", categorie
   `MaterialType.Gresie`. Un grup = un singur produs de decis, cu N oferte.
3. În grup adaugă **oferte**: nume/model, magazin, preț unitar, cantitate + preț total derivat, link
   produs, **mai multe poze (inclusiv făcute pe loc, cu camera telefonului)**, notițe (pro/contra).
   **Niciun câmp al ofertei nu e obligatoriu** — scenariul principal e „sunt în Dedeman, fac 3 poze la
   gresie în 10 secunde și completez restul acasă". O ofertă poate fi doar o poză.
   **Magazinul se poate autocompleta din locația telefonului** (vezi secțiunea „Detectare magazin").
4. Pagina de **detaliu grup** (`/comparator/[groupId]`) afișează toate ofertele una lângă alta, ușor de
   comparat: galerie de poze per ofertă, preț evidențiat (cea mai ieftină marcată), magazin, notițe, link.
5. Userul apasă **„Alege această ofertă"** → confirmare → backend-ul creează un `Item` în camera grupului
   (nume, magazin ca `source`, preț, cantitate, link, prima poză ca `imageUrl`, status `În așteptare`,
   origine nouă `Din Comparator`) și marchează grupul „Decis" cu oferta aleasă.
6. **Nimic nu se șterge automat.** Grupurile decise rămân în DB cu tot istoricul de oferte (arhivă de
   research), până când userul le șterge explicit (ConfirmDialog). Ștergerea unui grup NU șterge Item-ul
   deja creat din el. Ștergerea camerei (cascade existent) șterge și grupurile ei.

### Poze — upload real din telefon (ÎN scop) + URL-uri externe

Două surse de poze per ofertă, ambele în Faza 1:
1. **Upload real** (camera/galeria telefonului): `<input type="file" accept="image/*" capture="environment" multiple>`.
   **Compresie client-side obligatorie** înainte de upload (canvas: redimensionare la max 1600px pe latura
   lungă, JPEG calitate ~0.8 → ~200–400 KB/poză) — pozele de telefon au 3–8 MB brute, inacceptabil pe
   Render free + Supabase free. Upload `multipart/form-data` spre backend, care stochează bytes în Postgres
   (`BYTEA`) — **zero infrastructură nouă** (fără Supabase Storage/S3; la volumele aplicației, sute de poze
   compresate încap lejer în DB-ul free). Limită server-side: max **2 MB**/fișier (413 peste), content-type
   `image/jpeg|png|webp`. Servire prin endpoint autentificat, cu `Cache-Control: private, max-age=31536000, immutable`
   (id-ul e imutabil). ⚠️ `<img src>` nu trimite header `Authorization` — vezi CMP-BE-5 pt. soluția de acces.
2. **URL extern** (site-ul magazinului), ca `Item.imageUrl` azi: câmp „Adaugă URL poză".

Modelul unifică ambele: `images: OfferImage[]` (max **8** per ofertă), unde fiecare intrare e ori
`{ kind: "url", url }` ori `{ kind: "upload", imageId }`. Ordinea listei = ordinea de afișare (prima = principală).

### Detectare magazin din locație („e în Dedeman?")

La deschiderea formularului de ofertă (sau la apăsarea unui buton „📍 Detectează magazinul" — buton, nu
automat la load, ca browserul să nu ceară permisiunea de locație nechemat):
1. Frontend: `navigator.geolocation.getCurrentPosition()` (`enableHighAccuracy: true`, timeout 8s).
2. Reverse-geocoding **direct din browser** pe **Nominatim (OpenStreetMap)** — gratuit, fără cheie API,
   CORS permis: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=..&lon=..&zoom=18&accept-language=ro`.
   Din răspuns se folosește numele POI-ului/magazinului (`name` / `address.shop` / primul segment din
   `display_name`) ca **sugestie** în câmpul „Magazin".
3. Câmpul rămâne **complet editabil** — sugestia doar pre-completează, userul o poate șterge/înlocui oricând.
4. Degradare elegantă, fără erori blocante: permisiune refuzată / timeout / răspuns Nominatim fără nume
   util → câmpul rămâne gol și un text discret „Nu am putut detecta magazinul" (`text-muted`, 12px).
   Funcționalitatea e best-effort, nu o dependență.
5. Politica Nominatim: max 1 request/secundă — apel doar la acțiunea explicită a userului (butonul), deci
   respectată implicit. Fără server-side proxy (nu e nevoie; coordonatele NU se salvează nicăieri).

## Model de date

Tipuri NOI în `frontend/src/shared/types/` (un fișier per tip + barrel `index.ts`):

```ts
// ComparisonGroupStatus.ts
/** Starea unui grup de comparație: în analiză sau decis (ofertă aleasă → element creat). */
export enum ComparisonGroupStatus { InAnaliza = "În analiză", Decis = "Decis" }

// OfferImageKind.ts + OfferImage.ts
/** Sursa unei poze de ofertă: URL extern sau fișier urcat (stocat în DB, servit de backend). */
export enum OfferImageKind { Url = "URL", Upload = "Upload" }
export interface OfferImage {
  kind: OfferImageKind;
  url?: string;      // doar la kind Url — http/https, max 2048
  imageId?: string;  // doar la kind Upload — id-ul din offer_images
}

// Offer.ts
/** O ofertă dintr-un grup de comparație. TOATE câmpurile descriptive sunt opționale —
 *  fluxul „în magazin" e: faci pozele acum, completezi numele/prețul acasă. */
export interface Offer {
  id: string;
  groupId: string;
  name?: string;           // model/denumire produs, ex. „Gresie Cesarom Tivoli 60×60"
  store?: string;          // ex. „Dedeman" — poate fi pre-completat din locație (vezi „Detectare magazin")
  unitPrice?: number;      // în moneda proiectului (intră în conversia EUR↔RON — vezi mai jos)
  quantity?: number;       // total = quantity × unitPrice, afișat doar dacă ambele există
  productUrl?: string;
  images: OfferImage[];    // max 8; poate fi goală
  notes?: string;          // pro/contra, text liber max 2000
  createdAt: string;       // ISO 8601, server-side
}

// ComparisonGroup.ts
/** Un produs de decis pentru o cameră, cu N oferte comparate. */
export interface ComparisonGroup {
  id: string;
  roomId: string;
  name: string;                    // ex. „Gresie baie"
  materialType: MaterialType;
  status: ComparisonGroupStatus;   // server-side; devine Decis doar prin endpoint-ul „choose"
  chosenOfferId?: string;          // setat de server la alegere
  createdItemId?: string;          // Item-ul creat la alegere (istoric; poate pointa la un item șters ulterior)
  createdAt: string;
  offers: Offer[];                 // nested — volum mic, un singur GET
}
```

`ItemOrigin` primește variantă NOUĂ: `Comparator = "Din Comparator"`. ⚠️ `AutoItemReconciler` atinge DOAR
`origin: "Din Configurare"` — verifică în test că elementele `Din Comparator` nu sunt niciodată
șterse/rescrise de reconciliere (comportament curent păstrat, dar acum cu test explicit).

### Migrare SQL (numărul următor liber, ex. `V7__comparator.sql` — verifică folderul de migrări)

```sql
CREATE TABLE comparison_groups (
    id              VARCHAR(36) PRIMARY KEY,
    room_id         VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    material_type   VARCHAR(32) NOT NULL,
    status          VARCHAR(16) NOT NULL,           -- valorile string RO, ca celelalte enums
    chosen_offer_id VARCHAR(36),
    created_item_id VARCHAR(36),                    -- fără FK spre items: istoricul supraviețuiește ștergerii itemului
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comparison_groups_room ON comparison_groups(room_id);

-- Toate câmpurile descriptive NULLABLE — o ofertă poate fi doar câteva poze făcute în magazin.
CREATE TABLE offers (
    id          VARCHAR(36) PRIMARY KEY,
    group_id    VARCHAR(36) NOT NULL REFERENCES comparison_groups(id) ON DELETE CASCADE,
    name        VARCHAR(200),
    store       VARCHAR(120),
    unit_price  NUMERIC(12,2),
    quantity    NUMERIC(12,2),
    product_url VARCHAR(2048),
    images      JSONB NOT NULL DEFAULT '[]'::jsonb,   -- OfferImage[]: [{kind,url?,imageId?}, ...], max 8
    notes       VARCHAR(2000),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_offers_group ON offers(group_id);

-- Pozele urcate (bytes compresați client-side, max 2MB) — separate de offers ca listarea grupurilor
-- să nu care niciodată bytes de imagine în SELECT.
CREATE TABLE offer_images (
    id           VARCHAR(36) PRIMARY KEY,
    offer_id     VARCHAR(36) NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    content_type VARCHAR(64) NOT NULL,
    data         BYTEA NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_offer_images_offer ON offer_images(offer_id);
```

## Endpoint-uri (de adăugat și în `docs/api-contract.md` în aceeași sesiune)

Toate sub `Authorization: Bearer`, autorizare pe membership de proiect (prin cameră → proiect), erorile
uniforme existente (404 IDOR, 400 validare). Arhitectură hexagonală ca la Room/Item: port in/out, use case,
entitate JPA + mapper, controller + DTO-uri.

| Endpoint | Verb | Body / Note |
|---|---|---|
| `/api/projects/{id}/comparison-groups` | `GET` | Toate grupurile proiectului, cu `offers` nested, sortate `createdAt` desc |
| `/api/rooms/{roomId}/comparison-groups` | `POST` | `{ name, materialType }` → `201 ComparisonGroup` (status `În analiză`, offers `[]`) |
| `/api/comparison-groups/{id}` | `PATCH` | `Partial<{ name, materialType, roomId }>` — mutare între camere permisă cât timp `status = În analiză` |
| `/api/comparison-groups/{id}` | `DELETE` | `204`; șterge și ofertele (cascade). NU atinge Item-ul creat |
| `/api/comparison-groups/{id}/offers` | `POST` | `Omit<Offer, "id" \| "groupId" \| "createdAt">` — toate câmpurile opționale, body-ul `{}` e valid → `201 Offer` |
| `/api/offers/{id}` | `PATCH` | `Partial<...>` (aceleași câmpuri; `null` explicit = șterge câmpul, ca la Room — `JsonNullable`) |
| `/api/offers/{id}` | `DELETE` | `204`; șterge și `offer_images` (cascade); dacă era `chosenOfferId`, câmpul devine `null` (statusul rămâne Decis) |
| `/api/offers/{id}/images` | `POST` | `multipart/form-data`, câmp `file` — max 2 MB, `image/jpeg\|png\|webp`, refuz 400/413 altfel; refuz 409 dacă oferta are deja 8 poze. → `201 { imageId }` și serverul adaugă intrarea `{kind:"Upload", imageId}` la `offer.images` |
| `/api/offer-images/{id}` | `GET` | Bytes-ii pozei, `Content-Type` stocat, `Cache-Control: private, max-age=31536000, immutable`. Autentificat ca orice rută — frontend-ul îl încarcă prin `api-client` ca blob → `URL.createObjectURL` (un `<img src>` simplu nu poate trimite `Authorization`) |
| `/api/offer-images/{id}` | `DELETE` | `204`; scoate și intrarea corespunzătoare din `offer.images` |
| `/api/comparison-groups/{id}/choose` | `POST` | `{ offerId, quantity? }` → creează `Item` (vezi regulile de mai jos), setează `status = Decis`, `chosenOfferId`, `createdItemId`; `200 { group, item }`. Pe grup deja Decis → `409` (re-alegerea cere revenire manuală? NU — decizie: `choose` pe grup Decis creează ALT item și suprascrie `chosenOfferId`/`createdItemId`; userul poate șterge itemul vechi din `/elemente`. Fără 409.) |

**Reguli `choose` → `Item`** (câmpurile ofertei pot lipsi — fallback-uri explicite, `Item` are câmpuri
obligatorii): `roomId` = camera grupului; `name` = `offer.name` ?? numele grupului; `materialType` = al
grupului; `source` = `offer.store` ?? `""`; `unitPrice` = `offer.unitPrice` ?? `0`; `quantity` = din body
dacă e dat, altfel `offer.quantity` ?? `1`; `productUrl` = `offer.productUrl`; `imageUrl` = url-ul primei
poze de `kind: Url` (pozele Upload NU se copiază pe item — `imageUrl` e un URL extern simplu; rămân
vizibile în grupul păstrat); `status` = `În așteptare`; `origin` = `Din Comparator`; `createdAt`
server-side, ca la orice item.

**Conversia de monedă** (`POST /api/projects/{id}/currency`) trebuie extinsă: convertește și `offers.unit_price`
ale proiectului, în aceeași tranzacție — altfel ofertele rămân în moneda veche și comparația cu bugetul minte.

## Frontend — pagini și componente

### Store

`RenovationStore` se extinde (și `StoreProvider`/`api-client.ts` implementează):
`comparisonGroups: ComparisonGroup[]` (încărcat la boot cu restul snapshotului), plus mutațiile
`addComparisonGroup`, `updateComparisonGroup`, `deleteComparisonGroup`, `addOffer`, `updateOffer`,
`deleteOffer`, `chooseOffer(groupId, offerId, quantity?)`. `chooseOffer` reîncarcă și `items` + `summary`
(a apărut un item nou). Toate mutațiile: pattern-ul existent (nu aruncă, eroarea în `store.error`).

### `/comparator` — pagina listă

- `DashboardSummaryCard` cu 3 metrici: „Grupuri în analiză", „Oferte adunate" (total), „Decise" —
  NU un card nou de la zero (regulă din CLAUDE.md).
- Filtru pe cameră (select cu camerele proiectului + „Toate camerele") — tip local de pagină pt. stare.
- Grid de carduri per grup (`bg-surface`, `border-line`, `rounded-lg`): nume, cameră, `MaterialType`,
  nr. oferte, interval de preț `min–max` (`font-mono`, `formatMoney`), chip de status (capsulă ca
  `StatusChip`: `În analiză` = sky, `Decis` = emerald — component local sau extindere, NU string-uri brute,
  enum `ComparisonGroupStatus`). Click pe card → `/comparator/[groupId]`.
- Buton „Grup nou" → drawer `GroupFormDrawer` (nume, cameră, categorie material). Ștergere din card →
  `ConfirmDialog` existent, cu textul „Ofertele adunate se pierd definitiv; elementele deja create rămân".
- Empty state cu iconiță + CTA, ca la celelalte pagini.

### `/comparator/[groupId]` — pagina de comparare (detaliu)

- Rută dinamică App Router; grupul din `useStore()` după id (fără fetch separat); id inexistent →
  empty state „Grup negăsit" + link înapoi.
- Header: nume grup, cameră, categorie, chip status; dacă `Decis`, banner discret „Ofertă aleasă →
  element creat" cu link spre `/elemente`.
- **Desktop:** oferte în coloane una lângă alta (grid orizontal scrollabil `overflow-x-auto` la >3),
  aliniate pe rânduri: galerie poze (poza principală mare + thumbnails, click = schimbă poza principală —
  stare locală, fără librărie), nume, magazin, preț unitar (`font-mono`, mare), cantitate + total,
  link produs (extern, `rel="noopener"`), notițe. **Cea mai ieftină ofertă** primește un chip „Cel mai
  bun preț" (emerald) — funcție pură locală paginii (`cheapestOfferId(offers)`), înregistrată în Registrul
  de funcții. **Mobil:** ofertele devin carduri stivuite verticale.
- Per ofertă: „Alege" (buton primary; `ConfirmDialog` cu sumarul item-ului ce va fi creat → `chooseOffer`),
  „Editează"/„Șterge" (`icon-btn`). Buton „Adaugă ofertă" → `OfferFormDrawer`.
- `OfferFormDrawer` (component în folderul paginii sau `components/` dacă e refolosit): **niciun câmp
  obligatoriu** (butonul Salvează activ mereu; o ofertă complet goală e permisă — dar dacă are 0 câmpuri
  ȘI 0 poze, un hint discret „adaugă măcar o poză sau un preț"). Câmpuri: nume, magazin (cu buton
  „📍 Detectează magazinul" — vezi secțiunea dedicată), preț, cantitate, link, notițe, editor de poze:
  buton „Fă/alege poze" (`input file` cu `capture="environment" multiple`, compresie canvas înainte de
  upload — vezi secțiunea Poze) + câmp „Adaugă URL poză"; listă cu preview 64px, ștergere per poză, max 8
  în total. Pe mobil, butonul de poze e primul și cel mai proeminent din formular (fluxul „în magazin").
  Ofertele fără preț apar în comparație cu „—" la preț și sunt EXCLUSE din calculul „Cel mai bun preț" și
  din intervalul min–max al cardului de grup (`cheapestOfferId` ignoră `unitPrice` absent). React 19:
  reset de formular prin „adjusting state during render", NU `useEffect` (vezi `ItemFormDrawer.tsx`).
- Toate acțiunile cu request: `useAsyncAction` + `<Spinner />` + `disabled`/`aria-busy`, drawerele fac
  `await` înainte de închidere (regulile din `docs/cerinte-loading-states.md`).

### Navigare

Intrare nouă în `Sidebar.tsx` „Comparator Oferte". Iconiță: preia ecranul din Stitch dacă există unul
pentru comparator; altfel folosește `compare_arrows`, adăugată în `NAV_ICONS` din `shared/icons.ts`
(NU string direct în JSX).

## Tickete (în ordinea implementării)

### Backend

- **CMP-BE-1 — Migrare + domeniu.** `V7__comparator.sql` (de mai sus), entități JPA + mapper persistence,
  modele de domeniu `ComparisonGroup`/`Offer`, enum status, `ItemOrigin.Comparator` în enum-ul Java.
  Criteriu: migrarea rulează pe DB-ul local (docker compose) fără erori.
- **CMP-BE-2 — CRUD grupuri + oferte.** Endpoint-urile din tabel (fără `choose` și fără poze), cu DTO-uri.
  Toate câmpurile ofertei OPȚIONALE (`{}` valid la POST; `JsonNullable` la PATCH pt. ștergere explicită);
  validări doar pe CE E prezent: preț > 0, cantitate > 0, URL-uri http/https ≤ 2048, notes ≤ 2000, max 8
  intrări în `images`. Autorizare pe membership (404 uniform IDOR ca la Room/Item). Teste de controller +
  use case în stilul `RoomControllerTest`, inclusiv „ofertă goală se creează cu succes".
- **CMP-BE-3 — Choose.** `POST .../choose` cu regulile de mapare ofertă→Item de mai sus, tranzacțional
  (item + status + chosenOfferId + createdItemId împreună). Teste: choose creează item cu
  `origin: "Din Comparator"`; re-choose suprascrie referințele fără a șterge itemul vechi; oferta din alt
  grup → 400; reconcilierea de cameră NU atinge itemele `Din Comparator`.
- **CMP-BE-4 — Conversie monedă.** `CurrencyConverter`/use case-ul de conversie include `offers.unit_price`
  (rândurile cu `unit_price NULL` se sar). Test: EUR→RON convertește prețurile ofertelor cu aceeași
  rotunjire HALF_UP; ofertele fără preț rămân fără preț.
- **CMP-BE-5 — Poze upload.** `POST /api/offers/{id}/images` (multipart, max 2 MB, content-type
  `image/jpeg|png|webp`, 409 la a 9-a poză), `GET`/`DELETE /api/offer-images/{id}` (bytes + Content-Type +
  Cache-Control, autorizare pe membership prin ofertă→grup→cameră→proiect, 404 IDOR). Tabela `offer_images`
  separată de `offers` (bytes-ii nu apar niciodată în SELECT-ul de listare grupuri). `spring.servlet.multipart.max-file-size`
  configurat la 2MB. Teste: upload+get roundtrip, refuz peste limită, refuz content-type greșit, acces
  fără membership → 404.

### Frontend

- **CMP-FE-1 — Tipuri + store.** Fișierele de tipuri noi + barrel; `ItemOrigin.Comparator`;
  `RenovationStore` + `StoreProvider` + `api-client.ts` cu state-ul și cele 7 mutații; reload `items`/`summary`
  după `chooseOffer`. `docs/progress.md` actualizat.
- **CMP-FE-2 — Pagina `/comparator`.** Listă + filtru cameră + `GroupFormDrawer` + ștergere cu confirm +
  empty state + intrare Sidebar. Responsive (carduri 1 col mobil → 2–3 desktop).
- **CMP-FE-3 — Pagina `/comparator/[groupId]`.** Layout de comparare desktop/mobil, galerie poze
  (pozele Upload încărcate ca blob prin `api-client` → `URL.createObjectURL`, cu revocare la unmount;
  componentă `OfferImage` reutilizabilă pt. asta), chip „Cel mai bun preț" (doar între ofertele CU preț),
  `OfferFormDrawer` — zero câmpuri obligatorii, capture foto + compresie canvas client-side (funcție pură
  `compressImage(file, maxSide, quality)` în folderul paginii, înregistrată în Registrul de funcții),
  fluxul `choose` cu ConfirmDialog și banner de succes. Loading states peste tot conform
  `cerinte-loading-states.md` (inclusiv progres per poză la upload: spinner pe thumbnail).
- **CMP-FE-3b — Detectare magazin.** Butonul „📍 Detectează magazinul" în `OfferFormDrawer`:
  `navigator.geolocation` → Nominatim reverse (secțiunea dedicată), sugestie editabilă, degradare
  elegantă la refuz/timeout/fără rezultat. Coordonatele NU se salvează și NU se trimit backend-ului.
  Testare manuală pe telefon real (HTTPS obligatoriu pt. geolocation — merge pe deploy-ul Vercel, nu pe
  http://localhost din rețea).
- **CMP-FE-4 — Verificare + docs.** `npm run build && npm run lint && npx tsc --noEmit`; verificare vizuală
  în browser (desktop + 375px); `docs/api-contract.md` (endpoint-urile noi + `ItemOrigin`) și
  `docs/progress.md` (jurnal + registru funcții) actualizate; CLAUDE.md — secțiunea „Pagini" + iconițe.

### Explicit ÎN AFARA scopului (nu improviza)

- Mutarea pozelor în Supabase Storage/S3 — doar dacă DB-ul crește peste limită (decizie viitoare separată;
  schema `offer_images` permite migrarea fără schimbare de API).
- Salvarea/istoricul locațiilor GPS, hartă cu magazine, notificări de preț, istoricul prețurilor unei
  oferte, comparator între proiecte diferite.
