# Backend Rewrite Tasks

## Phase 1: Foundation
- [x] 1.1 Rewrite `src/db/schema.ts` (use drizzle-kit pull)
- [x] 1.2 Delete `generateId.ts` 
- [x] 1.3 Clean up helpers (delete ensureAdmin, ensureCourses; update formatters; remove normalizeEmail)
- [x] 1.4 Delete `src/config/seed-data.ts`
- [x] 1.5 Rewrite `src/scripts/seed.ts`, delete `create-admin.ts`

## Phase 2: Auth
- [x] 2.1 New `src/repositories/otp.repository.ts`
- [x] 2.2 Rewrite `src/services/otp.service.ts` (DB-backed)
- [x] 2.3 Rewrite auth manager → `src/services/auth.service.ts`
- [x] 2.4 Rewrite `src/middleware/auth.ts` (phone in JWT, no mock tokens)
- [x] 2.5 Rewrite auth controller + routes

## Phase 3: Domain Layers
- [x] 3.1 Users (repository + service + controller)
- [x] 3.2 Colleges — NEW
- [x] 3.3 Categories
- [x] 3.4 Pathways — NEW (biggest)
- [x] 3.5 Courses
- [x] 3.6 Modules
- [x] 3.7 Lessons — NEW
- [x] 3.8 Enrollments
- [x] 3.9 Payments + Webhooks
- [x] 3.10 LMS content access — NEW

## Phase 4: Wiring & Cleanup
- [x] 4.1 Rewrite `index.ts`
- [x] 4.2 New route organization (admin/, lms/, public/)
- [x] 4.3 Delete ~60 dead files
- [x] 4.4 Update `package.json` (remove unused deps)
- [x] 4.5 Update docker-compose (re-add api service)
- [x] 4.6 Build verification (`npm run build`)
