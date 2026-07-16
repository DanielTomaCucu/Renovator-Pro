# Cerințe — Loading states (ecran de pagină + butoane)

> **Rol document:** specificație de implementare, destinată modelului care scrie codul. Fiecare task are
> **Scop**, **Fișiere**, **Pași** și **Definition of Done**. Citește-l integral înainte de a scrie prima linie.
>
> **Reguli obligatorii** (din `CLAUDE.md`):
> - Un task = un branch = un PR. Niciun push direct pe `main`. Branch: `NNN-loading-states` (următorul număr liber).
> - Toate comenzile npm se rulează din `frontend/`.
> - Zero duplicare: componenta de spinner și hook-ul de pending se scriu **o singură dată** și se refolosesc.
> - Culori doar prin tokens (`bg-primary`, `text-muted`…), niciodată hex hardcodat.
> - Texte UI în română, cu diacritice.
> - `npm run build`, `npm run lint`, `npx tsc --noEmit` trebuie să treacă înainte de a considera task-ul gata.

---

## De ce facem asta

Backend-ul rulează pe Render plan free: **cold-start de zeci de secunde** după ~15 min de inactivitate, plus
latență normală de rețea. Astăzi, în ambele situații critice, aplicația pare blocată:

1. **La încărcarea inițială** — `StoreProvider` afișează un spinner care acoperă tot ecranul (inclusiv sidebar-ul).
   Utilizatorul nu vede nici măcar structura aplicației.
2. **La orice acțiune** (salvare element, ștergere cameră, conversie monedă) — butonul nu dă niciun semn că
   requestul e în curs. Utilizatorul apasă din nou, crezând că nu s-a înregistrat click-ul → request duplicat.

---

## Decizii luate — NU se re-deschid

| Decizie | Alegere | Justificare |
|---|---|---|
| Tip de loading pentru pagină | **Skeleton**, nu spinner | Păstrează structura paginii → saltul vizual la sosirea datelor e mic. Sidebar-ul real rămâne vizibil dedesubt. |
| Câte skeleton-uri | **UNUL singur**, comun tuturor paginilor | Store-ul e global: datele se încarcă **o singură dată** (primul mount / refresh), nu la fiecare navigare. Un skeleton per pagină = 4 componente de întreținut pentru un ecran care apare o dată. Toate cele 4 pagini au aceeași structură de sus (header + card sumar + conținut). |
| Titlul în skeleton | Bloc „pulse", **nu** titlul real | Sidebar-ul rămâne vizibil și evidențiază ruta activă — utilizatorul știe deja pe ce pagină e. Evită refactorul mapării rută→titlu. |
| Loading pe butoane | **Spinner inline**, în stânga textului | Cerință explicită a userului. |
| Buton care are deja iconiță la stânga | Spinner-ul **ÎNLOCUIEȘTE iconița** (aceeași poziție/mărime) | Zero layout shift — butonul nu-și schimbă lățimea când începe requestul. |
| Care butoane primesc spinner | **DOAR cele care declanșează un request HTTP** | Un buton care doar deschide un drawer sau comută un filtru e instant — un spinner acolo ar fi zgomot. Lista exactă: „Inventar butoane" mai jos. |
| Arhitectura store-ului | **Rămâne globală**, gating-ul rămâne în `StoreProvider` | Contractul actual garantează `project: Project` (ne-null) tuturor paginilor. A-l face nullable = refactor în toate cele 4 pagini, în afara scopului. |

---

## Task 1 — Infrastructură (se face PRIMUL, restul depinde de el)

### 1.1 Tipurile mutațiilor devin `Promise<void>`

**Problemă:** în `src/shared/types/RenovationStore.ts` toate mutațiile sunt tipate `=> void`, deși
implementarea din `store.tsx` e `async` (returnează `Promise<void>`). Tipul minte — un `await updateProject(...)`
compilează, dar TypeScript nu garantează nimic, iar butoanele nu pot ști când s-a terminat requestul.

**Fișier:** `src/shared/types/RenovationStore.ts`

**Pași:** schimbă semnătura fiecărei mutații din `=> void` în `=> Promise<void>`:
`updateProject`, `convertCurrency`, `addRoom`, `updateRoom`, `deleteRoom`, `addItem`, `updateItem`, `deleteItem`.
`dismissError` rămâne `=> void` (e sincron, nu face request).

**DoD:** `npx tsc --noEmit` trece; implementările din `store.tsx` sunt deja `async`, deci nu necesită schimbări acolo.

### 1.2 Componentă nouă `Spinner`

**Scop:** un singur spinner, folosit ȘI în butoane (pe fundal negru/albastru, text alb) ȘI în skeleton/ecrane de
încărcare (pe fundal alb). Refolosit în ≥2 locuri → merge în `src/components/` (regula din `CLAUDE.md`).

**Fișier nou:** `src/components/Spinner.tsx`

**Pași:**
- Props: `size?: "sm" | "md"` (implicit `"sm"`), `className?: string`.
- `sm` = 14px (`h-3.5 w-3.5`) — se aliniază cu textul `text-sm` din butoane. `md` = 20px (`h-5 w-5`).
- **Culoarea se moștenește din text, nu se hardcodează:** folosește `border-current border-t-transparent`
  (cerc din culoarea curentă, cu un sfert transparent → efectul de rotire). Așa același component merge
  pe buton negru (text alb → spinner alb) și pe fundal alb (text primary → spinner negru), fără prop de culoare.
- `animate-spin rounded-full border-2`.
- `aria-hidden="true"` — spinner-ul e pur decorativ; starea reală se comunică prin `aria-busy` pe buton (vezi 1.3).

**DoD:** componenta se randează corect pe fundal întunecat și deschis (verifică vizual în ambele situații).

### 1.3 Hook nou `useAsyncAction`

**Scop:** un singur loc care ține evidența „requestul e în curs", ca fiecare buton să nu-și inventeze propriul
`useState`. Precedent de locație: `src/shared/useLockBodyScroll.ts`.

**Fișier nou:** `src/shared/useAsyncAction.ts`

**Pași:**
- Semnătură: primește o funcție (sincronă sau async), întoarce `{ run, pending }`.
  ```ts
  export function useAsyncAction<TArgs extends unknown[]>(
    action: (...args: TArgs) => Promise<void> | void
  ): { run: (...args: TArgs) => Promise<void>; pending: boolean }
  ```
- `run` setează `pending = true`, execută (`await`) acțiunea, apoi `pending = false` **într-un `finally`**
  (altfel o eroare lasă butonul blocat pe vecie).
- **Apel re-entrant ignorat:** dacă `pending` e deja `true`, `run` returnează imediat fără să execute — plasă de
  siguranță contra dublului click, pe lângă `disabled` de pe buton.
- **Guard de unmount:** unele componente se demontează exact la finalul acțiunii (`ConfirmDialog` face
  `if (!open) return null`, iar `onConfirm` îl închide) → `setPending(false)` pe o componentă demontată dă warning
  React. Ține un `useRef` de „montat" (setat pe `false` în cleanup-ul unui `useEffect`) și sari peste `setPending`
  dacă nu mai e montat.
- Store-ul **NU aruncă** erori (le prinde intern și le pune în `error`, afișat ca toast global) — deci `run` nu are
  nevoie de `try/catch` propriu pentru afișare, doar de `finally` pentru resetarea lui `pending`.
- Comentariu de o linie deasupra, ca la orice funcție (regula de aur #2 din `CLAUDE.md`).

**DoD:** hook-ul e folosit de cel puțin 2 componente diferite; adaugă un rând în „Registru de funcții" din
`docs/progress.md` (nume, ce face, unde e folosit).

---

## Task 2 — Loading la nivel de pagină

### 2.1 Sidebar-ul iese din `StoreProvider`

**Problemă:** în `src/app/layout.tsx`, `<StoreProvider>` înfășoară și `<Sidebar />`. Cât timp datele se încarcă,
`StoreProvider` returnează spinner-ul în locul întregului arbore → **sidebar-ul dispare**, ecranul e aproape gol.

**Verificat deja:** `Sidebar.tsx` **nu** folosește `useStore()` (nici `PageHeader.tsx`) — deci mutarea e sigură.

**Fișier:** `src/app/layout.tsx`

**Pași:** restructurează astfel încât shell-ul (`<div class="flex...">` + `<Sidebar />`) să fie **în afara**
`StoreProvider`, iar `StoreProvider` să înfășoare doar `{children}` din `<main>`. Rezultat: sidebar-ul rămâne
vizibil și funcțional (navigarea merge) în timp ce conținutul se încarcă.

**DoD:** cu backend-ul oprit sau lent, sidebar-ul e vizibil și se poate naviga; doar zona de conținut arată skeleton.

### 2.2 Componentă nouă `PageSkeleton`

**Fișier nou:** `src/components/PageSkeleton.tsx`

**Pași:**
- Imită structura comună tuturor paginilor: bară de header (bloc pulse pentru titlu), un card mare întunecat
  (echivalentul `DashboardSummaryCard`) cu 4 blocuri pulse pentru metrici, apoi 2–3 blocuri de conținut.
- Folosește `animate-pulse` + `bg-line`/`bg-surface-low` (tokens, nu hex).
- Respectă `max-w`-ul și padding-ul paginilor reale (`mx-auto max-w-7xl px-6 py-6 lg:px-10`) ca skeleton-ul să
  ocupe aceeași zonă ca și conținutul care urmează.
- `role="status"` + `aria-label="Se încarcă datele proiectului"` pe containerul rădăcină.

**Fișier modificat:** `src/shared/store.tsx` — înlocuiește spinner-ul full-screen actual
(`if (!value) return <div class="flex min-h-screen...">`) cu `<PageSkeleton />`.
Ecranul de eroare (`if (initialLoadError)`) rămâne, dar acum se randează în zona de conținut (sidebar-ul e vizibil
lângă el) — verifică vizual că arată bine în noul context, nu centrat pe tot ecranul.

**DoD:** la refresh cu backend lent, se vede: sidebar real + skeleton în zona de conținut. La sosirea datelor,
skeleton-ul e înlocuit fără salt vizual major.

---

## Task 3 — Loading pe butoane

**Regula, aplicată identic peste tot:**
1. Cât timp requestul e în curs: `disabled={pending}` + `aria-busy={pending}`.
2. Butonul **cu iconiță la stânga** → `{pending ? <Spinner /> : <span className="material-symbols-outlined …">…</span>}`
   (spinner-ul ia exact locul iconiței).
3. Butonul **fără iconiță** → spinner-ul apare la stânga textului; butonul primește `inline-flex items-center gap-2`
   dacă nu le are deja.
4. Stilul de disabled: `disabled:opacity-50 disabled:cursor-not-allowed` (aliniat cu `PrimaryButton`, care are deja
   `disabled:opacity-50`).
5. **Textul butonului NU se schimbă** cât timp e pending (rămâne „Salvează", nu devine „Se salvează…") —
   excepție: `Export PDF` din `/configurare`, care are deja textul „Se generează…" și îl păstrează.
6. Acțiunile care închid ceva (drawer, dialog, card) se închid **DOAR după** ce requestul s-a terminate — vezi
   cazurile de mai jos. Astăzi se închid instant, înainte de răspuns.

### 3.1 `PrimaryButton` — butoanele de submit din drawere

**Fișier:** `src/components/forms.tsx`

**Pași:** adaugă prop `pending?: boolean`. Când e `true`: randează `<Spinner />` înaintea lui `{children}`,
setează `disabled` (combinat cu `props.disabled` existent) și `aria-busy`. Butonul e `w-full` → nu există risc de
layout shift, dar adaugă `inline-flex items-center justify-center gap-2` pentru poziționarea spinner-ului.

**Consumatori de actualizat:**

- **`src/components/ItemFormDrawer.tsx`** (buton la ~linia 182: „Salvează Modificările" / „Adaugă Element").
  `submit()` apelează `updateItem`/`addItem` apoi `onClose()` **fără await** (~liniile 68–70) → drawerul se
  închide instant. Fă `submit` async, `await` mutația, apoi `onClose()`. Împachetează în `useAsyncAction` și
  pasează `pending` la `PrimaryButton`.
- **`src/components/RoomFormDrawer.tsx`** (buton la ~linia 101: „Salvează Camera"). Aceeași problemă la
  ~linia 49: `addRoom(...)` apoi `onClose()` fără await. Aceeași soluție.

### 3.2 `ConfirmDialog` — butonul „Șterge"

**Fișier:** `src/components/ConfirmDialog.tsx`

**Problemă:** `onConfirm: () => void`, iar dialogul nu știe când s-a terminat ștergerea. Ambii consumatori
(`elemente/page.tsx` ~liniile 710–711 → `deleteRoom`/`deleteItem`; `RoomTechnicalCard.tsx` ~linia 1057 →
`deleteRoom`) închid dialogul instant.

**Pași:**
- Schimbă tipul: `onConfirm: () => Promise<void> | void`.
- Dialogul ține pending-ul **intern**, prin `useAsyncAction` (consumatorii nu trebuie să-l gestioneze fiecare).
- Butonul „Șterge" (fără iconiță): spinner la stânga textului + `disabled` + `aria-busy`.
- Butonul „Anulează": `disabled` cât timp ștergerea e în curs (altfel utilizatorul închide dialogul peste un
  request în zbor).
- Click-ul pe overlay (`onClick={onCancel}`) se ignoră cât timp e pending — din același motiv.
- Dialogul se închide după ce `onConfirm` s-a rezolvat. Atenție: consumatorii apelează deja `setDeleteTarget(null)`
  în `onConfirm` — verifică fluxul real, ca dialogul să nu dispară înainte de terminarea requestului.

### 3.3 `/elemente` — „Adăugare Rapidă"

**Fișier:** `src/app/elemente/page.tsx`

- **Buton desktop, ~linia 217** (`type="submit"`, are iconiță `ACTION_ICONS.save` cu clasa `icon-btn`, text
  „Salvează") → spinner-ul înlocuiește iconița.
- **Buton mobil, ~linia 525** (`type="submit"`, text „Salvează Articol", **fără** iconiță) → spinner la stânga
  textului.
- Ambele trimit același `quickAdd` (~linia 66) → `addItem`. Fă `quickAdd` async + `useAsyncAction`; golirea
  formularului (`setQaName("")` etc.) se face **după** `await`, nu înainte.
- Un singur `pending` pentru ambele butoane e corect (nu pot fi apăsate simultan — unul e `md:hidden`, celălalt
  `hidden md:flex`).

### 3.4 `/configurare` — `RoomTechnicalCard`

**Fișier:** `src/app/configurare/RoomTechnicalCard.tsx`

- **Buton „Salvează", ~linia 1043** (fără iconiță) → spinner la stânga textului.
- `handleSave` (~linia 293) apelează `updateRoom(...)` apoi imediat `setOpen(false)`, `setSectionsOpen({...})`,
  `setSaved(true)` — toate **înainte** ca serverul să răspundă. Fă-l async: `await updateRoom(...)`, apoi
  închiderea + `setSaved(true)`.
- Fiecare card are propriul `useAsyncAction` (instanță separată per cameră) → salvarea unei camere nu blochează
  butonul altei camere.
- Ștergerea camerei (~linia 1057) merge prin `ConfirmDialog` → acoperită de 3.2, nimic de făcut în plus aici.

### 3.5 `/setari`

**Fișier:** `src/app/setari/page.tsx`

- **„Salvează Detaliile", ~linia 153** (iconiță `ACTION_ICONS.save`, `text-[18px]`) → spinner-ul înlocuiește iconița.
- **„Convertește și Salvează" / „Salvează Setările", ~linia 241** (aceeași iconiță) → idem.
- `handleSaveDetails` și `handleSave` fac deja `await` pe mutații — trebuie doar împachetate în `useAsyncAction`
  și legat `pending` la butoane. Mesajele „Salvat ✓" / „Conversie aplicată ✓" apar deja după `await` (corect,
  nu le strica).
- Atenție la ramura din `handleSave` unde `conversionNeeded === false`: nu face niciun request, deci nu trebuie
  să arate spinner — rămâne instant.

### 3.6 `Export PDF` din `/configurare` — aliniere la noul pattern

**Fișier:** `src/app/configurare/page.tsx` (~liniile 115–125)

Butonul are **deja** un pattern propriu de pending (`exportingPdf`, `disabled`, text „Se generează…"), dar în loc de
spinner schimbă iconița cu `TECHNICAL_ICONS.calculatedResults` (o iconiță statică — nu comunică „în curs").

**Pași:** înlocuiește iconița-de-pending cu `<Spinner />`; păstrează textul „Se generează…" și logica existentă
(`exportingPdf` rămâne, e stare locală de generare PDF, nu request HTTP — **nu** o converti la `useAsyncAction`).
Scopul e strict consistența vizuală.

---

## Inventar complet — butoanele care primesc spinner

| Fișier | ~Linie | Buton | Declanșează | Iconiță la stânga? |
|---|---|---|---|---|
| `app/elemente/page.tsx` | 217 | „Salvează" (Adăugare Rapidă, desktop) | `addItem` | da → spinner o înlocuiește |
| `app/elemente/page.tsx` | 525 | „Salvează Articol" (Adăugare Rapidă, mobil) | `addItem` | nu → spinner la stânga textului |
| `app/configurare/RoomTechnicalCard.tsx` | 1043 | „Salvează" (card cameră) | `updateRoom` | nu |
| `app/setari/page.tsx` | 153 | „Salvează Detaliile" | `updateProject` | da |
| `app/setari/page.tsx` | 241 | „Convertește și Salvează" | `convertCurrency` | da |
| `components/ItemFormDrawer.tsx` | 182 | „Salvează Modificările" / „Adaugă Element" | `updateItem` / `addItem` | nu (`PrimaryButton`) |
| `components/RoomFormDrawer.tsx` | 101 | „Salvează Camera" | `addRoom` | nu (`PrimaryButton`) |
| `components/ConfirmDialog.tsx` | ~36 | „Șterge" | `deleteRoom` / `deleteItem` (via consumatori) | nu |
| `app/configurare/page.tsx` | 116 | „Export PDF" | generare PDF locală (nu request) | da — doar aliniere vizuală (3.6) |

**Liniile sunt orientative** (se pot deplasa) — identifică butonul după handler/text, nu după număr.

## Butoane care NU se ating (nu fac request)

Deschid drawere (`+ Adaugă Cameră`, `Adaugă`, `Editează`), comută secțiuni/filtre (`toggleRoom`,
`toggleMobileRoom`, filtre mobile), colapsează sidebar-ul, șterg poza din formular (`setQaImage(undefined)`),
închid modale (`Anulează`, `Închide`), sau apelează `window.print()` (`/analiza` ~linia 102, `/centralizator`
~liniile 306 și 450 — `print()` e sincron). **Toate rămân neschimbate.**

---

## Observații găsite la inventariere (raportate, NU în scopul acestui task)

Nu le rezolva aici — sunt task-uri separate. Semnalează-le în descrierea PR-ului:

1. **`app/configurare/page.tsx` ~linia 107** — inputul „Suprafață Totală Apartament" apelează `updateProject`
   direct în `onChange`, adică **un request PATCH la fiecare tastă apăsată**. Cu backend lent = zeci de requesturi
   în zbor și UI care pare blocat. Necesită debounce (sau salvare la `onBlur`) — task separat, dar relevant pentru
   percepția de „backend slow".
2. **`app/centralizator/page.tsx` ~linia 315** — buton („PDF") **fără `onClick`** — nu face nimic la click.

---

## Verificare — DoD global

Backend-ul local e rapid, deci loading state-urile nu se văd fără lentoare artificială.

**Cum verifici (obligatoriu — nu doar `tsc`):**
1. Adaugă **temporar** un delay în `src/shared/api-client.ts`, în `apiFetch`, înainte de `fetch`:
   `await new Promise((r) => setTimeout(r, 2000));`
2. Pornește backend-ul (`cd backend && docker compose up -d && mvn spring-boot:run -Dspring-boot.run.profiles=dev`)
   și frontend-ul (`cd frontend && npm run dev -- --port 3001`).
3. Verifică **fiecare** dintre punctele de mai jos, în browser:
   - Refresh pe `/analiza` → sidebar vizibil + skeleton în zona de conținut → apoi datele reale.
   - Adăugare rapidă element (desktop **și** mobil la 375px) → spinner în buton, buton disabled, formularul se
     golește doar după răspuns.
   - Salvare din `ItemFormDrawer` și `RoomFormDrawer` → spinner în `PrimaryButton`, drawerul se închide **după** răspuns.
   - Ștergere element și ștergere cameră → spinner în „Șterge", „Anulează" disabled, dialogul se închide după răspuns.
   - Salvare card cameră în `/configurare` → spinner, cardul se închide după răspuns.
   - `/setari`: „Salvează Detaliile" și „Convertește și Salvează" → spinner, „Salvat ✓" apare după răspuns.
   - Oprește backend-ul → refresh → ecran de eroare cu „Reîncearcă", cu sidebar-ul vizibil.
4. **ȘTERGE delay-ul temporar** din `api-client.ts` înainte de commit. Verifică cu
   `grep -rn "setTimeout" src/shared/api-client.ts` → 0 rezultate.
5. `npm run build`, `npm run lint`, `npx tsc --noEmit` → 0 erori (1 warning preexistent `no-img-element` e OK).
6. Zero erori în consola browserului — **în special** warning-uri React de tip „state update on unmounted
   component" (dacă apar, guard-ul de unmount din 1.3 e greșit).

**Documentație de actualizat în același PR** (regula „Documentație vie" din `CLAUDE.md`):
- `docs/progress.md` — intrare nouă în jurnal + rând nou în „Registru de funcții" pentru `useAsyncAction`.
- `CLAUDE.md` — secțiune scurtă în design system: „Loading states — orice buton care declanșează un request
  folosește `useAsyncAction` + `<Spinner />`; nu inventa `useState` local de pending".
