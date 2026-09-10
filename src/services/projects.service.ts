import { db } from "../db";
import {
  projects,
  subProjects,
  tasks,
  taskSubtasks,
  teamDepartments,
  users,
  Project,
  SubProject,
  NewProject,
  NewSubProject,
} from "../db/schema";
import { eq, desc, and, or, ilike, count, sql, asc, inArray } from "drizzle-orm";

export interface ProjectListFilter {
  departmentId?: string;
  leadId?: string;
  memberId?: string;
  status?: any;
  priority?: any;
  search?: string;
  hasBlockers?: boolean;
  hasReview?: boolean;
  includeHidden?: boolean;
  onlyHidden?: boolean;
  userId?: string;
  userRole?: string;
  limit?: number;
  offset?: number;
}

export const projectsService = {
  async listProjects(filter: ProjectListFilter = {}) {
    const conditions = [];
    const isAdmin = filter.userRole === "SUPER_ADMIN" || filter.userRole === "ADMIN";

    // Filter hidden projects (Unless includeHidden or onlyHidden is explicitly requested by admin)
    if (filter.onlyHidden) {
      conditions.push(eq(projects.isHidden, true));
    } else if (!filter.includeHidden) {
      conditions.push(sql`(${projects.isHidden} = false OR ${projects.isHidden} IS NULL)`);
    }

    // Role-based visibility & Member filtering:
    // If non-admin, strictly restrict to projects assigned to the user (lead, createdBy, or task assignee/reporter, or subproject lead)
    if (!isAdmin && filter.userId) {
      conditions.push(
        sql`(${projects.leadId} = ${filter.userId} 
          OR ${projects.createdById} = ${filter.userId}
          OR ${projects.id} IN (SELECT DISTINCT project_id FROM tasks WHERE (assignee_id = ${filter.userId} OR reporter_id = ${filter.userId}) AND project_id IS NOT NULL)
          OR ${projects.id} IN (SELECT DISTINCT project_id FROM sub_projects WHERE lead_id = ${filter.userId})
        )`
      );
    } else if (isAdmin && filter.memberId && filter.memberId !== "ALL") {
      // Admin filtering to a specific member/admin's assigned projects
      conditions.push(
        sql`(${projects.leadId} = ${filter.memberId} 
          OR ${projects.createdById} = ${filter.memberId}
          OR ${projects.id} IN (SELECT DISTINCT project_id FROM tasks WHERE (assignee_id = ${filter.memberId} OR reporter_id = ${filter.memberId}) AND project_id IS NOT NULL)
          OR ${projects.id} IN (SELECT DISTINCT project_id FROM sub_projects WHERE lead_id = ${filter.memberId})
        )`
      );
    }

    if (filter.departmentId) {
      conditions.push(eq(projects.departmentId, filter.departmentId));
    }
    if (filter.leadId) {
      conditions.push(eq(projects.leadId, filter.leadId));
    }
    if (filter.status) {
      conditions.push(eq(projects.status, filter.status));
    }
    if (filter.priority) {
      conditions.push(eq(projects.priority, filter.priority));
    }
    if (filter.hasBlockers) {
      conditions.push(
        sql`${projects.id} IN (SELECT DISTINCT project_id FROM tasks WHERE status = 'BLOCKED' AND project_id IS NOT NULL)`
      );
    }
    if (filter.hasReview) {
      conditions.push(
        sql`${projects.id} IN (SELECT DISTINCT project_id FROM tasks WHERE status = 'SUBMITTED_FOR_REVIEW' AND project_id IS NOT NULL)`
      );
    }
    if (filter.search) {
      conditions.push(
        sql`(${projects.name} ILIKE ${`%${filter.search}%`} OR ${projects.code} ILIKE ${`%${filter.search}%`} OR ${projects.description} ILIKE ${`%${filter.search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const projectRecords = await db.query.projects.findMany({
      where: whereClause,
      orderBy: [
        // Priority-wise sorting: URGENT (1) > HIGH (2) > MEDIUM (3) > LOW (4)
        sql`CASE 
          WHEN ${projects.priority} = 'URGENT' THEN 1 
          WHEN ${projects.priority} = 'HIGH' THEN 2 
          WHEN ${projects.priority} = 'MEDIUM' THEN 3 
          WHEN ${projects.priority} = 'LOW' THEN 4 
          ELSE 5 
        END ASC`,
        desc(projects.createdAt),
      ],
      with: {
        department: true,
        lead: {
          columns: {
            id: true,
            name: true,
            phone: true,
            role: true,
            designation: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            phone: true,
          },
        },
        subProjects: {
          orderBy: [asc(subProjects.orderIndex), asc(subProjects.createdAt)],
          with: {
            lead: {
              columns: {
                id: true,
                name: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
      limit: filter.limit || 100,
      offset: filter.offset || 0,
    });

    const projectIds = projectRecords.map((p: any) => p.id);
    if (projectIds.length === 0) {
      return [];
    }

    // Get task counts grouped by project and status
    const taskStats = await db
      .select({
        projectId: tasks.projectId,
        totalTasks: count(tasks.id),
        completedTasks: sql<number>`count(case when ${tasks.status} = 'COMPLETED' then 1 end)::int`,
        activeTasks: sql<number>`count(case when ${tasks.status} = 'IN_PROGRESS' then 1 end)::int`,
        blockedTasks: sql<number>`count(case when ${tasks.status} = 'BLOCKED' then 1 end)::int`,
      })
      .from(tasks)
      .where(inArray(tasks.projectId, projectIds))
      .groupBy(tasks.projectId);

    const statsMap = new Map<string, { total: number; completed: number; active: number; blocked: number }>();
    taskStats.forEach((s: any) => {
      if (s.projectId) {
        statsMap.set(s.projectId, {
          total: Number(s.totalTasks) || 0,
          completed: Number(s.completedTasks) || 0,
          active: Number(s.activeTasks) || 0,
          blocked: Number(s.blockedTasks) || 0,
        });
      }
    });

    return projectRecords.map((proj: any) => {
      const stats = statsMap.get(proj.id) || { total: 0, completed: 0, active: 0, blocked: 0 };
      const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      return {
        ...proj,
        subProjectsCount: proj.subProjects?.length || 0,
        totalTasks: stats.total,
        completedTasks: stats.completed,
        activeTasks: stats.active,
        blockedTasks: stats.blocked,
        progressPercentage,
      };
    });
  },

  async getProjectById(id: string, userId?: string, userRole?: string) {
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        department: true,
        lead: {
          columns: {
            id: true,
            name: true,
            phone: true,
            role: true,
            designation: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            phone: true,
          },
        },
        subProjects: {
          orderBy: [asc(subProjects.orderIndex), asc(subProjects.createdAt)],
          with: {
            lead: {
              columns: {
                id: true,
                name: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!project) return null;

    // Check if non-admin is authorized to view this project
    if (!isAdmin && userId) {
      const isLead = project.leadId === userId || project.createdById === userId;
      const isSubProjectLead = (project.subProjects || []).some((sp: any) => sp.leadId === userId);
      
      if (!isLead && !isSubProjectLead) {
        // Check if user has any assigned or reported tasks in this project
        const assignedTaskRes = await db
          .select({ id: tasks.id })
          .from(tasks)
          .where(and(eq(tasks.projectId, id), or(eq(tasks.assigneeId, userId), eq(tasks.reporterId, userId))))
          .limit(1);
        if (assignedTaskRes.length === 0) {
          return null; // Not authorized to access this project
        }
      }
    }

    const taskStats = await db
      .select({
        totalTasks: count(tasks.id),
        completedTasks: sql<number>`count(case when ${tasks.status} = 'COMPLETED' then 1 end)::int`,
        activeTasks: sql<number>`count(case when ${tasks.status} = 'IN_PROGRESS' then 1 end)::int`,
        blockedTasks: sql<number>`count(case when ${tasks.status} = 'BLOCKED' then 1 end)::int`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, id));

    const total = Number(taskStats[0]?.totalTasks) || 0;
    const completed = Number(taskStats[0]?.completedTasks) || 0;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...project,
      totalTasks: total,
      completedTasks: completed,
      activeTasks: Number(taskStats[0]?.activeTasks) || 0,
      blockedTasks: Number(taskStats[0]?.blockedTasks) || 0,
      progressPercentage,
    };
  },

  async getProjectHierarchy(id: string, userId?: string, userRole?: string, memberId?: string) {
    const project = await this.getProjectById(id, userId, userRole);
    if (!project) return null;

    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

    let projectTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectId, id),
      orderBy: [desc(tasks.createdAt)],
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            phone: true,
            role: true,
            designation: true,
          },
        },
        reporter: {
          columns: {
            id: true,
            name: true,
          },
        },
        subtasks: {
          orderBy: [asc(taskSubtasks.orderIndex), asc(taskSubtasks.createdAt)],
        },
      },
    });

    // Filter tasks based on role and member filter:
    if (!isAdmin && userId) {
      const isProjectLead = project.leadId === userId || project.createdById === userId;
      if (!isProjectLead) {
        // Non-admin who is not project lead only sees their assigned tasks or tasks in subprojects they lead
        const ledSubProjectIds = new Set(
          (project.subProjects || [])
            .filter((sp: any) => sp.leadId === userId)
            .map((sp: any) => sp.id)
        );

        projectTasks = projectTasks.filter(
          (t: any) =>
            t.assigneeId === userId ||
            t.reporterId === userId ||
            (t.subProjectId && ledSubProjectIds.has(t.subProjectId))
        );
      }
    } else if (isAdmin && memberId && memberId !== "ALL") {
      // Admin filtering to a specific team member
      const ledSubProjectIds = new Set(
        (project.subProjects || [])
          .filter((sp: any) => sp.leadId === memberId)
          .map((sp: any) => sp.id)
      );

      projectTasks = projectTasks.filter(
        (t: any) =>
          t.assigneeId === memberId ||
          t.reporterId === memberId ||
          (t.subProjectId && ledSubProjectIds.has(t.subProjectId))
      );
    }

    let subProjectsList = project.subProjects || [];
    if (!isAdmin && userId && project.leadId !== userId && project.createdById !== userId) {
      // For non-admin, filter subprojects to only those they lead or have tasks in
      subProjectsList = subProjectsList.filter((sp: any) => {
        const isSpLead = sp.leadId === userId;
        const hasTask = projectTasks.some((t: any) => t.subProjectId === sp.id);
        return isSpLead || hasTask;
      });
    } else if (isAdmin && memberId && memberId !== "ALL") {
      subProjectsList = subProjectsList.filter((sp: any) => {
        const isSpLead = sp.leadId === memberId;
        const hasTask = projectTasks.some((t: any) => t.subProjectId === sp.id);
        return isSpLead || hasTask;
      });
    }

    const subProjectsEnriched = subProjectsList.map((sp: any) => {
      const spTasks = projectTasks.filter((t: any) => t.subProjectId === sp.id);
      const totalSpTasks = spTasks.length;
      const completedSpTasks = spTasks.filter((t: any) => t.status === "COMPLETED").length;
      const spProgress = totalSpTasks > 0 ? Math.round((completedSpTasks / totalSpTasks) * 100) : 0;

      return {
        ...sp,
        tasks: spTasks.map((t: any) => ({
          ...t,
          subtasks: t.subtasks || [],
          subtasksCount: t.subtasks?.length || 0,
          subtasksCompleted: t.subtasks?.filter((st: any) => st.isCompleted).length || 0,
        })),
        totalTasks: totalSpTasks,
        completedTasks: completedSpTasks,
        progressPercentage: spProgress,
      };
    });

    const unassignedTasks = projectTasks
      .filter((t: any) => !t.subProjectId)
      .map((t: any) => ({
        ...t,
        subtasks: t.subtasks || [],
        subtasksCount: t.subtasks?.length || 0,
        subtasksCompleted: t.subtasks?.filter((st: any) => st.isCompleted).length || 0,
      }));

    return {
      project,
      subProjects: subProjectsEnriched,
      unassignedTasks,
    };
  },

  async createProject(data: {
    code?: string;
    name: string;
    description?: string;
    departmentId?: string;
    leadId?: string;
    createdById?: string;
    status?: any;
    priority?: any;
    isHidden?: boolean;
    startDate?: string;
    targetEndDate?: string;
    color?: string;
    icon?: string;
    subProjects?: string[];
  }) {
    let projectCode = data.code?.trim().toUpperCase();
    if (!projectCode) {
      const prefix = data.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase() || "PROJ";
      const countRes = await db.select({ val: count(projects.id) }).from(projects);
      projectCode = `${prefix}-${Number(countRes[0]?.val || 0) + 1}`;
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        code: projectCode,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        departmentId: data.departmentId || null,
        leadId: data.leadId || null,
        createdById: data.createdById || null,
        status: data.status || "ACTIVE",
        priority: data.priority || "MEDIUM",
        isHidden: data.isHidden !== undefined ? Boolean(data.isHidden) : false,
        startDate: data.startDate && String(data.startDate).trim() ? new Date(data.startDate).toISOString() : null,
        targetEndDate: data.targetEndDate && String(data.targetEndDate).trim() ? new Date(data.targetEndDate).toISOString() : null,
        color: data.color || "#6366f1",
        icon: data.icon || "folder",
      })
      .returning();

    if (Array.isArray(data.subProjects) && data.subProjects.length > 0) {
      const spValues = data.subProjects
        .filter((sp) => typeof sp === "string" && sp.trim().length > 0)
        .map((sp, idx) => ({
          projectId: newProject.id,
          name: sp.trim(),
          orderIndex: idx + 1,
          status: "TODO" as const,
        }));

      if (spValues.length > 0) {
        await db.insert(subProjects).values(spValues);
      }
    }

    return this.getProjectById(newProject.id);
  },

  async updateProject(
    id: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
      departmentId?: string;
      leadId?: string;
      status?: any;
      priority?: any;
      isHidden?: boolean;
      startDate?: string;
      targetEndDate?: string;
      completedAt?: string;
      color?: string;
      icon?: string;
    }
  ) {
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.code !== undefined) updatePayload.code = data.code?.trim().toUpperCase();
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId || null;
    if (data.leadId !== undefined) updatePayload.leadId = data.leadId || null;
    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (data.status === "COMPLETED" && !data.completedAt) {
        updatePayload.completedAt = new Date().toISOString();
      }
    }
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.isHidden !== undefined) updatePayload.isHidden = Boolean(data.isHidden);
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate || null;
    if (data.targetEndDate !== undefined) updatePayload.targetEndDate = data.targetEndDate || null;
    if (data.completedAt !== undefined) updatePayload.completedAt = data.completedAt || null;
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.icon !== undefined) updatePayload.icon = data.icon;

    await db.update(projects).set(updatePayload).where(eq(projects.id, id));
    return this.getProjectById(id);
  },

  async deleteProject(id: string) {
    await db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  },

  async listSubProjects(projectId: string) {
    return db.query.subProjects.findMany({
      where: eq(subProjects.projectId, projectId),
      orderBy: [asc(subProjects.orderIndex), asc(subProjects.createdAt)],
      with: {
        lead: {
          columns: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  },

  async createSubProject(
    projectId: string,
    data: {
      name: string;
      description?: string;
      leadId?: string;
      status?: any;
      orderIndex?: number;
      startDate?: string;
      targetEndDate?: string;
    }
  ) {
    let orderIndex = data.orderIndex;
    if (orderIndex === undefined) {
      const existing = await db
        .select({ val: count(subProjects.id) })
        .from(subProjects)
        .where(eq(subProjects.projectId, projectId));
      orderIndex = Number(existing[0]?.val || 0) + 1;
    }

    const [newSp] = await db
      .insert(subProjects)
      .values({
        projectId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        leadId: data.leadId || null,
        status: data.status || "TODO",
        orderIndex,
        startDate: data.startDate || null,
        targetEndDate: data.targetEndDate || null,
      })
      .returning();

    return db.query.subProjects.findFirst({
      where: eq(subProjects.id, newSp.id),
      with: {
        lead: true,
      },
    });
  },

  async updateSubProject(
    id: string,
    data: {
      name?: string;
      description?: string;
      leadId?: string;
      status?: any;
      orderIndex?: number;
      startDate?: string;
      targetEndDate?: string;
      completedAt?: string;
    }
  ) {
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
    if (data.leadId !== undefined) updatePayload.leadId = data.leadId || null;
    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (data.status === "COMPLETED" && !data.completedAt) {
        updatePayload.completedAt = new Date().toISOString();
      }
    }
    if (data.orderIndex !== undefined) updatePayload.orderIndex = data.orderIndex;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate || null;
    if (data.targetEndDate !== undefined) updatePayload.targetEndDate = data.targetEndDate || null;
    if (data.completedAt !== undefined) updatePayload.completedAt = data.completedAt || null;

    await db.update(subProjects).set(updatePayload).where(eq(subProjects.id, id));

    return db.query.subProjects.findFirst({
      where: eq(subProjects.id, id),
      with: {
        lead: true,
      },
    });
  },

  async deleteSubProject(id: string) {
    await db.delete(subProjects).where(eq(subProjects.id, id));
    return { success: true };
  },
};
