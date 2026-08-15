import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  Course,
  NewCourse,
  courseModules,
  courses,
  moduleItems,
  moduleLessons,
  modules,
} from "../db/schema";
import { deleteOrphanLessons, deleteOrphanModules } from "../helpers/orphans";

export const coursesRepository = {
  async list(): Promise<Course[]> {
    return await db.select().from(courses);
  },
  async getById(id: string): Promise<Course | undefined> {
    const rows = await db.select().from(courses).where(eq(courses.id, id));
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
      .from(courseModules)
      .innerJoin(modules, eq(courseModules.module_id, modules.id))
      .leftJoin(moduleLessons, eq(moduleLessons.module_id, modules.id))
      .leftJoin(moduleItems, eq(moduleLessons.module_item_id, moduleItems.id))
      .where(eq(courseModules.course_id, courseId))
      .orderBy(asc(courseModules.order_index), asc(moduleLessons.order_index));
  },
  removeWithCleanup(id: string) {
    return db.transaction(async (tx) => {
      const deleted = await tx
        .delete(courses)
        .where(eq(courses.id, id))
        .returning();
      if (deleted.length === 0) return null;
      await deleteOrphanModules(tx);
      await deleteOrphanLessons(tx);
      return deleted[0];
    });
  },
};
