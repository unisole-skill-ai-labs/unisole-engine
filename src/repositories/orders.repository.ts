import { eq } from "drizzle-orm";
import { db } from "../db";
import { Order, NewOrder, orders } from "../db/schema";

export const ordersRepository = {
  async list(): Promise<Order[]> {
    return await db.select().from(orders);
  },
  async getById(id: string): Promise<Order | undefined> {
    const rows = await db.select().from(orders).where(eq(orders.id, id));
    return rows[0];
  },
  async create(values: NewOrder): Promise<Order> {
    const rows = await db.insert(orders).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewOrder>): Promise<Order | undefined> {
    const rows = await db
      .update(orders)
      .set(values)
      .where(eq(orders.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Order | undefined> {
    const rows = await db.delete(orders).where(eq(orders.id, id)).returning();
    return rows[0];
  },
};
