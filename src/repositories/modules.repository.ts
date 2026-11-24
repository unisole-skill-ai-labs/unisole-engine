import { eq, and, asc, ne } from "drizzle-orm";
import { db } from "../db";
import {
  modules, Module, NewModule,
  moduleLessons, NewModuleLesson,
  courseModules,
  lessons,
  lessonProgress,
  submissions,
} from "../db/schema";
import { ConflictError } from "../errors";

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

    const nextPosition = data.position || (existing.length + 1);

    await db.insert(moduleLessons).values({
      moduleId: data.moduleId,
      lessonId: data.lessonId,
      position: nextPosition,
    });
  },

  async detachLesson(moduleId: string, lessonId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Guard against deleting lesson with student progress or submissions
      const progress = await tx
        .select({ id: lessonProgress.id })
        .from(lessonProgress)
        .where(eq(lessonProgress.lessonId, lessonId))
        .limit(1);
      const subs = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(eq(submissions.lessonId, lessonId))
        .limit(1);
      if (progress.length > 0 || subs.length > 0) {
        throw new ConflictError("This lesson has student activity, archive it instead");
      }

      // 2. Remove module-lesson relationship
      await tx.delete(moduleLessons).where(
        and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonId))
      );

      // 3. Remove orphan lesson if not attached to any other module
      const otherLinks = await tx
        .select({ moduleId: moduleLessons.moduleId })
        .from(moduleLessons)
        .where(eq(moduleLessons.lessonId, lessonId))
        .limit(1);
      if (otherLinks.length === 0) {
        await tx.delete(lessons).where(eq(lessons.id, lessonId));
      }
    });
  },

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < lessonIds.length; i++) {
        await tx
          .update(moduleLessons)
          .set({ position: i + 1000 })
          .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonIds[i])));
      }
      for (let i = 0; i < lessonIds.length; i++) {
        await tx
          .update(moduleLessons)
          .set({ position: i + 1 })
          .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonIds[i])));
      }
    });
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
    let rows: any[] = [];
    try {
      rows = await db
        .select({
          lessonId: moduleLessons.lessonId,
          position: moduleLessons.position,
          title: lessons.title,
          slug: lessons.slug,
          videoUrl: lessons.videoUrl,
          durationMinutes: lessons.durationMinutes,
          status: lessons.status,
          unlockAt: lessons.unlockAt,
          lockAt: lessons.lockAt,
          content: lessons.content,
          description: lessons.description,
        })
        .from(moduleLessons)
        .leftJoin(lessons, eq(moduleLessons.lessonId, lessons.id))
        .where(eq(moduleLessons.moduleId, moduleId))
        .orderBy(asc(moduleLessons.position));
    } catch {}

    return rows || [];
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
