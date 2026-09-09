import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { payments, Payment, NewPayment, users } from "../db/schema";

export const paymentsRepository = {
  async list(): Promise<(Payment & { userName?: string | null; userPhone?: string | null })[]> {
    const rows = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        orderId: payments.orderId,
        enrollmentId: payments.enrollmentId,
        pathwayId: payments.pathwayId,
        itemType: payments.itemType,
        itemId: payments.itemId,
        amountPaise: payments.amountPaise,
        currency: payments.currency,
        status: payments.status,
        provider: payments.provider,
        providerOrderId: payments.providerOrderId,
        providerPaymentId: payments.providerPaymentId,
        providerSignature: payments.providerSignature,
        failureReason: payments.failureReason,
        metadata: payments.metadata,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        userName: users.name,
        userPhone: users.phone,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt));
    return rows as any;
  },

  async getById(id: string): Promise<Payment | null> {
    const rows = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async listByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId));
  },

  async getByProviderOrderId(providerOrderId: string): Promise<Payment | null> {
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.providerOrderId, providerOrderId))
      .limit(1);
    return rows[0] ?? null;
  },

  async getByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.providerPaymentId, providerPaymentId))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewPayment): Promise<Payment> {
    const rows = await db.insert(payments).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewPayment, "id">>): Promise<Payment | null> {
    const rows = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(payments.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
