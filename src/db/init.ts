import { pool, db } from "../db";
import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { studentSurveySchema } from "../constants/defaultSurvey";
import { pricingService } from "../services/pricing.service";

async function addEnumValueSafely(typeName: string, value: string) {
  try {
    await pool.query(`ALTER TYPE "public"."${typeName}" ADD VALUE IF NOT EXISTS '${value}'`);
  } catch (err: any) {
    // Ignore if already exists or undefined
  }
}

async function execSqlSafe(label: string, sqlQuery: string) {
  try {
    await pool.query(sqlQuery);
  } catch (err: any) {
    console.log(`[DB-INIT] Notice on ${label}:`, err?.message || err);
  }
}

export async function initializeDatabase() {
  try {
    console.log("[DB-INIT] Checking database connectivity and schema integrity...");
    const connCheck = await pool.query("SELECT current_database(), current_user, version()");
    console.log("[DB-INIT] Connected to database:", connCheck.rows[0]?.current_database);

    // 1. Ensure Base Enums Exist
    await execSqlSafe("base_enums", `
      DO $$ BEGIN
        CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'MEMBER', 'ADMIN', 'SUPER_ADMIN', 'SALES');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."pathway_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."content_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."task_activity_type" AS ENUM('COMMENT', 'STATUS_CHANGE', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'BLOCKED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."enrollment_status" AS ENUM('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."enrollment_source" AS ENUM('PURCHASE', 'ADMIN_MANUAL', 'CAMPUS_SPONSORED', 'FREE', 'INVITE');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."payment_status" AS ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."item_type" AS ENUM('PATHWAY', 'COURSE', 'WORKSHOP', 'PROGRAM', 'EVENT', 'BUNDLE', 'MERCHANDISE');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FLAT');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."otp_channel" AS ENUM('SMS', 'WHATSAPP');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."otp_status" AS ENUM('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."session_status" AS ENUM('DRAFT', 'LIVE', 'PAUSED', 'ENDED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."project_status" AS ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."sub_project_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_quality" AS ENUM('HOT', 'WARM', 'COLD', 'POOR', 'UNQUALIFIED');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'ATTEMPTED', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP_SCHEDULED', 'DEMO_GIVEN', 'CONVERTED', 'LOST', 'JUNK', 'NOT_A_LEAD');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_source" AS ENUM('PRESENTATION_SESSION', 'COLLEGE_DRIVE', 'PAMPHLET_SCAN', 'PAMPHLET_QR', 'SESSION_QR', 'IAPT', 'AI_WORKSHOP', 'PROFESSOR_NETWORK', 'NON_PAMPHLET', 'ORGANIC', 'DIRECT_WEB', 'WEBSITE_INQUIRY', 'REFERRAL', 'MANUAL_IMPORT', 'OTHER', 'SURVEY');
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "public"."lead_call_outcome" AS ENUM('CONNECTED_INTERESTED', 'CONNECTED_FOLLOW_UP', 'CONNECTED_NOT_INTERESTED', 'CONNECTED_CONVERTED', 'BUSY_NO_ANSWER', 'WRONG_NUMBER', 'CALL_BACK_REQUESTED', 'VOICEMAIL');
      EXCEPTION WHEN OTHERS THEN null; END $$;
    `);

    // 2. Safe standalone enum additions (outside PL/pgSQL transaction blocks)
    await addEnumValueSafely("enrollment_source", "SURVEY");
    await addEnumValueSafely("lead_source", "SURVEY");
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

    await addEnumValueSafely("user_role", "SALES");

    // 3. Sequences
    await execSqlSafe("sequences", `
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

    // 4. CRITICAL: Polymorphic Enrollments, Users & Payments Alterations (Runs first so core queries never fail)
    await execSqlSafe("users_columns", `
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "username" varchar(100);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "password" varchar(255);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "college_id" varchar(50);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "college_name" varchar(200);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "branch" varchar(100);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "department_id" varchar(50);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "designation" varchar(150);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "signup_source" varchar(50) DEFAULT 'NON_PAMPHLET' NOT NULL;
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "signup_session_code" varchar(50);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "signup_college_id" varchar(50);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "signup_college_name" varchar(200);
      ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
    `);

    await execSqlSafe("enrollments_alterations", `
      DO $$ BEGIN
        ALTER TABLE "public"."enrollments" ALTER COLUMN "pathway_id" DROP NOT NULL;
        ALTER TABLE "public"."enrollments" ALTER COLUMN "course_id" DROP NOT NULL;
        ALTER TABLE "public"."enrollments" DROP CONSTRAINT IF EXISTS "fk_enrollments_pathway";
      EXCEPTION WHEN OTHERS THEN null; END $$;

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

      CREATE INDEX IF NOT EXISTS "idx_enrollments_item" ON "public"."enrollments" ("item_type", "item_id");
      CREATE INDEX IF NOT EXISTS "idx_enrollments_order" ON "public"."enrollments" ("order_id");
    `);

    await execSqlSafe("payments_alterations", `
      DO $$ BEGIN
        ALTER TYPE "public"."payment_status" ADD VALUE IF NOT EXISTS 'CANCELLED';
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."payments" ALTER COLUMN "pathway_id" DROP NOT NULL;
        ALTER TABLE "public"."payments" DROP CONSTRAINT IF EXISTS "fk_payments_pathway";
      EXCEPTION WHEN OTHERS THEN null; END $$;

      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "order_id" varchar(50);
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "enrollment_id" varchar(50);
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "item_type" "public"."item_type" DEFAULT 'PATHWAY';
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "item_id" varchar(100);
      ALTER TABLE "public"."payments" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;

      UPDATE "public"."payments" SET "item_id" = "pathway_id" WHERE "item_id" IS NULL AND "pathway_id" IS NOT NULL;

      CREATE INDEX IF NOT EXISTS "idx_payments_order" ON "public"."payments" ("order_id");
    `);

    await execSqlSafe("courses_alterations", `
      ALTER TABLE "public"."courses" ADD COLUMN IF NOT EXISTS "price_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."courses" ADD COLUMN IF NOT EXISTS "mrp_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."courses" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
    `);

    // 5. Commercial Orders, Pricing Catalog & Coupons Tables
    await execSqlSafe("orders_tables", `
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
        "applicable_item_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "valid_from" timestamp with time zone,
        "valid_until" timestamp with time zone,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by_id" varchar(50),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "applicable_item_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;

      -- Ensure columns on existing offerings_pricing table if created in earlier runs
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "slug" varchar(220);
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "is_free" boolean DEFAULT false NOT NULL;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "price_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "mrp_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "currency" varchar(3) DEFAULT 'INR' NOT NULL;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT true NOT NULL;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
      ALTER TABLE "public"."offerings_pricing" ADD COLUMN IF NOT EXISTS "description" text;
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_offerings_pricing_item" ON "public"."offerings_pricing" ("item_type", "item_id");
      CREATE INDEX IF NOT EXISTS "idx_offerings_pricing_item" ON "public"."offerings_pricing" ("item_type", "item_id");
      CREATE INDEX IF NOT EXISTS "idx_offerings_pricing_is_active" ON "public"."offerings_pricing" ("is_active");

      -- Ensure columns on existing orders table if created in earlier runs
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "order_number" varchar(60);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "razorpay_order_id" varchar(150);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "user_id" varchar(50);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "customer_name" varchar(150);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "customer_phone" varchar(20);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "customer_email" varchar(255);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "subtotal_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "discount_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "coupon_code" varchar(50);
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "total_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "currency" varchar(3) DEFAULT 'INR' NOT NULL;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "status" "public"."order_status" DEFAULT 'PENDING' NOT NULL;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "notes" text;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "paid_at" timestamp with time zone;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
      ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

      -- Drop NOT NULL on legacy column names if they exist from older schema
      DO $$ BEGIN
        ALTER TABLE "public"."orders" ALTER COLUMN "total_amount_paise" DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."orders" ALTER COLUMN "final_amount_paise" DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."orders" ALTER COLUMN "discount_amount_paise" DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."orders" ALTER COLUMN "user_id" DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      -- Ensure id and order_id columns are varchar(50) with correct defaults
      DO $$ BEGIN
        ALTER TABLE "public"."orders" ALTER COLUMN "id" TYPE varchar(50) USING id::varchar(50);
        ALTER TABLE "public"."orders" ALTER COLUMN "id" SET DEFAULT ('ord_'::text || nextval('public.orders_id_seq'::regclass));
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."order_items" ALTER COLUMN "id" TYPE varchar(50) USING id::varchar(50);
        ALTER TABLE "public"."order_items" ALTER COLUMN "id" SET DEFAULT ('ord_item_'::text || nextval('public.order_items_id_seq'::regclass));
        ALTER TABLE "public"."order_items" ALTER COLUMN "order_id" TYPE varchar(50) USING order_id::varchar(50);
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."offerings_pricing" ALTER COLUMN "id" TYPE varchar(50) USING id::varchar(50);
        ALTER TABLE "public"."offerings_pricing" ALTER COLUMN "id" SET DEFAULT ('prc_'::text || nextval('public.offerings_pricing_id_seq'::regclass));
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."coupons" ALTER COLUMN "id" TYPE varchar(50) USING id::varchar(50);
        ALTER TABLE "public"."coupons" ALTER COLUMN "id" SET DEFAULT ('cpn_'::text || nextval('public.coupons_id_seq'::regclass));
      EXCEPTION WHEN OTHERS THEN null; END $$;

      -- Ensure columns on existing coupons table if created in earlier runs
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "created_by_id" varchar(50);
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "description" text;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "max_discount_paise" bigint;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "min_order_paise" bigint DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "max_uses" integer;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "used_count" integer DEFAULT 0 NOT NULL;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "applicable_item_types" jsonb DEFAULT '[]'::jsonb NOT NULL;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "valid_from" timestamp with time zone;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "valid_until" timestamp with time zone;
      ALTER TABLE "public"."coupons" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;

      DO $$ BEGIN
        ALTER TABLE "public"."coupons" ADD CONSTRAINT "uq_coupons_code" UNIQUE ("code");
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."offerings_pricing" ADD CONSTRAINT "uq_offerings_pricing_item" UNIQUE ("item_type", "item_id");
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."orders" ADD CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."order_items" ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."coupons" ADD CONSTRAINT "fk_coupons_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

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
    `);

    // 6. Projects, Sub-Projects & Tasks DDL
    await execSqlSafe("projects_tasks", `
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
        "is_hidden" boolean DEFAULT false NOT NULL,
        "start_date" timestamp with time zone,
        "target_end_date" timestamp with time zone,
        "completed_at" timestamp with time zone,
        "color" varchar(30) DEFAULT '#6366f1' NOT NULL,
        "icon" varchar(50) DEFAULT 'folder' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "uq_projects_code" UNIQUE("code")
      );

      ALTER TABLE "public"."projects" ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT false NOT NULL;
      CREATE INDEX IF NOT EXISTS "idx_projects_is_hidden" ON "public"."projects" ("is_hidden");

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
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."sub_projects" ADD CONSTRAINT "fk_sub_projects_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."sub_projects" ADD CONSTRAINT "fk_sub_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_tasks_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."tasks" ADD CONSTRAINT "fk_tasks_sub_project" FOREIGN KEY ("sub_project_id") REFERENCES "public"."sub_projects"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      CREATE INDEX IF NOT EXISTS "idx_projects_dept" ON "public"."projects" ("department_id");
      CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "public"."projects" ("status");
      CREATE INDEX IF NOT EXISTS "idx_projects_lead" ON "public"."projects" ("lead_id");
      CREATE INDEX IF NOT EXISTS "idx_sub_projects_project" ON "public"."sub_projects" ("project_id");
      CREATE INDEX IF NOT EXISTS "idx_sub_projects_status" ON "public"."sub_projects" ("status");
      CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "public"."tasks" ("project_id");
      CREATE INDEX IF NOT EXISTS "idx_tasks_sub_project" ON "public"."tasks" ("sub_project_id");
    `);

    // 6B. Roadshow Presentations & Live Sessions DDL
    await execSqlSafe("presentations_and_sessions", `
      CREATE SEQUENCE IF NOT EXISTS "public"."presentations_id_seq";
      CREATE SEQUENCE IF NOT EXISTS "public"."presentation_sessions_id_seq";
      CREATE SEQUENCE IF NOT EXISTS "public"."presentation_leads_id_seq";

      CREATE TABLE IF NOT EXISTS "public"."presentations" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('pres_'::text || nextval('public.presentations_id_seq'::regclass)) NOT NULL,
        "college_id" varchar(50),
        "college_name" varchar(200),
        "title" varchar(255) NOT NULL,
        "description" text,
        "theme" varchar(50) DEFAULT 'dark' NOT NULL,
        "slides" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_by_id" varchar(50),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "public"."presentation_sessions" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('sess_'::text || nextval('public.presentation_sessions_id_seq'::regclass)) NOT NULL,
        "presentation_id" varchar(50) NOT NULL,
        "college_id" varchar(50) NOT NULL,
        "college_name" varchar(200),
        "session_code" varchar(20) NOT NULL,
        "status" "public"."session_status" DEFAULT 'DRAFT' NOT NULL,
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
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "public"."presentation_leads" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('plead_'::text || nextval('public.presentation_leads_id_seq'::regclass)) NOT NULL,
        "session_id" varchar(50) NOT NULL,
        "presentation_id" varchar(50) NOT NULL,
        "user_id" varchar(50),
        "phone" varchar(20) NOT NULL,
        "name" varchar(150),
        "academic_branch" varchar(100),
        "total_score" integer DEFAULT 0 NOT NULL,
        "answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "idx_presentations_is_active" ON "public"."presentations" ("is_active");
      CREATE INDEX IF NOT EXISTS "idx_presentations_college" ON "public"."presentations" ("college_id");
      CREATE INDEX IF NOT EXISTS "idx_sessions_code" ON "public"."presentation_sessions" ("session_code");
      CREATE INDEX IF NOT EXISTS "idx_sessions_presentation" ON "public"."presentation_sessions" ("presentation_id");
      CREATE INDEX IF NOT EXISTS "idx_sessions_college" ON "public"."presentation_sessions" ("college_id");
      CREATE INDEX IF NOT EXISTS "idx_presentation_leads_session" ON "public"."presentation_leads" ("session_id");
      CREATE INDEX IF NOT EXISTS "idx_presentation_leads_phone" ON "public"."presentation_leads" ("phone");
    `);

    // 7. IAPT NAIN & CRM Leads
    await execSqlSafe("iapt_and_leads", `
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
      EXCEPTION WHEN OTHERS THEN null; END $$;

      CREATE INDEX IF NOT EXISTS "idx_iapt_nain_phone" ON "public"."iapt_nain_registrations" ("phone");
      CREATE INDEX IF NOT EXISTS "idx_iapt_nain_institution" ON "public"."iapt_nain_registrations" ("institution");

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
      ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "sub_status" varchar(100);
      CREATE INDEX IF NOT EXISTS "idx_leads_sub_status" ON "public"."leads" ("sub_status");

      CREATE TABLE IF NOT EXISTS "public"."lead_call_logs" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('clog_'::text || nextval('public.lead_call_logs_id_seq'::regclass)) NOT NULL,
        "lead_id" varchar(50) NOT NULL,
        "caller_user_id" varchar(50) NOT NULL,
        "caller_name" varchar(150) NOT NULL,
        "call_duration_seconds" integer DEFAULT 0 NOT NULL,
        "outcome" "public"."lead_call_outcome" NOT NULL,
        "sub_status" varchar(100),
        "notes" text NOT NULL,
        "previous_quality" "public"."lead_quality",
        "new_quality" "public"."lead_quality",
        "previous_status" "public"."lead_status",
        "new_status" "public"."lead_status",
        "scheduled_next_call_at" timestamp with time zone,
        "recording_url" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "public"."lead_call_logs" ADD COLUMN IF NOT EXISTS "sub_status" varchar(100);

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_user_account" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_college_ref" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_assigned_user" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."leads" ADD CONSTRAINT "fk_leads_creator_user" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."lead_call_logs" ADD CONSTRAINT "fk_call_logs_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade;
      EXCEPTION WHEN OTHERS THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "public"."lead_call_logs" ADD CONSTRAINT "fk_call_logs_caller" FOREIGN KEY ("caller_user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
      EXCEPTION WHEN OTHERS THEN null; END $$;

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

      -- EOD Logs
      CREATE SEQUENCE IF NOT EXISTS "public"."daily_eod_logs_id_seq";
      CREATE TABLE IF NOT EXISTS "public"."daily_eod_logs" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('eod_'::text || nextval('public.daily_eod_logs_id_seq'::regclass)) NOT NULL,
        "user_id" varchar(50) NOT NULL,
        "log_date" varchar(10) NOT NULL,
        "completed_summary" text NOT NULL,
        "plan_tomorrow" text NOT NULL,
        "blockers" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
      ALTER TABLE "public"."daily_eod_logs" ADD COLUMN IF NOT EXISTS "completed_summary" text;
      ALTER TABLE "public"."daily_eod_logs" ADD COLUMN IF NOT EXISTS "plan_tomorrow" text;
      ALTER TABLE "public"."daily_eod_logs" ADD COLUMN IF NOT EXISTS "blockers" text;
    `);

    // 8. Canonical SEO Offerings Seed (offerings_pricing)
    await execSqlSafe("seed_offerings_pricing", `
      DELETE FROM "public"."offerings_pricing" WHERE "item_id" IN ('mgmt-p2', 'mgmt-p3', 'mgmt-common');
      
      INSERT INTO "public"."offerings_pricing" (
        "item_type", "item_id", "title", "description", "price_paise", "mrp_paise", "is_active", "is_public"
      ) VALUES 
        ('WORKSHOP', 'AI_MASTERCLASS_2026', 'AI Revolution & Agentic Engineering Masterclass', 'Comprehensive workshop on AI Agents, Deep Learning & Autonomous systems', 3900, 99900, true, true),
        ('PATHWAY', 'cs-genai', 'Generative AI Engineering', 'From data handling and backend engineering through classical NLP, sequence models, Transformers, and RAG into LLMOps and Agentic AI systems.', 299900, 999900, true, true),
        ('PATHWAY', 'cs-agentic', 'AI Agent Engineering', 'From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.', 299900, 999900, true, true),
        ('PATHWAY', 'cs-p1', 'Machine Learning in Production: MLOps Engineering', 'Production ML pipelines, PyTorch deep learning, FastAPI model serving, Docker MLOps, and Generative AI/RAG.', 299900, 999900, true, true),
        ('PATHWAY', 'cs-common', 'AI Entrepreneurship & Business Innovation', 'Structured incubator track teaching students how to convert AI technical capability into commercial startups.', 59900, 299900, true, true),
        ('PATHWAY', 'sci-p1', 'Scientific Machine Learning for Basic Sciences (BSc Physics | BSc Maths)', 'Core progression: Mathematics → Python → Scientific Computing → Machine Learning → Deep Learning → Scientific AI → Capstone. Physics-Informed Neural Networks.', 299900, 899900, true, true),
        ('PATHWAY', 'sci-p2', 'Mathematics + AI / Computational Intelligence', 'Mathematics-oriented pathway focusing on optimization theory, statistical learning, and computational algorithms.', 150000, 599900, true, true),
        ('PATHWAY', 'mgmt-p1', 'Business Analytics & Data Engineering', 'Advanced Excel, SQL, modern data engineering (ETL, Parquet, DuckDB), Power BI, and Generative AI.', 200000, 699900, true, true),
        ('PATHWAY', 'arts-p1', 'Applied AI for Humanities, Research & Careers', 'Prompt engineering, AI research methods, automated content, executive communication, and career acceleration.', 99900, 399900, true, true)
      ON CONFLICT ("item_type", "item_id") DO UPDATE SET "title" = EXCLUDED."title", "description" = EXCLUDED."description";
    `);

    // 9. Foundational Flagship Courses Sync & Legacy Clean
    await execSqlSafe("seed_foundational_courses", `
      DELETE FROM "public"."pathway_categories" WHERE "pathway_id" IN ('pwy_1', 'pwy_2', 'pwy_3');
      DELETE FROM "public"."pathway_colleges" WHERE "pathway_id" IN ('pwy_1', 'pwy_2', 'pwy_3');
      DELETE FROM "public"."pathway_courses" WHERE "pathway_id" IN ('pwy_1', 'pwy_2', 'pwy_3');
      UPDATE "public"."enrollments" SET "pathway_id" = NULL WHERE "pathway_id" IN ('pwy_1', 'pwy_2', 'pwy_3');
      UPDATE "public"."payments" SET "pathway_id" = NULL WHERE "pathway_id" IN ('pwy_1', 'pwy_2', 'pwy_3');
      DELETE FROM "public"."pathways" WHERE "id" IN ('pwy_1', 'pwy_2', 'pwy_3');

      DELETE FROM "public"."pathway_courses" WHERE "course_id" IN ('crs_1', 'crs_2', 'crs_3', 'crs_4', 'crs_5', 'crs_6', 'crs_cs_ai', 'crs_sci_math', 'crs_commerce_mgmt', 'crs_humanities_arts', 'mgmt-p2', 'mgmt-p3', 'mgmt-common', 'cs-p2', 'cs-p3', 'crs_cs-genai', 'crs_cs-agentic', 'crs_cs-p1', 'crs_cs-common', 'crs_sci-p1', 'crs_sci-p2', 'crs_mgmt-p1', 'crs_arts-p1');
      DELETE FROM "public"."course_modules" WHERE "course_id" IN ('crs_1', 'crs_2', 'crs_3', 'crs_4', 'crs_5', 'crs_6', 'crs_cs_ai', 'crs_sci_math', 'crs_commerce_mgmt', 'crs_humanities_arts', 'mgmt-p2', 'mgmt-p3', 'mgmt-common', 'cs-p2', 'cs-p3', 'crs_cs-genai', 'crs_cs-agentic', 'crs_cs-p1', 'crs_cs-common', 'crs_sci-p1', 'crs_sci-p2', 'crs_mgmt-p1', 'crs_arts-p1') OR "module_id" IN ('mod_1', 'mod_2', 'mod_3', 'mod_4', 'mod_5', 'mod_6', 'mod_7', 'mod_8');
      DELETE FROM "public"."module_lessons" WHERE "module_id" IN ('mod_1', 'mod_2', 'mod_3', 'mod_4', 'mod_5', 'mod_6', 'mod_7', 'mod_8') OR "lesson_id" IN ('les_1', 'les_2', 'les_3', 'les_4', 'les_5', 'les_6', 'les_7', 'les_8');
      DELETE FROM "public"."lessons" WHERE "id" IN ('les_1', 'les_2', 'les_3', 'les_4', 'les_5', 'les_6', 'les_7', 'les_8');
      DELETE FROM "public"."modules" WHERE "id" IN ('mod_1', 'mod_2', 'mod_3', 'mod_4', 'mod_5', 'mod_6', 'mod_7', 'mod_8');
      DELETE FROM "public"."courses" WHERE "id" IN ('crs_1', 'crs_2', 'crs_3', 'crs_4', 'crs_5', 'crs_6', 'crs_cs_ai', 'crs_sci_math', 'crs_commerce_mgmt', 'crs_humanities_arts', 'mgmt-p2', 'mgmt-p3', 'mgmt-common', 'cs-p2', 'cs-p3', 'crs_cs-genai', 'crs_cs-agentic', 'crs_cs-p1', 'crs_cs-common', 'crs_sci-p1', 'crs_sci-p2', 'crs_mgmt-p1', 'crs_arts-p1');

      INSERT INTO "public"."courses" ("id", "title", "slug", "short_description", "price_paise", "mrp_paise", "status", "metadata", "is_active")
      VALUES 
        ('cs-genai', 'Generative AI Engineering', 'cs-genai', 'Master enterprise-grade LLM architectures, production RAG pipelines, vector databases (Qdrant), PEFT/LoRA fine-tuning, and high-throughput vLLM serving.', 299900, 999900, 'PUBLISHED'::content_status, '{"group": "group-1", "pathwayId": "cs-genai", "badge": "GROUP 01 • PATHWAY 01", "shortName": "CS & IT: Generative AI"}'::jsonb, TRUE),
        ('cs-agentic', 'AI Agent Engineering', 'cs-agentic', 'Design and deploy autonomous AI agents with reasoning loops, dynamic tool calling, stateful graphs in LangGraph, multi-agent swarms with CrewAI, and Model Context Protocol (MCP).', 299900, 999900, 'PUBLISHED'::content_status, '{"group": "group-1", "pathwayId": "cs-agentic", "badge": "GROUP 01 • PATHWAY 02", "shortName": "CS & IT: Agentic AI"}'::jsonb, TRUE),
        ('cs-p1', 'Machine Learning in Production: MLOps Engineering', 'cs-p1', 'End-to-end ML engineering: data pipelines, deep learning, FastAPI model serving, Docker MLOps, and Generative AI/RAG architectures.', 299900, 999900, 'PUBLISHED'::content_status, '{"group": "group-1", "pathwayId": "cs-p1", "badge": "GROUP 01 • PATHWAY 03", "shortName": "CS & IT: ML Engineering"}'::jsonb, TRUE),
        ('cs-common', 'AI Entrepreneurship & Business Innovation', 'cs-common', 'Structured incubator track teaching students how to convert AI technical capability into validated commercial products and startups.', 59900, 299900, 'PUBLISHED'::content_status, '{"group": "group-1", "pathwayId": "cs-common", "badge": "GROUP 01 • WEEKEND", "shortName": "CS & IT: AI Entrepreneurship"}'::jsonb, TRUE),
        ('sci-p1', 'Scientific Machine Learning for Basic Sciences (BSc Physics | BSc Maths)', 'sci-p1', 'Combines mathematical principles with modern scientific computing, differential equations, and Physics-Informed Neural Networks (PINNs).', 299900, 899900, 'PUBLISHED'::content_status, '{"group": "group-2", "pathwayId": "sci-p1", "badge": "GROUP 02 • PATHWAY 01", "shortName": "Science & Math: SciML & AI"}'::jsonb, TRUE),
        ('sci-p2', 'Mathematics + AI / Computational Intelligence', 'sci-p2', 'Rigorous mathematics-oriented pathway focusing on mathematical proofs, optimization theory, statistical learning, and computational algorithms.', 150000, 599900, 'PUBLISHED'::content_status, '{"group": "group-2", "pathwayId": "sci-p2", "badge": "GROUP 02 • PATHWAY 02", "shortName": "Science & Math: Computational Math"}'::jsonb, TRUE),
        ('mgmt-p1', 'Business Analytics & Data Engineering', 'mgmt-p1', 'Equips business students with advanced Excel, SQL, modern data engineering (ETL, Parquet, DuckDB), Power BI, and Generative AI.', 200000, 699900, 'PUBLISHED'::content_status, '{"group": "group-3", "pathwayId": "mgmt-p1", "badge": "GROUP 03 • PATHWAY 01", "shortName": "Commerce: Business Analytics"}'::jsonb, TRUE),
        ('arts-p1', 'Applied AI for Humanities, Research & Careers', 'arts-p1', 'Elite professional program: prompt engineering, AI research methods, automated content, executive communication, and career mastery.', 99900, 399900, 'PUBLISHED'::content_status, '{"group": "group-4", "pathwayId": "arts-p1", "badge": "GROUP 04 • PATHWAY 01", "shortName": "Humanities: Applied AI"}'::jsonb, TRUE),
        ('ai-masterclass', 'AI Revolution & Agentic Engineering Masterclass (2-Hour Intensive)', 'ai-masterclass', 'Live 2-Hour Intensive Masterclass on Advanced AI Prompting & Context Engineering.', 3900, 99900, 'PUBLISHED'::content_status, '{"group": "workshop", "pathwayId": "ai-masterclass", "badge": "MASTERCLASS", "shortName": "AI Masterclass"}'::jsonb, TRUE)
      ON CONFLICT ("slug") DO UPDATE SET
        "title" = EXCLUDED."title",
        "short_description" = EXCLUDED."short_description",
        "price_paise" = EXCLUDED."price_paise",
        "mrp_paise" = EXCLUDED."mrp_paise",
        "status" = EXCLUDED."status",
        "metadata" = EXCLUDED."metadata",
        "is_active" = TRUE;

      INSERT INTO "public"."coupons" ("code", "description", "discount_type", "discount_value", "min_order_paise", "max_discount_paise", "max_uses", "applicable_item_ids", "is_active")
      VALUES 
        ('UNISOLE20', 'Official Campus Launch 20% Discount (All Courses)', 'PERCENTAGE'::discount_type, 20, 0, 200000, 1000, '[]'::jsonb, TRUE),
        ('EARLYBIRD500', 'Early Bird Flat ₹500 Discount on Flagship Engineering & Analytics Tracks', 'FLAT'::discount_type, 50000, 100000, NULL, 500, '["cs-p1", "cs-p2", "cs-p3", "mgmt-p1", "mgmt-p3"]'::jsonb, TRUE)
      ON CONFLICT ("code") DO UPDATE SET
        "description" = EXCLUDED."description",
        "discount_type" = EXCLUDED."discount_type",
        "discount_value" = EXCLUDED."discount_value",
        "applicable_item_ids" = EXCLUDED."applicable_item_ids",
        "is_active" = TRUE;
    `);

    // 14. Surveys and Survey Responses
    await execSqlSafe("survey_tables", `
      CREATE TABLE IF NOT EXISTS "public"."surveys" (
        "id" VARCHAR(50) PRIMARY KEY,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "schema" JSONB DEFAULT '{}'::jsonb NOT NULL,
        "is_active" BOOLEAN DEFAULT true NOT NULL,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "public"."survey_responses" (
        "id" VARCHAR(50) PRIMARY KEY,
        "survey_id" VARCHAR(50) NOT NULL REFERENCES "public"."surveys"("id") ON DELETE CASCADE,
        "user_id" VARCHAR(50),
        "lead_id" VARCHAR(50),
        "name" VARCHAR(255),
        "phone" VARCHAR(50),
        "email" VARCHAR(255),
        "college_name" VARCHAR(255),
        "college_id" VARCHAR(50),
        "stream" VARCHAR(100),
        "year_of_study" VARCHAR(50),
        "answers" JSONB DEFAULT '{}'::jsonb NOT NULL,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_surveys_slug ON "public"."surveys"("slug");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON "public"."survey_responses"("survey_id");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON "public"."survey_responses"("user_id");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_lead ON "public"."survey_responses"("lead_id");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_phone ON "public"."survey_responses"("phone");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_college ON "public"."survey_responses"("college_name");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_stream ON "public"."survey_responses"("stream");
      CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON "public"."survey_responses"("created_at" DESC);
    `);

    // 15. Auto-seed Student Skills Survey definition
    try {
      const surveyJson = JSON.stringify(studentSurveySchema).replace(/'/g, "''");
      await execSqlSafe("survey_default_seed", `
        INSERT INTO "public"."surveys" ("id", "slug", "title", "description", "schema", "is_active", "metadata", "created_at", "updated_at")
        VALUES (
          'srv_student_skills_2026',
          '${studentSurveySchema.slug}',
          '${studentSurveySchema.title.replace(/'/g, "''")}',
          '${studentSurveySchema.description.replace(/'/g, "''")}',
          '${surveyJson}'::jsonb,
          TRUE,
          '{"category": "CAREER_ASPIRATIONS", "origin": "GOOGLE_FORM_MIGRATION"}'::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT ("slug") DO UPDATE SET
          "title" = EXCLUDED."title",
          "description" = EXCLUDED."description",
          "schema" = EXCLUDED."schema",
          "is_active" = TRUE,
          "updated_at" = NOW();
      `);
    } catch (e) {
      console.warn("[DB-INIT] Warning seeding default survey:", e);
    }

    // 16. Backfill existing survey responders to SURVEY acquisition source
    try {
      await execSqlSafe("survey_responders_sync", `
        UPDATE "public"."users"
        SET "signup_source" = 'SURVEY'
        WHERE "id" IN (SELECT DISTINCT "user_id" FROM "public"."survey_responses" WHERE "user_id" IS NOT NULL)
           OR "phone" IN (SELECT DISTINCT "phone" FROM "public"."survey_responses" WHERE "phone" IS NOT NULL);

        UPDATE "public"."leads"
        SET "source" = 'SURVEY'
        WHERE "phone" IN (SELECT DISTINCT "phone" FROM "public"."survey_responses" WHERE "phone" IS NOT NULL);
      `);
    } catch (e) {
      console.warn("[DB-INIT] Warning syncing survey responders:", e);
    }

    // 17. Seed & Sync Canonical SEO Course Offerings into offerings_pricing table
    try {
      const syncResult = await pricingService.syncCanonicalOfferings();
      console.log(`[DB-INIT] ✅ Seeded & synchronized canonical SEO offerings: ${syncResult.total} total (${syncResult.inserted} newly added, ${syncResult.updated} verified).`);
    } catch (e) {
      console.warn("[DB-INIT] Warning syncing canonical offerings:", e);
    }

    console.log("[DB-INIT] ✅ WorkSole, CRM, Orders, Dynamic Pricing, Canonical SEO Courses, Promotional Coupons, Polymorphic Enrollment and Survey tables verified successfully.");
  } catch (err) {
    console.error("[DB-INIT] ❌ Database initialization error:", err);
  }
}
