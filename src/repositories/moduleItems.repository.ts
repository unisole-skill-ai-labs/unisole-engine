import { eq } from "drizzle-orm";
import { db } from "../db";
import { ModuleItem, NewModuleItem, moduleItems } from "../db/schema";

export const moduleItemsRepository = {
  async list(): Promise<ModuleItem[]> {
    return await db.select().from(moduleItems);
  },
  async getById(id: string): Promise<ModuleItem | undefined> {
    const rows = await db
      .select()
      .from(moduleItems)
      .where(eq(moduleItems.id, id));
    return rows[0];
  },
  async create(values: NewModuleItem): Promise<ModuleItem> {
    const rows = await db.insert(moduleItems).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewModuleItem>
  ): Promise<ModuleItem | undefined> {
    const rows = await db
      .update(moduleItems)
      .set(values)
      .where(eq(moduleItems.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<ModuleItem | undefined> {
    const rows = await db
      .delete(moduleItems)
      .where(eq(moduleItems.id, id))
      .returning();
    return rows[0];
  },
};
