# Backend Rewrite: Complete Implementation Plan

Full rewrite of the `unisole-engine` backend to match the new database schema and PRD architecture.

> [!IMPORTANT]
> **Scope**: This plan covers ALL backend changes needed. The database is already migrated (completed in the previous step). No database or Docker changes are needed.

---

## Current State Summary

| Layer | Old File Count | What's There |
|---|---|---|
| Schema | 1 file | 22 old tables, wrong enums, wrong relationships |
| Repositories | 21 files | All reference old schema tables |
| Managers | 23 files | Business logic tied to old data model |
| Controllers | 23 files | Thin wrappers, but import old managers |
| Routes | 24 files | Old API routes (flat `/api/resource` pattern) |
| Services | 1 file | In-memory OTP (not DB-backed) |
| Middleware | 6 files | Auth has `email` in JWT payload, mock token fallback |
| Helpers | 5 files | `generateId` has old table prefixes, `ensureAdmin`/`ensureCourses` use old schema |
| Scripts | 4 files | `seed.ts` references old schema, `create-admin.ts` uses email/password |
| Sockets | 1 file | Live quiz system (removed from scope) |
| Config | 1 file | 139KB seed-data.ts (old schema data) |

**Total: ~84 source files** — nearly all need to be rewritten or deleted.

---

## Architecture (from PRD)

The PRD specifies: **Controller → Service → Repository → Drizzle → PostgreSQL**

The old codebase uses: **Controller → Manager → Repository → Drizzle**

The rewrite will rename "Manager" to "Service" to align with the PRD. The layering pattern stays the same.

### New API Route Groups (from PRD §43)

```text
/api/auth/*       → Phone OTP auth
/api/lms/*        → Student-facing LMS
/api/admin/*      → Admin panel operations
/api/public/*     → Public/SEO read-only catalog
/api/webhooks/*   → Razorpay webhooks
```

---

## Phase 1: Foundation

Everything depends on this. Must be done first.

---

### 1.1 Drizzle Schema

#### [REWRITE] [schema.ts](file:///mnt/c/code/unisole/unisole-engine/src/db/schema.ts)

Rewrite to match the 15 tables in `edtech_schema_and_seed.sql`. Key changes:

**Enums (old → new):**
| Old Enum | New Enum |
|---|---|
| `user_role` ('student', 'admin') | `user_role` ('STUDENT', 'ADMIN') — uppercase |
| `auth_provider` ('local', 'google', 'supabase', 'phone') | **REMOVE** — no auth_provider column |
| `item_type` ('video', 'pdf', ...) | **REMOVE** — no module_items |
| `submission_status`, `attempt_status` | **REMOVE** |
| `discount_type` | **REMOVE** — no coupons |
| `enrollment_status` ('active', 'completed', 'expired') | `enrollment_status` ('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED') |
| `order_status` | **REMOVE** — no orders table |
| `payment_status` ('captured', 'failed', 'refunded') | `payment_status` ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') |
| `live_session_status`, `live_question_type` | **REMOVE** |
| — | **NEW** `pathway_status` ('DRAFT', 'PUBLISHED', 'ARCHIVED') |
| — | **NEW** `content_status` ('DRAFT', 'PUBLISHED', 'ARCHIVED') |
| — | **NEW** `otp_channel` ('SMS', 'WHATSAPP') |
| — | **NEW** `otp_status` ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED') |

**Tables (old → new):**
| Old Table | Action | New Table |
|---|---|---|
| `users` | **REWRITE** | `users` (drop email, password_hash, auth_provider, is_verified; add phone-unique) |
| — | **NEW** | `otp_verifications` |
| — | **NEW** | `colleges` |
| `categories` | **REWRITE** | `categories` (add slug, description, is_active) |
| — | **NEW** | `pathways` |
| — | **NEW** | `pathway_categories` |
| — | **NEW** | `pathway_colleges` |
| `courses` | **REWRITE** | `courses` (drop price, rating_avg, total_enrollments, category_id) |
| — | **NEW** | `pathway_courses` |
| `modules` | **REWRITE** | `modules` (drop course_id FK, add slug/description/status) |
| — | **NEW** | `course_modules` |
| — | **NEW** | `lessons` (replaces module_items) |
| — | **NEW** | `module_lessons` |
| `enrollments` | **REWRITE** | `enrollments` (pathway_id replaces course_id, new statuses) |
| `payments` | **REWRITE** | `payments` (standalone, Razorpay fields directly, no order_id) |
| `module_item` | **DELETE** | — |
| `assignments`, `assignment_submissions` | **DELETE** | — |
| `tests`, `test_attempts` | **DELETE** | — |
| `carts` | **DELETE** | — |
| `coupons` | **DELETE** | — |
| `orders`, `order_items` | **DELETE** | — |
| `certificates` | **DELETE** | — |
| `reviews` | **DELETE** | — |
| `live_quizzes`, `live_questions`, `live_sessions`, `live_participants` | **DELETE** | — |

**Type exports**: Export `Select` and `Insert` types for all 15 tables. Remove all old type exports (22 types).

> [!NOTE]
> The new schema uses `VARCHAR(50)` IDs with prefix defaults (e.g., `'usr_' || nextval(...)`) generated at the DB level. Drizzle schema should define these as `varchar` primary keys with `.$defaultFn()` or let the DB handle defaults. Since the SQL already creates sequences, we can rely on DB-level defaults and omit `id` on inserts.

---

### 1.2 ID Generation

#### [REWRITE] [generateId.ts](file:///mnt/c/code/unisole/unisole-engine/src/helpers/generateId.ts)

The new schema uses **PostgreSQL sequences** with DB-level defaults (`'usr_' || nextval('users_id_seq')`). This means:
- IDs are auto-generated by the DB when you insert without specifying `id`
- The `generateId()` helper is **no longer needed** for most cases
- We can either delete it entirely or simplify it to just return the DB-generated value via `.returning()`

**Decision**: Remove `generateId()`. All inserts will omit the `id` field and use `.returning()` to get the DB-assigned ID back.

Update `TABLE_PREFIXES` to only contain the new tables if we keep it as a fallback.

---

### 1.3 Helpers Cleanup

#### [DELETE] [ensureAdmin.ts](file:///mnt/c/code/unisole/unisole-engine/src/helpers/ensureAdmin.ts)
Uses email/password auth to create admin. The new system seeds admin via SQL and uses phone OTP. No longer needed.

#### [DELETE] [ensureCourses.ts](file:///mnt/c/code/unisole/unisole-engine/src/helpers/ensureCourses.ts)
Seeds hardcoded courses with old schema shape. SQL seed handles this now.

#### [KEEP] [formatters.ts](file:///mnt/c/code/unisole/unisole-engine/src/helpers/formatters.ts)
- **Keep** `toTitleCase()` — still useful
- **Keep** `normalizePhone()` — still useful, but update to return `+91XXXXXXXXXX` format (E.164) to match the new schema's phone format
- **Remove** `normalizeEmail()` — no email auth

#### [KEEP] [filterColumns.ts](file:///mnt/c/code/unisole/unisole-engine/src/helpers/filterColumns.ts)
Generic utility, still useful for partial updates.

---

### 1.4 Config & Seeds

#### [DELETE] [seed-data.ts](file:///mnt/c/code/unisole/unisole-engine/src/config/seed-data.ts)
139KB of old schema seed data. The SQL file handles seeding now.

#### [REWRITE] [seed.ts](file:///mnt/c/code/unisole/unisole-engine/src/scripts/seed.ts)
Option A: **Delete entirely** — seeding is handled by the SQL init file in Docker.
Option B: **Rewrite** to execute the SQL file via `pg` client for non-Docker environments.

Recommendation: Rewrite as a thin wrapper that reads `edtech_schema_and_seed.sql` and executes it.

#### [DELETE] [create-admin.ts](file:///mnt/c/code/unisole/unisole-engine/src/scripts/create-admin.ts)
Uses email/password. Admin is seeded via SQL now.

#### [KEEP] [migrate.ts](file:///mnt/c/code/unisole/unisole-engine/src/scripts/migrate.ts)
Still needed for future Drizzle migrations after the schema is in place.

---

### 1.5 DB Connection

#### [KEEP] [db.ts](file:///mnt/c/code/unisole/unisole-engine/src/db.ts)
No changes needed. Connection logic is schema-independent.

---

## Phase 2: Authentication

The auth system changes from email/password + Google + in-memory OTP to **phone OTP only with DB-backed verification**.

---

### 2.1 OTP Service

#### [REWRITE] [otp.service.ts](file:///mnt/c/code/unisole/unisole-engine/src/services/otp.service.ts)

Current: In-memory `Map<string, OtpRecord>` — OTPs lost on restart, no proper verification, accepts any 4+ digit input.

New: DB-backed using `otp_verifications` table.

**Send OTP flow:**
1. Normalize phone to `+91XXXXXXXXXX`
2. Generate 4-digit OTP, hash with bcrypt
3. Insert into `otp_verifications` (phone, otp_hash, channel, status='PENDING', expires_at=NOW()+10min)
4. Log OTP in dev mode / send via SMS/WhatsApp in prod
5. Return success

**Verify OTP flow:**
1. Find latest PENDING OTP for phone where `expires_at > NOW()`
2. Compare bcrypt hash
3. Increment `attempts`, check against `max_attempts`
4. On match: update status='VERIFIED', set verified_at
5. On failure: update status='FAILED' if max attempts reached
6. Return boolean

This replaces the "accepts any 4-digit OTP" behavior with actual security.

---

### 2.2 OTP Repository

#### [NEW] `src/repositories/otp.repository.ts`

Methods:
- `create(data)` — insert new OTP verification record
- `findLatestPendingByPhone(phone)` — get latest non-expired PENDING OTP
- `updateStatus(id, status, verified_at?)` — mark as VERIFIED/EXPIRED/FAILED
- `incrementAttempts(id)` — bump attempt counter

---

### 2.3 Auth Service (replaces auth.manager.ts)

#### [REWRITE] [auth.manager.ts](file:///mnt/c/code/unisole/unisole-engine/src/managers/auth.manager.ts) → **rename to** `src/services/auth.service.ts`

**Remove:**
- `register()` — no email/password registration
- `login()` — no email/password login
- `sanitizeUser()` password_hash stripping — no password_hash in new schema

**Keep & Rewrite:**
- `sendOtp(body)` — delegates to new OTP service
- `verifyOtp(body)` — delegates to OTP service, then find-or-create user by phone, issue JWT
- `refreshToken(body)` — same logic, updated JWT payload
- `me(id)` — same logic, use new user repository

**JWT payload change:**
```typescript
// Old
{ id, email, role, name }

// New
{ id, phone, role, name }
```

---

### 2.4 Auth Middleware

#### [REWRITE] [auth.ts (middleware)](file:///mnt/c/code/unisole/unisole-engine/src/middleware/auth.ts)

Changes:
- `CustomRequest.user` shape: remove `email`, add `phone`
- Remove mock token fallback (`token_`, `mock_`) — this was a dev hack
- JWT decode expects `{ id, phone, role, name }` instead of `{ id, email, role, name }`
- `requireRole()` — keep, but roles are now uppercase: `'ADMIN'`, `'STUDENT'`

---

### 2.5 Auth Controller & Routes

#### [REWRITE] [auth.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/auth.controller.ts)

**Remove:** `login` handler (email/password)
**Keep:** `sendOtp`, `verifyOtp`, `refresh`, `me`

#### [REWRITE] [auth.ts (routes)](file:///mnt/c/code/unisole/unisole-engine/src/routes/auth.ts)

**Remove:** `POST /login` route
**Keep:** `POST /send-otp`, `POST /verify-otp`, `POST /refresh`, `GET /me`

---

## Phase 3: Domain Layers (Repository → Service → Controller)

Each domain gets a **repository**, **service** (replaces "manager"), and **controller**.

For each domain below, existing files are rewritten in-place or new files are created.

---

### 3.1 Users

#### [REWRITE] [users.repository.ts](file:///mnt/c/code/unisole/unisole-engine/src/repositories/users.repository.ts)
- `getById(id)`, `getByPhone(phone)`, `list(filters?)`, `create(data)`, `update(id, data)`
- No `getByEmail()` — email doesn't exist

#### [REWRITE] `auth.manager.ts` → [NEW] `src/services/users.service.ts`
- (Covered in Phase 2 auth.service.ts for auth logic)
- Users service: `list()`, `getById()`, `update()`, `deactivate()`
- Admin-only operations

#### [REWRITE] [users.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/users.controller.ts)
- Admin user management endpoints

#### [REWRITE] [users.ts (routes)](file:///mnt/c/code/unisole/unisole-engine/src/routes/users.ts)
- Move under `/api/admin/students` per PRD

---

### 3.2 Colleges (NEW domain)

#### [NEW] `src/repositories/colleges.repository.ts`
- `list()`, `getById()`, `getBySlug()`, `create()`, `update()`

#### [NEW] `src/services/colleges.service.ts`
- CRUD + activate/deactivate logic

#### [NEW] `src/controllers/colleges.controller.ts`

#### [NEW] `src/routes/admin/colleges.ts`

---

### 3.3 Categories

#### [REWRITE] [categories.repository.ts](file:///mnt/c/code/unisole/unisole-engine/src/repositories/categories.repository.ts)
- Add slug, description, is_active support

#### [REWRITE] `categories.manager.ts` → `src/services/categories.service.ts`

#### [REWRITE] [categories.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/categories.controller.ts)

#### [REWRITE] [categories.ts (routes)](file:///mnt/c/code/unisole/unisole-engine/src/routes/categories.ts)

---

### 3.4 Pathways (NEW domain — the core product)

#### [NEW] `src/repositories/pathways.repository.ts`
- `list()`, `getById()`, `getBySlug()`, `create()`, `update()`
- `attachCategory(pathwayId, categoryId)`, `detachCategory()`
- `attachCollege(pathwayId, collegeId)`, `detachCollege()`
- `attachCourse(pathwayId, courseId, position)`, `detachCourse()`, `reorderCourses()`
- `getWithRelations(id)` — joins to categories, colleges, courses

#### [NEW] `src/services/pathways.service.ts`
- Create/update with relationship management (transactional)
- Publish/archive lifecycle
- Price validation
- Availability rules (PRD §35)

#### [NEW] `src/controllers/pathways.controller.ts`

#### [NEW] `src/routes/admin/pathways.ts` — full CRUD
#### [NEW] `src/routes/public/pathways.ts` — read-only published pathways
#### [NEW] `src/routes/lms/pathways.ts` — student-facing pathway + content access

---

### 3.5 Courses

#### [REWRITE] [courses.repository.ts](file:///mnt/c/code/unisole/unisole-engine/src/repositories/courses.repository.ts)
- Remove `category_id`, `price`, `rating_avg`, `total_enrollments`
- Add `status`, `is_active`, `short_description`
- Add `attachModule()`, `detachModule()`, `reorderModules()`
- Add `getPathwaysUsingCourse(courseId)` — for admin "used by" display

#### [REWRITE] `courses.manager.ts` → `src/services/courses.service.ts`
- Enforce archive-instead-of-delete for used courses (PRD §33)

#### [REWRITE] [courses.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/courses.controller.ts)

#### [REWRITE] [courses.ts (routes)](file:///mnt/c/code/unisole/unisole-engine/src/routes/courses.ts)

---

### 3.6 Modules

#### [REWRITE] [modules.repository.ts](file:///mnt/c/code/unisole/unisole-engine/src/repositories/modules.repository.ts)
- Remove `course_id` FK (now many-to-many via `course_modules`)
- Add `slug`, `description`, `status`, `is_active`
- Add `attachLesson()`, `detachLesson()`, `reorderLessons()`
- Add `getCoursesUsingModule(moduleId)`

#### [REWRITE] `modules.manager.ts` → `src/services/modules.service.ts`

#### [REWRITE] [modules.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/modules.controller.ts)

#### [REWRITE] [modules.ts (routes)](file:///mnt/c/code/unisole/unisole-engine/src/routes/modules.ts)

---

### 3.7 Lessons (replaces module_items)

#### [NEW] `src/repositories/lessons.repository.ts`
- `list()`, `getById()`, `getBySlug()`, `create()`, `update()`
- `getModulesUsingLesson(lessonId)`

#### [NEW] `src/services/lessons.service.ts`

#### [NEW] `src/controllers/lessons.controller.ts`

#### [NEW] `src/routes/admin/lessons.ts`

---

### 3.8 Enrollments

#### [REWRITE] [enrollments.repository.ts](file:///mnt/c/code/unisole/unisole-engine/src/repositories/enrollments.repository.ts)
- `pathway_id` replaces `course_id`
- New statuses: PENDING, ACTIVE, CANCELLED, EXPIRED
- `getActiveByUserAndPathway(userId, pathwayId)` — for uniqueness check
- Remove `progress_percent`

#### [REWRITE] `enrollments.manager.ts` → `src/services/enrollments.service.ts`
- Pathway-based enrollment logic
- Prevent duplicate active enrollments (DB constraint exists but service should check too)
- Activate enrollment after payment verification

#### [REWRITE] [enrollments.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/enrollments.controller.ts)

#### [REWRITE] [enrollments.ts (routes)](file:///mnt/c/code/unisole/unisole-engine/src/routes/enrollments.ts)

---

### 3.9 Payments

#### [REWRITE] [payments.repository.ts](file:///mnt/c/code/unisole/unisole-engine/src/repositories/payments.repository.ts)
- No `order_id` — payments are standalone
- Direct Razorpay fields: `provider_order_id`, `provider_payment_id`, `provider_signature`
- Status: CREATED → PENDING → SUCCESS/FAILED/REFUNDED
- `getByProviderOrderId()`, `getByProviderPaymentId()`

#### [REWRITE] `webhook.manager.ts` → `src/services/payments.service.ts`
- `createOrder(userId, pathwayId)` — create Razorpay order, insert payment record
- `verifyPayment(providerPaymentId, providerSignature)` — verify signature, update status, activate enrollment
- Idempotent — must not create duplicate enrollments on retry
- Transactional — payment status + enrollment activation must be atomic

#### [REWRITE] [payments.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/payments.controller.ts)

#### [REWRITE] [webhook.controller.ts](file:///mnt/c/code/unisole/unisole-engine/src/controllers/webhook.controller.ts)

---

### 3.10 Student Content Access (LMS)

#### [NEW] `src/services/lms.service.ts`
- `getAccessiblePathways(userId)` — pathways the student is enrolled in
- `getPathwayContent(userId, pathwayId)` — full content tree if enrolled
- `getLessonContent(userId, lessonId)` — verify enrollment chain before returning content
- Access check: User → Enrollment → Pathway → Course → Module → Lesson (PRD §37)

#### [NEW] `src/controllers/lms.controller.ts`

#### [NEW] `src/routes/lms/index.ts`

---

## Phase 4: App Wiring & Cleanup

---

### 4.1 Entry Point

#### [REWRITE] [index.ts](file:///mnt/c/code/unisole/unisole-engine/src/index.ts)

**Remove:**
- Socket.io import and setup (live quiz removed)
- All old route imports (22 routers)
- `ensureDefaultAdmin()` — no longer needed
- `ensureDefaultCourses()` — no longer needed
- `rawBody` middleware (may still need for webhook signature verification)

**Add new route groups:**
```typescript
app.use("/api/auth", authRouter);
app.use("/api/lms", lmsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/public", publicRouter);
app.use("/api/webhooks", webhooksRouter);
```

**Keep:**
- Express + CORS setup
- Health check
- `notFound` and `errorHandler` middleware
- `rawBody` extraction (needed for Razorpay webhook signature)

---

### 4.2 Route Organization

#### [NEW] `src/routes/admin/index.ts` — aggregates admin sub-routes
```text
/students    → admin/students.ts
/colleges    → admin/colleges.ts
/categories  → admin/categories.ts
/pathways    → admin/pathways.ts
/courses     → admin/courses.ts
/modules     → admin/modules.ts
/lessons     → admin/lessons.ts
/enrollments → admin/enrollments.ts
/payments    → admin/payments.ts
```

#### [NEW] `src/routes/lms/index.ts` — student-facing
```text
/me          → profile
/pathways    → enrolled pathways + content
/enrollments → student enrollments
/lessons/:id → lesson content (with access check)
/payments/*  → create-order, verify
```

#### [NEW] `src/routes/public/index.ts` — unauthenticated read-only
```text
/pathways    → published pathways list
/pathways/:slug → pathway detail
/categories  → active categories
/colleges    → active colleges
```

---

### 4.3 Files to DELETE (38 files)

These files belong to removed features and should be deleted entirely:

**Repositories (11 files):**
- `assignmentSubmissions.repository.ts`
- `assignments.repository.ts`
- `carts.repository.ts`
- `certificates.repository.ts`
- `coupons.repository.ts`
- `liveParticipants.repository.ts`
- `liveQuestions.repository.ts`
- `liveQuizzes.repository.ts`
- `liveSessions.repository.ts`
- `moduleItems.repository.ts`
- `orderItems.repository.ts`
- `orders.repository.ts`
- `reviews.repository.ts`
- `testAttempts.repository.ts`
- `tests.repository.ts`

**Managers (15 files):**
- `assignmentSubmissions.manager.ts`
- `assignments.manager.ts`
- `carts.manager.ts`
- `certificates.manager.ts`
- `coupons.manager.ts`
- `liveParticipants.manager.ts`
- `liveQuestions.manager.ts`
- `liveQuizzes.manager.ts`
- `liveSessions.manager.ts`
- `moduleItems.manager.ts`
- `orderItems.manager.ts`
- `orders.manager.ts`
- `reviews.manager.ts`
- `testAttempts.manager.ts`
- `tests.manager.ts`

**Controllers (14 files):**
- `assignmentSubmissions.controller.ts`
- `assignments.controller.ts`
- `carts.controller.ts`
- `certificates.controller.ts`
- `coupons.controller.ts`
- `liveParticipants.controller.ts`
- `liveQuestions.controller.ts`
- `liveQuizzes.controller.ts`
- `liveSessions.controller.ts`
- `moduleItems.controller.ts`
- `orderItems.controller.ts`
- `orders.controller.ts`
- `reviews.controller.ts`
- `testAttempts.controller.ts`
- `tests.controller.ts`

**Routes (16 files):**
- `assignmentSubmissions.ts`
- `assignments.ts`
- `carts.ts`
- `certificates.ts`
- `coupons.ts`
- `live.ts`
- `liveParticipants.ts`
- `liveQuestions.ts`
- `liveQuizzes.ts`
- `liveSessions.ts`
- `moduleItems.ts`
- `orderItems.ts`
- `orders.ts`
- `reviews.ts`
- `testAttempts.ts`
- `tests.ts`

**Sockets (1 file):**
- `sockets/live.socket.ts`

**Scripts (1 file):**
- `scripts/create-admin.ts`

**Helpers (2 files):**
- `helpers/ensureAdmin.ts`
- `helpers/ensureCourses.ts`

**Config (1 file):**
- `config/seed-data.ts`

---

### 4.4 Middleware (mostly keep)

#### [KEEP] [async-handler.ts](file:///mnt/c/code/unisole/unisole-engine/src/middleware/async-handler.ts) — no changes
#### [KEEP] [error-handler.ts](file:///mnt/c/code/unisole/unisole-engine/src/middleware/error-handler.ts) — no changes
#### [KEEP] [not-found.ts](file:///mnt/c/code/unisole/unisole-engine/src/middleware/not-found.ts) — no changes
#### [KEEP] [validate.ts](file:///mnt/c/code/unisole/unisole-engine/src/middleware/validate.ts) — no changes
#### [KEEP] [rate-limiter.ts](file:///mnt/c/code/unisole/unisole-engine/src/middleware/rate-limiter.ts) — no changes
#### [REWRITE] [auth.ts (middleware)](file:///mnt/c/code/unisole/unisole-engine/src/middleware/auth.ts) — (covered in Phase 2)

---

### 4.5 Errors

#### [KEEP] [errors.ts](file:///mnt/c/code/unisole/unisole-engine/src/errors.ts) — no changes needed

---

### 4.6 Package.json

#### [MODIFY] [package.json](file:///mnt/c/code/unisole/unisole-engine/package.json)

**Remove dependencies:**
- `google-auth-library` — no Google auth
- `socket.io` — no live quizzes
- `xlsx` — no Excel exports
- `@types/socket.io` — dev dep
- `@types/xlsx` — dev dep
- `socket.io-client` — dev dep

**Keep:**
- `bcryptjs` — OTP hashing
- `cors`, `dotenv`, `express`, `drizzle-orm`, `jsonwebtoken`, `pg`
- All their `@types/*`
- `drizzle-kit`, `tsx`, `typescript`

**Update scripts:**
- Remove `db:admin` script (create-admin.ts deleted)
- Consider adding `db:seed` that runs the SQL file

---

### 4.7 Dockerfile

#### [MODIFY] [Dockerfile](file:///mnt/c/code/unisole/unisole-engine/Dockerfile)

No structural changes needed. The `COPY drizzle ./drizzle` step will copy an empty directory for now (no migrations yet). Once we run `drizzle-kit generate` after writing the new schema, there will be fresh migration files.

---

### 4.8 Docker Compose

#### [MODIFY] [docker-compose.yml](file:///mnt/c/code/unisole/unisole-engine/docker-compose.yml)

Re-add the `api` service once the backend compiles:
```yaml
api:
  build: .
  restart: unless-stopped
  environment:
    PORT: 3000
    DATABASE_URL: postgres://postgres:postgres@db:5432/unisole
  ports:
    - "3000:3000"
  depends_on:
    db:
      condition: service_healthy
```

---

## Open Questions

> [!IMPORTANT]
> **Drizzle schema approach**: Should we use `drizzle-kit pull` to introspect the running DB and auto-generate the Drizzle schema, or write it manually? `pull` saves time and guarantees 1:1 match with the SQL.

> [!IMPORTANT]
> **Phone number format**: The old code normalizes to 10 digits (`9876543210`), but the SQL seed data uses `+919876543210`. Should we standardize on E.164 (`+91XXXXXXXXXX`) throughout the backend? The new schema stores `VARCHAR(20)`.

> [!IMPORTANT]
> **Managers → Services rename**: The old code uses `managers/` directory. Should we rename to `services/` to match PRD terminology, or keep `managers/` to minimize directory churn?

---

## Execution Order

```text
Phase 1 (Foundation)
  ├── 1.1 Rewrite schema.ts
  ├── 1.2 Update generateId.ts (or delete)
  ├── 1.3 Clean up helpers
  └── 1.4 Clean up config/scripts

Phase 2 (Auth) — depends on Phase 1
  ├── 2.1 Rewrite OTP service (DB-backed)
  ├── 2.2 New OTP repository
  ├── 2.3 Rewrite auth service
  ├── 2.4 Rewrite auth middleware
  └── 2.5 Rewrite auth controller + routes

Phase 3 (Domains) — depends on Phase 1, parallelizable
  ├── 3.1 Users
  ├── 3.2 Colleges (NEW)
  ├── 3.3 Categories
  ├── 3.4 Pathways (NEW — biggest)
  ├── 3.5 Courses
  ├── 3.6 Modules
  ├── 3.7 Lessons (NEW)
  ├── 3.8 Enrollments
  ├── 3.9 Payments + Webhooks
  └── 3.10 LMS content access (NEW)

Phase 4 (Wiring) — depends on Phase 2 + 3
  ├── 4.1 Rewrite index.ts
  ├── 4.2 New route organization
  ├── 4.3 Delete dead files (~60 files)
  ├── 4.4-4.5 Middleware/errors (minimal)
  ├── 4.6 Update package.json
  └── 4.7-4.8 Docker files
```

---

## Verification Plan

### Build
- `npm run build` must succeed with zero errors after all phases

### Automated
- `npm run typecheck` — all types resolve
- Hit all endpoints via curl/httpie and verify correct responses

### Manual Verification
1. **Auth flow**: send-otp → verify-otp → get JWT → use JWT on protected routes
2. **Admin CRUD**: Create college → category → pathway → course → module → lesson → attach relationships
3. **Payment flow**: Create order → verify payment → enrollment auto-created
4. **Student access**: Enrolled student can access lesson content, unenrolled gets 403
5. **Public API**: Published pathways visible, drafts hidden
