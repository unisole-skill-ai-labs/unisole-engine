import { eq, and, asc, inArray, sql, ne } from "drizzle-orm";
import { db } from "../db";
import {
  courses, Course, NewCourse,
  courseModules, NewCourseModule,
  pathwayCourses,
  modules,
  moduleLessons,
  lessons,
  lessonProgress,
  submissions,
} from "../db/schema";
import { ConflictError } from "../errors";

export const coursesRepository = {
  async list(): Promise<Course[]> {
    const deprecatedCourseIds = new Set([
      "crs_cs-genai", "crs_cs-agentic", "crs_cs-p1", "crs_cs-common",
      "crs_sci-p1", "crs_sci-p2", "crs_mgmt-p1", "crs_arts-p1",
      "cs-p2", "cs-p3", "crs_1", "crs_2", "crs_3", "crs_4", "crs_5", "crs_6",
      "crs_cs_ai", "crs_sci_math", "crs_commerce_mgmt", "crs_humanities_arts",
      "mgmt-p2", "mgmt-p3", "mgmt-common",
    ]);

    try {
      const rows = await db.select().from(courses);
      const validRows = rows.filter((c) => !deprecatedCourseIds.has(c.id));
      if (validRows.length > 0) return validRows;
    } catch {}

    return [
      {
        id: "cs-agentic",
        title: "AI Agent Engineering",
        slug: "cs-agentic",
        shortDescription: "15-Week AI Agent Engineering Certificate Program (Weeks 1 - 15)",
        description: "Design and deploy autonomous AI agents with reasoning loops, dynamic tool calling, stateful graphs in LangGraph, multi-agent swarms with CrewAI, and Model Context Protocol (MCP).",
        pricePaise: 299900,
        mrpPaise: 999900,
        status: "PUBLISHED" as const,
        isActive: true,
        metadata: { duration: "12 Weeks", level: "Production AI Agent Engineering" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  async listPublished(): Promise<Course[]> {
    const deprecatedCourseIds = new Set([
      "crs_cs-genai", "crs_cs-agentic", "crs_cs-p1", "crs_cs-common",
      "crs_sci-p1", "crs_sci-p2", "crs_mgmt-p1", "crs_arts-p1",
      "cs-p2", "cs-p3", "crs_1", "crs_2", "crs_3", "crs_4", "crs_5", "crs_6",
      "crs_cs_ai", "crs_sci_math", "crs_commerce_mgmt", "crs_humanities_arts",
      "mgmt-p2", "mgmt-p3", "mgmt-common",
    ]);

    try {
      const rows = await db
        .select()
        .from(courses)
        .where(eq(courses.isActive, true));
      const validRows = rows.filter((c) => !deprecatedCourseIds.has(c.id));
      if (validRows.length > 0) return validRows;
    } catch {}
    return this.list();
  },

  async getById(id: string): Promise<Course | null> {
    const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (rows[0]) return rows[0];
    const fallbackList = await this.list();
    return fallbackList.find((c) => c.id === id) ?? null;
  },

  async getBySlug(slug: string): Promise<Course | null> {
    const rows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    if (rows[0]) return rows[0];
    const fallbackList = await this.list();
    return fallbackList.find((c) => c.slug === slug || c.id === slug) ?? null;
  },

  async getBySlugOrId(identifier: string): Promise<Course | null> {
    const byId = await db.select().from(courses).where(eq(courses.id, identifier)).limit(1);
    if (byId[0]) return byId[0];
    const bySlug = await db.select().from(courses).where(eq(courses.slug, identifier)).limit(1);
    if (bySlug[0]) return bySlug[0];
    const fallbackList = await this.list();
    return fallbackList.find((c) => c.id === identifier || c.slug === identifier) ?? null;
  },

  async create(data: NewCourse): Promise<Course> {
    const rows = await db.insert(courses).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewCourse, "id">>): Promise<Course | null> {
    const rows = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(courses.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Course | null> {
    const rows = await db.delete(courses).where(eq(courses.id, id)).returning();
    return rows[0] ?? null;
  },

  // --- Module relationships ---
  async attachModule(data: NewCourseModule): Promise<void> {
    const existing = await db
      .select({ position: courseModules.position })
      .from(courseModules)
      .where(eq(courseModules.courseId, data.courseId));
    const maxPos = existing.reduce((max, r) => Math.max(max, r.position), 0);
    const pos =
      data.position && !existing.some((e) => e.position === data.position)
        ? data.position
        : maxPos + 1;

    await db.insert(courseModules).values({
      ...data,
      position: pos,
    });
  },

  async detachModule(courseId: string, moduleId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Find all lessons linked to this module
      const linkedLessons = await tx
        .select({ lessonId: moduleLessons.lessonId })
        .from(moduleLessons)
        .where(eq(moduleLessons.moduleId, moduleId));

      // 2. Check student activity on any linked lesson
      if (linkedLessons.length > 0) {
        const lessonIds = linkedLessons.map((l) => l.lessonId);
        const hasProgress = await tx
          .select({ id: lessonProgress.id })
          .from(lessonProgress)
          .where(inArray(lessonProgress.lessonId, lessonIds))
          .limit(1);
        const hasSubs = await tx
          .select({ id: submissions.id })
          .from(submissions)
          .where(inArray(submissions.lessonId, lessonIds))
          .limit(1);
        if (hasProgress.length > 0 || hasSubs.length > 0) {
          throw new ConflictError("Cannot delete module: one or more lessons have student activity.");
        }
      }

      // 3. Detach module from this course
      await tx.delete(courseModules).where(
        and(eq(courseModules.courseId, courseId), eq(courseModules.moduleId, moduleId))
      );

      // 4. If this module is not attached to any other course, clean up orphan lessons and the module
      const otherCourses = await tx
        .select({ courseId: courseModules.courseId })
        .from(courseModules)
        .where(eq(courseModules.moduleId, moduleId))
        .limit(1);

      if (otherCourses.length === 0) {
        for (const { lessonId } of linkedLessons) {
          const otherModuleLinks = await tx
            .select({ moduleId: moduleLessons.moduleId })
            .from(moduleLessons)
            .where(and(eq(moduleLessons.lessonId, lessonId), ne(moduleLessons.moduleId, moduleId)))
            .limit(1);
          if (otherModuleLinks.length === 0) {
            await tx.delete(moduleLessons).where(
              and(eq(moduleLessons.moduleId, moduleId), eq(moduleLessons.lessonId, lessonId))
            );
            await tx.delete(lessons).where(eq(lessons.id, lessonId));
          }
        }
        await tx.delete(moduleLessons).where(eq(moduleLessons.moduleId, moduleId));
        await tx.delete(modules).where(eq(modules.id, moduleId));
      }
    });
  },

  async clearModules(courseId: string): Promise<void> {
    const attached = await db
      .select({ moduleId: courseModules.moduleId })
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));
    const moduleIds = attached.map((a) => a.moduleId);

    await db.delete(courseModules).where(eq(courseModules.courseId, courseId));

    if (moduleIds.length > 0) {
      for (const modId of moduleIds) {
        const mLes = await db
          .select({ lessonId: moduleLessons.lessonId })
          .from(moduleLessons)
          .where(eq(moduleLessons.moduleId, modId));
        const lessonIds = mLes.map((l) => l.lessonId);

        await db.delete(moduleLessons).where(eq(moduleLessons.moduleId, modId));
        if (lessonIds.length > 0) {
          for (const lId of lessonIds) {
            await db.delete(lessons).where(eq(lessons.id, lId));
          }
        }
        await db.delete(modules).where(eq(modules.id, modId));
      }
    }
  },

  async purgeAllCurriculum(): Promise<{ modulesDeleted: number; lessonsDeleted: number }> {
    await db.delete(moduleLessons);
    await db.delete(courseModules);
    const lRes = await db.delete(lessons);
    const mRes = await db.delete(modules);
    return {
      modulesDeleted: mRes?.rowCount || 0,
      lessonsDeleted: lRes?.rowCount || 0,
    };
  },

  async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < moduleIds.length; i++) {
        await tx
          .update(courseModules)
          .set({ position: i + 1000 })
          .where(and(eq(courseModules.courseId, courseId), eq(courseModules.moduleId, moduleIds[i])));
      }
      for (let i = 0; i < moduleIds.length; i++) {
        await tx
          .update(courseModules)
          .set({ position: i + 1 })
          .where(and(eq(courseModules.courseId, courseId), eq(courseModules.moduleId, moduleIds[i])));
      }
    });
  },

  async getModules(courseId: string): Promise<any[]> {
    const candidates = new Set<string>([courseId]);
    if (courseId === "course1" || courseId === "cs-agentic") {
      candidates.add("cs-agentic");
      candidates.add("course1");
    }
    try {
      const courseObj = await this.getBySlugOrId(courseId);
      if (courseObj) {
        candidates.add(courseObj.id);
        candidates.add(courseObj.slug);
      }
    } catch {}

    const candidateList = Array.from(candidates);

    let rows: any[] = [];
    try {
      rows = await db
        .select({
          moduleId: courseModules.moduleId,
          position: courseModules.position,
          title: modules.title,
          slug: modules.slug,
          status: modules.status,
          description: modules.description,
          unlockAt: modules.unlockAt,
          lockAt: modules.lockAt,
        })
        .from(courseModules)
        .leftJoin(modules, sql`${courseModules.moduleId}::text = ${modules.id}::text`)
        .where(inArray(courseModules.courseId, candidateList))
        .orderBy(asc(courseModules.position));
    } catch {}

    return rows || [];
  },

  // --- Usage lookups ---
  async getPathwaysUsingCourse(courseId: string): Promise<string[]> {
    const rows = await db
      .select({ pathwayId: pathwayCourses.pathwayId })
      .from(pathwayCourses)
      .where(eq(pathwayCourses.courseId, courseId));
    return rows.map((r) => r.pathwayId);
  },
};
