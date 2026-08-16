# Unisole Engine

Basic TypeScript backend for the Unisole LMS schema — an Express + Drizzle (PostgreSQL) REST API.

## Tech Stack

- **Runtime:** Node.js 22 (Alpine)
- **Framework:** Express 4
- **ORM:** Drizzle ORM 0.45 + `pg`
- **Database:** PostgreSQL 18
- **Language:** TypeScript 5 (strict)
- **Deployment:** Docker (multi-stage build) + Docker Compose

## Getting Started

### Prerequisites

- Node 20+ and PostgreSQL (local dev), or Docker + Docker Compose

### Local development

```bash
npm install
cp .env.example .env        # set DATABASE_URL for your local Postgres
npm run db:migrate          # apply drizzle migrations
npm run db:seed             # optional: insert sample data
npm run dev                 # tsx watch, http://localhost:3000
```

### Docker (recommended)

```bash
docker compose up -d --build
```

The `api` service runs migrations, then seeds data only when `RUN_SEED=true`, then starts the server. `RUN_SEED` defaults to `false` to avoid wiping data on every restart; run `RUN_SEED=true docker compose up -d api` once (or `docker compose exec api node dist/scripts/seed.js`) to seed.

- API: http://localhost:3000
- Postgres 18: `localhost:5433` (mapped to container 5432; creds `postgres` / `postgres`, database `unisole`)

## Configuration

| Variable       | Default                                   | Description              |
| -------------- | ----------------------------------------- | ------------------------ |
| `PORT`         | `3000`                                    | API listen port          |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/unisole` | Postgres connection string |
| `RUN_SEED`     | —                                         | `true` to seed on startup |

## Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Watch mode dev server            |
| `npm run build`        | Compile TypeScript to `dist/`    |
| `npm run start`        | Run compiled server              |
| `npm run typecheck`    | Type-check without emitting      |
| `npm run db:generate`  | Generate drizzle migrations      |
| `npm run db:push`      | Push schema to database          |
| `npm run db:migrate`   | Apply migrations                 |
| `npm run db:seed`      | Seed sample data                 |

## Architecture

Layered architecture — each request flows through one direction:

```
route → middleware → controller → manager (service) → repository → db
```

| Layer        | Responsibility                                  | Location                |
| ------------ | ----------------------------------------------- | ----------------------- |
| Router       | Path mapping, middleware wiring                 | `src/routes/`           |
| Middleware   | Cross-cutting: errors, validation, 404, async   | `src/middleware/`       |
| Controller   | HTTP concerns: parse request, shape response    | `src/controllers/`      |
| Manager      | Business logic: validation, defaults, 404s      | `src/managers/`         |
| Repository   | Data access only (SQL via Drizzle)              | `src/repositories/`     |

Each resource has its own repository, manager, and controller implementing full CRUD. Courses and modules add custom endpoints and transactional deletes with orphan cleanup. Seed/dummy data lives in `src/config/seed-data.ts`.

## API Endpoints

Base path: `http://localhost:3000`

| Resource                | Routes                                                        |
| ----------------------- | ------------------------------------------------------------- |
| `GET /health`           | Health check                                                  |
| `/api/users`            | CRUD (`hasUpdatedAt`)                                         |
| `/api/categories`       | CRUD                                                          |
| `/api/courses`          | CRUD (delete cleans up orphan modules/items) + `GET /:id/modules`, `GET /:id/tree` |
| `/api/modules`          | CRUD (delete cleans up orphan items) + `GET /:id/lessons` |
| `/api/module-items`     | CRUD                                                          |
| `/api/module-lessons`   | CRUD                                                          |
| `/api/assignments`      | CRUD                                                          |
| `/api/assignment-submissions` | CRUD                                                   |
| `/api/quizzes`          | CRUD                                                          |

Every CRUD resource supports:

- `GET /` — list all
- `GET /:id` — get one
- `POST /` — create (validates required fields)
- `PUT /:id` — update (partial)
- `DELETE /:id` — delete

Responses: success returns JSON (or `204` on delete); errors return `{ "error": "<message>" }` with 400/404/500.

## Database Schema

9 tables in the `unisole` database:

```
assignment_submissions  assignments  categories  courses  module_item
module_lessons  modules  quiz  users
```

Modules link to a course via `modules.course_id`.

Migrations live in `drizzle/`; schema definition in `src/db/schema.ts`.

## Documentation

- `decisions.md` — architecture decision records (ADR)
- `logs.md` — activity / change log
