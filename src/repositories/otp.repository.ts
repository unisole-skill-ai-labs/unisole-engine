import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { otpVerifications, OtpVerification, NewOtpVerification } from "../db/schema";

export const otpRepository = {
  async create(data: NewOtpVerification): Promise<OtpVerification> {
    const rows = await db.insert(otpVerifications).values(data).returning();
    return rows[0];
  },

  async findLatestPendingByPhone(phone: string): Promise<OtpVerification | null> {
    const rows = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phone, phone),
          eq(otpVerifications.status, "PENDING"),
          sql`${otpVerifications.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);
    return rows[0] ?? null;
  },

  async incrementAttempts(id: string): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ attempts: sql`${otpVerifications.attempts} + 1` })
      .where(eq(otpVerifications.id, id));
  },

  async markVerified(id: string): Promise<void> {
    await db
      .update(otpVerifications)
      .set({
        status: "VERIFIED",
        verifiedAt: new Date().toISOString(),
      })
      .where(eq(otpVerifications.id, id));
  },

  async markFailed(id: string): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ status: "FAILED" })
      .where(eq(otpVerifications.id, id));
  },

  async markExpired(id: string): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ status: "EXPIRED" })
      .where(eq(otpVerifications.id, id));
  },
};
