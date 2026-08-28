CREATE TYPE "public"."content_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."otp_channel" AS ENUM('SMS', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."otp_status" AS ENUM('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."pathway_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('DRAFT', 'LIVE', 'PAUSED', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'ADMIN');--> statement-breakpoint
CREATE SEQUENCE "public"."categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."colleges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."enrollments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."lessons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."modules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."otp_verifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."pathways_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."presentation_leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."presentation_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."presentations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('cat_'::text || nextval('categories_id_seq'::regclass)) NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_categories_name" UNIQUE("name"),
	CONSTRAINT "uq_categories_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('clg_'::text || nextval('colleges_id_seq'::regclass)) NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"short_name" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_colleges_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"course_id" varchar(50) NOT NULL,
	"module_id" varchar(50) NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_modules_pkey" PRIMARY KEY("course_id","module_id"),
	CONSTRAINT "uq_course_modules_position" UNIQUE("course_id","position"),
	CONSTRAINT "chk_course_modules_position" CHECK ("position" > 0)
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('crs_'::text || nextval('courses_id_seq'::regclass)) NOT NULL,
	"title" varchar(250) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"short_description" varchar(500),
	"description" text,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_courses_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('enr_'::text || nextval('enrollments_id_seq'::regclass)) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"pathway_id" varchar(50) NOT NULL,
	"status" "enrollment_status" DEFAULT 'PENDING' NOT NULL,
	"enrolled_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('les_'::text || nextval('lessons_id_seq'::regclass)) NOT NULL,
	"title" varchar(250) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"description" text,
	"content" text,
	"video_url" text,
	"duration_minutes" integer,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lessons_slug" UNIQUE("slug"),
	CONSTRAINT "chk_lessons_duration" CHECK ((duration_minutes IS NULL) OR (duration_minutes >= 0))
);
--> statement-breakpoint
CREATE TABLE "module_lessons" (
	"module_id" varchar(50) NOT NULL,
	"lesson_id" varchar(50) NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "module_lessons_pkey" PRIMARY KEY("module_id","lesson_id"),
	CONSTRAINT "uq_module_lessons_position" UNIQUE("module_id","position"),
	CONSTRAINT "chk_module_lessons_position" CHECK ("position" > 0)
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('mod_'::text || nextval('modules_id_seq'::regclass)) NOT NULL,
	"title" varchar(250) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"description" text,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_modules_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('otp_'::text || nextval('otp_verifications_id_seq'::regclass)) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"otp_hash" varchar(255) NOT NULL,
	"channel" "otp_channel" NOT NULL,
	"status" "otp_status" DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_otp_attempts" CHECK (attempts >= 0),
	CONSTRAINT "chk_otp_max_attempts" CHECK (max_attempts > 0)
);
--> statement-breakpoint
CREATE TABLE "pathway_categories" (
	"pathway_id" varchar(50) NOT NULL,
	"category_id" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pathway_categories_pkey" PRIMARY KEY("pathway_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "pathway_colleges" (
	"pathway_id" varchar(50) NOT NULL,
	"college_id" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pathway_colleges_pkey" PRIMARY KEY("pathway_id","college_id")
);
--> statement-breakpoint
CREATE TABLE "pathway_courses" (
	"pathway_id" varchar(50) NOT NULL,
	"course_id" varchar(50) NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pathway_courses_pkey" PRIMARY KEY("pathway_id","course_id"),
	CONSTRAINT "uq_pathway_courses_position" UNIQUE("pathway_id","position"),
	CONSTRAINT "chk_pathway_courses_position" CHECK ("position" > 0)
);
--> statement-breakpoint
CREATE TABLE "pathways" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('pwy_'::text || nextval('pathways_id_seq'::regclass)) NOT NULL,
	"title" varchar(250) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"short_description" varchar(500),
	"description" text,
	"price_paise" bigint DEFAULT 0 NOT NULL,
	"status" "pathway_status" DEFAULT 'DRAFT' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_pathways_slug" UNIQUE("slug"),
	CONSTRAINT "chk_pathways_price" CHECK (price_paise >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('pay_'::text || nextval('payments_id_seq'::regclass)) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"enrollment_id" varchar(50),
	"pathway_id" varchar(50) NOT NULL,
	"amount_paise" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'CREATED' NOT NULL,
	"provider" varchar(50) DEFAULT 'RAZORPAY' NOT NULL,
	"provider_order_id" varchar(150),
	"provider_payment_id" varchar(150),
	"provider_signature" varchar(500),
	"failure_reason" text,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_payments_amount" CHECK (amount_paise >= 0),
	CONSTRAINT "chk_payments_currency" CHECK ((currency)::text = 'INR'::text)
);
--> statement-breakpoint
CREATE TABLE "presentation_leads" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('lead_'::text || nextval('presentation_leads_id_seq'::regclass)) NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"college_id" varchar(50),
	"user_id" varchar(50),
	"name" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"branch" varchar(100),
	"year_of_study" varchar(50),
	"total_score" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"streak" integer DEFAULT 0 NOT NULL,
	"responses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presentation_sessions" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('sess_'::text || nextval('presentation_sessions_id_seq'::regclass)) NOT NULL,
	"presentation_id" varchar(50) NOT NULL,
	"college_id" varchar(50),
	"college_name" varchar(200),
	"session_code" varchar(20) NOT NULL,
	"status" "session_status" DEFAULT 'DRAFT' NOT NULL,
	"current_slide_index" integer DEFAULT 0 NOT NULL,
	"is_quiz_active" boolean DEFAULT false NOT NULL,
	"is_answer_revealed" boolean DEFAULT false NOT NULL,
	"is_leaderboard_active" boolean DEFAULT false NOT NULL,
	"quiz_started_at" timestamp with time zone,
	"quiz_time_limit" integer DEFAULT 30 NOT NULL,
	"active_attendees_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_presentation_sessions_code" UNIQUE("session_code")
);
--> statement-breakpoint
CREATE TABLE "presentations" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('pres_'::text || nextval('presentations_id_seq'::regclass)) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"theme" varchar(50) DEFAULT 'dark' NOT NULL,
	"slides" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('usr_'::text || nextval('users_id_seq'::regclass)) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"name" varchar(150),
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_users_phone" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "fk_course_modules_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "fk_course_modules_module" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "fk_enrollments_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "fk_enrollments_pathway" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_lessons" ADD CONSTRAINT "fk_module_lessons_module" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_lessons" ADD CONSTRAINT "fk_module_lessons_lesson" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_categories" ADD CONSTRAINT "fk_pathway_categories_pathway" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_categories" ADD CONSTRAINT "fk_pathway_categories_category" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_colleges" ADD CONSTRAINT "fk_pathway_colleges_pathway" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_colleges" ADD CONSTRAINT "fk_pathway_colleges_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_courses" ADD CONSTRAINT "fk_pathway_courses_pathway" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_courses" ADD CONSTRAINT "fk_pathway_courses_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_enrollment" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_pathway" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_leads" ADD CONSTRAINT "fk_leads_session" FOREIGN KEY ("session_id") REFERENCES "public"."presentation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_leads" ADD CONSTRAINT "fk_leads_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_leads" ADD CONSTRAINT "fk_leads_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_sessions" ADD CONSTRAINT "fk_sessions_presentation" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_sessions" ADD CONSTRAINT "fk_sessions_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "fk_presentations_created_by" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_is_active" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_colleges_is_active" ON "colleges" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_course_modules_module" ON "course_modules" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_courses_is_active" ON "courses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_courses_status" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_pathway" ON "enrollments" USING btree ("pathway_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_pathway_status" ON "enrollments" USING btree ("pathway_id","status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_user" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_enrollments_user_status" ON "enrollments" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_active_user_pathway_enrollment" ON "enrollments" USING btree ("user_id","pathway_id") WHERE (status = 'ACTIVE'::enrollment_status);--> statement-breakpoint
CREATE INDEX "idx_lessons_is_active" ON "lessons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_lessons_status" ON "lessons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_module_lessons_lesson" ON "module_lessons" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_modules_is_active" ON "modules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_modules_status" ON "modules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_otp_expires_at" ON "otp_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_otp_phone" ON "otp_verifications" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_otp_status" ON "otp_verifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pathway_categories_category" ON "pathway_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_pathway_colleges_college" ON "pathway_colleges" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_pathway_courses_course" ON "pathway_courses" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_pathways_is_active" ON "pathways" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_pathways_status" ON "pathways" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_enrollment" ON "payments" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "idx_payments_pathway" ON "payments" USING btree ("pathway_id");--> statement-breakpoint
CREATE INDEX "idx_payments_provider_order" ON "payments" USING btree ("provider_order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_provider_payment" ON "payments" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_user" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payments_provider_order" ON "payments" USING btree ("provider_order_id") WHERE (provider_order_id IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payments_provider_payment" ON "payments" USING btree ("provider_payment_id") WHERE (provider_payment_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_presentation_leads_session" ON "presentation_leads" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_presentation_leads_phone" ON "presentation_leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_presentation_leads_score" ON "presentation_leads" USING btree ("total_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_presentation_sessions_code" ON "presentation_sessions" USING btree ("session_code");--> statement-breakpoint
CREATE INDEX "idx_presentation_sessions_status" ON "presentation_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_presentations_is_active" ON "presentations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");