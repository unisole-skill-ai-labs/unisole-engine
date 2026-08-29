import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { branches, Branch, NewBranch } from "../db/schema";

export const branchesRepository = {
  async list(): Promise<Branch[]> {
    return db.select().from(branches).orderBy(branches.name);
  },

  async listActive(): Promise<Branch[]> {
    return db.select().from(branches).where(eq(branches.isActive, true)).orderBy(branches.name);
  },

  async getById(id: string): Promise<Branch | null> {
    const rows = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getByName(name: string): Promise<Branch | null> {
    const rows = await db.select().from(branches).where(eq(branches.name, name)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewBranch): Promise<Branch> {
    const rows = await db.insert(branches).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewBranch, "id">>): Promise<Branch | null> {
    const rows = await db
      .update(branches)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(branches.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Branch | null> {
    const rows = await db.delete(branches).where(eq(branches.id, id)).returning();
    return rows[0] ?? null;
  },
};
