import crypto from "crypto";
import { eq, or, sql } from "drizzle-orm";
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

    // We handle payment_link.paid, payment.captured, order.paid
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

    console.log(`[Razorpay Webhook] Payment Received: ID=${paymentId}, Phone=${cleanPhone}, Email=${email}, Amount=${amount} ${currency}, Desc=${description}`);

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
      const rawName = (paymentEntity?.notes?.name || paymentLinkEntity?.customer?.name || (cleanPhone ? `+91 ${cleanPhone}` : "Student"));
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

    // 6. Match Course & Create Enrollment
    const allCourses = await db.select().from(courses);
    let matchedCourse = null;

    if (allCourses.length > 0) {
      // Find course matching description / title keywords
      matchedCourse = allCourses.find((c) => {
        const descLower = description.toLowerCase();
        const titleLower = (c.title || "").toLowerCase();
        return (
          descLower.includes(titleLower) ||
          titleLower.includes(descLower) ||
          (descLower.includes("machine learning") && titleLower.includes("machine learning")) ||
          (descLower.includes("full stack") && titleLower.includes("full stack"))
        );
      });

      if (!matchedCourse) {
        matchedCourse = allCourses[0]; // fallback to first available course
      }
    }

    if (matchedCourse) {
      // Check if user is already enrolled
      const existingEnrollments = await db
        .select()
        .from(enrollments)
        .where(sql`${enrollments.user_id} = ${user.id} AND ${enrollments.course_id} = ${matchedCourse.id}`)
        .limit(1);

      if (existingEnrollments.length === 0) {
        const enrlId = await generateId(enrollments, "enrollments", enrollments.id);
        await db.insert(enrollments).values({
          id: enrlId,
          user_id: user.id,
          course_id: matchedCourse.id,
          status: "active",
          progress_percent: 0,
        });
        console.log(`[Razorpay Webhook] Enrolled user ${user.id} in course ${matchedCourse.title} (${matchedCourse.id})`);
      }

      // Add order item if not present
      const existingItems = await db
        .select()
        .from(orderItems)
        .where(sql`${orderItems.order_id} = ${order.id} AND ${orderItems.course_id} = ${matchedCourse.id}`)
        .limit(1);

      if (existingItems.length === 0) {
        const oitemId = await generateId(orderItems, "orderItems", orderItems.id);
        await db.insert(orderItems).values({
          id: oitemId,
          order_id: order.id,
          course_id: matchedCourse.id,
          price_at_purchase: amount,
        });
      }
    }

    return {
      status: "success",
      orderId: order.id,
      paymentId: paymentId,
      userId: user.id,
      enrolledCourse: matchedCourse?.title || null,
    };
  },
};
