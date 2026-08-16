import { eq } from "drizzle-orm";
import { db } from "../db";
import { Test, NewTest, tests } from "../db/schema";

export const testsRepository = {
  async list(): Promise<Test[]> {
    return await db.select().from(tests);
  },
  async getById(id: string): Promise<Test | undefined> {
    const rows = await db.select().from(tests).where(eq(tests.id, id));
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
