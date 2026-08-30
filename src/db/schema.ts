import {
  pgTable,
  index,
  check,
  varchar,
  integer,
  timestamp,
  unique,
  text,
  bigint,
  boolean,
  uniqueIndex,
  foreignKey,
  primaryKey,
  pgSequence,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql, InferSelectModel, InferInsertModel } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const userRole = pgEnum("user_role", [
  "STUDENT",
  "MEMBER",
  "ADMIN",
  "SUPER_ADMIN",
]);
export const pathwayStatus = pgEnum("pathway_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const contentStatus = pgEnum("content_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const taskStatus = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "SUBMITTED_FOR_REVIEW",
  "CHANGES_REQUESTED",
  "COMPLETED",
]);
export const taskPriority = pgEnum("task_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);
export const taskActivityType = pgEnum("task_activity_type", [
  "COMMENT",
  "STATUS_CHANGE",
  "SUBMITTED",
  "CHANGES_REQUESTED",
  "APPROVED",
  "BLOCKED",
]);
export const enrollmentStatus = pgEnum("enrollment_status", [
  "PENDING",
  "ACTIVE",
  "CANCELLED",
  "EXPIRED",
]);
export const paymentStatus = pgEnum("payment_status", [
  "CREATED",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
]);
export const otpChannel = pgEnum("otp_channel", ["SMS", "WHATSAPP"]);
export const otpStatus = pgEnum("otp_status", ["PENDING", "VERIFIED", "EXPIRED", "FAILED"]);
export const sessionStatus = pgEnum("session_status", [
  "DRAFT",
  "LIVE",
  "PAUSED",
  "ENDED",
]);

// ============================================================
// SEQUENCES
// ============================================================

export const usersIdSeq = pgSequence("users_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const otpVerificationsIdSeq = pgSequence("otp_verifications_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const collegesIdSeq = pgSequence("colleges_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const branchesIdSeq = pgSequence("branches_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const categoriesIdSeq = pgSequence("categories_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const pathwaysIdSeq = pgSequence("pathways_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const coursesIdSeq = pgSequence("courses_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const modulesIdSeq = pgSequence("modules_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const lessonsIdSeq = pgSequence("lessons_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const enrollmentsIdSeq = pgSequence("enrollments_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const paymentsIdSeq = pgSequence("payments_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const presentationsIdSeq = pgSequence("presentations_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const presentationSessionsIdSeq = pgSequence(
  "presentation_sessions_id_seq",
  {
    startWith: "1",
    increment: "1",
    minValue: "1",
    maxValue: "9223372036854775807",
    cache: "1",
    cycle: false,
  }
);
export const presentationLeadsIdSeq = pgSequence(
  "presentation_leads_id_seq",
  {
    startWith: "1",
    increment: "1",
    minValue: "1",
    maxValue: "9223372036854775807",
    cache: "1",
    cycle: false,
  }
);
export const teamDepartmentsIdSeq = pgSequence("team_departments_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const tasksIdSeq = pgSequence("tasks_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const taskSubtasksIdSeq = pgSequence("task_subtasks_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const taskTemplatesIdSeq = pgSequence("task_templates_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const taskCommentsIdSeq = pgSequence("task_comments_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
export const dailyEodLogsIdSeq = pgSequence("daily_eod_logs_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});

// ============================================================
// 1. USERS
// ============================================================

export const users = pgTable(
  "users",
  {
    id: varchar({ length: 50 })
      .default(sql`('usr_'::text || nextval('users_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    phone: varchar({ length: 20 }).notNull(),
    name: varchar({ length: 150 }),
    collegeId: varchar("college_id", { length: 50 }),
    collegeName: varchar("college_name", { length: 200 }),
    branch: varchar({ length: 100 }),
    departmentId: varchar("department_id", { length: 50 }),
    designation: varchar({ length: 150 }),
    role: userRole().default("STUDENT").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_users_is_active").using("btree", table.isActive.asc().nullsLast()),
    index("idx_users_role").using("btree", table.role.asc().nullsLast()),
    unique("uq_users_phone").on(table.phone),
  ]
);

// ============================================================
// 2. OTP VERIFICATIONS
// ============================================================

export const otpVerifications = pgTable(
  "otp_verifications",
  {
    id: varchar({ length: 50 })
      .default(sql`('otp_'::text || nextval('otp_verifications_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    phone: varchar({ length: 20 }).notNull(),
    otp: varchar({ length: 20 }).notNull(),
    otpHash: varchar("otp_hash", { length: 255 }),
    channel: otpChannel().notNull(),
    status: otpStatus().default("PENDING").notNull(),
    attempts: integer().default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_otp_expires_at").using("btree", table.expiresAt.asc().nullsLast()),
    index("idx_otp_phone").using("btree", table.phone.asc().nullsLast()),
    index("idx_otp_status").using("btree", table.status.asc().nullsLast()),
    check("chk_otp_attempts", sql`attempts >= 0`),
    check("chk_otp_max_attempts", sql`max_attempts > 0`),
  ]
);

// ============================================================
// 3. COLLEGES
// ============================================================

export const colleges = pgTable(
  "colleges",
  {
    id: varchar({ length: 50 })
      .default(sql`('clg_'::text || nextval('colleges_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    name: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 220 }).notNull(),
    shortName: varchar("short_name", { length: 100 }),
    description: text(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_colleges_is_active").using("btree", table.isActive.asc().nullsLast()),
    unique("uq_colleges_slug").on(table.slug),
  ]
);

// ============================================================
// 3b. BRANCHES
// ============================================================

export const branches = pgTable(
  "branches",
  {
    id: varchar({ length: 50 })
      .default(sql`('brn_'::text || nextval('branches_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    collegeId: varchar("college_id", { length: 50 }),
    name: varchar({ length: 200 }).notNull(),
    code: varchar({ length: 100 }),
    description: text(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_branches_college").using("btree", table.collegeId.asc().nullsLast()),
    index("idx_branches_is_active").using("btree", table.isActive.asc().nullsLast()),
    foreignKey({
      columns: [table.collegeId],
      foreignColumns: [colleges.id],
      name: "fk_branches_college",
    }).onDelete("cascade"),
  ]
);

// ============================================================
// 4. CATEGORIES
// ============================================================

export const categories = pgTable(
  "categories",
  {
    id: varchar({ length: 50 })
      .default(sql`('cat_'::text || nextval('categories_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    name: varchar({ length: 150 }).notNull(),
    slug: varchar({ length: 180 }).notNull(),
    description: text(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_categories_is_active").using("btree", table.isActive.asc().nullsLast()),
    unique("uq_categories_name").on(table.name),
    unique("uq_categories_slug").on(table.slug),
  ]
);

// ============================================================
// 5. PATHWAYS
// ============================================================

export const pathways = pgTable(
  "pathways",
  {
    id: varchar({ length: 50 })
      .default(sql`('pwy_'::text || nextval('pathways_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    title: varchar({ length: 250 }).notNull(),
    slug: varchar({ length: 280 }).notNull(),
    shortDescription: varchar("short_description", { length: 500 }),
    description: text(),
    pricePaise: bigint("price_paise", { mode: "number" }).default(0).notNull(),
    status: pathwayStatus().default("DRAFT").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_pathways_is_active").using("btree", table.isActive.asc().nullsLast()),
    index("idx_pathways_status").using("btree", table.status.asc().nullsLast()),
    unique("uq_pathways_slug").on(table.slug),
    check("chk_pathways_price", sql`price_paise >= 0`),
  ]
);

// ============================================================
// 6. PATHWAY ↔ CATEGORY
// ============================================================

export const pathwayCategories = pgTable(
  "pathway_categories",
  {
    pathwayId: varchar("pathway_id", { length: 50 }).notNull(),
    categoryId: varchar("category_id", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_pathway_categories_category").using(
      "btree",
      table.categoryId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.pathwayId],
      foreignColumns: [pathways.id],
      name: "fk_pathway_categories_pathway",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "fk_pathway_categories_category",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.pathwayId, table.categoryId],
      name: "pathway_categories_pkey",
    }),
  ]
);

// ============================================================
// 7. PATHWAY ↔ COLLEGE
// ============================================================

export const pathwayColleges = pgTable(
  "pathway_colleges",
  {
    pathwayId: varchar("pathway_id", { length: 50 }).notNull(),
    collegeId: varchar("college_id", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_pathway_colleges_college").using(
      "btree",
      table.collegeId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.pathwayId],
      foreignColumns: [pathways.id],
      name: "fk_pathway_colleges_pathway",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.collegeId],
      foreignColumns: [colleges.id],
      name: "fk_pathway_colleges_college",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.pathwayId, table.collegeId],
      name: "pathway_colleges_pkey",
    }),
  ]
);

// ============================================================
// 8. COURSES
// ============================================================

export const courses = pgTable(
  "courses",
  {
    id: varchar({ length: 50 })
      .default(sql`('crs_'::text || nextval('courses_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    title: varchar({ length: 250 }).notNull(),
    slug: varchar({ length: 280 }).notNull(),
    shortDescription: varchar("short_description", { length: 500 }),
    description: text(),
    status: contentStatus().default("DRAFT").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_courses_is_active").using("btree", table.isActive.asc().nullsLast()),
    index("idx_courses_status").using("btree", table.status.asc().nullsLast()),
    unique("uq_courses_slug").on(table.slug),
  ]
);

// ============================================================
// 9. PATHWAY ↔ COURSE
// ============================================================

export const pathwayCourses = pgTable(
  "pathway_courses",
  {
    pathwayId: varchar("pathway_id", { length: 50 }).notNull(),
    courseId: varchar("course_id", { length: 50 }).notNull(),
    position: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_pathway_courses_course").using("btree", table.courseId.asc().nullsLast()),
    foreignKey({
      columns: [table.pathwayId],
      foreignColumns: [pathways.id],
      name: "fk_pathway_courses_pathway",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "fk_pathway_courses_course",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.pathwayId, table.courseId],
      name: "pathway_courses_pkey",
    }),
    unique("uq_pathway_courses_position").on(table.pathwayId, table.position),
    check("chk_pathway_courses_position", sql`"position" > 0`),
  ]
);

// ============================================================
// 10. MODULES
// ============================================================

export const modules = pgTable(
  "modules",
  {
    id: varchar({ length: 50 })
      .default(sql`('mod_'::text || nextval('modules_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    title: varchar({ length: 250 }).notNull(),
    slug: varchar({ length: 280 }).notNull(),
    description: text(),
    status: contentStatus().default("DRAFT").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_modules_is_active").using("btree", table.isActive.asc().nullsLast()),
    index("idx_modules_status").using("btree", table.status.asc().nullsLast()),
    unique("uq_modules_slug").on(table.slug),
  ]
);

// ============================================================
// 11. COURSE ↔ MODULE
// ============================================================

export const courseModules = pgTable(
  "course_modules",
  {
    courseId: varchar("course_id", { length: 50 }).notNull(),
    moduleId: varchar("module_id", { length: 50 }).notNull(),
    position: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_course_modules_module").using("btree", table.moduleId.asc().nullsLast()),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "fk_course_modules_course",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.moduleId],
      foreignColumns: [modules.id],
      name: "fk_course_modules_module",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.courseId, table.moduleId],
      name: "course_modules_pkey",
    }),
    unique("uq_course_modules_position").on(table.courseId, table.position),
    check("chk_course_modules_position", sql`"position" > 0`),
  ]
);

// ============================================================
// 12. LESSONS
// ============================================================

export const lessons = pgTable(
  "lessons",
  {
    id: varchar({ length: 50 })
      .default(sql`('les_'::text || nextval('lessons_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    title: varchar({ length: 250 }).notNull(),
    slug: varchar({ length: 280 }).notNull(),
    description: text(),
    content: text(),
    videoUrl: text("video_url"),
    durationMinutes: integer("duration_minutes"),
    status: contentStatus().default("DRAFT").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_lessons_is_active").using("btree", table.isActive.asc().nullsLast()),
    index("idx_lessons_status").using("btree", table.status.asc().nullsLast()),
    unique("uq_lessons_slug").on(table.slug),
    check("chk_lessons_duration", sql`(duration_minutes IS NULL) OR (duration_minutes >= 0)`),
  ]
);

// ============================================================
// 13. MODULE ↔ LESSON
// ============================================================

export const moduleLessons = pgTable(
  "module_lessons",
  {
    moduleId: varchar("module_id", { length: 50 }).notNull(),
    lessonId: varchar("lesson_id", { length: 50 }).notNull(),
    position: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_module_lessons_lesson").using("btree", table.lessonId.asc().nullsLast()),
    foreignKey({
      columns: [table.moduleId],
      foreignColumns: [modules.id],
      name: "fk_module_lessons_module",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.lessonId],
      foreignColumns: [lessons.id],
      name: "fk_module_lessons_lesson",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.moduleId, table.lessonId],
      name: "module_lessons_pkey",
    }),
    unique("uq_module_lessons_position").on(table.moduleId, table.position),
    check("chk_module_lessons_position", sql`"position" > 0`),
  ]
);

// ============================================================
// 14. ENROLLMENTS
// ============================================================

export const enrollments = pgTable(
  "enrollments",
  {
    id: varchar({ length: 50 })
      .default(sql`('enr_'::text || nextval('enrollments_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    userId: varchar("user_id", { length: 50 }).notNull(),
    pathwayId: varchar("pathway_id", { length: 50 }).notNull(),
    status: enrollmentStatus().default("PENDING").notNull(),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true, mode: "string" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_enrollments_pathway").using("btree", table.pathwayId.asc().nullsLast()),
    index("idx_enrollments_pathway_status").using(
      "btree",
      table.pathwayId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    index("idx_enrollments_user").using("btree", table.userId.asc().nullsLast()),
    index("idx_enrollments_user_status").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.status.asc().nullsLast()
    ),
    uniqueIndex("uq_active_user_pathway_enrollment")
      .using("btree", table.userId.asc().nullsLast(), table.pathwayId.asc().nullsLast())
      .where(sql`(status = 'ACTIVE'::enrollment_status)`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_enrollments_user",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.pathwayId],
      foreignColumns: [pathways.id],
      name: "fk_enrollments_pathway",
    }).onDelete("restrict"),
  ]
);

// ============================================================
// 15. PAYMENTS
// ============================================================

export const payments = pgTable(
  "payments",
  {
    id: varchar({ length: 50 })
      .default(sql`('pay_'::text || nextval('payments_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    userId: varchar("user_id", { length: 50 }).notNull(),
    enrollmentId: varchar("enrollment_id", { length: 50 }),
    pathwayId: varchar("pathway_id", { length: 50 }).notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    currency: varchar({ length: 3 }).default("INR").notNull(),
    status: paymentStatus().default("CREATED").notNull(),
    provider: varchar({ length: 50 }).default("RAZORPAY").notNull(),
    providerOrderId: varchar("provider_order_id", { length: 150 }),
    providerPaymentId: varchar("provider_payment_id", { length: 150 }),
    providerSignature: varchar("provider_signature", { length: 500 }),
    failureReason: text("failure_reason"),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "string" }),
    refundedAt: timestamp("refunded_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_payments_enrollment").using("btree", table.enrollmentId.asc().nullsLast()),
    index("idx_payments_pathway").using("btree", table.pathwayId.asc().nullsLast()),
    index("idx_payments_provider_order").using(
      "btree",
      table.providerOrderId.asc().nullsLast()
    ),
    index("idx_payments_provider_payment").using(
      "btree",
      table.providerPaymentId.asc().nullsLast()
    ),
    index("idx_payments_status").using("btree", table.status.asc().nullsLast()),
    index("idx_payments_user").using("btree", table.userId.asc().nullsLast()),
    uniqueIndex("uq_payments_provider_order")
      .using("btree", table.providerOrderId.asc().nullsLast())
      .where(sql`(provider_order_id IS NOT NULL)`),
    uniqueIndex("uq_payments_provider_payment")
      .using("btree", table.providerPaymentId.asc().nullsLast())
      .where(sql`(provider_payment_id IS NOT NULL)`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_payments_user",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.enrollmentId],
      foreignColumns: [enrollments.id],
      name: "fk_payments_enrollment",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.pathwayId],
      foreignColumns: [pathways.id],
      name: "fk_payments_pathway",
    }).onDelete("restrict"),
    check("chk_payments_amount", sql`amount_paise >= 0`),
    check("chk_payments_currency", sql`(currency)::text = 'INR'::text`),
  ]
);

// ============================================================
// 16. PRESENTATIONS
// ============================================================

export const presentations = pgTable(
  "presentations",
  {
    id: varchar({ length: 50 })
      .default(sql`('pres_'::text || nextval('presentations_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    collegeId: varchar("college_id", { length: 50 }),
    collegeName: varchar("college_name", { length: 200 }),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    theme: varchar({ length: 50 }).default("dark").notNull(),
    slides: jsonb().default(sql`'[]'::jsonb`).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdById: varchar("created_by_id", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_presentations_is_active").using(
      "btree",
      table.isActive.asc().nullsLast()
    ),
    index("idx_presentations_college").using(
      "btree",
      table.collegeId.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.collegeId],
      foreignColumns: [colleges.id],
      name: "fk_presentations_college",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "fk_presentations_created_by",
    }).onDelete("set null"),
  ]
);

// ============================================================
// 17. PRESENTATION SESSIONS
// ============================================================

export const presentationSessions = pgTable(
  "presentation_sessions",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('sess_'::text || nextval('presentation_sessions_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    presentationId: varchar("presentation_id", { length: 50 }).notNull(),
    collegeId: varchar("college_id", { length: 50 }),
    collegeName: varchar("college_name", { length: 200 }),
    sessionCode: varchar("session_code", { length: 20 }).notNull(),
    status: sessionStatus().default("DRAFT").notNull(),
    currentSlideIndex: integer("current_slide_index").default(0).notNull(),
    isQuizActive: boolean("is_quiz_active").default(false).notNull(),
    isAnswerRevealed: boolean("is_answer_revealed").default(false).notNull(),
    isLeaderboardActive: boolean("is_leaderboard_active")
      .default(false)
      .notNull(),
    quizStartedAt: timestamp("quiz_started_at", {
      withTimezone: true,
      mode: "string",
    }),
    quizTimeLimit: integer("quiz_time_limit").default(30).notNull(),
    activeAttendeesCount: integer("active_attendees_count")
      .default(0)
      .notNull(),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "string",
    }),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_presentation_sessions_code").using(
      "btree",
      table.sessionCode.asc().nullsLast()
    ),
    index("idx_presentation_sessions_status").using(
      "btree",
      table.status.asc().nullsLast()
    ),
    unique("uq_presentation_sessions_code").on(table.sessionCode),
    foreignKey({
      columns: [table.presentationId],
      foreignColumns: [presentations.id],
      name: "fk_sessions_presentation",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.collegeId],
      foreignColumns: [colleges.id],
      name: "fk_sessions_college",
    }).onDelete("set null"),
  ]
);

// ============================================================
// 18. PRESENTATION LEADS
// ============================================================

export const presentationLeads = pgTable(
  "presentation_leads",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('lead_'::text || nextval('presentation_leads_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    sessionId: varchar("session_id", { length: 50 }).notNull(),
    collegeId: varchar("college_id", { length: 50 }),
    userId: varchar("user_id", { length: 50 }),
    name: varchar({ length: 150 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    email: varchar({ length: 255 }),
    branch: varchar({ length: 100 }),
    yearOfStudy: varchar("year_of_study", { length: 50 }),
    totalScore: integer("total_score").default(0).notNull(),
    rank: integer(),
    streak: integer().default(0).notNull(),
    responses: jsonb().default(sql`'{}'::jsonb`).notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_presentation_leads_session").using(
      "btree",
      table.sessionId.asc().nullsLast()
    ),
    index("idx_presentation_leads_phone").using(
      "btree",
      table.phone.asc().nullsLast()
    ),
    index("idx_presentation_leads_score").using(
      "btree",
      table.totalScore.desc().nullsLast()
    ),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [presentationSessions.id],
      name: "fk_leads_session",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.collegeId],
      foreignColumns: [colleges.id],
      name: "fk_leads_college",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_leads_user",
    }).onDelete("set null"),
  ]
);

// ============================================================
// 12. TEAM & TASK MANAGEMENT TABLES
// ============================================================

export const teamDepartments = pgTable(
  "team_departments",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('dept_'::text || nextval('team_departments_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    name: varchar({ length: 150 }).notNull(),
    code: varchar({ length: 50 }).notNull().unique(),
    color: varchar({ length: 30 }).default("#6366f1").notNull(),
    description: text(),
    leadId: varchar("lead_id", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.leadId],
      foreignColumns: [users.id],
      name: "fk_dept_lead",
    }).onDelete("set null"),
  ]
);

export const taskTemplates = pgTable(
  "task_templates",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('tmpl_'::text || nextval('task_templates_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    departmentId: varchar("department_id", { length: 50 }),
    description: text(),
    defaultChecklist: jsonb("default_checklist")
      .default(sql`'[]'::jsonb`)
      .notNull(),
    guidelinesUrl: text("guidelines_url"),
    estimatedHours: integer("estimated_hours").default(2),
    createdById: varchar("created_by_id", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [teamDepartments.id],
      name: "fk_template_dept",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "fk_template_creator",
    }).onDelete("set null"),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: varchar({ length: 50 })
      .default(sql`('task_'::text || nextval('tasks_id_seq'::regclass))`)
      .primaryKey()
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    status: taskStatus().default("TODO").notNull(),
    priority: taskPriority().default("MEDIUM").notNull(),
    assigneeId: varchar("assignee_id", { length: 50 }),
    reporterId: varchar("reporter_id", { length: 50 }),
    departmentId: varchar("department_id", { length: 50 }),
    templateId: varchar("template_id", { length: 50 }),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }),
    estimatedHours: integer("estimated_hours"),
    submissionProofUrl: text("submission_proof_url"),
    submissionNotes: text("submission_notes"),
    blockedReason: text("blocked_reason"),
    relatedEntityType: varchar("related_entity_type", { length: 50 }), // 'COLLEGE', 'PATHWAY', 'PRESENTATION', etc.
    relatedEntityId: varchar("related_entity_id", { length: 50 }),
    relatedEntityName: varchar("related_entity_name", { length: 255 }),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_tasks_assignee").using("btree", table.assigneeId.asc().nullsLast()),
    index("idx_tasks_status").using("btree", table.status.asc().nullsLast()),
    index("idx_tasks_department").using("btree", table.departmentId.asc().nullsLast()),
    index("idx_tasks_due_date").using("btree", table.dueDate.asc().nullsLast()),
    foreignKey({
      columns: [table.assigneeId],
      foreignColumns: [users.id],
      name: "fk_tasks_assignee",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.reporterId],
      foreignColumns: [users.id],
      name: "fk_tasks_reporter",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [teamDepartments.id],
      name: "fk_tasks_dept",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [taskTemplates.id],
      name: "fk_tasks_template",
    }).onDelete("set null"),
  ]
);

export const taskSubtasks = pgTable(
  "task_subtasks",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('stask_'::text || nextval('task_subtasks_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    taskId: varchar("task_id", { length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_subtasks_task").using("btree", table.taskId.asc().nullsLast()),
    foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
      name: "fk_subtasks_task",
    }).onDelete("cascade"),
  ]
);

export const taskComments = pgTable(
  "task_comments",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('tcomm_'::text || nextval('task_comments_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    taskId: varchar("task_id", { length: 50 }).notNull(),
    userId: varchar("user_id", { length: 50 }).notNull(),
    content: text().notNull(),
    activityType: taskActivityType("activity_type").default("COMMENT").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_comments_task").using("btree", table.taskId.asc().nullsLast()),
    foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
      name: "fk_comments_task",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_comments_user",
    }).onDelete("cascade"),
  ]
);

export const dailyEodLogs = pgTable(
  "daily_eod_logs",
  {
    id: varchar({ length: 50 })
      .default(
        sql`('eod_'::text || nextval('daily_eod_logs_id_seq'::regclass))`
      )
      .primaryKey()
      .notNull(),
    userId: varchar("user_id", { length: 50 }).notNull(),
    logDate: varchar("log_date", { length: 10 }).notNull(), // 'YYYY-MM-DD'
    completedSummary: text("completed_summary").notNull(),
    planTomorrow: text("plan_tomorrow").notNull(),
    blockers: text("blockers"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_eod_user").using("btree", table.userId.asc().nullsLast()),
    index("idx_eod_date").using("btree", table.logDate.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_eod_user",
    }).onDelete("cascade"),
  ]
);

// ============================================================
// SELECT TYPES (read from DB)
// ============================================================

export type User = InferSelectModel<typeof users>;
export type OtpVerification = InferSelectModel<typeof otpVerifications>;
export type College = InferSelectModel<typeof colleges>;
export type Branch = InferSelectModel<typeof branches>;
export type Category = InferSelectModel<typeof categories>;
export type Pathway = InferSelectModel<typeof pathways>;
export type PathwayCategory = InferSelectModel<typeof pathwayCategories>;
export type PathwayCollege = InferSelectModel<typeof pathwayColleges>;
export type Course = InferSelectModel<typeof courses>;
export type PathwayCourse = InferSelectModel<typeof pathwayCourses>;
export type Module = InferSelectModel<typeof modules>;
export type CourseModule = InferSelectModel<typeof courseModules>;
export type Lesson = InferSelectModel<typeof lessons>;
export type ModuleLesson = InferSelectModel<typeof moduleLessons>;
export type Enrollment = InferSelectModel<typeof enrollments>;
export type Payment = InferSelectModel<typeof payments>;
export type Presentation = InferSelectModel<typeof presentations>;
export type PresentationSession = InferSelectModel<typeof presentationSessions>;
export type PresentationLead = InferSelectModel<typeof presentationLeads>;
export type TeamDepartment = InferSelectModel<typeof teamDepartments>;
export type TaskTemplate = InferSelectModel<typeof taskTemplates>;
export type Task = InferSelectModel<typeof tasks>;
export type TaskSubtask = InferSelectModel<typeof taskSubtasks>;
export type TaskComment = InferSelectModel<typeof taskComments>;
export type DailyEodLog = InferSelectModel<typeof dailyEodLogs>;

// ============================================================
// INSERT TYPES (write to DB)
// ============================================================

export type NewUser = InferInsertModel<typeof users>;
export type NewOtpVerification = InferInsertModel<typeof otpVerifications>;
export type NewCollege = InferInsertModel<typeof colleges>;
export type NewBranch = InferInsertModel<typeof branches>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewPathway = InferInsertModel<typeof pathways>;
export type NewPathwayCategory = InferInsertModel<typeof pathwayCategories>;
export type NewPathwayCollege = InferInsertModel<typeof pathwayColleges>;
export type NewCourse = InferInsertModel<typeof courses>;
export type NewPathwayCourse = InferInsertModel<typeof pathwayCourses>;
export type NewModule = InferInsertModel<typeof modules>;
export type NewCourseModule = InferInsertModel<typeof courseModules>;
export type NewLesson = InferInsertModel<typeof lessons>;
export type NewModuleLesson = InferInsertModel<typeof moduleLessons>;
export type NewEnrollment = InferInsertModel<typeof enrollments>;
export type NewPayment = InferInsertModel<typeof payments>;
export type NewPresentation = InferInsertModel<typeof presentations>;
export type NewPresentationSession = InferInsertModel<typeof presentationSessions>;
export type NewPresentationLead = InferInsertModel<typeof presentationLeads>;
export type NewTeamDepartment = InferInsertModel<typeof teamDepartments>;
export type NewTaskTemplate = InferInsertModel<typeof taskTemplates>;
export type NewTask = InferInsertModel<typeof tasks>;
export type NewTaskSubtask = InferInsertModel<typeof taskSubtasks>;
export type NewTaskComment = InferInsertModel<typeof taskComments>;
export type NewDailyEodLog = InferInsertModel<typeof dailyEodLogs>;
