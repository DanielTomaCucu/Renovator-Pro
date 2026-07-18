# Tichete — verificare end-to-end (2026-07-18)

> Verificare la nivel de **cod** (static: citire sursă frontend + backend, `tsc --noEmit` curat,
> `eslint` 1 singur warning). NU s-a rulat aplicația live (necesită backend local: docker + Spring Boot).
> Cele 3 probleme prioritare semnalate de user au fost investigate; root-cause-ul e identificat mai jos.
> Fiecare tichet = un branch + un PR (vezi workflow-ul din `CLAUDE.md`). Contract-first pentru orice câmp/endpoint nou.

Stare generală: multe probleme din `docs/audit-remedieri.md` sunt DEJA rezolvate (conversie monedă reală,
titlu/buget editabile, timestamp `createdAt`/`purchasedAt`, `/summary` + `/spending-timeline` server-side,
grafic evoluție pe date reale). Tichetele de mai jos sunt ce a rămas / a apărut.

---

## TICKET-1 (P0) — La Parchet/Mochetă NU se adaugă plinta în calcul

**Semnalat de user:** „când aleg parchet trebuie să îmi adauge și plintă, extra în calcul, nu o face.”

### Simptom
La o cameră configurată cu Parchet (sau Mochetă), panoul „Calcule Detaliate" nu afișează rândul „Plintă",
iar în `/elemente` nu apare elementul auto-generat „Plintă". La Gresie plinta e OK (inclusă în necesarul de gresie).

### Root cause (confirmat)
Plinta depinde de `room.perimeter`:
- `frontend/src/shared/functions/dimensions.ts:69` — `baseboardLength()` returnează **0** dacă `room.perimeter` e absent.
- `frontend/src/app/configurare/roomCalcRows.ts:42` — rândul „Plintă" se afișează doar `if (!isGresie && !!room.perimeter)`.
- `backend/.../domain/service/RoomDimensionsCalculator.java` `baseboardLength()` — identic: 0 fără perimetru.
- `backend/.../domain/service/AutoItemReconciler.java` — elementul „Plintă" se generează doar `if (!isGresie && plinta > 0)`.

**Dar `room.perimeter` nu este setat niciodată din UI.** În `RoomTechnicalCard.tsx`:
- Nu există niciun input legat de `perimeter` (grep confirmă: `perimeter` apare doar la citire + pass-through
  `perimeter: draft.perimeter ?? null` la linia ~331).
- Lungimile pereților introduse de user trăiesc în `draft.wallTiling.wallLengths` / `draft.wallFinish.wallLengths`
  (via `RoomShapeWallsEditor`), și **nu sunt niciodată agregate în `perimeter`**.
- Singurul input de dimensiune mereu prezent e „Suprafață (MP)" (`floorArea`).

Deci pentru orice cameră nou-configurată (parchet/mochetă), `perimeter` rămâne `undefined` → `baseboardLength = 0`
→ fără plintă. (La Gresie plinta e derivată din `baseboardTileArea` care depinde de `baseboardHeight`, nu de acest flux, de-aia „merge" acolo.)

### Cum se remediază
Trebuie ca `perimeter` să fie populat. Recomandare (decide varianta cu user-ul):

- **Opțiunea A (recomandată) — derivă `perimeter` automat, fără input nou:**
  când user-ul editează forma/lungimile camerei (`RoomShapeWallsEditor` → `onChangeLengths`), calculează
  `perimeter = suma celor 4 laturi` și include-l în `patch({ perimeter })`. Când NU există lungimi de perete
  (user-ul n-a activat placare/finisaj), derivă un perimetru estimat din suprafață presupunând camera pătrată:
  `perimeter = 4 × √floorArea` (există deja `estimatedSquareWallSide` = `√floorArea` în `dimensions.ts`).
  Scrie o funcție pură `roomPerimeter(room)` în `shared/functions/dimensions.ts` (+ portul Java corespunzător
  în `RoomDimensionsCalculator`) și folosește-o consistent. Astfel plinta apare imediat ce e completată suprafața.
- **Opțiunea B — input explicit „Perimetru (ml)"** în secțiunea Pardoseală din `RoomTechnicalCard`, legat prin
  `patch({ perimeter })`. Mai mult control pentru user, dar un câmp în plus de completat; combină eventual cu un
  default pre-populat din opțiunea A.

**Atenție la simetria backend:** dacă perimetrul e derivat client-side și trimis prin PATCH, backend-ul îl
persistă ca atare. Dacă vrei ca backend-ul să fie sursa de adevăr, derivă-l tot server-side în `AddRoomService`/
`UpdateRoomService` din lungimi/suprafață. Nu duplica regula: definește-o o dată (funcție pură) și
ține-o identică TS ↔ Java (vezi Regula #2 din `CLAUDE.md`).

**Verificare (obligatorie, live):** cameră nouă → Parchet + Suprafață 12 mp (fără altceva) → „Calcule Detaliate"
trebuie să arate rândul „Plintă" cu `≈ 4×√12 × 1.05 ml`, iar în `/elemente` să apară elementul auto „Plintă"
(materialType `PLINTA`). Adaugă și un test în `AutoItemReconcilerTest` pentru cazul Parchet cu perimetru > 0.

---

## TICKET-2 (P0) — Login eșuează pentru username-uri cu litere mari (mismatch de normalizare)

**Semnalat de user:** erori la logare.

### Simptom
Un user care s-a înregistrat cu „Daniel" (sau orice username cu majuscule) NU se mai poate loga tastând
exact la fel — primește „Date de autentificare invalide" (401), deși parola e corectă.

### Root cause (confirmat)
- `backend/.../application/usecase/RegisterUserService.java` — la register username-ul e normalizat:
  `command.username().trim().toLowerCase(Locale.ROOT)` → în DB se salvează lowercase.
- `backend/.../application/usecase/LoginService.java` — la login se caută cu **doar** `command.username().trim()`
  (FĂRĂ `.toLowerCase()`). Deci „Daniel" ≠ „daniel" din DB → `InvalidCredentialsException`.

### Cum se remediază
În `LoginService.execute`, normalizează username-ul identic cu register-ul înainte de `findByUsername`:
`command.username().trim().toLowerCase(Locale.ROOT)`. Ideal, extrage normalizarea într-un singur loc
(ex. o metodă/VO `Username.normalize`) folosit de AMBELE use case-uri ca să nu mai poată diverge.

**Verificare:** test de integrare — register cu „TestUser" apoi login cu „TestUser", „testuser", „TESTUSER"
trebuie toate să reușească. Adaugă-l în suita de auth existentă.

---

## TICKET-3 (P1) — Mesaj „Payload invalid" opac la login/register (fieldErrors ignorate)

**Semnalat de user:** „la logare am mai avut niște erori cu «payload error», sau ceva de genul.”

### Simptom
La o eroare de validare (ex. username sub 3 caractere, caractere nepermise, parolă sub 8), UI-ul afișează
textul generic „Payload invalid", fără să spună CE câmp e greșit sau de ce.

### Root cause (confirmat)
- `backend/.../adapter/in/web/GlobalExceptionHandler.java` — `handleValidation` întoarce
  `ProblemDetail(detail = "Payload invalid")` și pune detaliile per-câmp în proprietatea `fieldErrors`.
- `frontend/src/shared/api-client.ts` — `authFetch`/`apiFetch` citesc DOAR `problem?.detail` („Payload invalid")
  și **ignoră `fieldErrors`**. Deci userul vede mesajul generic, niciodată motivul concret.

### Cum se remediază
1. Frontend: în `api-client.ts`, când răspunsul de eroare are `fieldErrors`, compune un mesaj lizibil din ele
   (ex. concatenează valorile) în loc să afișeze doar `detail`. Alternativ, propagă `fieldErrors` până la
   formularele `/login` + `/register` ca să le afișeze sub câmpul respectiv.
2. Opțional backend: pune un `detail` mai util decât „Payload invalid" (ex. primul mesaj de câmp) ca fallback.

**Notă:** nu confunda acest tichet cu TICKET-2. „Payload invalid" (400) = validare de shape;
mismatch-ul de case (TICKET-2) dă „Date de autentificare invalide" (401). Ambele contribuie la percepția
de „erori la logare". Rezolvă-le pe amândouă.

---

## TICKET-4 (P1) — Grafice „în timp real": verificare live + semantica datelor

**Semnalat de user:** „graficele nu se încarcă în timp real după ce fac/adaug elemente în pagini, ar trebui să fie instant.”

### Ce am găsit la nivel de cod (reactivitatea PARE corectă)
- `frontend/src/shared/store.tsx` — `StoreProvider` reîncarcă `summary` + `spendingTimeline` (`reloadAggregates`)
  după FIECARE mutație (add/update/delete item, update room/project). `StoreProvider` stă în `AppShell`
  (persistă între navigări), deci `/analiza` reflectă starea curentă.
- `frontend/src/app/analiza/page.tsx` — graficele consumă `summary.costPerRoom` și `spendingTimeline` din store
  (nu date hardcodate). Deci, în teorie, se actualizează.

### Cauze PROBABILE ale percepției „nu se actualizează" (de investigat live)
1. **Elementele auto din configurare au preț 0.** Donut-ul „Cost per Cameră" folosește `totalEstimated`
   (`cantitate × preț`). Un element auto (plintă, gresie etc.) are `unitPrice = 0` până când userul îi pune preț
   în `/elemente` → contribuție 0 → donut-ul „nu se mișcă" când doar configurezi camere. **De confirmat dacă
   asta e ce vede userul.** Fix posibil: empty-state/hint clar („adaugă prețuri ca să vezi distribuția").
2. **Graficul „Evoluția Cheltuielilor" numără doar `Cumpărat`** (grupat pe `purchasedAt`). Adăugarea unui
   element `În așteptare` NU schimbă graficul — corect logic, dar poate părea „nu se încarcă". Empty-state-ul
   există deja când nu e nimic cumpărat; verifică că e clar.
3. **Latență (nu «instant»).** Fiecare mutație face un round-trip de rețea în `reloadAggregates` înainte ca
   graficele să se updateze; pe cold-start Render poate dura secunde. Dacă „instant" e cerința fermă, ia în
   calcul update optimist al agregărilor sau un skeleton/spinner pe carduri în timpul reîncărcării.

### De făcut
- **Rulează live** (backend local: `cd backend && docker compose up -d && mvn spring-boot:run -Dspring-boot.run.profiles=dev`;
  frontend: `cd frontend && npm run dev -- --port 3001`) și reproduce exact scenariul userului: adaugă un element
  CU preț în `/elemente`, apoi treci pe `/analiza` — confirmă dacă donut-ul se actualizează sau nu.
- Dacă se actualizează corect → problema e de percepție (punctele 1/2): adaugă hint-uri/empty-states și
  clarifică userului. Dacă NU se actualizează → e un bug de reactivitate real; capturează request-urile de rețea
  (`/summary`, `/spending-timeline`) și starea store-ului și deschide un tichet de fix cu dovada.

---

## Observații secundare (nu prioritare, de confirmat)

- **S-1** `frontend/src/app/elemente/page.tsx:604` — `<img>` brut (warning ESLint `no-img-element`);
  singurul lint warning din proiect. Cosmetic/perf, nu funcțional.
- **S-2** `frontend/src/app/setari/page.tsx` — istoricul cursului valutar (`EXCHANGE_RATE_HISTORY`) e hardcodat
  decorativ. Nu e bug (conversia reală funcționează), dar afișează date false; de eliminat sau de alimentat real.
- **S-3** Recomandare de regresie: după TICKET-1, verifică că export-ul PDF (`ApartmentPdfDocument.tsx`, care
  afișează „Perimetru" din `room.perimeter`) arată acum valoarea derivată corect.
</content>
</invoke>
