import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../db";
import { enrollments, Enrollment, NewEnrollment, users } from "../db/schema";

export const enrollmentsRepository = {
  async list(): Promise<Enrollment[]> {
    return db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
  },

  async listWithDetails(filters: { itemType?: Enrollment["itemType"]; status?: string; search?: string; limit?: number; offset?: number } = {}) {
    const conditions = [];

    if (filters.itemType) {
      conditions.push(eq(enrollments.itemType, filters.itemType));
    }
    if (filters.status) {
      conditions.push(eq(enrollments.status, filters.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const rows = await db
      .select({
        enrollment: enrollments,
        user: {
          id: users.id,
          name: users.name,
          phone: users.phone,
          collegeName: users.collegeName,
          branch: users.branch,
        },
      })
      .from(enrollments)
      .leftJoin(users, eq(enrollments.userId, users.id))
      .where(whereClause)
      .orderBy(desc(enrollments.createdAt))
      .limit(limit)
      .offset(offset);

    return rows;
  },

  async getById(id: string): Promise<Enrollment | null> {
    const rows = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async listByUser(userId: string): Promise<Enrollment[]> {
    return db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.createdAt));
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
          or(eq(enrollments.pathwayId, pathwayId), eq(enrollments.itemId, pathwayId)),
          eq(enrollments.status, "ACTIVE")
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async getActiveByUserAndItem(userId: string, itemType: Enrollment["itemType"], itemId: string): Promise<Enrollment | null> {
    const rows = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.itemType, itemType),
          eq(enrollments.itemId, itemId),
          eq(enrollments.status, "ACTIVE")
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewEnrollment): Promise<Enrollment> {
    const payload = {
      ...data,
      itemId: data.itemId || data.pathwayId || undefined,
    };
    const rows = await db.insert(enrollments).values(payload).returning();
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

