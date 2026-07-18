# Cerințe: Autentificare & conturi (execuția Fazei 5) — SPECIFICAȚIE, nu implementare

> **Status: 🟡 de implementat.** Acest document e setul de tickete pentru Faza 5 din
> [`backend-blueprint.md`](backend-blueprint.md) (§5 „Securitate — principii" + „FAZA 5"), adaptat la
> cerințele exprimate de user pe 2026-07-18. Ordinea ticketelor e obligatorie (fiecare depinde de
> precedentul). Nu implementa nimic din acest document fără să citești întâi blueprint-ul §5 și
> convențiile din `CLAUDE.md` (workflow Git: branch nou, niciodată push pe `main`).

## Ce a cerut userul (sursa cerinței)

- Proiectul să fie **securizat**: cont propriu, fără cont nu accesezi nimic.
- **Login minimal: nume + parolă.** Fără email, fără alte câmpuri.
- **La înregistrare: nume + parolă + proiectul** (numele proiectului) — atât.
- Se execută acum Faza 5 din blueprint (fusese amânată intenționat — „se face ultima"; a venit momentul).

## Decizii luate (abateri documentate față de blueprint)

| # | Decizie | Motivare |
|---|---|---|
| D1 | **Login pe `username`, nu pe email.** Coloană nouă `users.username` (UNIQUE NOT NULL), `email` devine NULLABLE și rămâne în schemă (nefolosit deocamdată). | Cerință explicită user („numele și parola, atât"). Emailul nu se șterge din schemă — zero pierdere de date, ușor de reactivat. |
| D2 | **Fără flux de resetare parolă.** | Consecință directă a D1: fără email nu ai unde trimite linkul de reset. Acceptat conștient — aplicație personală; parola pierdută se resetează manual în DB (BCrypt hash nou). De notat în `/login` UI? NU — nu promitem ce nu există. |
| D3 | **Primul cont înregistrat „adoptă" proiectul seed** `00000000-0000-0000-0000-000000000010` (cel cu datele reale ale userului, azi deținut de userul stub): `owner_id` se mută pe noul cont, se creează membership OWNER, titlul proiectului devine cel introdus la register. Conturile următoare primesc proiect nou, gol. | Datele reale existente (camere, elemente, istoric) NU trebuie pierdute sau orfane. Alternativa (proiect nou gol pentru toți + migrare manuală SQL a datelor) e mai fragilă. |
| D4 | **Single-project per user** (register creează exact un proiect, userul e OWNER). | Deja decis în blueprint Task 5.2; multi-proiect rămâne extensie ulterioară. |
| D5 | Restul rămâne **exact ca în blueprint**: BCrypt ≥ 12, access JWT 15 min HS256 (secret din env), refresh token opac rotit + hash în DB (`refresh_tokens`), rate limiting pe `/api/auth/**`, stateless, fără CSRF pe API JWT, erori ProblemDetail. | Deciziile din blueprint §1/§5 nu se redeschid. |
| D6 | **Partajarea proiectului = cod de invitație introdus LA ÎNREGISTRARE.** Fiecare proiect are un cod scurt generat server-side, vizibil doar pentru OWNER (pagina Setări), regenerabil. La register alegi: „proiect nou" (dai `projectName`) SAU „mă alătur" (dai `inviteCode`) — exact unul din două. Cine se alătură devine **EDITOR** (poate CRUD camere/elemente; nu modifică proiectul/bugetul total, nu vede/regenerează codul, nu șterge membri — astea rămân OWNER, conform blueprint §5.2). | Cerință user (2026-07-18): 2+ persoane pe același proiect. Fără email în sistem (D1) invitațiile pe email sunt imposibile; invitația „după username" ar cere cont existent → userul ar avea deja propriul proiect → multi-proiect + selector de proiecte, complexitate refuzată. Codul la register păstrează regula „un user = un proiect" (D4). |
| D7 | **Rolul acordat prin cod e fix EDITOR** în v1 — fără selector de rol la generarea codului, fără VIEWER în UI. | Simplitate; VIEWER/roluri configurabile = extensie ulterioară banală (o coloană `role` pe invitație), nu se construiește acum ce nu cere nimeni. |

---

## Ticketele

### AUTH-1 — Contractul API întâi (`docs/api-contract.md`)

**Scop:** documentarea completă a endpoint-urilor de auth ÎNAINTE de orice cod (regulă din blueprint Task 5.1: „documentează întâi endpoint-urile în api-contract.md").

**Pași:** adaugă în `api-contract.md` o secțiune „Autentificare" cu shape-urile exacte:

- `POST /api/auth/register` — body `{ username, password, projectName?, inviteCode? }` — **exact unul** din `projectName`/`inviteCode` (ambele sau niciunul → `400`). Cu `projectName`: creează proiect nou, user OWNER. Cu `inviteCode`: user devine EDITOR pe proiectul codului, NU se creează proiect. → `201` cu `{ accessToken, user: { id, username }, project: { id, title, ... } }` + cookie httpOnly cu refresh token. Erori: `409` username deja luat, `400` validare, `404` cod de invitație inexistent/regenerat (mesaj generic „cod invalid" — nu confirmăm ce coduri există).
- `POST /api/auth/login` — body `{ username, password }` → `200` același shape ca register. Eroare: `401` credențiale greșite (mesaj generic, NU „userul nu există" vs „parolă greșită" — nu confirmăm existența conturilor).
- `POST /api/auth/refresh` — fără body; refresh token din cookie → `200 { accessToken }` + cookie NOU (rotire). `401` dacă tokenul e expirat/revocat/necunoscut.
- `POST /api/auth/logout` — revocă refresh token-ul curent + șterge cookie-ul → `204`.
- `GET /api/auth/me` — cu access token → `200 { user, project }` (proiectul userului curent — frontend-ul își ia de aici ID-ul de proiect, vezi AUTH-5).
- Reguli de validare (Bean Validation, aceleași în contract și în DTO-uri): `username` 3–40 caractere, `^[a-zA-Z0-9._-]+$`, case-insensitive unique (stocat lowercase); `password` minim 8 caractere (fără reguli de complexitate arbitrare); `projectName` 1–200 caractere.
- Documentează și cookie-ul: nume (ex. `rp_refresh`), `HttpOnly; Secure; SameSite=None; Path=/api/auth`, durată (ex. 30 zile).
- **Partajare proiect (D6)** — endpoint-uri doar-OWNER (alt rol → `404`, ca la orice IDOR):
  - `GET /api/projects/{id}/invite-code` → `200 { inviteCode }` (generat leneș la prima cerere, dacă lipsește).
  - `POST /api/projects/{id}/invite-code/regenerate` → `200 { inviteCode }` nou; codul vechi devine imediat invalid (nu afectează membrii deja alăturați).
  - `GET /api/projects/{id}/members` → `200 [{ userId, username, role }]` (vizibil oricărui membru — să vezi cu cine împarți proiectul nu e secret).
  - `DELETE /api/projects/{id}/members/{userId}` → `204`; doar OWNER; OWNER-ul NU se poate șterge pe sine (→ `400`); membrului șters i se revocă toate refresh token-urile (acces tăiat cel târziu la expirarea access token-ului, ≤ 15 min).

**DoD:** secțiunea există în `api-contract.md`, cu exemple de request/response și toate codurile de eroare; niciun shape „decis din mers" în cod mai târziu.

### AUTH-2 — Migrare Flyway `V5__auth.sql`

**Scop:** schema pentru login pe username + refresh tokens.

**Pași:**
1. `ALTER TABLE users ADD COLUMN username VARCHAR(40)`; backfill pentru userul stub (`username = 'stub'` sau similar); apoi `SET NOT NULL` + `UNIQUE` (index unic pe `lower(username)` pentru unicitate case-insensitive).
2. `ALTER TABLE users ALTER COLUMN email DROP NOT NULL` (D1 — emailul rămâne, dar nu mai e obligatoriu).
3. `CREATE TABLE refresh_tokens (id VARCHAR(36) PK, user_id FK→users ON DELETE CASCADE, token_hash VARCHAR(...) NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())` + index pe `user_id` — exact schema anticipată în blueprint §4.
4. `ALTER TABLE projects ADD COLUMN invite_code VARCHAR(16) UNIQUE` (D6) — NULLABLE; codul se generează server-side la prima cerere a OWNER-ului (nu în migrare — SQL-ul nu generează coduri cu entropia cerută). Format: generat criptografic (`SecureRandom`), ≥ 48 biți entropie, alfabet fără caractere ambigue (ex. 10 caractere din `A-HJ-NP-Z2-9`).
5. Migrarea trebuie să fie **incrementală și sigură pe DB-ul de producție Supabase** (V1–V4 sunt deja aplicate acolo; nu se modifică migrări vechi).

**DoD:** `SchemaMigrationTest` (Testcontainers) verde; migrarea rulează curat peste un DB care are deja V1–V4 + date.

### AUTH-3 — Backend: register/login/refresh/logout + JWT (blueprint Task 5.1)

**Scop:** fluxul complet de autentificare, conform contractului din AUTH-1.

**Pași (pe scurt — detaliile normative sunt în blueprint §5 și Task 5.1):**
- `AuthController` în `adapter/in/web`, use case-uri în `application` (`RegisterUserUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, `LogoutUseCase`), fără logică de business în controller — respectă arhitectura hexagonală existentă (regula de dependență din `backend/README.md`).
- BCrypt strength ≥ 12; access JWT HS256 15 min (claims: `sub` = userId, `username`), **secret exclusiv din env var** (`JWT_SECRET`, minim 256 biți) — niciodată în git; `.env.example` actualizat.
- Refresh token: valoare opacă random (≥ 256 biți), stocat DOAR hash-uit (SHA-256), rotit la fiecare `/refresh` (cel vechi se revocă), livrat în cookie httpOnly (atributele din AUTH-1).
- `SecurityFilterChain`: publice DOAR `/api/auth/**` + `/actuator/health` (health rămâne public — e nevoie de el și pentru keep-alive, vezi `cerinte-keepalive-render.md`); restul autentificat; stateless; fără CSRF pe API-ul JWT.
- Rate limiting pe `/api/auth/**` (ex. Bucket4j, per IP) — anti brute-force.
- La register: creare user + logica de proiect din D3/D4 (detaliată în AUTH-4 — poate fi implementată împreună).

**DoD (din blueprint, obligatoriu integral):** teste de integrare pe fluxul complet (register → login → acces cu token → refresh → logout → refresh eșuează); token expirat → `401` ProblemDetail; **parolele nu apar niciodată în loguri** (verificat explicit — nici în logurile de request, nici în excepții); username dublu → `409`.

### AUTH-4 — Backend: autorizare pe membership + eliminarea stub-ului (blueprint Task 5.2)

**Scop:** activarea reală a `project_members`; niciun endpoint nu mai operează „pe încredere".

**Pași:**
- Port `CurrentUserProvider` în `application/port`; implementarea web extrage userId din `SecurityContext` (JWT validat). **`WebConstants.STUB_USER_ID` se ȘTERGE** — era exact punctul pregătit pentru asta („threadat prin use case-uri deja acum... ca autorizarea să nu fie retrofit").
- Fiecare use case verifică membership + rol pe proiectul resursei (item→room→project→membership): EDITOR poate CRUD rooms/items; doar OWNER modifică/șterge proiectul; VIEWER doar citește.
- Register: implementează D3 — dacă proiectul seed `...-010` e încă deținut de userul stub `...-001`, primul register cu `projectName` îl adoptă (transfer `owner_id`, membership OWNER, retitrare cu `projectName` primit); altfel creează proiect nou cu `projectName`, buget 0, EUR, + membership OWNER. Totul într-o singură tranzacție.
- Register cu `inviteCode` (D6): rezolvă codul → proiect; creează userul + membership **EDITOR** pe acel proiect; NU creează proiect. Cod inexistent → `404` generic („cod invalid"), fără să distingă „nu există" de „a fost regenerat". Comparația codului în query parametrizat, case-sensitive. Adopția seed NU se aplică pe această cale (primul register din sistem nu poate avea cod — nu există încă niciunul).
- `GET /api/auth/me` și login returnează proiectul din **membership** (singurul), nu din ownership — un EDITOR primește proiectul la care s-a alăturat.
- Userul stub din V2 rămâne în DB doar cât timp nu a avut loc adopția; după adopție nu mai deține nimic (opțional: migrare/cleanup ulterior — NU în acest ticket).

**DoD (din blueprint, obligatoriu):** teste IDOR pe **fiecare** endpoint — userul A primește `404` (nu `403` — nu confirmăm existența resursei) pentru resursele userului B; VIEWER nu poate scrie; doar OWNER șterge proiectul. Test dedicat pentru adopția seed (primul cont vede datele existente; al doilea cont primește proiect gol și NU vede datele primului).

### AUTH-5 — Frontend: pagini `/login` + `/register`, sesiune, client API (blueprint Task 5.3)

**Scop:** UI de autentificare minimal, conform design system-ului din `CLAUDE.md`.

**Pași:**
- Pagini `/login` (nume + parolă) și `/register` — carduri pe `bg-background`, tokens de culoare existenți, fonturi existente, texte în română cu diacritice, erori afișate ca text `text-tertiary` (fără toast library nouă). Link încrucișat între ele („Nu ai cont? Înregistrează-te").
- `/register` are **două moduri** (D6), comutate printr-un toggle simplu (două tab-uri sau radio — nu wizard): „**Creez proiect nou**" (câmpuri: nume, parolă, numele proiectului) și „**Mă alătur unui proiect**" (câmpuri: nume, parolă, cod de invitație). Un singur submit, body-ul diferă doar prin `projectName` vs `inviteCode`. Eroarea „cod invalid" se afișează la câmpul de cod.
- `api-client.ts`: access token ținut **în memorie** (nu localStorage); header `Authorization: Bearer ...` pe toate apelurile; pe `401` → o singură încercare `/refresh` (cu `credentials: "include"`) apoi retry; dacă refresh-ul eșuează → curăță sesiunea + redirect `/login`. Toate apelurile de auth cu `credentials: "include"` (cookie cross-site).
- **`DEFAULT_PROJECT_ID` hardcodat se ELIMINĂ** din `api-client.ts` — ID-ul de proiect vine din răspunsul login/`/api/auth/me` și trăiește în context (store sau un `AuthProvider` subțire deasupra `StoreProvider`).
- Protecție rute client-side: fără sesiune → redirect `/login`; `StoreProvider` nu face fetch de date înainte de sesiune validă (la boot: `/refresh` silențios → dacă reușește, user rămâne logat între refresh-uri de pagină).
- `Sidebar`: afișează username-ul + buton Logout (`account_circle` există deja în `NAV_ICONS`).
- Se respectă integral `cerinte-loading-states.md`: butoanele Login/Register folosesc `useAsyncAction` + `<Spinner />` (backend-ul pe Render are cold-start — exact cazul pentru care există regula).
- Tipuri noi conform regulilor de aur: `User.ts`, `AuthSession.ts` etc. în `shared/types/` (un fișier per interfață, barrel actualizat).

**DoD:** flux complet în browser contra backend-ului local (register → date vizibile → logout → login); refresh de pagină NU deloghează; `npm run build` + `npm run lint` + `npx tsc --noEmit` curate; verificare vizuală desktop + mobil; registru de funcții/`progress.md` actualizate.

### AUTH-6 — Deploy & config producție (Render + Vercel)

**Scop:** auth funcțional în producție, cross-origin.

**Pași:**
- Env pe Render: `JWT_SECRET` (generat, ≥ 256 biți, doar în dashboard-ul Render).
- CORS (config existent, allowlist explicit): domeniul Vercel + `localhost:3001`, cu `Access-Control-Allow-Credentials: true` — obligatoriu pentru cookie-ul de refresh.
- Cookie refresh în prod: `Secure; SameSite=None` (Vercel și Render sunt site-uri diferite — fără `SameSite=None` cookie-ul nu pleacă cross-site). Pe dev local (`localhost:3001` → `localhost:8080`) `SameSite=Lax` e suficient; fă atributul configurabil pe profil.
- ⚠️ **Risc cunoscut de verificat la implementare:** Safari/iOS (ITP) poate bloca cookie-uri third-party chiar cu `SameSite=None`. De testat explicit pe Safari după deploy. Dacă e blocat: plan B documentat înainte de a-l implementa (ex. refresh token în memorie+localStorage cu rotire agresivă, sau domenii sub același eTLD+1) — decizie separată, NU se improvizează.
- După ce totul e verde: actualizează `README.md` (secțiunea Backend — Faza 5 nu mai e „amânată"), `CLAUDE.md` (stadiu + dispariția stub-ului `currentUserId`), `docs/progress.md`.

**DoD:** register/login/refresh/logout funcționale pe produsul deployat (Vercel ↔ Render); un browser secundar fără cont nu poate accesa nicio pagină de date și niciun endpoint API (verificat cu `curl` fără token → `401`).

### AUTH-7 — Partajare proiect: management cod + membri (backend + UI Setări)

> Depinde de AUTH-1…AUTH-5 (calea „register cu cod" e deja în AUTH-3/4); poate merge înainte sau după AUTH-6.

**Scop:** OWNER-ul poate vedea/regenera codul de invitație și administra membrii; fluxul de partajare devine complet utilizabil din UI.

**Pași:**
- Backend: cele 4 endpoint-uri din AUTH-1 (invite-code GET/regenerate, members GET/DELETE), fiecare ca use case separat cu verificare de rol (OWNER pentru cod + ștergere membru; orice membru pentru lista de membri). Generarea codului: `SecureRandom`, formatul din AUTH-2.
- Frontend, pagina `/setari`, secțiune nouă „**Partajare proiect**":
  - Pentru OWNER: codul afișat `font-mono` cu buton „Copiază" (clipboard) + buton „Regenerează codul" cu `ConfirmDialog` (textul explică: codul vechi nu va mai funcționa; membrii existenți rămân). Ambele acțiuni cu `useAsyncAction` + spinner, conform `cerinte-loading-states.md`.
  - Pentru toți membrii: lista membrilor (username + chip de rol, stil `StatusChip`). Doar pentru OWNER: buton de ștergere per membru (iconiță `delete`, `ConfirmDialog`).
  - Pentru EDITOR: secțiunea NU afișează codul (nu are voie să-l vadă) — doar lista de membri.
- Instrucțiune vizibilă lângă cod (o linie, `text-muted`): „Colegul introduce acest cod la Înregistrare → «Mă alătur unui proiect»."

**DoD:**
- Teste backend: EDITOR cere codul → `404`; regenerarea invalidează codul vechi (register cu codul vechi → `404`); membru șters → toate endpoint-urile de date îi răspund `404` după expirarea access token-ului, iar refresh-ul lui eșuează imediat; OWNER nu se poate autoșterge.
- Flux end-to-end verificat în browser cu **două conturi în două browsere**: OWNER copiază codul → contul B se înregistrează cu el → B vede aceleași camere/elemente → B adaugă un element → A îl vede după refresh → A îl șterge pe B → B pierde accesul (redirect la /login la următorul refresh de sesiune).
- `npm run build` + `npm run lint` + `npx tsc --noEmit` curate; `docs/progress.md` + registrul de funcții actualizate.

---

## Explicit ÎN AFARA scope-ului (nu implementa „din zbor")

- Resetare parolă / schimbare parolă din UI (D2).
- Roluri configurabile la invitație / VIEWER în UI (D7 — codul dă mereu EDITOR).
- **Alăturarea unui cont DEJA existent la alt proiect** — codul funcționează doar la înregistrare. Un user care și-a creat deja propriul proiect și vrea să se mute la un coleg ar însemna multi-proiect sau abandon de proiect; v1 nu acoperă cazul (workaround: cont nou cu alt nume). Extensie posibilă ulterior, cu decizie separată.
- Multi-proiect per user (D4).
- Verificare email, 2FA, OAuth social login.
