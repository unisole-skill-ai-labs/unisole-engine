import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "../db";
import { getVideoStorageProvider } from "../services/video-storage.service";
import {
  modules, Module, NewModule,
  moduleLessons, NewModuleLesson,
  courseModules,
  lessons, Lesson, NewLesson,
  lessonProgress,
  submissions,
} from "../db/schema";
import { ConflictError, NotFoundError } from "../errors";
import { generateLessonId } from "./lessons.repository";

async function lockModuleTx(tx: any, moduleId: string): Promise<void> {
  const res = await tx.execute(sql`SELECT id FROM modules WHERE id = ${moduleId} FOR UPDATE`);
  if (!res.rows || res.rows.length === 0) {
    throw new NotFoundError("Module not found");
  }
}

async function getNextModuleLessonPositionTx(tx: any, moduleId: string): Promise<number> {
  const res = await tx.execute(
    sql`SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM module_lessons WHERE module_id = ${moduleId}`
  );
  return Number((res.rows?.[0] as any)?.next_pos) || 1;
}

async function renumberModuleLessonsTx(tx: any, moduleId: string): Promise<void> {
  const rows = await tx
    .select({ lessonId: moduleLessons.lessonId, position: moduleLessons.position })
    .from(moduleLessons)
    .where(eq(moduleLessons.moduleId, moduleId))
    .orderBy(asc(moduleLessons.position), asc(moduleLessons.createdAt), asc(moduleLessons.lessonId));

  if (rows.length === 0) return;

  const needsRenumber = rows.some((r: any, idx: number) => r.position !== idx + 1);
  if (!needsRenumber) return;

  // Two-step update through temporary high positive positions (> 0 satisfies chk_module_lessons_position
  // and avoids uq_module_lessons_position collisions during renumbering)
  for (let i = 0; i < rows.length; i++) {
    await tx
      .update(moduleLessons)
      .set({ position: 100000 + i + 1 })
      .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, rows[i].lessonId)));
  }
  for (let i = 0; i < rows.length; i++) {
    await tx
      .update(moduleLessons)
      .set({ position: i + 1 })
      .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, rows[i].lessonId)));
  }
}

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
  async createAndAttachLesson(
    moduleId: string,
    lessonData: Omit<NewLesson, "id">
  ): Promise<Lesson & { position: number; moduleId: string; lessonId: string }> {
    return db.transaction(async (tx) => {
      await lockModuleTx(tx, moduleId);
      const nextPosition = await getNextModuleLessonPositionTx(tx, moduleId);

      const lessonId = generateLessonId();
      const [created] = await tx
        .insert(lessons)
        .values({ ...lessonData, id: lessonId })
        .returning();

      await tx.insert(moduleLessons).values({
        moduleId,
        lessonId: created.id,
        position: nextPosition,
      });

      return {
        ...created,
        position: nextPosition,
        moduleId,
        lessonId: created.id,
      };
    });
  },

  async attachLesson(
    data: Omit<NewModuleLesson, "position"> & { position?: number }
  ): Promise<{ moduleId: string; lessonId: string; position: number; alreadyAttached: boolean }> {
    return db.transaction(async (tx) => {
      await lockModuleTx(tx, data.moduleId);

      const lessonCheck = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, data.lessonId))
        .limit(1);
      if (lessonCheck.length === 0) {
        throw new NotFoundError("Lesson not found");
      }

      const existingLink = await tx
        .select({
          moduleId: moduleLessons.moduleId,
          lessonId: moduleLessons.lessonId,
          position: moduleLessons.position,
        })
        .from(moduleLessons)
        .where(
          and(
            eq(moduleLessons.moduleId, data.moduleId),
            eq(moduleLessons.lessonId, data.lessonId)
          )
        )
        .limit(1);

      if (existingLink.length > 0) {
        return {
          moduleId: existingLink[0].moduleId,
          lessonId: existingLink[0].lessonId,
          position: existingLink[0].position,
          alreadyAttached: true,
        };
      }

      const nextPosition = await getNextModuleLessonPositionTx(tx, data.moduleId);

      await tx.insert(moduleLessons).values({
        moduleId: data.moduleId,
        lessonId: data.lessonId,
        position: nextPosition,
      });

      return {
        moduleId: data.moduleId,
        lessonId: data.lessonId,
        position: nextPosition,
        alreadyAttached: false,
      };
    });
  },

  async detachLesson(moduleId: string, lessonId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await lockModuleTx(tx, moduleId);

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
        throw new ConflictError("This lesson has student activity and cannot be deleted.");
      }

      // 2. Remove module-lesson relationship and renumber remaining items atomically
      await tx.delete(moduleLessons).where(
        and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonId))
      );
      await renumberModuleLessonsTx(tx, moduleId);

      // 3. Remove orphan lesson if not attached to any other module
      const otherLinks = await tx
        .select({ moduleId: moduleLessons.moduleId })
        .from(moduleLessons)
        .where(eq(moduleLessons.lessonId, lessonId))
        .limit(1);
      if (otherLinks.length === 0) {
        const deletedRows = await tx
          .delete(lessons)
          .where(eq(lessons.id, lessonId))
          .returning({ videoHlsPath: lessons.videoHlsPath });
        if (deletedRows[0]?.videoHlsPath) {
          // Best-effort Azure blob cleanup outside rollback risk; orphaned blobs can also be audited via /api/admin/videos/orphans
          getVideoStorageProvider()
            .deletePrefix(`${lessonId}/`)
            .catch(() => {});
        }
      }
    });
  },

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      await lockModuleTx(tx, moduleId);

      const currentRows = await tx
        .select({ lessonId: moduleLessons.lessonId })
        .from(moduleLessons)
        .where(eq(moduleLessons.moduleId, moduleId))
        .orderBy(asc(moduleLessons.position), asc(moduleLessons.createdAt));

      const currentSet = new Set(currentRows.map((r: any) => r.lessonId));
      const orderedIds = lessonIds.filter((id) => currentSet.has(id));
      for (const r of currentRows) {
        if (!orderedIds.includes(r.lessonId)) {
          orderedIds.push(r.lessonId);
        }
      }

      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(moduleLessons)
          .set({ position: 100000 + i + 1 })
          .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, orderedIds[i])));
      }
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(moduleLessons)
          .set({ position: i + 1 })
          .where(and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, orderedIds[i])));
      }
    });
  },

  async moveLesson(sourceModuleId: string, targetModuleId: string, lessonId: string, _targetPosition?: number): Promise<void> {
    await db.transaction(async (tx) => {
      const lockOrder = sourceModuleId <= targetModuleId
        ? [sourceModuleId, targetModuleId]
        : [targetModuleId, sourceModuleId];
      await lockModuleTx(tx, lockOrder[0]);
      if (lockOrder[1] !== lockOrder[0]) {
        await lockModuleTx(tx, lockOrder[1]);
      }

      await tx.delete(moduleLessons).where(
        and(eq(moduleLessons.moduleId, sourceModuleId), eq(moduleLessons.lessonId, lessonId))
      );
      await renumberModuleLessonsTx(tx, sourceModuleId);

      const existingInTarget = await tx
        .select({ lessonId: moduleLessons.lessonId })
        .from(moduleLessons)
        .where(and(eq(moduleLessons.moduleId, targetModuleId), eq(moduleLessons.lessonId, lessonId)))
        .limit(1);

      if (existingInTarget.length === 0) {
        const nextPos = await getNextModuleLessonPositionTx(tx, targetModuleId);
        await tx.insert(moduleLessons).values({
          moduleId: targetModuleId,
          lessonId,
          position: nextPos,
        });
      }
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
