import { eq } from "drizzle-orm";
import { db } from "../db";
import { Cart, NewCart, carts } from "../db/schema";

export const cartsRepository = {
  async list(): Promise<Cart[]> {
    return await db.select().from(carts);
  },
  async getById(id: string): Promise<Cart | undefined> {
    const rows = await db.select().from(carts).where(eq(carts.id, id));
    return rows[0];
  },
  async create(values: NewCart): Promise<Cart> {
    const rows = await db.insert(carts).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewCart>): Promise<Cart | undefined> {
    const rows = await db
      .update(carts)
      .set(values)
      .where(eq(carts.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Cart | undefined> {
    const rows = await db.delete(carts).where(eq(carts.id, id)).returning();
    return rows[0];
  },
};
