# Product Requirements Document (PRD)
## EdTech LMS, Admin Panel & Course Commerce Platform

**Version:** 1.0  
**Date:** 2026-08-26  
**Status:** Draft / Architecture Baseline

---

## 1. Overview

We are building a production-ready but intentionally simple EdTech platform for college students.

The platform sells **Pathways**, where a Pathway is a purchasable collection of reusable Courses. Courses are collections of reusable Modules, and Modules are collections of reusable Lessons.

The system will have three major consumers:

1. **LMS** — student-facing learning experience.
2. **Admin Panel** — internal management of students, colleges, catalog, content, enrollments and payments.
3. **Public/SEO Website** — lightweight public course/pathway discovery and landing pages.

The public/SEO website is not a primary product focus at this stage. Blogs, resources/CMS and blogging functionality are explicitly out of scope.

The backend will be a **modular monolith** built with:

- Node.js
- PostgreSQL
- Drizzle ORM
- REST APIs
- Repository pattern
- Service layer
- Controller layer
- OTP-based authentication
- Razorpay for payments

The architecture should remain simple and practical, while keeping the data model reusable enough to support future catalog growth.

---

# 2. Product Goals

## 2.1 Primary Goals

The platform must allow the business to:

- Manage partner colleges.
- Maintain a global academic category system.
- Create reusable learning content.
- Assemble reusable Courses into Pathways.
- Offer a Pathway to multiple colleges.
- Associate a Pathway with multiple categories.
- Sell Pathways to students.
- Enroll students after successful payment.
- Allow students to access the learning content included in their purchased Pathways.
- Manage students, content, pathways, enrollments and payments through an Admin Panel.
- Authenticate users using mobile OTP only.
- Maintain a clean and extensible backend architecture.

## 2.2 Secondary Goals

The system should make it easy to:

- Reuse an existing Course in multiple Pathways.
- Reuse an existing Module in multiple Courses.
- Reuse an existing Lesson in multiple Modules.
- Change the catalog without duplicating content.
- Add additional colleges without duplicating categories or content.
- Add additional admin capabilities later without redesigning authentication.

---

# 3. Non-Goals

The following are intentionally excluded from the initial version:

- Google authentication.
- Email/password authentication.
- Email authentication.
- Blog/CMS system.
- Resource/blog publishing system.
- Subscription billing.
- Recurring payments.
- Installment plans.
- Course-level purchasing.
- Complex permission/ACL engine.
- Microservices.
- Event-driven architecture.
- Kafka/RabbitMQ.
- Elasticsearch.
- Recommendation engine.
- Gamification.
- Discussion forums.
- Course reviews/ratings.
- Certificates.
- Assignments.
- Advanced analytics platform.
- Dedicated search infrastructure.
- Separate authentication service.
- Separate payment service.

These can be introduced later only when there is a concrete product requirement.

---

# 4. Core Business Model

The core commercial unit is the **Pathway**.

Students do not directly purchase Courses, Modules or Lessons.

### Business hierarchy

```text
College
   │
   └── Pathway
          │
          ├── Course
          │      ├── Module
          │      │      └── Lesson
          │      └── Module
          │             └── Lesson
          │
          └── Course
```

The relationships between learning entities are reusable many-to-many relationships:

```text
Pathway ↔ Course
Course  ↔ Module
Module  ↔ Lesson
```

A student purchases:

```text
Student → Enrollment → Pathway
```

A successful payment creates/activates the corresponding enrollment.

---

# 5. Academic Catalog Model

## 5.1 Colleges

The company partners with multiple colleges.

A College represents an institution through which students may access or purchase relevant Pathways.

A college may have many Pathways.

A Pathway may be offered to multiple Colleges.

Therefore:

```text
College ↔ Pathway
```

is many-to-many.

This is represented by:

```text
pathway_colleges
```

## 5.2 Categories

Categories are **global**, not college-specific.

Initial categories include:

- Science
- Computer Science / IT
- Business / Commerce / Accounts
- BA / Humanities
- Other

All colleges use the same global category list.

There is therefore **no `college_categories` table**.

A Pathway may belong to multiple Categories.

Therefore:

```text
Category ↔ Pathway
```

is many-to-many.

This is represented by:

```text
pathway_categories
```

### Example

```text
Full Stack Development
    ├── Computer Science / IT
    └── Other
```

The Category itself exists only once globally.

---

# 6. Learning Content Model

## 6.1 Pathway

A Pathway is the primary product sold to students.

Example:

```text
Full Stack Developer Pathway
```

A Pathway contains Courses.

A Pathway can:

- belong to multiple Categories.
- be offered to multiple Colleges.
- contain multiple Courses.
- be purchased by many Students.

### Important business rule

A Pathway is the only learning product that students purchase in the initial version.

---

## 6.2 Course

A Course is a reusable learning unit.

A Course may be included in multiple Pathways.

Example:

```text
JavaScript Fundamentals
```

could be included in:

```text
Full Stack Developer
Frontend Developer
Web Development Foundation
```

Therefore:

```text
Pathway ↔ Course
```

is many-to-many.

The relationship is stored in:

```text
pathway_courses
```

The relationship table should contain an ordering field so that the Admin can define the sequence of Courses inside a Pathway.

Example:

```text
Pathway
1. HTML & CSS
2. JavaScript
3. React
4. Node.js
```

---

## 6.3 Module

A Module is a reusable grouping of learning material within a Course.

A Module can be reused across multiple Courses.

Therefore:

```text
Course ↔ Module
```

is many-to-many.

The relationship is stored in:

```text
course_modules
```

The relationship should contain an ordering field.

---

## 6.4 Lesson

A Lesson is the smallest learning content unit in the initial model.

A Lesson can be reused across multiple Modules.

Therefore:

```text
Module ↔ Lesson
```

is many-to-many.

The relationship is stored in:

```text
module_lessons
```

The relationship should contain an ordering field.

---

# 7. Content Reusability Principle

The system must avoid unnecessary duplication.

The following entities are reusable:

```text
Pathway
   ↓ reusable across colleges/categories

Course
   ↓ reusable across pathways

Module
   ↓ reusable across courses

Lesson
   ↓ reusable across modules
```

This means that editing a shared Course/Module/Lesson potentially affects every Pathway where that content is used.

Therefore the Admin Panel must clearly expose usage relationships before destructive or major edits.

Example:

```text
JavaScript Fundamentals
Used by:
- Full Stack Developer
- Frontend Developer
- Web Development Foundation
```

---

# 8. User Model

There is one unified `users` table.

There will not be separate:

- `students` table
- `admins` table

The user has a role.

Initial roles:

```text
STUDENT
ADMIN
```

Example:

```text
users
------
id
phone
name
role
created_at
updated_at
```

The design intentionally keeps the role model simple.

A future permission system can be introduced later if the number of administrative roles grows.

---

# 9. Authentication Requirements

## 9.1 Authentication Method

Only mobile OTP authentication is supported.

Supported OTP delivery channels:

- SMS
- WhatsApp

Not supported:

- Google Login
- Email login
- Password login
- Magic links

## 9.2 OTP Flow

```text
User enters phone
        ↓
Backend validates phone
        ↓
Create OTP verification request
        ↓
Send OTP via SMS/WhatsApp
        ↓
User submits OTP
        ↓
Backend verifies OTP
        ↓
Find existing user
       OR
Create new user
        ↓
Issue authentication token
```

## 9.3 OTP Business Rules

- OTP must have an expiry time.
- OTP must be single-use.
- OTP verification attempts should be limited.
- OTP generation should be rate-limited.
- Previously verified OTPs must not be reusable.
- OTP values should not be stored in plaintext where avoidable; store a secure representation/hash.
- A user is identified primarily by phone number.
- Phone numbers must have a normalized format.
- A phone number should be unique in `users`.

---

# 10. Authorization

The initial system has only:

```text
STUDENT
ADMIN
```

## Student

Can:

- Authenticate.
- View their profile.
- View available Pathways.
- View Pathway details.
- View Courses/Modules/Lessons belonging to accessible Pathways.
- View their enrollments.
- Access purchased learning content.
- View payment/enrollment information relevant to themselves.

Cannot:

- Create/update/delete catalog entities.
- Manage other users.
- Modify enrollments.
- Modify payments.
- Access Admin APIs.

## Admin

Can:

- Manage users/students.
- Manage colleges.
- Manage categories where applicable.
- Manage Pathways.
- Manage Courses.
- Manage Modules.
- Manage Lessons.
- Manage relationships between catalog entities.
- View/manage enrollments.
- View/manage payment records.
- Perform operational actions required by the platform.

Admin authorization will initially be role-based.

No granular permission engine is required for V1.

---

# 11. Enrollment Model

Enrollment represents a student's access to a Pathway.

Relationship:

```text
User 1:N Enrollment
Pathway 1:N Enrollment
```

An Enrollment contains:

- user
- pathway
- status
- payment/reference information as appropriate
- timestamps

The student should not receive a separate enrollment for every Course.

Access is derived from:

```text
Enrollment
    ↓
Pathway
    ↓
Courses
    ↓
Modules
    ↓
Lessons
```

## Enrollment uniqueness

A student should normally have at most one active enrollment for the same Pathway.

A database uniqueness constraint should prevent accidental duplicate active purchases/enrollments where appropriate.

The exact policy for repurchase/refund/re-enrollment should be finalized when refund requirements are defined.

---

# 12. Payment Model

Razorpay is the payment provider.

Students purchase Pathways.

The basic payment flow is:

```text
Student
   ↓
Select Pathway
   ↓
Backend creates Razorpay order
   ↓
Razorpay checkout
   ↓
Payment completed
   ↓
Backend verifies payment
   ↓
Enrollment activated
```

## Important business rule

**Frontend payment success must never be treated as sufficient proof of payment.**

The backend must verify the Razorpay transaction/signature and/or trusted payment status before granting access.

## Payment states

At minimum, the system should distinguish states such as:

```text
CREATED
PENDING
SUCCESS
FAILED
REFUNDED
```

The exact set can be refined during database design.

## Payment amount

The backend must determine the authoritative Pathway price.

The client must not be allowed to arbitrarily submit the purchase amount.

Example:

```text
Frontend:
"Buy pathway X"

Backend:
Pathway X price = ₹5,000

Backend creates Razorpay order for ₹5,000.
```

This prevents price manipulation from the client.

---

# 13. Payment → Enrollment Business Logic

A successful payment should result in an active enrollment.

Conceptually:

```text
Payment verified successfully
        ↓
Check existing enrollment
        ↓
If valid existing enrollment:
    do not create duplicate access
        ↓
Otherwise:
    create/activate enrollment
        ↓
Return successful purchase
```

The payment verification + enrollment activation operation should be handled safely and idempotently.

If the same Razorpay callback/webhook or verification request is received multiple times, it must not create duplicate enrollments.

---

# 14. Admin Panel Requirements

The Admin Panel is the primary operational interface.

## 14.1 Student Management

Admin can:

- List students.
- Search students by phone/name.
- View student details.
- View student enrollments.
- View student payment history.
- View the Pathways purchased by the student.
- Disable/block a user if the business later requires it.

Initial user roles remain `STUDENT` and `ADMIN`.

---

# 15. College Management

Admin can:

- Create college.
- Update college.
- View college.
- List colleges.
- Activate/deactivate college where needed.

A college can be associated with multiple Pathways.

A Pathway can be associated with multiple Colleges.

---

# 16. Category Management

Categories are global.

Admin can:

- View categories.
- Create categories if business requires dynamic categories.
- Update category names/details.
- Activate/deactivate categories where needed.

The initial seeded categories are:

```text
Science
Computer Science / IT
Business / Commerce / Accounts
BA / Humanities
Other
```

A Pathway can have multiple Categories.

---

# 17. Pathway Management

Admin can:

- Create Pathway.
- Update Pathway.
- Publish/unpublish Pathway.
- Set price.
- Associate Categories.
- Associate Colleges.
- Add/remove Courses.
- Reorder Courses.
- View pathway details.
- View enrollment count.
- View usage information.

## Pathway publishing

A Pathway should have a lifecycle/status.

A minimal model:

```text
DRAFT
PUBLISHED
ARCHIVED
```

### DRAFT

Not available for normal student purchase/access.

### PUBLISHED

Visible to students and available for purchase if all required conditions are satisfied.

### ARCHIVED

No longer actively sold, but historical enrollments should remain intact.

---

# 18. Course Management

Admin can:

- Create Course.
- Update Course.
- Publish/unpublish Course if needed.
- Add Modules.
- Remove Modules.
- Reorder Modules.
- View which Pathways use the Course.

Because Courses are reusable, deleting a Course must not accidentally destroy the Pathways using it.

A safer initial policy is:

**Archive/deactivate instead of hard deleting content that is already in use.**

---

# 19. Module Management

Admin can:

- Create Module.
- Update Module.
- Add Lessons.
- Remove Lessons.
- Reorder Lessons.
- View Courses using the Module.

Modules are reusable and therefore should not be physically duplicated when reused.

---

# 20. Lesson Management

Admin can:

- Create Lesson.
- Update Lesson.
- Publish/unpublish Lesson if required.
- Configure lesson content.
- View Modules using the Lesson.

Lesson content format can be finalized during the database/LLD phase.

The initial architecture should avoid assuming a complex content engine unless required.

---

# 21. Content Ordering

Because all learning relationships are reusable many-to-many relationships, ordering belongs on the relationship tables.

For example:

```text
pathway_courses
----------------
pathway_id
course_id
position
```

Similarly:

```text
course_modules
----------------
course_id
module_id
position
```

And:

```text
module_lessons
----------------
module_id
lesson_id
position
```

This allows the same Course to appear at position 1 in one Pathway and position 3 in another.

The same Module can appear at different positions in different Courses.

---

# 22. Public Website

The public website is intentionally lightweight.

Its main purpose is:

- Course/Pathway discovery.
- Pathway detail pages.
- Basic college/category navigation.
- SEO-friendly public catalog pages.

The website is not currently a major business domain.

No blog or CMS module is required.

The backend can expose read-only public APIs for published catalog content.

Example:

```text
GET /api/public/pathways
GET /api/public/pathways/:slug
GET /api/public/categories
GET /api/public/colleges
```

Only published/active content should be exposed through public endpoints.

---

# 23. API Architecture

The backend will expose REST APIs.

Suggested logical route grouping:

```text
/api/auth/*
/api/lms/*
/api/admin/*
/api/public/*
```

However, business logic should not be duplicated between these route groups.

The same service layer should be reused where appropriate.

Example:

```text
Admin Controller
      ↓
Pathway Service
      ↓
Pathway Repository


LMS Controller
      ↓
Pathway Service
      ↓
Pathway Repository
```

Authorization and response shape can differ by consumer, but business logic should remain centralized.

---

# 24. Backend Architecture

The backend will be a **modular monolith**.

There will be one Node.js backend application.

No microservices are required.

Architecture:

```text
Client
  ↓
REST API
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Drizzle ORM
  ↓
PostgreSQL
```

---

# 25. Controller Layer

Controllers are responsible for HTTP concerns:

- Reading parameters.
- Reading authenticated user.
- Validating/receiving validated input.
- Calling services.
- Returning HTTP responses.

Controllers should not contain core business rules.

Bad:

```text
Controller:
  create pathway
  insert pathway
  insert categories
  insert courses
  calculate price
  activate enrollment
```

Better:

```text
Controller
    ↓
PathwayService.create()
    ↓
PathwayRepository
```

---

# 26. Service Layer

Services contain business logic.

Examples:

```text
AuthService
UserService
CollegeService
CategoryService
PathwayService
CourseService
ModuleService
LessonService
EnrollmentService
PaymentService
```

Examples of service responsibilities:

### PathwayService

- Validate requested relationships.
- Create/update Pathway.
- Manage Pathway Courses.
- Manage Pathway Categories.
- Manage Pathway Colleges.
- Enforce publishing rules.

### EnrollmentService

- Check Pathway availability.
- Check existing enrollment.
- Create enrollment.
- Activate/deactivate enrollment according to business rules.

### PaymentService

- Create Razorpay order.
- Verify payment.
- Process payment state changes.
- Activate enrollment after verified successful payment.
- Ensure idempotency.

---

# 27. Repository Layer

Repositories own database access.

Examples:

```text
UserRepository
CollegeRepository
CategoryRepository
PathwayRepository
CourseRepository
ModuleRepository
LessonRepository
EnrollmentRepository
PaymentRepository
OtpRepository
```

Repositories use Drizzle ORM.

Repositories should expose domain-oriented database operations rather than exposing raw SQL throughout services.

Example:

```text
PathwayRepository.findById()
PathwayRepository.findBySlug()
PathwayRepository.create()
PathwayRepository.update()
PathwayRepository.attachCourse()
PathwayRepository.detachCourse()
PathwayRepository.attachCategory()
PathwayRepository.attachCollege()
```

Do not introduce a generic `BaseRepository<T>` unless it becomes necessary.

Explicit repositories are preferred for clarity.

---

# 28. Transaction Strategy

Transactions should be used for operations that modify multiple related records and must succeed/fail together.

Example:

Creating a Pathway and attaching its relationships:

```text
BEGIN
  Create pathway
  Attach categories
  Attach colleges
  Attach courses
COMMIT
```

If any operation fails:

```text
ROLLBACK
```

The Service layer should define the business operation and transaction boundary.

---

# 29. Database Architecture

Database:

**PostgreSQL**

ORM:

**Drizzle ORM**

The initial schema is expected to contain approximately 14 core tables.

## Users/Auth

```text
users
otp_verifications
```

## Catalog

```text
colleges
categories
pathways
pathway_categories
pathway_colleges
```

## Learning Content

```text
courses
pathway_courses
modules
course_modules
lessons
module_lessons
```

## Commerce

```text
enrollments
payments
```

---

# 30. Core Database Relationships

```text
users
  │
  └────< enrollments >──── pathways


colleges
  │
  └────< pathway_colleges >──── pathways


categories
  │
  └────< pathway_categories >──── pathways


pathways
  │
  └────< pathway_courses >──── courses
                                  │
                                  └────< course_modules >──── modules
                                                               │
                                                               └────< module_lessons >──── lessons


enrollments
  │
  └────< payments
```

---

# 31. Database Design Principles

## Primary Keys

Use a consistent primary key strategy across tables.

The exact ID type can be finalized during schema design, but the system should use a stable non-business identifier.

Business values such as phone number, slug or Razorpay IDs should not be used as primary keys.

## Foreign Keys

All relationships should use foreign keys.

Referential integrity should be enforced by PostgreSQL.

## Unique Constraints

Examples:

```text
users.phone
pathways.slug
courses.slug
possibly colleges.slug
```

Junction tables should prevent duplicate relationships.

Example:

```text
UNIQUE(pathway_id, course_id)
UNIQUE(pathway_id, category_id)
UNIQUE(pathway_id, college_id)
UNIQUE(course_id, module_id)
UNIQUE(module_id, lesson_id)
```

## Indexes

Indexes should be created for:

- foreign keys frequently used in queries.
- user phone.
- pathway slug.
- course slug.
- college slug.
- status fields where useful.
- payment provider IDs.
- enrollment lookup by user/pathway.

Indexes should be driven by actual query patterns rather than indexing every column.

---

# 32. Normalization

The database should remain relational and normalized.

Avoid storing:

```text
pathway.course_ids = [...]
```

inside a Pathway row.

Instead use:

```text
pathway_courses
```

Likewise:

```text
course.module_ids
module.lesson_ids
```

should not be stored as arrays.

Use junction tables.

This provides:

- referential integrity.
- reusable content.
- ordering.
- easier querying.
- no duplicated data.

---

# 33. Content Deletion Policy

Because content is reusable, hard deletion is risky.

Example:

```text
JavaScript Course
```

may be used by five Pathways.

Deleting it could break all five.

Therefore:

- New unused content can potentially be deleted.
- Content already used by another entity should normally be archived/deactivated rather than hard deleted.
- Historical enrollments must not break because an admin archives a catalog entity.

This rule should be reflected in the service layer and database constraints.

---

# 34. Slugs

Public-facing catalog entities should have stable slugs.

Examples:

```text
/full-stack-development
/javascript-fundamentals
/react-development
```

Slugs should be unique.

Slugs should be used for public discovery URLs.

Internal APIs may continue using IDs.

---

# 35. Pathway Availability Rules

A Pathway should only be purchasable if:

- Pathway is published.
- Pathway is active.
- It has a valid price.
- It has at least one Course if that is a business requirement.
- Required associated catalog entities are valid.
- It is offered to the relevant College where college-specific availability is being enforced.

The exact validation rules can be finalized during the service/schema design.

---

# 36. College-Specific Access

A Pathway can be offered to multiple Colleges.

Example:

```text
Pathway A
  → College A
  → College B
  → College C
```

This is why:

```text
pathway_colleges
```

exists.

The same Pathway does not need to be copied three times.

If pricing or content later differs per college, that should be modeled explicitly rather than duplicating Pathways.

For V1, the assumption is that the Pathway itself is reusable across colleges.

---

# 37. Student Access Control

When a student requests a Lesson:

```text
Student
   ↓
Authenticated?
   ↓
Has active enrollment?
   ↓
Enrollment belongs to Pathway containing this Course?
   ↓
Course contains Module?
   ↓
Module contains Lesson?
   ↓
Grant access
```

The backend must enforce access.

The frontend must never be trusted to decide whether a student owns content.

---

# 38. API Error Handling

The API should use consistent errors.

Typical categories:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Internal Server Error
```

Examples:

### 401

No valid authentication token.

### 403

Authenticated student attempts to access an Admin endpoint.

### 404

Requested Pathway does not exist.

### 409

Duplicate relationship or conflicting enrollment.

### 422

Invalid request data.

### 429

OTP rate limit exceeded.

The exact response envelope can be standardized during API design.

---

# 39. Security Requirements

Minimum security requirements:

- Validate all incoming API data.
- Normalize phone numbers.
- Never trust client-provided prices.
- Never trust client-provided payment success.
- Verify Razorpay payment securely.
- Protect Admin routes with authentication + role checks.
- Protect student content with enrollment checks.
- Rate-limit OTP endpoints.
- Expire OTPs.
- Make OTPs single-use.
- Do not expose internal payment credentials.
- Store Razorpay secrets securely.
- Do not return sensitive internal data unnecessarily.
- Use HTTPS in production.
- Validate file/content inputs if media upload is introduced.

---

# 40. API Idempotency

Payment-related APIs must be idempotent.

For example, if the payment verification request is sent twice:

```text
Request 1 → Payment SUCCESS → Enrollment created
Request 2 → Payment SUCCESS → Existing enrollment detected → No duplicate
```

This is essential because payment providers and clients may retry requests.

---

# 41. Admin Operational Principles

Admin operations should distinguish between:

### Create

Create a new entity.

### Update

Modify an existing entity.

### Publish

Make content available to students/public users.

### Archive

Stop active usage while preserving historical relationships.

This is preferable to freely deleting catalog entities.

---

# 42. Data Ownership

The conceptual ownership is:

```text
User
 └── owns Enrollments

Enrollment
 └── grants access to Pathway

Pathway
 ├── references Categories
 ├── references Colleges
 └── references Courses

Course
 └── references Modules

Module
 └── references Lessons
```

Content is reusable, while enrollment represents an individual student's commercial access.

---

# 43. Recommended V1 API Domains

## Authentication

```text
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/refresh
POST /api/auth/logout
```

## Student

```text
GET /api/lms/me
GET /api/lms/pathways
GET /api/lms/pathways/:id
GET /api/lms/enrollments
GET /api/lms/enrollments/:id
GET /api/lms/lessons/:id
```

## Payments

```text
POST /api/lms/payments/create-order
POST /api/lms/payments/verify
```

Razorpay webhook handling should also be implemented where appropriate.

## Admin

```text
GET/POST/PATCH /api/admin/students
GET/POST/PATCH /api/admin/colleges
GET/POST/PATCH /api/admin/categories
GET/POST/PATCH /api/admin/pathways
GET/POST/PATCH /api/admin/courses
GET/POST/PATCH /api/admin/modules
GET/POST/PATCH /api/admin/lessons
GET/PATCH       /api/admin/enrollments
GET/PATCH       /api/admin/payments
```

Exact endpoint shapes should be finalized after the database schema and service contracts are designed.

---

# 44. Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend architecture | Modular monolith | Simple and sufficient for V1 |
| Database | PostgreSQL | Strong relational model and transactions |
| ORM | Drizzle | Type-safe SQL-oriented ORM |
| API | REST | Simple and familiar |
| Authentication | Mobile OTP | Business requirement |
| OTP channels | SMS + WhatsApp | Business requirement |
| User model | Single users table | Avoid duplicated identity models |
| Roles | Student + Admin | Minimum required RBAC |
| Payment provider | Razorpay | Business requirement |
| Product | Pathway | Students purchase Pathways |
| Pathway → Course | Many-to-many | Courses are reusable |
| Course → Module | Many-to-many | Modules are reusable |
| Module → Lesson | Many-to-many | Lessons are reusable |
| Category | Global | Same categories across all colleges |
| Pathway → Category | Many-to-many | A pathway can fit multiple categories |
| Pathway → College | Many-to-many | A pathway can be offered to multiple colleges |
| Content ordering | Junction-table position | Same content can have different ordering in different parents |
| Data access | Repository pattern | Isolate database operations |
| Business logic | Service layer | Centralize domain rules |
| HTTP logic | Controllers | Keep transport concerns separate |
| Transactions | Service-level boundaries | Keep multi-write business operations atomic |
| Content deletion | Prefer archive | Prevent breaking reused/historical content |
| SEO | Lightweight public API | SEO is not a primary focus |
| Blogs | Excluded | Explicitly removed from requirements |
| Microservices | No | Unnecessary complexity for V1 |

---

# 45. Key Business Decisions

## Decision 1: Pathway is the commercial product

Students purchase Pathways only.

Courses, Modules and Lessons are learning/content entities, not independent products.

## Decision 2: Content is reusable

No duplication should be required when the same Course/Module/Lesson is used in multiple places.

## Decision 3: Categories are global

Categories are not duplicated per College.

## Decision 4: College association is separate from Category

A Pathway can be offered to different Colleges independently of its global Categories.

## Decision 5: Single identity table

Students and Admins share the same `users` table.

## Decision 6: Minimal RBAC

Only `STUDENT` and `ADMIN` are required initially.

## Decision 7: Payment controls access

A verified successful purchase results in an active enrollment.

## Decision 8: Backend controls access

The frontend cannot decide whether a student owns a Pathway.

## Decision 9: Reusable content should not be casually deleted

Archive/deactivate is preferred once content is in use.

## Decision 10: Keep architecture boring

The initial system should prioritize:

- correctness
- maintainability
- clear data relationships
- transactional consistency
- simple deployment

over architectural complexity.

---

# 46. Open Decisions for the Next Design Phase

The high-level model is now sufficiently defined, but the following should be decided during the detailed schema/LLD phase:

### 1. ID strategy

Choose between UUID, UUIDv7, bigint/identity, etc.

### 2. Soft delete strategy

Decide which entities need:

```text
deleted_at
```

versus simple status fields.

### 3. Exact status enums

Define statuses for:

- Pathway
- Course
- Module
- Lesson
- Enrollment
- Payment
- OTP

### 4. Pathway pricing

Determine:

- integer minor currency units vs decimal.
- whether price can change after purchase.
- whether historical enrollment/payment records store a snapshot of the purchased price.

### 5. Refund behavior

Define what happens to enrollment when a Razorpay payment is refunded.

### 6. College/student relationship

Determine whether a Student belongs to exactly one College, multiple Colleges, or no College.

This is an important schema decision that has not yet been finalized.

### 7. Learning progress

The current model defines access but not student progress.

If progress tracking is required, a future table such as:

```text
lesson_progress
```

will be needed.

It should not be added unless the LMS requires it.

### 8. Lesson content/media

Determine whether a Lesson contains:

- video
- text
- PDF
- external resource
- multiple content types

This affects the Lesson schema.

---

# 47. V1 Definition of Done

The initial platform should be considered functionally complete when:

### Authentication

- Student can request OTP.
- Student can verify OTP.
- Student can receive an authenticated session/token.
- Admin can authenticate through the same mechanism.
- Role-based access is enforced.

### Catalog

- Admin can create/manage Colleges.
- Global Categories exist.
- Admin can create/manage Pathways.
- Admin can associate Pathways with Categories.
- Admin can associate Pathways with Colleges.
- Admin can create/manage Courses.
- Admin can attach Courses to Pathways.
- Admin can create/manage Modules.
- Admin can attach Modules to Courses.
- Admin can create/manage Lessons.
- Admin can attach Lessons to Modules.
- Content ordering works.

### Commerce

- Student can select a Pathway.
- Backend creates a Razorpay order.
- Student completes payment.
- Backend verifies payment.
- Successful payment activates enrollment.
- Duplicate payment processing does not create duplicate access.

### LMS

- Student can see purchased Pathways.
- Student can navigate Pathway → Course → Module → Lesson.
- Backend prevents access to content the student has not purchased.

### Admin

- Admin can manage students.
- Admin can inspect enrollments.
- Admin can inspect payments.
- Admin can manage catalog/content.

### Public

- Published Pathways can be viewed publicly.
- Public APIs do not expose unpublished/internal content.
- No blog/CMS functionality is required.

---

# 48. Final Architecture Baseline

The recommended V1 architecture is:

```text
                    ┌───────────────────────┐
                    │       Clients         │
                    │                       │
                    │  LMS | Admin | Web    │
                    └───────────┬───────────┘
                                │
                             REST API
                                │
                    ┌───────────▼───────────┐
                    │      Controllers      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │       Services        │
                    │    Business Logic     │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │     Repositories      │
                    │    Data Access        │
                    └───────────┬───────────┘
                                │
                           Drizzle ORM
                                │
                    ┌───────────▼───────────┐
                    │      PostgreSQL       │
                    └───────────────────────┘

External integrations:

        Node Backend
          ├── OTP Provider
          │     ├── SMS
          │     └── WhatsApp
          │
          └── Razorpay
```

The central domain remains deliberately small:

```text
User
  ↓
Enrollment
  ↓
Pathway
  ├── Categories
  ├── Colleges
  └── Courses
        ↓
      Modules
        ↓
      Lessons
```

The core architectural principle is:

> **Pathways are products; Courses, Modules and Lessons are reusable content; Enrollments represent purchased access.**

This should be treated as the baseline before moving into the detailed PostgreSQL schema, Drizzle models, LLD contracts and API specifications.
