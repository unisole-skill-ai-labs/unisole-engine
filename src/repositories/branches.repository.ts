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
      console.warn("[branchesRepository.list] Drizzle select failed, running self-healing column sync:", err?.message || err);
      try {
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(100)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS description TEXT");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL");
        
        const query = collegeId
          ? `SELECT * FROM branches WHERE college_id = $1 ORDER BY name ASC`
          : `SELECT * FROM branches ORDER BY name ASC`;
        const res = collegeId ? await pool.query(query, [collegeId]) : await pool.query(query);
        return res.rows;
      } catch (innerErr) {
        console.warn("[branchesRepository.list] Fallback query notice:", innerErr);
        return [];
      }
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
      try {
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(100)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS description TEXT");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL");

        const query = collegeId
          ? `SELECT * FROM branches WHERE (college_id = $1 OR college_id IS NULL) AND is_active = true ORDER BY name ASC`
          : `SELECT * FROM branches WHERE is_active = true ORDER BY name ASC`;
        const res = collegeId ? await pool.query(query, [collegeId]) : await pool.query(query);
        return res.rows;
      } catch (innerErr) {
        return [];
      }
    }
  },

  async listByCollege(collegeId: string): Promise<Branch[]> {
    return this.list(collegeId);
  },

  async getById(id: string): Promise<Branch | null> {
    try {
      const rows = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
      return rows[0] ?? null;
    } catch (err: any) {
      try {
        const res = await pool.query("SELECT * FROM branches WHERE id = $1 LIMIT 1", [id]);
        return res.rows[0] ?? null;
      } catch (innerErr) {
        return null;
      }
    }
  },

  async getByName(name: string): Promise<Branch | null> {
    try {
      const rows = await db.select().from(branches).where(eq(branches.name, name)).limit(1);
      return rows[0] ?? null;
    } catch (err: any) {
      try {
        const res = await pool.query("SELECT * FROM branches WHERE name = $1 LIMIT 1", [name]);
        return res.rows[0] ?? null;
      } catch (innerErr) {
        return null;
      }
    }
  },

  async create(data: NewBranch): Promise<Branch> {
    const id = data.id || `brn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const rows = await db.insert(branches).values({ ...data, id }).returning();
      return rows[0];
    } catch (err: any) {
      console.warn("[branchesRepository.create] Primary insert attempt failed, triggering self-healing migration:", err?.message || err);

      // Step 1: Self-healing schema synchronization
      try {
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(100)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS description TEXT");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL");
        await pool.query("ALTER TABLE branches ALTER COLUMN id SET DEFAULT ('brn_' || nextval('branches_id_seq'::regclass))");
      } catch (migErr) {
        console.warn("[branchesRepository.create] Auto-migration notice:", migErr);
      }

      // Step 2: Try raw SQL insert with all columns
      try {
        const res = await pool.query(
          `INSERT INTO branches (id, college_id, name, code, description, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING *`,
          [id, data.collegeId, data.name, data.code ?? null, data.description ?? null, data.isActive ?? true]
        );
        return res.rows[0];
      } catch (rawErr: any) {
        console.warn("[branchesRepository.create] Full raw insert failed, attempting legacy column insert:", rawErr?.message || rawErr);

        // Step 3: Fallback insert without code and description for legacy schemas
        try {
          const res2 = await pool.query(
            `INSERT INTO branches (id, college_id, name, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [id, data.collegeId, data.name, data.isActive ?? true]
          );
          return res2.rows[0];
        } catch (innerErr) {
          throw rawErr || innerErr;
        }
      }
    }
  },

  async update(id: string, data: Partial<Omit<NewBranch, "id">>): Promise<Branch | null> {
    try {
      const rows = await db
        .update(branches)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(branches.id, id))
        .returning();
      return rows[0] ?? null;
    } catch (err: any) {
      try {
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(100)");
        await pool.query("ALTER TABLE branches ADD COLUMN IF NOT EXISTS description TEXT");
        
        const sets: string[] = ["updated_at = NOW()"];
        const values: any[] = [];
        let i = 1;

        if (data.name !== undefined) {
          sets.push(`name = $${i++}`);
          values.push(data.name);
        }
        if (data.code !== undefined) {
          sets.push(`code = $${i++}`);
          values.push(data.code);
        }
        if (data.description !== undefined) {
          sets.push(`description = $${i++}`);
          values.push(data.description);
        }
        if (data.isActive !== undefined) {
          sets.push(`is_active = $${i++}`);
          values.push(data.isActive);
        }
        if (data.collegeId !== undefined) {
          sets.push(`college_id = $${i++}`);
          values.push(data.collegeId);
        }

        values.push(id);
        const res = await pool.query(
          `UPDATE branches SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
          values
        );
        return res.rows[0] ?? null;
      } catch (innerErr) {
        throw err;
      }
    }
  },

  async remove(id: string): Promise<Branch | null> {
    try {
      const rows = await db.delete(branches).where(eq(branches.id, id)).returning();
      return rows[0] ?? null;
    } catch (err: any) {
      try {
        const res = await pool.query("DELETE FROM branches WHERE id = $1 RETURNING *", [id]);
        return res.rows[0] ?? null;
      } catch (innerErr) {
        throw err;
      }
    }
  },
};
