import { eq, and, isNull, or, desc } from "drizzle-orm";
import { db, pool } from "../db";
import { branches, Branch, NewBranch } from "../db/schema";

export const branchesRepository = {
  async list(collegeId?: string): Promise<Branch[]> {
    try {
      if (collegeId) {
        return await db
          .select()
          .from(branches)
          .where(eq(branches.collegeId, collegeId))
          .orderBy(branches.name);
      }
      return await db.select().from(branches).orderBy(branches.name);
    } catch (err: any) {
      console.warn("[branchesRepository.list] Warning:", err.message);
      return [];
    }
  },

  async listActive(collegeId?: string): Promise<Branch[]> {
    try {
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
        return await db
          .select()
          .from(branches)
          .where(and(isNull(branches.collegeId), eq(branches.isActive, true)))
          .orderBy(branches.name);
      }

      return await db
        .select()
        .from(branches)
        .where(eq(branches.isActive, true))
        .orderBy(branches.name);
    } catch (err: any) {
      console.warn("[branchesRepository.listActive] Warning:", err.message);
      return [];
    }
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
    const id = data.id || `brn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const rows = await db.insert(branches).values({ ...data, id }).returning();
      return rows[0];
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      // Fallback 1: Missing column (e.g. code, description) on older schemas
      if (errMsg.includes('column "code"') || errMsg.includes('column "description"')) {
        try {
          const res = await pool.query(
            `INSERT INTO branches (id, college_id, name, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [id, data.collegeId, data.name, data.isActive ?? true]
          );
          return res.rows[0];
        } catch (innerErr) {
          throw innerErr;
        }
      }
      throw err;
    }
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
