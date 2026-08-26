import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  modules, Module, NewModule,
  moduleLessons, NewModuleLesson,
  courseModules,
} from "../db/schema";

export const modulesRepository = {
  async list(): Promise<Module[]> {
    return db.select().from(modules);
  },

  async getById(id: string): Promise<Module | null> {
    const rows = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<Module | null> {
    const rows = await db.select().from(modules).where(eq(modules.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewModule): Promise<Module> {
    const rows = await db.insert(modules).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewModule, "id">>): Promise<Module | null> {
    const rows = await db
      .update(modules)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(modules.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Module | null> {
    const rows = await db.delete(modules).where(eq(modules.id, id)).returning();
    return rows[0] ?? null;
  },

  // --- Lesson relationships ---
  async attachLesson(data: NewModuleLesson): Promise<void> {
    await db.insert(moduleLessons).values(data);
  },

  async detachLesson(moduleId: string, lessonId: string): Promise<void> {
    await db.delete(moduleLessons).where(
      and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonId))
    );
  },

  async getLessons(moduleId: string): Promise<{ lessonId: string; position: number }[]> {
    const rows = await db
      .select({ lessonId: moduleLessons.lessonId, position: moduleLessons.position })
      .from(moduleLessons)
      .where(eq(moduleLessons.moduleId, moduleId));
    return rows;
  },

  // --- Usage lookups ---
  async getCoursesUsingModule(moduleId: string): Promise<string[]> {
    const rows = await db
      .select({ courseId: courseModules.courseId })
      .from(courseModules)
      .where(eq(courseModules.moduleId, moduleId));
    return rows.map((r) => r.courseId);
  },
};
