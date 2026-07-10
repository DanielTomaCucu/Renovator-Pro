# Renovator Pro — Planificator Buget Renovare

@AGENTS.md

> ⚠️ **Next.js 16** — versiune cu breaking changes față de datele de antrenament. Citește ghidul relevant din `node_modules/next/dist/docs/` înainte de a scrie cod nou.

## Despre proiect

Aplicație web de **management al bugetului pentru renovări de locuințe** (proprietari, contractori, arhitecți). UI-ul este implementat după design-urile generate în **Google Stitch** (proiect Stitch: `projects/14594146001803528847`, titlu "Planificator Buget Renovare"). Când e nevoie de referință vizuală, ecranele se pot prelua prin MCP-ul `stitch` (`get_screen` → screenshot + HTML).

**Stadiu actual:** frontend Next.js cu date mock (client-side store). Urmează: backend Spring Boot (API REST) și aplicație mobilă Flutter (proiecte separate).

## Stack & comenzi

- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind CSS 4
- `npm run dev` — server dev. **Atenție: portul 3000 e ocupat de alt proiect al userului; folosește portul 3001** (configurația `renovator-web` din `~/.claude/launch.json`).
- `npm run build`, `npm run lint`

## Structură

```
src/
  lib/types.ts        — modelul de date (interfețe: Project, Room, Item, enums)
  lib/mock-data.ts    — date de test
  lib/functions.ts    — TOATĂ logica de business (vezi secțiunea dedicată mai jos)
  lib/store.tsx       — StoreProvider (React context, DOAR CRUD in-memory, fără calcule)
  components/         — Sidebar, StatCard, StatusChip, Drawer, ItemFormDrawer, RoomFormDrawer, ConfirmDialog, forms
  app/
    elemente/         — Elemente de Cumpărat (pagina principală)
    centralizator/    — Tabel Centralizator Costuri
    analiza/          — Analiză Bugetară (dashboard)
    configurare/      — Configurare Apartament
docs/
  progress.md         — jurnal cronologic de schimbări (actualizează-l după fiecare sesiune de lucru)
  api-contract.md     — contractul API REST (viitor backend Spring Boot) — sursa unică de adevăr pt. shape-urile de request/response
```

## Documentație vie — citește și scrie în ea

Pe lângă acest fișier, proiectul ține evidența în `docs/`:

- **`docs/progress.md`** — jurnal de schimbări. La finalul oricărei sesiuni de lucru cu impact real pe cod (feature nou, refactor, fix), adaugă o intrare nouă (dată + ce s-a schimbat + de ce + fișiere atinse). Nu rescrie istoricul — doar adaugi la final. E memoria pe termen lung a proiectului: dacă o sesiune viitoare (a ta sau a userului) întreabă „ce s-a făcut până acum", răspunsul e acolo, nu trebuie reconstruit din `git log`.
- **`docs/api-contract.md`** — contractul de API pentru integrarea cu backend-ul Spring Boot (nu există încă, dar interfața client (`RenovationStore`) e deja scrisă ca să mapeze 1:1 pe el). Orice decizie despre shape-ul unui endpoint se scrie AICI înainte de a fi implementată, ca frontend-ul și backend-ul să nu diverge.

**Regulă:** dacă adaugi/ștergi/modifici o funcție de business, un endpoint sau o pagină, actualizează fișierul relevant din `docs/` în aceeași sesiune, nu „mai târziu".

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
| primary | `#0f172a` | `bg-primary` | text principal, butoane primare, navigare, blocuri structurale |
| secondary | `#0ea5e9` | `text-secondary` | date, progress bars, highlight-uri informaționale („Cheltuit") |
| tertiary | `#f97316` | `text-tertiary` | CTA critice, alerte, depășiri de buget — folosit RAR |
| background | `#f8f9ff` | `bg-background` | fundal pagină |
| surface | `#ffffff` | `bg-surface` | carduri, panouri |
| surface-low | `#eff4ff` | `bg-surface-low` | header-e de secțiune în carduri, hover |
| line | `#e2e8f0` | `border-line` | borduri 1px |
| muted | `#64748b` | `text-muted` | text secundar, etichete |

Status chips: Cumpărat = emerald, În așteptare = amber, Planificat = sky — capsule `rounded-full`, text uppercase 11px bold (vezi `StatusChip.tsx`).

### Elevation & forme
- **Fără umbre grele.** Carduri = alb + border 1px `border-line`. Doar dropdown/modal primesc umbră discretă (`shadow-xl` pe Drawer e OK).
- Colțuri strânse: elemente mici 4px (`rounded`), carduri/inputs 8px (`rounded-lg` max). **Fără forme „bubble"** — excepție doar status pills (capsule).

### Iconițe — IMPORTANT
Design-urile Stitch folosesc **Material Symbols Outlined**, NU emoji. Implementarea actuală folosește emoji ca placeholder — **de înlocuit**. La orice lucru pe UI:
1. Adaugă `material-symbols` (npm) sau font-ul Google `Material Symbols Outlined`.
2. Iconițe folosite în design: `home`/`apartment` (configurare), `shopping_cart` (elemente), `table_rows`/`receipt_long` (centralizator), `bar_chart`/`monitoring` (analiză), `add`, `edit`, `delete`, `close`, `search`, `print`, `share`, `picture_as_pdf`, `bed` (dormitor), `bathtub` (baie), `weekend` (living), `kitchen`/`skillet` (bucătărie), `deck` (terasă), `balcony` (balcon), `bolt` (adăugare rapidă), `visibility` (detalii).
3. Stil: outlined, weight ~400, dimensiune 20–24px, culoare `text-muted` pe acțiuni secundare.

### Responsive design (obligatoriu la fiecare pagină)
- **Desktop (≥768px):** sidebar stânga 256px (colapsabil — de implementat), conținut max `max-w-7xl`, grid 12 coloane conceptual, gutter 24px.
- **Mobile (<768px):** sidebar-ul se ASCUNDE (`hidden md:flex` — deja făcut) și se înlocuiește cu **bottom navigation** cu 4 tab-uri: Buget (analiză), Camere (elemente), Tabel (centralizator), Setări (configurare) — *încă neimplementat, prioritate*.
- Pe mobile: drawerele laterale devin **bottom sheets** (slide de jos, colțuri rotunjite sus, handle bar); tabelele devin liste de carduri sau tabele orizontal scrollabile (`overflow-x-auto`); statisticile din header se restrâng la 2 coloane.
- Margini: 16px mobile, 40px desktop. Spacing pe unitate de 8px.
- Headline-uri se reduc pe mobile (32px → 24px).

## Modelul de date & logica de business

### Entități (`src/lib/types.ts`)
Toate tipurile de date au **interfață/type dedicat** aici — niciodată obiecte `any` sau inline shapes în componente.
- **Project**: titlu, buget total, monedă (EUR/RON).
- **Room** (cameră): tip (Dormitor/Baie/Living/Bucătărie/Terasă/Balcon), nume liber, buget alocat. Ștergerea unei camere șterge și elementele ei (cascade — deja implementat în store).
- **Item** (element de cumpărat): nume, tip material (Gresie/Faianță/Parchet/Vopsea/Sanitare/Mobilă/Electrocasnice/Corpuri de iluminat/Altele), sursă/magazin, status, cantitate, preț unitar, link produs (opțional), URL imagine (opțional), FK cameră.

### Statusuri element
`În așteptare` (default la creare) → `Planificat` → `Cumpărat`. Sunt libere (dropdown), nu un workflow strict.

## ⚠️ Regula de aur: unde trăiește logica de business

**Toată logica de business (calcule, agregări, transformări, reguli, formatare) trăiește în `src/lib/functions.ts` — NICIODATĂ inline într-o pagină sau componentă.**

De ce: aplicația asta va exista în minim 3 locuri (web Next.js, backend Spring Boot, mobil Flutter). Dacă regula "doar elementele Cumpărate contează la total cheltuit" e scrisă în interiorul unui `.tsx`, prima pagină care are nevoie de ea o va reimplementa ușor diferit, iar cele trei implementări vor diverge silențios. Fiecare regulă de business scrisă o singură dată, într-un singur loc, e singurul mod de a păstra aplicația coerentă pe termen lung.

### Reguli concrete de organizare

1. **O funcție = un fapt de business, testabil izolat, fără React.** `functions.ts` conține doar funcții pure (input → output, fără hooks, fără `useState`, fără efecte secundare). Dacă o logică are nevoie de React (ex: `useMemo`), memoizarea rămâne în pagină, dar *calculul* din interior e apelul unei funcții din `functions.ts`.
2. **Dacă un calcul e folosit în ≥2 pagini/componente → OBLIGATORIU în `functions.ts`.** Nu-l duplica "doar de data asta". Exemple deja extrase: `itemTotal`, `totalEstimated`, `totalSpent`, `boughtCount`, `purchaseProgress`, `budgetRemaining`, `itemsForRoom`, `roomSubtotal`, `roomSpent`, `costPerRoom`, `costPerCategory`, `donutSegments`, `formatMoney`.
3. **Fișiere multiple, dacă domeniul crește.** Cât timp aplicația are un singur domeniu (buget renovare), totul stă în `src/lib/functions.ts`. Dacă apare un domeniu nou și distinct (ex: autentificare, export PDF cu logică complexă, integrare valutară live), creează un fișier separat (`src/lib/auth-functions.ts`, `src/lib/export-functions.ts` etc.) — NU îngrămădi tot într-un singur fișier gigant. Fiecare fișier nou de acest tip trebuie documentat în `docs/progress.md` (ce conține, de ce e separat) și listat în tabelul de mai jos.
4. **`store.tsx` rămâne DOAR stare + CRUD** (add/update/delete pe `rooms`/`items`). Store-ul nu face calcule — apelează, cel mult, funcții din `functions.ts` dacă are nevoie de o valoare derivată pentru validare. Componentele importă calculele direct din `functions.ts`, nu din store.
5. **Fiecare funcție are un comentariu de o linie deasupra** care spune ce calculează și, dacă regula nu e evidentă din nume, *de ce* (ex: „doar Cumpărat contează la cheltuit”). Nu documentații lungi — o linie e suficientă dacă numele funcției e clar.
6. **La adăugarea unei funcții noi:** adaug-o în `functions.ts` (sau fișierul de domeniu potrivit), exportă-o, și adaugă o linie în tabelul „Registru de funcții” din `docs/progress.md` (nume, ce face, unde e folosită).
7. **La ștergerea/redenumirea unei funcții:** caută TOATE apelurile ei (`grep -rn "numeFunctie" src/`) înainte de a o șterge, actualizează fiecare apel, și șterge/actualizează rândul corespunzător din registrul de funcții din `docs/progress.md`. Nu lăsa funcții moarte neexportate „pentru orice eventualitate”.

### Fișier generic & extensibil, production-ready
- Funcțiile lucrează pe interfețele din `types.ts`, nu pe forme ad-hoc — orice extindere a modelului de date (ex: adaugi un câmp nou pe `Item`) nu trebuie să spargă funcțiile existente.
- Funcțiile sunt pure și fără side-effects → ușor de mutat 1:1 în backend-ul Spring Boot (aceeași regulă de business, doar tradusă în Java) sau în Flutter (Dart), fără ambiguitate despre ce trebuie portat.
- Evită parametri opționali cu comportament ascuns; dacă o funcție are nevoie de context suplimentar, primește-l explicit ca parametru.

### Reguli de calcul actuale (implementate în `functions.ts`)
- `total element = cantitate × preț unitar` (`itemTotal`)
- `total cheltuit = Σ totaluri elemente cu status "Cumpărat"` — **doar Cumpărat contează la cheltuit** (`totalSpent`)
- `total estimat = Σ toate elementele`, indiferent de status (`totalEstimated`)
- `progres achiziții (%) = elemente Cumpărat / total elemente` (`purchaseProgress`)
- `buget rămas = buget total proiect − total cheltuit`; dacă e negativ → alertă cu `tertiary` (orange) (`budgetRemaining`)
- subtotal per cameră (`roomSubtotal`); cheltuit per cameră (`roomSpent`); buget utilizat cameră vs. buget alocat cameră (depășire → orange)
- distribuție cost pe cameră pentru donut chart (`costPerRoom` + `donutSegments`)
- agregare cost pe categorie de material (`costPerCategory`)
- Formatare bani: `formatMoney()` — Intl ro-RO, mereu 2 zecimale. Folosește-o pentru ORICE sumă afișată, niciodată `.toFixed()` sau formatare manuală.

Detaliul complet, la zi, al fiecărei funcții (semnătură + locuri de utilizare) e în `docs/progress.md`, secțiunea „Registru de funcții” — actualizeaz-o de fiecare dată când modifici `functions.ts`.

## Pagini & funcționalități (referință Stitch)

1. **`/elemente` — Elemente de Cumpărat** (pagina principală, redirect de la `/`)
   - 4 stat cards, bară „Adăugare Rapidă" (fundal primary, câmpuri: nume + cameră + preț), secțiuni per cameră cu tabel (element, sursă, buc, preț unit, total, status, acțiuni), buget utilizat per cameră.
   - Side effects: drawer Adaugă/Editează Element, drawer Adaugă Cameră (grid 3×2 tipuri cu iconițe), dialog Confirmare Ștergere (element sau cameră).
2. **`/centralizator` — Tabel Centralizator**
   - Stat cards (total estimat, cheltuit la zi, eficiență), tabel complet grupat pe camere cu subtotaluri, banner negru „Total General Estimat", buton Imprimă Raport (window.print), echivalent EUR/RON (de adăugat), export PDF (de adăugat).
3. **`/analiza` — Analiză Bugetară**
   - 4 KPI cards, donut chart cost per cameră (SVG custom, fără librărie), progress bars pe categorii de materiale, 3 carduri recomandări (optimizare / alertă buget / status proiect). De adăugat: grafic linie „Evoluția Cheltuielilor" (realizat vs estimat pe luni) și buton Export PDF.
4. **`/configurare` — Configurare Apartament**
   - Datele proiectului, lista camerelor cu editare buget alocat inline, adăugare cameră.

### Backlog (în ordinea priorității)
1. Bottom navigation + bottom sheets pentru mobile
2. Înlocuire emoji cu Material Symbols
3. Sidebar colapsabil (varianta „Meniu Restrâns" din Stitch)
4. Grafic evoluție cheltuieli pe `/analiza`
5. Export PDF / partajare
6. Comutare monedă EUR↔RON cu curs
7. Galerie Inspirație (există în design, neimplementată)
8. Conectare la backend Spring Boot (înlocuiește mock store; păstrează interfața `RenovationStore` ca s-o poți implementa peste fetch)

## Convenții de cod

- Componente client (`"use client"`) doar unde e nevoie de stare/evenimente; pagini rămân subțiri — **fac fetch/orchestrare + randare, nu calcule**. Orice calcul vine dintr-un import din `lib/functions.ts`, eventual înfășurat în `useMemo` dacă e costisitor.
- **Zero duplicare de logică.** Înainte să scrii un calcul nou, verifică `docs/progress.md` (Registrul de funcții) sau caută în `src/lib/*.ts` — dacă există deja ceva similar, extinde-l sau reutilizează-l în loc să rescrii.
- Toate tipurile de date noi (props complexe, shape-uri de răspuns API etc.) primesc o `interface`/`type` explicit în `types.ts` sau lângă funcția care le folosește — nu `any`, nu obiecte inline nedeclarate.
- Toate textele UI în **română** (diacritice corecte). Etichetele de secțiune: uppercase, 11–12px, bold, `tracking-wide`, `text-muted`.
- Folosește clasele de token (`bg-surface`, `border-line`, `text-muted`), NU culori hardcodate.
- State-ul global trece exclusiv prin `useStore()`; nu crea alt context și nu folosi localStorage fără să fie cerut.
- Accesibilitate: butoanele icon-only primesc `aria-label`.
- React 19: nu folosi `useEffect` ca să sincronizezi state cu props/schimbări (ex: reset de formular la deschiderea unui drawer) — e anti-pattern și dă eroare de lint (`react-hooks/set-state-in-effect`). Folosește pattern-ul oficial „adjusting state during render" (compară cu o valoare anterioară ținută în `useState`, vezi `ItemFormDrawer.tsx`/`RoomFormDrawer.tsx` pentru exemplu).
- Verifică mereu cu `npm run lint` și `npx tsc --noEmit` înainte să consideri o schimbare încheiată.
