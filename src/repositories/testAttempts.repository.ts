import { eq } from "drizzle-orm";
import { db } from "../db";
import { TestAttempt, NewTestAttempt, testAttempts } from "../db/schema";

export const testAttemptsRepository = {
  async list(): Promise<TestAttempt[]> {
    return await db.select().from(testAttempts);
  },
  async getById(id: string): Promise<TestAttempt | undefined> {
    const rows = await db.select().from(testAttempts).where(eq(testAttempts.id, id));
    return rows[0];
  },
  async create(values: NewTestAttempt): Promise<TestAttempt> {
    const rows = await db.insert(testAttempts).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewTestAttempt>): Promise<TestAttempt | undefined> {
    const rows = await db
      .update(testAttempts)
      .set(values)
      .where(eq(testAttempts.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<TestAttempt | undefined> {
    const rows = await db.delete(testAttempts).where(eq(testAttempts.id, id)).returning();
    return rows[0];
  },
};
