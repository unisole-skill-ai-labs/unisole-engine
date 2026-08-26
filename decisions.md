# Architecture Decision Records

Each entry records a decision with a timestamp, context, decision, and consequences. Newest first.

---

## ADR-007: EdTech 15-Table Schema & Modular Monolith Rewrite

**Date:** 2026-08-26

**Status:** Accepted

**Context:** The PRD specifies an EdTech learning & commerce platform where students purchase and learn via **Pathways**. Pathways are composable, sequential collections of reusable Courses; Courses contain Modules; Modules contain Lessons. Legacy tables (assignments, submissions, carts, coupons, orders, live quizzes) were out of scope and created unnecessary complexity.

**Decision:** Migrate to a clean 15-table relational schema:
- `users`, `otp_verifications`
- `colleges`, `categories`
- `pathways`, `pathway_categories`, `pathway_colleges`
- `courses`, `pathway_courses`
- `modules`, `course_modules`
- `lessons`, `module_lessons`
- `enrollments`, `payments`

Adopt the strict **Controller → Service → Repository → Drizzle ORM** architectural pattern. Group API endpoints under 5 dedicated route groups:
1. `/api/auth` (Phone OTP)
2. `/api/admin` (Admin governance & curriculum management)
3. `/api/lms` (Student learning experience with hierarchy verification)
4. `/api/public` (Read-only discovery catalog)
5. `/api/webhooks` (Razorpay payment webhooks)

**Consequences:** High cohesion, no orphan code, strict compile-time TypeScript type safety, and clean separation between admin operations and student LMS access.

---

## ADR-008: Database-Backed Phone OTP Authentication

**Date:** 2026-08-26

**Status:** Accepted

**Context:** Previous implementation relied on email/password + mock tokens, while the PRD specifies phone-based mobile number authentication with rate-limiting and attempt counters.

**Decision:** Implement DB-backed OTP verification with `otp_verifications` table:
- Normalize phone numbers to E.164 (`+91XXXXXXXXXX`).
- Store bcrypt-hashed OTPs with 10-minute expirations and 5-attempt limits.
- Issue signed JWT access and refresh tokens containing `{ id, phone, role, name }`.
- Remove all mock token fallbacks and email/password login routes.

**Consequences:** Production-ready authentication suitable for Indian college students via SMS / WhatsApp gateways.

---

## ADR-001: Containerize with Docker and Docker Compose

**Date:** 2026-08-14

**Status:** Accepted

**Context:** The app needs to run consistently across dev machines and production servers without manual Postgres setup.

**Decision:** Use a multi-stage Dockerfile (`node:22-alpine`):
- Build stage: `npm ci` + `tsc`
- Runtime stage: production dependencies + compiled `dist/`

Use `docker-compose.yml` to run `postgres:18-alpine` and the API together, persisting data in `pgdata` named volume.
