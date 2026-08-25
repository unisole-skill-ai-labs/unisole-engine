import {
  boolean,
  char,
  check,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const authProviderEnum = pgEnum("auth_provider", ["local", "google", "supabase", "phone"]);
export const itemTypeEnum = pgEnum("item_type", ["video", "pdf", "article", "quiz", "assignment"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "graded"]);
export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "evaluated",
]);
export const discountTypeEnum = pgEnum("discount_type", ["flat", "percent"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "expired",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "created",
  "paid",
  "failed",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "captured",
  "failed",
  "refunded",
]);
export const liveSessionStatusEnum = pgEnum("live_session_status", [
  "lobby",
  "locked_active",
  "finished",
]);
export const liveQuestionTypeEnum = pgEnum("live_question_type", [
  "mcq",
  "true_false",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  password_hash: varchar("password_hash", { length: 255 }),
  role: userRoleEnum("role").notNull().default("student"),
  auth_provider: authProviderEnum("auth_provider").notNull().default("local"),
  is_verified: boolean("is_verified").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  category_id: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  rating_avg: decimal("rating_avg", { precision: 3, scale: 2 }).notNull().default("0"),
  total_enrollments: integer("total_enrollments").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  course_id: text("course_id").references(() => courses.id, { onDelete: "cascade" }),
  order_index: smallint("order_index").notNull().default(0),
});

export const moduleItems = pgTable("module_item", {
  id: text("id").primaryKey(),
  module_id: text("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  type: itemTypeEnum("type").notNull(),
  content_url: varchar("content_url", { length: 500 }),
  content_body: text("content_body"),
  order_index: smallint("order_index").notNull().default(0),
});

export const assignments = pgTable("assignments", {
  id: text("id").primaryKey(),
  lesson_id: text("lesson_id").references(() => moduleItems.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  max_score: smallint("max_score").notNull().default(100),
  due_date: timestamp("due_date", { withTimezone: true }),
  allowed_attempts: smallint("allowed_attempts").notNull().default(1),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: text("id").primaryKey(),
  assignment_id: text("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  file_url: varchar("file_url", { length: 500 }),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  status: submissionStatusEnum("status").notNull().default("pending"),
  score: decimal("score", { precision: 5, scale: 2 }),
});

export const tests = pgTable("tests", {
  id: text("id").primaryKey(),
  module_item_id: text("module_item_id").references(() => moduleItems.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  duration_min: smallint("duration_min").notNull().default(0),
  total_marks: smallint("total_marks").notNull().default(0),
  passing_marks: smallint("passing_marks").notNull().default(0),
  max_attempts: smallint("max_attempts").notNull().default(1),
});

export const testAttempts = pgTable("test_attempts", {
  id: text("id").primaryKey(),
  test_id: text("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: attemptStatusEnum("status").notNull().default("in_progress"),
  score: decimal("score", { precision: 6, scale: 2 }),
  answers: jsonb("answers"),
});

export const carts = pgTable("carts", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  discount_type: discountTypeEnum("discount_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull().default("0"),
  max_uses: integer("max_uses").notNull().default(0),
  used_count: integer("used_count").notNull().default(0),
  valid_from: timestamp("valid_from", { withTimezone: true }).notNull(),
  valid_to: timestamp("valid_to", { withTimezone: true }).notNull(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    course_id: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolled_at: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
    expiry_at: timestamp("expiry_at", { withTimezone: true }),
    progress_percent: smallint("progress_percent").notNull().default(0),
    status: enrollmentStatusEnum("status").notNull().default("active"),
  },
  (table) => [unique().on(table.user_id, table.course_id)]
);

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  razorpay_order_id: varchar("razorpay_order_id", { length: 50 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  currency: char("currency", { length: 3 }).notNull().default("INR"),
  status: orderStatusEnum("status").notNull().default("created"),
  coupon_id: text("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  order_id: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  course_id: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  price_at_purchase: decimal("price_at_purchase", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  order_id: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  razorpay_payment_id: varchar("razorpay_payment_id", { length: 50 }).notNull().unique(),
  razorpay_signature: varchar("razorpay_signature", { length: 255 }).notNull(),
  method: varchar("method", { length: 30 }),
  status: paymentStatusEnum("status").notNull().default("captured"),
});

export const certificates = pgTable(
  "certificates",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    course_id: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    certificate_url: varchar("certificate_url", { length: 500 }).notNull(),
  },
  (table) => [unique().on(table.user_id, table.course_id)]
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    course_id: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
  },
  (table) => [
    unique().on(table.user_id, table.course_id),
    check("rating_range", sql`rating between 1 and 5`),
  ]
);

export const liveQuizzes = pgTable("live_quizzes", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  created_by: text("created_by").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const liveQuestions = pgTable("live_questions", {
  id: text("id").primaryKey(),
  quiz_id: text("quiz_id")
    .notNull()
    .references(() => liveQuizzes.id, { onDelete: "cascade" }),
  question_order: integer("question_order").notNull(),
  question_text: text("question_text").notNull(),
  image_url: text("image_url"),
  type: liveQuestionTypeEnum("type").notNull().default("mcq"),
  time_limit_sec: integer("time_limit_sec").notNull().default(30),
  options: jsonb("options").notNull(), // Array of { id: string, text: string, is_correct: boolean }
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const liveSessions = pgTable("live_sessions", {
  id: text("id").primaryKey(),
  room_code: varchar("room_code", { length: 10 }).notNull().unique(),
  quiz_id: text("quiz_id")
    .notNull()
    .references(() => liveQuizzes.id, { onDelete: "cascade" }),
  host_id: text("host_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  session_name: varchar("session_name", { length: 255 }).notNull(),
  institute_name: varchar("institute_name", { length: 255 }).notNull(),
  status: liveSessionStatusEnum("status").notNull().default("lobby"),
  total_participants: integer("total_participants").notNull().default(0),
  started_at: timestamp("started_at", { withTimezone: true }),
  ended_at: timestamp("ended_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const liveParticipants = pgTable("live_participants", {
  id: text("id").primaryKey(),
  session_id: text("session_id")
    .notNull()
    .references(() => liveSessions.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  total_score: integer("total_score").notNull().default(0),
  correct_count: integer("correct_count").notNull().default(0),
  final_rank: integer("final_rank"),
  joined_at: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type Course = InferSelectModel<typeof courses>;
export type Category = InferSelectModel<typeof categories>;
export type Module = InferSelectModel<typeof modules>;
export type ModuleItem = InferSelectModel<typeof moduleItems>;
export type Assignment = InferSelectModel<typeof assignments>;
export type AssignmentSubmission = InferSelectModel<typeof assignmentSubmissions>;
export type Test = InferSelectModel<typeof tests>;
export type TestAttempt = InferSelectModel<typeof testAttempts>;
export type Cart = InferSelectModel<typeof carts>;
export type Coupon = InferSelectModel<typeof coupons>;
export type Enrollment = InferSelectModel<typeof enrollments>;
export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type Payment = InferSelectModel<typeof payments>;
export type Certificate = InferSelectModel<typeof certificates>;
export type Review = InferSelectModel<typeof reviews>;
export type LiveQuiz = InferSelectModel<typeof liveQuizzes>;
export type LiveQuestion = InferSelectModel<typeof liveQuestions>;
export type LiveSession = InferSelectModel<typeof liveSessions>;
export type LiveParticipant = InferSelectModel<typeof liveParticipants>;

export type NewUser = InferInsertModel<typeof users>;
export type NewCourse = InferInsertModel<typeof courses>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewModule = InferInsertModel<typeof modules>;
export type NewModuleItem = InferInsertModel<typeof moduleItems>;
export type NewAssignment = InferInsertModel<typeof assignments>;
export type NewAssignmentSubmission = InferInsertModel<typeof assignmentSubmissions>;
export type NewTest = InferInsertModel<typeof tests>;
export type NewTestAttempt = InferInsertModel<typeof testAttempts>;
export type NewCart = InferInsertModel<typeof carts>;
export type NewCoupon = InferInsertModel<typeof coupons>;
export type NewEnrollment = InferInsertModel<typeof enrollments>;
export type NewOrder = InferInsertModel<typeof orders>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;
export type NewPayment = InferInsertModel<typeof payments>;
export type NewCertificate = InferInsertModel<typeof certificates>;
export type NewReview = InferInsertModel<typeof reviews>;
export type NewLiveQuiz = InferInsertModel<typeof liveQuizzes>;
export type NewLiveQuestion = InferInsertModel<typeof liveQuestions>;
export type NewLiveSession = InferInsertModel<typeof liveSessions>;
export type NewLiveParticipant = InferInsertModel<typeof liveParticipants>;

