import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { LiveSession, liveSessions, NewLiveSession } from "../db/schema";

export const liveSessionsRepository = {
  async list(): Promise<LiveSession[]> {
    return await db.select().from(liveSessions).orderBy(desc(liveSessions.created_at));
  },
  async getById(id: string): Promise<LiveSession | undefined> {
    const rows = await db.select().from(liveSessions).where(eq(liveSessions.id, id));
    return rows[0];
  },
  async create(values: NewLiveSession): Promise<LiveSession> {
    const rows = await db.insert(liveSessions).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewLiveSession>): Promise<LiveSession | undefined> {
    const rows = await db
      .update(liveSessions)
      .set(values)
      .where(eq(liveSessions.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<LiveSession | undefined> {
    const rows = await db.delete(liveSessions).where(eq(liveSessions.id, id)).returning();
    return rows[0];
  },
};
