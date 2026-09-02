ALTER TABLE "presentations" DROP CONSTRAINT "fk_presentations_college";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "fk_presentations_college" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");