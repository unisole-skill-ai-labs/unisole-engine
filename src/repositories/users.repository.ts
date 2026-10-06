import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { users, User, NewUser } from "../db/schema";

export const usersRepository = {
  async list(filters?: {
    collegeId?: string;
    branch?: string;
    role?: string;
    signupSource?: string;
    signupSessionCode?: string;
    search?: string;
    enrolledOnly?: boolean;
    courseId?: string;
  }): Promise<any[]> {
    const whereClauses: any[] = [];

    if (filters?.collegeId) {
      whereClauses.push(sql`u.college_id = ${filters.collegeId}`);
    }
    if (filters?.branch) {
      whereClauses.push(sql`(u.branch = ${filters.branch} OR u.branch ILIKE ${`%${filters.branch}%`})`);
    }
    if (filters?.role) {
      whereClauses.push(sql`u.role::text = ${filters.role}`);
    }
    if (filters?.signupSource) {
      whereClauses.push(sql`u.signup_source = ${filters.signupSource}`);
    }
    if (filters?.signupSessionCode) {
      whereClauses.push(sql`u.signup_session_code = ${filters.signupSessionCode}`);
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      whereClauses.push(sql`(
        u.name ILIKE ${q} OR 
        u.phone ILIKE ${q} OR 
        u.email ILIKE ${q} OR 
        u.branch ILIKE ${q} OR 
        u.college_name ILIKE ${q} OR
        u.signup_source ILIKE ${q} OR
        u.signup_session_code ILIKE ${q}
      )`);
    }

    if (filters?.enrolledOnly) {
      whereClauses.push(sql`EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.user_id = u.id AND e.status::text IN ('ACTIVE', 'PENDING', 'COMPLETED')
      )`);
    }

    if (filters?.courseId) {
      whereClauses.push(sql`EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.user_id = u.id 
          AND (e.item_id = ${filters.courseId} OR e.pathway_id = ${filters.courseId})
      )`);
    }

    const whereSql = whereClauses.length > 0 ? sql`WHERE ${sql.join(whereClauses, sql` AND `)}` : sql``;

    const result = await db.execute<any>(sql`
      SELECT 
        u.id,
        u.name,
        u.username,
        u.phone,
        u.email,
        u.role,
        u.college_id as "collegeId",
        u.college_name as "collegeName",
        u.branch,
        u.department_id as "departmentId",
        u.designation,
        u.is_active as "isActive",
        u.signup_source as "signupSource",
        u.signup_session_code as "signupSessionCode",
        u.metadata,
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', COALESCE(c.id, p.id, e.item_id),
                'title', COALESCE(c.title, p.title, e.item_id, 'Enrolled Course'),
                'slug', COALESCE(c.slug, p.slug, ''),
                'status', e.status,
                'source', e.source,
                'enrolledAt', e.enrolled_at,
                'orderId', e.order_id
              ) ORDER BY e.enrolled_at DESC NULLS LAST
            )
            FROM enrollments e
            LEFT JOIN courses c ON (e.item_id = c.id OR e.pathway_id = c.id OR e.item_id = c.slug OR e.pathway_id = c.slug)
            LEFT JOIN pathways p ON (e.pathway_id = p.id OR e.item_id = p.id OR e.pathway_id = p.slug OR e.item_id = p.slug)
            WHERE e.user_id = u.id
          ),
          '[]'::json
        ) as "enrolledCourses",
        (
          SELECT JSON_BUILD_OBJECT(
            'id', mm.id,
            'mentorId', m.id,
            'mentorUserId', u_m.id,
            'mentorName', u_m.name,
            'mentorEmail', u_m.email,
            'specialization', m.specialization,
            'courseId', mm.course_id,
            'assignedAt', mm.assigned_at
          )
          FROM mentor_mentees mm
          JOIN mentors m ON m.id = mm.mentor_id
          JOIN users u_m ON u_m.id = m.user_id
          WHERE mm.mentee_id = u.id AND mm.status = 'ACTIVE'
          ORDER BY mm.assigned_at DESC NULLS LAST
          LIMIT 1
        ) as "assignedMentor",
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', mm.id,
                'mentorId', m.id,
                'mentorUserId', u_m.id,
                'mentorName', u_m.name,
                'mentorEmail', u_m.email,
                'specialization', m.specialization,
                'courseId', mm.course_id,
                'assignedAt', mm.assigned_at
              ) ORDER BY mm.assigned_at DESC NULLS LAST
            )
            FROM mentor_mentees mm
            JOIN mentors m ON m.id = mm.mentor_id
            JOIN users u_m ON u_m.id = m.user_id
            WHERE mm.mentee_id = u.id AND mm.status = 'ACTIVE'
          ),
          '[]'::json
        ) as "assignedMentors"
      FROM users u
      ${whereSql}
      ORDER BY u.created_at DESC;
    `);

    return (result.rows || result).map((r: any) => ({
      ...r,
      enrolledCourses: Array.isArray(r.enrolledCourses) ? r.enrolledCourses : [],
      assignedMentors: Array.isArray(r.assignedMentors) ? r.assignedMentors : [],
    }));
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
    return await db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, id));
      if (!user) return null;

      // 1. Delete payments belonging to this user or orders belonging to this user
      await tx.execute(sql`DELETE FROM payments WHERE user_id = ${id} OR order_id IN (SELECT id FROM orders WHERE user_id = ${id})`);

      // 2. Delete enrollments belonging to this user
      await tx.execute(sql`DELETE FROM enrollments WHERE user_id = ${id}`);

      // 3. Delete daily EOD logs
      await tx.execute(sql`DELETE FROM daily_eod_logs WHERE user_id = ${id}`);

      // 4. Delete task comments
      await tx.execute(sql`DELETE FROM task_comments WHERE user_id = ${id}`);

      // 5. Clean up tasks assignee / reporter / subtasks
      await tx.execute(sql`UPDATE tasks SET assignee_id = NULL WHERE assignee_id = ${id}`);
      await tx.execute(sql`UPDATE tasks SET reporter_id = NULL WHERE reporter_id = ${id}`);
      await tx.execute(sql`UPDATE task_subtasks SET completed_by_id = NULL WHERE completed_by_id = ${id}`);

      // 6. Clean up task templates created_by
      await tx.execute(sql`UPDATE task_templates SET created_by_id = NULL WHERE created_by_id = ${id}`);

      // 7. Clean up team departments lead_id
      await tx.execute(sql`UPDATE team_departments SET lead_id = NULL WHERE lead_id = ${id}`);

      // 8. Clean up projects & sub-projects
      await tx.execute(sql`UPDATE projects SET lead_id = NULL WHERE lead_id = ${id}`);
      await tx.execute(sql`UPDATE projects SET created_by_id = NULL WHERE created_by_id = ${id}`);
      await tx.execute(sql`UPDATE sub_projects SET lead_id = NULL WHERE lead_id = ${id}`);

      // 9. Clean up presentations created_by_id
      await tx.execute(sql`UPDATE presentations SET created_by_id = NULL WHERE created_by_id = ${id}`);

      // 10. Clean up coupons created_by_id
      await tx.execute(sql`UPDATE coupons SET created_by_id = NULL WHERE created_by_id = ${id}`);

      // 11. Clean up orders and order items belonging to this user
      await tx.execute(sql`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ${id})`);
      await tx.execute(sql`DELETE FROM orders WHERE user_id = ${id}`);

      // 12. Clean up leads references & call logs
      await tx.execute(sql`DELETE FROM lead_call_logs WHERE caller_user_id = ${id}`);
      await tx.execute(sql`UPDATE leads SET user_id = NULL WHERE user_id = ${id}`);
      await tx.execute(sql`UPDATE leads SET assigned_to_user_id = NULL WHERE assigned_to_user_id = ${id}`);
      await tx.execute(sql`UPDATE leads SET created_by_id = NULL WHERE created_by_id = ${id}`);

      // 13. Clean up IAPT registrations
      await tx.execute(sql`DELETE FROM iapt_nain_registrations WHERE user_id = ${id}`);

      // 14. Clean up presentation leads and OTP verifications
      if (user.phone) {
        await tx.execute(sql`DELETE FROM presentation_leads WHERE user_id = ${id} OR phone = ${user.phone}`);
        await tx.execute(sql`DELETE FROM otp_verifications WHERE phone = ${user.phone}`);
      } else {
        await tx.execute(sql`DELETE FROM presentation_leads WHERE user_id = ${id}`);
      }

      // 15. Delete the user record
      const [deleted] = await tx.delete(users).where(eq(users.id, id)).returning();
      return deleted ?? null;
    });
  },
};
