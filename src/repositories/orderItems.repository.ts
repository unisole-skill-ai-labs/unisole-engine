import { eq } from "drizzle-orm";
import { db } from "../db";
import { OrderItem, NewOrderItem, orderItems } from "../db/schema";

export const orderItemsRepository = {
  async list(): Promise<OrderItem[]> {
    return await db.select().from(orderItems);
  },
  async getById(id: string): Promise<OrderItem | undefined> {
    const rows = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return rows[0];
  },
  async create(values: NewOrderItem): Promise<OrderItem> {
    const rows = await db.insert(orderItems).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewOrderItem>): Promise<OrderItem | undefined> {
    const rows = await db
      .update(orderItems)
      .set(values)
      .where(eq(orderItems.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<OrderItem | undefined> {
    const rows = await db.delete(orderItems).where(eq(orderItems.id, id)).returning();
    return rows[0];
  },
};
