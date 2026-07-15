# Renovator Pro — Backend (Spring Boot, arhitectură hexagonală)

API REST pentru planificatorul de buget de renovare. Planul complet (faze + task-uri) e în
[`../docs/backend-blueprint.md`](../docs/backend-blueprint.md). **Stadiu: Faza 1 — schelet + model de domeniu.**

## Stack

- Java 21 (nivel de limbaj) · Spring Boot 3.4 · Maven
- PostgreSQL 16 · Flyway (migrări) · JPA/Hibernate
- Teste: JUnit 5 + Testcontainers (Postgres real, nu H2)

## Cum rulezi local

```bash
# 1. Pornește Postgres (port 5433)
docker compose up -d

# 2. Rulează backend-ul cu profilul dev
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

- API pe [http://localhost:8080](http://localhost:8080)
- Health check: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- Swagger UI (doar pe profilul dev): [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Teste

```bash
mvn verify
```

- Testele de **domeniu** rulează pur (fără Spring, fără DB) — rapide.
- Testul de **schemă** (`SchemaMigrationTest`) pornește un Postgres via Testcontainers și verifică
  migrarea Flyway. E dezactivat automat pe mașini fără Docker (`disabledWithoutDocker = true`),
  deci `mvn verify` e verde și fără Docker; în CI (Faza 7) rulează efectiv.

## Arhitectură hexagonală — regula de dependență

Săgețile de dependență arată **doar spre interior**:

```
adapter (web, persistence)  ─▶  application (use cases, porturi)  ─▶  domain (model + reguli pure)
        config ─▶ (wiring peste toate)
```

| Pachet | Rol | Poate importa |
|---|---|---|
| `domain` | model + reguli de business PURE | nimic din framework (fără Spring/JPA/Jackson) |
| `application` | use cases, porturi in/out, tranzacții, autorizare | doar `domain` |
| `adapter.in.web` | controllere REST, DTO-uri, mapper, handler erori | `application` + `domain` |
| `adapter.out.persistence` | entități JPA (separate de domain), repository-uri | `application` + `domain` |
| `config` | wiring Spring, Security, CORS, OpenAPI | orice (singura zonă „murdară") |

Fiecare pachet are un `package-info.java` care descrie rolul lui.

## Ce e implementat (Faza 1) și ce urmează

- ✅ Schelet Maven + Spring Boot, profiluri dev/prod, health check, structura hexagonală de pachete.
- ✅ Docker Compose Postgres + Flyway `V1__initial_schema.sql` (users, projects, project_members, rooms, items).
- ✅ Modelul de domeniu pur (enums + entități + `Money` VO + `User`/`ProjectRole`), oglindă a
  `frontend/src/shared/types/`, cu teste de invarianți.
- ⬜ Faza 2: reguli de business în `domain/service` (portate din `frontend/src/shared/functions/`).
- ⬜ Faza 3: use cases + persistență JPA. Faza 4: API REST. Faza 5: auth. Faza 6: integrare frontend.
