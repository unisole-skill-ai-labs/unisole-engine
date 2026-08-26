import { eq } from "drizzle-orm";
import { db } from "../db";
import { payments, Payment, NewPayment } from "../db/schema";

export const paymentsRepository = {
  async list(): Promise<Payment[]> {
    return db.select().from(payments);
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
