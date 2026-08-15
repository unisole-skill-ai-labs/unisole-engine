import { eq } from "drizzle-orm";
import { db } from "../db";
import { CourseModule, NewCourseModule, courseModules } from "../db/schema";

export const courseModulesRepository = {
  async list(): Promise<CourseModule[]> {
    return await db.select().from(courseModules);
  },
  async getById(id: string): Promise<CourseModule | undefined> {
    const rows = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, id));
    return rows[0];
  },
  async create(values: NewCourseModule): Promise<CourseModule> {
    const rows = await db.insert(courseModules).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewCourseModule>
  ): Promise<CourseModule | undefined> {
    const rows = await db
      .update(courseModules)
      .set(values)
      .where(eq(courseModules.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<CourseModule | undefined> {
    const rows = await db
      .delete(courseModules)
      .where(eq(courseModules.id, id))
      .returning();
    return rows[0];
  },
};
