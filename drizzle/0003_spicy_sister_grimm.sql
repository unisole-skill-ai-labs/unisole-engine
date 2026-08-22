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
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;