# Architecture Decision Records

Each entry records a decision with a timestamp, context, decision, and consequences. Newest first.

---

## ADR-001: Containerize with Docker and Docker Compose

**Date:** 2026-08-14

**Status:** Accepted

**Context:** The app needs to run consistently across dev machines and a production EC2 instance without manual Postgres setup.

**Decision:** Use a multi-stage Dockerfile (`node:22-alpine`):
- Build stage: `npm ci` + `tsc`
- Runtime stage: production-only dependencies + compiled `dist/`

Use `docker-compose.yml` to run `postgres:18-alpine` and the API together, with the API running migrations and (optionally) seed before starting. Postgres data persists in a named volume.

**Consequences:** One-command deploys (`docker compose up -d --build`); a compose quirk required escaping `$RUN_SEED` as `$$RUN_SEED` so the container shell — not Compose — evaluates the variable. The db image tracks the latest stable PostgreSQL major version (18 as of 2026-08); upgrading the image major requires recreating the `pgdata` volume and re-seeding.

---

## ADR-002: Layered architecture

**Date:** 2026-08-14

**Status:** Accepted

**Context:** Originally all logic lived in a single generic `createCrudRouter` in `src/crud.ts`, mixing routing, request handling, business rules, and SQL.

**Decision:** Refactor into unidirectional layers:

```
route → middleware → controller → manager (service) → repository → db
```

- **Repository** — data access only
- **Manager** — business logic (validation, defaults, `updated_at`, 404s)
- **Controller** — HTTP concerns (parse request, call manager, shape response)
- **Router** — path mapping + middleware
- **Middleware** — cross-cutting (error handling, validation, 404, async wrapper)

`src/crud.ts` was deleted.

**Consequences:** Each concern is testable and swappable in isolation; ~40 small files instead of one fat file.

---

## ADR-003: Generic factory bases with thin per-resource seams

**Date:** 2026-08-14

**Status:** Accepted

**Context:** Ten resources share identical CRUD shape; hand-writing full repository/manager/controller for each is ~30 boilerplate files; a single shared router with zero per-resource files makes customization painful.

**Decision:** Provide one generic factory per layer (`createCrudRepository`, `createCrudManager`, `createCrudController`) plus a thin per-resource file for each of the 10 resources. Resources with custom behavior (courses, modules) extend the base with extra repository methods, manager logic, and controller handlers.

**Consequences:** DRY common paths, explicit seams for per-resource logic, and courses/modules keep their custom endpoints (`/:id/modules`, `/:id/tree`, `/:id/lessons`) and transactional deletes with orphan cleanup.

---

## ADR-004: Centralized error handling

**Date:** 2026-08-14

**Status:** Accepted

**Context:** Handlers duplicated `try/catch` and returned inconsistent error shapes; Express 4 does not forward rejected promises from async handlers automatically.

**Decision:** Define `HttpError` (+ `NotFoundError`, `ValidationError`) in `src/errors.ts`. Wrap every async handler with `asyncHandler` which forwards rejections to `next`. Mount a terminal `errorHandler` middleware that maps `HttpError` to its status and anything else to `500 {"error":"Internal server error"}`. A `notFound` middleware handles unknown routes.

**Consequences:** Consistent error JSON everywhere; new endpoints get error handling for free by using `asyncHandler`.

---

## ADR-005: Validation middleware + repository column whitelist

**Date:** 2026-08-14

**Status:** Accepted

**Context:** POST bodies previously accepted arbitrary fields silently; required fields were not enforced.

**Decision:** A `validateBody({ required: [...] })` middleware returns `400` when required fields are missing on create. Unknown fields are dropped at the repository boundary via `filterColumns` (whitelists against `getTableColumns`).

**Consequences:** Clear 400 responses for missing required fields; no accidental writes of non-column fields; PUT remains partial-update capable.

---

## ADR-006: Use `eq()` function instead of `Column.eq`

**Date:** 2026-08-14

**Status:** Accepted

**Context:** `GET /:id` (and all write-by-id) threw `tbl.id.eq is not a function` at runtime. Drizzle ORM 0.45.2's `Column` class does not expose `.eq` (the property-based operator API came in a later version). The original `src/crud.ts` carried this latent bug — it was never exercised because only list endpoints were tested.

**Decision:** Replace `column.eq(value)` with the `eq(column, value)` function imported from `drizzle-orm` in `src/repositories/base.repository.ts`.

**Consequences:** All `/:id` routes work again; code is compatible with the pinned drizzle version and unchanged API shape.
