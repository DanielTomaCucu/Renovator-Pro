# Cerințe: Keep-alive backend Render, program zilnic 08:00–22:00 — SPECIFICAȚIE, nu implementare

> **Status: ✅ implementat (KEEP-2, cron extern) — 2026-07-23.** Ticket pentru menținerea backend-ului
> treaz în fereastra orară în care userul folosește aplicația. Cerință user (2026-07-18): „vreau
> aplicația pornită pe timpul zilei… de la 8 dimineața la 9 seara, mereu"; extinsă (2026-07-23) la
> **8:00–22:00** și migrată de la GitHub Actions (KEEP-1, **eliminat**) la cron extern (KEEP-2),
> fiindcă cron-ul GitHub s-a dovedit imprecis în practică (întârzieri de ordinul orei, nu minutelor —
> exact limitarea documentată mai jos la KEEP-1, confirmată de user).

## Contextul și aritmetica (verificată 2026-07-18, actualizată 2026-07-23)

- **Render free tier:** serviciul face spin-down după **15 minute** fără trafic; primul request după
  pauză are cold-start de **~1 minut**. Planul gratuit include **750 ore de instanță / lună / workspace**;
  la epuizare, serviciile free sunt suspendate până luna următoare.
- **Fereastra cerută:** 08:00–22:00 ora României (`Europe/Bucharest`) = **14 h/zi**.
- **Consum estimat:** 14 h × 31 zile ≈ **434 h/lună** → încape lejer în 750 h, cu ~42% margine
  (marginea acoperă și traficul organic din afara ferestrei, care trezește serviciul punctual).
- ⚠️ **NU extinde fereastra la 24/7**: 24 × 31 = 744 h/lună — practic exact plafonul, zero margine;
  orice oră suplimentară suspendă serviciul.
- **Bonus necesar:** DB-ul de producție e pe **Supabase free**, care face pauză după ~7 zile fără
  activitate. Ping-ul trebuie să atingă și DB-ul, nu doar procesul Java (vezi alegerea endpointului la KEEP-2).
- **De ce NU un job intern (Spring `@Scheduled`) în backend:** un scheduler intern nu poate reînvia
  procesul din stare oprită — dacă Render a făcut spin-down, JVM-ul nu mai rulează, deci nu există cine
  să execute jobul. Ar putea, cel mult, ține procesul treaz CÂT TIMP e deja pornit, dar tot ar avea
  nevoie de un trigger extern pentru primul ping al zilei — fără să câștige nimic față de un cron extern
  simplu, dar adăugând cod și o dependență de rețea (self-HTTP-call) în aplicație. Decizie: cron extern,
  zero cod nou.

## Ticketele

### ~~KEEP-1 — Workflow GitHub Actions de keep-alive~~ (ELIMINAT 2026-07-23)

Implementat inițial ca `.github/workflows/keepalive.yml` (cron `*/10 4-19 * * *`, gardă pe ora locală
`Europe/Bucharest`, ping pe `/actuator/health`). **Șters** — cron-ul GitHub Actions s-a dovedit imprecis
în practică (întârzieri raportate de ordinul orei, nu al minutelor — GitHub nu garantează SLA de
punctualitate pe `schedule`, mai ales sub sarcină). Înlocuit integral de KEEP-2, mai jos. Fișierul YAML
nu se recreează — dacă apare din nou într-un branch vechi, se șterge la merge (nu rulăm ambele în paralel,
ar dubla requesturile fără beneficiu).

### KEEP-2 — Serviciu extern de cron (cron-job.org) — **implementare curentă**

**Scop:** un ping HTTP la fiecare 10 minute, în fereastra 08:00–22:00 `Europe/Bucharest`, cu precizie
reală (nu cron GitHub) — ține treaz serviciul Render (și, implicit, DB-ul Supabase).

**Pași de configurare (manual, pe cron-job.org — cont extern, nu se poate automatiza din repo):**

1. Cont gratuit pe [cron-job.org](https://cron-job.org) (userul face asta — creare de cont nu se
   automatizează din agent/CI).
2. Job nou:
   - **URL:** `https://<domeniul-render>/actuator/health` (același endpoint ca la KEEP-1).
   - **Schedule:** la fiecare 10 minute, în fiecare zi.
   - **Timezone:** `Europe/Bucharest` (suport nativ — fără gimnastica UTC/DST de la GitHub Actions).
   - **Fereastră orară:** 08:00–22:00 (cron-job.org suportă restricție de interval orar direct în UI,
     fără un pas de gardă separat ca la KEEP-1).
   - **Timeout:** ≥ 90s (primul ping al zilei, la 08:00, prinde cold-start-ul de ~1 min al Render — nu
     trebuie să pice ca eșec).
   - Notificări pe eșec: opțional, recomandat (email dacă job-ul eșuează de N ori consecutiv).
3. **Alegerea endpointului: `/actuator/health`** (neschimbată din KEEP-1). E public azi și rămâne public
   după Faza 5 (vezi `cerinte-autentificare.md`, AUTH-3). Spring Actuator include implicit health
   indicator de `DataSource` (execută o interogare de validare) → fiecare ping atinge și Postgres-ul
   Supabase, deci rezolvă și pauza de inactivitate Supabase.
4. `.github/workflows/keepalive.yml` **șters** din repo (acest commit) — cron-job.org e singura sursă
   de ping-uri, ca să nu dubleze traficul cu GitHub Actions.
5. Actualizat `README.md` (secțiunea Deploy) — nu mai menționează workflow GitHub, ci cron-job.org.

**De ce e mai bun decât KEEP-1:** precizie reală la minut (nu cron „best-effort" ca GitHub Actions),
suport nativ de timezone + fereastră orară (fără cod de gardă), nu depinde de activitate în repo (GitHub
dezactivează schedule-urile după 60 de zile fără commit-uri — cron-job.org nu are limitarea asta),
funcționează chiar dacă serviciul Render e complet oprit (trigger extern real, spre deosebire de orice
mecanism intern aplicației — vezi mai jos).

**DoD:**
- Job creat și activ pe cron-job.org, target `/actuator/health`, fereastră 08:00–22:00 `Europe/Bucharest`.
- După o zi de funcționare: în Render dashboard se vede că serviciul NU a dormit între 08:00–22:00
  (request la fiecare ~10 min în Logs) și că a dormit noaptea.
- Test practic dimineața: la 08:05, aplicația (Vercel) încarcă datele în < 2–3 s, fără cold-start.
- Verificat consumul în Render dashboard (Billing/Usage → instance hours) după prima săptămână:
  proiecția lunară ≤ ~470 h (14h/zi × 31 zile ≈ 434h + marjă trafic organic).

## Explicit ÎN AFARA scope-ului

- Upgrade la plan plătit Render (soluția „corectă" pe termen lung dacă apar utilizatori reali — deja
  notată în blueprint Task 7.2 ca limitare de reevaluat).
- Ping-uri 24/7 (depășește bugetul de ore — vezi aritmetica de mai sus).
- **Orice mecanism ÎN INTERIORUL aplicației** (job Spring `@Scheduled` care se auto-pingheaza): nu poate
  reînvia procesul din stare oprită (JVM-ul nu rulează, deci n-are cine să execute jobul) — ar avea
  nevoie oricum de un trigger extern pentru primul ping al zilei, deci nu elimină dependența de un
  serviciu extern, doar adaugă cod și o dependență de rețea (self-HTTP-call) fără beneficiu real față
  de cron-job.org (decizie confirmată explicit cu userul, 2026-07-23).
