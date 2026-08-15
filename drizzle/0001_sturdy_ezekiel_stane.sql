ALTER TABLE "course_modules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "course_modules" CASCADE;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "course_id" uuid;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;