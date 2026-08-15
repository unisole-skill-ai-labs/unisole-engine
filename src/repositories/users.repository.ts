import { eq } from "drizzle-orm";
import { db } from "../db";
import { NewUser, User, users } from "../db/schema";

export const usersRepository = {
  async list(): Promise<User[]> {
    return await db.select().from(users);
  },
  async getById(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0];
  },
  async create(values: NewUser): Promise<User> {
    const rows = await db.insert(users).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewUser>
  ): Promise<User | undefined> {
    const rows = await db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<User | undefined> {
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    return rows[0];
  },
};
