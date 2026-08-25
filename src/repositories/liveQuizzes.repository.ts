import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { LiveQuiz, liveQuizzes, NewLiveQuiz } from "../db/schema";

export const liveQuizzesRepository = {
  async list(): Promise<LiveQuiz[]> {
    return await db.select().from(liveQuizzes).orderBy(desc(liveQuizzes.created_at));
  },
  async getById(id: string): Promise<LiveQuiz | undefined> {
    const rows = await db.select().from(liveQuizzes).where(eq(liveQuizzes.id, id));
    return rows[0];
  },
  async create(values: NewLiveQuiz): Promise<LiveQuiz> {
    const rows = await db.insert(liveQuizzes).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewLiveQuiz>): Promise<LiveQuiz | undefined> {
    const rows = await db
      .update(liveQuizzes)
      .set(values)
      .where(eq(liveQuizzes.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<LiveQuiz | undefined> {
    const rows = await db.delete(liveQuizzes).where(eq(liveQuizzes.id, id)).returning();
    return rows[0];
  },
};
