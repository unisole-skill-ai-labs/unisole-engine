import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { coupons, Coupon, NewCoupon } from "../db/schema";

export const couponsRepository = {
  async listAll(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  },

  async getById(id: string): Promise<Coupon | null> {
    const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getByCode(code: string): Promise<Coupon | null> {
    const rows = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.trim().toUpperCase()))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewCoupon): Promise<Coupon> {
    const [row] = await db
      .insert(coupons)
      .values({
        ...data,
        code: data.code.trim().toUpperCase(),
      })
      .returning();
    return row;
  },

  async update(id: string, data: Partial<Omit<NewCoupon, "id">>): Promise<Coupon | null> {
    const payload = { ...data };
    if (payload.code) {
      payload.code = payload.code.trim().toUpperCase();
    }
    const [row] = await db
      .update(coupons)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(coupons.id, id))
      .returning();
    return row ?? null;
  },

  async incrementUsage(id: string): Promise<Coupon | null> {
    const [row] = await db
      .update(coupons)
      .set({
        usedCount: sql`${coupons.usedCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(coupons.id, id))
      .returning();
    return row ?? null;
  },

  async remove(id: string): Promise<Coupon | null> {
    const [row] = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    return row ?? null;
  },
};

