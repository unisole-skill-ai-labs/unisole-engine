import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { lessons, Lesson, NewLesson, moduleLessons } from "../db/schema";

export function generateLessonId(): string {
  return `les_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

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
    const id = data.id || generateLessonId();
    const rows = await db.insert(lessons).values({ ...data, id }).returning();
    return rows[0];
  },

  async listOrphans(): Promise<any[]> {
    const res = await db.execute(sql`
      SELECT
        l.id,
        l.title,
        l.slug,
        l.status,
        l.created_at AS "createdAt",
        l.updated_at AS "updatedAt",
        (SELECT count(*)::int FROM lesson_progress lp WHERE lp.lesson_id = l.id) AS "progressCount",
        (SELECT count(*)::int FROM submissions s WHERE s.lesson_id = l.id) AS "submissionsCount"
      FROM lessons l
      LEFT JOIN module_lessons ml ON ml.lesson_id = l.id
      WHERE ml.lesson_id IS NULL
      ORDER BY l.created_at DESC
    `);
    return res.rows;
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
