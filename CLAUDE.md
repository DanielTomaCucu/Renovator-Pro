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
  lib/types.ts        — modelul de date (Project, Room, Item)
  lib/mock-data.ts    — date de test
  lib/store.tsx       — StoreProvider (React context, CRUD in-memory) + formatMoney/itemTotal
  components/         — Sidebar, StatCard, StatusChip, Drawer, ItemFormDrawer, RoomFormDrawer, ConfirmDialog, forms
  app/
    elemente/         — Elemente de Cumpărat (pagina principală)
    centralizator/    — Tabel Centralizator Costuri
    analiza/          — Analiză Bugetară (dashboard)
    configurare/      — Configurare Apartament
```

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
- **Project**: titlu, buget total, monedă (EUR/RON).
- **Room** (cameră): tip (Dormitor/Baie/Living/Bucătărie/Terasă/Balcon), nume liber, buget alocat. Ștergerea unei camere șterge și elementele ei (cascade — deja implementat în store).
- **Item** (element de cumpărat): nume, tip material (Gresie/Faianță/Parchet/Vopsea/Sanitare/Mobilă/Electrocasnice/Corpuri de iluminat/Altele), sursă/magazin, status, cantitate, preț unitar, link produs (opțional), URL imagine (opțional), FK cameră.

### Reguli de calcul (nu le dubla — folosește helper-ele din `store.tsx`)
- `total element = cantitate × preț unitar` (`itemTotal`)
- `total cheltuit = Σ totaluri elemente cu status "Cumpărat"` — **doar Cumpărat contează la cheltuit**
- `total estimat = Σ toate elementele`, indiferent de status
- `progres achiziții (%) = elemente Cumpărat / total elemente`
- `buget rămas = buget total proiect − total cheltuit`; dacă e negativ → alertă cu `tertiary` (orange)
- subtotal per cameră; buget utilizat cameră vs. buget alocat cameră (depășire → orange)
- Formatare bani: `formatMoney()` — Intl ro-RO, mereu 2 zecimale.

### Statusuri element
`În așteptare` (default la creare) → `Planificat` → `Cumpărat`. Sunt libere (dropdown), nu un workflow strict.

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

- Componente client (`"use client"`) doar unde e nevoie de stare/evenimente; pagini rămân subțiri, logica de calcul în `useMemo` sau helpers din `lib/`.
- Toate textele UI în **română** (diacritice corecte). Etichetele de secțiune: uppercase, 11–12px, bold, `tracking-wide`, `text-muted`.
- Folosește clasele de token (`bg-surface`, `border-line`, `text-muted`), NU culori hardcodate.
- State-ul global trece exclusiv prin `useStore()`; nu crea alt context și nu folosi localStorage fără să fie cerut.
- Accesibilitate: butoanele icon-only primesc `aria-label`.
