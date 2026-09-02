import { db, pool } from "../db";
import { eq, and, desc, asc, ilike, sql, or, inArray } from "drizzle-orm";
import {
  tasks,
  taskSubtasks,
  taskComments,
  taskTemplates,
  teamDepartments,
  projects,
  subProjects,
  users,
  Task,
  TaskSubtask,
  TaskComment,
  NewTask,
  NewTaskSubtask,
  NewTaskComment,
} from "../db/schema";
import { NotFoundError, ValidationError, ForbiddenError } from "../errors";

export interface TaskFilterQuery {
  assigneeId?: string;
  status?: string;
  departmentId?: string;
  projectId?: string;
  subProjectId?: string;
  priority?: string;
  search?: string;
  view?: "my_focus" | "all" | "review";
  userId?: string;
  userRole?: string;
}

export const tasksService = {
  // ==================== LIST & QUERY TASKS ====================
  async listTasks(filter: TaskFilterQuery): Promise<any[]> {
    let query = db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        projectId: tasks.projectId,
        projectName: projects.name,
        projectCode: projects.code,
        subProjectId: tasks.subProjectId,
        subProjectName: subProjects.name,
        assigneeId: tasks.assigneeId,
        assigneeName: users.name,
        assigneePhone: users.phone,
        assigneeRole: users.role,
        reporterId: tasks.reporterId,
        departmentId: tasks.departmentId,
        departmentName: teamDepartments.name,
        departmentCode: teamDepartments.code,
        departmentColor: teamDepartments.color,
        templateId: tasks.templateId,
        dueDate: tasks.dueDate,
        estimatedHours: tasks.estimatedHours,
        submissionProofUrl: tasks.submissionProofUrl,
        submissionNotes: tasks.submissionNotes,
        blockedReason: tasks.blockedReason,
        relatedEntityType: tasks.relatedEntityType,
        relatedEntityId: tasks.relatedEntityId,
        relatedEntityName: tasks.relatedEntityName,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(teamDepartments, eq(tasks.departmentId, teamDepartments.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(subProjects, eq(tasks.subProjectId, subProjects.id))
      .$dynamic();

    const conditions = [];

    // Filter by view
    if (filter.view === "my_focus" && filter.userId) {
      conditions.push(eq(tasks.assigneeId, filter.userId));
    } else if (filter.assigneeId) {
      conditions.push(eq(tasks.assigneeId, filter.assigneeId));
    }

    if (filter.status) {
      conditions.push(eq(tasks.status, filter.status as any));
    }

    if (filter.departmentId) {
      conditions.push(eq(tasks.departmentId, filter.departmentId));
    }

    if (filter.projectId) {
      conditions.push(eq(tasks.projectId, filter.projectId));
    }

    if (filter.subProjectId) {
      conditions.push(eq(tasks.subProjectId, filter.subProjectId));
    }

    if (filter.priority) {
      conditions.push(eq(tasks.priority, filter.priority as any));
    }

    if (filter.search && filter.search.trim()) {
      const s = `%${filter.search.trim()}%`;
      conditions.push(
        or(
          ilike(tasks.title, s),
          ilike(tasks.description, s),
          ilike(tasks.relatedEntityName, s)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rows = await query.orderBy(
      desc(sql`CASE WHEN tasks.status = 'BLOCKED' THEN 1 WHEN tasks.status = 'SUBMITTED_FOR_REVIEW' THEN 2 WHEN tasks.priority = 'URGENT' THEN 3 WHEN tasks.priority = 'HIGH' THEN 4 ELSE 5 END`),
      asc(tasks.dueDate),
      desc(tasks.createdAt)
    );

    // Fetch subtasks count for each task
    const taskIds = rows.map((r) => r.id);
    let subtaskStats: Record<string, { total: number; completed: number }> = {};

    if (taskIds.length > 0) {
      const subRes = await pool.query(
        `SELECT task_id, 
                COUNT(*)::int as total, 
                COUNT(*) FILTER (WHERE is_completed = TRUE)::int as completed 
         FROM task_subtasks 
         WHERE task_id = ANY($1::varchar[])
         GROUP BY task_id`,
        [taskIds]
      );
      for (const s of subRes.rows) {
        subtaskStats[s.task_id] = {
          total: Number(s.total),
          completed: Number(s.completed),
        };
      }
    }

    return rows.map((r) => ({
      ...r,
      subtasksCount: subtaskStats[r.id]?.total || 0,
      subtasksCompleted: subtaskStats[r.id]?.completed || 0,
    }));
  },

  // ==================== GET TASK DETAILS ====================
  async getTaskById(id: string): Promise<any> {
    const taskRows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        projectId: tasks.projectId,
        projectName: projects.name,
        projectCode: projects.code,
        subProjectId: tasks.subProjectId,
        subProjectName: subProjects.name,
        assigneeId: tasks.assigneeId,
        assigneeName: users.name,
        assigneePhone: users.phone,
        assigneeRole: users.role,
        reporterId: tasks.reporterId,
        departmentId: tasks.departmentId,
        departmentName: teamDepartments.name,
        departmentCode: teamDepartments.code,
        departmentColor: teamDepartments.color,
        templateId: tasks.templateId,
        dueDate: tasks.dueDate,
        estimatedHours: tasks.estimatedHours,
        submissionProofUrl: tasks.submissionProofUrl,
        submissionNotes: tasks.submissionNotes,
        blockedReason: tasks.blockedReason,
        relatedEntityType: tasks.relatedEntityType,
        relatedEntityId: tasks.relatedEntityId,
        relatedEntityName: tasks.relatedEntityName,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(teamDepartments, eq(tasks.departmentId, teamDepartments.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(subProjects, eq(tasks.subProjectId, subProjects.id))
      .where(eq(tasks.id, id))
      .limit(1);

    if (taskRows.length === 0) {
      throw new NotFoundError("Task not found");
    }

    const task = taskRows[0];

    // Fetch subtasks
    const subtasks = await db
      .select()
      .from(taskSubtasks)
      .where(eq(taskSubtasks.taskId, id))
      .orderBy(asc(taskSubtasks.orderIndex), asc(taskSubtasks.createdAt));

    // Fetch comments & activity
    const comments = await db
      .select({
        id: taskComments.id,
        taskId: taskComments.taskId,
        userId: taskComments.userId,
        userName: users.name,
        userPhone: users.phone,
        userRole: users.role,
        content: taskComments.content,
        activityType: taskComments.activityType,
        createdAt: taskComments.createdAt,
      })
      .from(taskComments)
      .leftJoin(users, eq(taskComments.userId, users.id))
      .where(eq(taskComments.taskId, id))
      .orderBy(asc(taskComments.createdAt));

    return {
      ...task,
      subtasks,
      comments,
    };
  },

  // ==================== CREATE TASK ====================
  async createTask(
    data: {
      title: string;
      description?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      projectId?: string;
      subProjectId?: string;
      assigneeId?: string;
      departmentId?: string;
      templateId?: string;
      dueDate?: string;
      estimatedHours?: number;
      relatedEntityType?: string;
      relatedEntityId?: string;
      relatedEntityName?: string;
      subtasks?: string[];
    },
    reporterId: string
  ): Promise<any> {
    if (!data.title || !data.title.trim()) {
      throw new ValidationError("Task title is required");
    }

    let initialSubtasks: string[] = data.subtasks || [];

    // If templateId provided and no explicit subtasks, load template checklist
    if (data.templateId && initialSubtasks.length === 0) {
      const tmpl = await db
        .select()
        .from(taskTemplates)
        .where(eq(taskTemplates.id, data.templateId))
        .limit(1);
      if (tmpl.length > 0 && Array.isArray(tmpl[0].defaultChecklist)) {
        initialSubtasks = tmpl[0].defaultChecklist as string[];
        if (!data.departmentId && tmpl[0].departmentId) {
          data.departmentId = tmpl[0].departmentId;
        }
        if (!data.estimatedHours && tmpl[0].estimatedHours) {
          data.estimatedHours = tmpl[0].estimatedHours;
        }
      }
    }

    const [createdTask] = await db
      .insert(tasks)
      .values({
        title: data.title.trim(),
        description: data.description || null,
        priority: data.priority || "MEDIUM",
        status: "TODO",
        projectId: data.projectId || null,
        subProjectId: data.subProjectId || null,
        assigneeId: data.assigneeId || null,
        reporterId: reporterId || null,
        departmentId: data.departmentId || null,
        templateId: data.templateId || null,
        dueDate: data.dueDate ? (data.dueDate as any) : null,
        estimatedHours: data.estimatedHours || 2,
        relatedEntityType: data.relatedEntityType || null,
        relatedEntityId: data.relatedEntityId || null,
        relatedEntityName: data.relatedEntityName || null,
      })
      .returning();

    // Insert subtasks if any
    if (initialSubtasks.length > 0) {
      await db.insert(taskSubtasks).values(
        initialSubtasks.map((st, idx) => ({
          taskId: createdTask.id,
          title: st.trim(),
          isCompleted: false,
          orderIndex: idx + 1,
        }))
      );
    }

    // Log creation activity
    await db.insert(taskComments).values({
      taskId: createdTask.id,
      userId: reporterId,
      content: `Created task "${createdTask.title}"`,
      activityType: "STATUS_CHANGE",
    });

    return this.getTaskById(createdTask.id);
  },

  // ==================== UPDATE TASK ====================
  async updateTask(
    id: string,
    data: Partial<NewTask> & { statusNote?: string },
    currentUserId: string
  ): Promise<any> {
    const existing = await this.getTaskById(id);
    if (!existing) throw new NotFoundError("Task not found");

    const updatePayload: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.assigneeId !== undefined) updatePayload.assigneeId = data.assigneeId;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId;
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate;
    if (data.estimatedHours !== undefined) updatePayload.estimatedHours = data.estimatedHours;
    if (data.relatedEntityType !== undefined) updatePayload.relatedEntityType = data.relatedEntityType;
    if (data.relatedEntityId !== undefined) updatePayload.relatedEntityId = data.relatedEntityId;
    if (data.relatedEntityName !== undefined) updatePayload.relatedEntityName = data.relatedEntityName;

    if (data.status !== undefined && data.status !== existing.status) {
      updatePayload.status = data.status;
      if (data.status === "COMPLETED") {
        updatePayload.completedAt = new Date().toISOString();
      } else {
        updatePayload.completedAt = null;
      }

      // Log activity
      await db.insert(taskComments).values({
        taskId: id,
        userId: currentUserId,
        content: `Changed status from ${existing.status} to ${data.status}${
          data.statusNote ? `: ${data.statusNote}` : ""
        }`,
        activityType: "STATUS_CHANGE",
      });
    }

    await db.update(tasks).set(updatePayload).where(eq(tasks.id, id));

    return this.getTaskById(id);
  },

  // ==================== SUBTASK ACTIONS ====================
  async toggleSubtask(taskId: string, subtaskId: string, isCompleted: boolean): Promise<any> {
    await db
      .update(taskSubtasks)
      .set({ isCompleted })
      .where(and(eq(taskSubtasks.id, subtaskId), eq(taskSubtasks.taskId, taskId)));

    return this.getTaskById(taskId);
  },

  async addSubtask(taskId: string, title: string): Promise<any> {
    if (!title || !title.trim()) throw new ValidationError("Subtask title is required");

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM task_subtasks WHERE task_id = $1",
      [taskId]
    );
    const orderIndex = Number(countRes.rows[0].count) + 1;

    await db.insert(taskSubtasks).values({
      taskId,
      title: title.trim(),
      isCompleted: false,
      orderIndex,
    });

    return this.getTaskById(taskId);
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<any> {
    await db
      .delete(taskSubtasks)
      .where(and(eq(taskSubtasks.id, subtaskId), eq(taskSubtasks.taskId, taskId)));

    return this.getTaskById(taskId);
  },

  // ==================== WORKFLOW: SUBMIT PROOF FOR REVIEW ====================
  async submitForReview(
    taskId: string,
    data: { proofUrl?: string; notes?: string },
    userId: string
  ): Promise<any> {
    const existing = await this.getTaskById(taskId);
    if (!existing) throw new NotFoundError("Task not found");

    await db
      .update(tasks)
      .set({
        status: "SUBMITTED_FOR_REVIEW",
        submissionProofUrl: data.proofUrl || null,
        submissionNotes: data.notes || null,
        blockedReason: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, taskId));

    await db.insert(taskComments).values({
      taskId,
      userId,
      content: `Submitted task for Leader Review.${
        data.proofUrl ? ` Output: ${data.proofUrl}` : ""
      }${data.notes ? `\nNotes: ${data.notes}` : ""}`,
      activityType: "SUBMITTED",
    });

    return this.getTaskById(taskId);
  },

  // ==================== WORKFLOW: FLAG AS BLOCKED / STUCK ====================
  async flagBlocked(
    taskId: string,
    data: { reason: string },
    userId: string
  ): Promise<any> {
    if (!data.reason || !data.reason.trim()) {
      throw new ValidationError("Please explain what is blocking you");
    }

    await db
      .update(tasks)
      .set({
        status: "BLOCKED",
        blockedReason: data.reason.trim(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, taskId));

    await db.insert(taskComments).values({
      taskId,
      userId,
      content: `🚨 Flagged as BLOCKED: "${data.reason.trim()}"`,
      activityType: "BLOCKED",
    });

    return this.getTaskById(taskId);
  },

  // ==================== WORKFLOW: LEADER REVIEW ====================
  async reviewTask(
    taskId: string,
    data: { decision: "APPROVED" | "CHANGES_REQUESTED"; notes?: string },
    reviewerId: string
  ): Promise<any> {
    if (!["APPROVED", "CHANGES_REQUESTED"].includes(data.decision)) {
      throw new ValidationError("Decision must be APPROVED or CHANGES_REQUESTED");
    }

    const newStatus = data.decision === "APPROVED" ? "COMPLETED" : "CHANGES_REQUESTED";
    const completedAt = data.decision === "APPROVED" ? new Date().toISOString() : null;

    await db
      .update(tasks)
      .set({
        status: newStatus as any,
        completedAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, taskId));

    await db.insert(taskComments).values({
      taskId,
      userId: reviewerId,
      content:
        data.decision === "APPROVED"
          ? `✅ Approved & Marked Complete!${data.notes ? ` Notes: ${data.notes}` : ""}`
          : `🔁 Changes Requested: ${data.notes || "Please revise and resubmit."}`,
      activityType: data.decision === "APPROVED" ? "APPROVED" : "CHANGES_REQUESTED",
    });

    return this.getTaskById(taskId);
  },

  // ==================== COMMENTS & ACTIVITY ====================
  async addComment(taskId: string, content: string, userId: string): Promise<any> {
    if (!content || !content.trim()) throw new ValidationError("Comment cannot be empty");

    await db.insert(taskComments).values({
      taskId,
      userId,
      content: content.trim(),
      activityType: "COMMENT",
    });

    return this.getTaskById(taskId);
  },

  // ==================== DELETE TASK ====================
  async deleteTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  },

  // ==================== LEADER RADAR KPI DASHBOARD ====================
  async getLeaderRadar(): Promise<{
    reviewQueueCount: number;
    blockedCount: number;
    overdueCount: number;
    idleMembersCount: number;
    totalActiveCount: number;
    completedTodayCount: number;
  }> {
    const countsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'SUBMITTED_FOR_REVIEW')::int as review_queue,
        COUNT(*) FILTER (WHERE status = 'BLOCKED')::int as blocked,
        COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('COMPLETED'))::int as overdue,
        COUNT(*) FILTER (WHERE status IN ('TODO', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'BLOCKED', 'CHANGES_REQUESTED'))::int as total_active,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= CURRENT_DATE)::int as completed_today
      FROM tasks;
    `);

    // Calculate idle members (staff/members with 0 tasks currently in progress/todo)
    const idleRes = await pool.query(`
      SELECT COUNT(*)::int as idle_count
      FROM users u
      WHERE u.role IN ('MEMBER', 'ADMIN') 
        AND u.is_active = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM tasks t 
          WHERE t.assignee_id = u.id 
            AND t.status IN ('TODO', 'IN_PROGRESS')
        );
    `);

    const row = countsRes.rows[0];
    return {
      reviewQueueCount: Number(row.review_queue) || 0,
      blockedCount: Number(row.blocked) || 0,
      overdueCount: Number(row.overdue) || 0,
      totalActiveCount: Number(row.total_active) || 0,
      completedTodayCount: Number(row.completed_today) || 0,
      idleMembersCount: Number(idleRes.rows[0]?.idle_count) || 0,
    };
  },
};
