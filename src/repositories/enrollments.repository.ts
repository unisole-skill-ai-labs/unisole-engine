import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { enrollments, Enrollment, NewEnrollment } from "../db/schema";

export const enrollmentsRepository = {
  async list(): Promise<Enrollment[]> {
    return db.select().from(enrollments);
  },

  async getById(id: string): Promise<Enrollment | null> {
    const rows = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async listByUser(userId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.userId, userId));
  },

  async listByPathway(pathwayId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.pathwayId, pathwayId));
  },

  async getActiveByUserAndPathway(userId: string, pathwayId: string): Promise<Enrollment | null> {
    const rows = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.pathwayId, pathwayId),
          eq(enrollments.status, "ACTIVE")
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewEnrollment): Promise<Enrollment> {
    const rows = await db.insert(enrollments).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewEnrollment, "id">>): Promise<Enrollment | null> {
    const rows = await db
      .update(enrollments)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(enrollments.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Enrollment | null> {
    const rows = await db.delete(enrollments).where(eq(enrollments.id, id)).returning();
    return rows[0] ?? null;
  },
};
