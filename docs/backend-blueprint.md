# Blueprint Backend — Renovator Pro (Spring Boot + PostgreSQL, Arhitectură Hexagonală)

> **Rol document:** planul arhitectural OFICIAL pentru implementarea backend-ului. Scris de arhitectul-șef,
> executat de agenți (Sonnet/Opus) task cu task. **Un task = un branch = un PR** (workflow-ul Git din
> `CLAUDE.md` rămâne obligatoriu). Nu sări peste faze, nu combina task-uri fără decizie explicită a userului.
>
> **Surse de adevăr complementare (citește-le înainte de orice task):**
> - `CLAUDE.md` — reguli generale de proiect + workflow Git
> - `docs/api-contract.md` — shape-urile request/response (se actualizează ÎNAINTE de a implementa un endpoint)
> - `src/shared/types/` — modelul de date TS (backend-ul mapează 1:1 pe el)
> - `docs/progress.md` → „Registru de funcții" — regulile de business care trebuie portate identic în Java

---

## 1. Decizii arhitecturale (luate — nu se re-deschid fără motiv întemeiat)

| Decizie | Alegere | Justificare |
|---|---|---|
| Limbaj / framework | **Java 21 + Spring Boot 3.x** (ultima versiune stabilă la momentul implementării) | cerință user; LTS; virtual threads disponibile |
| Build | **Maven** | mai predictibil pentru agenți LLM decât Gradle; convenție > configurare |
| Bază de date | **PostgreSQL 16+** | cerință user |
| Migrări schema | **Flyway** (SQL pur, versionat, în `src/main/resources/db/migration`) | istoricul schemei = cod; niciodată `ddl-auto=update` în afara testelor |
| Arhitectură | **Hexagonală (Ports & Adapters)** — vezi §3 | cerință user; domeniul pur, testabil, independent de Spring/JPA |
| API | REST JSON, camelCase, conform `docs/api-contract.md` | frontend-ul deja mapează pe el |
| Erori | **RFC 7807 Problem Details** (`ProblemDetail` din Spring 6) | standard, mesaje consistente |
| Documentare API | **springdoc-openapi** (Swagger UI doar pe profil `dev`) | contract vizibil, nu expus în producție |
| Autentificare | **JWT: access token scurt (15 min) + refresh token rotit, stocat hash-uit în DB** — implementată în Faza 5, NU înainte | cerință user („mai târziu"); dar schema DB o anticipează din Faza 2 |
| Autorizare | **Ownership + roluri per proiect** (`OWNER`, `EDITOR`, `VIEWER`) verificate în stratul application, nu doar adnotări pe controller | „securizat pe drepturi" = decizia se ia lângă use case, unde e contextul |
| ID-uri | **UUID v4**, generate de backend | conform contract API (§4 „Toate ID-urile sunt string") |
| Bani | **`BigDecimal`** în domeniu + DB (`NUMERIC(12,2)`), serializat ca `number` în JSON | niciodată `double` pentru bani |
| Enums | Java enum cu **valoare string identică cu TS** (cu diacritice: `"Cumpărat"`, `"Bucătărie"`) — cheie fără diacritice, valoare cu | regula de aur #1 din CLAUDE.md, oglindită în Java |
| Teste | JUnit 5 + **Testcontainers** (Postgres real, nu H2) pentru adapters; domeniul se testează pur, fără Spring | H2 minte despre Postgres |
| Rulare locală | **docker-compose** pentru Postgres; backend pe **port 8080** (3000/3001 sunt ocupate de frontend-uri) | — |
| Deploy backend | **Render** (Web Service, plan free) — Root Directory `backend`, build `mvn -DskipTests clean package`, start `java -jar target/*.jar` | cerință user: alternativă gratuită la Vercel pentru un server Java de lungă durată; simplu de conectat direct la monorepo GitHub (Root Directory, ca la Vercel) |
| Deploy DB (prod) | **Supabase Postgres** (plan free, nu expiră) | cerință user; alternativă la Postgres-ul gestionat de Render, care expiră la 90 zile pe planul free |

## 2. Structura monorepo (țintă)

Repo-ul devine monorepo cu două aplicații. **Mutarea frontend-ului e Task 0.1 — primul lucru care se face.**

```
project-renovation/
  frontend/                  ← tot Next.js-ul actual (src/, public/, package.json, next.config.ts, …)
  backend/                   ← aplicația Spring Boot (nou)
    pom.xml
    docker-compose.yml       ← Postgres local (dev)
    src/main/java/ro/renovatorpro/...
    src/main/resources/db/migration/   ← Flyway
    src/test/java/...
  docs/                      ← rămâne la rădăcină (documentație comună: api-contract, progress, acest blueprint)
  CLAUDE.md                  ← rămâne la rădăcină, actualizat cu secțiune backend
  README.md                  ← rămâne la rădăcină, devine index al monorepo-ului
```

## 3. Arhitectura hexagonală — structura pachetelor backend

Pachet rădăcină: `ro.renovatorpro`. **Regula de dependență: săgețile arată DOAR spre interior.**
`domain` nu importă nimic din Spring/JPA/Jackson. `application` importă doar `domain`. Adapterele importă `application` + `domain`.

```
ro.renovatorpro
├── domain/                          ← NUCLEUL. Zero dependențe de framework.
│   ├── model/                       ← entități + value objects + enums
│   │   ├── Project.java, Room.java, Item.java
│   │   ├── Money.java (VO), RoomType.java, ItemStatus.java, MaterialType.java,
│   │   │   Currency.java, ItemOrigin.java, Wall.java, … (1 fișier per tip, ca în TS)
│   │   └── user/ User.java, ProjectRole.java (OWNER/EDITOR/VIEWER)
│   ├── service/                     ← reguli de business PURE (portate din src/shared/functions/)
│   │   ├── BudgetCalculator.java    ← totalSpent (doar Cumpărat!), totalEstimated, budgetRemaining…
│   │   └── AutoItemReconciler.java  ← reconcilierea elementelor „Din Configurare" (regula din api-contract.md §Item)
│   └── exception/                   ← RoomNotFoundException, BusinessRuleViolation, …
│
├── application/                     ← use cases. Orchestrare, tranzacții (prin port), autorizare.
│   ├── port/
│   │   ├── in/                      ← interfețe use case (ex: AddItemUseCase, DeleteRoomUseCase)
│   │   └── out/                     ← interfețe spre exterior (ProjectRepository, RoomRepository,
│   │                                   ItemRepository, UserRepository, TokenIssuer, Clock…)
│   └── usecase/                     ← implementările (ex: DeleteRoomService — aici trăiește CASCADE-ul
│                                       cameră→items, și verificarea de drepturi pe proiect)
│
├── adapter/
│   ├── in/web/                      ← controllere REST + DTO-uri request/response + mapper DTO↔domain
│   │   ├── ProjectController, RoomController, ItemController, (Faza 5: AuthController)
│   │   ├── dto/                     ← NICIODATĂ entitatea de domeniu direct în JSON
│   │   └── GlobalExceptionHandler   ← domain exception → ProblemDetail (404/409/422…)
│   └── out/persistence/             ← JPA: entități @Entity SEPARATE de domain.model + mapper + repo
│       ├── entity/ ProjectEntity, RoomEntity, ItemEntity, UserEntity, RefreshTokenEntity
│       ├── springdata/              ← interfețe Spring Data JPA
│       └── …RepositoryAdapter.java  ← implementează port.out.*Repository
│
└── config/                          ← singura zonă „murdară": Spring wiring, SecurityConfig, CORS,
                                        OpenAPI, properties. Use case-urile se înregistrează ca bean-uri aici.
```

**De ce entități JPA separate de modelul de domeniu:** JPA cere no-arg constructors, mutabilitate, adnotări — toate poluează domeniul. Mapper-ul dintre ele e cod plictisitor dar ieftin; independența domeniului e scumpă de recâștigat ulterior.

## 4. Modelul de date (PostgreSQL)

Migrări Flyway incrementale (`V1__`, `V2__`, …). Schema țintă (simplificat):

- `users` (id UUID PK, email UNIQUE, password_hash, display_name, created_at) — creată din Faza 2, folosită din Faza 5
- `projects` (id, title, total_budget NUMERIC(12,2), currency VARCHAR, owner_id FK→users)
- `project_members` (project_id FK, user_id FK, role VARCHAR — OWNER/EDITOR/VIEWER, PK compus) — baza autorizării „pe drepturi"
- `rooms` (id, project_id FK **ON DELETE CASCADE**, type, name, allocated_budget, + câmpurile tehnice; `doors`/`windows`/`wall_tiling`/`wall_finish`/`wall_lengths` ca **JSONB** — sunt structuri per-perete, nu relații interogate)
- `items` (id, room_id FK **ON DELETE CASCADE**, name, material_type, source, status, quantity NUMERIC, unit_price NUMERIC(12,2), product_url, image_url, origin)
- `refresh_tokens` (id, user_id FK, token_hash, expires_at, revoked_at) — Faza 5

Enum-urile se stochează ca VARCHAR cu valorile string din TS (cu diacritice) — nu ca enum Postgres (migrările de enum PG sunt dureroase) și nu ca ordinal (fragil la reordonare).

## 5. Securitate — principii (implementare în Faza 5, dar arhitectura le anticipează)

1. **Nimic public în afară de** `/api/auth/**` și health check. Orice alt endpoint = autentificat.
2. **Autorizare pe resursă, nu doar pe rol global:** fiecare use case primește userul curent și verifică membership-ul pe proiectul din care face parte resursa (item→room→project→membership). Un `EDITOR` poate CRUD rooms/items; doar `OWNER` modifică proiectul, membrii și șterge proiectul; `VIEWER` doar citește. **IDOR e riscul #1** — testele de autorizare (user A nu vede resursele lui B) sunt obligatorii per endpoint.
3. Parole: **BCrypt** (strength ≥ 12). JWT semnat **HS256 cu secret din env var** (minim 256 biți) — niciodată secret în git.
4. Refresh token: rotit la fiecare folosire, stocat doar hash-uit, revocabil.
5. Validare input la margine (Bean Validation pe DTO-uri: `@NotBlank`, `@PositiveOrZero`, lungimi maxime, URL-uri valide) + reguli de business în domeniu. Nu returna niciodată stack trace-uri în JSON.
6. CORS: allowlist explicit (localhost:3000/3001 pe dev; domeniul Vercel pe prod) — nu `*`.
7. Rate limiting pe `/api/auth/**` (ex. Bucket4j) — anti brute-force.
8. Dependențe: activează `dependabot`/`mvn versions` periodic; nu folosi versiuni cu CVE-uri cunoscute.

---

## 6. PLANUL DE EXECUȚIE — faze și task-uri

> **Format:** fiecare task are Scop / Pași / Definition of Done. Executorul deschide branch `NNN-…`
> (numerotare continuă cu branch-urile existente), rulează verificările, face push, deschide PR și
> actualizează `docs/progress.md`. **Task-urile dintr-o fază se execută în ordine.**

### FAZA 0 — Restructurare monorepo

**Task 0.1 — Mută frontend-ul în `frontend/`**
- *Scop:* rădăcina devine monorepo `frontend/` + `backend/` + `docs/`.
- *Pași:* `git mv` tot ce ține de Next.js (src, public, package.json, package-lock.json, next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs, vercel.json, next-env.d.ts, .next e ignorat) în `frontend/`. `docs/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `.gitignore` rămân la rădăcină. Actualizează: `.gitignore` (prefixe `frontend/`), configurația Vercel (root directory = `frontend`), `~/.claude/launch.json` (configurația `renovator-web` → cwd nou), CLAUDE.md (căile din secțiunea Structură), README.md (index monorepo: ce e în frontend/, ce e în backend/, cum se pornește fiecare).
- *DoD:* `cd frontend && npm run dev` merge pe 3001; `npm run build`, `npm run lint`, `npx tsc --noEmit` trec; deploy-ul Vercel confirmat funcțional; istoricul git al fișierelor păstrat (git mv, nu delete+add).

### FAZA 1 — Schelet backend + infrastructură dev

**Task 1.1 — Bootstrap Spring Boot + structura hexagonală goală**
- *Scop:* proiect Maven care compilează și pornește, cu structura de pachete din §3 (foldere + `package-info.java` cu o frază despre rolul fiecărui strat).
- *Pași:* generează proiect (Java 21, Spring Boot 3.x stabil) cu dependențele: web, validation, data-jpa, postgresql, flyway, actuator, springdoc-openapi, lombok (opțional — dacă se folosește, doar `@RequiredArgsConstructor`/`@Value`, nu `@Data` pe entități). Profiluri `dev`/`prod` prin `application.yml` + `application-dev.yml`. Port 8080. Health check `/actuator/health` expus.
- *DoD:* `mvn verify` trece; aplicația pornește cu profilul dev; regula de dependență între straturi documentată în `backend/README.md` (creat acum: cum se rulează, cum se testează, structura pachetelor).

**Task 1.2 — Docker Compose Postgres + Flyway V1 (schema de bază)**
- *Scop:* DB locală reproductibilă + prima migrare.
- *Pași:* `backend/docker-compose.yml` cu Postgres 16 (volume named, port 5433 ca să nu ciocnească alte instalări locale), credențiale dev în `.env.example` (NU `.env` în git). `V1__initial_schema.sql`: `users`, `projects`, `project_members`, `rooms`, `items` conform §4, cu FK-uri, ON DELETE CASCADE, indecși pe FK-uri.
- *DoD:* `docker compose up -d` + pornirea aplicației rulează Flyway curat; un test Testcontainers minimal (context loads + migrare aplicată) trece în `mvn verify`.

**Task 1.3 — Enums + modelul de domeniu pur**
- *Scop:* `domain/model` complet, oglindă a `frontend/src/shared/types/`.
- *Pași:* portează toate enum-urile (cheie fără diacritice, valoare string cu diacritice, `@JsonValue`-ul se pune pe DTO/adapter, NU în domain — domain n-are Jackson). Entități domain imutabile unde se poate (records sau clase cu builder), `Money` ca VO cu `BigDecimal`. Structurile tehnice ale Room (doors/windows/wallTiling/wallFinish) ca tipuri proprii.
- *DoD:* fiecare tip într-un fișier propriu; zero importuri de framework în `domain/`; teste unitare pe invarianți (ex. Money nu acceptă negativ).

### FAZA 2 — Business logic în domeniu

**Task 2.1 — Portarea registrului de funcții în `domain/service`**
- *Scop:* `BudgetCalculator` cu toate funcțiile din `frontend/src/shared/functions/` (items.ts, budget.ts, money e concern de prezentare — NU se portează formatarea).
- *Pași:* port 1:1 cu aceleași nume (itemTotal, totalEstimated, totalSpent, boughtCount, purchaseProgress, itemsForRoom, roomSubtotal, roomSpent, budgetRemaining, costPerRoom, costPerCategory). Comentariu de o linie per funcție cu regula (ex. „doar Cumpărat contează la cheltuit"). Teste unitare care fixează regulile de business (în special: statusurile Planificat/În așteptare NU intră în totalSpent).
- *DoD:* acoperire de teste pe fiecare funcție; niciun `double` — doar `BigDecimal`; tabelul din `docs/progress.md` primește o coloană/notă „portat în Java: da/nu".

**Task 2.2 — `AutoItemReconciler` (regula cea mai delicată)**
- *Scop:* reconcilierea elementelor `origin: Din Configurare` la modificarea configurării tehnice a unei camere — identică cu `frontend/src/shared/functions/auto-items.ts` și regulile din `docs/api-contract.md` (§Item + §Room: wallTiling⊕wallFinish în funcție de floorMaterial, plinta inclusă în gresie la Gresie, scăderea golurilor de uși+ferestre, GlafFereastra +5%).
- *Pași:* citește ÎNTÂI implementarea TS și api-contract.md; portează cu test per ramură de decizie; elementele Manual nu sunt niciodată atinse; cele existente Din Configurare păstrează id/unitPrice/status, își recalculează name/quantity; orfanele se șterg.
- *DoD:* suite de teste care acoperă fiecare ramificație documentată în api-contract.md; orice divergență găsită față de TS se raportează userului, nu se „rezolvă" tacit.

### FAZA 3 — Use cases + persistență

**Task 3.1 — Porturi + adapter de persistență JPA**
- *Scop:* `port/out` (Project/Room/Item Repository) + implementările JPA cu entități separate și mapper.
- *Pași:* entități `@Entity` în `adapter/out/persistence/entity` (JSONB prin `@JdbcTypeCode(SqlTypes.JSON)` pentru structurile per-perete), mapper explicit entity↔domain (manual, fără MapStruct la început — mai puțină magie), adapterele implementează porturile.
- *DoD:* teste Testcontainers pe fiecare adapter (CRUD + cascade la delete room); domeniul rămâne fără adnotări JPA.

**Task 3.2 — Use case-urile CRUD**
- *Scop:* toate metodele din `RenovationStore` ca use case-uri: get project (+rooms+items), add/update/delete room, add/update/delete item, update project.
- *Pași:* interfețe în `port/in`, implementări în `usecase/`, `@Transactional` pe use case. `DeleteRoomService` face cascade explicit (chiar dacă DB-ul are ON DELETE CASCADE — regula e de business, nu doar de schemă). `UpdateRoomService` invocă `AutoItemReconciler` când se schimbă câmpuri tehnice. Fiecare use case primește un parametru „userul curent" din prima zi (până la Faza 5 vine dintr-un stub), ca autorizarea să nu fie retrofit.
- *DoD:* teste de use case cu repository-uri fake (in-memory, fără Spring) — rapide, pure; scenariile: delete room șterge items, update configurare reconciliază corect.

### FAZA 4 — API REST

**Task 4.1 — Controllere + DTO-uri conform `api-contract.md`**
- *Scop:* toate endpoint-urile din tabelul contractului, exact cu shape-urile documentate.
- *Pași:* DTO-uri request/response separate (cu Bean Validation), mapper DTO↔domain, controllere subțiri (validare → use case → răspuns). `GlobalExceptionHandler` → ProblemDetail: 404 not found, 422 validare business, 400 payload invalid. Dacă în timpul lucrului apare nevoia unui endpoint/câmp nedocumentat: **întâi PR pe `docs/api-contract.md`, apoi cod.**
- *DoD:* teste `@WebMvcTest` sau MockMvc pe fiecare endpoint (happy path + validare + 404); JSON-ul serializat verifică valorile enum cu diacritice; Swagger UI funcțional pe dev.

**Task 4.2 — CORS, config pe env vars, profil prod**
- *Scop:* aplicația configurabilă 12-factor.
- *Pași:* CORS allowlist din property (dev: localhost:3001; prod: domeniul Vercel), datasource/secrete exclusiv din env vars pe prod, actuator restricționat (doar health, fără details, pe prod), logging JSON pe prod (opțional).
- *DoD:* aplicația pornește cu profil prod folosind doar env vars; niciun secret în repo (verificat cu grep înainte de push).

### FAZA 5 — Autentificare & autorizare (abia acum)

**Task 5.1 — Users + register/login + JWT**
- *Scop:* `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` (revocă refresh).
- *Pași:* documentează întâi endpoint-urile în api-contract.md. BCrypt(≥12), access JWT 15 min (claims: sub=userId, email), refresh token opac rotit + hash în DB. SecurityFilterChain: `/api/auth/**` + health publice, restul autentificat; stateless, fără CSRF pe API-ul JWT. Rate limiting pe auth.
- *DoD:* teste de integrare pe fluxul complet (register→login→acces cu token→refresh→logout→refresh eșuează); token expirat → 401 ProblemDetail; parolele nu apar niciodată în loguri.

**Task 5.2 — Autorizare pe drepturi (project membership)**
- *Scop:* activarea reală a `project_members` + rolurilor în toate use case-urile.
- *Pași:* la register/primul login se creează proiectul default al userului cu rol OWNER (decizie: single-project per user la început — multi-proiect e doar o extensie de query după acest model). Fiecare use case verifică membership + rol suficient; stub-ul de „user curent" din Task 3.2 se înlocuiește cu extragerea din SecurityContext printr-un port (`CurrentUserProvider`).
- *DoD:* teste IDOR pe FIECARE endpoint: userul A primește 404 (nu 403 — nu confirmăm existența resursei) pentru resursele userului B; VIEWER nu poate scrie; doar OWNER șterge proiectul.

**Task 5.3 — Frontend: pagini login/register + sesiune**
- *Scop:* UI de autentificare în Next.js, conform design system-ului existent.
- *Pași:* pagini `/login`, `/register`; access token ținut în memorie, refresh token în cookie httpOnly+Secure+SameSite (backend-ul îl setează); interceptor de refresh pe 401; logout. Rutele aplicației devin protejate client-side (redirect la /login dacă nu există sesiune).
- *DoD:* fluxul complet funcțional în browser contra backend-ului local; lint+tsc trec; verificare vizuală desktop+mobil.

### FAZA 6 — Integrarea frontend ↔ backend

**Task 6.1 — `RenovationStore` peste fetch**
- *Scop:* înlocuirea mock store-ului cu implementarea HTTP, păstrând EXACT interfața `RenovationStore` (motivul pentru care a fost proiectată așa).
- *Pași:* un client API (fetch, base URL din env `NEXT_PUBLIC_API_URL`), StoreProvider face load inițial (project+rooms+items), mutațiile devin apeluri API cu update optimist sau re-fetch (decizie simplă: re-fetch la început, optimizare ulterior). `mock-data.ts` rămâne pentru un mod demo/fallback (flag env).
- *DoD:* toate cele 4 pagini funcționează contra backend-ului real; nicio pagină/componentă nu s-a schimbat în afara store-ului (dovada că abstracția a ținut); reconcilierea auto-items la editarea configurării vine acum de la server și dă aceleași rezultate ca înainte client-side.

**Task 6.2 — Agregări server-side (opțional, la nevoie)**
- Conform api-contract.md §Agregări: `GET /api/projects/{id}/summary` doar dacă volumul o cere. Formulele = cele din `BudgetCalculator`, nu reinventate.

### FAZA 7 — Hardening & operare

**Task 7.1 — Suite de teste de securitate + revizie**
- Rulează `/security-review` pe backend; verifică OWASP API Top 10 punct cu punct (BOLA/IDOR, mass assignment — PATCH-urile nu acceptă câmpuri interzise ca `id`/`projectId`/`origin` de la client, injection — doar query-uri parametrizate, excessive data exposure — DTO-uri, nu entități).

**Task 7.2 — CI + deploy (Render + Supabase)**
- GitHub Actions: job frontend (lint+tsc+build) + job backend (mvn verify cu Testcontainers) pe fiecare PR.
- **DB de producție — Supabase:** creează proiect Supabase (plan free), obține connection string-ul Postgres din Settings → Database. Nu se creează tabele manual din UI Supabase — schema rămâne exclusiv sub controlul Flyway (§1 „Migrări schema"); la primul boot al backend-ului contra acestei DB, Flyway aplică `V1__initial_schema.sql` automat.
- **Backend — Render Web Service:** conectează repo-ul GitHub, **Root Directory: `backend`** (exact ca Root Directory-ul `frontend` de pe Vercel — Render suportă monorepo nativ, fără să separi în alt repo). Runtime: Java (sau Docker, dacă se preferă un `Dockerfile` multi-stage — de evaluat la implementare). Build command: `mvn -DskipTests clean package`. Start command: `java -jar target/*.jar` (numele exact al JAR-ului rezultă din `artifactId`/`version` din `pom.xml`).
- **Variabile de mediu pe Render** (niciodată în git — vezi `.env.example` din backend): `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (din Supabase), plus `SPRING_PROFILES_ACTIVE` NESETAT sau absent (profilul implicit din `application.yml` e deja „safe pentru prod"; **nu** activa profilul `dev` pe Render — ar expune Swagger).
- **CORS:** actualizează allowlist-ul (Task 4.2) cu domeniul real de pe Vercel al frontend-ului (ex. `https://renovator-pro.vercel.app`), pe lângă `localhost:3001` pentru dev.
- **Limitare de reținut (plan free Render):** serviciul „adoarme" după ~15 minute de inactivitate; primul request după o pauză are cold-start de ordinul zecilor de secunde. Acceptabil pentru dezvoltare/demo; de reevaluat (plan plătit) dacă aplicația ajunge să aibă utilizatori reali cu așteptări de latență.

---

## 7. Reguli pentru agenții executori

1. **Un task = un branch = un PR.** Numerotare `NNN-` continuă. Nu push pe main.
2. **Citește înainte de a scrie:** CLAUDE.md, acest blueprint (secțiunea fazei tale), api-contract.md, și codul TS relevant când portezi logică.
3. **Contract-first:** orice schimbare de shape API → întâi `docs/api-contract.md`, apoi cod.
4. **Nu re-decide arhitectura.** Dacă un task pare să contrazică §1–§5, oprește-te și întreabă userul — nu improviza.
5. **Definition of Done global:** codul compilează, TOATE testele trec (`mvn verify` / lint+tsc+build pe frontend), `docs/progress.md` primește intrare nouă, PR deschis cu descriere clară.
6. **Niciodată secrete în git** (parole DB, JWT secret) — doar `.env.example` cu placeholder-e.
7. La finalul fiecărei faze: userul face review + merge înainte de faza următoare.

## 8. Stadiu

| Fază | Status |
|---|---|
| 0 — Monorepo | ⬜ neînceput |
| 1 — Schelet backend | ⬜ |
| 2 — Business logic domeniu | ⬜ |
| 3 — Use cases + persistență | ⬜ |
| 4 — API REST | ⬜ |
| 5 — Auth & autorizare | ⬜ |
| 6 — Integrare frontend | ⬜ |
| 7 — Hardening & CI/CD | ⬜ |

*(Executorii actualizează tabelul la finalizarea fiecărui task: ⬜ → 🟨 în lucru → ✅ mergeat.)*
