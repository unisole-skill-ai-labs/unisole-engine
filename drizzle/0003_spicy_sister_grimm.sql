ALTER TABLE "assignment_submissions" DROP CONSTRAINT IF EXISTS "assignment_submissions_assignment_id_assignments_id_fk";--> statement-breakpoint
ALTER TABLE "assignment_submissions" DROP CONSTRAINT IF EXISTS "assignment_submissions_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "assignments" DROP CONSTRAINT IF EXISTS "assignments_lesson_id_module_item_id_fk";--> statement-breakpoint
ALTER TABLE "course_modules" DROP CONSTRAINT IF EXISTS "course_modules_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "course_modules" DROP CONSTRAINT IF EXISTS "course_modules_module_id_modules_id_fk";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_category_id_categories_id_fk";--> statement-breakpoint
ALTER TABLE "module_lessons" DROP CONSTRAINT IF EXISTS "module_lessons_module_id_modules_id_fk";--> statement-breakpoint
ALTER TABLE "module_lessons" DROP CONSTRAINT IF EXISTS "module_lessons_module_item_id_module_item_id_fk";--> statement-breakpoint
ALTER TABLE "quiz" DROP CONSTRAINT IF EXISTS "quiz_moduel_item_id_module_item_id_fk";--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "carts_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_order_id_orders_id_fk";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_coupon_id_coupons_id_fk";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_order_id_orders_id_fk";--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_quiz_id_quiz_id_fk";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP CONSTRAINT IF EXISTS "test_attempts_test_id_tests_id_fk";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP CONSTRAINT IF EXISTS "test_attempts_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "tests" DROP CONSTRAINT IF EXISTS "tests_module_item_id_module_item_id_fk";--> statement-breakpoint
ALTER TABLE "assignment_submissions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ALTER COLUMN "assignment_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assignments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assignments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assignments" ALTER COLUMN "lesson_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "course_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "category_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "course_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "module_item" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "module_item" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "module_lessons" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "module_lessons" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "module_lessons" ALTER COLUMN "module_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "module_lessons" ALTER COLUMN "module_item_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "course_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "order_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "course_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "coupon_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "order_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "quiz_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "moduel_item_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "course_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "test_attempts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "test_attempts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "test_attempts" ALTER COLUMN "test_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "test_attempts" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "module_item_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_module_item_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."module_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_lessons" ADD CONSTRAINT "module_lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_lessons" ADD CONSTRAINT "module_lessons_module_item_id_module_item_id_fk" FOREIGN KEY ("module_item_id") REFERENCES "public"."module_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_moduel_item_id_module_item_id_fk" FOREIGN KEY ("moduel_item_id") REFERENCES "public"."module_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_module_item_id_module_item_id_fk" FOREIGN KEY ("module_item_id") REFERENCES "public"."module_item"("id") ON DELETE cascade ON UPDATE no action;