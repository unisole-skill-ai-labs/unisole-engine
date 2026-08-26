import { eq } from "drizzle-orm";
import { db } from "../db";
import { colleges, College, NewCollege } from "../db/schema";

export const collegesRepository = {
  async list(): Promise<College[]> {
    return db.select().from(colleges);
  },

  async getById(id: string): Promise<College | null> {
    const rows = await db.select().from(colleges).where(eq(colleges.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<College | null> {
    const rows = await db.select().from(colleges).where(eq(colleges.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewCollege): Promise<College> {
    const rows = await db.insert(colleges).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewCollege, "id">>): Promise<College | null> {
    const rows = await db
      .update(colleges)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(colleges.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<College | null> {
    const rows = await db.delete(colleges).where(eq(colleges.id, id)).returning();
    return rows[0] ?? null;
  },
};
