import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  Course,
  NewCourse,
  courses,
  moduleItems,
  modules,
} from "../db/schema";

export const coursesRepository = {
  async list(filters?: { categoryId?: string; search?: string }): Promise<Course[]> {
    const conditions = [];
    if (filters?.categoryId) {
      conditions.push(eq(courses.category_id, filters.categoryId));
    }
    if (filters?.search) {
      const term = `%${filters.search}%`;
      conditions.push(sql`(${courses.title} ILIKE ${term} OR ${courses.slug} ILIKE ${term})`);
    }
    if (conditions.length > 0) {
      return await db.select().from(courses).where(and(...conditions));
    }
    return await db.select().from(courses);
  },
  async getById(id: string): Promise<Course | undefined> {
    const rows = await db.select().from(courses).where(eq(courses.id, id));
    return rows[0];
  },
  async getBySlug(slug: string): Promise<Course | undefined> {
    const rows = await db.select().from(courses).where(eq(courses.slug, slug));
    return rows[0];
  },
  async create(values: NewCourse): Promise<Course> {
    const rows = await db.insert(courses).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewCourse>
  ): Promise<Course | undefined> {
    const rows = await db
      .update(courses)
      .set(values)
      .where(eq(courses.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Course | undefined> {
    const rows = await db.delete(courses).where(eq(courses.id, id)).returning();
    return rows[0];
  },
  getModulesForCourse(courseId: string) {
    return db
      .select()
      .from(modules)
      .leftJoin(moduleItems, eq(moduleItems.module_id, modules.id))
      .where(eq(modules.course_id, courseId))
      .orderBy(asc(modules.order_index), asc(moduleItems.order_index));
  },
};
