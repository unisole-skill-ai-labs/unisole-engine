import { eq, and, or, ilike, desc } from "drizzle-orm";
import { db, pool } from "../db";
import { users, User, NewUser } from "../db/schema";

export const usersRepository = {
  async list(filters?: {
    collegeId?: string;
    branch?: string;
    role?: string;
    signupSource?: string;
    signupSessionCode?: string;
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
    if (filters?.signupSource) {
      conditions.push(eq(users.signupSource, filters.signupSource));
    }
    if (filters?.signupSessionCode) {
      conditions.push(eq(users.signupSessionCode, filters.signupSessionCode));
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(users.name, q),
          ilike(users.phone, q),
          ilike(users.branch, q),
          ilike(users.collegeName, q),
          ilike(users.signupSource, q),
          ilike(users.signupSessionCode, q)
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
    const id = data.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const rows = await db.insert(users).values({ ...data, id }).returning();
      return rows[0];
    } catch (err: any) {
      console.warn("[usersRepository.create] Primary insert attempt failed, triggering self-healing migration:", err?.message || err);

      try {
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name VARCHAR(200)");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100)");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_source VARCHAR(50) DEFAULT 'NON_PAMPHLET'");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_session_code VARCHAR(50)");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_college_id VARCHAR(50)");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_college_name VARCHAR(200)");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb");
      } catch (migErr) {
        console.warn("[usersRepository.create] Auto-migration notice:", migErr);
      }

      try {
        const res = await pool.query(
          `INSERT INTO users (id, phone, name, college_id, college_name, branch, role, is_active, signup_source, signup_session_code, signup_college_id, signup_college_name, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
           RETURNING *`,
          [
            id,
            data.phone,
            data.name ?? null,
            data.collegeId ?? null,
            data.collegeName ?? null,
            data.branch ?? null,
            data.role ?? "STUDENT",
            data.isActive ?? true,
            data.signupSource ?? "NON_PAMPHLET",
            data.signupSessionCode ?? null,
            data.signupCollegeId ?? null,
            data.signupCollegeName ?? null,
            JSON.stringify(data.metadata ?? {}),
          ]
        );
        return res.rows[0];
      } catch (rawErr: any) {
        try {
          const res2 = await pool.query(
            `INSERT INTO users (id, phone, name, role, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING *`,
            [id, data.phone, data.name ?? null, data.role ?? "STUDENT", data.isActive ?? true]
          );
          return res2.rows[0];
        } catch (innerErr) {
          throw rawErr || innerErr;
        }
      }
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
