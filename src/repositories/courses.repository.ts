import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  courses, Course, NewCourse,
  courseModules, NewCourseModule,
  pathwayCourses,
} from "../db/schema";

export const coursesRepository = {
  async list(): Promise<Course[]> {
    return db.select().from(courses);
  },

  async getById(id: string): Promise<Course | null> {
    const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<Course | null> {
    const rows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    return rows[0] ?? null;
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

  async getModules(courseId: string): Promise<{ moduleId: string; position: number }[]> {
    const rows = await db
      .select({ moduleId: courseModules.moduleId, position: courseModules.position })
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));
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
