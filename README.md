# Unisole Engine

Production TypeScript backend engine for the Unisole EdTech Platform — an Express + Drizzle (PostgreSQL) REST API.

## Tech Stack

- **Runtime:** Node.js 22 (Alpine)
- **Framework:** Express 4
- **ORM:** Drizzle ORM 0.45 + `pg`
- **Database:** PostgreSQL 18
- **Authentication:** Phone OTP with DB-backed verification (`otp_verifications`), bcrypt hashing & JWT
- **Language:** TypeScript 5 (strict)
- **Deployment:** Docker (multi-stage build) + Docker Compose

## Getting Started

### Prerequisites

- Node 20+ and PostgreSQL (local dev), or Docker + Docker Compose

### Local Development

```bash
npm install
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npm run db:seed             # execute SQL schema & initial seed
npm run dev                 # tsx watch, http://localhost:3000
```

### Docker (recommended)

```bash
docker compose up -d --build
```

- API: `http://localhost:3000`
- Postgres 18: `localhost:5433` (mapped to container 5432; creds `postgres` / `postgres`, database `unisole`)

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
| `npm run db:seed`      | Seed sample schema and data      |

## Architecture

Layered architecture — each request flows in one direction:

```
Route Group → Middleware → Controller → Service → Repository → PostgreSQL
```

| Layer        | Responsibility                                      | Location                |
| ------------ | --------------------------------------------------- | ----------------------- |
| Route        | Path mapping, rate limiting, auth middleware wiring | `src/routes/`           |
| Middleware   | Cross-cutting: JWT auth, role check, error handler  | `src/middleware/`       |
| Controller   | HTTP request parsing, response formatting           | `src/controllers/`      |
| Service      | Business logic, validation, hierarchy access check  | `src/services/`         |
| Repository   | Data access layer (Drizzle ORM & SQL)               | `src/repositories/`     |
| DB Schema    | Drizzle tables, sequences, enums, relations         | `src/db/`               |

## API Route Groups

Base path: `http://localhost:3000`

### 1. Authentication (`/api/auth`)
- `POST /api/auth/send-otp` — Send 4-digit verification code to mobile number
- `POST /api/auth/verify-otp` — Verify OTP & issue access/refresh JWT tokens
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Authenticated user profile

### 2. Admin Operations (`/api/admin/*`) — Requires `ADMIN` role
- `/api/admin/students` — Learner management & deactivation
- `/api/admin/colleges` — Partner college management
- `/api/admin/categories` — Domain categories management
- `/api/admin/pathways` — Pathway CRUD, Category/College links, Course sequencing
- `/api/admin/courses` — Course CRUD & Module sequencing
- `/api/admin/modules` — Module CRUD & Lesson sequencing
- `/api/admin/lessons` — Lesson content, duration, video URLs
- `/api/admin/enrollments` — Pathway enrollment management & access granting
- `/api/admin/payments` — Transaction history & audit log

### 3. Student LMS (`/api/lms/*`) — Requires Authentication
- `GET /api/lms/me` — Learner profile
- `GET /api/lms/pathways` — Pathways the student is actively enrolled in
- `GET /api/lms/pathways/:id` — Full curriculum tree (Courses → Modules → Lessons)
- `GET /api/lms/lessons/:id` — Lesson content (protected by enrollment access check)
- `GET /api/lms/enrollments` — Student's active and past enrollments
- `POST /api/lms/payments/create-order` — Initiate payment order for a pathway
- `POST /api/lms/payments/verify` — Verify signature and activate enrollment

### 4. Public Catalog (`/api/public/*`) — Unauthenticated
- `GET /api/public/pathways` — Published pathways list
- `GET /api/public/pathways/:slug` — Single pathway detail
- `GET /api/public/categories` — Active domain categories
- `GET /api/public/colleges` — Active partner colleges

### 5. Webhooks (`/api/webhooks`)
- `POST /api/webhooks/razorpay` — Razorpay payment webhook handler

## Database Schema (15 Tables)

- `users`
- `otp_verifications`
- `colleges`
- `categories`
- `pathways`
- `pathway_categories`
- `pathway_colleges`
- `courses`
- `pathway_courses`
- `modules`
- `course_modules`
- `lessons`
- `module_lessons`
- `enrollments`
- `payments`
