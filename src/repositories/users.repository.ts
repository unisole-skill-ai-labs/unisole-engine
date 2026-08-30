import { eq, and, or, ilike, desc } from "drizzle-orm";
import { db } from "../db";
import { users, User, NewUser } from "../db/schema";

export const usersRepository = {
  async list(filters?: {
    collegeId?: string;
    branch?: string;
    role?: string;
    search?: string;
  }): Promise<User[]> {
    const conditions = [];

    if (filters?.collegeId) {
      conditions.push(eq(users.collegeId, filters.collegeId));
    }
    if (filters?.branch) {
      conditions.push(
        or(
          eq(users.branch, filters.branch),
          ilike(users.branch, `%${filters.branch}%`)
        )
      );
    }
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(users.name, q),
          ilike(users.phone, q),
          ilike(users.branch, q),
          ilike(users.collegeName, q)
        )
      );
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(desc(users.createdAt));
    }

    return db.select().from(users).orderBy(desc(users.createdAt));
  },

  async getById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getByPhone(phone: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewUser): Promise<User> {
    try {
      const rows = await db.insert(users).values(data).returning();
      return rows[0];
    } catch (err: any) {
      if (!data.id) {
        const fallbackId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const rows = await db.insert(users).values({ ...data, id: fallbackId }).returning();
        return rows[0];
      }
      throw err;
    }
  },

  async update(
    id: string,
    data: Partial<Omit<NewUser, "id">>
  ): Promise<User | null> {
    const rows = await db
      .update(users)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<User | null> {
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    return rows[0] ?? null;
  },
};
