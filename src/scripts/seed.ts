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
  modules,
  orderItems,
  orders,
  payments,
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
  seedModules,
  seedOrderItems,
  seedOrders,
  seedPayments,
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
        orders,
        carts,
        coupons,
        tests,
        assignmentSubmissions,
        assignments,
        moduleItems,
        modules,
        courses,
        categories,
        users,
      ]) {
        await tx.delete(table);
      }

      const userIds = new Map<string, string>();
      for (const { key, id, ...data } of seedUsers) {
        await tx.insert(users).values({ id, ...data });
        userIds.set(key, id);
      }

      const categoryIds = new Map<string, string>();
      for (const { key, id, ...data } of seedCategories) {
        await tx.insert(categories).values({ id, ...data });
        categoryIds.set(key, id);
      }

      const courseIds = new Map<string, string>();
      for (const course of seedCourses) {
        await tx
          .insert(courses)
          .values({
            id: course.id,
            title: course.title,
            slug: course.slug,
            category_id: categoryIds.get(course.categoryKey),
            price: course.price,
            rating_avg: course.rating_avg,
            total_enrollments: course.total_enrollments,
          });
        courseIds.set(course.key, course.id);
      }

      const moduleIds = new Map<string, string>();
      for (const module of seedModules) {
        await tx
          .insert(modules)
          .values({
            id: module.id,
            title: module.title,
            course_id: courseIds.get(module.courseKey),
            order_index: module.order_index,
          });
        moduleIds.set(module.key, module.id);
      }

      const itemIds = new Map<string, string>();
      for (const item of seedModuleItems) {
        await tx
          .insert(moduleItems)
          .values({
            id: item.id,
            module_id: moduleIds.get(item.moduleKey)!,
            title: item.title,
            type: item.type,
            content_url: item.content_url,
            content_body: item.content_body,
            order_index: item.order_index,
          });
        itemIds.set(item.key, item.id);
      }

      const assignmentIds = new Map<string, string>();
      for (const assignment of seedAssignments) {
        await tx
          .insert(assignments)
          .values({
            id: assignment.id,
            lesson_id: itemIds.get(assignment.lessonItemKey),
            title: assignment.title,
            max_score: assignment.max_score,
            allowed_attempts: assignment.allowed_attempts,
          });
        assignmentIds.set(assignment.key, assignment.id);
      }

      await tx.insert(assignmentSubmissions).values(
        seedAssignmentSubmissions.map((submission) => ({
          id: submission.id,
          assignment_id: assignmentIds.get(submission.assignmentKey)!,
          user_id: userIds.get(submission.userKey)!,
          file_url: submission.file_url,
          status: submission.status,
        }))
      );

      const testIds = new Map<string, string>();
      for (const test of seedTests) {
        await tx
          .insert(tests)
          .values({
            id: test.id,
            module_item_id: itemIds.get(test.moduleItemKey),
            title: test.title,
            duration_min: test.duration_min,
            total_marks: test.total_marks,
            passing_marks: test.passing_marks,
            max_attempts: test.max_attempts,
          });
        testIds.set(test.key, test.id);
      }

      await tx.insert(testAttempts).values(
        seedTestAttempts.map((attempt) => ({
          id: attempt.id,
          test_id: testIds.get(attempt.testKey)!,
          user_id: userIds.get(attempt.userKey)!,
          status: attempt.status,
          score: attempt.score,
          answers: attempt.answers,
        }))
      );

      await tx.insert(carts).values(
        seedCarts.map((cart) => ({ id: cart.id, user_id: userIds.get(cart.userKey)! }))
      );

      const couponIds = new Map<string, string>();
      for (const coupon of seedCoupons) {
        await tx
          .insert(coupons)
          .values({
            id: coupon.id,
            code: coupon.code,
            discount_type: coupon.discount_type,
            value: coupon.value,
            max_uses: coupon.max_uses,
            used_count: coupon.used_count,
            valid_from: new Date(coupon.valid_from),
            valid_to: new Date(coupon.valid_to),
          });
        couponIds.set(coupon.key, coupon.id);
      }

      await tx.insert(enrollments).values(
        seedEnrollments.map((enrollment) => ({
          id: enrollment.id,
          user_id: userIds.get(enrollment.userKey)!,
          course_id: courseIds.get(enrollment.courseKey)!,
          expiry_at: enrollment.expiry_at ? new Date(enrollment.expiry_at) : null,
          progress_percent: enrollment.progress_percent,
          status: enrollment.status,
        }))
      );

      const orderIds = new Map<string, string>();
      for (const order of seedOrders) {
        await tx
          .insert(orders)
          .values({
            id: order.id,
            user_id: userIds.get(order.userKey)!,
            razorpay_order_id: order.razorpay_order_id,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            coupon_id: order.couponKey ? couponIds.get(order.couponKey) : null,
          });
        orderIds.set(order.key, order.id);
      }

      await tx.insert(orderItems).values(
        seedOrderItems.map((item) => ({
          id: item.id,
          order_id: orderIds.get(item.orderKey)!,
          course_id: courseIds.get(item.courseKey)!,
          price_at_purchase: item.price_at_purchase,
        }))
      );

      for (const payment of seedPayments) {
        await tx.insert(payments).values({
          id: payment.id,
          order_id: orderIds.get(payment.orderKey)!,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          method: payment.method,
          status: payment.status,
        });
      }

      await tx.insert(certificates).values(
        seedCertificates.map((certificate) => ({
          id: certificate.id,
          user_id: userIds.get(certificate.userKey)!,
          course_id: courseIds.get(certificate.courseKey)!,
          certificate_url: certificate.certificate_url,
        }))
      );

      await tx.insert(reviews).values(
        seedReviews.map((review) => ({
          id: review.id,
          user_id: userIds.get(review.userKey)!,
          course_id: courseIds.get(review.courseKey)!,
          rating: review.rating,
          comment: review.comment,
        }))
      );
    });

    console.log("Seed data inserted successfully.");
    console.log(
      `Users: ${seedUsers.length}, Categories: ${seedCategories.length}, Courses: ${seedCourses.length}, Modules: ${seedModules.length}, Lessons: ${seedModuleItems.length}, Assignments: ${seedAssignments.length}, Submissions: ${seedAssignmentSubmissions.length}, Tests: ${seedTests.length}, TestAttempts: ${seedTestAttempts.length}, Carts: ${seedCarts.length}, Coupons: ${seedCoupons.length}, Enrollments: ${seedEnrollments.length}, Orders: ${seedOrders.length}, OrderItems: ${seedOrderItems.length}, Payments: ${seedPayments.length}, Certificates: ${seedCertificates.length}, Reviews: ${seedReviews.length}`
    );
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
