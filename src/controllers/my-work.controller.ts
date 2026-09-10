import { Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";
import { NotFoundError, UnauthorizedError } from "../errors";

export const myWorkController = {
  getSummary: asyncHandler(async (req: CustomRequest, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const currentUserId = req.user.id;
    const userRole = String(req.user.role || "").toUpperCase();
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isAdminOrSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
    const requestedUserId = req.query.userId as string | undefined;

    // Scope determination:
    // - Regular Member / Non-Admin: ALWAYS strictly filtered to current user (cannot view others or organization all).
    // - Admin / Super Admin:
    //     - If requestedUserId is a specific user ID (and not "ALL"): view that member's personal assigned workspace.
    //     - If requestedUserId is "ALL" OR not provided / empty: view company-wide deliverables across all projects and members.
    const isSpecificOtherMemberMode = Boolean(
      isAdminOrSuperAdmin && requestedUserId && requestedUserId !== "ALL"
    );
    const isFilteredToUser = !isAdminOrSuperAdmin || isSpecificOtherMemberMode;
    const targetUserId = isSpecificOtherMemberMode ? requestedUserId! : currentUserId;

    // 1. Fetch Target User Profile
    let targetUser: any;
    let targetUserPermissions: string[] = [];

    if (!isFilteredToUser) {
      targetUser = {
        id: "ALL",
        name: isAdminOrSuperAdmin ? `${req.user.name || "Admin"} (Full Operations)` : "Organization Operations",
        username: req.user.username || "admin",
        phone: req.user.phone || "",
        role: req.user.role || "ADMIN",
        designation: req.user.designation || "Operations & Project Deliverables",
        departmentId: null,
        departmentName: "All Departments",
        departmentColor: "#6366f1",
      };
      targetUserPermissions = [];
    } else {
      const userRes = await db.execute<any>(sql`
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
          d.color as "departmentColor"
        FROM users u
        LEFT JOIN team_departments d ON u.department_id = d.id
        WHERE u.id = ${targetUserId}
      `);

      const userRows = (userRes.rows || userRes) as any[];
      if (userRows.length === 0) {
        throw new NotFoundError("Team member not found");
      }

      targetUser = userRows[0];
      targetUserPermissions =
        targetUser.metadata && Array.isArray(targetUser.metadata.permissions)
          ? targetUser.metadata.permissions
          : [];
    }

    // 2. Fetch Tasks (with project, subproject, assignee, reporter)
    let tasksRes;
    if (!isFilteredToUser) {
      tasksRes = await db.execute<any>(sql`
        SELECT 
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.project_id as "projectId",
          p.name as "projectName",
          p.code as "projectCode",
          p.color as "projectColor",
          t.sub_project_id as "subProjectId",
          sp.name as "subProjectName",
          t.assignee_id as "assigneeId",
          u.name as "assigneeName",
          u.phone as "assigneePhone",
          u.role as "assigneeRole",
          u.designation as "assigneeDesignation",
          t.reporter_id as "reporterId",
          rep.name as "reporterName",
          t.due_date as "dueDate",
          t.estimated_hours as "estimatedHours",
          t.submission_proof_url as "submissionProofUrl",
          t.submission_notes as "submissionNotes",
          t.blocked_reason as "blockedReason",
          t.related_entity_type as "relatedEntityType",
          t.related_entity_id as "relatedEntityId",
          t.related_entity_name as "relatedEntityName",
          t.completed_at as "completedAt",
          t.created_at as "createdAt",
          t.updated_at as "updatedAt",
          t.department_id as "departmentId",
          d.name as "departmentName",
          d.color as "departmentColor",
          COUNT(s.id)::int as "subtasksCount",
          COUNT(s.id) FILTER (WHERE s.is_completed = TRUE)::int as "subtasksCompleted"
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN sub_projects sp ON t.sub_project_id = sp.id
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN users rep ON t.reporter_id = rep.id
        LEFT JOIN team_departments d ON t.department_id = d.id
        LEFT JOIN task_subtasks s ON s.task_id = t.id
        WHERE (p.is_hidden = FALSE OR p.is_hidden IS NULL)
        GROUP BY 
          t.id, 
          d.name, 
          d.color, 
          p.name, 
          p.code, 
          p.color, 
          sp.name, 
          u.name, 
          u.phone, 
          u.role, 
          u.designation, 
          rep.name
        ORDER BY 
          CASE 
            WHEN t.status = 'BLOCKED' THEN 1 
            WHEN t.status = 'IN_PROGRESS' THEN 2 
            WHEN t.status = 'CHANGES_REQUESTED' THEN 3
            WHEN t.status = 'TODO' THEN 4 
            WHEN t.status = 'SUBMITTED_FOR_REVIEW' THEN 5 
            ELSE 6 
          END,
          t.due_date ASC NULLS LAST,
          t.created_at DESC
        LIMIT 250
      `);
    } else {
      tasksRes = await db.execute<any>(sql`
        SELECT 
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.project_id as "projectId",
          p.name as "projectName",
          p.code as "projectCode",
          p.color as "projectColor",
          t.sub_project_id as "subProjectId",
          sp.name as "subProjectName",
          t.assignee_id as "assigneeId",
          u.name as "assigneeName",
          u.phone as "assigneePhone",
          u.role as "assigneeRole",
          u.designation as "assigneeDesignation",
          t.reporter_id as "reporterId",
          rep.name as "reporterName",
          t.due_date as "dueDate",
          t.estimated_hours as "estimatedHours",
          t.submission_proof_url as "submissionProofUrl",
          t.submission_notes as "submissionNotes",
          t.blocked_reason as "blockedReason",
          t.related_entity_type as "relatedEntityType",
          t.related_entity_id as "relatedEntityId",
          t.related_entity_name as "relatedEntityName",
          t.completed_at as "completedAt",
          t.created_at as "createdAt",
          t.updated_at as "updatedAt",
          t.department_id as "departmentId",
          d.name as "departmentName",
          d.color as "departmentColor",
          COUNT(s.id)::int as "subtasksCount",
          COUNT(s.id) FILTER (WHERE s.is_completed = TRUE)::int as "subtasksCompleted"
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN sub_projects sp ON t.sub_project_id = sp.id
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN users rep ON t.reporter_id = rep.id
        LEFT JOIN team_departments d ON t.department_id = d.id
        LEFT JOIN task_subtasks s ON s.task_id = t.id
        WHERE (t.assignee_id = ${targetUserId} OR p.lead_id = ${targetUserId} OR p.created_by_id = ${targetUserId} OR sp.lead_id = ${targetUserId} OR t.reporter_id = ${targetUserId})
          AND (p.id IS NULL OR p.is_hidden = FALSE OR p.is_hidden IS NULL)
        GROUP BY 
          t.id, 
          d.name, 
          d.color, 
          p.name, 
          p.code, 
          p.color, 
          sp.name, 
          u.name, 
          u.phone, 
          u.role, 
          u.designation, 
          rep.name
        ORDER BY 
          CASE 
            WHEN t.status = 'BLOCKED' THEN 1 
            WHEN t.status = 'IN_PROGRESS' THEN 2 
            WHEN t.status = 'CHANGES_REQUESTED' THEN 3
            WHEN t.status = 'TODO' THEN 4 
            WHEN t.status = 'SUBMITTED_FOR_REVIEW' THEN 5 
            ELSE 6 
          END,
          t.due_date ASC NULLS LAST,
          t.created_at DESC
        LIMIT 100
      `);
    }

    const taskRows = ((tasksRes.rows || tasksRes) as any[]);
    const taskIds = taskRows.map((t: any) => t.id);
    const subtasksByTaskId: Record<string, any[]> = {};
    if (taskIds.length > 0) {
      const subtasksRes = await db.execute<any>(sql`
        SELECT 
          s.id,
          s.task_id as "taskId",
          s.title,
          s.is_completed as "isCompleted",
          s.order_index as "orderIndex",
          s.created_at as "createdAt"
        FROM task_subtasks s
        WHERE s.task_id IN (${sql.join(taskIds.map(id => sql`${id}`), sql`, `)})
        ORDER BY s.order_index ASC, s.created_at ASC
      `);
      const subtaskRows = (subtasksRes.rows || subtasksRes) as any[];
      for (const st of subtaskRows) {
        if (!subtasksByTaskId[st.taskId]) {
          subtasksByTaskId[st.taskId] = [];
        }
        subtasksByTaskId[st.taskId].push(st);
      }
    }

    const allTasks = taskRows.map((t: any) => ({
      ...t,
      assignee: t.assigneeId
        ? {
            id: t.assigneeId,
            name: t.assigneeName,
            phone: t.assigneePhone,
            role: t.assigneeRole,
            designation: t.assigneeDesignation,
          }
        : undefined,
      reporter: t.reporterId
        ? {
            id: t.reporterId,
            name: t.reporterName,
          }
        : undefined,
      subtasks: subtasksByTaskId[t.id] || [],
    }));

    // 2.5 Fetch Projects (Admins see ALL active projects; regular members see their assigned/led projects)
    let projectsRes;
    if (!isFilteredToUser) {
      projectsRes = await db.execute<any>(sql`
        SELECT 
          p.id,
          p.name,
          p.code,
          p.color,
          p.status,
          p.priority,
          p.lead_id as "leadId",
          lead.name as "leadName",
          lead.phone as "leadPhone",
          lead.role as "leadRole",
          lead.designation as "leadDesignation",
          d.name as "departmentName",
          d.color as "departmentColor",
          COUNT(DISTINCT t.id)::int as "totalTasks",
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasks",
          COUNT(DISTINCT t.id) FILTER (WHERE t.assignee_id = ${currentUserId})::int as "myTasksCount",
          COUNT(DISTINCT sp.id)::int as "subProjectsCount"
        FROM projects p
        LEFT JOIN users lead ON p.lead_id = lead.id
        LEFT JOIN team_departments d ON p.department_id = d.id
        LEFT JOIN sub_projects sp ON sp.project_id = p.id
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE (p.is_hidden = FALSE OR p.is_hidden IS NULL)
        GROUP BY p.id, lead.name, lead.phone, lead.role, lead.designation, d.name, d.color
        ORDER BY 
          CASE 
            WHEN p.priority = 'URGENT' THEN 1 
            WHEN p.priority = 'HIGH' THEN 2 
            WHEN p.priority = 'MEDIUM' THEN 3 
            ELSE 4 
          END,
          p.created_at DESC
      `);
    } else {
      projectsRes = await db.execute<any>(sql`
        SELECT 
          p.id,
          p.name,
          p.code,
          p.color,
          p.status,
          p.priority,
          p.lead_id as "leadId",
          lead.name as "leadName",
          lead.phone as "leadPhone",
          lead.role as "leadRole",
          lead.designation as "leadDesignation",
          d.name as "departmentName",
          d.color as "departmentColor",
          COUNT(DISTINCT t.id)::int as "totalTasks",
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasks",
          COUNT(DISTINCT t.id) FILTER (WHERE t.assignee_id = ${targetUserId})::int as "myTasksCount",
          COUNT(DISTINCT sp.id)::int as "subProjectsCount"
        FROM projects p
        LEFT JOIN users lead ON p.lead_id = lead.id
        LEFT JOIN team_departments d ON p.department_id = d.id
        LEFT JOIN sub_projects sp ON sp.project_id = p.id
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE (
          p.lead_id = ${targetUserId} 
          OR p.created_by_id = ${targetUserId}
          OR p.id IN (SELECT DISTINCT project_id FROM tasks WHERE (assignee_id = ${targetUserId} OR reporter_id = ${targetUserId}) AND project_id IS NOT NULL)
          OR p.id IN (SELECT DISTINCT project_id FROM sub_projects WHERE lead_id = ${targetUserId})
        )
        AND (p.is_hidden = FALSE OR p.is_hidden IS NULL)
        GROUP BY p.id, lead.name, lead.phone, lead.role, lead.designation, d.name, d.color
        ORDER BY 
          CASE 
            WHEN p.priority = 'URGENT' THEN 1 
            WHEN p.priority = 'HIGH' THEN 2 
            WHEN p.priority = 'MEDIUM' THEN 3 
            ELSE 4 
          END,
          p.created_at DESC
      `);
    }

    const projectRows = ((projectsRes.rows || projectsRes) as any[]);
    const projectIds = projectRows.map((p: any) => p.id);
    const subProjectsByProjectId: Record<string, any[]> = {};
    if (projectIds.length > 0) {
      const spRes = await db.execute<any>(sql`
        SELECT 
          sp.id,
          sp.project_id as "projectId",
          sp.name,
          sp.description,
          sp.status,
          sp.lead_id as "leadId",
          lead.name as "leadName",
          COUNT(DISTINCT t.id)::int as "totalTasks",
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED')::int as "completedTasks"
        FROM sub_projects sp
        LEFT JOIN users lead ON sp.lead_id = lead.id
        LEFT JOIN tasks t ON t.sub_project_id = sp.id
        WHERE sp.project_id IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})
        GROUP BY sp.id, lead.name
        ORDER BY sp.order_index ASC, sp.created_at ASC
      `);
      const spRows = (spRes.rows || spRes) as any[];
      for (const sp of spRows) {
        if (!subProjectsByProjectId[sp.projectId]) {
          subProjectsByProjectId[sp.projectId] = [];
        }
        subProjectsByProjectId[sp.projectId].push(sp);
      }
    }

    const myProjects = projectRows.map((proj: any) => {
      const total = proj.totalTasks || 0;
      const done = proj.completedTasks || 0;
      const progressPercentage = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        ...proj,
        progressPercentage,
        subProjects: subProjectsByProjectId[proj.id] || [],
        lead: proj.leadId
          ? {
              id: proj.leadId,
              name: proj.leadName,
              phone: proj.leadPhone,
              role: proj.leadRole,
              designation: proj.leadDesignation,
            }
          : undefined,
      };
    });

    // 3. Fetch CRM Leads & Callbacks
    let leadsRes;
    if (!isFilteredToUser) {
      leadsRes = await db.execute<any>(sql`
        SELECT 
          l.id,
          l.name,
          l.phone,
          l.email,
          l.user_id as "userId",
          l.college_id as "collegeId",
          l.college_name as "collegeName",
          l.branch,
          l.year_of_study as "yearOfStudy",
          l.assigned_to_user_id as "assignedToUserId",
          l.quality,
          l.status,
          l.source,
          l.source_details as "sourceDetails",
          l.call_count as "callCount",
          l.last_call_at as "lastCallAt",
          l.next_call_at as "nextCallAt",
          l.converted_at as "convertedAt",
          l.conversion_value_paise as "conversionValuePaise",
          l.notes,
          l.tags,
          l.created_at as "createdAt",
          l.updated_at as "updatedAt"
        FROM leads l
        ORDER BY 
          CASE 
            WHEN l.next_call_at IS NOT NULL AND l.next_call_at <= NOW() + INTERVAL '24 hours' THEN 1 
            WHEN l.next_call_at IS NOT NULL THEN 2 
            WHEN l.status IN ('NEW', 'ATTEMPTED', 'INTERESTED', 'FOLLOW_UP_SCHEDULED') THEN 3
            ELSE 4 
          END,
          l.next_call_at ASC NULLS LAST,
          l.updated_at DESC
        LIMIT 200
      `);
    } else {
      leadsRes = await db.execute<any>(sql`
        SELECT 
          l.id,
          l.name,
          l.phone,
          l.email,
          l.user_id as "userId",
          l.college_id as "collegeId",
          l.college_name as "collegeName",
          l.branch,
          l.year_of_study as "yearOfStudy",
          l.assigned_to_user_id as "assignedToUserId",
          l.quality,
          l.status,
          l.source,
          l.source_details as "sourceDetails",
          l.call_count as "callCount",
          l.last_call_at as "lastCallAt",
          l.next_call_at as "nextCallAt",
          l.converted_at as "convertedAt",
          l.conversion_value_paise as "conversionValuePaise",
          l.notes,
          l.tags,
          l.created_at as "createdAt",
          l.updated_at as "updatedAt"
        FROM leads l
        WHERE l.assigned_to_user_id = ${targetUserId}
        ORDER BY 
          CASE 
            WHEN l.next_call_at IS NOT NULL AND l.next_call_at <= NOW() + INTERVAL '24 hours' THEN 1 
            WHEN l.next_call_at IS NOT NULL THEN 2 
            WHEN l.status IN ('NEW', 'ATTEMPTED', 'INTERESTED', 'FOLLOW_UP_SCHEDULED') THEN 3
            ELSE 4 
          END,
          l.next_call_at ASC NULLS LAST,
          l.updated_at DESC
        LIMIT 100
      `);
    }

    const allLeads = (leadsRes.rows || leadsRes) as any[];

    // 4. Fetch Today's Daily EOD Standup Log
    const today = new Date().toISOString().split("T")[0];
    const eodUserId = isFilteredToUser ? targetUserId : currentUserId;
    const eodRes = await db.execute<any>(sql`
      SELECT 
        id,
        user_id as "userId",
        log_date as "logDate",
        completed_summary as "completedSummary",
        plan_tomorrow as "planTomorrow",
        blockers,
        hours_spent as "hoursSpent",
        created_at as "createdAt"
      FROM daily_eod_logs
      WHERE user_id = ${eodUserId} AND log_date = ${today}
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const eodRows = (eodRes.rows || eodRes) as any[];

    // 5. Recent EOD logs history (last 7 days)
    const eodHistoryRes = await db.execute<any>(sql`
      SELECT 
        id,
        log_date as "logDate",
        completed_summary as "completedSummary",
        plan_tomorrow as "planTomorrow",
        blockers,
        hours_spent as "hoursSpent",
        created_at as "createdAt"
      FROM daily_eod_logs
      WHERE user_id = ${eodUserId}
      ORDER BY log_date DESC
      LIMIT 7
    `);
    const eodHistoryRows = (eodHistoryRes.rows || eodHistoryRes) as any[];

    // 6. If caller is Admin or Super Admin, fetch Team Members for workspace switcher
    let teamMembers: any[] = [];
    if (isAdminOrSuperAdmin) {
      const teamRes = await db.execute<any>(sql`
        SELECT 
          u.id,
          u.name,
          u.username,
          u.phone,
          u.role,
          u.designation,
          d.name as "departmentName",
          d.color as "departmentColor",
          COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'CHANGES_REQUESTED', 'SUBMITTED_FOR_REVIEW') OR (t.status IS NOT NULL AND t.status != 'COMPLETED'))::int as "activeTasksCount",
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
        WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'SALES') AND u.is_active = TRUE
        GROUP BY u.id, d.name, d.color
        ORDER BY 
          CASE WHEN u.role = 'SUPER_ADMIN' THEN 1 WHEN u.role = 'ADMIN' THEN 2 ELSE 3 END,
          u.name ASC
      `);
      teamMembers = (teamRes.rows || teamRes) as any[];
    }

    // 7. Calculate Aggregated Metrics
    const activeTasks = allTasks.filter((t: any) =>
      ["TODO", "IN_PROGRESS", "BLOCKED", "CHANGES_REQUESTED", "SUBMITTED_FOR_REVIEW"].includes(t.status)
    );
    const blockedTasks = allTasks.filter((t: any) => t.status === "BLOCKED");
    const completedTasks = allTasks.filter((t: any) => t.status === "COMPLETED");

    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETED"
    );

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const callbacksDueToday = allLeads.filter(
      (l: any) =>
        l.nextCallAt &&
        new Date(l.nextCallAt) <= endOfToday &&
        !["CONVERTED", "LOST", "JUNK", "NOT_A_LEAD"].includes(l.status)
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const completedThisWeek = allTasks.filter(
      (t: any) => t.completedAt && new Date(t.completedAt) >= sevenDaysAgo
    );

    res.json({
      success: true,
      data: {
        targetUser: {
          ...targetUser,
          permissions: targetUserPermissions,
        },
        isViewingOtherMember: isFilteredToUser && targetUserId !== currentUserId,
        metrics: {
          activeTasksCount: activeTasks.length,
          blockedTasksCount: blockedTasks.length,
          overdueTasksCount: overdueTasks.length,
          completedTasksCount: completedTasks.length,
          completedThisWeekCount: completedThisWeek.length,
          assignedLeadsCount: allLeads.length,
          callbacksDueTodayCount: callbacksDueToday.length,
          hasSubmittedTodayEod: eodRows.length > 0,
          projectsCount: myProjects.length,
        },
        projects: myProjects,
        tasks: allTasks,
        leads: allLeads,
        todayEod: eodRows[0] || null,
        eodHistory: eodHistoryRows,
        teamMembers,
      },
    });
  }),
};
