import { eq } from "drizzle-orm";
import { db } from "../db";
import { Category, NewCategory, categories } from "../db/schema";

export const categoriesRepository = {
  async list(): Promise<Category[]> {
    return await db.select().from(categories);
  },
  async getById(id: string): Promise<Category | undefined> {
    const rows = await db.select().from(categories).where(eq(categories.id, id));
    return rows[0];
  },
  async create(values: NewCategory): Promise<Category> {
    const rows = await db.insert(categories).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewCategory>
  ): Promise<Category | undefined> {
    const rows = await db
      .update(categories)
      .set(values)
      .where(eq(categories.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Category | undefined> {
    const rows = await db.delete(categories).where(eq(categories.id, id)).returning();
    return rows[0];
  },
};
