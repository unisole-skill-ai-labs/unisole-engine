DO $$ BEGIN
  CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."item_type" AS ENUM('PATHWAY', 'COURSE', 'WORKSHOP', 'PROGRAM', 'EVENT', 'BUNDLE', 'MERCHANDISE');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FLAT');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."enrollment_source" AS ENUM('PURCHASE', 'ADMIN_MANUAL', 'CAMPUS_SPONSORED', 'FREE', 'INVITE');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint

CREATE SEQUENCE IF NOT EXISTS "public"."orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."offerings_pricing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."coupons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "orders" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('ord_'::text || nextval('orders_id_seq'::regclass)) NOT NULL,
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
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "order_items" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('ord_item_'::text || nextval('order_items_id_seq'::regclass)) NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"item_type" "item_type" NOT NULL,
	"item_id" varchar(100) NOT NULL,
	"item_title" varchar(255) NOT NULL,
	"unit_price_paise" bigint DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_price_paise" bigint DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "offerings_pricing" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('prc_'::text || nextval('offerings_pricing_id_seq'::regclass)) NOT NULL,
	"item_type" "item_type" NOT NULL,
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
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "coupons" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('cpn_'::text || nextval('coupons_id_seq'::regclass)) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" "discount_type" DEFAULT 'PERCENTAGE' NOT NULL,
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
);--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "coupons" ADD CONSTRAINT "uq_coupons_code" UNIQUE ("code");
EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "offerings_pricing" ADD CONSTRAINT "uq_offerings_pricing_item" UNIQUE ("item_type", "item_id");
EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "coupons" ADD CONSTRAINT "fk_coupons_creator" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "payments" ALTER COLUMN "pathway_id" DROP NOT NULL;
EXCEPTION WHEN undefined_table THEN null; WHEN undefined_column THEN null; END $$;--> statement-breakpoint

ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "order_id" varchar(50);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "enrollment_id" varchar(50);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "item_type" "public"."item_type" DEFAULT 'PATHWAY';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "item_id" varchar(100);--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "enrollments" ALTER COLUMN "pathway_id" DROP NOT NULL;
EXCEPTION WHEN undefined_table THEN null; WHEN undefined_column THEN null; END $$;--> statement-breakpoint

ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "item_type" "public"."item_type" DEFAULT 'PATHWAY' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "item_id" varchar(100);--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "order_id" varchar(50);--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "payment_id" varchar(50);--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "source" "public"."enrollment_source" DEFAULT 'PURCHASE' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_number" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_rzp" ON "orders" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_item" ON "order_items" USING btree ("item_type", "item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_offerings_pricing_item" ON "offerings_pricing" USING btree ("item_type", "item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_offerings_pricing_is_active" ON "offerings_pricing" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupons_code" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupons_is_active" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_enrollments_item" ON "enrollments" USING btree ("item_type", "item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_enrollments_order" ON "enrollments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_order" ON "payments" USING btree ("order_id");
