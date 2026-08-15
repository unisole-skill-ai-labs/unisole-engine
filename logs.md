# Activity Log

Chronological log of changes and notable events. Newest first.

---

## 2026-08-14

- **Deployment:** Provisioned fresh Ubuntu EC2 instance. Containerized app requires only Docker; runbook documented in the session. Public access on port 3000 pending security-group inbound rule (port 22 verified open, 3000/80 still filtered at time of writing).
- **Fix:** Corrected `docker-compose.yml` command — `$RUN_SEED` is now `$$RUN_SEED` so the container shell evaluates it (seed was silently skipped before).
- **Fix (ADR-006):** `GET /:id` and write-by-id routes crashed with `tbl.id.eq is not a function`. Drizzle 0.45.2 `Column` has no `.eq` method. Replaced with `eq(column, value)` from `drizzle-orm` in `src/repositories/base.repository.ts`.
- **Refactor (ADR-002/003/004/005):** Replaced monolithic `src/crud.ts` with layered architecture — `repositories/`, `managers/`, `controllers/`, `routes/`, plus `middleware/` (async-handler, error-handler, not-found, validate) and `errors.ts`. Generic base factories + per-resource extension files for all 10 resources.
- **Verified:** `npm run typecheck` and `npm run build` clean. Docker stack rebuilt; health, CRUD on all 10 resources, custom endpoints (`courses/:id/modules`, `courses/:id/tree`, `modules/:id/lessons`), validation 400s, 404s, and transactional deletes all tested against the running container.
- **Docs:** Added `README.md`, `decisions.md` (ADRs), and this log.

## 2026-08-14 (earlier)

- Initial Dockerfile (multi-stage build) and docker-compose.yml (Postgres 16 + API) added.
- Verified first containerized run: migrations + seed + health check OK.
