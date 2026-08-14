import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const authProviderEnum = pgEnum("auth_provider", ["local", "google", "supabase"]);
export const itemTypeEnum = pgEnum("item_type", ["video", "pdf", "article", "quiz", "assignment"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "graded"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 15 }).unique(),
  password_hash: varchar("password_hash", { length: 255 }),
  role: userRoleEnum("role").notNull().default("student"),
  auth_provider: authProviderEnum("auth_provider").notNull().default("local"),
  is_verified: boolean("is_verified").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  category_id: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  rating_avg: decimal("rating_avg", { precision: 3, scale: 2 }).notNull().default("0"),
  total_enrollments: integer("total_enrollments").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  order_index: smallint("order_index").notNull().default(0),
});

export const courseModules = pgTable("course_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  course_id: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  module_id: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  order_index: smallint("order_index").notNull().default(0),
});

export const moduleItems = pgTable("module_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  type: itemTypeEnum("type").notNull(),
  content_url: varchar("content_url", { length: 500 }),
  order_index: smallint("order_index").notNull().default(0),
});

export const moduleLessons = pgTable("module_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  module_id: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  module_item_id: uuid("module_item_id")
    .notNull()
    .references(() => moduleItems.id, { onDelete: "cascade" }),
  order_index: smallint("order_index").notNull().default(0),
});

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  lesson_id: uuid("lesson_id").references(() => moduleItems.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  max_score: smallint("max_score").notNull().default(100),
  due_date: timestamp("due_date", { withTimezone: true }),
  allowed_attempts: smallint("allowed_attempts").notNull().default(1),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignment_id: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  file_url: varchar("file_url", { length: 500 }),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  status: submissionStatusEnum("status").notNull().default("pending"),
  score: decimal("score", { precision: 5, scale: 2 }),
});

export const quizzes = pgTable("quiz", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduel_item_id: uuid("moduel_item_id").references(() => moduleItems.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  duration_min: smallint("duration_min").notNull().default(0),
  total_marks: smallint("total_marks").notNull().default(0),
  passing_marks: smallint("passing_marks").notNull().default(0),
  max_attempts: smallint("max_attempts").notNull().default(1),
});

export type User = InferSelectModel<typeof users>;
export type Course = InferSelectModel<typeof courses>;
export type Category = InferSelectModel<typeof categories>;
export type Module = InferSelectModel<typeof modules>;
export type CourseModule = InferSelectModel<typeof courseModules>;
export type ModuleItem = InferSelectModel<typeof moduleItems>;
export type ModuleLesson = InferSelectModel<typeof moduleLessons>;
export type Assignment = InferSelectModel<typeof assignments>;
export type AssignmentSubmission = InferSelectModel<typeof assignmentSubmissions>;
export type Quiz = InferSelectModel<typeof quizzes>;

export type NewUser = InferInsertModel<typeof users>;
export type NewCourse = InferInsertModel<typeof courses>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewModule = InferInsertModel<typeof modules>;
export type NewCourseModule = InferInsertModel<typeof courseModules>;
export type NewModuleItem = InferInsertModel<typeof moduleItems>;
export type NewModuleLesson = InferInsertModel<typeof moduleLessons>;
export type NewAssignment = InferInsertModel<typeof assignments>;
export type NewAssignmentSubmission = InferInsertModel<typeof assignmentSubmissions>;
export type NewQuiz = InferInsertModel<typeof quizzes>;
