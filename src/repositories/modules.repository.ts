import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { Module, moduleItems, moduleLessons, modules, NewModule } from "../db/schema";
import { deleteOrphanLessons } from "../helpers/orphans";

export const modulesRepository = {
  async list(): Promise<Module[]> {
    return await db.select().from(modules);
  },
  async getById(id: string): Promise<Module | undefined> {
    const rows = await db.select().from(modules).where(eq(modules.id, id));
    return rows[0];
  },
  async create(values: NewModule): Promise<Module> {
    const rows = await db.insert(modules).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewModule>
  ): Promise<Module | undefined> {
    const rows = await db
      .update(modules)
      .set(values)
      .where(eq(modules.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Module | undefined> {
    const rows = await db.delete(modules).where(eq(modules.id, id)).returning();
    return rows[0];
  },
  getLessonsForModule(moduleId: string) {
    return db
      .select()
      .from(moduleLessons)
      .innerJoin(moduleItems, eq(moduleLessons.module_item_id, moduleItems.id))
      .where(eq(moduleLessons.module_id, moduleId))
      .orderBy(asc(moduleLessons.order_index));
  },
  removeWithCleanup(id: string) {
    return db.transaction(async (tx) => {
      const deleted = await tx.delete(modules).where(eq(modules.id, id)).returning();
      if (deleted.length === 0) return null;
      await deleteOrphanLessons(tx);
      return deleted[0];
    });
  },
};
