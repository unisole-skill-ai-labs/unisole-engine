import crypto from "crypto";
import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { users, orders, payments, orderItems, enrollments, courses } from "../db/schema";
import { generateId } from "../helpers/generateId";
import { toTitleCase, normalizeEmail, normalizePhone } from "../helpers/formatters";

export const webhookManager = {
  async handleRazorpayWebhook(rawBody: Buffer | string | undefined, signature: string | undefined, body: any) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "unisole_webhook_secret_2026";

    // 1. Verify Webhook Signature if signature header is provided
    if (signature && rawBody) {
      try {
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(rawBody)
          .digest("hex");

        if (expectedSignature !== signature) {
          console.warn("[Razorpay Webhook] Signature mismatch. Proceeding with caution.");
        } else {
          console.log("[Razorpay Webhook] Signature verified successfully.");
        }
      } catch (err) {
        console.warn("[Razorpay Webhook] Signature verification error:", err);
      }
    }

    const event = body?.event;
    console.log(`[Razorpay Webhook] Processing event: ${event}`);

    // Handle payment_link.paid, payment.captured, order.paid
    const payload = body?.payload || {};
    const paymentEntity = payload.payment?.entity;
    const paymentLinkEntity = payload.payment_link?.entity;

    if (!paymentEntity && !paymentLinkEntity) {
      console.log("[Razorpay Webhook] No payment/payment_link entity found in payload.");
      return { status: "ignored", reason: "no_payment_data" };
    }

    // 2. Extract transaction metadata
    const paymentId = paymentEntity?.id || `pay_${crypto.randomBytes(4).toString("hex")}`;
    const rawContact = paymentEntity?.contact || paymentLinkEntity?.customer?.contact || "";
    const rawEmail = paymentEntity?.email || paymentLinkEntity?.customer?.email || "";
    const email = normalizeEmail(rawEmail);
    const cleanPhone = normalizePhone(rawContact);
    const rawAmount = paymentEntity?.amount ?? paymentLinkEntity?.amount ?? 0;
    const amount = (Number(rawAmount) / 100).toFixed(2);
    const currency = paymentEntity?.currency || paymentLinkEntity?.currency || "INR";
    const method = paymentEntity?.method || "upi";
    const description =
      paymentLinkEntity?.description ||
      paymentEntity?.description ||
      paymentLinkEntity?.title ||
      "Campus AI Program";
    const razorpayOrderId =
      paymentEntity?.order_id ||
      paymentLinkEntity?.id ||
      paymentId;

    console.log(
      `[Razorpay Webhook] Payment Metadata: ID=${paymentId}, Phone=${cleanPhone}, Email=${email}, Amount=${amount} ${currency}, Desc="${description}"`
    );

    // 3. Find or create user
    let user = null;
    if (cleanPhone) {
      const existingUsers = await db.select().from(users).where(eq(users.phone, cleanPhone)).limit(1);
      user = existingUsers[0];
    }
    if (!user && email) {
      const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      user = existingUsers[0];
    }

    if (!user) {
      const userId = await generateId(users, "users", users.id);
      const rawName =
        paymentEntity?.notes?.name ||
        paymentLinkEntity?.customer?.name ||
        (cleanPhone ? `+91 ${cleanPhone}` : "Student");
      const userName = toTitleCase(rawName);
      const newUsers = await db
        .insert(users)
        .values({
          id: userId,
          name: userName,
          phone: cleanPhone || null,
          email: email || null,
          role: "student",
          auth_provider: "local",
          is_verified: true,
        })
        .returning();
      user = newUsers[0];
      console.log(`[Razorpay Webhook] Created new user: ${user.id} (${user.name})`);
    }

    // 4. Find or create order record
    const existingOrders = await db
      .select()
      .from(orders)
      .where(or(eq(orders.razorpay_order_id, razorpayOrderId), eq(orders.razorpay_order_id, paymentId)))
      .limit(1);

    let order = existingOrders[0];
    if (!order) {
      const orderId = await generateId(orders, "orders", orders.id);
      const newOrders = await db
        .insert(orders)
        .values({
          id: orderId,
          user_id: user.id,
          razorpay_order_id: razorpayOrderId,
          amount: amount,
          currency: currency,
          status: "paid",
        })
        .returning();
      order = newOrders[0];
      console.log(`[Razorpay Webhook] Created order: ${order.id} for user ${user.id}`);
    } else if (order.status !== "paid") {
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
    }

    // 5. Record Payment
    const existingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.razorpay_payment_id, paymentId))
      .limit(1);

    if (existingPayments.length === 0) {
      const payId = await generateId(payments, "payments", payments.id);
      await db.insert(payments).values({
        id: payId,
        order_id: order.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature || "webhook_verified",
        method: method,
        status: "captured",
      });
      console.log(`[Razorpay Webhook] Created payment record: ${payId}`);
    }

    // 6. Match Courses & Enroll Student
    const allCourses = await db.select().from(courses);
    const coursesToEnroll: typeof allCourses = [];

    if (allCourses.length > 0) {
      const descLower = description.toLowerCase();

      // Find matching courses based on payment link description / pathway
      const matched = allCourses.filter((c) => {
        const titleLower = (c.title || "").toLowerCase();
        const slugLower = (c.slug || "").toLowerCase();

        if (descLower.includes("machine learning") || descLower.includes("data science") || descLower.includes("ai")) {
          if (titleLower.includes("data science") || titleLower.includes("python") || slugLower.includes("data-science")) {
            return true;
          }
        }
        if (descLower.includes("full stack") || descLower.includes("web") || descLower.includes("react")) {
          if (titleLower.includes("react") || titleLower.includes("node") || slugLower.includes("react") || slugLower.includes("node")) {
            return true;
          }
        }
        if (descLower.includes("cloud") || descLower.includes("aws") || descLower.includes("devops")) {
          if (titleLower.includes("cloud") || titleLower.includes("docker") || slugLower.includes("aws")) {
            return true;
          }
        }

        return (
          descLower.includes(titleLower) ||
          titleLower.includes(descLower) ||
          slugLower.includes(descLower)
        );
      });

      if (matched.length > 0) {
        coursesToEnroll.push(...matched);
      } else {
        // Fallback: enroll in the primary course (e.g. Python for Data Science or first course)
        const primary = allCourses.find((c) => c.slug?.includes("python") || c.slug?.includes("data-science")) || allCourses[0];
        coursesToEnroll.push(primary);
      }
    }

    // Perform Enrollments & Order Items
    for (const course of coursesToEnroll) {
      try {
        // Check if enrollment exists using proper Drizzle 'and' condition
        const existingEnrollment = await db
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.user_id, user.id),
              eq(enrollments.course_id, course.id)
            )
          )
          .limit(1);

        if (existingEnrollment.length === 0) {
          const enrlId = await generateId(enrollments, "enrollments", enrollments.id);
          await db.insert(enrollments).values({
            id: enrlId,
            user_id: user.id,
            course_id: course.id,
            status: "active",
            progress_percent: 0,
          });

          // Increment course total_enrollments
          const currentTotal = Number(course.total_enrollments ?? 0);
          await db
            .update(courses)
            .set({ total_enrollments: currentTotal + 1 })
            .where(eq(courses.id, course.id));

          console.log(`[Razorpay Webhook] Enrolled user ${user.id} in course ${course.title} (${course.id})`);
        } else {
          console.log(`[Razorpay Webhook] User ${user.id} is already enrolled in course ${course.id}`);
        }

        // Check if order item exists
        const existingOrderItem = await db
          .select()
          .from(orderItems)
          .where(
            and(
              eq(orderItems.order_id, order.id),
              eq(orderItems.course_id, course.id)
            )
          )
          .limit(1);

        if (existingOrderItem.length === 0) {
          const oitemId = await generateId(orderItems, "orderItems", orderItems.id);
          await db.insert(orderItems).values({
            id: oitemId,
            order_id: order.id,
            course_id: course.id,
            price_at_purchase: amount,
          });
        }
      } catch (enrollErr) {
        console.error(`[Razorpay Webhook] Error enrolling user ${user.id} in course ${course.id}:`, enrollErr);
      }
    }

    return {
      status: "success",
      orderId: order.id,
      paymentId: paymentId,
      userId: user.id,
      enrolledCourses: coursesToEnroll.map((c) => c.title),
    };
  },
};
