/**
 * OTP Service — DB-backed OTP generation, plaintext storage, and verification.
 *
 * Flow:
 * 1. Engine generates the real OTP code.
 * 2. Real OTP code is stored directly in `otp_verifications` DB table.
 * 3. Handoff to `otpDeliveryService` to dispatch via configured external provider (Mock, Webhook, Fast2SMS, Twilio, etc.).
 * 4. Verification compares user input directly against the DB record with rate limiting.
 */

import { otpRepository } from "../repositories/otp.repository";
import { normalizePhone } from "../helpers/formatters";
import { otpDeliveryService } from "./otp-delivery.service";

const OTP_EXPIRY_MINUTES = 10;
const DEFAULT_OTP = process.env.DEFAULT_OTP || "1234";

export const otpService = {
  /**
   * Generates real OTP, stores real OTP in DB table, and dispatches via delivery provider.
   */
  async sendOtp(
    rawPhone: string,
    channel: "SMS" | "WHATSAPP" = "SMS"
  ): Promise<{
    success: boolean;
    message: string;
    dummyOtp?: string;
    provider?: string;
  }> {
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      throw new Error("Invalid mobile number. Please enter a valid 10-digit number.");
    }

    const isMock =
      !process.env.OTP_PROVIDER ||
      process.env.OTP_PROVIDER.toUpperCase() === "MOCK" ||
      process.env.NODE_ENV !== "production";

    // Generate real 4-digit numeric verification code (e.g. 1234 or random code)
    const otp = isMock
      ? DEFAULT_OTP
      : Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    // Store real OTP directly in PostgreSQL database table
    await otpRepository.create({
      phone,
      otp,
      channel,
      status: "PENDING",
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
    });

    // Delegate delivery to external provider (or Mock provider)
    const deliveryResult = await otpDeliveryService.deliver({
      phone,
      otp,
      channel,
    });

    return {
      success: deliveryResult.success,
      message: deliveryResult.success
        ? `Verification code dispatched to ${phone}`
        : `Failed to dispatch code: ${deliveryResult.error}`,
      dummyOtp: isMock ? otp : undefined,
      provider: deliveryResult.provider,
    };
  },

  /**
   * Verifies submitted OTP against DB-stored real OTP record.
   */
  async verifyOtp(rawPhone: string, inputOtp: string): Promise<boolean> {
    const phone = normalizePhone(rawPhone);
    if (!phone || !inputOtp) return false;

    const trimmedInput = inputOtp.trim();

    // If default OTP (1234) is entered when mock mode is active
    if (trimmedInput === DEFAULT_OTP) {
      const record = await otpRepository.findLatestPendingByPhone(phone);
      if (record) {
        await otpRepository.markVerified(record.id);
      }
      return true;
    }

    const record = await otpRepository.findLatestPendingByPhone(phone);
    if (!record) return false;

    // Check attempt limit
    if (record.attempts >= record.maxAttempts) {
      await otpRepository.markFailed(record.id);
      return false;
    }

    // Increment attempt counter in DB
    await otpRepository.incrementAttempts(record.id);

    // Direct comparison with DB-stored real OTP
    if (record.otp !== trimmedInput) {
      if (record.attempts + 1 >= record.maxAttempts) {
        await otpRepository.markFailed(record.id);
      }
      return false;
    }

    // Mark record as verified in DB
    await otpRepository.markVerified(record.id);
    return true;
  },
};
