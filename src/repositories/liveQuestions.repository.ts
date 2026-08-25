import { eq, asc } from "drizzle-orm";
import { db } from "../db";
import { LiveQuestion, liveQuestions, NewLiveQuestion } from "../db/schema";

export const liveQuestionsRepository = {
  async list(): Promise<LiveQuestion[]> {
    return await db.select().from(liveQuestions).orderBy(asc(liveQuestions.question_order));
  },
  async getById(id: string): Promise<LiveQuestion | undefined> {
    const rows = await db.select().from(liveQuestions).where(eq(liveQuestions.id, id));
    return rows[0];
  },
  async create(values: NewLiveQuestion): Promise<LiveQuestion> {
    const rows = await db.insert(liveQuestions).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewLiveQuestion>): Promise<LiveQuestion | undefined> {
    const rows = await db
      .update(liveQuestions)
      .set(values)
      .where(eq(liveQuestions.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<LiveQuestion | undefined> {
    const rows = await db.delete(liveQuestions).where(eq(liveQuestions.id, id)).returning();
    return rows[0];
  },
};
