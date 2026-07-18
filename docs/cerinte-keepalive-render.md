# Cerințe: Keep-alive backend Render, program zilnic 08:00–21:00 — SPECIFICAȚIE, nu implementare

> **Status: 🟡 de implementat.** Ticket pentru menținerea backend-ului treaz în fereastra orară în care
> userul folosește aplicația. Cerință user (2026-07-18): „vreau aplicația pornită pe timpul zilei…
> de la 8 dimineața la 9 seara, mereu".

## Contextul și aritmetica (verificată 2026-07-18)

- **Render free tier:** serviciul face spin-down după **15 minute** fără trafic; primul request după
  pauză are cold-start de **~1 minut**. Planul gratuit include **750 ore de instanță / lună / workspace**;
  la epuizare, serviciile free sunt suspendate până luna următoare.
- **Fereastra cerută:** 08:00–21:00 ora României (`Europe/Bucharest`) = **13 h/zi**.
- **Consum estimat:** 13 h × 31 zile ≈ **403 h/lună** → încape lejer în 750 h, cu ~45% margine
  (marginea acoperă și traficul organic din afara ferestrei, care trezește serviciul punctual).
- ⚠️ **NU extinde fereastra la 24/7**: 24 × 31 = 744 h/lună — practic exact plafonul, zero margine;
  orice oră suplimentară suspendă serviciul.
- **Bonus necesar:** DB-ul de producție e pe **Supabase free**, care face pauză după ~7 zile fără
  activitate. Ping-ul trebuie să atingă și DB-ul, nu doar procesul Java (vezi KEEP-1, alegerea endpointului).

## Ticketele

### KEEP-1 — Workflow GitHub Actions de keep-alive

**Scop:** un ping HTTP la fiecare 10 minute, în fereastra 08:00–21:00 `Europe/Bucharest`, care ține
treaz serviciul Render (și, implicit, Supabase).

**Pași:**

1. Fișier nou `.github/workflows/keepalive.yml` (repo-ul are deja Actions — `ci.yml` — deci runner-ele funcționează):
   - `on.schedule` cu cron `*/10 4-19 * * *` (**cron-ul GitHub e în UTC**; intervalul 04–19 UTC acoperă
     fereastra locală atât pe ora de vară UTC+3 cât și pe cea de iarnă UTC+2) + `on.workflow_dispatch`
     (test manual).
   - **Pas de gardă pentru ora locală** (fiindcă offsetul UTC variază cu DST): `H=$(TZ=Europe/Bucharest date +%H)`;
     ieși cu succes (fără ping) dacă `H < 8` sau `H >= 21`. Așa fereastra e EXACT 08:00–21:00 local, tot anul.
   - Pasul de ping: `curl --fail --silent --show-error --max-time 90 --retry 2 "$URL/actuator/health"`.
     `--max-time 90` fiindcă primul ping al zilei (08:00) prinde cold-start-ul de ~1 min — nu trebuie să pice.
   - URL-ul serviciului Render: **GitHub Actions Variable** (`vars.RENDER_APP_URL`), nu hardcodat în YAML
     (nu e secret, dar nu-l împrăștiem; configurare: Settings → Secrets and variables → Actions → Variables).
2. **Alegerea endpointului: `/actuator/health`.** E public azi și RĂMÂNE public după Faza 5 (vezi
   `cerinte-autentificare.md`, AUTH-3). Spring Actuator include implicit health indicator de `DataSource`
   (execută o interogare de validare) → fiecare ping atinge și Postgres-ul Supabase, deci rezolvă și pauza
   de inactivitate Supabase. **De verificat la implementare** că indicatorul `db` e activ în profilul de
   producție (răspunsul health să nu fie doar `{"status":"UP"}` fără componenta db — dacă e cazul, activează
   `management.health.db.enabled` / detaliile doar server-side, fără să expui detalii în răspunsul public).
3. Documentează în `README.md` (secțiunea Deploy) existența workflow-ului și fereastra orară.

**Limitări cunoscute (acceptate, de consemnat în YAML drept comentarii):**
- Cron-ul GitHub NU e punctual — întârzieri de minute sunt normale. Worst case: un interval între
  ping-uri depășește 15 min → serviciul ațipește o dată și următorul ping îl trezește (cold-start pe care
  nu-l vede nimeni dacă userul nu era chiar atunci în aplicație). Acceptabil; NU coborî sub `*/10` din
  cauza asta (mai multe rulări = mai mult zgomot, câștig marginal).
- GitHub dezactivează automat schedule-urile după **60 de zile fără activitate în repo**. Dacă proiectul
  intră în hibernare, workflow-ul trebuie reactivat manual (Actions → workflow → Enable). De menționat în README.

**DoD:**
- `workflow_dispatch` manual → run verde; logurile Render arată requestul pe `/actuator/health`.
- După o zi de funcționare: în Render dashboard se vede că serviciul NU a dormit între 08:00–21:00
  (request la fiecare ~10 min în Logs) și că a dormit noaptea.
- Test practic dimineața: la 08:05, aplicația (Vercel) încarcă datele în < 2–3 s, fără cold-start.
- Verificat consumul în Render dashboard (Billing/Usage → instance hours) după prima săptămână:
  proiecția lunară ≤ ~450 h.

### KEEP-2 (opțional, plan B) — serviciu extern de cron

**Scop:** doar dacă GH Actions se dovedește prea imprecis în practică (gap-uri frecvente > 15 min în loguri).

**Pași:** cont pe un serviciu gratuit de cron extern (ex. cron-job.org — interval de până la 1 min,
suport nativ de timezone `Europe/Bucharest` și fereastră orară, deci dispare și gimnastica UTC/DST) țintind
același `/actuator/health`. Workflow-ul din KEEP-1 se șterge atunci — NU ambele în paralel (dublează
requesturile fără beneficiu).

**DoD:** aceleași criterii ca la KEEP-1.

## Explicit ÎN AFARA scope-ului

- Upgrade la plan plătit Render (soluția „corectă" pe termen lung dacă apar utilizatori reali — deja
  notată în blueprint Task 7.2 ca limitare de reevaluat).
- Ping-uri 24/7 (depășește bugetul de ore — vezi aritmetica de mai sus).
- Orice mecanism în interiorul aplicației (self-ping din backend NU funcționează pe Render free —
  procesul e oprit, nu are cine să se auto-pingheze).
