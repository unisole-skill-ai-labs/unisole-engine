import { eq } from "drizzle-orm";
import { db } from "../db";
import { Coupon, NewCoupon, coupons } from "../db/schema";

export const couponsRepository = {
  async list(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  },
  async getById(id: string): Promise<Coupon | undefined> {
    const rows = await db.select().from(coupons).where(eq(coupons.id, id));
    return rows[0];
  },
  async create(values: NewCoupon): Promise<Coupon> {
    const rows = await db.insert(coupons).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewCoupon>): Promise<Coupon | undefined> {
    const rows = await db
      .update(coupons)
      .set(values)
      .where(eq(coupons.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Coupon | undefined> {
    const rows = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    return rows[0];
  },
};
