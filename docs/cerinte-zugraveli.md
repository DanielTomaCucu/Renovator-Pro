# Cerințe — Zugrăveli complete + Consumabile de montaj în Configurator

> Status: 🟡 **de implementat.** Extinde calculele din `/configurare` cu: **tavan**, **vopsea deasupra
> faianței**, și consumabilele de montaj lipsă azi: **amorsă** (zugrăveală + sub placări), **adeziv de
> plăci** (gresie/faianță), **chit de rosturi**, **folie sub parchet** (cu/fără încălzire în pardoseală).
> Toate devin elemente auto-generate în `/elemente`, ca gresia/vopseaua azi. De citit împreună cu
> `docs/api-contract.md` (secțiunea `Room.dimensions`) și `frontend/src/shared/functions/dimensions.ts`.
> Normele de consum de mai jos sunt calibrate pe surse reale (listate la final) — NU le modifica din memorie.

## Context — ce EXISTĂ deja (nu reimplementa!)

- Vopsea/tapet pe pereți la Parchet/Mochetă: `Room.wallFinish`, `wallFinishArea()` (scade golurile
  uși+ferestre; pierdere 10% vopsea / 15% tapet), `paintLiters()`.
- Faianță la Gresie: `Room.wallTiling`, `wallTilingArea()` (pierdere 10%/12% după numărul de goluri).
- Pardoseală: `floorMaterialNeeded()` (pierdere 10/15/18% după montaj, +2% plăci mari; la Gresie include
  plinta tăiată din plăci).
- Reconciliere auto-items server-side (`AutoItemReconciler`): generează/actualizează elemente
  `Din Configurare` (Gresie, Faianță, Plintă, Vopsea, Tapet, Glaf) la fiecare `PATCH /api/rooms/{id}`,
  păstrând id/preț/status; le șterge când necesarul redevine 0. Elementele noi de mai jos intră EXACT în
  același mecanism — nu inventa altul.
- Client = preview (`computeRoomDimensions`), backend (`RoomDimensionsCalculator`) = sursa de adevăr;
  formulele trebuie identice 1:1 în ambele.

## Explicația calculului de vopsea EXISTENT (revizuit ca afișare, nu ca formulă)

Formula actuală din `paintLiters()` e corectă, doar prost explicată în UI:

```
litri = (suprafață_de_vopsit_mp × 2 straturi) ÷ 11 mp/litru, rotunjit în sus la 0.5 l
```

- **2 straturi** — norma la interior: primul strat nu acoperă uniform niciodată; a doua mână e regulă,
  nu opțiune.
- **11 mp/litru/strat** — randamentul mediu practic al lavabilelor uzuale (producătorii declară
  10–16 mp/l teoretic pe suport ideal; ex. Savana ~14 mp/l teoretic ≈ 70 ml/mp, Innenweiss 13–15 mp/l;
  practic pe glet obișnuit 10–12 mp/l — 11 e media sigură).
- Exemplu: 30 mp de perete → 30 × 2 ÷ 11 = 5.45 → **5.5 litri**.

**Cerință UI (parte din ZUG-FE-2):** rândul „Vopsea" din panoul „Calcule Detaliate" trebuie să afișeze
formula cu numerele reale, ca la celelalte rânduri: `30.0 mp × 2 straturi ÷ 11 mp/l = 5.5 l`, nu doar
rezultatul. Nicio schimbare de formulă.

## A. Zugrăveli — tavan + vopsea deasupra faianței

### Model de date

`WallTiling` — câmpuri NOI opționale (JSONB, fără migrare SQL):

```ts
/** Înălțimea totală a camerei (m), pardoseală→tavan — pt. vopseaua de deasupra faianței. Trebuie > tileHeight, ≤ 6. */
roomHeight?: number;
/** Mărimea plăcilor de faianță — pt. consumul de adeziv/chit al pereților. Absent → se calculează ca Medie. */
tileSize?: TileSize;
```

`Room` — câmpuri NOI opționale (migrare SQL, numărul următor liber, ex. `V6__consumabile.sql`):

```ts
/** Zugrăvirea tavanului — activată explicit. Aria = floorArea. Disponibilă la ORICE pardoseală. */
ceilingPaint?: boolean;
/** Încălzire în pardoseală — schimbă tipul foliei de sub parchet (vezi secțiunea C). Doar la Parchet Laminat. */
underfloorHeating?: boolean;
```

```sql
ALTER TABLE rooms ADD COLUMN ceiling_paint BOOLEAN;
ALTER TABLE rooms ADD COLUMN underfloor_heating BOOLEAN;
```

### Formule (constante noi lângă cele existente, cu comentariu-sursă ca la CALC-1…8)

- `WASTE_RATIO_CEILING = 0.10` (aceeași pierdere ca la pereți).
1. **`ceilingPaintArea`** = `ceilingPaint && floorArea > 0` ? `floorArea × 1.10` : `0` — la ORICE pardoseală.
2. **`paintAboveTilingArea`** (doar Gresie, `wallTiling.roomHeight > tileHeight`; altfel 0):
   - pereții PLACAȚI (primii `tiledWallsCount` din N,E,S,V): `wallLengths[p] × (roomHeight − tileHeight)`
     — fără scădere de goluri (asumpție documentată în cod: ușile/ferestrele stau în zona placată);
   - pereții NEPLACAȚI cu `wallLengths[p] > 0`: `wallLengths[p] × roomHeight − openingsArea(p)`,
     cu `Math.max(0, …)` per perete;
   - totul × `(1 + WASTE_RATIO_PAINT)` (0.10, constanta existentă).
3. **`paintLiters`** devine `paintLiters(paintArea + ceilingPaintArea + paintAboveTilingArea)` — funcția
   existentă aplicată pe SUMĂ (rotunjirea la 0.5 l O SINGURĂ DATĂ, la final).

## B. Amorsa (grund) — NOUĂ, două utilizări distincte

Amorsa uniformizează absorbția suportului; se aplică obligatoriu (1) pe pereți/tavan înainte de lavabilă
și (2) pe șapă/perete înainte de adezivul de plăci. Produsul e adesea același (dispersie acrilică), dar
necesarul se calculează pe arii diferite → DOUĂ câmpuri + DOUĂ elemente auto-generate.

Constante (sursă: fișe tehnice — consum amorsă gata preparată 0.05–0.20 l/mp/strat; luăm mijlocul
sigur pt. suport gletuit, respectiv șapă absorbantă):

- `PRIMER_PAINT_L_PER_SQM = 0.10` — 1 strat, sub zugrăveală.
- `PRIMER_TILING_L_PER_SQM = 0.15` — 1 strat, sub adeziv (șapa e mai absorbantă decât gletul).

4. **`paintPrimerLiters`** = `(paintArea + wallpaperArea + ceilingPaintArea + paintAboveTilingArea) × 0.10`,
   rotunjit în sus la litru întreg (se vinde la 1/4/10 l). Se amorsează și sub TAPET (aceeași regulă de
   pregătire a suportului). 0 dacă suma ariilor e 0.
5. **`tilingPrimerLiters`** = `(aria_netă_pardoseală_gresie + aria_netă_faianță) × 0.15`, rotunjit în sus
   la litru întreg. **Arii NETE** = fără pierderea de tăiere a plăcilor (amorsa acoperă suprafața reală,
   nu plăcile tăiate): pardoseală netă = `floorArea` (doar la `FlooringType.Gresie`); faianță netă =
   `Σ lungimi placate × tileHeight − goluri` (adică `wallTilingArea` ÎNAINTE de aplicarea pierderii —
   calculatoarele trebuie să expună intern valoarea netă, nu să împartă înapoi valoarea cu pierdere).

## C. Adeziv de plăci + chit de rosturi — NOI (doar la Gresie/faianță)

### Adeziv (mortar-adeziv cimentos, ex. clasa C1/C2 — sac 25 kg)

Consumul depinde de mărimea plăcii → mărimea dintelui gletierei; la plăci ≥60 cm se adaugă dublă
încleiere (back-buttering, +20–30%). Valori normate pe `TileSize` (kg/mp, deja incluzând dubla încleiere
la Mare/FoarteMare — surse la final):

| `TileSize` | Gletieră | `ADHESIVE_KG_PER_SQM` |
|---|---|---|
| `Mica` | 6 mm | **2.5** |
| `Medie` | 8 mm | **3.5** |
| `Mare` | 10 mm + dublă încleiere | **5.5** |
| `FoarteMare` | 12 mm + dublă încleiere | **7.0** |

- `ADHESIVE_SAFETY_RATIO = 0.10` — marjă de siguranță la cumpărare (denivelări de suport).
- `ADHESIVE_BAG_KG = 25`.

6. **`floorAdhesiveKg`** (doar Gresie) = `floorArea × kg_per_mp(room.tileSize ?? Medie) × 1.10`.
   Aria NETĂ (fără pierderea de tăiere — adezivul acoperă camera, nu plăcile); plinta lipită intră în
   marja de 10% (asumpție documentată în cod).
7. **`wallAdhesiveKg`** (doar faianță) = `aria_netă_faianță × kg_per_mp(wallTiling.tileSize ?? Medie) × 1.10`.
8. **`adhesiveBags`** = `ceil((floorAdhesiveKg + wallAdhesiveKg) / 25)` — UN element auto-generat comun
   („adezivul de gresie și cel de faianță sunt același produs cimentos"), cantitate = saci.

### Chit de rosturi (sac/cutie — cantitatea în kg)

Formula standard din industrie (Ceresit/Weber — surse la final), per mp:

```
kg/mp = ((A + B) / (A × B)) × E × R × 1.6
```

unde `A`,`B` = laturile plăcii (mm), `E` = grosimea plăcii (mm), `R` = lățimea rostului (mm),
`1.6` = densitatea chitului cimentos (kg/dm³). Cum aplicația nu cere dimensiunile exacte ale plăcii,
folosim dimensiuni REPREZENTATIVE per `TileSize` (constante documentate, cu tabelul în comentariu):

| `TileSize` | A×B reprezentativ | E (grosime) | R (rost) | Rezultat ≈ kg/mp (`GROUT_KG_PER_SQM`) |
|---|---|---|---|---|
| `Mica` | 150×150 | 7 | 3 | **0.45** |
| `Medie` | 330×330 | 8 | 3 | **0.24** |
| `Mare` | 600×600 | 9 | 2 | **0.10** |
| `FoarteMare` | 1200×600 | 10 | 2 | **0.08** |

⚠️ Stochează în cod DIRECT valorile kg/mp precalculate din tabel (constante per `TileSize`), cu formula
și dimensiunile reprezentative în comentariu — nu reimplementa formula cu parametri pe care userul nu-i
introduce nicăieri.

- `GROUT_SAFETY_RATIO = 0.10`.

9. **`groutKg`** = `(floorArea_netă(Gresie) × kg_per_mp(tileSize pardoseală) + aria_netă_faianță ×
   kg_per_mp(tileSize faianță)) × 1.10`, rotunjit în sus la kg întreg. UN element auto-generat comun.

## D. Folie sub parchet — NOUĂ (doar la `FlooringType.ParchetLaminat`)

Sub parchetul laminat se pune obligatoriu un substrat (izolație fonică + barieră de vapori). Tipul
depinde de `Room.underfloorHeating`:

- **fără încălzire în pardoseală** → folie XPS 3 mm (izolare termică/fonică bună);
- **cu încălzire în pardoseală** → substrat special cu rezistență termică MICĂ (R ≤ 0.05 m²K/W — ex.
  poliuretan cu nisip cuarțos 1.5–2 mm), altfel încălzirea nu trece prin pardoseală (norma europeană:
  R cumulat parchet+folie ≤ 0.15 m²K/W). Numele elementului generat reflectă tipul (vezi mai jos).

- `UNDERLAY_OVERLAP_RATIO = 0.05` — suprapuneri la îmbinări + margini ridicate pe perete.

10. **`underlayArea`** = `floorArea × 1.05`, rotunjit în sus la mp întreg (se vinde la rolă, pe mp).
    0 dacă pardoseala nu e Parchet Laminat. (La Mochetă nu se generează — mocheta se montează de regulă
    direct sau cu substrat propriu, în afara scopului.)

## `RoomDimensions` — câmpurile NOI complete (frontend `RoomDimensions.ts` + `RoomDimensionsDto`)

```ts
ceilingPaintArea: number;      // mp, cu pierdere — A.1
paintAboveTilingArea: number;  // mp, cu pierdere — A.2
paintPrimerLiters: number;     // litri amorsă zugrăveală, rotunjit ↑ la 1 l — B.4
tilingPrimerLiters: number;    // litri amorsă sub placări, rotunjit ↑ la 1 l — B.5
floorAdhesiveKg: number;       // kg adeziv pardoseală — C.6
wallAdhesiveKg: number;        // kg adeziv faianță — C.7
adhesiveBags: number;          // saci 25 kg, ceil — C.8
groutKg: number;               // kg chit rosturi, ceil — C.9
underlayArea: number;          // mp folie parchet, ceil — D.10
```

`paintArea`/`paintLiters` existente: vezi secțiunea A (paintArea rămâne doar wallFinish; paintLiters
devine agregatul camerei).

## Elemente auto-generate NOI (reconciliere — `AutoItemReconciler`)

`MaterialType` primește 4 variante NOI (enum TS + Java, valorile string cu diacritice; coloana e VARCHAR,
fără migrare pt. asta): `Amorsa = "Amorsă"`, `AdezivPlacari = "Adeziv plăci"`,
`ChitRosturi = "Chit de rosturi"`, `FolieParchet = "Folie parchet"`.

| Element (numele urmează convenția existentă din reconciler) | Condiție | Cantitate | Unitate |
|---|---|---|---|
| Vopsea | `paintLiters > 0` — ACUM și la Gresie (tavan/deasupra faianței), nu doar Parchet/Mochetă | `paintLiters` | l |
| Amorsă zugrăveală | `paintPrimerLiters > 0` | `paintPrimerLiters` | l |
| Amorsă placări | `tilingPrimerLiters > 0` | `tilingPrimerLiters` | l |
| Adeziv gresie și faianță | `adhesiveBags > 0` | `adhesiveBags` | saci 25 kg |
| Chit de rosturi | `groutKg > 0` | `groutKg` | kg |
| Folie parchet — XPS 3 mm | Parchet Laminat, fără `underfloorHeating` | `underlayArea` | mp |
| Folie parchet — încălzire în pardoseală (R mic) | Parchet Laminat, `underfloorHeating: true` | `underlayArea` | mp |

Reguli identice cu cele existente: păstrare id/unitPrice/status/createdAt la recalcul, ștergere când
condiția redevine falsă, `origin: "Din Configurare"`, niciodată atinse elementele `Manual`/`Din Comparator`.
⚠️ Schimbarea `underfloorHeating` schimbă NUMELE elementului de folie — reconcilerea îl actualizează ca
pe o recalculare de nume (același slot logic), nu creează un al doilea.

## Tickete

### Backend

- **ZUG-BE-1 — Model + migrare.** `V6__consumabile.sql` (`ceiling_paint`, `underfloor_heating`);
  `ceilingPaint`/`underfloorHeating` în domeniu/entitate/DTO-uri (`JsonNullable`, semantica
  absent/null/valoare din api-contract „Problema 6"); `roomHeight` + `tileSize` în structura JSONB
  `wallTiling` (DTO + domeniu + mapper; validări: `roomHeight > tileHeight`, `roomHeight ≤ 6`).
  Enum Java `MaterialType` + cele 4 valori. Criteriu: PATCH cu fiecare câmp nou persistă/șterge corect.
- **ZUG-BE-2 — Calculator.** `RoomDimensionsCalculator`: toate formulele A.1–D.10, cu ariile NETE expuse
  intern (nu derivate prin împărțire înapoi din valorile cu pierdere) și constantele cu comentariu-sursă.
  `RoomDimensionsDto` + mapper + `RoomResponse` extinse cu cele 9 câmpuri. Teste unitare pe fiecare
  formulă, minim: baie gresie 60×60 (Mare) cu faianță 2 pereți + roomHeight + tavan (verifică adeziv cu
  dublă încleiere 5.5 kg/mp, chit 0.10 kg/mp, amorse pe arii nete, vopsea agregată); dormitor parchet cu
  `underfloorHeating` true/false; cameră fără nimic configurat → toate 0; `tileSize` absent → Medie.
  Valorile așteptate în teste: calculate de mână din tabele, scrise ca numere fixe (nu prin aceeași formulă).
- **ZUG-BE-3 — Reconciliere.** `AutoItemReconciler` + cele 7 rânduri din tabelul de mai sus (inclusiv
  Vopsea la Gresie și redenumirea foliei la toggle `underfloorHeating`). Teste: activare/dezactivare
  fiecare condiție → elementul apare/dispare; prețul/statusul supraviețuiesc recalculării; elementele
  Manual/Din Comparator neatinse.

### Frontend

- **ZUG-FE-1 — Tipuri + oglinda de calcul.** `Room.ts`, `WallTiling.ts`, `RoomDimensions.ts`,
  `MaterialType.ts` actualizate; `shared/functions/dimensions.ts` — aceleași formule în
  `computeRoomDimensions` (preview 1:1 cu serverul). Registrul de funcții din `docs/progress.md` la zi.
- **ZUG-FE-2 — UI configurare.** În `RoomTechnicalCard`:
  - toggle „Zugrăvește tavanul" (orice pardoseală, doar cu `floorArea` completată);
  - la faianță: input „Înălțime cameră (m)" (validare `> tileHeight`) + select „Mărime plăci faianță"
    (opțional, `TileSize`, hint „implicit: Medie");
  - la Parchet Laminat: toggle „Încălzire în pardoseală";
  - normalizare `undefined → null` la salvare, ca la restul câmpurilor tehnice (`handleSave`);
  - panoul „Calcule Detaliate" (`roomCalcRows.ts`): rânduri noi cu formula explicită și numerele reale
    pentru: vopsea tavan, vopsea deasupra faianței, vopsea total (formatul din secțiunea „Explicația
    calculului de vopsea"), amorsă zugrăveală, amorsă placări, adeziv (kg + saci), chit (kg), folie (mp).
    Stil identic cu rândurile existente; valori `font-mono`; tokens, nu culori hardcodate.
- **ZUG-FE-3 — Verificare + docs.** `npm run build && npm run lint && npx tsc --noEmit`; manual în
  browser: configurarea completă a unei băi → în `/elemente` apar toate elementele auto-generate cu
  cantitățile din tabele; preview client = valori server după salvare (diferență 0); toggle
  `underfloorHeating` redenumește folia. `docs/api-contract.md` (Room + RoomDimensions + MaterialType) și
  `docs/progress.md` actualizate în aceeași sesiune.

## Surse (normele de consum — nu le modifica fără sursă nouă)

- Adeziv per mărime placă + gletieră: [iTiles — consum adeziv pe mp](https://itiles.ro/blog/consum-adeziv-gresie-pe-metru-patrat.html),
  [Unimat — cum se calculează adezivul](https://www.unimat.ro/blog/ghiduri-si-solutii-practice/cum-se-calculeaza-adezivul-pentru-gresie),
  [Rechenportal — tile adhesive kg/m² per notch](https://rechenportal.de/en/mixing-calculator/blog/tile-adhesive-consumption-kg-per-sqm/),
  [GoTiles — large format + back-buttering](https://www.gotiles.com/blog/how-much-tile-adhesive-do-i-need-and-which-type-is-best)
- Chit de rosturi (formulă + densitate 1.6): [Ceresit — calculator chit](https://www.ceresit.ro/servicii/calculator-chit.html),
  [Weber RO — calculator materiale](https://www.ro.weber/blog/blog/calculatorul-de-materiale-economiseste-bani),
  [iTiles — calculator chit rosturi](https://itiles.ro/calculator-chit-rosturi)
- Amorsă (0.05–0.20 l/mp/strat): [Traget — amorsă Danke, fișă consum](https://traget.ro/ro/alte-produse-chimice/119-amorsa-vopsea-lavabila-danke-4l.html),
  [MatHaus — cum se aplică amorsa](https://mathaus.ro/blog/cum-se-aplica-amorsa-Art299)
- Randament vopsea (10–16 mp/l teoretic): [Termosistem — Savana ~14 mp/l](https://www.termosistem.ro/vopsele-lacuri-lavabila/vopsea-ultrarezist-interior-savana-cu-teflon-alba-2-5-l-/-5-kg-1242.html),
  [MatHaus — necesar vopsea lavabilă](https://mathaus.ro/blog/cum-calculez-necesarul-de-vopsea-lavabila-Art263)
- Folie parchet + încălzire în pardoseală (R ≤ 0.15 m²K/W cumulat): [laminat-parchet.ro — izolația pentru parchet](https://laminat-parchet.ro/ce-trebuie-sa-stii-depsre-izolatia-pentru-parchet-2/),
  [Interior Decor — Multiprotec 1000 (R < 0.006)](https://interiordecor.ro/products/multiprotec-1000-folie-incalzire-pardoseala-substrat-parchet-laminat)
