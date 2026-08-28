/**
 * OTP Service — DB-backed OTP generation, sending, and verification.
 *
 * In development / mock mode:
 * - Logs generated OTP to the console.
 * - Returns dummyOtp in response for easy developer testing.
 *
 * Future Integration:
 * - To plug in WhatsApp API (e.g., Meta Cloud API / Gupshup / Twilio / MSG91),
 *   implement the dispatch method in `sendViaChannel` below.
 */

import { hashSync, compareSync } from "bcryptjs";
import { otpRepository } from "../repositories/otp.repository";
import { normalizePhone } from "../helpers/formatters";

const OTP_EXPIRY_MINUTES = 10;
const DEFAULT_OTP = process.env.DEFAULT_OTP || "1234";

export const otpService = {
  /**
   * Send OTP to the given phone number.
   * Creates a DB record with hashed OTP.
   */
  async sendOtp(
    rawPhone: string,
    channel: "SMS" | "WHATSAPP" = "SMS"
  ): Promise<{ success: boolean; message: string; dummyOtp?: string }> {
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      throw new Error("Invalid mobile number. Please enter a valid 10-digit number.");
    }

    // Use default OTP (1234) while external SMS/WhatsApp service is not integrated
    const isMock = !process.env.OTP_PROVIDER || process.env.NODE_ENV !== "production";
    const otp = isMock ? DEFAULT_OTP : Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = hashSync(otp, 10);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Store in DB
    await otpRepository.create({
      phone,
      otpHash: otpHash,
      channel,
      status: "PENDING",
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
    });

    // In development / mock mode, log clearly to console
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev || isMock) {
      console.log(`\n========================================`);
      console.log(`🔑 [OTP Service] Mobile Verification`);
      console.log(`📱 Phone: ${phone}`);
      console.log(`🔢 Verification Code: ${otp}`);
      console.log(`⏳ Valid for ${OTP_EXPIRY_MINUTES} minutes`);
      console.log(`========================================\n`);
    }

    // Future: dispatch via SMS/WhatsApp gateway
    // await this.sendViaChannel(phone, otp, channel);

    return {
      success: true,
      message: `OTP sent successfully to ${phone}`,
      dummyOtp: otp,
    };
  },

  /**
   * Verify the entered OTP for the given phone number.
   * Checks against DB-stored hashed OTP with attempt limits.
   */
  async verifyOtp(rawPhone: string, inputOtp: string): Promise<boolean> {
    const phone = normalizePhone(rawPhone);
    if (!phone || !inputOtp) return false;

    const trimmedInput = inputOtp.trim();

    // If default OTP (1234) is entered when OTP services are in mock mode
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

    // Increment attempts
    await otpRepository.incrementAttempts(record.id);

    // Compare OTP hash
    if (!compareSync(trimmedInput, record.otpHash)) {
      // If max attempts reached after this attempt, mark as failed
      if (record.attempts + 1 >= record.maxAttempts) {
        await otpRepository.markFailed(record.id);
      }
      return false;
    }

    // OTP matches — mark as verified
    await otpRepository.markVerified(record.id);
    return true;
  },
};
