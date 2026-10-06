import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import {
  modules, Module, NewModule,
  moduleLessons, NewModuleLesson,
  courseModules,
  lessons,
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
    const existing = await db
      .select({ position: moduleLessons.position })
      .from(moduleLessons)
      .where(eq(moduleLessons.moduleId, data.moduleId));
    const maxPos = existing.reduce((max, r) => Math.max(max, r.position), 0);
    const pos =
      data.position && !existing.some((e) => e.position === data.position)
        ? data.position
        : maxPos + 1;

    await db.insert(moduleLessons).values({
      ...data,
      position: pos,
    });
  },

  async detachLesson(moduleId: string, lessonId: string): Promise<void> {
    await db.delete(moduleLessons).where(
      and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonId))
    );
  },

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    for (let i = 0; i < lessonIds.length; i++) {
      await db
        .update(moduleLessons)
        .set({ position: i + 1000 })
        .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonIds[i])));
    }
    for (let i = 0; i < lessonIds.length; i++) {
      await db
        .update(moduleLessons)
        .set({ position: i + 1 })
        .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonIds[i])));
    }
  },

  async moveLesson(sourceModuleId: string, targetModuleId: string, lessonId: string, targetPosition?: number): Promise<void> {
    await db.delete(moduleLessons).where(
      and(eq(moduleLessons.moduleId, sourceModuleId), eq(moduleLessons.lessonId, lessonId))
    );
    
    const existing = await db
      .select({ position: moduleLessons.position })
      .from(moduleLessons)
      .where(eq(moduleLessons.moduleId, targetModuleId))
      .orderBy(asc(moduleLessons.position));
    
    const nextPos = targetPosition || (existing.length + 1);

    await db.insert(moduleLessons).values({
      moduleId: targetModuleId,
      lessonId,
      position: nextPos,
    });
  },

  async getLessons(moduleId: string): Promise<any[]> {
    const rows = await db
      .select({
        lessonId: moduleLessons.lessonId,
        position: moduleLessons.position,
        title: lessons.title,
        slug: lessons.slug,
        videoUrl: lessons.videoUrl,
        durationMinutes: lessons.durationMinutes,
      })
      .from(moduleLessons)
      .leftJoin(lessons, eq(moduleLessons.lessonId, lessons.id))
      .where(eq(moduleLessons.moduleId, moduleId))
      .orderBy(asc(moduleLessons.position));
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
