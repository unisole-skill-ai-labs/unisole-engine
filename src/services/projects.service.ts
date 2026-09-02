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
import { eq, desc, and, ilike, count, sql, asc, inArray } from "drizzle-orm";

export interface ProjectListFilter {
  departmentId?: string;
  leadId?: string;
  status?: any;
  priority?: any;
  search?: string;
  limit?: number;
  offset?: number;
}

export const projectsService = {
  async listProjects(filter: ProjectListFilter = {}) {
    const conditions = [];

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
    if (filter.search) {
      conditions.push(
        sql`(${projects.name} ILIKE ${`%${filter.search}%`} OR ${projects.code} ILIKE ${`%${filter.search}%`} OR ${projects.description} ILIKE ${`%${filter.search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const projectRecords = await db.query.projects.findMany({
      where: whereClause,
      orderBy: [desc(projects.createdAt)],
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

  async getProjectById(id: string) {
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

  async getProjectHierarchy(id: string) {
    const project = await this.getProjectById(id);
    if (!project) return null;

    const projectTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectId, id),
      orderBy: [desc(tasks.createdAt)],
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
        subtasks: {
          orderBy: [asc(taskSubtasks.orderIndex), asc(taskSubtasks.createdAt)],
        },
      },
    });

    const subProjectsEnriched = (project.subProjects || []).map((sp: any) => {
      const spTasks = projectTasks.filter((t: any) => t.subProjectId === sp.id);
      const totalSpTasks = spTasks.length;
      const completedSpTasks = spTasks.filter((t: any) => t.status === "COMPLETED").length;
      const spProgress = totalSpTasks > 0 ? Math.round((completedSpTasks / totalSpTasks) * 100) : 0;

      return {
        ...sp,
        tasks: spTasks.map((t: any) => ({
          ...t,
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
        startDate: data.startDate || null,
        targetEndDate: data.targetEndDate || null,
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
