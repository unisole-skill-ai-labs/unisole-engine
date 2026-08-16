import { db, pool } from "../db";
import {
  assignmentSubmissions,
  assignments,
  carts,
  categories,
  certificates,
  coupons,
  courses,
  enrollments,
  moduleItems,
  moduleLessons,
  modules,
  orderItems,
  orders,
  payments,
  questions,
  quizzes,
  reviews,
  testAttempts,
  tests,
  users,
} from "../db/schema";
import {
  seedAssignmentSubmissions,
  seedAssignments,
  seedCarts,
  seedCategories,
  seedCertificates,
  seedCoupons,
  seedCourses,
  seedEnrollments,
  seedModuleItems,
  seedModuleLessons,
  seedModules,
  seedOrderItems,
  seedOrders,
  seedPayments,
  seedQuestions,
  seedQuizzes,
  seedReviews,
  seedTestAttempts,
  seedTests,
  seedUsers,
} from "../config/seed-data";

async function seed() {
  try {
    await db.transaction(async (tx) => {
      for (const table of [
        reviews,
        certificates,
        enrollments,
        orderItems,
        payments,
        testAttempts,
        questions,
        orders,
        carts,
        coupons,
        tests,
        assignmentSubmissions,
        assignments,
        quizzes,
        moduleLessons,
        moduleItems,
        modules,
        courses,
        categories,
        users,
      ]) {
        await tx.delete(table);
      }

      const userIds = new Map<string, string>();
      for (const { key, ...data } of seedUsers) {
        const [row] = await tx
          .insert(users)
          .values(data)
          .returning({ id: users.id });
        userIds.set(key, row.id);
      }

      const categoryIds = new Map<string, string>();
      for (const { key, ...data } of seedCategories) {
        const [row] = await tx
          .insert(categories)
          .values(data)
          .returning({ id: categories.id });
        categoryIds.set(key, row.id);
      }

      const courseIds = new Map<string, string>();
      for (const course of seedCourses) {
        const [row] = await tx
          .insert(courses)
          .values({
            title: course.title,
            slug: course.slug,
            category_id: categoryIds.get(course.categoryKey),
            price: course.price,
            rating_avg: course.rating_avg,
            total_enrollments: course.total_enrollments,
          })
          .returning({ id: courses.id });
        courseIds.set(course.key, row.id);
      }

      const moduleIds = new Map<string, string>();
      for (const module of seedModules) {
        const [row] = await tx
          .insert(modules)
          .values({
            title: module.title,
            course_id: courseIds.get(module.courseKey),
            order_index: module.order_index,
          })
          .returning({ id: modules.id });
        moduleIds.set(module.key, row.id);
      }

      const itemIds = new Map<string, string>();
      for (const item of seedModuleItems) {
        const [row] = await tx
          .insert(moduleItems)
          .values({
            title: item.title,
            type: item.type,
            content_url: item.content_url,
            order_index: item.order_index,
          })
          .returning({ id: moduleItems.id });
        itemIds.set(item.key, row.id);
      }

      await tx.insert(moduleLessons).values(
        seedModuleLessons.map((link) => ({
          module_id: moduleIds.get(link.moduleKey)!,
          module_item_id: itemIds.get(link.itemKey)!,
          order_index: link.order_index,
        }))
      );

      const assignmentIds = new Map<string, string>();
      for (const assignment of seedAssignments) {
        const [row] = await tx
          .insert(assignments)
          .values({
            lesson_id: itemIds.get(assignment.lessonItemKey),
            title: assignment.title,
            max_score: assignment.max_score,
            allowed_attempts: assignment.allowed_attempts,
          })
          .returning({ id: assignments.id });
        assignmentIds.set(assignment.key, row.id);
      }

      await tx.insert(assignmentSubmissions).values(
        seedAssignmentSubmissions.map((submission) => ({
          assignment_id: assignmentIds.get(submission.assignmentKey)!,
          user_id: userIds.get(submission.userKey)!,
          file_url: submission.file_url,
          status: submission.status,
        }))
      );

      const quizIds = new Map<string, string>();
      for (const quiz of seedQuizzes) {
        const [row] = await tx
          .insert(quizzes)
          .values({
            moduel_item_id: itemIds.get(quiz.moduleItemKey),
            title: quiz.title,
            duration_min: quiz.duration_min,
            total_marks: quiz.total_marks,
            passing_marks: quiz.passing_marks,
            max_attempts: quiz.max_attempts,
          })
          .returning({ id: quizzes.id });
        quizIds.set(quiz.key, row.id);
      }

      const testIds = new Map<string, string>();
      for (const test of seedTests) {
        const [row] = await tx
          .insert(tests)
          .values({
            module_item_id: itemIds.get(test.moduleItemKey),
            title: test.title,
            duration_min: test.duration_min,
            total_marks: test.total_marks,
            passing_marks: test.passing_marks,
            max_attempts: test.max_attempts,
          })
          .returning({ id: tests.id });
        testIds.set(test.key, row.id);
      }

      await tx.insert(testAttempts).values(
        seedTestAttempts.map((attempt) => ({
          test_id: testIds.get(attempt.testKey)!,
          user_id: userIds.get(attempt.userKey)!,
          status: attempt.status,
          score: attempt.score,
          answers: attempt.answers,
        }))
      );

      for (const question of seedQuestions) {
        await tx.insert(questions).values({
          quiz_id: quizIds.get(question.quizKey)!,
          question_text: question.question_text,
          type: question.type,
          options: question.options,
          correct_answer: question.correct_answer,
          marks: question.marks,
        });
      }

      await tx.insert(carts).values(
        seedCarts.map((cart) => ({ user_id: userIds.get(cart.userKey)! }))
      );

      const couponIds = new Map<string, string>();
      for (const coupon of seedCoupons) {
        const [row] = await tx
          .insert(coupons)
          .values({
            code: coupon.code,
            discount_type: coupon.discount_type,
            value: coupon.value,
            max_uses: coupon.max_uses,
            used_count: coupon.used_count,
            valid_from: new Date(coupon.valid_from),
            valid_to: new Date(coupon.valid_to),
          })
          .returning({ id: coupons.id });
        couponIds.set(coupon.key, row.id);
      }

      await tx.insert(enrollments).values(
        seedEnrollments.map((enrollment) => ({
          user_id: userIds.get(enrollment.userKey)!,
          course_id: courseIds.get(enrollment.courseKey)!,
          expiry_at: enrollment.expiry_at ? new Date(enrollment.expiry_at) : null,
          progress_percent: enrollment.progress_percent,
          status: enrollment.status,
        }))
      );

      const orderIds = new Map<string, string>();
      for (const order of seedOrders) {
        const [row] = await tx
          .insert(orders)
          .values({
            user_id: userIds.get(order.userKey)!,
            razorpay_order_id: order.razorpay_order_id,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            coupon_id: order.couponKey ? couponIds.get(order.couponKey) : null,
          })
          .returning({ id: orders.id });
        orderIds.set(order.key, row.id);
      }

      await tx.insert(orderItems).values(
        seedOrderItems.map((item) => ({
          order_id: orderIds.get(item.orderKey)!,
          course_id: courseIds.get(item.courseKey)!,
          price_at_purchase: item.price_at_purchase,
        }))
      );

      for (const payment of seedPayments) {
        await tx.insert(payments).values({
          order_id: orderIds.get(payment.orderKey)!,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          method: payment.method,
          status: payment.status,
        });
      }

      await tx.insert(certificates).values(
        seedCertificates.map((certificate) => ({
          user_id: userIds.get(certificate.userKey)!,
          course_id: courseIds.get(certificate.courseKey)!,
          certificate_url: certificate.certificate_url,
        }))
      );

      await tx.insert(reviews).values(
        seedReviews.map((review) => ({
          user_id: userIds.get(review.userKey)!,
          course_id: courseIds.get(review.courseKey)!,
          rating: review.rating,
          comment: review.comment,
        }))
      );
    });

    console.log("Seed data inserted successfully.");
    console.log(
      `Users: ${seedUsers.length}, Categories: ${seedCategories.length}, Courses: ${seedCourses.length}, Modules: ${seedModules.length}, Lessons: ${seedModuleItems.length}, LessonLinks: ${seedModuleLessons.length}, Assignments: ${seedAssignments.length}, Submissions: ${seedAssignmentSubmissions.length}, Quizzes: ${seedQuizzes.length}, Tests: ${seedTests.length}, Questions: ${seedQuestions.length}, TestAttempts: ${seedTestAttempts.length}, Carts: ${seedCarts.length}, Coupons: ${seedCoupons.length}, Enrollments: ${seedEnrollments.length}, Orders: ${seedOrders.length}, OrderItems: ${seedOrderItems.length}, Payments: ${seedPayments.length}, Certificates: ${seedCertificates.length}, Reviews: ${seedReviews.length}`
    );
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
