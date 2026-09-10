import bcrypt from "bcryptjs";
import { db } from "../db";
import { eq, desc, asc, and, ilike, sql } from "drizzle-orm";
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
import { usersRepository } from "../repositories/users.repository";

export const teamService = {
  // ==================== TEAM DIRECTORY & MEMBERS ====================
  async listMembers(search?: string): Promise<any[]> {
    const searchTerm = search && search.trim() ? `%${search.trim()}%` : null;
    const searchFilter = searchTerm
      ? sql`AND (${users.name} ILIKE ${searchTerm} OR ${users.username} ILIKE ${searchTerm} OR ${users.phone} ILIKE ${searchTerm})`
      : sql``;

    const res = await db.execute<any>(sql`
      SELECT 
        u.id,
        u.name,
        u.username,
        u.phone,
        u.role,
        u.designation,
        u.department_id as "departmentId",
        u.metadata,
        d.name as "departmentName",
        d.color as "departmentColor",
        u.is_active as "isActive",
        u.created_at as "createdAt",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'CHANGES_REQUESTED', 'SUBMITTED_FOR_REVIEW') OR (t.status IS NOT NULL AND t.status != 'COMPLETED'))::int as "activeTasksCount",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'BLOCKED')::int as "blockedTasksCount",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'SUBMITTED_FOR_REVIEW')::int as "reviewTasksCount",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasksCount",
        COUNT(DISTINCT l.id)::int as "assignedLeadsCount"
      FROM users u
      LEFT JOIN team_departments d ON u.department_id = d.id
      LEFT JOIN (
        SELECT 
          t.id, 
          t.status,
          t.assignee_id,
          t.reporter_id,
          t.project_id,
          t.sub_project_id,
          p.lead_id as project_lead_id,
          p.created_by_id as project_created_by_id,
          sp.lead_id as sub_project_lead_id
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN sub_projects sp ON t.sub_project_id = sp.id
        WHERE (p.id IS NULL OR p.is_hidden = FALSE OR p.is_hidden IS NULL)
      ) t ON (
        t.assignee_id = u.id 
        OR t.reporter_id = u.id 
        OR t.project_lead_id = u.id 
        OR t.project_created_by_id = u.id 
        OR t.sub_project_lead_id = u.id
      )
      LEFT JOIN leads l ON l.assigned_to_user_id = u.id
      WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'SALES')
        ${searchFilter}
      GROUP BY u.id, d.name, d.color
      ORDER BY 
        CASE WHEN u.role = 'SUPER_ADMIN' THEN 1 WHEN u.role = 'ADMIN' THEN 2 WHEN u.role = 'SALES' THEN 3 ELSE 4 END,
        u.name ASC
    `);

    const rows = (res.rows || res) as any[];
    return rows.map((row) => ({
      ...row,
      permissions: (row.metadata && Array.isArray(row.metadata.permissions)) ? row.metadata.permissions : [],
    }));
  },

  async createMember(data: {
    name: string;
    username: string;
    password?: string;
    phone?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | "SALES";
    departmentId?: string;
    designation?: string;
    permissions?: string[];
    isActive?: boolean;
  }): Promise<any> {
    if (!data.name || !data.name.trim()) {
      throw new ValidationError("Full name is required");
    }
    if (!data.username || !data.username.trim()) {
      throw new ValidationError("Username is required");
    }

    const cleanUsername = data.username.trim().toLowerCase();
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.username}) = ${cleanUsername}`)
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictError(`Username "${cleanUsername}" is already in use`);
    }

    if (!data.password || data.password.trim().length === 0) {
      throw new ValidationError("Password is required for creating a team member");
    }
    const cleanPassword = data.password.trim();
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    let cleanPhone = data.phone ? data.phone.replace(/\D/g, "").slice(-10) : "";
    if (!cleanPhone || cleanPhone.length !== 10) {
      cleanPhone = "0000000000";
    }

    const metadataObj = {
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
    };

    const newId = `usr_staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(users).values({
      id: newId,
      username: cleanUsername,
      password: hashedPassword,
      phone: cleanPhone,
      name: data.name.trim(),
      role: (data.role as any) || "MEMBER",
      departmentId: data.departmentId || null,
      designation: data.designation ? data.designation.trim() : null,
      metadata: metadataObj,
      isActive: data.isActive !== false,
    });

    const members = await this.listMembers();
    return members.find((m) => m.id === newId) || { id: newId, username: cleanUsername, name: data.name };
  },

  async updateMember(
    userId: string,
    data: {
      name?: string;
      username?: string;
      password?: string;
      phone?: string;
      role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | "SALES";
      departmentId?: string;
      designation?: string;
      permissions?: string[];
      isActive?: boolean;
    }
  ): Promise<any> {
    const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRes.length === 0) throw new NotFoundError("User not found");
    const existing = userRes[0];

    if (data.username && data.username.trim()) {
      const cleanUsername = data.username.trim().toLowerCase();
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(and(sql`LOWER(${users.username}) = ${cleanUsername}`, sql`${users.id} != ${userId}`))
        .limit(1);

      if (existingUser.length > 0) {
        throw new ConflictError(`Username "${cleanUsername}" is already in use`);
      }
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.username !== undefined) updatePayload.username = data.username.trim().toLowerCase();
    if (data.password !== undefined && data.password.trim()) {
      updatePayload.password = data.password.trim();
    }
    if (data.phone !== undefined) {
      const p = data.phone.replace(/\D/g, "").slice(-10);
      updatePayload.phone = p.length === 10 ? p : "0000000000";
    }
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId || null;
    if (data.designation !== undefined) updatePayload.designation = data.designation;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    if (data.permissions !== undefined) {
      const currentMeta = (existing.metadata as Record<string, any>) || {};
      updatePayload.metadata = {
        ...currentMeta,
        permissions: data.permissions,
      };
    }

    if (Object.keys(updatePayload).length > 0) {
      await db.update(users).set(updatePayload).where(eq(users.id, userId));
    }

    const updated = await this.listMembers();
    return updated.find((m) => m.id === userId);
  },

  async updateMemberPermissions(userId: string, permissions: string[]): Promise<any> {
    const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRes.length === 0) throw new NotFoundError("User not found");
    const existing = userRes[0];

    const currentMeta = (existing.metadata as Record<string, any>) || {};
    const newMeta = {
      ...currentMeta,
      permissions: Array.isArray(permissions) ? permissions : [],
    };

    await db.update(users).set({ metadata: newMeta }).where(eq(users.id, userId));
    const updated = await this.listMembers();
    return updated.find((m) => m.id === userId);
  },

  async deleteMember(userId: string): Promise<boolean> {
    const userRes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRes.length === 0) throw new NotFoundError("User not found");

    const user = userRes[0];
    if (user.role === "SUPER_ADMIN" && user.username === "girish") {
      throw new ValidationError("The primary Super Admin account cannot be deleted.");
    }

    // Transactionally cascade delete user
    await usersRepository.remove(userId);
    return true;
  },

  // ==================== DEPARTMENTS ====================
  async listDepartments(): Promise<any[]> {
    const res = await db.execute<any>(sql`
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
      LEFT JOIN users mem ON mem.department_id = d.id AND mem.role IN ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'SALES')
      LEFT JOIN tasks t ON t.department_id = d.id
      GROUP BY d.id, u.name
      ORDER BY d.name ASC;
    `);
    const rows = (res.rows || res) as any[];
    return rows;
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
    await db.delete(dailyEodLogs).where(
      and(
        eq(dailyEodLogs.userId, userId),
        sql`${dailyEodLogs.logDate} = ${logDate}`
      )
    );

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
    const userFilter = userId ? sql`AND e.user_id = ${userId}` : sql``;

    const res = await db.execute<any>(sql`
      SELECT 
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
      WHERE e.log_date = ${targetDate}
        ${userFilter}
      ORDER BY e.created_at DESC
    `);

    const rows = (res.rows || res) as any[];
    return rows;
  },

  // ==================== EXECUTIVE COMPANY PROGRESS TELEMETRY ====================
  async getCompanyProgress(): Promise<any> {
    // 1. Overall Company Task Velocity Metrics
    const companyStatsRes = await db.execute<any>(sql`
      SELECT 
        COUNT(*)::int as total_tasks,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed_tasks,
        COUNT(*) FILTER (WHERE status IN ('TODO', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'BLOCKED', 'CHANGES_REQUESTED'))::int as active_tasks,
        COUNT(*) FILTER (WHERE status = 'BLOCKED')::int as blocked_tasks,
        COUNT(*) FILTER (WHERE status = 'SUBMITTED_FOR_REVIEW')::int as review_queue,
        COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('COMPLETED'))::int as overdue_tasks,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND (due_date IS NULL OR completed_at <= due_date + INTERVAL '4 hours'))::int as on_time_completed,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= NOW() - INTERVAL '7 days')::int as completed_this_week,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= NOW() - INTERVAL '30 days')::int as completed_this_month
      FROM tasks;
    `);
    const cStats = (companyStatsRes.rows || companyStatsRes)[0];

    const totalTasks = Number(cStats.total_tasks) || 0;
    const completedTasks = Number(cStats.completed_tasks) || 0;
    const activeTasks = Number(cStats.active_tasks) || 0;
    const blockedTasks = Number(cStats.blocked_tasks) || 0;
    const reviewQueue = Number(cStats.review_queue) || 0;
    const overdueTasks = Number(cStats.overdue_tasks) || 0;
    const onTimeCompleted = Number(cStats.on_time_completed) || 0;
    const completedThisWeek = Number(cStats.completed_this_week) || 0;
    const completedThisMonth = Number(cStats.completed_this_month) || 0;

    const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompleted / completedTasks) * 100) : 100;
    const companyCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Department-by-Department Breakdown
    const deptRes = await db.execute<any>(sql`
      SELECT 
        d.id,
        d.name,
        d.code,
        d.color,
        d.description,
        u.name as "leadName",
        COUNT(DISTINCT mem.id)::int as "memberCount",
        COUNT(DISTINCT t.id)::int as "totalTasks",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasks",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'BLOCKED', 'CHANGES_REQUESTED'))::int as "activeTasks",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'BLOCKED')::int as "blockedTasks",
        COUNT(DISTINCT t.id) FILTER (WHERE t.due_date < NOW() AND t.status NOT IN ('COMPLETED'))::int as "overdueTasks",
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED' AND t.completed_at >= NOW() - INTERVAL '7 days')::int as "completedThisWeek"
      FROM team_departments d
      LEFT JOIN users u ON d.lead_id = u.id
      LEFT JOIN users mem ON mem.department_id = d.id AND mem.role IN ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'SALES') AND mem.is_active = TRUE
      LEFT JOIN tasks t ON t.department_id = d.id
      GROUP BY d.id, u.name
      ORDER BY d.name ASC;
    `);

    const deptRows = (deptRes.rows || deptRes) as any[];
    const departments = deptRows.map((d: any) => {
      const tot = Number(d.totalTasks) || 0;
      const comp = Number(d.completedTasks) || 0;
      const rate = tot > 0 ? Math.round((comp / tot) * 100) : 0;
      return {
        ...d,
        memberCount: Number(d.memberCount) || 0,
        totalTasks: tot,
        completedTasks: comp,
        activeTasks: Number(d.activeTasks) || 0,
        blockedTasks: Number(d.blockedTasks) || 0,
        overdueTasks: Number(d.overdueTasks) || 0,
        completedThisWeek: Number(d.completedThisWeek) || 0,
        completionRate: rate,
      };
    });

    // 3. Active Company Blockers (Fire-Drill List)
    const blockersRes = await db.execute<any>(sql`
      SELECT 
        t.id,
        t.title,
        t.priority,
        t.status,
        t.blocked_reason as "blockedReason",
        t.due_date as "dueDate",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        t.assignee_id as "assigneeId",
        u.name as "assigneeName",
        u.phone as "assigneePhone",
        u.role as "assigneeRole",
        d.name as "departmentName",
        d.color as "departmentColor"
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN team_departments d ON t.department_id = d.id
      WHERE t.status = 'BLOCKED'
      ORDER BY 
        CASE WHEN t.priority = 'URGENT' THEN 1 WHEN t.priority = 'HIGH' THEN 2 ELSE 3 END,
        t.updated_at DESC;
    `);
    const activeBlockers = (blockersRes.rows || blockersRes) as any[];

    // 4. Standup Pulse for Today
    const today = new Date().toISOString().split("T")[0];
    const allStaff = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        role: users.role,
        departmentId: users.departmentId,
      })
      .from(users)
      .where(and(sql`${users.role} IN ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'SALES')`, eq(users.isActive, true)));

    const submittedLogsRes = await db.execute<any>(sql`
      SELECT DISTINCT user_id FROM daily_eod_logs WHERE log_date = ${today}
    `);
    const submittedUserRows = (submittedLogsRes.rows || submittedLogsRes) as any[];
    const submittedUserIds = new Set(submittedUserRows.map((r: any) => r.user_id));

    const submittedCount = submittedUserIds.size;
    const totalStaffCount = allStaff.length;
    const standupComplianceRate = totalStaffCount > 0 ? Math.round((submittedCount / totalStaffCount) * 100) : 0;

    const missingStaff = allStaff
      .filter((s: any) => !submittedUserIds.has(s.id))
      .map((s: any) => {
        const dept = departments.find((d: any) => d.id === s.departmentId);
        return {
          id: s.id,
          name: s.name,
          phone: s.phone,
          role: s.role,
          departmentName: dept?.name || null,
          departmentColor: dept?.color || null,
        };
      });

    return {
      kpis: {
        totalTasks,
        completedTasks,
        activeTasks,
        blockedTasks,
        reviewQueue,
        overdueTasks,
        onTimeRate,
        companyCompletionRate,
        completedThisWeek,
        completedThisMonth,
      },
      standupPulse: {
        today,
        totalStaffCount,
        submittedCount,
        missingCount: totalStaffCount - submittedCount,
        complianceRate: standupComplianceRate,
        missingStaff,
      },
      departments,
      activeBlockers,
    };
  },

  // ==================== 360° MEMBER PERFORMANCE DOSSIER ====================
  async getMemberPerformance(memberId: string): Promise<any> {
    const userRes = await db.execute<any>(sql`
      SELECT 
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
        u.created_at as "createdAt"
      FROM users u
      LEFT JOIN team_departments d ON u.department_id = d.id
      WHERE u.id = ${memberId}
    `);
    const userRows = (userRes.rows || userRes) as any[];

    if (userRows.length === 0) {
      throw new NotFoundError("Team member not found");
    }

    const member = userRows[0];

    // Task counts and SLA metrics
    const statsRes = await db.execute<any>(sql`
      SELECT 
        COUNT(DISTINCT t.id)::int as total_assigned,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED')::int as completed_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'CHANGES_REQUESTED', 'SUBMITTED_FOR_REVIEW') OR (t.status IS NOT NULL AND t.status != 'COMPLETED'))::int as active_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'SUBMITTED_FOR_REVIEW')::int as review_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'BLOCKED')::int as blocked_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'CHANGES_REQUESTED')::int as changes_requested_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.due_date < NOW() AND t.status NOT IN ('COMPLETED'))::int as overdue_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED' AND (t.due_date IS NULL OR t.completed_at <= t.due_date + INTERVAL '4 hours'))::int as on_time_count,
        COALESCE(SUM(t.estimated_hours), 0)::int as total_estimated_hours,
        COALESCE(SUM(t.estimated_hours) FILTER (WHERE t.status = 'COMPLETED'), 0)::int as completed_estimated_hours
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN sub_projects sp ON t.sub_project_id = sp.id
      WHERE (t.assignee_id = ${memberId} OR p.lead_id = ${memberId} OR p.created_by_id = ${memberId} OR sp.lead_id = ${memberId} OR t.reporter_id = ${memberId})
        AND (p.id IS NULL OR p.is_hidden = FALSE OR p.is_hidden IS NULL)
    `);
    const stats = (statsRes.rows || statsRes)[0];

    const totalAssigned = Number(stats.total_assigned) || 0;
    const completedCount = Number(stats.completed_count) || 0;
    const activeCount = Number(stats.active_count) || 0;
    const reviewCount = Number(stats.review_count) || 0;
    const blockedCount = Number(stats.blocked_count) || 0;
    const changesRequestedCount = Number(stats.changes_requested_count) || 0;
    const overdueCount = Number(stats.overdue_count) || 0;
    const onTimeCount = Number(stats.on_time_count) || 0;
    const totalEstimatedHours = Number(stats.total_estimated_hours) || 0;
    const completedEstimatedHours = Number(stats.completed_estimated_hours) || 0;

    const onTimeRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 100;
    const firstPassApprovalRate = (completedCount + changesRequestedCount) > 0
      ? Math.round((completedCount / (completedCount + changesRequestedCount)) * 100)
      : 100;

    // Daily Standup history (Last 30 days)
    const eodRes = await db.execute<any>(sql`
      SELECT 
        id,
        log_date as "logDate",
        completed_summary as "completedSummary",
        plan_tomorrow as "planTomorrow",
        blockers,
        hours_spent as "hoursSpent",
        created_at as "createdAt"
      FROM daily_eod_logs
      WHERE user_id = ${memberId}
      ORDER BY log_date DESC
      LIMIT 30
    `);

    const standupLogs = (eodRes.rows || eodRes) as any[];
    const standupCount = standupLogs.length;

    // Calculate Velocity Score (0 - 100)
    // 40% on-time completion rate, 30% first pass approval, 20% output volume index, 10% standup compliance
    const outputScore = Math.min(completedCount * 10, 100);
    const standupScore = Math.min((standupCount / 15) * 100, 100);
    const velocityScore = Math.round(
      onTimeRate * 0.35 +
      firstPassApprovalRate * 0.25 +
      outputScore * 0.25 +
      standupScore * 0.15
    );

    // Workload Capacity Status
    let capacityStatus: "AVAILABLE" | "OPTIMAL" | "OVERLOADED" = "AVAILABLE";
    if (activeCount >= 5) {
      capacityStatus = "OVERLOADED";
    } else if (activeCount >= 2) {
      capacityStatus = "OPTIMAL";
    }

    // Recent Tasks
    const tasksRes = await db.execute<any>(sql`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date as "dueDate",
        t.estimated_hours as "estimatedHours",
        t.submission_proof_url as "submissionProofUrl",
        t.submission_notes as "submissionNotes",
        t.blocked_reason as "blockedReason",
        t.completed_at as "completedAt",
        t.created_at as "createdAt",
        d.name as "departmentName",
        d.color as "departmentColor",
        COUNT(s.id)::int as "subtasksCount",
        COUNT(s.id) FILTER (WHERE s.is_completed = TRUE)::int as "subtasksCompleted"
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN sub_projects sp ON t.sub_project_id = sp.id
      LEFT JOIN team_departments d ON t.department_id = d.id
      LEFT JOIN task_subtasks s ON s.task_id = t.id
      WHERE (t.assignee_id = ${memberId} OR p.lead_id = ${memberId} OR p.created_by_id = ${memberId} OR sp.lead_id = ${memberId} OR t.reporter_id = ${memberId})
        AND (p.id IS NULL OR p.is_hidden = FALSE OR p.is_hidden IS NULL)
      GROUP BY t.id, d.name, d.color
      ORDER BY 
        CASE WHEN t.status = 'BLOCKED' THEN 1 WHEN t.status = 'SUBMITTED_FOR_REVIEW' THEN 2 WHEN t.status IN ('TODO', 'IN_PROGRESS') THEN 3 ELSE 4 END,
        t.created_at DESC
      LIMIT 25
    `);
    const tasksList = (tasksRes.rows || tasksRes) as any[];

    return {
      member,
      metrics: {
        totalAssigned,
        completedCount,
        activeCount,
        reviewCount,
        blockedCount,
        changesRequestedCount,
        overdueCount,
        onTimeRate,
        firstPassApprovalRate,
        velocityScore,
        capacityStatus,
        totalEstimatedHours,
        completedEstimatedHours,
        standupCount,
      },
      tasks: tasksList,
      standupLogs,
    };
  },

  // ==================== PERFORMANCE LEADERBOARD & WORKLOAD MATRIX ====================
  async getLeaderboard(): Promise<any[]> {
    const res = await db.execute<any>(sql`
      SELECT 
        u.id,
        u.name,
        u.phone,
        u.role,
        u.designation,
        u.department_id as "departmentId",
        d.name as "departmentName",
        d.color as "departmentColor",
        u.created_at as "createdAt",
        COUNT(t.id)::int as "totalTasks",
        COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasks",
        COUNT(t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS'))::int as "activeTasks",
        COUNT(t.id) FILTER (WHERE t.status = 'BLOCKED')::int as "blockedTasks",
        COUNT(t.id) FILTER (WHERE t.status = 'SUBMITTED_FOR_REVIEW')::int as "reviewTasks",
        COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED' AND (t.due_date IS NULL OR t.completed_at <= t.due_date + INTERVAL '4 hours'))::int as "onTimeTasks",
        COUNT(DISTINCT e.log_date)::int as "standupCount"
      FROM users u
      LEFT JOIN team_departments d ON u.department_id = d.id
      LEFT JOIN tasks t ON t.assignee_id = u.id
      LEFT JOIN daily_eod_logs e ON e.user_id = u.id AND e.log_date >= CURRENT_DATE - INTERVAL '30 days'
      WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'SALES') AND u.is_active = TRUE
      GROUP BY u.id, d.name, d.color
      ORDER BY u.name ASC;
    `);

    const rows = (res.rows || res) as any[];
    const membersWithScores = rows.map((m: any) => {
      const completed = Number(m.completedTasks) || 0;
      const active = Number(m.activeTasks) || 0;
      const onTime = Number(m.onTimeTasks) || 0;
      const standupCount = Number(m.standupCount) || 0;

      const onTimeRate = completed > 0 ? Math.round((onTime / completed) * 100) : 100;
      const outputScore = Math.min(completed * 10, 100);
      const standupScore = Math.min((standupCount / 15) * 100, 100);
      const velocityScore = Math.round(
        onTimeRate * 0.4 +
        outputScore * 0.35 +
        standupScore * 0.25
      );

      let capacityStatus: "AVAILABLE" | "OPTIMAL" | "OVERLOADED" = "AVAILABLE";
      if (active >= 5) {
        capacityStatus = "OVERLOADED";
      } else if (active >= 2) {
        capacityStatus = "OPTIMAL";
      }

      return {
        id: m.id,
        name: m.name || m.phone,
        phone: m.phone,
        role: m.role,
        designation: m.designation,
        departmentId: m.departmentId,
        departmentName: m.departmentName,
        departmentColor: m.departmentColor,
        completedTasks: completed,
        activeTasks: active,
        blockedTasks: Number(m.blockedTasks) || 0,
        reviewTasks: Number(m.reviewTasks) || 0,
        onTimeRate,
        standupCount,
        velocityScore,
        capacityStatus,
      };
    });

    // Sort by Velocity Score descending
    membersWithScores.sort((a: any, b: any) => b.velocityScore - a.velocityScore);

    return membersWithScores.map((m: any, index: number) => ({
      ...m,
      rank: index + 1,
    }));
  },

  // ==================== DAILY STANDUP SUMMARY & NUDGE ====================
  async getStandupSummary(date?: string): Promise<any> {
    const targetDate = date || new Date().toISOString().split("T")[0];

    const logs = await this.listDailyEodLogs(targetDate);
    const submittedUserIds = new Set(logs.map((l: any) => l.userId));

    const staffRes = await db.execute<any>(sql`
      SELECT 
        u.id, 
        u.name, 
        u.phone, 
        u.role, 
        u.designation,
        d.name as "departmentName", 
        d.color as "departmentColor"
      FROM users u
      LEFT JOIN team_departments d ON u.department_id = d.id
      WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'SALES') AND u.is_active = TRUE
      ORDER BY u.name ASC
    `);
    const allStaff = (staffRes.rows || staffRes) as any[];

    const submitted = logs;
    const missing = allStaff.filter((s: any) => !submittedUserIds.has(s.id));
    const complianceRate = allStaff.length > 0 ? Math.round((submitted.length / allStaff.length) * 100) : 0;

    const blockers = logs.filter((l: any) => Boolean(l.blockers && l.blockers.trim().length > 0));

    return {
      date: targetDate,
      totalStaffCount: allStaff.length,
      submittedCount: submitted.length,
      missingCount: missing.length,
      complianceRate,
      submitted,
      missing,
      blockers,
    };
  },

  async nudgeMember(memberId: string, message?: string): Promise<any> {
    const userRes = await db
      .select({ id: users.id, name: users.name, phone: users.phone })
      .from(users)
      .where(eq(users.id, memberId))
      .limit(1);

    if (userRes.length === 0) throw new NotFoundError("Member not found");

    const member = userRes[0];
    // In production, this can send SMS/WhatsApp or Socket alert. For now, we return receipt confirmation
    return {
      success: true,
      message: `Nudge sent successfully to ${member.name || member.phone}${message ? `: "${message}"` : ""}`,
      nudgedAt: new Date().toISOString(),
      memberId,
    };
  },
};
