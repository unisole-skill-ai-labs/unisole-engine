# Activity Log

Chronological log of changes and notable events. Newest first.

---

## 2026-08-26

- **Backend Rewrite (PRD v1.0 Alignment):**
  - Full rewrite of `unisole-engine` to match the 15-table EdTech platform schema.
  - Implemented Phone OTP authentication with bcrypt hashing (`otp_verifications`), session management, and JWT tokens.
  - Reorganized all routes into 5 groups: `/api/auth`, `/api/admin`, `/api/lms`, `/api/public`, `/api/webhooks`.
  - Implemented LMS access control chain: `User → Enrollment → Pathway → Course → Module → Lesson`.
  - Cleaned up ~60 dead legacy files (assignments, carts, coupons, live quizzes, socket.io, old seed files, unused helpers).
  - Production TypeScript build and typecheck verified clean (0 errors).
