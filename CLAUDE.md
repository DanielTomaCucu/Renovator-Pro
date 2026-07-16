# Renovator Pro — Planificator Buget Renovare

@AGENTS.md

> ⚠️ **Next.js 16** — versiune cu breaking changes față de datele de antrenament. Citește ghidul relevant din `node_modules/next/dist/docs/` înainte de a scrie cod nou.

## Despre proiect

Aplicație web de **management al bugetului pentru renovări de locuințe** (proprietari, contractori, arhitecți). UI-ul este implementat după design-urile generate în **Google Stitch** (proiect Stitch: `projects/14594146001803528847`, titlu "Planificator Buget Renovare"). Când e nevoie de referință vizuală, ecranele se pot prelua prin MCP-ul `stitch` (`get_screen` → screenshot + HTML).

**Stadiu actual:** monorepo `frontend/` (Next.js, conectat la backend-ul real prin `store.tsx` — vezi `docs/backend-blueprint.md`) + `backend/` (Spring Boot + PostgreSQL, arhitectură hexagonală, Faza 6 finalizată; Faza 5 auth amânată intenționat, `currentUserId` rămâne stub). Urmează și o aplicație mobilă Flutter (proiect separat).

## Monorepo — unde stă ce

- **`frontend/`** — tot codul Next.js (`src/`, `public/`, `package.json`, config-uri). Comenzile npm se rulează din `frontend/`, nu din rădăcină.
- **`backend/`** — aplicația Spring Boot (creată în Faza 1 din blueprint; încă inexistentă).
- **`docs/`**, **`CLAUDE.md`**, **`AGENTS.md`**, **`README.md`** — rămân la rădăcină (documentație și convenții comune).

## Stack & comenzi

- Next.js 16 (App Router, `frontend/src/`), React 19, TypeScript, Tailwind CSS 4
- **Toate comenzile de mai jos se rulează din `frontend/`** (`cd frontend` întâi).
- `npm run dev -- --port 3001` — server dev. **Atenție: portul 3000 e ocupat de alt proiect al userului; folosește portul 3001** (configurația `renovator-web` din `~/.claude/launch.json`, cu `--prefix .../frontend`).
- `npm run build`, `npm run lint`, `npx tsc --noEmit` — rulează-le pe toate trei înainte să consideri o schimbare încheiată.

## Workflow Git — OBLIGATORIU

**Niciodată push direct pe `main`.** Orice schimbare de cod trece printr-un branch dedicat, ca userul să
poată face review înainte de merge.

1. Înainte de orice modificare de cod: `git checkout -b NNN-nume-scurt-descriptiv` (branch nou din `main` la zi).
   - `NNN` = număr secvențial (verifică branch-urile/PR-urile anterioare pentru următorul număr liber).
   - `nume-scurt-descriptiv` = kebab-case, spune ce face schimbarea (ex: `003-shared-structure-and-enums`).
2. Commit-uri pe branch-ul respectiv, cu mesaje clare (vezi convențiile din `git log`).
3. `git push -u origin NNN-nume-scurt-descriptiv` — push pe branch, NU pe `main`.
4. Anunță userul că branch-ul e gata de review (eventual deschide PR cu `gh pr create` dacă ți se cere explicit).
5. Userul face merge după review — nu face tu merge/push pe `main` decât dacă ți se cere explicit.

## Structură

> Toate căile de mai jos sunt relative la **`frontend/`** (ex. `frontend/src/shared/...`). Importurile `@/` rămân neschimbate (aliasul pointează în `frontend/src/`).

```
frontend/src/
  shared/                — TOT ce e reutilizat în ≥2 pagini/componente. Nimic „local" nu stă aici.
    types/                — modelul de date. UN FIȘIER PER INTERFAȚĂ/ENUM (vezi regula dedicată mai jos).
      RoomType.ts, ItemStatus.ts, MaterialType.ts, Currency.ts   — enums
      Room.ts, Item.ts, Project.ts, RenovationStore.ts, DonutSegment.ts   — interfețe
      index.ts            — barrel de re-export; importă din „@/shared/types", nu din fișierele individuale
    functions/            — logica de business partajată, împărțită pe domeniu (nu un fișier gigant)
      money.ts, items.ts, budget.ts, charts.ts, index.ts
    store.tsx             — StoreProvider (React context, DOAR CRUD + `summary`, fără calcule); conectat exclusiv la backend real via api-client.ts. Expune `summary` (agregările server-side), reîncărcat după fiecare mutație
    api-client.ts          — fetch wrapper spre backend (NEXT_PUBLIC_API_URL) + DEFAULT_PROJECT_ID
    icons.ts              — mapare centralizată nume-Material-Symbol (vezi secțiunea Iconițe)
  components/             — componente UI reutilizate în ≥2 pagini (Sidebar, StatCard, StatusChip, Drawer, ItemFormDrawer, RoomFormDrawer, ConfirmDialog, forms)
  app/
    elemente/             — Elemente de Cumpărat (pagina principală)
      page.tsx
      DeleteTarget.ts, ItemDrawerState.ts   — tipuri LOCALE acestei pagini (nu sunt reutilizate în altă parte)
    centralizator/        — Tabel Centralizator Costuri
    analiza/              — Analiză Bugetară (dashboard)
    configurare/          — Configurare Apartament
docs/                     — (la RĂDĂCINĂ, nu în frontend/) documentație comună
  progress.md             — jurnal cronologic de schimbări (actualizează-l după fiecare sesiune de lucru)
  api-contract.md         — contractul API REST (viitor backend Spring Boot) — sursa unică de adevăr pt. shape-urile de request/response
  backend-blueprint.md    — planul de implementare al backend-ului (faze + task-uri, arhitectură hexagonală)
```

## Documentație vie — citește și scrie în ea

Pe lângă acest fișier, proiectul ține evidența în `docs/`:

- **`docs/progress.md`** — jurnal de schimbări. La finalul oricărei sesiuni de lucru cu impact real pe cod (feature nou, refactor, fix), adaugă o intrare nouă (dată + ce s-a schimbat + de ce + fișiere atinse). Nu rescrie istoricul — doar adaugi la final. E memoria pe termen lung a proiectului: dacă o sesiune viitoare (a ta sau a userului) întreabă „ce s-a făcut până acum", răspunsul e acolo, nu trebuie reconstruit din `git log`.
- **`docs/api-contract.md`** — contractul de API pentru integrarea cu backend-ul Spring Boot (nu există încă, dar interfața client (`RenovationStore`) e deja scrisă ca să mapeze 1:1 pe el). Orice decizie despre shape-ul unui endpoint se scrie AICI înainte de a fi implementată, ca frontend-ul și backend-ul să nu diverge.

**Regulă:** dacă adaugi/ștergi/modifici o funcție de business, un tip de date, un endpoint sau o pagină, actualizează fișierul relevant din `docs/` în aceeași sesiune, nu „mai târziu".

## ⚠️ Regula de aur #1: niciodată text/string brut unde poate exista un tip

**Dacă o valoare are un set fix sau cunoscut de variante (status, tip de cameră, tip de material, monedă etc.), ea NU se scrie ca string literal în cod — devine un `enum` (sau `interface`/`type`) în `src/shared/types/`.**

De ce: un string precum `"Cumpărat"` scris direct într-o comparație (`status === "Cumpărat"`) nu e verificat de compilator — o greșeală de tastare (`"Cumparat"` fără diacritice, sau spațiu în plus) trece neobservată până la runtime, și orice refactor de redenumire trebuie căutat manual cu grep prin tot codul. Un enum (`ItemStatus.Cumparat`) e verificat de TypeScript la fiecare utilizare, iar un „Rename Symbol" din editor actualizează toate apelurile simultan.

**Enums existente** (`src/shared/types/`): `RoomType`, `ItemStatus`, `MaterialType`, `Currency`. Fiecare are cheia enum-ului fără diacritice (ex: `RoomType.Bucatarie`) dar valoarea string păstrează diacriticele (`"Bucătărie"`) — pentru că valoarea e ce se afișează/salvează, cheia e doar identificatorul din cod.

**Interfețe existente**: `Room`, `Item`, `Project`, `RenovationStore`, `DonutSegment` (toate în `shared/types/`), plus tipuri locale de pagină (`DeleteTarget`, `ItemDrawerState` în `app/elemente/`).

### Regula „un fișier per interfață/enum"

- Fiecare `interface`/`enum` din modelul de date (domeniu: Project/Room/Item și derivatele lor) primește **fișierul lui propriu** în `src/shared/types/`, numit exact ca tipul (`Room.ts` conține `Room`, nu și alte tipuri).
- **Dacă o interfață/enum nu există încă și ai nevoie de ea → o creezi.** Nu extinde un tip existent cu proprietăți care aparțin conceptual altui tip; nu folosi `any`, `object`, sau shape-uri inline nedeclarate.
- Tipurile **locale unei singure pagini** (stare de UI specifică, ex. ce e selectat pentru ștergere) NU merg în `shared/types/` — merg într-un fișier propriu, în folderul paginii care le folosește (vezi „Funcții și tipuri per pagină" mai jos). Dacă ajung folosite din ≥2 pagini, se promovează în `shared/types/`.
- Excepție de bun-simț: `Props` ale unei componente (ex: `{ open: boolean; onClose: () => void }`) rămân inline lângă componentă — nu sunt „tipuri de domeniu", sunt semnătura funcției.
- Actualizează `src/shared/types/index.ts` (barrel) de fiecare dată când adaugi un fișier nou acolo.

## ⚠️ Regula de aur #2: unde trăiesc funcțiile

**Toată logica de business trăiește într-o funcție, niciodată inline într-o pagină/componentă.** Diferența față de versiunea anterioară a acestei reguli: **nu totul merge direct în shared.**

### Funcții și tipuri per pagină (creare locală, migrare la nevoie)

1. Când o pagină are nevoie de o funcție (calcul, transformare) sau de un tip **specific ei**, prima variantă e un fișier **local, în folderul paginii** (ex: `src/app/elemente/functions.ts` pentru o funcție folosită doar acolo). NU un fișier mare — dacă apar mai multe funcții fără legătură strânsă între ele, separă-le pe fișiere mici (ex: `src/app/elemente/quick-add.ts`, `src/app/elemente/room-summary.ts`), la fel cum `shared/functions/` e deja împărțit pe domeniu (`money.ts`, `items.ts`, `budget.ts`, `charts.ts`).
2. **De îndată ce o a doua pagină/componentă are nevoie de aceeași funcție sau tip, îl muți în `src/shared/functions/` sau `src/shared/types/`** (fișierul de domeniu potrivit, sau unul nou dacă domeniul e nou) și actualizezi importurile din ambele locuri. Nu duplica „doar de data asta".
3. `store.tsx` rămâne DOAR stare + CRUD (add/update/delete pe `rooms`/`items`). Nu face calcule.
4. Fiecare funcție are un comentariu de o linie deasupra care spune ce calculează și, dacă regula nu e evidentă din nume, *de ce* (ex: „doar Cumparat contează la cheltuit”).
5. **La adăugarea unei funcții noi:** exportă-o, și adaugă o linie în tabelul „Registru de funcții” din `docs/progress.md` (nume, ce face, unde e folosită, fișier local sau shared).
6. **La ștergerea/redenumirea unei funcții:** caută TOATE apelurile ei (`grep -rn "numeFunctie" src/`) înainte de a o șterge, actualizează fiecare apel, și șterge/actualizează rândul corespunzător din `docs/progress.md`. Registrul trebuie să reflecte mereu în câte locuri e apelată o funcție — dacă ștergi una folosită în 3 locuri, actualizezi toate 3 și rândul din registru într-o singură sesiune.

### De ce contează asta

Aplicația asta va exista în minim 3 locuri (web Next.js, backend Spring Boot, mobil Flutter). Dacă o regulă de business e scrisă direct într-un `.tsx`, ea nu se poate porta curat — iar dacă e duplicată "rapid" în două pagini, cele două copii vor diverge silențios la primul refactor. O funcție = un fapt de business, pur (fără hooks, fără `useState`, fără efecte secundare), testabil izolat, ușor de tradus 1:1 în Java/Dart.

### Registru actual de funcții partajate (`src/shared/functions/`)

| Funcție | Fișier | Ce face |
|---|---|---|
| `formatMoney(value, currency?)` | `money.ts` | formatare Intl ro-RO, 2 zecimale, implicit `Currency.EUR` |
| `itemTotal(item)` | `items.ts` | cantitate × preț unitar (randare per-rând) |
| `totalEstimated(items)` | `items.ts` | suma unei liste (folosită pt. subtotaluri ad-hoc; totalul de proiect vine din `summary`) |
| `totalSpent(items)` | `items.ts` | suma elementelor `ItemStatus.Cumparat` — **doar Cumparat contează la cheltuit** (folosită per-cameră) |
| `boughtCount(items)` | `items.ts` | număr elemente Cumparat (per-cameră) |
| `itemsForRoom(items, roomId)` | `items.ts` | filtrare după cameră |
| `roomSubtotal(items, roomId)` | `items.ts` | total estimat al unei camere (randare per-cameră) |
| `roomSpent(items, roomId)` | `items.ts` | cheltuit efectiv într-o cameră (randare per-cameră) |
| `budgetEfficiency(estimated, spent)` | `budget.ts` | % din estimat efectiv cheltuit (rație de prezentare peste totalurile din `summary`) |
| `donutSegments(data)` | `charts.ts` | transformă distribuție în segmente SVG cumulative (`DonutSegment[]`) — geometrie de prezentare |
| `timelinePoints(data)` | `charts.ts` | normalizează `SpendingTimelinePoint[]` în puncte {x,y}∈[0,1] pt. graficul de evoluție — geometrie de prezentare |
| `computeRoomDimensions(room)` | `dimensions.ts` | breakdown necesar material (oglinda backend); PREVIEW client la editare + fallback |

> **⚠️ Agregările de dashboard NU se mai calculează client-side** (Problema 2 din audit): `totalEstimated`/`totalSpent`/
> `budgetRemaining`/`purchaseProgress`/`boughtCount`/`costPerRoom`/`costPerCategory` de proiect + sumarul tehnic vin din
> `store.summary` (`GET /api/projects/{id}/summary`, `BudgetCalculator`/`RoomDimensionsCalculator` server-side). Funcțiile
> `costPerRoom`/`costPerCategory`/`budgetRemaining`/`purchaseProgress`/`projectTechnicalSummary` au fost ȘTERSE din frontend.
> Nu le reintroduce — consumă `useStore().summary`.

Lista completă + locuri de utilizare exacte: `docs/progress.md` → „Registru de funcții” (actualizeaz-o mereu la zi).

## Design system (obligatoriu de respectat)

### Fonturi (deja configurate în `layout.tsx` prin `next/font`)
| Rol | Font | Variabilă CSS / clasă |
|---|---|---|
| Headlines (h1–h4) | **Hanken Grotesk** | `--font-hanken` / `font-heading` |
| Body | **Inter** | `--font-inter` / implicit pe `body` |
| Cifre, valori financiare, dimensiuni | **JetBrains Mono** | `--font-jetbrains` / `font-mono` |

Regulă: **toate sumele de bani și cantitățile se afișează cu `font-mono`** pentru aliniere perfectă a cifrelor.

### Paleta de culori (tokens în `globals.css`, expuse ca clase Tailwind)
| Token | Hex | Clasă | Utilizare |
|---|---|---|---|
| primary | `#000000` | `bg-primary` | text principal, butoane primare, navigare, blocuri structurale — negru absolut, fidel design-ului Stitch (NU un negru „fad”/navy) |
| secondary | `#0ea5e9` | `text-secondary` | date, progress bars, highlight-uri informaționale („Cheltuit") |
| tertiary | `#f97316` | `text-tertiary` | CTA critice, alerte, depășiri de buget — folosit RAR |
| background | `#f8f9ff` | `bg-background` | fundal pagină |
| surface | `#ffffff` | `bg-surface` | carduri, panouri |
| surface-low | `#eff4ff` | `bg-surface-low` | header-e de secțiune în carduri, hover |
| line | `#e2e8f0` | `border-line` | borduri 1px |
| muted | `#64748b` | `text-muted` | text secundar, etichete |

Status chips: Cumpărat = emerald, În așteptare = amber, Planificat = sky — capsule `rounded-full`, text uppercase 11px bold (vezi `StatusChip.tsx`).

### Card de sumar / header de statistici — `DashboardSummaryCard`

**Toate paginile principale** (`/elemente`, `/centralizator`, `/analiza`, `/configurare`) folosesc **același** component
`src/components/DashboardSummaryCard.tsx` pt. blocul de statistici din capul paginii — identic pe mobil ȘI desktop
(nu mai există variante separate „mobil light" / „desktop dark"). Gradient închis `linear-gradient(135deg, #1e293b 0%, #000000 100%)`,
text alb, grid responsive (`grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-{n}`, cu `border-r` doar la `lg`), valoare mare
`font-mono font-bold` la `clamp(16px, 1.6vw, 26px)` (fluid, nu sare între breakpoints — testează mereu la 768/900/1440px
dacă adaugi un metric nou, ca să nu se trunchieze).

**Dacă o pagină nouă are nevoie de un header de statistici, folosește `DashboardSummaryCard` cu 2–4 metrici** (`SummaryMetric[]`),
opțional cu footer `<SummaryProgressFooter percent={...} />` (bară + %) sau `<SummaryAccentFooter>` (punct colorat + text) —
NU crea un card nou de la zero. Datele afișate rămân mereu specifice paginii (nu se copiază datele altei pagini).

### Elevation & forme
- **Fără umbre grele.** Carduri = alb + border 1px `border-line`. Doar dropdown/modal primesc umbră discretă (`shadow-xl` pe Drawer e OK).
- Colțuri strânse: elemente mici 4px (`rounded`), carduri/inputs 8px (`rounded-lg` max). **Fără forme „bubble"** — excepție doar status pills (capsule).

### Iconițe — IMPORTANT
Design-urile Stitch folosesc **Material Symbols Outlined** (Google). Fontul e **self-hosted** prin pachetul
npm `material-symbols` — `import "material-symbols/outlined.css"` în `app/layout.tsx` (nu link extern către
Google Fonts: evită FOUT-ul unde textul iconiței apărea literal — „bed" — la fiecare încărcare de pagină,
înainte ca fontul extern să se descarce; `font-display: block` din pachet ascunde iconița până se încarcă
fontul, în loc să afișeze text). Unele componente mai vechi (ex. `RoomFormDrawer.tsx` — grid tip cameră)
încă folosesc emoji placeholder, migrare parțială, netratată complet.
Lista de mai jos e extrasă direct din codul HTML generat de Stitch (nu ghicită), deci sunt numele exacte de folosit.

Utilizare (span cu clasa `material-symbols-outlined`, numele iconiței ca text):
```html
<span class="material-symbols-outlined">bolt</span>
```

**Stil:** outlined, weight ~400, culoare `text-muted` pe acțiuni secundare, `text-white`/`primary` pe acțiuni pe fundal întunecat.

**Mărime standard iconițe de buton (edit/delete/adaugă/salvează în butoane, tabele, headere de secțiune):
clasa `icon-btn` (`globals.css`), aplicată uniform pe toate paginile.** Iconițele pur decorative (indicator
sortare coloană, iconiță tip cameră lângă titlu, iconițe mari de empty-state) nu intră sub această regulă
și pot avea alte dimensiuni.

**Important — axa `opsz` a fontului Material Symbols:** fontul are o axă variabilă `opsz` (optical size,
proiectată pt. randare 24px). Dacă `opsz` rămâne fixată la 24 în timp ce iconița e afișată la 14–16px
(`text-sm`/`text-base`), traseul e desenat prea gros pt. dimensiunea reală și iconița pare "mare"/bold
chiar dacă `font-size` e mic. De asta clasa globală `.material-symbols-outlined` din `globals.css` ține
`opsz` la 20, iar `.icon-btn` (font-size 15px) coboară `opsz` la 18. **Nu seta doar `text-[Npx]` pe o
iconiță mică fără să ajustezi și `opsz`** — dacă ai nevoie de o dimensiune nouă, ajustează `font-variation-settings`
în `globals.css` (sau inline, vezi `StatusChip.tsx`), nu doar clasa de `text-size`.

#### Navigare sidebar (`Sidebar.tsx`)
| Iconiță | Secțiune |
|---|---|
| `home_work` | Configurare Apartament |
| `shopping_cart` | Elemente de Cumpărat |
| `table_chart` | Tabel Centralizator |
| `leaderboard` | Grafice / Analiză Bugetară |
| `auto_awesome` | Galerie Inspirație (neimplementată încă) |
| `settings` | Setări |
| `keyboard_double_arrow_left` | Restrânge meniu (sidebar colapsabil) |
| `search` | Căutare (header) |
| `account_circle` | Profil utilizator |

#### Tipuri de cameră (grid din `RoomFormDrawer.tsx`) — cheie = `RoomType`
| Iconiță | Tip cameră |
|---|---|
| `king_bed` | `RoomType.Dormitor` |
| `bathtub` | `RoomType.Baie` |
| `chair` | `RoomType.Living` |
| `soup_kitchen` | `RoomType.Bucatarie` |
| `deck` | `RoomType.Terasa` |
| `balcony` | `RoomType.Balcon` |

#### Acțiuni CRUD & formulare
| Iconiță | Utilizare |
|---|---|
| `add` | Adaugă Cameră (buton generic de adăugare) |
| `add_home` | Adaugă Cameră Nouă (titlu drawer) |
| `add_shopping_cart` | Adaugă Element Nou (titlu drawer) |
| `edit_square` | Editează Element (titlu drawer) |
| `edit` | Editare inline (rând tabel) |
| `delete` | Ștergere (rând tabel, cameră) |
| `close` | Închide modal/drawer |
| `warning` | Confirmare Ștergere (titlu dialog) |
| `bolt` | Adăugare Rapidă (secțiune) |
| `expand_more` | Dropdown/select |
| `visibility` | Vizualizare detalii element |

#### Status elemente — cheie = `ItemStatus`
| Iconiță | Status |
|---|---|
| `check_circle` | `ItemStatus.Cumparat` |
| `calendar_today` | `ItemStatus.Planificat` / `ItemStatus.InAsteptare` |

#### Export & document
| Iconiță | Utilizare |
|---|---|
| `picture_as_pdf` | Export PDF |
| `print` | Imprimă Raport |

#### Pagina Analiză Bugetară (`/analiza`)
| Iconiță | Utilizare |
|---|---|
| `pie_chart` | Cost per Cameră (donut chart) |
| `bar_chart` | Stadiul Achizițiilor pe Categorii |
| `timeline` | Evoluția Cheltuielilor (grafic linie, de implementat) |
| `tips_and_updates` | Card recomandare „Optimizare recomandată" |
| `error_outline` | Card alertă „Atenție: depășire buget" |
| `task_alt` | Card „Status proiect” (pozitiv/pe traiectorie) |
| `trending_down` | Economii identificate |
| `update` | Termen scadent / actualizare status |
| `dashboard` | Overview general |

**Notă:** iconițele de mai sus au fost confirmate direct din HTML-ul a 6+ ecrane Stitch (desktop + mobil,
inclusiv variantele „Meniu Restrâns”, „Premium Black Theme”, „Volet Adăugare Cameră”). Dacă la implementare
apare o secțiune nouă (ex: Galerie Inspirație) fără iconiță confirmată încă, preia ecranul din Stitch cu
`get_screen` și extrage `class="material-symbols-outlined"` din HTML înainte de a ghici — Stitch e sursa
de adevăr pentru iconografie, nu presupuneri.

**Toate numele de iconițe de mai sus sunt deja centralizate în `src/shared/icons.ts`** (`NAV_ICONS`,
`ROOM_TYPE_ICONS`, `ACTION_ICONS`, `STATUS_ICONS`, `DOCUMENT_ICONS`, `ANALYTICS_ICONS`, chei tipate pe
enums-urile din `shared/types`). La înlocuirea emoji-urilor cu Material Symbols (backlog item 2), importă
din acest fișier — nu scrie string-uri de iconiță direct în JSX.

### Responsive design (obligatoriu la fiecare pagină)
- **Desktop (≥768px):** sidebar stânga 256px (colapsabil — de implementat), conținut max `max-w-7xl`, grid 12 coloane conceptual, gutter 24px.
- **Mobile (<768px):** sidebar-ul se ASCUNDE (`hidden md:flex` — deja făcut) și se înlocuiește cu **bottom navigation** cu 4 tab-uri: Buget (analiză), Camere (elemente), Tabel (centralizator), Setări (configurare) — *încă neimplementat, prioritate*.
- Pe mobile: drawerele laterale devin **bottom sheets** (slide de jos, colțuri rotunjite sus, handle bar); tabelele devin liste de carduri sau tabele orizontal scrollabile (`overflow-x-auto`); statisticile din header se restrâng la 2 coloane.
- Margini: 16px mobile, 40px desktop. Spacing pe unitate de 8px.
- Headline-uri se reduc pe mobile (32px → 24px).

## Modelul de date

Entitățile din `src/shared/types/` (vezi și regula „un fișier per interfață/enum" mai sus):
- **Project**: titlu, buget total, `currency: Currency` (EUR/RON).
- **Room** (cameră): `type: RoomType`, nume liber, buget alocat. Ștergerea unei camere șterge și elementele ei (cascade — deja implementat în store). Câmpuri tehnice opționale, completate doar din pagina `/configurare` (o cameră nouă nu le are): `floorMaterial: FlooringType`, `floorArea` (mp), `perimeter` (ml), `tileSize: TileSize`, `installationType: InstallationType`, `door: RoomDoor` (width, height, wall), `wallTiling?: WallTiling` (tiledWallsCount, tileHeight, wallLengths per `Wall` — doar la camere cu zonă umedă, activat explicit).
- **Item** (element de cumpărat): nume, `materialType: MaterialType`, sursă/magazin, `status: ItemStatus`, cantitate, preț unitar, link produs (opțional), URL imagine (opțional), FK cameră, `createdAt` (setat de server la creare, imutabil), `purchasedAt?` (setat de server la tranziția spre `Cumpărat` — sursa graficului „Evoluția Cheltuielilor").

### Statusuri element
`ItemStatus.InAsteptare` (default la creare) → `ItemStatus.Planificat` → `ItemStatus.Cumparat`. Sunt libere (dropdown), nu un workflow strict.

### Reguli de calcul curente
Vezi „Registru actual de funcții partajate” mai sus pentru lista completă. Cea mai importantă: **doar `ItemStatus.Cumparat` contează la totalul cheltuit** — orice funcție nouă care calculează „cheltuit” trebuie să respecte asta.

## Pagini & funcționalități (referință Stitch)

1. **`/elemente` — Elemente de Cumpărat** (pagina principală, redirect de la `/`)
   - 4 stat cards, bară „Adăugare Rapidă" (fundal primary, câmpuri: nume + cameră + preț), secțiuni per cameră cu tabel (element, sursă, buc, preț unit, total, status, acțiuni), buget utilizat per cameră.
   - Side effects: drawer Adaugă/Editează Element, drawer Adaugă Cameră (grid 3×2 tipuri cu iconițe), dialog Confirmare Ștergere (element sau cameră).
   - Tipuri locale: `DeleteTarget.ts`, `ItemDrawerState.ts` (în folderul paginii).
2. **`/centralizator` — Tabel Centralizator**
   - Stat cards (total estimat, cheltuit la zi, eficiență), tabel complet grupat pe camere cu subtotaluri, banner negru „Total General Estimat", buton Imprimă Raport (window.print), echivalent EUR/RON (de adăugat), export PDF (de adăugat).
3. **`/analiza` — Analiză Bugetară**
   - 4 KPI cards, donut chart cost per cameră (SVG custom, fără librărie), progress bars pe categorii de materiale, 3 carduri recomandări (optimizare / alertă buget / status proiect). De adăugat: grafic linie „Evoluția Cheltuielilor" (realizat vs estimat pe luni) și buton Export PDF.
4. **`/configurare` — Configurare Apartament** (referință: ecranul desktop Stitch „Configurare Tehnică - Layout Optimizat Rezultate")
   - Card „Sumar Tehnic Global" (proiect curent, suprafață utilă totală, status derivat din progres, buget total, bară de progres).
   - Listă de carduri colapsabile per cameră (`RoomTechnicalCard`): configurare pardoseală (material/suprafață/perimetru/mărime plăci/montaj), placare pereți opțională pe 4 pereți N/E/S/V (doar la camere cu zonă umedă), configurare ușă (lățime/înălțime/perete), panou „Calcule Detaliate" cu formulă + calcul explicit pentru fiecare rezultat (material pardoseală, plintă, faianță, plintă perete ușă).
   - Rând de buget alocat per cameră (funcționalitate existentă, păstrată din varianta inițială a paginii).
   - Stare goală „Adaugă Cameră Nouă" → deschide `RoomFormDrawer` existent. Ștergere cameră prin `ConfirmDialog`.
   - Funcțiile de calcul: `src/app/configurare/dimensions.ts` (locale paginii — vezi Registrul de funcții din `docs/progress.md`).

### Backlog (în ordinea priorității)
1. Bottom navigation + bottom sheets pentru mobile
2. Înlocuire emoji cu Material Symbols (necesită încărcarea fontului în `layout.tsx` întâi)
3. Sidebar colapsabil (varianta „Meniu Restrâns" din Stitch)
4. Galerie Inspirație (există în design, neimplementată)

**Rezolvate** (vezi `docs/progress.md` pentru detalii): export PDF/partajare, comutare monedă EUR↔RON cu
curs real, conectare la backend Spring Boot, grafic evoluție cheltuieli pe `/analiza` (date reale, pe
momentul cumpărării — Problemele 3+4 din audit).

## Convenții de cod

- Componente client (`"use client"`) doar unde e nevoie de stare/evenimente; pagini rămân subțiri — **fac fetch/orchestrare + randare, nu calcule**. Orice calcul vine dintr-un import (local sau din `@/shared/functions`), eventual înfășurat în `useMemo` dacă e costisitor.
- **Zero duplicare de logică sau de tipuri.** Înainte să scrii un calcul sau un tip nou, verifică `docs/progress.md` (Registrul de funcții) sau caută în `src/shared/**` / folderul paginii curente — dacă există deja ceva similar, extinde-l sau reutilizează-l în loc să rescrii.
- Toate valorile cu variante fixe → enum în `shared/types/`, nu string literal (regula de aur #1). Toate shape-urile de date noi (props complexe exceptate, shape-uri de răspuns API etc.) → `interface`/`type` explicit, în fișierul lui propriu (regula „un fișier per interfață”).
- Toate textele UI în **română** (diacritice corecte). Etichetele de secțiune: uppercase, 11–12px, bold, `tracking-wide`, `text-muted`.
- Folosește clasele de token (`bg-surface`, `border-line`, `text-muted`), NU culori hardcodate.
- State-ul global trece exclusiv prin `useStore()`; nu crea alt context și nu folosi localStorage fără să fie cerut.
- Accesibilitate: butoanele icon-only primesc `aria-label`.
- React 19: nu folosi `useEffect` ca să sincronizezi state cu props/schimbări (ex: reset de formular la deschiderea unui drawer) — e anti-pattern și dă eroare de lint (`react-hooks/set-state-in-effect`). Folosește pattern-ul oficial „adjusting state during render" (compară cu o valoare anterioară ținută în `useState`, vezi `ItemFormDrawer.tsx`/`RoomFormDrawer.tsx` pentru exemplu).
- Verifică mereu cu `npm run lint` și `npx tsc --noEmit` înainte să consideri o schimbare încheiată, și confirmă vizual în browser dacă schimbarea afectează UI-ul.
- **Nu uita workflow-ul de Git de la începutul acestui fișier — branch nou, niciodată push direct pe `main`.**
