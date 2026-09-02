import { pool, db } from "../db";
import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function initializeDatabase() {
  try {
    console.log("[DB-INIT] Checking database connectivity and schema integrity...");
    const connCheck = await pool.query("SELECT current_database(), current_user, version()");
    console.log("[DB-INIT] Connected to database:", connCheck.rows[0]?.current_database);

    // 1. Direct Idempotent DDL Execution for WorkSole & Tasks (Guarantees zero-failure startup)
    await pool.query(`
      -- Enums
      DO $$ BEGIN
        CREATE TYPE "public"."project_status" AS ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."sub_project_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Sequences
      CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."sub_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

      -- Projects Table
      CREATE TABLE IF NOT EXISTS "public"."projects" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('proj_'::text || nextval('public.projects_id_seq'::regclass)) NOT NULL,
        "code" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "department_id" varchar(50),
        "lead_id" varchar(50),
        "created_by_id" varchar(50),
        "status" "public"."project_status" DEFAULT 'ACTIVE' NOT NULL,
        "priority" "public"."task_priority" DEFAULT 'MEDIUM' NOT NULL,
        "start_date" timestamp with time zone,
        "target_end_date" timestamp with time zone,
        "completed_at" timestamp with time zone,
        "color" varchar(30) DEFAULT '#6366f1' NOT NULL,
        "icon" varchar(50) DEFAULT 'folder' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "uq_projects_code" UNIQUE("code")
      );

      -- Sub Projects Table
      CREATE TABLE IF NOT EXISTS "public"."sub_projects" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('sproj_'::text || nextval('public.sub_projects_id_seq'::regclass)) NOT NULL,
        "project_id" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "lead_id" varchar(50),
        "status" "public"."sub_project_status" DEFAULT 'TODO' NOT NULL,
        "order_index" integer DEFAULT 0 NOT NULL,
        "start_date" timestamp with time zone,
        "target_end_date" timestamp with time zone,
        "completed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      -- Alter Tasks Table
      ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "project_id" varchar(50);
      ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "sub_project_id" varchar(50);

      -- Foreign Key Constraints
      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_department" FOREIGN KEY ("department_id") REFERENCES "public"."team_departments"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."sub_projects" ADD CONSTRAINT "fk_sub_projects_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."sub_projects" ADD CONSTRAINT "fk_sub_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_tasks_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_tasks_sub_project" FOREIGN KEY ("sub_project_id") REFERENCES "public"."sub_projects"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Indexes
      CREATE INDEX IF NOT EXISTS "idx_projects_dept" ON "public"."projects" ("department_id");
      CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "public"."projects" ("status");
      CREATE INDEX IF NOT EXISTS "idx_projects_lead" ON "public"."projects" ("lead_id");
      CREATE INDEX IF NOT EXISTS "idx_sub_projects_project" ON "public"."sub_projects" ("project_id");
      CREATE INDEX IF NOT EXISTS "idx_sub_projects_status" ON "public"."sub_projects" ("status");
      CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "public"."tasks" ("project_id");
      CREATE INDEX IF NOT EXISTS "idx_tasks_sub_project" ON "public"."tasks" ("sub_project_id");
    `);

    console.log("[DB-INIT] ✅ WorkSole tables, sequences, foreign keys, and indexes verified successfully.");

    // 2. Also run official Drizzle migrator if folder exists
    try {
      const migrationsFolder = path.resolve(process.cwd(), "drizzle");
      await migrate(db, { migrationsFolder });
      console.log("[DB-INIT] ✅ Drizzle migration journal synchronized.");
    } catch (migErr) {
      console.log("[DB-INIT] Note: Drizzle migration runner notice:", migErr);
    }
  } catch (err) {
    console.error("[DB-INIT] ❌ Database initialization error:", err);
  }
}
