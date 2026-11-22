import { db } from "../db";
import {
  courses,
  modules,
  lessons,
  enrollments,
  users,
  lessonProgress,
  submissions,
  courseModules,
  moduleLessons,
} from "../db/schema";
import { sql, eq } from "drizzle-orm";

/**
 * ============================================================================
 * UNISOLE STUDIO CANONICAL METRICS DEFINITIONS (Shared Source of Truth)
 * ============================================================================
 *
 * 1. ENROLLED STUDENTS (canonical metric across Studio Overview, Students, Funnel, Course Cards):
 *    - Definition: Unique learners with at least one ACTIVE or COMPLETED course/pathway enrollment.
 *    - Query: COUNT(DISTINCT e.user_id) FROM enrollments e WHERE e.status IN ('ACTIVE', 'COMPLETED')
 *    - Scoped: When courseId is provided, matches (e.item_id = $c OR e.pathway_id = $c OR slug matches).
 *
 * 2. TOTAL REGISTERED USERS (distinct from enrolled mentees):
 *    - Definition: Total user accounts with role = 'STUDENT' in the users table.
 *    - Query: COUNT(*) FROM users WHERE role = 'STUDENT'
 *
 * 3. STARTED / ACTIVE IN MODULES:
 *    - Definition: Enrolled learners who have completed at least one lesson activity.
 *    - Query: COUNT(DISTINCT lp.user_id) FROM lesson_progress lp JOIN enrollments e ...
 *
 * 4. ASSESSMENTS CLEARED:
 *    - Definition: Enrolled learners who have completed at least one graded assessment / quiz / project.
 *    - Query: COUNT(DISTINCT s.user_id) FROM submissions s JOIN enrollments e ... WHERE s.score >= 50 OR s.status = 'GRADED'
 *
 * 5. CERTIFIED / GRADUATED:
 *    - Definition: Enrolled learners who achieved passing final evaluation, capstone project, or completion.
 *    - Query: COUNT(DISTINCT s.user_id) WHERE s.score >= 70 OR s.type = 'project' OR e.status = 'COMPLETED'
 *
 * 6. NEEDS ATTENTION:
 *    - Inactive 7+ Days: Enrolled learners with zero activity in lesson_progress, submissions, or enrollments in >= 7 days.
 *    - Overdue Submissions: Submissions currently in status 'SUBMITTED' or 'UNDER_REVIEW'.
 *    - Unassigned Students: Enrolled learners who do not have an active assignment in mentor_mentees.
 *    - Review Queue: Total pending submissions awaiting mentor review.
 * ============================================================================
 */

export interface GetLmsStatsOptions {
  period?: "Weekly" | "Monthly" | "Yearly";
  courseId?: string;
  mentorUserId?: string;
}

export const dashboardService = {
  async getLmsStats(options?: GetLmsStatsOptions) {
    const period = options?.period || "Monthly";
    const courseId = options?.courseId && options.courseId !== "ALL" ? options.courseId : undefined;
    const mentorUserId = options?.mentorUserId;

    // Course scoping clause for enrollments
    const courseEnrollmentSql = courseId
      ? sql`AND (e.item_id = ${courseId} OR e.pathway_id = ${courseId} OR e.item_id IN (SELECT slug FROM courses WHERE id = ${courseId}) OR e.pathway_id IN (SELECT slug FROM courses WHERE id = ${courseId}))`
      : sql``;

    // Mentor scoping clause (for mentors who only see their assigned mentees)
    const mentorScopingSql = mentorUserId
      ? sql`AND e.user_id IN (
          SELECT mm.mentee_id FROM mentor_mentees mm 
          JOIN mentors m ON m.id = mm.mentor_id 
          WHERE m.user_id = ${mentorUserId} AND mm.status = 'ACTIVE'
        )`
      : sql``;

    // 1. High-level Summary Counts
    const [coursesCountRes] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        published: sql<number>`COUNT(*) FILTER (WHERE ${courses.status}::text = 'PUBLISHED')::int`,
      })
      .from(courses);

    const [modulesCountRes] = await db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(modules);

    const [lessonsCountRes] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        published: sql<number>`COUNT(*) FILTER (WHERE ${lessons.status}::text = 'PUBLISHED')::int`,
      })
      .from(lessons);

    // Total registered accounts with role 'STUDENT'
    const [registeredCountRes] = await db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(users)
      .where(sql`${users.role}::text = 'STUDENT'`);

    // 2. Canonical Enrolled Learners Query (Single Source of Truth)
    const enrolledStudentsRes = await db.execute<any>(sql`
      SELECT 
        COUNT(DISTINCT e.user_id)::int as "enrolledCount",
        COUNT(e.id) FILTER (WHERE e.status::text = 'ACTIVE')::int as "activeEnrollmentsCount"
      FROM enrollments e
      WHERE (e.status::text = 'ACTIVE' OR e.status::text = 'COMPLETED')
      ${courseEnrollmentSql}
      ${mentorScopingSql};
    `);
    const enrolledRow = (enrolledStudentsRes.rows || enrolledStudentsRes)[0] || {};
    const enrolledStudentsCount = Number(enrolledRow.enrolledCount) || 0;
    const activeEnrollmentsCount = Number(enrolledRow.activeEnrollmentsCount) || 0;

    // Submissions in queue (using pathway_id column)
    const submissionsScopeSql = courseId
      ? sql`WHERE (s.pathway_id = ${courseId} OR s.pathway_id IN (SELECT slug FROM courses WHERE id = ${courseId}))`
      : sql``;

    const submissionsCountRes = await db.execute<any>(sql`
      SELECT
        COUNT(*)::int as "total",
        COUNT(*) FILTER (WHERE s.status::text IN ('SUBMITTED', 'UNDER_REVIEW'))::int as "pending",
        COUNT(*) FILTER (WHERE s.status::text = 'GRADED')::int as "graded",
        COALESCE(ROUND(AVG(s.score) FILTER (WHERE s.status::text = 'GRADED')), 0)::int as "avgScore"
      FROM submissions s
      ${submissionsScopeSql};
    `);
    const subRow = (submissionsCountRes.rows || submissionsCountRes)[0] || {};
    const pendingSubmissions = Number(subRow.pending) || 0;
    const gradedSubmissions = Number(subRow.graded) || 0;

    // 3. Student Progress & Completion Funnel (Canonical Unique Learners)
    const funnelRes = await db.execute<any>(sql`
      SELECT
        COUNT(DISTINCT e.user_id)::int as "enrolledCount",
        COUNT(DISTINCT lp.user_id)::int as "activeLearnersCount",
        COUNT(DISTINCT s.user_id)::int as "assessedCount",
        COUNT(DISTINCT s.user_id) FILTER (WHERE s.score >= 70 OR s.type = 'project')::int as "certifiedCount"
      FROM enrollments e
      LEFT JOIN lesson_progress lp ON e.user_id = lp.user_id
      LEFT JOIN submissions s ON e.user_id = s.user_id
      WHERE (e.status::text = 'ACTIVE' OR e.status::text = 'COMPLETED')
      ${courseEnrollmentSql}
      ${mentorScopingSql};
    `);
    const funnelRow = (funnelRes.rows || funnelRes)[0] || {};
    const enrolled = Number(funnelRow.enrolledCount) || enrolledStudentsCount;
    const activeLearners = Number(funnelRow.activeLearnersCount) || 0;
    const assessed = Number(funnelRow.assessedCount) || 0;
    const certified = Number(funnelRow.certifiedCount) || 0;

    const funnel = {
      enrolled,
      activeLearners,
      assessed,
      certified,
      enrolledPct: enrolled > 0 ? 100 : 0,
      activePct: enrolled > 0 ? Math.min(100, Math.round((activeLearners / enrolled) * 100)) : 0,
      assessedPct: enrolled > 0 ? Math.min(100, Math.round((assessed / enrolled) * 100)) : 0,
      certifiedPct: enrolled > 0 ? Math.min(100, Math.round((certified / enrolled) * 100)) : 0,
      // Drop-off counts and rates between stages (A5)
      dropOff: {
        enrolledToActive: Math.max(0, enrolled - activeLearners),
        enrolledToActivePct: enrolled > 0 ? Math.round(((enrolled - activeLearners) / enrolled) * 100) : 0,
        activeToAssessed: Math.max(0, activeLearners - assessed),
        activeToAssessedPct: activeLearners > 0 ? Math.round(((activeLearners - assessed) / activeLearners) * 100) : 0,
        assessedToCertified: Math.max(0, assessed - certified),
        assessedToCertifiedPct: assessed > 0 ? Math.round(((assessed - certified) / assessed) * 100) : 0,
      },
    };

    // 4. "Needs Attention" Metrics (A2)
    const needsAttentionRes = await db.execute<any>(sql`
      SELECT
        -- Inactive 7+ Days: enrolled students with no activity in 7 days
        COUNT(DISTINCT e.user_id) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 FROM lesson_progress lp WHERE lp.user_id = e.user_id AND lp.completed_at >= NOW() - INTERVAL '7 days'
          )
          AND NOT EXISTS (
            SELECT 1 FROM submissions sub WHERE sub.user_id = e.user_id AND sub.created_at >= NOW() - INTERVAL '7 days'
          )
        )::int as "inactive7Days",
        -- Unassigned Students: enrolled learners without active mentor
        COUNT(DISTINCT e.user_id) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 FROM mentor_mentees mm WHERE mm.mentee_id = e.user_id AND mm.status = 'ACTIVE'
          )
        )::int as "unassignedStudents"
      FROM enrollments e
      WHERE (e.status::text = 'ACTIVE' OR e.status::text = 'COMPLETED')
      ${courseEnrollmentSql}
      ${mentorScopingSql};
    `);
    const needsRow = (needsAttentionRes.rows || needsAttentionRes)[0] || {};
    const inactive7Days = Number(needsRow.inactive7Days) || 0;
    const unassignedStudents = Number(needsRow.unassignedStudents) || 0;

    const needsAttention = {
      inactive7Days,
      overdueSubmissions: pendingSubmissions,
      unassignedStudents,
      reviewQueueSize: pendingSubmissions,
    };

    // 5. Learning Velocity (Whole integer counts, date tooltip keys) (A4)
    // Optimized with CTE aggregations to eliminate Cartesian product join
    let velocityRes: any;
    if (period === "Weekly") {
      velocityRes = await db.execute<any>(sql`
        WITH daily_prog AS (
          SELECT DATE(completed_at) as day, COUNT(*)::int as cnt
          FROM lesson_progress
          WHERE completed_at >= CURRENT_DATE - 6 * INTERVAL '1 day'
          GROUP BY DATE(completed_at)
        ),
        daily_sub AS (
          SELECT DATE(created_at) as day, COUNT(*)::int as cnt
          FROM submissions
          WHERE created_at >= CURRENT_DATE - 6 * INTERVAL '1 day'
          GROUP BY DATE(created_at)
        )
        SELECT 
          TO_CHAR(d.day, 'Mon DD') as "dayLabel",
          TO_CHAR(d.day, 'YYYY-MM-DD') as "dateKey",
          (COALESCE(dp.cnt, 0) + COALESCE(ds.cnt, 0))::int as "activityCount"
        FROM generate_series(
          CURRENT_DATE - 6 * INTERVAL '1 day',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d(day)
        LEFT JOIN daily_prog dp ON dp.day = d.day
        LEFT JOIN daily_sub ds ON ds.day = d.day
        ORDER BY d.day ASC;
      `);
    } else if (period === "Yearly") {
      velocityRes = await db.execute<any>(sql`
        WITH monthly_prog AS (
          SELECT DATE_TRUNC('month', completed_at) as month, COUNT(*)::int as cnt
          FROM lesson_progress
          WHERE completed_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
          GROUP BY DATE_TRUNC('month', completed_at)
        ),
        monthly_sub AS (
          SELECT DATE_TRUNC('month', created_at) as month, COUNT(*)::int as cnt
          FROM submissions
          WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
          GROUP BY DATE_TRUNC('month', created_at)
        )
        SELECT 
          TO_CHAR(m.month, 'Mon YY') as "dayLabel",
          TO_CHAR(m.month, 'YYYY-MM') as "dateKey",
          (COALESCE(mp.cnt, 0) + COALESCE(ms.cnt, 0))::int as "activityCount"
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) m(month)
        LEFT JOIN monthly_prog mp ON mp.month = m.month
        LEFT JOIN monthly_sub ms ON ms.month = m.month
        ORDER BY m.month ASC;
      `);
    } else {
      // Monthly: last 30 days
      velocityRes = await db.execute<any>(sql`
        WITH daily_prog AS (
          SELECT DATE(completed_at) as day, COUNT(*)::int as cnt
          FROM lesson_progress
          WHERE completed_at >= CURRENT_DATE - 29 * INTERVAL '1 day'
          GROUP BY DATE(completed_at)
        ),
        daily_sub AS (
          SELECT DATE(created_at) as day, COUNT(*)::int as cnt
          FROM submissions
          WHERE created_at >= CURRENT_DATE - 29 * INTERVAL '1 day'
          GROUP BY DATE(created_at)
        )
        SELECT 
          TO_CHAR(d.day, 'Mon DD') as "dayLabel",
          TO_CHAR(d.day, 'YYYY-MM-DD') as "dateKey",
          (COALESCE(dp.cnt, 0) + COALESCE(ds.cnt, 0))::int as "activityCount"
        FROM generate_series(
          CURRENT_DATE - 29 * INTERVAL '1 day',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d(day)
        LEFT JOIN daily_prog dp ON dp.day = d.day
        LEFT JOIN daily_sub ds ON ds.day = d.day
        ORDER BY d.day ASC;
      `);
    }

    const velocityData = (velocityRes.rows || velocityRes).map((r: any) => ({
      dayLabel: r.dayLabel,
      dateKey: r.dateKey,
      count: Math.round(Number(r.activityCount) || 0),
    }));
    const totalPeriodActivity = velocityData.reduce((acc: number, curr: any) => acc + curr.count, 0);

    // 6. Academic Benchmarks (A6)
    const benchmarkRes = await db.execute<any>(sql`
      SELECT
        COALESCE(ROUND(AVG(score) FILTER (WHERE status::text = 'GRADED')), 0)::int as "avgScore",
        COUNT(*) FILTER (WHERE type = 'video_test' AND status::text = 'GRADED')::int as "vivaTotal",
        COUNT(*) FILTER (WHERE type = 'video_test' AND status::text = 'GRADED' AND score >= 50)::int as "vivaPassed",
        COUNT(*) FILTER (WHERE type = 'coding_test' AND status::text = 'GRADED')::int as "codingTotal",
        COUNT(*) FILTER (WHERE type = 'coding_test' AND status::text = 'GRADED' AND score >= 50)::int as "codingPassed",
        COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (evaluated_at - created_at)) / 3600) FILTER (WHERE evaluated_at IS NOT NULL)), 0)::int as "avgTurnaroundHours"
      FROM submissions s
      ${submissionsScopeSql};
    `);
    const bRow = (benchmarkRes.rows || benchmarkRes)[0] || {};
    const vivaTotal = Number(bRow.vivaTotal) || 0;
    const vivaPassed = Number(bRow.vivaPassed) || 0;
    const codingTotal = Number(bRow.codingTotal) || 0;
    const codingPassed = Number(bRow.codingPassed) || 0;

    const academicBenchmarks = {
      avgScore: Number(bRow.avgScore) || 0,
      vivaTotal,
      vivaPassRate: vivaTotal > 0 ? Math.round((vivaPassed / vivaTotal) * 100) : 0,
      codingTotal,
      codingPassRate: codingTotal > 0 ? Math.round((codingPassed / codingTotal) * 100) : 0,
      avgTurnaroundHours: Number(bRow.avgTurnaroundHours) || 0,
      totalEvaluations: gradedSubmissions,
    };

    // 7. Top Course Cards on Overview (Real modules, lessons, enrolled counts) (A8)
    const topCoursesRes = await db.execute<any>(sql`
      SELECT 
        c.id,
        c.title,
        c.short_description as "shortDescription",
        c.slug,
        c.status,
        c.created_at as "createdAt",
        COUNT(DISTINCT cm.module_id)::int as "moduleCount",
        COUNT(DISTINCT ml.lesson_id)::int as "lessonCount",
        COUNT(DISTINCT e.user_id) FILTER (WHERE e.status::text IN ('ACTIVE', 'COMPLETED'))::int as "enrollmentsCount"
      FROM courses c
      LEFT JOIN course_modules cm ON c.id = cm.course_id
      LEFT JOIN module_lessons ml ON cm.module_id = ml.module_id
      LEFT JOIN enrollments e ON (
        e.item_id = c.id OR e.pathway_id = c.id OR 
        e.item_id = c.slug OR e.pathway_id = c.slug
      )
      GROUP BY c.id
      ORDER BY 
        CASE WHEN c.status::text = 'PUBLISHED' THEN 1 ELSE 2 END,
        c.created_at DESC
      LIMIT 6;
    `);
    const topCourses = (topCoursesRes.rows || topCoursesRes).map((c: any, index: number) => ({
      id: c.id,
      title: c.title,
      desc: c.shortDescription || "Modular curriculum track with lectures, quizzes, and live workshops.",
      tag: c.status === "PUBLISHED" ? (index === 0 ? "Flagship Track" : "Published Track") : "Draft Studio",
      modulesCount: Number(c.moduleCount) || 0,
      lessonsCount: Number(c.lessonCount) || 0,
      enrollmentsCount: Number(c.enrollmentsCount) || 0,
      slug: c.slug,
    }));

    return {
      summary: {
        totalCourses: coursesCountRes?.total || 0,
        publishedCourses: coursesCountRes?.published || 0,
        totalModules: modulesCountRes?.total || 0,
        totalLessons: lessonsCountRes?.total || 0,
        publishedLessons: lessonsCountRes?.published || 0,
        // Canonical Enrolled Students count (A1)
        enrolledStudents: enrolledStudentsCount,
        // Total registered user accounts (clearly distinguished)
        totalRegisteredUsers: registeredCountRes?.total || 0,
        activeEnrollments: activeEnrollmentsCount,
        pendingSubmissions,
        gradedSubmissions,
      },
      needsAttention,
      funnel,
      velocity: {
        period,
        totalActivity: totalPeriodActivity,
        data: velocityData,
      },
      benchmarks: academicBenchmarks,
      highlightCards: topCourses,
    };
  },
};
