import { eq } from "drizzle-orm";
import { db } from "../db";
import { categories, Category, NewCategory } from "../db/schema";

export const categoriesRepository = {
  async list(): Promise<Category[]> {
    return db.select().from(categories);
  },

  async getById(id: string): Promise<Category | null> {
    const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewCategory): Promise<Category> {
    const rows = await db.insert(categories).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewCategory, "id">>): Promise<Category | null> {
    const rows = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(categories.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Category | null> {
    const rows = await db.delete(categories).where(eq(categories.id, id)).returning();
    return rows[0] ?? null;
  },
};
