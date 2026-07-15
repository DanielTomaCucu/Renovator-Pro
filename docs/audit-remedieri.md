# Audit — probleme identificate & plan de remediere

> **Rol document:** listă detaliată de probleme găsite în aplicație (frontend + backend) după finalizarea Fazei 6/7,
> destinată unui alt model care va implementa remedierile. Fiecare problemă are: **simptom**, **ce e greșit / unde**
> (fișiere + linii), **ce e corect deja** (ca să nu strice), și **cum se remediază** (pași concreți).
>
> **Reguli de respectat la implementare** (din `CLAUDE.md` + `docs/backend-blueprint.md`):
> - Un task = un branch = un PR. Niciun push direct pe `main`.
> - **Contract-first:** orice endpoint/câmp nou → întâi `docs/api-contract.md`, apoi cod.
> - Logica de business trăiește în backend (`domain/service`) și, unde e nevoie, se **consumă** din frontend, nu se reimplementează.
> - Toate sumele = `BigDecimal` pe backend; enum-urile păstrează valorile string cu diacritice identice cu TS.
> - Autentificarea (Faza 5) rămâne **amânată intenționat** — nu o atinge.
> - Verifică efectiv (nu doar compilat): `mvn verify` pe backend, `tsc`/`lint`/`build` pe frontend, plus test funcțional real (curl pe API / click în browser).

---

## Ce funcționează corect deja (NU strica)

- **Logica de business din backend e corectă și testată.** Verificat live pe API-ul real: la `PATCH /api/rooms/{id}`
  cu pardoseală Gresie + `wallTiling` (2 pereți × 3m × înălțime 2.5m), backend-ul generează automat elementul
  `Faianță (2 pereți)` cu cantitatea corectă **16.5 = (3+3) × 2.5 × 1.1** și `Gresie (Pardoseală)` = **6.6 = 6 × 1.1**.
  `AutoItemReconciler`, `RoomDimensionsCalculator`, `BudgetCalculator` sunt fidele regulilor și acoperite de teste.
- API REST complet, CORS pe profil, deploy Render + Supabase funcțional, arhitectură hexagonală curată.
- Enum-urile cu diacritice fac round-trip corect prin JSON și prin JSONB.

**Concluzie importantă:** problema „datele de la pereți nu sunt luate în considerare" **NU e o eroare de calcul în backend** —
backend-ul calculează corect. Cauzele reale sunt în frontend (vezi Problema 2 și 6) și în UX de introducere a datelor (Problema 7).

---

## Problema 1 — Schimbarea monedei NU convertește valorile (doar schimbă simbolul)

**Severitate: mare.** Cerută explicit de user.

**Simptom:** în pagina Setări, comutarea RON ↔ EUR schimbă doar eticheta monedei; sumele rămân aceleași numere
(ex. 12500 „RON" devine 12500 „EUR"), ceea ce e incorect — ar trebui convertite la cursul valutar.

**Ce e greșit / unde:**
- `frontend/src/app/setari/page.tsx` — `handleSave()` (linia ~35) apelează doar `updateProject({ currency })`.
  Câmpul de input „Curs Valutar" (`exchangeRate`, linia ~32/100) e pur **decorativ** — valoarea nu e folosită nicăieri.
- `frontend/src/shared/functions/money.ts` — `formatMoney` doar formatează cu simbolul monedei, nu convertește.
- Textul din card („Schimbarea monedei... nu modifică valorile introduse deja") documentează comportamentul greșit ca și cum ar fi intenționat — de rescris.
- Nu există nicio funcție de conversie nicăieri (nici front, nici back).

**Ce e corect:** `updateProject({ currency })` persistă corect moneda pe backend (`PATCH /api/projects/{id}`).

**Cum se remediază (recomandat — conversie reală, persistată, în backend, ca să nu dublăm logică):**
1. **Contract-first:** documentează în `api-contract.md` un endpoint nou:
   `POST /api/projects/{id}/currency` cu body `{ targetCurrency: "EUR"|"RON", exchangeRate: number }` (rate = câți RON per 1 EUR).
2. Backend: use case nou `ConvertProjectCurrencyUseCase` (în `application`) care, într-o singură tranzacție:
   - convertește `project.totalBudget`, toate `room.allocatedBudget`, toate `item.unitPrice` cu factorul potrivit
     (RON→EUR: împarte la rate; EUR→RON: înmulțește cu rate), rotunjind la 2 zecimale (`BigDecimal`, `RoundingMode.HALF_UP`);
   - setează `project.currency = targetCurrency`.
   Regula de conversie e o funcție pură în `domain/service` (ex. `CurrencyConverter`), testată izolat.
3. Frontend: în Setări, la Salvează, apelează noul endpoint cu cursul introdus de user (câmpul `exchangeRate` devine funcțional,
   obligatoriu la conversie). După răspuns, reîncarcă snapshot-ul (project + rooms + items) în store, ca toate paginile să reflecte valorile noi.
4. Rescrie textul „De Reținut" ca să descrie corect noul comportament (conversia se aplică tuturor valorilor).
5. **Caveat de documentat pentru user:** conversia e distructivă (pierdere de precizie la dus-întors repetat). Alternativ,
   se poate stoca mereu într-o monedă de bază + rată și converti la afișare — dar user-ul a cerut explicit „să modifice tot",
   deci mergem pe conversia persistată. Menționează trade-off-ul în PR.

---

## Problema 2 — Logică de business DUPLICATĂ frontend ↔ backend

**Severitate: mare (arhitectural).** Cerută explicit de user („nu vreau logică duplicată în front dacă am deja în backend").

**Simptom:** fiecare regulă de business există în DOUĂ locuri — TypeScript (frontend) și Java (backend). Riscă să diveargă
silențios; deja backend-ul e sursa de adevăr (rulează reconcilierea), dar frontend-ul recalculează totul client-side.

**Ce e greșit / unde (perechile duplicate):**
- `frontend/src/shared/functions/dimensions.ts` ↔ `backend/.../domain/service/RoomDimensionsCalculator.java`
  (wallTilingArea, floorMaterialNeeded, baseboardLength, windowTrimLength, wallFinishArea, projectTechnicalSummary…).
  Frontend-ul le folosește în `app/configurare/roomCalcRows.ts` și `RoomTechnicalCard.tsx` pentru panoul „Calcule Detaliate".
- `frontend/src/shared/functions/{budget,items,charts}.ts` ↔ `backend/.../domain/service/BudgetCalculator.java`
  (totalSpent, totalEstimated, budgetRemaining, costPerRoom, costPerCategory…). Frontend-ul le folosește în
  `app/analiza/page.tsx`, `app/centralizator/page.tsx`, `app/elemente/page.tsx` pentru toate totalurile și graficele.
- `frontend/src/shared/functions/auto-items.ts` (`syncAutoItemsForRoom`, `generateAutoItems`) ↔ `backend/.../AutoItemReconciler.java`.
  **Atenție:** în modul API (implicit), `syncAutoItemsForRoom` e apelat DOAR pe ramura `MockStoreProvider` din `store.tsx`
  (linia ~131) — deci în producție e **cod mort** care doar dublează backend-ul. Reconcilierea reală vine din server.
- Nu există endpoint de agregare pe backend (`api-contract.md §Agregări` îl menționează „de evaluat", dar nu e implementat).

**Ce e corect:** interfața `RenovationStore` e stabilă; abstracția store-ului permite schimbarea sursei fără să atingi paginile.

**Cum se remediază (etapizat — nu tot deodată):**
1. **Expune agregările pe backend** (contract-first în `api-contract.md`): `GET /api/projects/{id}/summary` care întoarce
   direct `{ totalEstimated, totalSpent, budgetRemaining, purchaseProgress, boughtCount, costPerRoom[], costPerCategory[] }`,
   calculate cu `BudgetCalculator` (NU reinventat). Vezi și `blueprint §6 Task 6.2`.
2. Frontend: store-ul expune și un `summary` (fetch din endpoint-ul nou, reîncărcat la fiecare mutație). Paginile
   `analiza`/`centralizator`/`elemente` consumă `summary` în loc să apeleze `totalSpent`/`costPerRoom`/etc. local.
3. Pentru panoul „Calcule Detaliate" din configurare: fie backend-ul întoarce breakdown-ul de dimensiuni pe cameră
   (endpoint sau câmp în răspunsul camerei), fie — dacă se vrea preview instant la tastare, înainte de salvare — se
   păstrează calculul client-side DOAR ca preview, cu un comentariu explicit că sursa de adevăr e backend-ul. Decizia
   se ia cu user-ul; recomandarea e ca după Salvează, valorile afișate să vină de la server.
4. Șterge codul mort: după ce reconcilierea e 100% server-side, elimină `syncAutoItemsForRoom`/`generateAutoItems`
   din frontend (rămâne doar dacă modul mock e păstrat — atunci documentează clar că e exclusiv pentru demo offline).
5. **Regulă:** nu șterge funcțiile frontend până nu muți consumul pe endpoint-uri — altfel spargi paginile. Fă-o cameră-cu-cameră / pagină-cu-pagină.

---

## Problema 3 — Graficele sunt FALSE (date hardcodate, nu reale)

**Severitate: mare.** Cerută explicit de user („acele grafice acum sunt cam degeaba").

**Simptom:** graficul „Evoluția Cheltuielilor" din Analiză arată mereu aceeași curbă, indiferent de date; etichetele sunt
fixe (Ian–Iul); pe mobil sunt bare hardcodate.

**Ce e greșit / unde:**
- `frontend/src/app/analiza/page.tsx`:
  - Desktop (liniile ~161–196): `<path d="M0,180 Q100,160 ...">` — curbă SVG **hardcodată**, plus etichete fixe `Ian…Iul`.
  - Mobil (liniile ~380–393): bare cu înălțimi fixe (`h-[20%]`, `h-[45%]`…) — decorative.
- Cauza rădăcină: nu există date temporale (vezi Problema 4) — nu se poate desena o evoluție reală fără timestamp-uri.

**Ce e corect:** donut-ul „Cost per Cameră" și barele „Stadiu pe Categorii" folosesc date REALE (`costPerRoom`, `costPerCategory`).
Doar „Evoluția Cheltuielilor" e falsă.

**Cum se remediază:** depinde de Problema 4 (timestamp). După ce elementele au `createdAt`:
1. Backend: endpoint de serie temporală, ex. `GET /api/projects/{id}/spending-timeline` care întoarce cheltuiala cumulată
   (doar elemente `Cumpărat`) grupată pe lună (sau pe zi), pe baza `createdAt`/momentului marcării ca `Cumpărat`.
   (Decide cu user-ul: „evoluție" = după data adăugării, sau după data cumpărării? Recomandat: după momentul cumpărării.)
2. Frontend: înlocuiește SVG-ul hardcodat cu unul generat din seria reală (aceeași abordare ca donut-ul — SVG custom, fără librărie),
   etichete de lună derivate din date. Dacă nu există date suficiente, afișează un empty-state, nu o curbă falsă.

---

## Problema 4 — Elementele NU au timestamp → nu se pot face grafice temporale reale

**Severitate: mare.** Cerută explicit de user („vreau de fiecare dată când adaug un element să am un timestamp").

**Simptom:** modelul `Item` nu are niciun câmp de dată; imposibil de construit „evoluția în timp".

**Ce e greșit / unde:**
- `frontend/src/shared/types/Item.ts` — fără câmp de dată.
- `backend/.../domain/model/Item.java` — fără câmp de dată (id, roomId, name, materialType, source, status, quantity, unitPrice, productUrl, imageUrl, origin).
- `backend/.../db/migration/V1__initial_schema.sql` — tabelul `items` nu are `created_at`.

**Ce e corect:** infrastructura (adaptere, mappere) suportă ușor un câmp nou; există deja pattern de `TIMESTAMPTZ` (tabelul `users.created_at`).

**Cum se remediază:**
1. **Migrare nouă** `V3__items_created_at.sql`: `ALTER TABLE items ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();`
   (NU modifica V1/V2 — sunt deja aplicate în producție pe Supabase; orice schimbare de schemă = migrare nouă).
2. Domeniu: adaugă `Instant createdAt` pe `Item` (Java) și `createdAt: string` (ISO) pe `Item` (TS). Setează-l la creare
   în `AddItemService` (via un port `Clock`/`TimeProvider` ca să fie testabil, nu `Instant.now()` direct în use case).
   Pentru elementele auto-generate (`AutoItemReconciler`), setează `createdAt` la crearea celor noi; **păstrează-l neschimbat**
   la reconcilierea celor existente (la fel ca id/preț/status).
3. Entitate JPA + mappere (`ItemEntity`, `ItemEntityMapper`, `ItemDtoMapper`, `ItemResponse`) — adaugă câmpul.
   Contract-first: documentează `createdAt` în `api-contract.md §Item`.
4. Expune-l în `ItemResponse`. Consideră dacă vrei și `createdAt` la nivel de eveniment de status (ex. „când a devenit Cumpărat")
   — dacă graficul de evoluție trebuie să fie după data cumpărării, ai nevoie de un `purchasedAt` separat (decide cu user-ul).

---

## Problema 5 — Bugetul total al proiectului și titlul NU sunt editabile în UI → buget 0 pe date reale

**Severitate: mare.** Descoperită în audit (nu semnalată explicit, dar sparge toate calculele de buget pe date reale).

**Simptom:** pe backend-ul real, proiectul seedat are `title = "Proiectul Meu"` și `totalBudget = 0` (din `V2__seed_default_project.sql`).
Nu există niciun câmp în UI pentru a le schimba → „Buget Total Estimat" = 0, „Buget Rămas" mereu negativ, cardul „Depășire Buget"
mereu roșu. Pe datele mock vechi păreau OK (12500), dar acum, conectat la backend, sunt 0.

**Ce e greșit / unde:**
- `updateProject(...)` e apelat DOAR cu `currency` (setari) și `totalArea` (configurare). `title` și `totalBudget` nu se editează nicăieri.
- Backend-ul suportă deja `PATCH /api/projects/{id}` cu `title`/`totalBudget` (există în `ProjectUpdateRequest`), doar UI-ul lipsește.

**Ce e corect:** endpoint-ul + validarea (`@DecimalMin 0` pe totalBudget) există deja pe backend.

**Cum se remediază:**
1. Adaugă în pagina Setări (sau Configurare) câmpuri pentru **Titlu proiect** și **Buget total** care apelează `updateProject({ title })` / `updateProject({ totalBudget })`.
2. Validare client + afișare corectă. Nimic pe backend — doar UI.
3. Verifică apoi că „Buget Rămas"/„Depășire Buget"/procentele din Analiză devin corecte cu un buget real.

---

## Problema 6 — PATCH cu `null`/`undefined` NU poate ȘTERGE câmpuri opționale (nu poți dezactiva placarea)

**Severitate: medie-mare.** Legată de plângerea despre pereți.

**Simptom:** dacă user-ul dezactivează placarea de faianță / finisajul de pereți / șterge suprafața pardoselii dintr-o cameră,
schimbarea NU se persistă — valoarea veche rămâne pe backend.

**Ce e greșit / unde:**
- `frontend/src/app/configurare/RoomTechnicalCard.tsx` — `toggleWallTiling`/`toggleWallFinish` setează `draft.wallTiling = undefined`.
- `frontend/src/shared/store.tsx` — `updateRoom` trimite `draft` ca body PATCH; `undefined` **nu se serializează** în JSON → câmpul lipsește.
- `backend/.../application/usecase/UpdateRoomService.java` — convenția e „câmp `null` = nu se modifică". Deci un câmp absent/`null`
  e interpretat ca „păstrează valoarea veche", NU ca „șterge". Rezultat: nu poți goli niciodată un câmp tehnic opțional prin PATCH.

**Ce e corect:** pentru SETAREA (non-null) a câmpurilor, mecanismul funcționează perfect (verificat live).

**Cum se remediază (decide abordarea cu user-ul; recomandat opțiunea A):**
- **Opțiunea A — semantică de „replace" pe câmpurile tehnice ale camerei:** la editarea configurării tehnice, trimite
  întotdeauna starea completă și tratează `null` explicit ca „șterge". Practic: introdu un flag/serializare care distinge
  „absent" (nu atinge) de „null explicit" (șterge). Cel mai simplu în JSON: trimite mereu cheia cu valoare `null` când user-ul
  a dezactivat (folosește un serializer care NU omite null-urile pentru acest payload), și schimbă `UpdateRoomService` să
  interpreteze prezența cheii. Necesită DTO/आabordare care păstrează diferența (ex. `JsonNullable` / un `Map` brut / câmpuri dedicate).
- **Opțiunea B — endpoint dedicat de configurare tehnică** `PUT /api/rooms/{id}/technical` cu semantică de înlocuire completă
  (toate câmpurile tehnice trimise explicit, null = fără). Mai curat conceptual, dar mai mult cod.
- Documentează alegerea în `api-contract.md`. Adaugă test: dezactivarea wallTiling → GET camera arată `wallTiling: null`.

---

## Problema 7 — La activarea placării, `tileHeight`/`wallHeight` = 0 implicit → arie 0 → „nu se ia în calcul"

**Severitate: medie (UX + contribuie la plângerea despre pereți).**

**Simptom:** user-ul activează placarea și completează lungimile pereților, dar dacă nu completează și **înălțimea** plăcilor
(`tileHeight`) / peretelui (`wallHeight`), aria de faianță/vopsea = `lungime × 0 = 0` → niciun element auto generat → pare că „datele de la pereți nu contează".

**Ce e greșit / unde:**
- `frontend/src/app/configurare/RoomTechnicalCard.tsx` — `toggleWallTiling` (linia ~315) inițializează `tileHeight: 0`;
  `toggleWallFinish` (linia ~336) inițializează `wallHeight: 0`.

**Ce e corect:** lungimile pereților se inițializează dintr-o valoare estimată (√suprafață), deci acelea nu sunt 0.

**Cum se remediază:**
1. Inițializează `tileHeight`/`wallHeight` cu o valoare implicită rezonabilă (ex. 2.5 m pentru înălțimea camerei / placare completă),
   nu 0 — sau marchează câmpul vizibil ca obligatoriu și blochează salvarea/afișează avertisment dacă e 0.
2. În panoul „Calcule Detaliate", când aria = 0 din cauza înălțimii 0, afișează un hint explicit („completează înălțimea plăcilor")
   în loc să afișeze tăcut 0.

---

## Problema 8 — Header-ele/„real-time": funcționează, dar depind de valorile client-side (leagă de Probl. 1, 2, 5)

**Severitate: mică-medie.** User-ul vrea „toate headerele updatate în timp real".

**Simptom / stare reală:** în modul API, header-ele (`DashboardSummaryCard` pe fiecare pagină) SE recalculează la fiecare
mutație (sunt `useMemo` peste `items`/`rooms` din store, care se actualizează după fiecare add/update/delete). Deci real-time
funcționează. **Dar** valorile provin din calcul client-side (Problema 2) și moștenesc bug-urile: moneda neconvertită (Probl. 1)
și bugetul 0 (Probl. 5). Percepția de „nu se updatează corect" vine de acolo, nu dintr-o lipsă de reactivitate.

**Cum se remediază:** rezolvarea Problemelor 1, 2 și 5 face header-ele corecte. Suplimentar, dacă se trece pe `summary`
server-side (Probl. 2), asigură-te că store-ul reîncarcă `summary` după FIECARE mutație (add/update/delete item, update room,
update project), ca toate header-ele din toate paginile să reflecte instant starea reală.

---

## Ordinea recomandată de implementare

1. **Problema 4** (timestamp `createdAt`) — fundație pentru grafice reale; migrare + model + contract.
2. **Problema 5** (buget/titlu editabile) — mic, deblochează toate calculele de buget pe date reale.
3. **Problema 1** (conversie monedă) — endpoint backend + UI.
4. **Problema 6** (ștergere câmpuri prin PATCH) — corectitudinea configurării.
5. **Problema 7** (default înălțimi) — UX rapid, legat de 6.
6. **Problema 2** (de-duplicare via `/summary`) — refactor etapizat, pagină cu pagină.
7. **Problema 3** (grafic evoluție real) — după 4, consumă seria temporală.
8. **Problema 8** — verificare finală că totul e reactiv după 1/2/5.

Fiecare = branch + PR separat (sau grupate logic: 4+3 împreună au sens; 5 singur; 1 singur; 6+7 împreună).
