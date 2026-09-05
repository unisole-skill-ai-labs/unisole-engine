import { pool, db } from "../db";
import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function addEnumValueSafely(typeName: string, value: string) {
  try {
    await pool.query(`ALTER TYPE "public"."${typeName}" ADD VALUE IF NOT EXISTS '${value}'`);
  } catch (err: any) {
    // Ignore if already exists or undefined
  }
}

export async function initializeDatabase() {
  try {
    console.log("[DB-INIT] Checking database connectivity and schema integrity...");
    const connCheck = await pool.query("SELECT current_database(), current_user, version()");
    console.log("[DB-INIT] Connected to database:", connCheck.rows[0]?.current_database);

    // 1. Ensure Enums Exist (Base Creation)
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'MEMBER', 'ADMIN', 'SUPER_ADMIN');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."pathway_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."content_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."task_activity_type" AS ENUM('COMMENT', 'STATUS_CHANGE', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'BLOCKED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."enrollment_status" AS ENUM('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."enrollment_source" AS ENUM('PURCHASE', 'ADMIN_MANUAL', 'CAMPUS_SPONSORED', 'FREE', 'INVITE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."payment_status" AS ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."item_type" AS ENUM('PATHWAY', 'COURSE', 'WORKSHOP', 'PROGRAM', 'EVENT', 'BUNDLE', 'MERCHANDISE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FLAT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."otp_channel" AS ENUM('SMS', 'WHATSAPP');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."otp_status" AS ENUM('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."session_status" AS ENUM('DRAFT', 'LIVE', 'PAUSED', 'ENDED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."project_status" AS ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."sub_project_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_quality" AS ENUM('HOT', 'WARM', 'COLD', 'POOR', 'UNQUALIFIED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'ATTEMPTED', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP_SCHEDULED', 'DEMO_GIVEN', 'CONVERTED', 'LOST', 'JUNK', 'NOT_A_LEAD');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_source" AS ENUM('PRESENTATION_SESSION', 'COLLEGE_DRIVE', 'PAMPHLET_SCAN', 'PAMPHLET_QR', 'SESSION_QR', 'IAPT', 'AI_WORKSHOP', 'PROFESSOR_NETWORK', 'NON_PAMPHLET', 'ORGANIC', 'DIRECT_WEB', 'WEBSITE_INQUIRY', 'REFERRAL', 'MANUAL_IMPORT', 'OTHER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_call_outcome" AS ENUM('CONNECTED_INTERESTED', 'CONNECTED_FOLLOW_UP', 'CONNECTED_NOT_INTERESTED', 'CONNECTED_CONVERTED', 'BUSY_NO_ANSWER', 'WRONG_NUMBER', 'CALL_BACK_REQUESTED', 'VOICEMAIL');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Safe standalone enum additions (Cannot be in DO blocks in PostgreSQL)
    await addEnumValueSafely("item_type", "PATHWAY");
    await addEnumValueSafely("item_type", "COURSE");
    await addEnumValueSafely("item_type", "WORKSHOP");
    await addEnumValueSafely("item_type", "PROGRAM");
    await addEnumValueSafely("item_type", "EVENT");
    await addEnumValueSafely("item_type", "BUNDLE");
    await addEnumValueSafely("item_type", "MERCHANDISE");

    await addEnumValueSafely("enrollment_source", "PURCHASE");
    await addEnumValueSafely("enrollment_source", "ADMIN_MANUAL");
    await addEnumValueSafely("enrollment_source", "CAMPUS_SPONSORED");
    await addEnumValueSafely("enrollment_source", "FREE");
    await addEnumValueSafely("enrollment_source", "INVITE");
    await addEnumValueSafely("enrollment_source", "PAYMENT");
    await addEnumValueSafely("enrollment_source", "SCHOLARSHIP");
    await addEnumValueSafely("enrollment_source", "PROMOTION");
    await addEnumValueSafely("enrollment_source", "BATCH_IMPORT");

    await addEnumValueSafely("lead_source", "IAPT");
    await addEnumValueSafely("lead_source", "AI_WORKSHOP");
    await addEnumValueSafely("lead_source", "PROFESSOR_NETWORK");
    await addEnumValueSafely("lead_source", "PAMPHLET_QR");
    await addEnumValueSafely("lead_source", "SESSION_QR");
    await addEnumValueSafely("lead_source", "NON_PAMPHLET");
    await addEnumValueSafely("lead_source", "ORGANIC");
    await addEnumValueSafely("lead_source", "DIRECT_WEB");

    await addEnumValueSafely("lead_status", "NOT_A_LEAD");

    // 3. Sequences
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."sub_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."iapt_nain_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."lead_call_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."offerings_pricing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "public"."coupons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
    `);

    // 4. Projects & Tasks DDL
    await pool.query(`
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

      ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "project_id" varchar(50);
      ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "sub_project_id" varchar(50);

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_department" FOREIGN KEY ("department_id") REFERENCES "public"."team_departments"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."sub_projects" ADD CONSTRAINT "fk_sub_projects_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."sub_projects" ADD CONSTRAINT "fk_sub_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_tasks_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_tasks_sub_project" FOREIGN KEY ("sub_project_id") REFERENCES "public"."sub_projects"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE INDEX IF NOT EXISTS "idx_projects_dept" ON "public"."projects" ("department_id");
      CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "public"."projects" ("status");
      CREATE INDEX IF NOT EXISTS "idx_projects_lead" ON "public"."projects" ("lead_id");
      CREATE INDEX IF NOT EXISTS "idx_sub_projects_project" ON "public"."sub_projects" ("project_id");
      CREATE INDEX IF NOT EXISTS "idx_sub_projects_status" ON "public"."sub_projects" ("status");
      CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "public"."tasks" ("project_id");
      CREATE INDEX IF NOT EXISTS "idx_tasks_sub_project" ON "public"."tasks" ("sub_project_id");
    `);

    // 5. IAPT NAIN
    await pool.query(`
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
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      CREATE INDEX IF NOT EXISTS "idx_iapt_nain_phone" ON "public"."iapt_nain_registrations" ("phone");
      CREATE INDEX IF NOT EXISTS "idx_iapt_nain_institution" ON "public"."iapt_nain_registrations" ("institution");
    `);

    // 6. CRM Leads & Call Logs
    await pool.query(`
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

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_user_account" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_college_ref" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_assigned_user" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_creator_user" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."lead_call_logs" ADD CONSTRAINT "fk_call_logs_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."lead_call_logs" ADD CONSTRAINT "fk_call_logs_caller" FOREIGN KEY ("caller_user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

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
    `);

    // 7. Centralized Commercial Orders, Pricing Catalog & Coupons
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "public"."orders" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('ord_'::text || nextval('public.orders_id_seq'::regclass)) NOT NULL,
        "order_number" varchar(60),
        "razorpay_order_id" varchar(150),
        "user_id" varchar(50),
        "customer_name" varchar(150),
        "customer_phone" varchar(20),
        "customer_email" varchar(255),
        "subtotal_paise" bigint DEFAULT 0 NOT NULL,
        "discount_paise" bigint DEFAULT 0 NOT NULL,
        "coupon_code" varchar(50),
        "total_paise" bigint DEFAULT 0 NOT NULL,
        "currency" varchar(3) DEFAULT 'INR' NOT NULL,
        "status" "public"."order_status" DEFAULT 'PENDING' NOT NULL,
        "notes" text,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "paid_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "public"."order_items" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('ord_item_'::text || nextval('public.order_items_id_seq'::regclass)) NOT NULL,
        "order_id" varchar(50) NOT NULL,
        "item_type" "public"."item_type" NOT NULL,
        "item_id" varchar(100) NOT NULL,
        "item_title" varchar(255) NOT NULL,
        "unit_price_paise" bigint DEFAULT 0 NOT NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "total_price_paise" bigint DEFAULT 0 NOT NULL,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "public"."offerings_pricing" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('prc_'::text || nextval('public.offerings_pricing_id_seq'::regclass)) NOT NULL,
        "item_type" "public"."item_type" NOT NULL,
        "item_id" varchar(100) NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "slug" varchar(220),
        "price_paise" bigint DEFAULT 0 NOT NULL,
        "mrp_paise" bigint DEFAULT 0 NOT NULL,
        "currency" varchar(3) DEFAULT 'INR' NOT NULL,
        "is_free" boolean DEFAULT false NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "is_public" boolean DEFAULT true NOT NULL,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "public"."coupons" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('cpn_'::text || nextval('public.coupons_id_seq'::regclass)) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "discount_type" "public"."discount_type" DEFAULT 'PERCENTAGE' NOT NULL,
        "discount_value" integer NOT NULL,
        "max_discount_paise" bigint,
        "min_order_paise" bigint DEFAULT 0 NOT NULL,
        "max_uses" integer,
        "used_count" integer DEFAULT 0 NOT NULL,
        "applicable_item_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "valid_from" timestamp with time zone,
        "valid_until" timestamp with time zone,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by_id" varchar(50),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      DO $$ BEGIN
        ALTER TABLE "public"."coupons" ADD CONSTRAINT "uq_coupons_code" UNIQUE ("code");
      EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."offerings_pricing" ADD CONSTRAINT "uq_offerings_pricing_item" UNIQUE ("item_type", "item_id");
      EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."orders" ADD CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."order_items" ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."coupons" ADD CONSTRAINT "fk_coupons_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;
    `);

    // 8. Polymorphic Enrollments & Payments Alterations
    await pool.query(`
      -- Payments polymorphic alterations
      DO $$ BEGIN
        ALTER TABLE "public"."payments" ALTER COLUMN "pathway_id" DROP NOT NULL;
      EXCEPTION WHEN undefined_table THEN null; WHEN undefined_column THEN null; END $$;

      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "order_id" varchar(50);
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "enrollment_id" varchar(50);
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "item_type" "public"."item_type" DEFAULT 'PATHWAY';
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "item_id" varchar(100);

      DO $$ BEGIN
        ALTER TABLE "public"."payments" ADD CONSTRAINT "fk_payments_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null;
      EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

      -- Enrollments polymorphic alterations
      DO $$ BEGIN
        ALTER TABLE "public"."enrollments" ALTER COLUMN "pathway_id" DROP NOT NULL;
      EXCEPTION WHEN undefined_table THEN null; WHEN undefined_column THEN null; END $$;

      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "item_type" "public"."item_type" DEFAULT 'PATHWAY' NOT NULL;
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "item_id" varchar(100);
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "order_id" varchar(50);
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "payment_id" varchar(50);
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "source" "public"."enrollment_source" DEFAULT 'PURCHASE' NOT NULL;
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
      ALTER TABLE "public"."enrollments" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

      -- Backfill legacy enrollments item_id from pathway_id if null
      UPDATE "public"."enrollments" SET "item_id" = "pathway_id" WHERE "item_id" IS NULL AND "pathway_id" IS NOT NULL;

      -- Backfill legacy payments item_id from pathway_id if null
      UPDATE "public"."payments" SET "item_id" = "pathway_id" WHERE "item_id" IS NULL AND "pathway_id" IS NOT NULL;

      -- Safe Indexes
      CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "public"."orders" ("user_id");
      CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "public"."orders" ("status");
      CREATE INDEX IF NOT EXISTS "idx_orders_number" ON "public"."orders" ("order_number");
      CREATE INDEX IF NOT EXISTS "idx_orders_rzp" ON "public"."orders" ("razorpay_order_id");
      CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "public"."orders" ("created_at" DESC);
      CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "public"."order_items" ("order_id");
      CREATE INDEX IF NOT EXISTS "idx_order_items_item" ON "public"."order_items" ("item_type", "item_id");
      CREATE INDEX IF NOT EXISTS "idx_offerings_pricing_item" ON "public"."offerings_pricing" ("item_type", "item_id");
      CREATE INDEX IF NOT EXISTS "idx_offerings_pricing_is_active" ON "public"."offerings_pricing" ("is_active");
      CREATE INDEX IF NOT EXISTS "idx_coupons_code" ON "public"."coupons" ("code");
      CREATE INDEX IF NOT EXISTS "idx_coupons_is_active" ON "public"."coupons" ("is_active");
      CREATE INDEX IF NOT EXISTS "idx_enrollments_item" ON "public"."enrollments" ("item_type", "item_id");
      CREATE INDEX IF NOT EXISTS "idx_enrollments_order" ON "public"."enrollments" ("order_id");
      CREATE INDEX IF NOT EXISTS "idx_payments_order" ON "public"."payments" ("order_id");
    `);

    // 9. Default Offerings Seed
    await pool.query(`
      INSERT INTO "public"."offerings_pricing" (
        "item_type", "item_id", "title", "description", "price_paise", "mrp_paise", "is_active", "is_public"
      ) VALUES (
        'WORKSHOP',
        'AI_MASTERCLASS_2026',
        'AI Revolution & Agentic Engineering Masterclass',
        'Comprehensive workshop on AI Agents, Deep Learning & Autonomous systems',
        3900,
        99900,
        true,
        true
      )
      ON CONFLICT ("item_type", "item_id") DO NOTHING;
    `);

    console.log("[DB-INIT] ✅ WorkSole, CRM, Orders, Dynamic Pricing, and Polymorphic Enrollment tables verified successfully.");

    // 10. Run official Drizzle migrator if folder exists
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
