import { eq } from "drizzle-orm";
import { db } from "../db";
import { lessons, Lesson, NewLesson, moduleLessons } from "../db/schema";

export const lessonsRepository = {
  async list(): Promise<Lesson[]> {
    return db.select().from(lessons);
  },

  async getById(id: string): Promise<Lesson | null> {
    const rows = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<Lesson | null> {
    const rows = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewLesson): Promise<Lesson> {
    const rows = await db.insert(lessons).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewLesson, "id">>): Promise<Lesson | null> {
    const rows = await db
      .update(lessons)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(lessons.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Lesson | null> {
    const rows = await db.delete(lessons).where(eq(lessons.id, id)).returning();
    return rows[0] ?? null;
  },

  // --- Usage lookups ---
  async getModulesUsingLesson(lessonId: string): Promise<string[]> {
    const rows = await db
      .select({ moduleId: moduleLessons.moduleId })
      .from(moduleLessons)
      .where(eq(moduleLessons.lessonId, lessonId));
    return rows.map((r) => r.moduleId);
  },
};
