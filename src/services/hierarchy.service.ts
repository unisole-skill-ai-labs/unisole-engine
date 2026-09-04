import { db, pool } from "../db";
import {
  projects,
  subProjects,
  tasks,
  taskSubtasks,
  users,
} from "../db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { NotFoundError, ValidationError } from "../errors";

export const hierarchyService = {
  // 1. Upgrade Sub-Task (Tier 4) -> Task (Tier 3)
  async upgradeSubtaskToTask(data: { taskId: string; subtaskId: string; reporterId?: string }) {
    const { taskId, subtaskId, reporterId } = data;

    // Fetch parent task
    const [parentTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!parentTask) throw new NotFoundError("Parent task not found");

    // Fetch subtask
    const [subtask] = await db
      .select()
      .from(taskSubtasks)
      .where(and(eq(taskSubtasks.id, subtaskId), eq(taskSubtasks.taskId, taskId)));
    if (!subtask) throw new NotFoundError("Subtask not found");

    // Create new Task
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: subtask.title,
        description: `Upgraded from subtask of task "${parentTask.title}"`,
        projectId: parentTask.projectId,
        subProjectId: parentTask.subProjectId,
        departmentId: parentTask.departmentId,
        assigneeId: parentTask.assigneeId,
        reporterId: reporterId || parentTask.reporterId,
        status: subtask.isCompleted ? "COMPLETED" : "TODO",
        priority: parentTask.priority,
        dueDate: parentTask.dueDate,
      })
      .returning();

    // Delete the original subtask
    await db.delete(taskSubtasks).where(eq(taskSubtasks.id, subtaskId));

    return newTask;
  },

  // 2. Downgrade Task (Tier 3) -> Sub-Task (Tier 4)
  async downgradeTaskToSubtask(data: { taskId: string; targetTaskId: string }) {
    const { taskId, targetTaskId } = data;
    if (taskId === targetTaskId) {
      throw new ValidationError("Cannot convert a task to a subtask of itself");
    }

    const [sourceTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!sourceTask) throw new NotFoundError("Source task not found");

    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, targetTaskId));
    if (!targetTask) throw new NotFoundError("Target task not found");

    // Fetch existing subtasks of source task
    const sourceSubtasks = await db
      .select()
      .from(taskSubtasks)
      .where(eq(taskSubtasks.taskId, taskId))
      .orderBy(asc(taskSubtasks.orderIndex));

    // Get order index for target task
    const countRes = await pool.query(
      "SELECT COUNT(*) FROM task_subtasks WHERE task_id = $1",
      [targetTaskId]
    );
    let nextIndex = Number(countRes.rows[0].count) + 1;

    // Insert main task as subtask
    await db.insert(taskSubtasks).values({
      taskId: targetTaskId,
      title: sourceTask.title,
      isCompleted: sourceTask.status === "COMPLETED",
      orderIndex: nextIndex++,
    });

    // Also migrate any subtasks of source task
    for (const st of sourceSubtasks) {
      await db.insert(taskSubtasks).values({
        taskId: targetTaskId,
        title: `↳ ${st.title}`,
        isCompleted: st.isCompleted,
        orderIndex: nextIndex++,
      });
    }

    // Delete the source task
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return targetTask;
  },

  // 3. Upgrade Task (Tier 3) -> Sub-Project (Tier 2)
  async upgradeTaskToSubProject(data: { taskId: string; targetProjectId?: string; userId?: string }) {
    const { taskId, targetProjectId, userId } = data;

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) throw new NotFoundError("Task not found");

    const effectiveProjectId = targetProjectId || task.projectId;
    if (!effectiveProjectId) {
      throw new ValidationError("A project is required to convert a task into a sub-project milestone");
    }

    // Fetch subtasks of the task
    const subtaskList = await db
      .select()
      .from(taskSubtasks)
      .where(eq(taskSubtasks.taskId, taskId))
      .orderBy(asc(taskSubtasks.orderIndex));

    // Create new Sub-Project Milestone
    const [newSubProject] = await db
      .insert(subProjects)
      .values({
        projectId: effectiveProjectId,
        name: task.title,
        description: task.description || undefined,
        leadId: task.assigneeId || undefined,
        status: task.status === "COMPLETED" ? "COMPLETED" : "TODO",
        targetEndDate: task.dueDate || undefined,
      })
      .returning();

    // Convert subtasks into full tasks inside this subproject
    if (subtaskList.length > 0) {
      for (const st of subtaskList) {
        await db.insert(tasks).values({
          title: st.title,
          projectId: effectiveProjectId,
          subProjectId: newSubProject.id,
          departmentId: task.departmentId,
          assigneeId: task.assigneeId,
          reporterId: userId || task.reporterId,
          status: st.isCompleted ? "COMPLETED" : "TODO",
          priority: task.priority,
        });
      }
    } else {
      // Create at least one initial task from the original task
      await db.insert(tasks).values({
        title: `Execute: ${task.title}`,
        description: task.description,
        projectId: effectiveProjectId,
        subProjectId: newSubProject.id,
        departmentId: task.departmentId,
        assigneeId: task.assigneeId,
        reporterId: userId || task.reporterId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      });
    }

    // Delete original task
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return newSubProject;
  },

  // 4. Downgrade Sub-Project (Tier 2) -> Task (Tier 3)
  async downgradeSubProjectToTask(data: {
    subProjectId: string;
    targetProjectId?: string;
    targetSubProjectId?: string;
    userId?: string;
  }) {
    const { subProjectId, targetProjectId, targetSubProjectId, userId } = data;

    const [sp] = await db.select().from(subProjects).where(eq(subProjects.id, subProjectId));
    if (!sp) throw new NotFoundError("Sub-project not found");

    const effectiveProjectId = targetProjectId || sp.projectId;

    // Fetch all tasks in this subproject
    const spTasks = await db.select().from(tasks).where(eq(tasks.subProjectId, subProjectId));

    // Create new Task representing this milestone
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: sp.name,
        description: sp.description || undefined,
        projectId: effectiveProjectId,
        subProjectId: targetSubProjectId || null,
        assigneeId: sp.leadId || undefined,
        reporterId: userId,
        status: sp.status === "COMPLETED" ? "COMPLETED" : "TODO",
        dueDate: sp.targetEndDate || undefined,
      })
      .returning();

    // Convert each task into subtasks under newTask
    let order = 1;
    for (const t of spTasks) {
      await db.insert(taskSubtasks).values({
        taskId: newTask.id,
        title: t.title,
        isCompleted: t.status === "COMPLETED",
        orderIndex: order++,
      });

      // Also grab nested subtasks
      const nested = await db
        .select()
        .from(taskSubtasks)
        .where(eq(taskSubtasks.taskId, t.id));

      for (const n of nested) {
        await db.insert(taskSubtasks).values({
          taskId: newTask.id,
          title: `↳ ${n.title}`,
          isCompleted: n.isCompleted,
          orderIndex: order++,
        });
      }
    }

    // Delete subproject (cascades tasks)
    await db.delete(subProjects).where(eq(subProjects.id, subProjectId));

    return newTask;
  },

  // 5. Upgrade Sub-Project (Tier 2) -> Project (Tier 1)
  async upgradeSubProjectToProject(data: { subProjectId: string; code?: string; userId?: string }) {
    const { subProjectId, code, userId } = data;

    const [sp] = await db.select().from(subProjects).where(eq(subProjects.id, subProjectId));
    if (!sp) throw new NotFoundError("Sub-project not found");

    const projectCode =
      code ||
      `PRJ-${sp.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() || "PROJ"}-${Date.now()
        .toString()
        .slice(-4)}`;

    // Create new Project
    const [newProject] = await db
      .insert(projects)
      .values({
        code: projectCode,
        name: sp.name,
        description: sp.description || undefined,
        leadId: sp.leadId || undefined,
        createdById: userId,
        status: sp.status === "COMPLETED" ? "COMPLETED" : "ACTIVE",
        startDate: sp.startDate || undefined,
        targetEndDate: sp.targetEndDate || undefined,
      })
      .returning();

    // Re-parent all tasks from old subproject to new project
    await db
      .update(tasks)
      .set({
        projectId: newProject.id,
        subProjectId: null,
      })
      .where(eq(tasks.subProjectId, subProjectId));

    // Delete the old subproject
    await db.delete(subProjects).where(eq(subProjects.id, subProjectId));

    return newProject;
  },

  // 6. Downgrade Project (Tier 1) -> Sub-Project (Tier 2)
  async downgradeProjectToSubProject(data: { projectId: string; targetProjectId: string }) {
    const { projectId, targetProjectId } = data;
    if (projectId === targetProjectId) {
      throw new ValidationError("Cannot downgrade a project into itself");
    }

    const [srcProject] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!srcProject) throw new NotFoundError("Source project not found");

    const [tgtProject] = await db.select().from(projects).where(eq(projects.id, targetProjectId));
    if (!tgtProject) throw new NotFoundError("Target project not found");

    // Create new Sub-Project under target project
    const [newSubProject] = await db
      .insert(subProjects)
      .values({
        projectId: targetProjectId,
        name: srcProject.name,
        description: srcProject.description || undefined,
        leadId: srcProject.leadId || undefined,
        status: srcProject.status === "COMPLETED" ? "COMPLETED" : "TODO",
        startDate: srcProject.startDate || undefined,
        targetEndDate: srcProject.targetEndDate || undefined,
      })
      .returning();

    // Re-parent all tasks of source project
    await db
      .update(tasks)
      .set({
        projectId: targetProjectId,
        subProjectId: newSubProject.id,
      })
      .where(eq(tasks.projectId, projectId));

    // Delete source project (will delete empty subprojects)
    await db.delete(projects).where(eq(projects.id, projectId));

    return newSubProject;
  },

  // 7. Move Item (Re-parenting / Drag & Drop)
  async moveItem(data: {
    itemType: "PROJECT" | "SUB_PROJECT" | "TASK" | "SUBTASK";
    itemId: string;
    targetProjectId?: string;
    targetSubProjectId?: string;
    targetTaskId?: string;
    orderIndex?: number;
  }) {
    const { itemType, itemId, targetProjectId, targetSubProjectId, targetTaskId, orderIndex } = data;

    if (itemType === "TASK") {
      const updatePayload: any = {};
      if (targetProjectId !== undefined) updatePayload.projectId = targetProjectId || null;
      if (targetSubProjectId !== undefined) updatePayload.subProjectId = targetSubProjectId || null;

      await db.update(tasks).set(updatePayload).where(eq(tasks.id, itemId));
      return { success: true };
    }

    if (itemType === "SUB_PROJECT") {
      if (!targetProjectId) throw new ValidationError("Target project is required to move a sub-project");

      await db.update(subProjects).set({ projectId: targetProjectId }).where(eq(subProjects.id, itemId));
      // Also update tasks of this subproject
      await db.update(tasks).set({ projectId: targetProjectId }).where(eq(tasks.subProjectId, itemId));
      return { success: true };
    }

    if (itemType === "SUBTASK") {
      if (!targetTaskId) throw new ValidationError("Target task is required to move a subtask");

      await db.update(taskSubtasks).set({ taskId: targetTaskId }).where(eq(taskSubtasks.id, itemId));
      return { success: true };
    }

    return { success: true };
  },
};
