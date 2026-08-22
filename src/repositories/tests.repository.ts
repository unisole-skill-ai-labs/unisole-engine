import { eq } from "drizzle-orm";
import { db } from "../db";
import { Test, NewTest, courses, moduleItems, modules, tests } from "../db/schema";

export const testsRepository = {
  async list(): Promise<Test[]> {
    return await db.select().from(tests);
  },
  async listWithDetails() {
    const rows = await db
      .select({
        id: tests.id,
        module_item_id: tests.module_item_id,
        title: tests.title,
        duration_min: tests.duration_min,
        total_marks: tests.total_marks,
        passing_marks: tests.passing_marks,
        max_attempts: tests.max_attempts,
        module_item: {
          id: moduleItems.id,
          title: moduleItems.title,
          type: moduleItems.type,
          content_body: moduleItems.content_body,
        },
        module: {
          id: modules.id,
          title: modules.title,
          course_id: modules.course_id,
        },
        course: {
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
        },
      })
      .from(tests)
      .leftJoin(moduleItems, eq(tests.module_item_id, moduleItems.id))
      .leftJoin(modules, eq(moduleItems.module_id, modules.id))
      .leftJoin(courses, eq(modules.course_id, courses.id));

    return rows;
  },
  async getById(id: string): Promise<Test | undefined> {
    const rows = await db.select().from(tests).where(eq(tests.id, id));
    return rows[0];
  },
  async getByIdWithDetails(id: string) {
    const rows = await db
      .select({
        id: tests.id,
        module_item_id: tests.module_item_id,
        title: tests.title,
        duration_min: tests.duration_min,
        total_marks: tests.total_marks,
        passing_marks: tests.passing_marks,
        max_attempts: tests.max_attempts,
        module_item: {
          id: moduleItems.id,
          title: moduleItems.title,
          type: moduleItems.type,
          content_body: moduleItems.content_body,
        },
        module: {
          id: modules.id,
          title: modules.title,
          course_id: modules.course_id,
        },
        course: {
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
        },
      })
      .from(tests)
      .leftJoin(moduleItems, eq(tests.module_item_id, moduleItems.id))
      .leftJoin(modules, eq(moduleItems.module_id, modules.id))
      .leftJoin(courses, eq(modules.course_id, courses.id))
      .where(eq(tests.id, id));

    return rows[0];
  },
  async create(values: NewTest): Promise<Test> {
    const rows = await db.insert(tests).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewTest>): Promise<Test | undefined> {
    const rows = await db
      .update(tests)
      .set(values)
      .where(eq(tests.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Test | undefined> {
    const rows = await db.delete(tests).where(eq(tests.id, id)).returning();
    return rows[0];
  },
};
