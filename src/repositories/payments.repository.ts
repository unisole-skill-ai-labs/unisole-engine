import { eq } from "drizzle-orm";
import { db } from "../db";
import { Payment, NewPayment, payments } from "../db/schema";

export const paymentsRepository = {
  async list(): Promise<Payment[]> {
    return await db.select().from(payments);
  },
  async getById(id: string): Promise<Payment | undefined> {
    const rows = await db.select().from(payments).where(eq(payments.id, id));
    return rows[0];
  },
  async create(values: NewPayment): Promise<Payment> {
    const rows = await db.insert(payments).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewPayment>): Promise<Payment | undefined> {
    const rows = await db
      .update(payments)
      .set(values)
      .where(eq(payments.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Payment | undefined> {
    const rows = await db.delete(payments).where(eq(payments.id, id)).returning();
    return rows[0];
  },
};
