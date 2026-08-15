import { eq } from "drizzle-orm";
import { db } from "../db";
import { ModuleLesson, NewModuleLesson, moduleLessons } from "../db/schema";

export const moduleLessonsRepository = {
  async list(): Promise<ModuleLesson[]> {
    return await db.select().from(moduleLessons);
  },
  async getById(id: string): Promise<ModuleLesson | undefined> {
    const rows = await db
      .select()
      .from(moduleLessons)
      .where(eq(moduleLessons.id, id));
    return rows[0];
  },
  async create(values: NewModuleLesson): Promise<ModuleLesson> {
    const rows = await db.insert(moduleLessons).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewModuleLesson>
  ): Promise<ModuleLesson | undefined> {
    const rows = await db
      .update(moduleLessons)
      .set(values)
      .where(eq(moduleLessons.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<ModuleLesson | undefined> {
    const rows = await db
      .delete(moduleLessons)
      .where(eq(moduleLessons.id, id))
      .returning();
    return rows[0];
  },
};
