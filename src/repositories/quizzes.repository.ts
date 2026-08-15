import { eq } from "drizzle-orm";
import { db } from "../db";
import { NewQuiz, Quiz, quizzes } from "../db/schema";

export const quizzesRepository = {
  async list(): Promise<Quiz[]> {
    return await db.select().from(quizzes);
  },
  async getById(id: string): Promise<Quiz | undefined> {
    const rows = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return rows[0];
  },
  async create(values: NewQuiz): Promise<Quiz> {
    const rows = await db.insert(quizzes).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewQuiz>): Promise<Quiz | undefined> {
    const rows = await db
      .update(quizzes)
      .set(values)
      .where(eq(quizzes.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Quiz | undefined> {
    const rows = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return rows[0];
  },
};
