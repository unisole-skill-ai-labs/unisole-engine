import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import {
  courses, Course, NewCourse,
  courseModules, NewCourseModule,
  pathwayCourses,
  modules,
  moduleLessons,
  lessons,
} from "../db/schema";

export const coursesRepository = {
  async list(): Promise<Course[]> {
    const rows = await db.select().from(courses);
    if (rows.length > 0) return rows;
    return [
      {
        id: "cs-genai",
        title: "Generative AI Engineering",
        slug: "generative-ai-engineering",
        shortDescription: "From Foundations to Agentic AI Systems — A 12-Week Industry-Ready Program",
        description: "12-Week Flagship Program with 132 Contact Hours, Hands-on Labs, and Capstone.",
        pricePaise: 299900,
        mrpPaise: 999900,
        status: "PUBLISHED" as const,
        isActive: true,
        metadata: { duration: "12 Weeks", level: "Foundations to Agentic AI" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cs-common",
        title: "AI Entrepreneurship & Innovation",
        slug: "ai-entrepreneurship-innovation",
        shortDescription: "Weekend Incubator Track — From AI Capability to a Validated Startup",
        description: "3 Months (12 Weekends, Saturdays & Sundays only) Hands-on Incubator Labs.",
        pricePaise: 59900,
        mrpPaise: 299900,
        status: "PUBLISHED" as const,
        isActive: true,
        metadata: { duration: "12 Weekends", level: "All Students" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  async listPublished(): Promise<Course[]> {
    const rows = await db
      .select()
      .from(courses)
      .where(and(eq(courses.isActive, true), eq(courses.status, "PUBLISHED")));
    if (rows.length > 0) return rows;
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
    await db.insert(courseModules).values(data);
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

  async getModules(courseId: string): Promise<any[]> {
    const rows = await db
      .select({
        moduleId: courseModules.moduleId,
        position: courseModules.position,
        title: modules.title,
        slug: modules.slug,
        status: modules.status,
      })
      .from(courseModules)
      .leftJoin(modules, eq(courseModules.moduleId, modules.id))
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.position));
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
