import { sql } from "drizzle-orm";
import { db } from "../db";

/**
 * Shared status classification used consistently across:
 * - Level 1 activity list counts
 * - Level 2 activity detail summary counts
 * - Level 2 status filter & CSV export
 *
 * Note: DRAFT submissions are excluded everywhere.
 * - PENDING:  latest non-DRAFT submission has status in ('SUBMITTED', 'UNDER_REVIEW', 'PENDING')
 * - REVIEWED: latest non-DRAFT submission has status in ('GRADED', 'APPROVED', 'COMPLETED')
 */
export const PENDING_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "PENDING"] as const;
export const REVIEWED_STATUSES = ["GRADED", "APPROVED", "COMPLETED"] as const;

export type ActivityKind = "lesson" | "assignment";

export interface ParsedActivityId {
  kind: ActivityKind | "any";
  rawId: string;
}

/**
 * Unambiguous activity identifier format:
 * - "lesson:<lesson_id>" for lesson-based activities (when assignment_id is NULL)
 * - "assignment:<assignment_id>" for course_assignments rows (when assignment_id is NOT NULL)
 */
export function parseActivityId(activityId: string): ParsedActivityId {
  const decoded = decodeURIComponent(activityId || "").trim();
  if (decoded.startsWith("assignment:")) {
    return { kind: "assignment", rawId: decoded.slice("assignment:".length) };
  }
  if (decoded.startsWith("lesson:")) {
    return { kind: "lesson", rawId: decoded.slice("lesson:".length) };
  }
  return { kind: "any", rawId: decoded };
}

function getCallerScope(callerRoles: string[]) {
  const isAdminOrManager = callerRoles.some((r) =>
    ["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r)
  );
  const isMentorOnly = callerRoles.includes("MENTOR") && !isAdminOrManager;
  return { isAdminOrManager, isMentorOnly };
}

function mentorSubmissionScopeSql(callerUserId: string, isMentorOnly: boolean) {
  if (!isMentorOnly) return sql``;
  return sql`AND EXISTS (
    SELECT 1 FROM mentor_mentees mm
    JOIN mentors m ON m.id = mm.mentor_id
    WHERE mm.mentee_id = s.user_id
      AND m.user_id = ${callerUserId}
      AND mm.status = 'ACTIVE'
  )`;
}

function escapeCsvCell(val: unknown): string {
  let str = val === null || val === undefined ? "" : String(val);
  // Prevent spreadsheet formula injection (=, +, -, @)
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const QUIZ_TYPES_SQL = sql`('quiz', 'mcq')`;

let hasCourseAssignmentsTableCache: boolean | null = null;
async function hasCourseAssignmentsTable(): Promise<boolean> {
  if (hasCourseAssignmentsTableCache !== null) return hasCourseAssignmentsTableCache;
  try {
    const res = await db.execute<any>(sql`SELECT to_regclass('public.course_assignments') AS reg`);
    hasCourseAssignmentsTableCache = Boolean((res.rows || res)[0]?.reg);
  } catch {
    hasCourseAssignmentsTableCache = false;
  }
  return hasCourseAssignmentsTableCache;
}

/**
 * Shared CTE building the per-student latest non-DRAFT submission and catalog of
 * known activities (lessons with quiz/assignment content, course_assignments if present,
 * and any orphaned submissions).
 */
function buildActivityCatalogCte(
  callerUserId: string,
  isMentorOnly: boolean,
  includeCourseAssignments: boolean
) {
  const mentorFilter = mentorSubmissionScopeSql(callerUserId, isMentorOnly);
  const assignmentUnionSql = includeCourseAssignments
    ? sql`
      UNION ALL
      SELECT
        'assignment:' || ca.id AS activity_id,
        NULL::varchar AS lesson_id,
        ca.id AS assignment_id,
        ca.title AS catalog_title,
        LOWER(ca.type::text) AS catalog_type,
        ca.module_id AS module_id,
        m.title AS module_title,
        ca.course_id AS course_id
      FROM course_assignments ca
      LEFT JOIN modules m ON m.id = ca.module_id
    `
    : sql``;

  return sql`
    WITH scoped_submissions AS (
      SELECT
        s.*,
        CASE
          WHEN s.assignment_id IS NOT NULL AND s.assignment_id <> '' THEN 'assignment:' || s.assignment_id
          ELSE 'lesson:' || s.lesson_id
        END AS activity_id
      FROM submissions s
      WHERE s.status::text <> 'DRAFT'
      ${mentorFilter}
    ),
    student_attempts AS (
      SELECT
        activity_id,
        user_id,
        COUNT(*)::int AS attempt_count
      FROM scoped_submissions
      GROUP BY activity_id, user_id
    ),
    latest_student_sub AS (
      SELECT DISTINCT ON (ss.activity_id, ss.user_id)
        ss.*,
        sa.attempt_count
      FROM scoped_submissions ss
      JOIN student_attempts sa
        ON sa.activity_id = ss.activity_id AND sa.user_id = ss.user_id
      ORDER BY ss.activity_id, ss.user_id, ss.created_at DESC, ss.id DESC
    ),
    sub_agg AS (
      SELECT
        lss.activity_id,
        MAX(lss.lesson_id) AS lesson_id,
        MAX(lss.assignment_id) AS assignment_id,
        MAX(lss.pathway_id) AS pathway_id,
        MAX(lss.title) AS sub_title,
        MAX(LOWER(lss.type)) AS sub_type,
        COUNT(*)::int AS submitted_count,
        COUNT(*) FILTER (WHERE lss.status::text IN ('SUBMITTED', 'UNDER_REVIEW', 'PENDING'))::int AS pending_count,
        COUNT(*) FILTER (WHERE lss.status::text IN ('GRADED', 'APPROVED', 'COMPLETED'))::int AS reviewed_count,
        ROUND(AVG(CASE WHEN lss.score IS NOT NULL THEN lss.score::numeric END), 1) AS avg_score,
        MAX(lss.created_at) AS latest_submitted_at
      FROM latest_student_sub lss
      GROUP BY lss.activity_id
    ),
    lesson_activities AS (
      SELECT
        'lesson:' || l.id AS activity_id,
        l.id AS lesson_id,
        NULL::varchar AS assignment_id,
        l.title AS catalog_title,
        CASE
          WHEN l.content ~* '"(type|contentType|practiceType)"\\s*:\\s*"(quiz|mcq)"' THEN 'quiz'
          WHEN l.content ~* '"(type|contentType)"\\s*:\\s*"coding_test"' THEN 'coding_test'
          WHEN l.content ~* '"(type|contentType)"\\s*:\\s*"subjective_test"' THEN 'subjective_test'
          WHEN l.content ~* '"(type|contentType)"\\s*:\\s*"video_test"' THEN 'video_test'
          WHEN l.content ~* '"(type|contentType)"\\s*:\\s*"project"' THEN 'project'
          ELSE 'assignment'
        END AS catalog_type,
        ml.module_id AS module_id,
        m.title AS module_title,
        cm.course_id AS course_id
      FROM lessons l
      LEFT JOIN LATERAL (
        SELECT ml2.module_id
        FROM module_lessons ml2
        WHERE ml2.lesson_id = l.id
        ORDER BY ml2.position ASC
        LIMIT 1
      ) ml ON TRUE
      LEFT JOIN modules m ON m.id = ml.module_id
      LEFT JOIN LATERAL (
        SELECT cm2.course_id
        FROM course_modules cm2
        WHERE cm2.module_id = ml.module_id
        ORDER BY cm2.position ASC
        LIMIT 1
      ) cm ON TRUE
      WHERE l.content ~* '"(type|contentType)"\\s*:\\s*"(quiz|mcq|assignment|project|subjective_test|coding_test|video_test)"'
         OR EXISTS (SELECT 1 FROM sub_agg sa WHERE sa.activity_id = 'lesson:' || l.id)
    ),
    all_catalog AS (
      SELECT * FROM lesson_activities
      ${assignmentUnionSql}
    ),
    merged_activities AS (
      SELECT
        COALESCE(ac.activity_id, sa.activity_id) AS activity_id,
        COALESCE(ac.lesson_id, sa.lesson_id) AS lesson_id,
        COALESCE(ac.assignment_id, sa.assignment_id) AS assignment_id,
        COALESCE(NULLIF(ac.catalog_title, ''), NULLIF(sa.sub_title, ''), COALESCE(ac.lesson_id, ac.assignment_id, sa.activity_id)) AS title,
        COALESCE(NULLIF(sa.sub_type, ''), NULLIF(ac.catalog_type, ''), 'assignment') AS activity_type,
        ac.module_id AS raw_module_id,
        ac.module_title AS raw_module_title,
        COALESCE(c.id, p.id) AS resolved_course_id,
        COALESCE(c.title, p.title, NULLIF(sa.pathway_id, '')) AS resolved_course_title,
        COALESCE(sa.submitted_count, 0)::int AS submitted_count,
        COALESCE(sa.pending_count, 0)::int AS pending_count,
        COALESCE(sa.reviewed_count, 0)::int AS reviewed_count,
        sa.avg_score,
        sa.latest_submitted_at
      FROM all_catalog ac
      FULL OUTER JOIN sub_agg sa ON sa.activity_id = ac.activity_id
      LEFT JOIN courses c
        ON (c.id = COALESCE(ac.course_id, sa.pathway_id) OR c.slug = COALESCE(ac.course_id, sa.pathway_id))
      LEFT JOIN pathways p
        ON (p.id = COALESCE(ac.course_id, sa.pathway_id) OR p.slug = COALESCE(ac.course_id, sa.pathway_id))
    )
  `;
}

export const adminSubmissionsService = {
  async getActivities(options: {
    callerUserId: string;
    callerRoles: string[];
    tab?: string;
    courseId?: string;
    moduleId?: string;
    search?: string;
    pendingOnly?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      callerUserId,
      callerRoles,
      tab = "assignments",
      courseId,
      moduleId,
      search,
      pendingOnly = false,
      sort = "pending_desc",
    } = options;

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const offset = (page - 1) * limit;
    const { isMentorOnly } = getCallerScope(callerRoles);

    const cte = buildActivityCatalogCte(callerUserId, isMentorOnly, await hasCourseAssignmentsTable());
    const whereClauses: any[] = [];

    if (tab === "quizzes") {
      whereClauses.push(sql`LOWER(ma.activity_type) IN ${QUIZ_TYPES_SQL}`);
    } else {
      whereClauses.push(sql`LOWER(ma.activity_type) NOT IN ${QUIZ_TYPES_SQL}`);
    }

    if (courseId && courseId !== "ALL") {
      whereClauses.push(sql`ma.resolved_course_id = ${courseId}`);
    }
    if (moduleId && moduleId !== "ALL") {
      whereClauses.push(sql`ma.raw_module_id = ${moduleId}`);
    }
    if (pendingOnly && tab !== "quizzes") {
      whereClauses.push(sql`ma.pending_count > 0`);
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClauses.push(sql`(
        ma.title ILIKE ${q} OR
        COALESCE(ma.resolved_course_title, '') ILIKE ${q} OR
        COALESCE(ma.raw_module_title, '') ILIKE ${q}
      )`);
    }

    const whereSql = whereClauses.length > 0 ? sql`WHERE ${sql.join(whereClauses, sql` AND `)}` : sql``;

    let orderBySql = sql`ORDER BY ma.pending_count DESC, ma.latest_submitted_at DESC NULLS LAST, ma.title ASC`;
    if (sort === "latest_desc") {
      orderBySql = sql`ORDER BY ma.latest_submitted_at DESC NULLS LAST, ma.pending_count DESC, ma.title ASC`;
    } else if (sort === "submitted_desc") {
      orderBySql = sql`ORDER BY ma.submitted_count DESC, ma.latest_submitted_at DESC NULLS LAST, ma.title ASC`;
    } else if (sort === "title_asc") {
      orderBySql = sql`ORDER BY ma.title ASC`;
    } else if (tab === "quizzes" && sort === "pending_desc") {
      orderBySql = sql`ORDER BY ma.latest_submitted_at DESC NULLS LAST, ma.submitted_count DESC, ma.title ASC`;
    }

    const countRes = await db.execute<any>(sql`
      ${cte}
      SELECT COUNT(*)::int AS total
      FROM merged_activities ma
      ${whereSql};
    `);
    const total = Number((countRes.rows || countRes)[0]?.total || 0);

    const rowsRes = await db.execute<any>(sql`
      ${cte}
      SELECT
        ma.activity_id AS "activityId",
        ma.lesson_id AS "lessonId",
        ma.assignment_id AS "assignmentId",
        ma.title,
        ma.activity_type AS "type",
        ma.resolved_course_id AS "courseId",
        COALESCE(ma.resolved_course_title, 'Unassigned / Orphaned') AS "courseTitle",
        ma.raw_module_id AS "moduleId",
        COALESCE(ma.raw_module_title, '—') AS "moduleTitle",
        ma.submitted_count AS "submittedCount",
        ma.pending_count AS "pendingCount",
        ma.reviewed_count AS "reviewedCount",
        ma.avg_score AS "avgScore",
        ma.latest_submitted_at AS "latestSubmittedAt"
      FROM merged_activities ma
      ${whereSql}
      ${orderBySql}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const filtersRes = await db.execute<any>(sql`
      ${cte}
      SELECT DISTINCT
        ma.resolved_course_id AS "courseId",
        ma.resolved_course_title AS "courseTitle",
        ma.raw_module_id AS "moduleId",
        ma.raw_module_title AS "moduleTitle"
      FROM merged_activities ma
      WHERE ma.resolved_course_id IS NOT NULL OR ma.raw_module_id IS NOT NULL
      ORDER BY "courseTitle" ASC NULLS LAST, "moduleTitle" ASC NULLS LAST;
    `);

    const filterRows = (filtersRes.rows || filtersRes) as any[];
    const coursesMap = new Map<string, string>();
    const modulesList: { id: string; title: string; courseId: string | null }[] = [];
    const seenModules = new Set<string>();

    for (const r of filterRows) {
      if (r.courseId && !coursesMap.has(r.courseId)) {
        coursesMap.set(r.courseId, r.courseTitle || r.courseId);
      }
      if (r.moduleId && !seenModules.has(r.moduleId)) {
        seenModules.add(r.moduleId);
        modulesList.push({
          id: r.moduleId,
          title: r.moduleTitle || r.moduleId,
          courseId: r.courseId || null,
        });
      }
    }

    return {
      items: (rowsRes.rows || rowsRes).map((r: any) => ({
        ...r,
        avgScore: r.avgScore !== null && r.avgScore !== undefined ? Number(r.avgScore) : null,
      })),
      total,
      page,
      limit,
      filters: {
        courses: Array.from(coursesMap.entries()).map(([id, title]) => ({ id, title })),
        modules: modulesList,
      },
    };
  },

  async getActivityDetail(options: {
    callerUserId: string;
    callerRoles: string[];
    activityId: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      callerUserId,
      callerRoles,
      activityId,
      status = "ALL",
      search,
      sort = "submitted_desc",
    } = options;

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const offset = (page - 1) * limit;
    const { isMentorOnly } = getCallerScope(callerRoles);

    const parsed = parseActivityId(activityId);
    const canonicalActivityId =
      parsed.kind === "assignment"
        ? `assignment:${parsed.rawId}`
        : parsed.kind === "lesson"
        ? `lesson:${parsed.rawId}`
        : parsed.rawId;

    const cte = buildActivityCatalogCte(callerUserId, isMentorOnly, await hasCourseAssignmentsTable());

    const activityRes = await db.execute<any>(sql`
      ${cte}
      SELECT
        ma.activity_id AS "activityId",
        ma.lesson_id AS "lessonId",
        ma.assignment_id AS "assignmentId",
        ma.title,
        ma.activity_type AS "type",
        ma.resolved_course_id AS "courseId",
        COALESCE(ma.resolved_course_title, 'Unassigned / Orphaned') AS "courseTitle",
        ma.raw_module_id AS "moduleId",
        COALESCE(ma.raw_module_title, '—') AS "moduleTitle",
        ma.submitted_count AS "submittedCount",
        ma.pending_count AS "pendingCount",
        ma.reviewed_count AS "reviewedCount",
        ma.avg_score AS "avgScore",
        ma.latest_submitted_at AS "latestSubmittedAt"
      FROM merged_activities ma
      WHERE ma.activity_id = ${canonicalActivityId}
         OR ( ${parsed.kind === "any"} AND (ma.lesson_id = ${parsed.rawId} OR ma.assignment_id = ${parsed.rawId}) )
      LIMIT 1;
    `);

    const activityRow = (activityRes.rows || activityRes)[0];
    if (!activityRow) {
      return null;
    }

    const targetActivityId = activityRow.activityId;
    const whereClauses: any[] = [sql`lss.activity_id = ${targetActivityId}`];

    if (status === "PENDING") {
      whereClauses.push(sql`lss.status::text IN ('SUBMITTED', 'UNDER_REVIEW', 'PENDING')`);
    } else if (status === "REVIEWED") {
      whereClauses.push(sql`lss.status::text IN ('GRADED', 'APPROVED', 'COMPLETED')`);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClauses.push(sql`(
        COALESCE(u.name, '') ILIKE ${q} OR
        COALESCE(u.email, '') ILIKE ${q}
      )`);
    }

    const whereSql = sql`WHERE ${sql.join(whereClauses, sql` AND `)}`;

    let orderBySql = sql`ORDER BY lss.created_at DESC, lss.id DESC`;
    if (sort === "submitted_asc") {
      orderBySql = sql`ORDER BY lss.created_at ASC, lss.id ASC`;
    } else if (sort === "name_asc") {
      orderBySql = sql`ORDER BY COALESCE(u.name, 'Deleted Student') ASC, lss.created_at DESC`;
    } else if (sort === "name_desc") {
      orderBySql = sql`ORDER BY COALESCE(u.name, 'Deleted Student') DESC, lss.created_at DESC`;
    }

    const countRes = await db.execute<any>(sql`
      ${cte}
      SELECT COUNT(*)::int AS total
      FROM latest_student_sub lss
      LEFT JOIN users u ON u.id = lss.user_id
      ${whereSql};
    `);
    const total = Number((countRes.rows || countRes)[0]?.total || 0);

    const rowsRes = await db.execute<any>(sql`
      ${cte}
      SELECT
        lss.id,
        lss.activity_id AS "activityId",
        lss.user_id AS "studentId",
        COALESCE(u.name, 'Deleted Student') AS "studentName",
        COALESCE(u.email, '') AS "studentEmail",
        COALESCE(u.phone, '') AS "studentPhone",
        lss.lesson_id AS "lessonId",
        lss.assignment_id AS "assignmentId",
        ${activityRow.title} AS "lessonTitle",
        ${activityRow.courseTitle} AS "courseTitle",
        lss.type,
        lss.submission_url AS "submissionUrl",
        lss.submission_text AS "submissionText",
        lss.code_snippet AS "codeSnippet",
        lss.video_url AS "videoUrl",
        lss.score,
        COALESCE(lss.max_score, 100) AS "maxScore",
        lss.status,
        lss.mentor_feedback AS "mentorFeedback",
        lss.evaluated_at AS "evaluatedAt",
        lss.created_at AS "createdAt",
        lss.updated_at AS "updatedAt",
        lss.attempt_count AS "attemptCount"
      FROM latest_student_sub lss
      LEFT JOIN users u ON u.id = lss.user_id
      ${whereSql}
      ${orderBySql}
      LIMIT ${limit} OFFSET ${offset};
    `);

    // Ordered pending submission IDs for "Next pending" review workflow
    const pendingRes = await db.execute<any>(sql`
      ${cte}
      SELECT lss.id
      FROM latest_student_sub lss
      WHERE lss.activity_id = ${targetActivityId}
        AND lss.status::text IN ('SUBMITTED', 'UNDER_REVIEW', 'PENDING')
      ORDER BY lss.created_at ASC, lss.id ASC;
    `);

    const isQuiz = ["quiz", "mcq"].includes(String(activityRow.type || "").toLowerCase());

    return {
      activity: {
        ...activityRow,
        tab: isQuiz ? "quizzes" : "assignments",
        avgScore: activityRow.avgScore !== null && activityRow.avgScore !== undefined ? Number(activityRow.avgScore) : null,
      },
      items: rowsRes.rows || rowsRes,
      total,
      page,
      limit,
      pendingSubmissionIds: (pendingRes.rows || pendingRes).map((r: any) => r.id),
    };
  },

  async getActivityNotSubmitted(options: {
    callerUserId: string;
    callerRoles: string[];
    activityId: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { callerUserId, callerRoles, activityId, search } = options;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const offset = (page - 1) * limit;
    const { isMentorOnly } = getCallerScope(callerRoles);

    const detail = await this.getActivityDetail({
      callerUserId,
      callerRoles,
      activityId,
      page: 1,
      limit: 1,
    });

    if (!detail || !detail.activity.courseId) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        orphaned: !detail || !detail.activity.courseId,
      };
    }

    const courseId = detail.activity.courseId;
    const targetActivityId = detail.activity.activityId;

    // Resolve all matching course/pathway IDs & slugs for enrollment lookup
    const courseRefsRes = await db.execute<any>(sql`
      SELECT id, slug FROM courses WHERE id = ${courseId} OR slug = ${courseId}
      UNION
      SELECT id, slug FROM pathways WHERE id = ${courseId} OR slug = ${courseId};
    `);
    const refIds = new Set<string>([courseId]);
    for (const r of (courseRefsRes.rows || courseRefsRes) as any[]) {
      if (r.id) refIds.add(r.id);
      if (r.slug) refIds.add(r.slug);
    }
    const refArray = Array.from(refIds);

    const mentorJoinSql = isMentorOnly
      ? sql`AND EXISTS (
          SELECT 1 FROM mentor_mentees mm
          JOIN mentors m ON m.id = mm.mentor_id
          WHERE mm.mentee_id = u.id
            AND m.user_id = ${callerUserId}
            AND mm.status = 'ACTIVE'
        )`
      : sql``;

    const searchSql =
      search && search.trim()
        ? sql`AND (COALESCE(u.name, '') ILIKE ${`%${search.trim()}%`} OR COALESCE(u.email, '') ILIKE ${`%${search.trim()}%`})`
        : sql``;

    const matchCourseSql = sql.join(
      refArray.map((ref) => sql`e.pathway_id = ${ref} OR e.item_id = ${ref}`),
      sql` OR `
    );

    const baseQuery = sql`
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      WHERE e.status = 'ACTIVE'
        AND (${matchCourseSql})
        AND NOT EXISTS (
          SELECT 1 FROM submissions s
          WHERE s.user_id = u.id
            AND s.status::text <> 'DRAFT'
            AND (
              CASE
                WHEN s.assignment_id IS NOT NULL AND s.assignment_id <> '' THEN 'assignment:' || s.assignment_id
                ELSE 'lesson:' || s.lesson_id
              END
            ) = ${targetActivityId}
        )
        ${mentorJoinSql}
        ${searchSql}
    `;

    const countRes = await db.execute<any>(sql`
      SELECT COUNT(DISTINCT u.id)::int AS total
      ${baseQuery};
    `);
    const total = Number((countRes.rows || countRes)[0]?.total || 0);

    const rowsRes = await db.execute<any>(sql`
      SELECT DISTINCT ON (u.id)
        u.id AS "studentId",
        COALESCE(u.name, 'Student') AS "studentName",
        COALESCE(u.email, '') AS "studentEmail",
        e.enrolled_at AS "enrolledAt"
      ${baseQuery}
      ORDER BY u.id, e.enrolled_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset};
    `);

    return {
      items: rowsRes.rows || rowsRes,
      total,
      page,
      limit,
      orphaned: false,
    };
  },

  async exportActivityCsv(options: {
    callerUserId: string;
    callerRoles: string[];
    activityId: string;
    status?: string;
    search?: string;
    sort?: string;
  }) {
    const detail = await this.getActivityDetail({
      ...options,
      page: 1,
      limit: 5000,
    });
    if (!detail) return null;

    const header = ["Student", "Email", "Status", "Score", "Submitted Time"]
      .map(escapeCsvCell)
      .join(",");

    const lines = (detail.items || []).map((row: any) => {
      const scoreStr =
        row.score !== null && row.score !== undefined
          ? `${row.score}/${row.maxScore || 100}`
          : "—";
      const submittedStr = row.createdAt ? new Date(row.createdAt).toISOString() : "";
      return [
        escapeCsvCell(row.studentName || "Deleted Student"),
        escapeCsvCell(row.studentEmail || ""),
        escapeCsvCell(row.status || ""),
        escapeCsvCell(scoreStr),
        escapeCsvCell(submittedStr),
      ].join(",");
    });

    return {
      filename: `${String(detail.activity.title || "activity")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "activity"}-submissions.csv`,
      csv: [header, ...lines].join("\r\n"),
    };
  },
};
