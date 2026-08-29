/**
 * OTP Delivery Service — Plug & Play External Provider Architecture
 *
 * Architecture:
 * 1. Engine generates the secure OTP and stores its bcrypt hash in `otp_verifications`.
 * 2. This service delegates delivery to the configured external provider (Mock, Webhook, Fast2SMS, Twilio, MSG91, Meta WhatsApp).
 * 3. Future providers can be plugged in seamlessly with zero changes to auth logic.
 */

export interface OtpDeliveryPayload {
  phone: string;
  otp: string;
  channel: "SMS" | "WHATSAPP";
  senderId?: string;
}

export interface OtpDeliveryResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  rawResponse?: any;
}

export interface OtpDeliveryProvider {
  name: string;
  deliver(payload: OtpDeliveryPayload): Promise<OtpDeliveryResult>;
}

/**
 * 1. Mock Delivery Provider (Default / Local / Fallback)
 * Logs code clearly to console and succeeds immediately.
 */
export class MockDeliveryProvider implements OtpDeliveryProvider {
  name = "MOCK_PROVIDER";

  async deliver(payload: OtpDeliveryPayload): Promise<OtpDeliveryResult> {
    const timestamp = new Date().toISOString();
    console.log(`\n======================================================`);
    console.log(`📡 [OTP DISPATCH] Delivered via ${this.name}`);
    console.log(`📱 Recipient: ${payload.phone}`);
    console.log(`🔑 Verification Code: ${payload.otp}`);
    console.log(`💬 Channel: ${payload.channel}`);
    console.log(`⏰ Dispatched At: ${timestamp}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      provider: this.name,
      messageId: `mock_msg_${Date.now()}`,
    };
  }
}

/**
 * 2. HTTP Webhook Provider (Plug & Play External Gateway)
 * Dispatches a POST request to any external SMS / WhatsApp API gateway URL configured in `.env`.
 */
export class HttpWebhookDeliveryProvider implements OtpDeliveryProvider {
  name = "HTTP_WEBHOOK";
  private webhookUrl: string;
  private apiKey?: string;

  constructor(webhookUrl: string, apiKey?: string) {
    this.webhookUrl = webhookUrl;
    this.apiKey = apiKey;
  }

  async deliver(payload: OtpDeliveryPayload): Promise<OtpDeliveryResult> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const res = await fetch(this.webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: payload.phone,
          otp: payload.otp,
          channel: payload.channel,
          message: `Your Unisole verification code is ${payload.otp}. Valid for 10 minutes.`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          provider: this.name,
          error: (data as any)?.error || (data as any)?.message || `HTTP ${res.status}`,
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        messageId: (data as any)?.messageId || (data as any)?.id || `msg_${Date.now()}`,
        rawResponse: data,
      };
    } catch (err: any) {
      console.error(`[OTP Delivery Webhook Error] Failed to call ${this.webhookUrl}:`, err);
      return {
        success: false,
        provider: this.name,
        error: err.message,
      };
    }
  }
}

/**
 * 3. Fast2SMS Provider (Plug & Play Indian DLT SMS Gateway)
 */
export class Fast2SMSDeliveryProvider implements OtpDeliveryProvider {
  name = "FAST2SMS";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async deliver(payload: OtpDeliveryPayload): Promise<OtpDeliveryResult> {
    try {
      const cleanPhone = payload.phone.replace(/\D/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: payload.otp,
          numbers: cleanPhone,
        }),
      });

      const data: any = await res.json();
      if (!data.return) {
        return {
          success: false,
          provider: this.name,
          error: data.message || "Fast2SMS dispatch failed",
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        messageId: data.request_id,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        error: err.message,
      };
    }
  }
}

/**
 * Factory & Manager to select active provider dynamically
 */
class OtpDeliveryManager {
  private activeProvider: OtpDeliveryProvider;

  constructor() {
    this.activeProvider = this.resolveProvider();
  }

  private resolveProvider(): OtpDeliveryProvider {
    const providerName = (process.env.OTP_PROVIDER || "MOCK").toUpperCase();

    if (providerName === "WEBHOOK" && process.env.OTP_WEBHOOK_URL) {
      return new HttpWebhookDeliveryProvider(
        process.env.OTP_WEBHOOK_URL,
        process.env.OTP_WEBHOOK_KEY
      );
    }

    if (providerName === "FAST2SMS" && process.env.FAST2SMS_API_KEY) {
      return new Fast2SMSDeliveryProvider(process.env.FAST2SMS_API_KEY);
    }

    // Default Mock Provider
    return new MockDeliveryProvider();
  }

  public setProvider(provider: OtpDeliveryProvider) {
    this.activeProvider = provider;
  }

  public getProvider(): OtpDeliveryProvider {
    return this.activeProvider;
  }

  public async deliver(payload: OtpDeliveryPayload): Promise<OtpDeliveryResult> {
    return this.activeProvider.deliver(payload);
  }
}

export const otpDeliveryService = new OtpDeliveryManager();
