import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  courses, Course, NewCourse,
  courseModules, NewCourseModule,
  pathwayCourses,
  modules,
  moduleLessons,
  lessons,
} from "../db/schema";
import { WEEKS_DATA } from "../scripts/seed-ai-agent-curriculum";

export const coursesRepository = {
  async list(): Promise<Course[]> {
    try {
      const rows = await db.select().from(courses);
      const filtered = rows.filter(
        (c) =>
          c.slug === "cs-agentic" ||
          c.slug === "course1" ||
          (c.title && c.title.toLowerCase().includes("ai agent"))
      );
      if (filtered.length > 0) return filtered;
    } catch {}

    return [
      {
        id: "cs-agentic",
        title: "AI Agent Engineering",
        slug: "cs-agentic",
        shortDescription: "12-Week AI Agent Engineering Certificate Program (Weeks 1 - 12)",
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
    try {
      const rows = await db
        .select()
        .from(courses)
        .where(and(eq(courses.isActive, true), eq(courses.status, "PUBLISHED")));
      const filtered = rows.filter(
        (c) =>
          c.slug === "cs-agentic" ||
          c.slug === "course1" ||
          (c.title && c.title.toLowerCase().includes("ai agent"))
      );
      if (filtered.length > 0) return filtered;
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
    await db.delete(courseModules).where(
      and(eq(courseModules.courseId, courseId), eq(courseModules.moduleId, moduleId))
    );
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
    for (let i = 0; i < moduleIds.length; i++) {
      await db
        .update(courseModules)
        .set({ position: i + 1000 })
        .where(and(eq(courseModules.courseId, courseId), eq(courseModules.moduleId, moduleIds[i])));
    }
    for (let i = 0; i < moduleIds.length; i++) {
      await db
        .update(courseModules)
        .set({ position: i + 1 })
        .where(and(eq(courseModules.courseId, courseId), eq(courseModules.moduleId, moduleIds[i])));
    }
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

    if (!rows || rows.length === 0) {
      try {
        const directMods = await db
          .select({
            moduleId: modules.id,
            title: modules.title,
            slug: modules.slug,
            status: modules.status,
            description: modules.description,
            unlockAt: modules.unlockAt,
            lockAt: modules.lockAt,
          })
          .from(modules);

        if (directMods && directMods.length > 0) {
          rows = directMods.map((m, idx) => ({
            ...m,
            position: idx + 1,
          }));
        }
      } catch {}
    }

    if (!rows || rows.length === 0) {
      rows = WEEKS_DATA.map((w) => ({
        moduleId: `mod_agent_w${w.weekNum}`,
        position: w.weekNum,
        title: w.title,
        slug: `cs-agentic-week-${w.weekNum}`,
        status: "PUBLISHED",
        description: w.keyConcepts,
        unlockAt: null,
        lockAt: null,
      }));
    }

    return rows;
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
