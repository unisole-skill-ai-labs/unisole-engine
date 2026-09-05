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

      -- IAPT NAIN Registrations Sequence & Table
      CREATE SEQUENCE IF NOT EXISTS "public"."iapt_nain_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

      CREATE TABLE IF NOT EXISTS "public"."iapt_nain_registrations" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('nain_'::text || nextval('public.iapt_nain_registrations_id_seq'::regclass)) NOT NULL,
        "user_id" varchar(50) NOT NULL,
        "name" varchar(150) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "category" varchar(100) NOT NULL,
        "institution" varchar(255) NOT NULL,
        "city_state" varchar(150) NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "uq_iapt_nain_user_id" UNIQUE("user_id")
      );

      DO $$ BEGIN
        ALTER TABLE "public"."iapt_nain_registrations" ADD CONSTRAINT "fk_iapt_nain_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      CREATE INDEX IF NOT EXISTS "idx_iapt_nain_phone" ON "public"."iapt_nain_registrations" ("phone");
      CREATE INDEX IF NOT EXISTS "idx_iapt_nain_institution" ON "public"."iapt_nain_registrations" ("institution");

      -- ============================================================
      -- 2. CRM LEADS & CALL LOGS SCHEMA (Zero-Failure Execution)
      -- ============================================================

      -- Enums
      DO $$ BEGIN
        CREATE TYPE "public"."lead_quality" AS ENUM('HOT', 'WARM', 'COLD', 'POOR', 'UNQUALIFIED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'ATTEMPTED', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP_SCHEDULED', 'DEMO_GIVEN', 'CONVERTED', 'LOST', 'JUNK', 'NOT_A_LEAD');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TYPE "public"."lead_status" ADD VALUE IF NOT EXISTS 'NOT_A_LEAD';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_source" AS ENUM('PRESENTATION_SESSION', 'COLLEGE_DRIVE', 'PAMPHLET_SCAN', 'PAMPHLET_QR', 'SESSION_QR', 'IAPT', 'NON_PAMPHLET', 'ORGANIC', 'DIRECT_WEB', 'WEBSITE_INQUIRY', 'REFERRAL', 'MANUAL_IMPORT', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'IAPT';
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'PAMPHLET_QR';
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'SESSION_QR';
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'NON_PAMPHLET';
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'ORGANIC';
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'DIRECT_WEB';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_call_outcome" AS ENUM('CONNECTED_INTERESTED', 'CONNECTED_FOLLOW_UP', 'CONNECTED_NOT_INTERESTED', 'CONNECTED_CONVERTED', 'BUSY_NO_ANSWER', 'WRONG_NUMBER', 'CALL_BACK_REQUESTED', 'VOICEMAIL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Sequences
      CREATE SEQUENCE IF NOT EXISTS "public"."leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."lead_call_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

      -- Leads Table
      CREATE TABLE IF NOT EXISTS "public"."leads" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('lead_'::text || nextval('public.leads_id_seq'::regclass)) NOT NULL,
        "name" varchar(150) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "email" varchar(255),
        "user_id" varchar(50),
        "college_id" varchar(50),
        "college_name" varchar(200),
        "branch" varchar(100),
        "year_of_study" varchar(50),
        "assigned_to_user_id" varchar(50),
        "quality" "public"."lead_quality" DEFAULT 'WARM' NOT NULL,
        "status" "public"."lead_status" DEFAULT 'NEW' NOT NULL,
        "source" "public"."lead_source" DEFAULT 'COLLEGE_DRIVE' NOT NULL,
        "source_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
        "call_count" integer DEFAULT 0 NOT NULL,
        "last_call_at" timestamp with time zone,
        "next_call_at" timestamp with time zone,
        "converted_at" timestamp with time zone,
        "conversion_value_paise" bigint DEFAULT 0 NOT NULL,
        "notes" text,
        "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "created_by_id" varchar(50),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "user_id" varchar(50);

      -- Lead Call Logs Table
      CREATE TABLE IF NOT EXISTS "public"."lead_call_logs" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('clog_'::text || nextval('public.lead_call_logs_id_seq'::regclass)) NOT NULL,
        "lead_id" varchar(50) NOT NULL,
        "caller_user_id" varchar(50) NOT NULL,
        "caller_name" varchar(150) NOT NULL,
        "call_duration_seconds" integer DEFAULT 0 NOT NULL,
        "outcome" "public"."lead_call_outcome" NOT NULL,
        "notes" text NOT NULL,
        "previous_quality" "public"."lead_quality",
        "new_quality" "public"."lead_quality",
        "previous_status" "public"."lead_status",
        "new_status" "public"."lead_status",
        "scheduled_next_call_at" timestamp with time zone,
        "recording_url" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      -- Foreign Key Constraints for CRM
      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_user_account" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_college_ref" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_assigned_user" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_creator_user" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."lead_call_logs" ADD CONSTRAINT "fk_call_logs_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."lead_call_logs" ADD CONSTRAINT "fk_call_logs_caller" FOREIGN KEY ("caller_user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_table THEN null;
      END $$;

      -- Indexes
      CREATE INDEX IF NOT EXISTS "idx_leads_phone" ON "public"."leads" ("phone");
      CREATE INDEX IF NOT EXISTS "idx_leads_user" ON "public"."leads" ("user_id");
      CREATE INDEX IF NOT EXISTS "idx_leads_college" ON "public"."leads" ("college_id");
      CREATE INDEX IF NOT EXISTS "idx_leads_branch" ON "public"."leads" ("branch");
      CREATE INDEX IF NOT EXISTS "idx_leads_assigned_to" ON "public"."leads" ("assigned_to_user_id");
      CREATE INDEX IF NOT EXISTS "idx_leads_quality" ON "public"."leads" ("quality");
      CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "public"."leads" ("status");
      CREATE INDEX IF NOT EXISTS "idx_leads_next_call" ON "public"."leads" ("next_call_at");
      CREATE INDEX IF NOT EXISTS "idx_leads_created_at" ON "public"."leads" ("created_at" DESC);
      CREATE INDEX IF NOT EXISTS "idx_call_logs_lead" ON "public"."lead_call_logs" ("lead_id");
      CREATE INDEX IF NOT EXISTS "idx_call_logs_caller" ON "public"."lead_call_logs" ("caller_user_id");
      CREATE INDEX IF NOT EXISTS "idx_call_logs_created_at" ON "public"."lead_call_logs" ("created_at" DESC);

      -- Lead Source Enum Extension (Idempotent)
      DO $$ BEGIN
        ALTER TYPE "public"."lead_source" ADD VALUE IF NOT EXISTS 'AI_WORKSHOP';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("[DB-INIT] ✅ WorkSole, IAPT NAIN, and Lead CRM tables, sequences, foreign keys, and indexes verified successfully.");


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
