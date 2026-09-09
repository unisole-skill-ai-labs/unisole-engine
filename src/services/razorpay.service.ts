import Razorpay from "razorpay";
import crypto from "crypto";

const DEFAULT_KEY_ID = "rzp_live_TZ6USoYRgfUZsQ";
const DEFAULT_KEY_SECRET = "qA2dxVKo42d4n9rHrDKYujUh";

function getClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID || DEFAULT_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;

  if (keyId && keySecret) {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return null;
}

export const razorpayService = {
  getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || DEFAULT_KEY_ID;
  },

  getKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;
  },

  isConfigured(): boolean {
    return true;
  },

  /**
   * Create an official Razorpay order with active credentials.
   */
  async createOrder(params: {
    amountPaise: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, any>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    const { amountPaise, currency = "INR", receipt, notes = {} } = params;
    const client = getClient();

    if (client) {
      try {
        const order = await client.orders.create({
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

    // Fallback for offline simulation
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
    const secret = this.getKeySecret();
    if (!secret) return true;

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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || this.getKeySecret();
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
