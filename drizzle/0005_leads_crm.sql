CREATE TYPE "public"."lead_call_outcome" AS ENUM('CONNECTED_INTERESTED', 'CONNECTED_FOLLOW_UP', 'CONNECTED_NOT_INTERESTED', 'CONNECTED_CONVERTED', 'BUSY_NO_ANSWER', 'WRONG_NUMBER', 'CALL_BACK_REQUESTED', 'VOICEMAIL');--> statement-breakpoint
CREATE TYPE "public"."lead_quality" AS ENUM('HOT', 'WARM', 'COLD', 'POOR', 'UNQUALIFIED');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('PRESENTATION_SESSION', 'COLLEGE_DRIVE', 'PAMPHLET_SCAN', 'WEBSITE_INQUIRY', 'REFERRAL', 'MANUAL_IMPORT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'ATTEMPTED', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP_SCHEDULED', 'DEMO_GIVEN', 'CONVERTED', 'LOST', 'JUNK', 'NOT_A_LEAD');--> statement-breakpoint
CREATE SEQUENCE "public"."lead_call_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "lead_call_logs" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('clog_'::text || nextval('lead_call_logs_id_seq'::regclass)) NOT NULL,
	"lead_id" varchar(50) NOT NULL,
	"caller_user_id" varchar(50) NOT NULL,
	"caller_name" varchar(150) NOT NULL,
	"call_duration_seconds" integer DEFAULT 0 NOT NULL,
	"outcome" "lead_call_outcome" NOT NULL,
	"notes" text NOT NULL,
	"previous_quality" "lead_quality",
	"new_quality" "lead_quality",
	"previous_status" "lead_status",
	"new_status" "lead_status",
	"scheduled_next_call_at" timestamp with time zone,
	"recording_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('lead_'::text || nextval('leads_id_seq'::regclass)) NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"user_id" varchar(50),
	"college_id" varchar(50),
	"college_name" varchar(200),
	"branch" varchar(100),
	"year_of_study" varchar(50),
	"assigned_to_user_id" varchar(50),
	"quality" "lead_quality" DEFAULT 'WARM' NOT NULL,
	"status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"source" "lead_source" DEFAULT 'COLLEGE_DRIVE' NOT NULL,
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
--> statement-breakpoint
ALTER TABLE "lead_call_logs" ADD CONSTRAINT "fk_call_logs_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_call_logs" ADD CONSTRAINT "fk_call_logs_caller" FOREIGN KEY ("caller_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "fk_leads_user_account" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "fk_leads_college_ref" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "fk_leads_assigned_user" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "fk_leads_creator_user" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_call_logs_lead" ON "lead_call_logs" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_call_logs_caller" ON "lead_call_logs" USING btree ("caller_user_id");--> statement-breakpoint
CREATE INDEX "idx_call_logs_created_at" ON "lead_call_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_leads_phone" ON "leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_leads_user" ON "leads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_leads_college" ON "leads" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_leads_branch" ON "leads" USING btree ("branch");--> statement-breakpoint
CREATE INDEX "idx_leads_assigned_to" ON "leads" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "idx_leads_quality" ON "leads" USING btree ("quality");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_leads_next_call" ON "leads" USING btree ("next_call_at");--> statement-breakpoint
CREATE INDEX "idx_leads_created_at" ON "leads" USING btree ("created_at" DESC NULLS LAST);