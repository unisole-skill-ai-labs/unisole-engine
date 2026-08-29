import { eq, and, isNull, or, desc } from "drizzle-orm";
import { db } from "../db";
import { branches, Branch, NewBranch } from "../db/schema";

export const branchesRepository = {
  async list(collegeId?: string): Promise<Branch[]> {
    if (collegeId) {
      return db
        .select()
        .from(branches)
        .where(eq(branches.collegeId, collegeId))
        .orderBy(branches.name);
    }
    return db.select().from(branches).orderBy(branches.name);
  },

  async listActive(collegeId?: string): Promise<Branch[]> {
    if (collegeId) {
      // First check if this college has specific branches
      const collegeBranches = await db
        .select()
        .from(branches)
        .where(and(eq(branches.collegeId, collegeId), eq(branches.isActive, true)))
        .orderBy(branches.name);

      if (collegeBranches.length > 0) {
        return collegeBranches;
      }

      // If no specific branches yet, return global template branches (collegeId is null)
      return db
        .select()
        .from(branches)
        .where(and(isNull(branches.collegeId), eq(branches.isActive, true)))
        .orderBy(branches.name);
    }

    return db
      .select()
      .from(branches)
      .where(eq(branches.isActive, true))
      .orderBy(branches.name);
  },

  async listByCollege(collegeId: string): Promise<Branch[]> {
    return db
      .select()
      .from(branches)
      .where(eq(branches.collegeId, collegeId))
      .orderBy(branches.name);
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
