# Cerințe — O singură sursă de adevăr: Comparator ↔ Configurare

> Status: 🔴 **de implementat**. De citit împreună cu `docs/cerinte-comparator-oferte.md`,
> `docs/api-contract.md` (secțiunile Item + ComparisonGroup) și `CLAUDE.md` (workflow Git, design system).

## Problema

Azi există **două surse de adevăr** pentru același material fizic:

1. `/configurare` generează automat elemente `origin: Din Configurare` (ex. „Parchet Laminat (Pardoseală)",
   23.6 mp, fără preț) prin `AutoItemReconciler`.
2. `/comparator` — la „Alege această ofertă", `ChooseOfferService` creează **un Item NOU**
   (`origin: Din Comparator`) în aceeași cameră.

Rezultat: în `/elemente` apar **două rânduri pentru același parchet** — unul cu cantitatea corectă dar fără
preț (din configurare), unul cu prețul ales dar cu cantitate arbitrară (din comparator). Totalurile se
dublează, iar userul nu știe care rând e „cel adevărat".

## Soluția — decizie de design

**Comparatorul nu mai creează elemente paralele; el COMPLETEAZĂ elementul din configurare.**

Observația cheie care face soluția naturală: `AutoItemReconciler.reconcile()` deja **păstrează**
`id/preț/status/sursă/productUrl/imageUrl` ale elementelor `Din Configurare` și rescrie doar
`name/quantity` la fiecare modificare de cameră. Deci împărțim clar responsabilitățile pe câmpuri:

| Câmp Item (origin Configurare) | Sursa de adevăr | Cine îl scrie |
|---|---|---|
| `name`, `quantity` | măsurătorile camerei | `AutoItemReconciler` (ca azi) |
| `unitPrice`, `source`, `productUrl`, `imageUrl` | oferta aleasă (sau editare manuală) | `choose` / userul (ca azi la edit manual) |
| `status` | userul | neschimbat |

Concret:

1. **La crearea unui grup** (cameră + `materialType`), backend-ul caută elementul `Din Configurare`
   corespunzător din camera respectivă și **leagă grupul de el** (`linkedItemId`). Frontend-ul arată
   userului, live în formular, ce element va fi completat.
2. **La `choose`**, dacă legătura e validă → **PATCH pe elementul existent** (doar câmpurile de preț/sursă/
   link/poză; `origin` rămâne `Din Configurare`, `name`/`quantity`/`status`/`createdAt` neatinse). Reconcilierile
   viitoare ale camerei păstrează prețul (comportament deja existent + testat).
3. **Fallback — OBLIGATORIU, nu caz de eroare**: dacă nu există element din configurare pentru acel
   material în acea cameră → comportamentul de azi, neschimbat: se creează Item nou
   `origin: Din Comparator`. Asta acoperă DOUĂ situații distincte, ambele normale:
   - **categorii care nu vin niciodată din configurator** — `Mobilă`, `Electrocasnice`, `Sanitare`,
     `Corpuri de iluminat`, `Altele` etc. (configuratorul generează doar materiale de construcție:
     pardoseală, plintă, faianță, vopsea, tapet, amorse, adezivi, chit, folie, glaf). Pentru acestea
     comparatorul funcționează exact ca azi, cap-coadă;
   - **materiale configurabile dar neconfigurate** (camera n-are încă pardoseală setată, sau configurarea
     a fost ștearsă între crearea grupului și choose).

   Comparatorul rămâne deci utilizabil pentru ORICE produs. Update-ul în loc de create se întâmplă DOAR
   când verificarea `resolveLinkedItem` găsește efectiv un element `Din Configurare` corespunzător.

### De ce legare la creare + re-validare la choose (nu doar una din ele)

- Doar rezolvare „la choose" → userul nu vede din timp că grupul va actualiza un element existent, și la
  materialele ambigue (două elemente `Amorsă` în aceeași cameră: „Amorsă zugrăveală" + „Amorsă placări")
  alegerea ar fi arbitrară. Legarea la creare permite UI-ului să arate ținta și, la ambiguitate, să lase
  userul să aleagă.
- Doar snapshot la creare → id-ul poate deveni stale (reconcilierea ȘTERGE elementul dacă măsurătoarea
  dispare, iar la reapariție creează altul cu id nou). De aceea la `choose` legătura se **re-validează**:
  dacă `linkedItemId` nu mai există / nu mai e `Din Configurare` / nu mai e în camera grupului, se
  re-rezolvă după `roomId + materialType + origin Configurare`; dacă nici așa nu se găsește → fallback
  (element nou).

### Reguli de rezolvare a legăturii (funcție de domeniu, backend)

`resolveLinkedItem(items, roomId, materialType)`:
- candidați = elementele cu `roomId` identic, `origin == Din Configurare`, `materialType` identic;
- 0 candidați → `null` (fallback la choose, „element nou" în UI);
- 1 candidat → acesta;
- ≥2 candidați (cazul `Amorsă`) → primul după `createdAt` crescător, DAR formularul de grup îi afișează pe
  toți și userul poate alege explicit (vezi FE-2). Valoarea explicită a userului are prioritate.

### Ce se întâmplă cu `quantity` la `choose` pe element legat

**Nu se atinge.** Cantitatea elementului din configurare vine din măsurători (mp/ml/litri) și ar fi oricum
rescrisă la următoarea reconciliere. Câmpul `quantity` din `ChooseOfferRequest` se folosește DOAR pe ramura
fallback (element nou), ca azi. `offer.quantity` rămâne informativ pentru comparația de preț total între oferte.

### Alte decizii

- `createdItemId` de pe grup rămâne (istoric); la update pe element legat primește id-ul elementului
  actualizat (deci poate pointa și spre un item `Din Configurare` — actualizează doc-comment-ul).
- **Re-choose pe grup Decis**: aceeași logică — dacă legătura e validă, suprascrie din nou câmpurile de
  preț/sursă pe același element (nu se creează dubluri). Pe ramura fallback, comportamentul de azi
  (item nou, referințe suprascrise).
- **PATCH pe grup** (schimbare cameră/material, permisă cât e `În analiză`): backend-ul **re-rezolvă**
  `linkedItemId` pentru noua combinație (sau `null`).
- **Ștergerea grupului / a ofertei**: neschimbat, nu atinge elementul (legat sau creat).
- `AutoItemReconciler` NU se modifică. Elementele `Din Comparator` rămân neatinse de reconciliere (test
  existent).

## Tickete (în ordinea implementării)

> Workflow: branch nou `NNN-comparator-config-sync` (verifică următorul număr liber), niciodată push pe
> `main`. Backend: arhitectură hexagonală ca la restul (port/use case/entitate/mapper/DTO). Frontend:
> regulile din CLAUDE.md (enums, funcții pure, loading states, texte RO cu diacritice).

### Backend

- **SYNC-BE-1 — Migrare + model.** `V8__comparator_linked_item.sql`:
  `ALTER TABLE comparison_groups ADD COLUMN linked_item_id VARCHAR(36);` (fără FK — ca `created_item_id`,
  legătura se re-validează la runtime, nu prin constrângeri). `ComparisonGroup` (domeniu + entitate JPA +
  mapper + `ComparisonGroupResponse`) primește `linkedItemId?`. Backfill nu e necesar (grupurile existente
  rămân cu `null`; se pot re-lega prin PATCH).
  *Criteriu:* migrarea rulează local fără erori; `GET .../comparison-groups` include câmpul.

- **SYNC-BE-2 — Rezolvarea legăturii.** Funcție de domeniu `resolveLinkedItem` (regulile de mai sus) —
  în `domain/service`, lângă `AutoItemReconciler`, cu javadoc. Folosită în:
  - `CreateComparisonGroupService`: setează `linkedItemId` la creare (sau valoarea explicită din body dacă
    e trimisă — câmp opțional nou `linkedItemId` în request, validat: trebuie să fie un candidat valid,
    altfel 400);
  - `UpdateComparisonGroupService`: la schimbare de `roomId`/`materialType`, re-rezolvă (o valoare
    explicită în PATCH are prioritate, aceeași validare).
  *Teste:* 0/1/mai mulți candidați; candidat explicit invalid → 400; PATCH de cameră re-rezolvă.

- **SYNC-BE-3 — Choose pe element legat.** `ChooseOfferService`: înainte de a crea item, validează
  legătura (există + `origin Configurare` + camera grupului; altfel re-rezolvă; altfel `null`):
  - **legătură validă** → item-ul existent se salvează cu `source = offer.store ?? source-ul existent`,
    `unitPrice = offer.unitPrice ?? unitPrice-ul existent`, `productUrl = offer.productUrl ?? cel existent`,
    `imageUrl = firstUrlImage(offer) ?? cel existent` (ofertele pot fi parțiale — nu șterge date deja bune
    cu `null`-uri); `name/quantity/status/origin/createdAt/purchasedAt` NEATINSE. `createdItemId` = id-ul lui.
  - **fără legătură** → exact codul de azi (item nou `Din Comparator`).
  Tranzacțional ca acum (item + status + chosenOfferId + createdItemId împreună).
  *Teste:* choose pe grup legat actualizează item-ul (nu apare item nou, count neschimbat); ofertă parțială
  nu golește câmpurile existente; legătură stale (item șters) → re-rezolvare; re-rezolvare eșuată →
  fallback item nou; grup pt. o categorie neconfigurabilă (ex. `Mobilă`) → item nou `Din Comparator`,
  identic cu comportamentul de azi; re-choose suprascrie același element; reconciliere după choose păstrează prețul setat
  (test de integrare `AutoItemReconciler` + choose).

- **SYNC-BE-4 — Contract.** `docs/api-contract.md`: `linkedItemId` pe `ComparisonGroup` (response + POST/PATCH
  body), semantica nouă a lui `choose` (update vs. create) și a lui `createdItemId`. În aceeași sesiune cu
  BE-1..3, nu „mai târziu".

### Frontend

- **SYNC-FE-1 — Tipuri + store.** `ComparisonGroup.linkedItemId?: string` în `shared/types`;
  `addComparisonGroup`/`updateComparisonGroup` acceptă `linkedItemId` opțional; `chooseOffer` reîncarcă
  `items` + `summary` (există deja — verifică doar că acoperă și cazul „update", nu doar „create").

- **SYNC-FE-2 — GroupFormDrawer: ținta legăturii.** La selectarea camerei + categoriei în formularul de
  grup, un panou informativ (sub select-uri, `bg-surface-low`, `rounded-lg`, iconiță `link` — adaugă în
  `ACTION_ICONS` dacă lipsește):
  - un candidat: „La alegerea unei oferte se va completa elementul **«Parchet Laminat (Pardoseală)» —
    23.6 mp** din configurare." + pre-completează numele grupului cu numele elementului (doar dacă userul
    n-a tastat deja unul);
  - mai mulți candidați: select „Ce element din configurare completează acest grup?" cu candidații
    (trimite `linkedItemId` explicit);
  - zero candidați: „Nu există element din configurare pentru această categorie — la alegere se va crea un
    element nou." (text `text-muted`, nu warning — e un caz normal).
  Candidații se calculează client-side dintr-o funcție pură nouă `configuredItemCandidates(items, roomId,
  materialType)` (fișier local paginii `/comparator`; oglindește regula backend; înregistrată în Registrul
  de funcții din `docs/progress.md`).

- **SYNC-FE-3 — ConfirmDialog la choose + detaliu grup.** În dialogul de confirmare „Alege această ofertă":
  dacă grupul are legătură validă (aceeași funcție pură, pe datele din store), textul spune explicit
  „Se va actualiza elementul «X» din configurare cu prețul/magazinul acestei oferte" (fără input de
  cantitate pe această ramură); altfel textul de azi („se va crea un element nou") cu cantitatea. În
  header-ul paginii de detaliu grup, badge/linie discretă cu ținta legăturii (aceeași formulare ca FE-2).

- **SYNC-FE-4 — /elemente: vizibilitate.** Pe rândul unui element `Din Configurare` care e ținta unui grup
  **Decis** (`createdItemId == item.id`), lângă `OriginBadge` un chip discret „Ofertă aleasă" (link spre
  `/comparator/[groupId]`) — userul vede de unde a venit prețul. Funcție pură locală
  `decidedGroupForItem(groups, itemId)`. Nu adăuga coloană nouă — chip lângă badge-ul existent.

- **SYNC-FE-5 — Verificare + docs.** `npm run build && npm run lint && npx tsc --noEmit` (din `frontend/`);
  verificare vizuală desktop + 375px (formular grup cu 0/1/mai mulți candidați, choose pe ambele ramuri,
  chip-ul din /elemente); `docs/progress.md` (jurnal + registru funcții) actualizat.

### Explicit ÎN AFARA scopului (nu improviza)

- Modificarea `AutoItemReconciler` sau a regulilor de generare din configurare.
- Migrarea elementelor `Din Comparator` deja existente în DB (rămân cum sunt; userul le curăță manual).
- Sincronizare inversă (editarea prețului în /elemente NU modifică oferta din grup).
- Legarea unui grup de un element `Manual` sau `Din Comparator` — doar `Din Configurare`.
