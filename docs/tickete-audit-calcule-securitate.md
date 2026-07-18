# Audit: calcule de șantier (Configurare) + securitate + business logic (2026-07-18)

> **Rol document:** tichete pentru Sonnet. Auditul a fost făcut prin: citirea completă a
> `RoomDimensionsCalculator.java` / `dimensions.ts` / `AutoItemReconciler.java` / `BudgetCalculator.java`,
> a configurației de securitate backend (SecurityConfig, filtre, DTO-uri), plus **cercetare web a
> normelor reale de pierdere din industrie** (surse la fiecare tichet). Obiectivul userului: calculele
> din `/configurare` să fie **production-ready pentru muncitori/arhitecți pe șantier**.
>
> Regulile de implementare rămân cele din `CLAUDE.md`: branch+PR per tichet, contract-first, logica
> de business trăiește pe backend și e oglindită 1:1 în TS (`dimensions.ts` ↔ `RoomDimensionsCalculator.java`),
> constante ca `WASTE_RATIO_*` se schimbă SIMULTAN în ambele fișiere + în textele „Formulă" din
> `roomCalcRows.ts` (care au procentele hardcodate în stringuri!) + în testele din
> `RoomDimensionsCalculatorTest`/`AutoItemReconcilerTest`.

---

## A. CALCULE — pierderi de material (prioritatea userului)

### Starea actuală din cod (constatată)

| Constantă | Valoare azi | Unde |
|---|---|---|
| `WASTE_RATIO_MATERIAL` (pardoseală + faianță) | **10%** flat | `dimensions.ts:4` / `RoomDimensionsCalculator.java` |
| `WASTE_RATIO_BASEBOARD` (plintă) | 5% | idem |
| `WASTE_RATIO_PAINT` (vopsea) | 10% | idem |
| `WASTE_RATIO_WALLPAPER` (tapet) | 15% | idem |
| `WASTE_RATIO_WINDOW_TRIM` (glaf) | 5% | idem |

### CALC-1 (P0) — `installationType` e colectat din UI dar IGNORAT în calcul

**Cea mai mare eroare față de practica reală.** UI-ul de configurare cere „Tip montaj"
(`InstallationType`: Drept / Diagonal / Herringbone), dar `floorMaterialNeeded()` aplică **10% flat
indiferent de montaj**. Normele din industrie:

| Montaj | Pierdere reală (industrie) | Aplicația azi |
|---|---|---|
| Drept | 5–10% (10% e alegerea sigură) | 10% ✅ |
| Diagonal | **15%** | 10% ❌ (subestimat ~5%) |
| Herringbone | **18–20%** | 10% ❌ (subestimat ~8–10%!) |

Pe un living de 30 mp cu parchet herringbone, aplicația recomandă 33 mp; realitatea de șantier e
~35.4–36 mp — muncitorul rămâne fără material.

**Remediere:**
1. `RoomDimensionsCalculator.java` + `dimensions.ts`: `floorWasteRatio(room)` — funcție nouă care
   întoarce 0.10 / 0.15 / 0.18 după `room.installationType` (fallback 0.10 dacă lipsește).
   `floorMaterialNeeded` o folosește în loc de `WASTE_RATIO_MATERIAL`.
2. `roomCalcRows.ts`: textul „Formulă"/„Calcul" afișează procentul REAL aplicat (azi are „+ 10% pierdere"
   hardcodat în string — trebuie derivat din același loc, nu duplicat).
3. Teste noi pe fiecare `InstallationType` (Java) + verificare vizuală în panoul „Calcule Detaliate".
4. `docs/api-contract.md` — notează regula la §Room/dimensions.

Surse: [MakeCalcs — Tile Waste Factor by Pattern (10/15/18%)](https://makecalcs.net/blog/tile-waste-factor-guide),
[2020 Flooring — Waste Calculator](https://2020flooring.com/flooring-waste-calculator),
[Flooring365 — How much wastage](https://flooring365.co.uk/blog/post/how-much-flooring-wastage-do-you-need-to-account-for-when-ordering-new-floors.html),
[Home Project Calculator — laminate 15% diagonal, 18–20% herringbone](https://homeprojectcalculator.com/laminate-flooring-calculator/).

### CALC-2 (P1) — `tileSize` (mărimea plăcilor) colectat dar IGNORAT

„Mărime plăci" (Mică/Medie/Mare/Foarte Mare) există în UI la Gresie, dar nu influențează niciun calcul.
Industria: plăci standard (~600×600) ≈ 5–7% la montaj drept; **formatele mari (600mm+) au nevoie de
+2% peste baza pattern-ului** (fiecare placă tăiată greșit pierde multă acoperire) — un montaj drept cu
plăci mari e mai aproape de 12% decât de 10%.

**Remediere:** în `floorWasteRatio` (din CALC-1), la Gresie adaugă +2% pentru `TileSize.Mare`/`FoarteMare`.
Aplică același supliment și la faianță (`wallTilingArea`) dacă se decide că `tileSize` descrie și plăcile
de perete (de clarificat cu userul — azi câmpul e doar la pardoseală).

Surse: [SupplyCalc — Tile Waste Factor Guide](https://supplycalc.com/guides/tile-waste-factor/),
[MakeCalcs](https://makecalcs.net/blog/tile-waste-factor-guide),
[Surfaces Galore — How much extra tile](https://www.surfacesgalore.com/blogs/news/how-much-extra-tile-should-you-order-understanding-and-calculating-waste).

### CALC-3 (P1) — Perimetrul derivat `4×√suprafață` ignoră lungimile de pereți deja introduse

`roomPerimeter()` (fix-ul recent pentru plintă) folosește `perimeter` explicit sau `4×√floorArea`
(presupune cameră pătrată). **Dar** dacă userul a completat lungimile reale ale pereților
(`wallTiling.wallLengths` / `wallFinish.wallLengths` — formă Dreptunghi/Neregulată), acelea sunt
ignorate. O cameră de 12 mp de 6×2 m are perimetrul 16 m, nu 13.86 m → plinta subestimată cu ~15%.

**Remediere:** `roomPerimeter` preferă, în ordine: (1) `perimeter` explicit, (2) **suma celor 4
`wallLengths`** dacă toate sunt > 0 (din `wallTiling` sau `wallFinish`), (3) `4×√floorArea`.
Identic TS + Java, test cu cameră dreptunghiulară.

### CALC-4 (P1) — Vopsea: rezultatul în „mp" nu e direct folosibil pe șantier + lipsesc straturile

`wallFinishArea(VOPSEA)` = arie × 1.10 și afișează „mp". Pe șantier vopseaua se cumpără în **litri**:
norma e 10–12 mp/litru/strat, iar interiorul standard = **2 straturi**. Un perete de 20 mp înseamnă
~3.6–4 litri, informație pe care aplicația n-o dă. 10% pierdere e OK ca factor (industria folosește
~10% pt. retușuri/absorbție), dar fără straturi și litri, cifra „22 mp" e derutantă.

**Remediere:**
1. Păstrează aria (corectă), dar adaugă în „Calcule Detaliate" un rând derivat: `litri ≈ arie × 2 straturi
   ÷ 11 mp/l` (constante numite: `PAINT_COATS = 2`, `PAINT_COVERAGE_SQM_PER_LITER = 11`), rotunjit în sus la 0.5 l.
2. Elementul auto „Vopsea" rămâne pe mp (prețul e per mp sau per cutie — userul completează), dar
   descrierea/nota din panou explică conversia.
3. Constante în ambele limbaje + test.

Surse: [Birla Opus — Paint Coverage Guide (10–12 mp/l/strat)](https://www.birlaopus.com/blog/paint-coverage-guide),
[Farrow & Ball — Calculating Paint Quantities](https://www.farrow-ball.com/how-to-guide/paint/calculating-paint-quantities),
[Turn2Engineering — Paint Coverage Calculator (10% waste)](https://turn2engineering.com/calculators/paint-coverage-calculator).

### CALC-5 (P2) — Tapet: 15% flat e OK ca medie, dar realitatea depinde de raportul modelului

Industria: tapet uni/fără model ≈ **10%**; model cu potrivire dreaptă ≈ **10–15%**; model half-drop /
raport mare (>26 cm) ≈ **20–25%**. 15% flat e o medie rezonabilă, dar pentru „production ready":

**Remediere (decizie cu userul):** fie (a) păstrezi 15% și documentezi explicit în UI („estimare medie;
la modele cu raport mare comandă 20–25%"), fie (b) adaugi un câmp opțional „Raport model" (fără/mic/mare)
care alege 10/15/22%. Varianta (a) e acceptabilă pe termen scurt; nota din panou e obligatorie.
Bonus șantier: afișează și **numărul de role** (rola standard RO/UE = 0.53 × 10.05 m ≈ 5.3 mp).

Surse: [RenoCalcHub — Wallpaper Pattern Repeat & Waste](https://renocalchub.com/blog/interior/wallpaper-pattern-repeat.html),
[James Dunlop — How to calculate wallpaper](https://www.jamesdunloptextiles.com/journal/tips-how-to/how-to-calculate-wallpaper-requirements),
[Omni — Wallpaper Calculator](https://www.omnicalculator.com/construction/wallpaper).

### CALC-6 (P2) — Mochetă: calculul pe mp+10% ignoră lățimea rolei

Mocheta se vinde la **rolă cu lățime fixă** (uzual 4 m / 5 m în RO). O cameră de 4.5 m lățime dintr-o
rolă de 4 m forțează o fâșie suplimentară → pierderea reală poate depăși ușor 15–20%, nu 10%.
Industria: 10% camere dreptunghiulare simple, 15–20% forme complexe/model.

**Remediere (minim viabil):** notă vizibilă în „Calcule Detaliate" la Mochetă: „calcul pe suprafață;
verifică lățimea rolei — camerele mai late decât rola cresc pierderea la 15–20%". Opțional (v2): câmp
„lățime rolă" + calcul pe fâșii. Nu lăsa 10% fără avertisment.

Surse: [MiniWebTool — Carpet Calculator](https://miniwebtool.com/carpet-calculator/),
[CalcExp — Carpet Area/Seams/Waste](https://calcexp.com/engineering-manufacturing-calculators/carpet-area-calculator/),
[2020 Flooring](https://2020flooring.com/flooring-waste-calculator).

### CALC-7 (P2) — Faianță: 10% corect la montaj drept, dar fără supliment de complexitate

`wallTilingArea` scade INTEGRAL golurile ușilor/ferestrelor apoi aplică 10%. E matematic corect, dar
practica de șantier adaugă 2–3% per complicație (nișe, țevi, colțuri interne) și mulți montatori nu
scad complet golurile (tăieturile din jurul lor produc rebut). Pentru siguranță pe șantier:

**Remediere:** păstrează formula, dar (a) scade doar ~50% din aria golurilor SAU (b) păstrează scăderea
completă și urcă pierderea la 12% la băi cu >1 gol pe pereții placați. Alege (a) sau (b) cu userul,
documentează în `roomCalcRows.ts` textul formulei. + vezi CALC-2 pentru formatele mari.

Surse: [Stone Superstore — reasonable tile wastage](https://www.stonesuperstore.co.uk/advice/tile-installation/what-is-a-reasonable-amount-of-tile-wastage),
[Herron — Tile Waste Calculator](https://herron.app/tools/tile-waste-calculator).

### CALC-8 (P3) — Plintă 5% + glaf 5%: corecte, dar fără rotunjire la bară

5% e norma pentru tăieri la colțuri — OK. Pe șantier însă plinta/glaful se cumpără în **bare de
lungime fixă** (uzual 2 m / 2.5 m). 14.55 ml = 8 bare de 2 m (16 m), nu „14.55". **Remediere
(nice-to-have):** rând suplimentar „≈ N bare de 2 m" în panou (constantă `BASEBOARD_BAR_LENGTH_M = 2`).

### Verificare generală calcule — ce E corect deja (nu strica)

- Formula ariilor (lungime×înălțime − goluri), plinta din perimetru − uși, glaful pe perimetrul
  ferestrelor ×1.05, plinta din gresie tăiată din plăci (`baseboardTileArea`) — corecte și conforme
  practicii; testate în `RoomDimensionsCalculatorTest`.
- Regula „doar Cumpărat contează la cheltuit" (BudgetCalculator) — consecventă peste tot.
- Reconcilierea auto-items păstrează id/preț/status și șterge orfanele — corectă.

---

## B. SECURITATE

### SEC-1 (P1) — Rate limiter-ul de auth are încredere oarbă în `X-Forwarded-For`

`AuthRateLimitFilter.clientIp()` ia **primul** element din `X-Forwarded-For` — valoare controlată de
client (proxy-urile doar adaugă la listă). Un atacator trimite `X-Forwarded-For: <random>` la fiecare
cerere → (a) **bypass complet al rate limit-ului de brute-force** și (b) `requestTimestampsByIp` crește
nelimitat (un Deque nou per valoare falsificată) → **epuizare de memorie**.

**Remediere:** pe Render există exact un proxy de încredere: folosește ultima valoare din listă (sau
`request.getRemoteAddr()` + `server.forward-headers-strategy: native` cu proxy de încredere configurat).
Adaugă și un plafon pentru mapă (ex. LRU / curățare periodică a IP-urilor fără activitate în fereastră).
Test: cerere cu XFF falsificat nu ocolește limita.

### SEC-2 (P1) — `productUrl`/`imageUrl` nevalidate → stored XSS prin `javascript:` + DoS prin payload uriaș

- `ItemCreateRequest`/`ItemUpdateRequest` nu au NICIO validare pe `productUrl`/`imageUrl` (nici schema,
  nici lungime; coloane `TEXT` nelimitate).
- `ItemDetailsDrawer.tsx:121` pune `productUrl` direct în `href` → un membru EDITOR răuvoitor (sau un
  link importat) poate salva `javascript:...` care se execută la click în sesiunea altui membru
  (**stored XSS** — React nu sanitizează `href`).
- `imageUrl` acceptă data-URL-uri base64 nelimitate → elemente de zeci de MB în DB (bloat + lățime de bandă).

**Remediere:**
1. Backend (sursa de adevăr): validare pe ambele câmpuri — `productUrl` doar `http(s)://`, max ~2000
   caractere; `imageUrl` doar `http(s)://` sau `data:image/(png|jpeg|webp);base64,`, max ~500KB
   (aliniat cu ce produce feature-ul „Fă o poză"; decide plafonul cu userul).
2. Frontend: la randare, `href` doar dacă URL-ul parsat are protocol http/https (funcție mică
   `safeHttpUrl()` în `shared/functions`), altfel text simplu.
3. Test backend: POST cu `javascript:alert(1)` → 400.

### SEC-3 (P2) — Swagger public în configurația de securitate și pe prod

`SecurityConfig` permite `permitAll` pe `/swagger-ui/**`, `/v3/api-docs/**` necondiționat. Springdoc e
dezactivat pe prod prin `application.yml` (bine!), deci azi rutele dau 404 — dar apărarea depinde de un
singur flag; dacă cineva activează springdoc pe prod, întreaga suprafață API devine publică documentată.
**Remediere:** scoate matcherii de swagger din `SecurityConfig` pe profilul non-dev (sau condiționează
cu `@Profile("dev")` un filter chain separat). Apărare în adâncime, efort mic.

### SEC-4 (P2) — Parole >72 de bytes: BCrypt le trunchiază/refuză

`RegisterRequest` acceptă parole până la 200 caractere, dar BCrypt procesează doar primii **72 bytes**
(Spring Security nou aruncă excepție peste limită → ar ieși un 500/400 derutant; versiunile vechi
trunchiază silențios — ambele rele). **Remediere:** `@Size(max = 72)` pe parolă (mesaj clar în RO)
sau pre-hash SHA-256 înainte de BCrypt. Test cu parolă de 100 caractere.

### SEC-5 (P2) — `handleIllegalArgument` returnează `ex.getMessage()` brut către client

`GlobalExceptionHandler` traduce ORICE `IllegalArgumentException` în 400 cu mesajul excepției. Mesajele
Jackson/JJWT/librării includ nume complete de clase și detalii interne (information disclosure minoră,
și mesaje în engleză în UI-ul românesc). **Remediere:** păstrează 400, dar cu un mesaj generic
(„Valoare invalidă în cerere") + loghează mesajul original server-side. Pentru enum-uri, prinde
`HttpMessageNotReadableException` separat cu mesaj prietenos.

### SEC-6 (P3) — CSRF pe `/api/auth/logout` și `/api/auth/refresh` (cookie SameSite=None pe prod)

Cu `SameSite=None`, un site terț poate declanșa POST-uri către logout (delogare forțată — nuisance) și
refresh (rotirea emite Set-Cookie către browserul victimei; răspunsul nu poate fi citit datorită CORS,
deci fără furt de token, dar rotirea forțată repetată poate invalida sesiuni). Risc REAL scăzut (CORS
strict + token opac), dar ieftin de închis: **Remediere:** cere un header custom (ex. `X-Requested-With`)
pe refresh/logout — cererile cross-site fără CORS preflight nu-l pot seta; backend-ul îl verifică.

### SEC-7 (P3) — Fără lockout per cont (doar per IP)

Rate limit-ul e per IP; un atacator distribuit (sau cu XFF spoofing, vezi SEC-1) poate încerca parole
pe un același username din multe IP-uri. **Remediere (după SEC-1):** contor de eșecuri per username cu
backoff progresiv (ex. 5 eșecuri → 15 min), stocat în DB ca să supraviețuiască restartului.

### Ce E solid deja (confirmat, nu atinge)

- IDOR: `MembershipGuard` pe toate use case-urile, refuz uniform 404 (nu 403) — testat în
  `IdorAuthorizationIntegrationTest`. Foarte bine.
- Refresh token: opac 256-bit, hash SHA-256 în DB, rotire strictă cu reuse-detection, revocare la
  eliminarea membrului. Corect.
- Access token în memorie pe frontend (nu localStorage), cookie httpOnly/Secure. Corect.
- BCrypt strength 12, secrete exclusiv din env pe prod, CORS allowlist fără wildcard, Flyway-only DDL,
  `ProblemDetail` fără stack traces, enum-uri validate la deserializare. Corecte.

---

## C. BUSINESS LOGIC — restul aplicației

### BIZ-1 (P2) — Conversia de monedă folosește curs introdus manual, fără plauzibilitate

`ConvertProjectCurrencyService` acceptă orice `exchangeRate > 0`. O typo (0.497 în loc de 4.97)
distruge IREVERSIBIL toate sumele proiectului (conversia e persistată, destructivă — documentat în
audit-remedieri). **Remediere:** (a) validare de plauzibilitate pentru RON/EUR (ex. 3–8, configurabilă),
sau măcar (b) dialog de confirmare pe frontend care arată un exemplu („100 EUR → 497 RON. Confirmi?").
Istoricul de curs hardcodat din Setări (`EXCHANGE_RATE_HISTORY`, date fictive) trebuie eliminat — pe un
tool de șantier, datele false erodează încrederea (semnalat și în auditul anterior, S-2).

### BIZ-2 (P2) — `purchaseProgress` numără bucăți, nu valoare

„Progres achiziții 50%" la 1 element de 10.000 EUR necumpărat + 1 plintă de 30 EUR cumpărată e
înșelător pe un dashboard de buget. **Remediere (decizie cu userul):** fie redenumește clar
(„Elemente cumpărate: N din M"), fie adaugă un al doilea indicator ponderat valoric
(`totalSpent / totalEstimated` există deja ca `budgetEfficiency`). Efort mic, claritate mare.

### BIZ-3 (P3) — Elementele auto au preț 0 și status „În așteptare" fără semnal în UI de buget

Din configurare rezultă elemente cu `unitPrice = 0` → apar în totaluri cu 0 și fac donut-ul/”total
estimat” să pară că „nu reacționează" la configurare (cauza percepției din TICKET-4 al auditului
anterior). **Remediere:** badge „fără preț" pe elementele cu preț 0 în `/elemente` + un hint în
`/analiza` („N elemente nu au preț — completează-le pentru un total real").

### BIZ-4 (P3) — `budgetEfficiency` împarte prin `float` — pierdere de precizie pe sume mari

`BudgetCalculator.budgetEfficiency` folosește `floatValue()` pe `BigDecimal`. La sume mari precizia
scade (cosmetic — e un procent întreg), dar convenția proiectului e „toate sumele BigDecimal".
**Remediere:** împărțire `BigDecimal` cu `RoundingMode.HALF_UP`. Consistență, efort minim.

### BIZ-5 (P3) — Suprafața camerelor nu e limitată de „Suprafață Totală Apartament"

Poți configura camere care însumează 300 mp într-un apartament declarat de 60 mp; progresul de
configurare (`configuredRoomsRatio`) nu observă. **Remediere:** avertisment non-blocant în
`/configurare` când `Σ floorArea > totalArea` („camerele însumează X mp, apartamentul e declarat Y mp").

---

## Ordinea recomandată

1. **CALC-1** (installationType în pierderi) — impactul maxim pe corectitudinea de șantier.
2. **SEC-1 + SEC-2** — singurele cu risc de securitate practic.
3. **CALC-3** (perimetru din wallLengths) — corectitudinea plintei.
4. **CALC-2, CALC-4** — tileSize + litri de vopsea.
5. **SEC-3/4/5** — hardening ieftin.
6. **CALC-5/6/7/8, BIZ-1…5, SEC-6/7** — pe măsură ce e timp; grupabile logic (toate CALC într-un PR
   dacă rămân mici, SEC separate).
