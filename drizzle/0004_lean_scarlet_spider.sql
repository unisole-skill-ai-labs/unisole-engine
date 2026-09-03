CREATE SEQUENCE "public"."iapt_nain_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "iapt_nain_registrations" (
	"id" varchar(50) PRIMARY KEY DEFAULT ('nain_'::text || nextval('iapt_nain_registrations_id_seq'::regclass)) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"category" varchar(100) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"city_state" varchar(150) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iapt_nain_registrations" ADD CONSTRAINT "fk_iapt_nain_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_iapt_nain_user_id" ON "iapt_nain_registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_iapt_nain_phone" ON "iapt_nain_registrations" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_iapt_nain_institution" ON "iapt_nain_registrations" USING btree ("institution");