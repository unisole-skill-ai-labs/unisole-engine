import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, User, NewUser } from "../db/schema";

export const usersRepository = {
  async list(): Promise<User[]> {
    return db.select().from(users);
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
    const rows = await db.insert(users).values(data).returning();
    return rows[0];
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
