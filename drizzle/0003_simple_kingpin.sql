DO $$ BEGIN
 CREATE TYPE "public"."project_status" AS ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sub_project_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."sub_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('proj_'::text || nextval('projects_id_seq'::regclass)) NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"department_id" varchar(50),
	"lead_id" varchar(50),
	"created_by_id" varchar(50),
	"status" "project_status" DEFAULT 'ACTIVE' NOT NULL,
	"priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
	"start_date" timestamp with time zone,
	"target_end_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"color" varchar(30) DEFAULT '#6366f1' NOT NULL,
	"icon" varchar(50) DEFAULT 'folder' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_projects" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('sproj_'::text || nextval('sub_projects_id_seq'::regclass)) NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"lead_id" varchar(50),
	"status" "sub_project_status" DEFAULT 'TODO' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone,
	"target_end_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "project_id" varchar(50);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "sub_project_id" varchar(50);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_dept" FOREIGN KEY ("department_id") REFERENCES "public"."team_departments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_projects" ADD CONSTRAINT "fk_sub_projects_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_projects" ADD CONSTRAINT "fk_sub_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_dept" ON "projects" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_lead" ON "projects" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_projects_project" ON "sub_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_projects_status" ON "sub_projects" USING btree ("status");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_sub_project" FOREIGN KEY ("sub_project_id") REFERENCES "public"."sub_projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_sub_project" ON "tasks" USING btree ("sub_project_id");