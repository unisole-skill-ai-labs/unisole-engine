CREATE TYPE "public"."task_activity_type" AS ENUM('COMMENT', 'STATUS_CHANGE', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'MEMBER' BEFORE 'ADMIN';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'SUPER_ADMIN';--> statement-breakpoint
CREATE SEQUENCE "public"."branches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."daily_eod_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."task_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."task_subtasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."task_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."team_departments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "branches" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('brn_'::text || nextval('branches_id_seq'::regclass)) NOT NULL,
	"college_id" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_eod_logs" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('eod_'::text || nextval('daily_eod_logs_id_seq'::regclass)) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"log_date" varchar(10) NOT NULL,
	"completed_summary" text NOT NULL,
	"plan_tomorrow" text NOT NULL,
	"blockers" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('tcomm_'::text || nextval('task_comments_id_seq'::regclass)) NOT NULL,
	"task_id" varchar(50) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"activity_type" "task_activity_type" DEFAULT 'COMMENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_subtasks" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('stask_'::text || nextval('task_subtasks_id_seq'::regclass)) NOT NULL,
	"task_id" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_templates" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('tmpl_'::text || nextval('task_templates_id_seq'::regclass)) NOT NULL,
	"title" varchar(255) NOT NULL,
	"department_id" varchar(50),
	"description" text,
	"default_checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guidelines_url" text,
	"estimated_hours" integer DEFAULT 2,
	"created_by_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('task_'::text || nextval('tasks_id_seq'::regclass)) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
	"assignee_id" varchar(50),
	"reporter_id" varchar(50),
	"department_id" varchar(50),
	"template_id" varchar(50),
	"due_date" timestamp with time zone,
	"estimated_hours" integer,
	"submission_proof_url" text,
	"submission_notes" text,
	"blocked_reason" text,
	"related_entity_type" varchar(50),
	"related_entity_id" varchar(50),
	"related_entity_name" varchar(255),
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_departments" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('dept_'::text || nextval('team_departments_id_seq'::regclass)) NOT NULL,
	"name" varchar(150) NOT NULL,
	"code" varchar(50) NOT NULL,
	"color" varchar(30) DEFAULT '#6366f1' NOT NULL,
	"description" text,
	"lead_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "pathway_colleges" DROP CONSTRAINT "fk_pathway_colleges_college";
--> statement-breakpoint
ALTER TABLE "presentation_leads" DROP CONSTRAINT "fk_leads_college";
--> statement-breakpoint
ALTER TABLE "presentation_sessions" DROP CONSTRAINT "fk_sessions_college";
--> statement-breakpoint
ALTER TABLE "otp_verifications" ALTER COLUMN "otp_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation_leads" ALTER COLUMN "college_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation_sessions" ALTER COLUMN "college_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "otp_verifications" ADD COLUMN "otp" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "presentations" ADD COLUMN "college_id" varchar(50);--> statement-breakpoint
ALTER TABLE "presentations" ADD COLUMN "college_name" varchar(200);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "college_id" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "college_name" varchar(200);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "branch" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department_id" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "designation" varchar(150);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_source" varchar(50) DEFAULT 'NON_PAMPHLET' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_session_code" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_college_id" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_college_name" varchar(200);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "fk_branches_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_eod_logs" ADD CONSTRAINT "fk_eod_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "fk_comments_task" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "fk_comments_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_subtasks" ADD CONSTRAINT "fk_subtasks_task" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_templates" ADD CONSTRAINT "fk_template_dept" FOREIGN KEY ("department_id") REFERENCES "public"."team_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_templates" ADD CONSTRAINT "fk_template_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_reporter" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_dept" FOREIGN KEY ("department_id") REFERENCES "public"."team_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_template" FOREIGN KEY ("template_id") REFERENCES "public"."task_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_departments" ADD CONSTRAINT "fk_dept_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_branches_college" ON "branches" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_branches_is_active" ON "branches" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_eod_user" ON "daily_eod_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_eod_date" ON "daily_eod_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX "idx_comments_task" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_subtasks_task" ON "task_subtasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assignee" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_department" ON "tasks" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_due_date" ON "tasks" USING btree ("due_date");--> statement-breakpoint
ALTER TABLE "pathway_colleges" ADD CONSTRAINT "fk_pathway_colleges_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_leads" ADD CONSTRAINT "fk_leads_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation_sessions" ADD CONSTRAINT "fk_sessions_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "fk_presentations_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_presentations_college" ON "presentations" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_users_signup_source" ON "users" USING btree ("signup_source");--> statement-breakpoint
CREATE INDEX "idx_users_signup_session" ON "users" USING btree ("signup_session_code");