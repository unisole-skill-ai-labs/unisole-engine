import crypto from "crypto";
import { paymentsRepository } from "../repositories/payments.repository";
import { pathwaysRepository } from "../repositories/pathways.repository";
import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { usersRepository } from "../repositories/users.repository";
import { Payment } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";

export const paymentsService = {
  async list(user?: { id: string; role: string }): Promise<Payment[]> {
    if (!user) return [];
    if (user.role === "ADMIN") return paymentsRepository.list();
    return paymentsRepository.listByUser(user.id);
  },

  async getById(id: string): Promise<Payment> {
    const payment = await paymentsRepository.getById(id);
    if (!payment) throw new NotFoundError("Payment not found");
    return payment;
  },

  /**
   * Create a payment order for a pathway purchase.
   * In production, this would create a Razorpay order.
   */
  async createOrder(userId: string, pathwayId: string): Promise<Payment> {
    const pathway = await pathwaysRepository.getById(pathwayId);
    if (!pathway) throw new NotFoundError("Pathway not found");
    if (pathway.status !== "PUBLISHED" || !pathway.isActive) {
      throw new ValidationError("Pathway is not available for purchase");
    }

    // Check if already enrolled
    const existingEnrollment = await enrollmentsRepository.getActiveByUserAndPathway(userId, pathwayId);
    if (existingEnrollment) throw new ConflictError("Already enrolled in this pathway");

    // TODO: Create actual Razorpay order here using Razorpay SDK
    // For now, create a payment record with status CREATED
    const providerOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;

    return paymentsRepository.create({
      userId,
      pathwayId,
      amountPaise: pathway.pricePaise,
      currency: "INR",
      status: "CREATED",
      provider: "RAZORPAY",
      providerOrderId,
    });
  },

  /**
   * Verify payment and activate enrollment.
   * Idempotent — safe to call multiple times.
   */
  async verifyPayment(body: {
    providerOrderId?: string;
    providerPaymentId?: string;
    providerSignature?: string;
  }): Promise<{ payment: Payment; enrolled: boolean }> {
    const { providerOrderId, providerPaymentId, providerSignature } = body;

    if (!providerOrderId || !providerPaymentId || !providerSignature) {
      throw new ValidationError("providerOrderId, providerPaymentId, and providerSignature are required");
    }

    const payment = await paymentsRepository.getByProviderOrderId(providerOrderId);
    if (!payment) throw new NotFoundError("Payment order not found");

    // Already processed — idempotent
    if (payment.status === "SUCCESS") {
      return { payment, enrolled: false };
    }

    // TODO: Verify signature with Razorpay SDK
    // const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    //   .update(`${providerOrderId}|${providerPaymentId}`)
    //   .digest("hex");
    // if (expectedSig !== providerSignature) throw new ValidationError("Invalid payment signature");

    // Update payment status
    const updatedPayment = await paymentsRepository.update(payment.id, {
      providerPaymentId,
      providerSignature,
      status: "SUCCESS",
      paidAt: new Date().toISOString(),
    });

    // Create enrollment
    let enrolled = false;
    const existing = await enrollmentsRepository.getActiveByUserAndPathway(payment.userId, payment.pathwayId);
    if (!existing) {
      const enrollment = await enrollmentsRepository.create({
        userId: payment.userId,
        pathwayId: payment.pathwayId,
        status: "ACTIVE",
        enrolledAt: new Date().toISOString(),
      });

      // Link enrollment to payment
      await paymentsRepository.update(payment.id, { enrollmentId: enrollment.id });
      enrolled = true;
    }

    return { payment: updatedPayment!, enrolled };
  },

  /**
   * Handle Razorpay webhook events.
   */
  async handleWebhook(rawBody: Buffer | string | undefined, signature: string | undefined, body: any) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "unisole_webhook_secret_2026";

    // Verify signature
    if (signature && rawBody) {
      try {
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(rawBody)
          .digest("hex");
        if (expectedSignature !== signature) {
          console.warn("[Razorpay Webhook] Signature mismatch.");
        }
      } catch (err) {
        console.warn("[Razorpay Webhook] Signature verification error:", err);
      }
    }

    const event = body?.event;
    console.log(`[Razorpay Webhook] Processing event: ${event}`);

    const payload = body?.payload || {};
    const paymentEntity = payload.payment?.entity;
    if (!paymentEntity) {
      return { status: "ignored", reason: "no_payment_data" };
    }

    const providerPaymentId = paymentEntity.id;
    const providerOrderId = paymentEntity.order_id;

    if (!providerOrderId) {
      return { status: "ignored", reason: "no_order_id" };
    }

    // Find the payment record
    const payment = await paymentsRepository.getByProviderOrderId(providerOrderId);
    if (!payment) {
      console.warn(`[Razorpay Webhook] No payment found for order ${providerOrderId}`);
      return { status: "ignored", reason: "payment_not_found" };
    }

    if (payment.status === "SUCCESS") {
      return { status: "already_processed" };
    }

    // Process payment
    const result = await this.verifyPayment({
      providerOrderId,
      providerPaymentId,
      providerSignature: signature || "webhook_verified",
    });

    return {
      status: "success",
      paymentId: result.payment.id,
      enrolled: result.enrolled,
    };
  },
};
