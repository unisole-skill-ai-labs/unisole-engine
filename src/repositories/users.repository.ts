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
    const rows = await db.insert(users).values({ ...data, id }).returning();
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
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const userRes = await client.query("SELECT * FROM users WHERE id = $1", [id]);
      const user = userRes.rows[0];
      if (!user) {
        await client.query("ROLLBACK");
        return null;
      }

      // 1. Delete payments belonging to this user
      await client.query("DELETE FROM payments WHERE user_id = $1", [id]);

      // 2. Delete enrollments belonging to this user
      await client.query("DELETE FROM enrollments WHERE user_id = $1", [id]);

      // 3. Delete daily EOD logs
      await client.query("DELETE FROM daily_eod_logs WHERE user_id = $1", [id]);

      // 4. Delete task comments
      await client.query("DELETE FROM task_comments WHERE user_id = $1", [id]);

      // 5. Clean up tasks assignee / reporter
      await client.query("UPDATE tasks SET assignee_id = NULL WHERE assignee_id = $1", [id]);
      await client.query("UPDATE tasks SET reporter_id = NULL WHERE reporter_id = $1", [id]);

      // 6. Clean up task templates created_by
      await client.query("UPDATE task_templates SET created_by_id = NULL WHERE created_by_id = $1", [id]);

      // 7. Clean up team departments lead_id
      await client.query("UPDATE team_departments SET lead_id = NULL WHERE lead_id = $1", [id]);

      // 8. Clean up presentations created_by_id
      await client.query("UPDATE presentations SET created_by_id = NULL WHERE created_by_id = $1", [id]);

      // 9. Clean up presentation leads and OTP verifications
      if (user.phone) {
        await client.query("DELETE FROM presentation_leads WHERE user_id = $1 OR phone = $2", [id, user.phone]);
        await client.query("DELETE FROM otp_verifications WHERE phone = $1", [user.phone]);
      } else {
        await client.query("DELETE FROM presentation_leads WHERE user_id = $1", [id]);
      }

      // 10. Delete the user record
      const deletedRes = await client.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
      await client.query("COMMIT");

      return deletedRes.rows[0] ?? null;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
