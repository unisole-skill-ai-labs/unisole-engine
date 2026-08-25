import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { LiveParticipant, liveParticipants, NewLiveParticipant } from "../db/schema";

export const liveParticipantsRepository = {
  async list(): Promise<LiveParticipant[]> {
    return await db.select().from(liveParticipants).orderBy(desc(liveParticipants.joined_at));
  },
  async getById(id: string): Promise<LiveParticipant | undefined> {
    const rows = await db.select().from(liveParticipants).where(eq(liveParticipants.id, id));
    return rows[0];
  },
  async create(values: NewLiveParticipant): Promise<LiveParticipant> {
    const rows = await db.insert(liveParticipants).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewLiveParticipant>): Promise<LiveParticipant | undefined> {
    const rows = await db
      .update(liveParticipants)
      .set(values)
      .where(eq(liveParticipants.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<LiveParticipant | undefined> {
    const rows = await db.delete(liveParticipants).where(eq(liveParticipants.id, id)).returning();
    return rows[0];
  },
};
