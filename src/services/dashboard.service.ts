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

export const dashboardService = {
  async getLmsStats(period: "Weekly" | "Monthly" | "Yearly" = "Monthly") {
    // 1. High-level Summary Counts directly from Postgres
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

    const [studentsCountRes] = await db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(users)
      .where(sql`${users.role}::text = 'STUDENT'`);

    const [enrollmentsCountRes] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        active: sql<number>`COUNT(*) FILTER (WHERE ${enrollments.status}::text = 'ACTIVE')::int`,
      })
      .from(enrollments);

    const [submissionsCountRes] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        pending: sql<number>`COUNT(*) FILTER (WHERE ${submissions.status}::text IN ('SUBMITTED', 'UNDER_REVIEW'))::int`,
        graded: sql<number>`COUNT(*) FILTER (WHERE ${submissions.status}::text = 'GRADED')::int`,
        avgScore: sql<number>`COALESCE(ROUND(AVG(${submissions.score}) FILTER (WHERE ${submissions.status}::text = 'GRADED')), 0)::int`,
      })
      .from(submissions);

    // 2. Student Progress & Completion Funnel (Real Unique User Counts)
    const funnelRes = await db.execute<any>(sql`
      SELECT
        COUNT(DISTINCT e.user_id)::int as "enrolledCount",
        COUNT(DISTINCT p.user_id)::int as "activeLearnersCount",
        COUNT(DISTINCT s.user_id)::int as "assessedCount",
        COUNT(DISTINCT s.user_id) FILTER (WHERE s.score >= 70 OR s.type = 'project')::int as "certifiedCount"
      FROM enrollments e
      LEFT JOIN lesson_progress p ON e.user_id = p.user_id
      LEFT JOIN submissions s ON e.user_id = s.user_id
      WHERE e.status::text = 'ACTIVE' OR e.status::text = 'PENDING';
    `);
    const funnelRow = (funnelRes.rows || funnelRes)[0] || {};
    const enrolled = Number(funnelRow.enrolledCount) || 0;
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
    };

    // 3. Learning Velocity (Daily / Monthly Activity from Postgres)
    let velocityRes: any;
    if (period === "Weekly") {
      velocityRes = await db.execute<any>(sql`
        SELECT 
          TO_CHAR(d.day, 'Mon DD') as "dayLabel",
          TO_CHAR(d.day, 'YYYY-MM-DD') as "dateKey",
          COALESCE(COUNT(lp.id), 0)::int + COALESCE(COUNT(sub.id), 0)::int as "activityCount"
        FROM generate_series(
          CURRENT_DATE - 6 * INTERVAL '1 day',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d(day)
        LEFT JOIN lesson_progress lp ON DATE(lp.completed_at) = d.day
        LEFT JOIN submissions sub ON DATE(sub.created_at) = d.day
        GROUP BY d.day
        ORDER BY d.day ASC;
      `);
    } else if (period === "Yearly") {
      velocityRes = await db.execute<any>(sql`
        SELECT 
          TO_CHAR(m.month, 'Mon YY') as "dayLabel",
          TO_CHAR(m.month, 'YYYY-MM') as "dateKey",
          COALESCE(COUNT(lp.id), 0)::int + COALESCE(COUNT(sub.id), 0)::int as "activityCount"
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) m(month)
        LEFT JOIN lesson_progress lp ON DATE_TRUNC('month', lp.completed_at) = m.month
        LEFT JOIN submissions sub ON DATE_TRUNC('month', sub.created_at) = m.month
        GROUP BY m.month
        ORDER BY m.month ASC;
      `);
    } else {
      // Monthly: last 30 days
      velocityRes = await db.execute<any>(sql`
        SELECT 
          TO_CHAR(d.day, 'Mon DD') as "dayLabel",
          TO_CHAR(d.day, 'YYYY-MM-DD') as "dateKey",
          COALESCE(COUNT(lp.id), 0)::int + COALESCE(COUNT(sub.id), 0)::int as "activityCount"
        FROM generate_series(
          CURRENT_DATE - 29 * INTERVAL '1 day',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d(day)
        LEFT JOIN lesson_progress lp ON DATE(lp.completed_at) = d.day
        LEFT JOIN submissions sub ON DATE(sub.created_at) = d.day
        GROUP BY d.day
        ORDER BY d.day ASC;
      `);
    }

    const velocityData = (velocityRes.rows || velocityRes).map((r: any) => ({
      dayLabel: r.dayLabel,
      dateKey: r.dateKey,
      count: Number(r.activityCount) || 0,
    }));
    const totalPeriodActivity = velocityData.reduce((acc: number, curr: any) => acc + curr.count, 0);

    // 4. Academic Evaluation Benchmarks
    const benchmarkRes = await db.execute<any>(sql`
      SELECT
        COALESCE(ROUND(AVG(score) FILTER (WHERE status::text = 'GRADED')), 0)::int as "avgScore",
        COUNT(*) FILTER (WHERE type = 'video_test' AND status::text = 'GRADED')::int as "vivaTotal",
        COUNT(*) FILTER (WHERE type = 'video_test' AND status::text = 'GRADED' AND score >= 50)::int as "vivaPassed",
        COUNT(*) FILTER (WHERE type = 'coding_test' AND status::text = 'GRADED')::int as "codingTotal",
        COUNT(*) FILTER (WHERE type = 'coding_test' AND status::text = 'GRADED' AND score >= 50)::int as "codingPassed",
        COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (evaluated_at - created_at)) / 3600) FILTER (WHERE evaluated_at IS NOT NULL)), 0)::int as "avgTurnaroundHours"
      FROM submissions;
    `);
    const bRow = (benchmarkRes.rows || benchmarkRes)[0] || {};
    const vivaTotal = Number(bRow.vivaTotal) || 0;
    const vivaPassed = Number(bRow.vivaPassed) || 0;
    const codingTotal = Number(bRow.codingTotal) || 0;
    const codingPassed = Number(bRow.codingPassed) || 0;

    const academicBenchmarks = {
      avgScore: Number(bRow.avgScore) || 0,
      vivaPassRate: vivaTotal > 0 ? Math.round((vivaPassed / vivaTotal) * 100) : 0,
      codingPassRate: codingTotal > 0 ? Math.round((codingPassed / codingTotal) * 100) : 0,
      avgTurnaroundHours: Number(bRow.avgTurnaroundHours) || 0,
      totalEvaluations: Number(submissionsCountRes.graded) || 0,
    };

    // 5. Top 4 Live Highlight Cards from Real Courses
    const topCoursesRes = await db.execute<any>(sql`
      SELECT 
        c.id,
        c.title,
        c.short_description as "shortDescription",
        c.slug,
        c.status,
        c.created_at as "createdAt",
        COUNT(DISTINCT cm.module_id)::int as "moduleCount",
        COUNT(DISTINCT e.id)::int as "enrollmentsCount"
      FROM courses c
      LEFT JOIN course_modules cm ON c.id = cm.course_id
      LEFT JOIN enrollments e ON (e.item_id = c.id AND e.item_type::text = 'COURSE')
      GROUP BY c.id
      ORDER BY 
        CASE WHEN c.status::text = 'PUBLISHED' THEN 1 ELSE 2 END,
        c.created_at DESC
      LIMIT 4;
    `);
    const topCourses = (topCoursesRes.rows || topCoursesRes).map((c: any, index: number) => ({
      id: c.id,
      title: c.title,
      desc: c.shortDescription || "Interactive course track with modules, coding assessments, and mentor reviews.",
      tag: c.status === "PUBLISHED" ? (index === 0 ? "Flagship Track" : "Published Track") : "Draft Studio",
      modulesCount: Number(c.moduleCount) || 0,
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
        totalStudents: studentsCountRes?.total || 0,
        totalEnrollments: enrollmentsCountRes?.total || 0,
        activeEnrollments: enrollmentsCountRes?.active || 0,
        pendingSubmissions: submissionsCountRes?.pending || 0,
        gradedSubmissions: submissionsCountRes?.graded || 0,
      },
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
