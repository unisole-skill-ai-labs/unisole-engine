import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export const razorpayClient = (keyId && keySecret)
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

export const razorpayService = {
  getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "";
  },

  isConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  },

  /**
   * Create an official Razorpay order.
   * If Razorpay keys are not configured, falls back to a deterministic development order ID.
   */
  async createOrder(params: {
    amountPaise: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, any>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    const { amountPaise, currency = "INR", receipt, notes = {} } = params;

    if (razorpayClient) {
      try {
        const order = await razorpayClient.orders.create({
          amount: amountPaise,
          currency,
          receipt,
          notes: {
            ...notes,
            source: "unisole_engine",
          },
        });
        return {
          id: order.id,
          amount: Number(order.amount),
          currency: order.currency,
        };
      } catch (error: any) {
        console.error("[RazorpayService] Order creation error:", error);
        throw new Error(error?.error?.description || error?.message || "Failed to create Razorpay order");
      }
    }

    // Fallback for offline/local development without keys
    console.warn("[RazorpayService] Warning: Razorpay keys not configured. Generating mock order ID.");
    return {
      id: `order_${crypto.randomBytes(8).toString("hex")}`,
      amount: amountPaise,
      currency,
    };
  },

  /**
   * Verify checkout HMAC signature from Razorpay Modal.
   */
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return true; // dev bypass if no secret set

    try {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest("hex");

      return generatedSignature === params.signature;
    } catch (err) {
      console.error("[RazorpayService] Signature verification exception:", err);
      return false;
    }
  },

  /**
   * Verify Razorpay Webhook signature
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
    if (!webhookSecret) return true;

    try {
      const generatedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      return generatedSignature === signature;
    } catch (err) {
      console.error("[RazorpayService] Webhook signature verification exception:", err);
      return false;
    }
  },
};
