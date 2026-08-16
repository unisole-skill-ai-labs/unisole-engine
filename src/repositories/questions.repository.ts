import { eq } from "drizzle-orm";
import { db } from "../db";
import { Question, NewQuestion, questions } from "../db/schema";

export const questionsRepository = {
  async list(): Promise<Question[]> {
    return await db.select().from(questions);
  },
  async getById(id: string): Promise<Question | undefined> {
    const rows = await db.select().from(questions).where(eq(questions.id, id));
    return rows[0];
  },
  async create(values: NewQuestion): Promise<Question> {
    const rows = await db.insert(questions).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewQuestion>): Promise<Question | undefined> {
    const rows = await db
      .update(questions)
      .set(values)
      .where(eq(questions.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Question | undefined> {
    const rows = await db.delete(questions).where(eq(questions.id, id)).returning();
    return rows[0];
  },
};
