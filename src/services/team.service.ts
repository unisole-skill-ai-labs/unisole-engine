import { db, pool } from "../db";
import { eq, desc, asc, and, ilike } from "drizzle-orm";
import {
  users,
  tasks,
  teamDepartments,
  taskTemplates,
  dailyEodLogs,
  TeamDepartment,
  TaskTemplate,
  DailyEodLog,
  NewTeamDepartment,
  NewTaskTemplate,
  NewDailyEodLog,
} from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const teamService = {
  // ==================== TEAM DIRECTORY & MEMBERS ====================
  async listMembers(search?: string): Promise<any[]> {
    const res = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.phone,
        u.email,
        u.role,
        u.designation,
        u.department_id as "departmentId",
        d.name as "departmentName",
        d.color as "departmentColor",
        u.is_active as "isActive",
        u.created_at as "createdAt",
        COUNT(t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS'))::int as "activeTasksCount",
        COUNT(t.id) FILTER (WHERE t.status = 'BLOCKED')::int as "blockedTasksCount",
        COUNT(t.id) FILTER (WHERE t.status = 'SUBMITTED_FOR_REVIEW')::int as "reviewTasksCount",
        COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasksCount"
      FROM users u
      LEFT JOIN team_departments d ON u.department_id = d.id
      LEFT JOIN tasks t ON t.assignee_id = u.id
      WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER')
        AND ($1::text IS NULL OR u.name ILIKE $1 OR u.phone ILIKE $1)
      GROUP BY u.id, d.name, d.color
      ORDER BY 
        CASE WHEN u.role = 'SUPER_ADMIN' THEN 1 WHEN u.role = 'ADMIN' THEN 2 ELSE 3 END,
        u.name ASC`,
      [search ? `%${search.trim()}%` : null]
    );

    return res.rows;
  },

  async createMember(data: {
    phone: string;
    name: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    departmentId?: string;
    designation?: string;
  }): Promise<any> {
    if (!data.phone || !data.name) {
      throw new ValidationError("Phone number and name are required");
    }

    const cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const existing = await db.select().from(users).where(eq(users.phone, cleanPhone)).limit(1);
    if (existing.length > 0) {
      // Update existing user to team role
      await db
        .update(users)
        .set({
          name: data.name.trim(),
          role: (data.role as any) || "MEMBER",
          departmentId: data.departmentId || null,
          designation: data.designation || null,
          isActive: true,
        })
        .where(eq(users.phone, cleanPhone));
    } else {
      await db.insert(users).values({
        phone: cleanPhone,
        name: data.name.trim(),
        role: (data.role as any) || "MEMBER",
        departmentId: data.departmentId || null,
        designation: data.designation || null,
        isActive: true,
      });
    }

    const members = await this.listMembers();
    return members.find((m) => m.phone === cleanPhone);
  },

  async updateMember(
    userId: string,
    data: {
      name?: string;
      role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
      departmentId?: string;
      designation?: string;
      isActive?: boolean;
    }
  ): Promise<any> {
    const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRes.length === 0) throw new NotFoundError("User not found");

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId || null;
    if (data.designation !== undefined) updatePayload.designation = data.designation;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    await db.update(users).set(updatePayload).where(eq(users.id, userId));

    const updated = await this.listMembers();
    return updated.find((m) => m.id === userId);
  },

  async deleteMember(userId: string): Promise<boolean> {
    const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRes.length === 0) throw new NotFoundError("User not found");

    // Deactivate user rather than hard-deleting foreign keys
    await db.update(users).set({ isActive: false, role: "STUDENT" }).where(eq(users.id, userId));
    return true;
  },

  // ==================== DEPARTMENTS ====================
  async listDepartments(): Promise<any[]> {
    const res = await pool.query(`
      SELECT 
        d.id,
        d.name,
        d.code,
        d.color,
        d.description,
        d.lead_id as "leadId",
        u.name as "leadName",
        d.created_at as "createdAt",
        COUNT(DISTINCT mem.id)::int as "membersCount",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'BLOCKED'))::int as "activeTasksCount"
      FROM team_departments d
      LEFT JOIN users u ON d.lead_id = u.id
      LEFT JOIN users mem ON mem.department_id = d.id AND mem.role IN ('MEMBER', 'ADMIN', 'SUPER_ADMIN')
      LEFT JOIN tasks t ON t.department_id = d.id
      GROUP BY d.id, u.name
      ORDER BY d.name ASC;
    `);
    return res.rows;
  },

  async createDepartment(data: {
    name: string;
    code: string;
    color?: string;
    description?: string;
    leadId?: string;
  }): Promise<TeamDepartment> {
    if (!data.name || !data.code) throw new ValidationError("Department name and code are required");

    const code = data.code.trim().toUpperCase();
    const existing = await db
      .select()
      .from(teamDepartments)
      .where(eq(teamDepartments.code, code))
      .limit(1);
    if (existing.length > 0) throw new ConflictError("Department code already exists");

    const [created] = await db
      .insert(teamDepartments)
      .values({
        name: data.name.trim(),
        code,
        color: data.color || "#6366f1",
        description: data.description || null,
        leadId: data.leadId || null,
      })
      .returning();

    return created;
  },

  async updateDepartment(
    departmentId: string,
    data: {
      name?: string;
      color?: string;
      description?: string;
      leadId?: string;
    }
  ): Promise<any> {
    const deptRes = await db.select().from(teamDepartments).where(eq(teamDepartments.id, departmentId)).limit(1);
    if (deptRes.length === 0) throw new NotFoundError("Department not found");

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.leadId !== undefined) updatePayload.leadId = data.leadId || null;

    await db.update(teamDepartments).set(updatePayload).where(eq(teamDepartments.id, departmentId));

    const depts = await this.listDepartments();
    return depts.find((d) => d.id === departmentId);
  },

  async deleteDepartment(departmentId: string): Promise<boolean> {
    const deptRes = await db.select().from(teamDepartments).where(eq(teamDepartments.id, departmentId)).limit(1);
    if (deptRes.length === 0) throw new NotFoundError("Department not found");

    // Unlink users and tasks before deletion
    await db.update(users).set({ departmentId: null }).where(eq(users.departmentId, departmentId));
    await db.update(tasks).set({ departmentId: null }).where(eq(tasks.departmentId, departmentId));
    await db.delete(teamDepartments).where(eq(teamDepartments.id, departmentId));
    return true;
  },

  // ==================== SOP TEMPLATES ====================
  async listTemplates(departmentId?: string): Promise<any[]> {
    let query = db
      .select({
        id: taskTemplates.id,
        title: taskTemplates.title,
        description: taskTemplates.description,
        departmentId: taskTemplates.departmentId,
        departmentName: teamDepartments.name,
        departmentColor: teamDepartments.color,
        defaultChecklist: taskTemplates.defaultChecklist,
        guidelinesUrl: taskTemplates.guidelinesUrl,
        estimatedHours: taskTemplates.estimatedHours,
        createdById: taskTemplates.createdById,
        creatorName: users.name,
        createdAt: taskTemplates.createdAt,
      })
      .from(taskTemplates)
      .leftJoin(teamDepartments, eq(taskTemplates.departmentId, teamDepartments.id))
      .leftJoin(users, eq(taskTemplates.createdById, users.id))
      .$dynamic();

    if (departmentId) {
      query = query.where(eq(taskTemplates.departmentId, departmentId));
    }

    return query.orderBy(asc(taskTemplates.title));
  },

  async createTemplate(
    data: {
      title: string;
      description?: string;
      departmentId?: string;
      defaultChecklist: string[];
      guidelinesUrl?: string;
      estimatedHours?: number;
    },
    createdById: string
  ): Promise<any> {
    if (!data.title || !data.title.trim()) {
      throw new ValidationError("Template title is required");
    }

    const [created] = await db
      .insert(taskTemplates)
      .values({
        title: data.title.trim(),
        description: data.description || null,
        departmentId: data.departmentId || null,
        defaultChecklist: (data.defaultChecklist || []) as any,
        guidelinesUrl: data.guidelinesUrl || null,
        estimatedHours: data.estimatedHours || 2,
        createdById,
      })
      .returning();

    return created;
  },

  async updateTemplate(
    templateId: string,
    data: {
      title?: string;
      description?: string;
      departmentId?: string;
      defaultChecklist?: string[];
      guidelinesUrl?: string;
      estimatedHours?: number;
    }
  ): Promise<any> {
    const tmplRes = await db.select().from(taskTemplates).where(eq(taskTemplates.id, templateId)).limit(1);
    if (tmplRes.length === 0) throw new NotFoundError("Template not found");

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId || null;
    if (data.defaultChecklist !== undefined) updatePayload.defaultChecklist = data.defaultChecklist as any;
    if (data.guidelinesUrl !== undefined) updatePayload.guidelinesUrl = data.guidelinesUrl;
    if (data.estimatedHours !== undefined) updatePayload.estimatedHours = data.estimatedHours;

    await db.update(taskTemplates).set(updatePayload).where(eq(taskTemplates.id, templateId));

    const list = await this.listTemplates();
    return list.find((t) => t.id === templateId);
  },

  async deleteTemplate(templateId: string): Promise<boolean> {
    const tmplRes = await db.select().from(taskTemplates).where(eq(taskTemplates.id, templateId)).limit(1);
    if (tmplRes.length === 0) throw new NotFoundError("Template not found");

    await db.delete(taskTemplates).where(eq(taskTemplates.id, templateId));
    return true;
  },

  // ==================== DAILY EOD LOGS ====================
  async submitDailyEod(
    userId: string,
    data: {
      logDate?: string;
      completedSummary: string;
      planTomorrow: string;
      blockers?: string;
    }
  ): Promise<DailyEodLog> {
    if (!data.completedSummary || !data.planTomorrow) {
      throw new ValidationError("Completed summary and plan for tomorrow are required");
    }

    const logDate = data.logDate || new Date().toISOString().split("T")[0];

    // Delete existing log for same user and date to allow update
    await pool.query("DELETE FROM daily_eod_logs WHERE user_id = $1 AND log_date = $2", [
      userId,
      logDate,
    ]);

    const [created] = await db
      .insert(dailyEodLogs)
      .values({
        userId,
        logDate,
        completedSummary: data.completedSummary.trim(),
        planTomorrow: data.planTomorrow.trim(),
        blockers: data.blockers ? data.blockers.trim() : null,
      })
      .returning();

    return created;
  },

  async listDailyEodLogs(date?: string, userId?: string): Promise<any[]> {
    const targetDate = date || new Date().toISOString().split("T")[0];

    const res = await pool.query(
      `SELECT 
        e.id,
        e.user_id as "userId",
        u.name as "userName",
        u.role as "userRole",
        u.phone as "userPhone",
        d.name as "departmentName",
        d.color as "departmentColor",
        e.log_date as "logDate",
        e.completed_summary as "completedSummary",
        e.plan_tomorrow as "planTomorrow",
        e.blockers,
        e.created_at as "createdAt"
      FROM daily_eod_logs e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN team_departments d ON u.department_id = d.id
      WHERE e.log_date = $1
        AND ($2::varchar IS NULL OR e.user_id = $2)
      ORDER BY e.created_at DESC`,
      [targetDate, userId || null]
    );

    return res.rows;
  },
};
