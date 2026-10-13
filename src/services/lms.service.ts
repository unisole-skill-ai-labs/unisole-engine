import { eq, and, or, inArray, asc, desc, sql } from "drizzle-orm";
import { db, pool } from "../db";
import {
  users,
  enrollments,
  pathways,
  courses,
  pathwayCourses,
  modules,
  courseModules,
  lessons,
  moduleLessons,
  lessonProgress,
  submissions,
  notes,
  courseAssignments,
  calendarEvents,
  mentors,
  mentorMentees,
  programManagers,
  Pathway,
  Lesson,
} from "../db/schema";
import { ForbiddenError, NotFoundError } from "../errors";
import { getCanonicalPathway, CANONICAL_GROUPS } from "../constants/canonical-catalog";

const PATHWAY_CATALOG: Record<string, { title: string; description: string; duration: string; level: string }> = {
  "cs-agentic": {
    title: "AI Agent Engineering",
    description: "From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.",
    duration: "12 Weeks (132 Hours)",
    level: "Production AI Agent Engineering",
  },
  "course1": {
    title: "AI Agent Engineering",
    description: "From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.",
    duration: "12 Weeks (132 Hours)",
    level: "Production AI Agent Engineering",
  },
  "cs-p1": {
    title: "Machine Learning Engineering in Production",
    description: "Production ML pipelines, PyTorch deep learning, FastAPI model serving, Docker MLOps, and Generative AI/RAG.",
    duration: "6 Months",
    level: "Intermediate to Advanced",
  },
  "cs-p2": {
    title: "Full Stack Web Development (AI-Powered)",
    description: "Modern full stack engineering with React, Node.js, Express, MongoDB, and integrated AI capabilities.",
    duration: "3 Months",
    level: "Beginner to Intermediate",
  },
  "cs-p3": {
    title: "Complete Machine Learning + Full Stack",
    description: "Comprehensive dual curriculum merging Machine Learning, Deep Learning, and MLOps with full-stack React and Node.js.",
    duration: "6 Months",
    level: "Dual-Track Mastery",
  },
  "cs-common": {
    title: "AI Entrepreneurship & Innovation",
    description: "Structured incubator track teaching students how to convert AI technical capability into commercial startups.",
    duration: "Weekend Track",
    level: "All Students",
  },
  "sci-p1": {
    title: "Scientific Machine Learning & AI for Science",
    description: "Mathematical principles with modern scientific computing, differential equations, and Physics-Informed Neural Networks.",
    duration: "3 Months",
    level: "Physics, Math & Science",
  },
  "sci-p2": {
    title: "Mathematics + AI / Computational Intelligence",
    description: "Mathematics-oriented pathway focusing on optimization theory, statistical learning, and computational algorithms.",
    duration: "3 Months",
    level: "Math & Applied Sciences",
  },
  "mgmt-p1": {
    title: "Business Analytics & Data Engineering",
    description: "Advanced Excel, SQL, modern data engineering (ETL, Parquet, DuckDB), Power BI, and Generative AI.",
    duration: "3 Months",
    level: "Business & Management",
  },
  "mgmt-p2": {
    title: "AI in Finance & FinTech Systems",
    description: "Digital banking, financial modeling, credit risk scoring, fraud detection algorithms, and responsible AI.",
    duration: "3 Months",
    level: "Finance & Banking",
  },
  "mgmt-p3": {
    title: "Complete Business AI Pathway",
    description: "Dual-track program merging Business Analytics with FinTech AI, credit scoring, fraud risk intelligence, and BI dashboards.",
    duration: "6 Months",
    level: "Executive & Analytics",
  },
  "mgmt-common": {
    title: "AI Entrepreneurship & Business Innovation",
    description: "Launch AI-enabled business services, SaaS tools, SME automation platforms, and investor pitch decks.",
    duration: "Weekend Track",
    level: "All Commerce & Management",
  },
  "arts-p1": {
    title: "Applied AI for Humanities, Research & Careers",
    description: "Prompt engineering, AI research methods, automated content, executive communication, and career acceleration.",
    duration: "3 Months",
    level: "All Students (No Coding Required)",
  },
};

// In-memory fallback stores for offline/test environments
const inMemoryProgress: Record<string, { userId: string; lessonId: string; pathwayId?: string; isCompleted: boolean; completedAt: string }> = {};
const inMemorySubmissions: Array<{
  id: string;
  userId: string;
  lessonId: string;
  pathwayId?: string;
  type: string;
  title?: string;
  submissionUrl?: string;
  submissionText?: string;
  score?: number;
  maxScore?: number;
  status: string;
  evaluatedAt?: string;
  createdAt: string;
}> = [];

const inMemoryNotes: Array<{
  id: string;
  userId: string;
  lessonId: string;
  pathwayId?: string;
  lessonTitle?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}> = [];

const inMemoryCalendarEvents: Array<any> = [];

export const lmsService = {
  /**
   * Get all pathways that the student has an ACTIVE enrollment in.
   */
  async getAccessiblePathways(userId: string) {
    let activeEnrollments: any[] = [];
    try {
      activeEnrollments = await db
        .select({
          enrollmentId: enrollments.id,
          itemType: enrollments.itemType,
          itemId: enrollments.itemId,
          pathwayId: enrollments.pathwayId,
          enrolledAt: enrollments.enrolledAt,
          expiresAt: enrollments.expiresAt,
          status: enrollments.status,
          pathway: pathways,
          course: courses,
        })
        .from(enrollments)
        .leftJoin(
          pathways,
          or(
            sql`${enrollments.pathwayId}::text = ${pathways.id}::text`,
            sql`${enrollments.itemId}::text = ${pathways.id}::text`,
            sql`${enrollments.pathwayId}::text = ${pathways.slug}::text`,
            sql`${enrollments.itemId}::text = ${pathways.slug}::text`
          )
        )
        .leftJoin(
          courses,
          or(
            sql`${enrollments.itemId}::text = ${courses.id}::text`,
            sql`${enrollments.pathwayId}::text = ${courses.id}::text`,
            sql`${enrollments.itemId}::text = ${courses.slug}::text`
          )
        )
        .where(
          and(
            sql`${enrollments.userId}::text = ${userId}::text`,
            eq(enrollments.status, "ACTIVE")
          )
        );
    } catch (dbErr) {
      console.warn("[LMSService] DB offline or query issue in getAccessiblePathways, using fallback enrollments:", dbErr);
    }

    // Filter active enrollments to ONLY AI Agent Engineering
    const agenticEnrollments = activeEnrollments.filter((enr) => {
      const slug = enr.course?.slug || enr.pathway?.slug || enr.itemId || enr.pathwayId || "";
      const title = enr.course?.title || enr.pathway?.title || "";
      return slug === "cs-agentic" || slug === "course1" || title.toLowerCase().includes("ai agent");
    });

    if (agenticEnrollments.length === 0) {
      // Auto-enroll user in the official AI Agent Engineering course
      try {
        await pool.query(
          `INSERT INTO enrollments (id, user_id, pathway_id, item_type, item_id, status, source, enrolled_at)
           VALUES ($1, $2, 'cs-agentic', 'PATHWAY', 'cs-agentic', 'ACTIVE', 'CAMPUS_SPONSORED', NOW())
           ON CONFLICT DO NOTHING`,
          [`enr_${userId}_cs-agentic`, userId]
        );
      } catch {}

      let flagshipRows: any[] = [];
      try {
        flagshipRows = await db
          .select()
          .from(pathways)
          .where(or(eq(pathways.id, "cs-agentic"), eq(pathways.slug, "cs-agentic")));
      } catch {}

      if (flagshipRows.length > 0) {
        return flagshipRows.map((pwy) => ({
          enrollmentId: `enr_${pwy.id}_demo`,
          enrolledAt: new Date().toISOString(),
          expiresAt: null,
          status: "ACTIVE" as const,
          pathway: pwy,
        }));
      }

      // Live canonical AI Agent Engineering
      const cat = PATHWAY_CATALOG["cs-agentic"];
      return [
        {
          enrollmentId: `enr_cs-agentic_active`,
          enrolledAt: new Date().toISOString(),
          expiresAt: null,
          status: "ACTIVE" as const,
          pathway: {
            id: "cs-agentic",
            title: cat.title,
            description: cat.description,
            slug: "cs-agentic",
            duration: cat.duration,
            level: cat.level,
            isActive: true,
            isPublic: true,
            pricePaise: 299900,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ];
    }

    return agenticEnrollments.map((enr) => {
      if (enr.course) {
        return {
          enrollmentId: enr.enrollmentId,
          enrolledAt: enr.enrolledAt,
          expiresAt: enr.expiresAt,
          status: enr.status,
          pathway: {
            id: enr.course.id,
            title: enr.course.title,
            description: enr.course.description || enr.course.shortDescription || "12-Week AI Agent Engineering Certificate Program (Weeks 1 - 12)",
            slug: enr.course.slug,
            duration: "12 Weeks (132 Hours)",
            level: "Production AI Agent Engineering",
            isActive: enr.course.isActive,
            isPublic: true,
            pricePaise: enr.course.pricePaise || 299900,
            createdAt: enr.course.createdAt,
            updatedAt: enr.course.updatedAt,
          },
        };
      }

      if (enr.pathway) {
        return {
          enrollmentId: enr.enrollmentId,
          enrolledAt: enr.enrolledAt,
          expiresAt: enr.expiresAt,
          status: enr.status,
          pathway: enr.pathway,
        };
      }

      const cat = PATHWAY_CATALOG["cs-agentic"];
      return {
        enrollmentId: enr.enrollmentId,
        enrolledAt: enr.enrolledAt,
        expiresAt: enr.expiresAt,
        status: enr.status,
        pathway: {
          id: "cs-agentic",
          title: cat.title,
          description: cat.description,
          slug: "cs-agentic",
          duration: cat.duration,
          level: cat.level,
          isActive: true,
          isPublic: true,
          pricePaise: 299900,
          createdAt: enr.enrolledAt,
          updatedAt: enr.enrolledAt,
        },
      };
    });
  },

  /**
   * Get full hierarchy tree for a pathway (Pathway -> Courses -> Modules -> Lessons)
   * Enforces that student is actively enrolled (or isAdmin is true).
   */
  async getPathwayContent(userId: string, pathwayId: string, isAdmin = false) {
    let pathwayRows: any[] = [];
    try {
      pathwayRows = await db
        .select()
        .from(pathways)
        .where(or(eq(pathways.id, pathwayId), eq(pathways.slug, pathwayId)))
        .limit(1);
    } catch (err) {
      console.warn("[LMSService] DB lookup in getPathwayContent notice:", err);
    }

    let pathway: any = pathwayRows[0];
    if (!pathway) {
      try {
        const courseRows = await db
          .select()
          .from(courses)
          .where(or(sql`${courses.id}::text = ${pathwayId}::text`, eq(courses.slug, pathwayId)))
          .limit(1);
        if (courseRows[0]) {
          const c = courseRows[0];
          pathway = {
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description || c.shortDescription || "Curriculum, Labs & Projects",
            duration: "Self-Paced Track",
            level: "Intermediate",
            isActive: c.isActive,
            isPublic: true,
            pricePaise: c.pricePaise || 0,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          };
        }
      } catch (err) {
        console.warn("[LMSService] Course lookup fallback in getPathwayContent:", err);
      }
    }

    if (!pathway) {
      const canon = getCanonicalPathway(pathwayId);
      if (canon) {
        pathway = {
          id: pathwayId,
          title: canon.title,
          slug: pathwayId,
          description: canon.description,
          duration: canon.duration,
          level: canon.level,
          isActive: true,
          isPublic: true,
          pricePaise: canon.price * 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        throw new NotFoundError("Pathway not found");
      }
    }

    if (!isAdmin) {
      let activeEnrollment: any[] = [];
      try {
        activeEnrollment = await db
          .select()
          .from(enrollments)
          .where(
            and(
              sql`${enrollments.userId}::text = ${userId}::text`,
              eq(enrollments.status, "ACTIVE"),
              or(
                sql`${enrollments.pathwayId}::text = ${pathwayId}::text`,
                sql`${enrollments.itemId}::text = ${pathwayId}::text`,
                sql`${enrollments.pathwayId}::text = ${pathway.id}::text`,
                sql`${enrollments.itemId}::text = ${pathway.id}::text`,
                sql`${enrollments.pathwayId}::text = ${pathway.slug}::text`,
                sql`${enrollments.itemId}::text = ${pathway.slug}::text`
              )
            )
          )
          .limit(1);
      } catch {
        // Fallback for offline mode: permit flagship courses
      }

      if (activeEnrollment.length === 0) {
        // Auto-enroll user into AI Agent Engineering pathway so every LMS user has immediate access
        try {
          await db.insert(enrollments).values({
            userId,
            itemType: "PATHWAY",
            itemId: pathway.id,
            pathwayId: pathway.id,
            status: "ACTIVE",
            enrolledAt: new Date().toISOString(),
          }).onConflictDoNothing();
        } catch (autoErr) {
          console.warn("[LMS] Auto-enrollment info:", autoErr);
        }
      }
    }

    // Fetch linked courses
    let linkedCourses: any[] = [];
    try {
      linkedCourses = await db
        .select({
          position: pathwayCourses.position,
          course: courses,
        })
        .from(pathwayCourses)
        .innerJoin(courses, sql`${pathwayCourses.courseId}::text = ${courses.id}::text`)
        .where(or(
          sql`${pathwayCourses.pathwayId}::text = ${pathway.id}::text`,
          sql`${pathwayCourses.pathwayId}::text = ${pathway.slug}::text`
        ))
        .orderBy(asc(pathwayCourses.position));
    } catch {
      // In offline DB, linkedCourses will be empty, triggering synthetic canon modules below
    }

    // If this is a standalone course, directly attach it as the single course
    // If this is a standalone course, directly attach it as the single course
    if (linkedCourses.length === 0) {
      try {
        const directCourse = await db
          .select()
          .from(courses)
          .where(
            or(
              sql`${courses.id}::text = ${pathway.id}::text`,
              eq(courses.slug, pathway.slug),
              eq(courses.title, pathway.title),
              and(
                sql`${pathway.id}::text IN ('course1', 'cs-agentic')`,
                or(eq(courses.slug, 'cs-agentic'), eq(courses.title, 'AI Agent Engineering'))
              )
            )
          )
          .limit(1);
        if (directCourse[0]) {
          linkedCourses = [{ position: 1, course: directCourse[0] }];
        }
      } catch {}
    }

    const courseList: any[] = [];

    for (const { position: coursePos, course } of linkedCourses) {
      // Fetch linked modules for this course
      const linkedModules = await db
        .select({
          position: courseModules.position,
          module: modules,
        })
        .from(courseModules)
        .innerJoin(modules, sql`${courseModules.moduleId}::text = ${modules.id}::text`)
        .where(sql`${courseModules.courseId}::text = ${course.id}::text`)
        .orderBy(asc(courseModules.position));

      // Fallback: If courseModules link wasn't populated, check modules.course_id directly
      if (linkedModules.length === 0) {
        try {
          const directMods = await pool.query(
            `SELECT * FROM modules WHERE course_id = $1::uuid OR course_id::text = $1::text ORDER BY order_index ASC`,
            [course.id]
          );
          for (const m of directMods.rows) {
            linkedModules.push({ position: m.order_index || 1, module: m as any });
          }
        } catch {}
      }

      const moduleList: any[] = [];
      const nowMs = Date.now();

      for (const { position: modPos, module: mod } of linkedModules) {
        // Fetch linked lessons for this module
        const linkedLessons = await db
          .select({
            position: moduleLessons.position,
            lesson: lessons,
          })
          .from(moduleLessons)
          .innerJoin(lessons, sql`${moduleLessons.lessonId}::text = ${lessons.id}::text`)
          .where(sql`${moduleLessons.moduleId}::text = ${mod.id}::text`)
          .orderBy(asc(moduleLessons.position));

        const modUnlockMs = mod.unlockAt ? new Date(mod.unlockAt).getTime() : null;
        const modLockMs = mod.lockAt ? new Date(mod.lockAt).getTime() : null;

        const isModUnlockPending = modUnlockMs !== null && modUnlockMs > nowMs;
        const isModLockExpired = modLockMs !== null && modLockMs <= nowMs;
        const isModScheduleLocked = isModUnlockPending || isModLockExpired;
        const isModLocked = !isAdmin && isModScheduleLocked;

        moduleList.push({
          ...mod,
          position: modPos,
          unlockAt: mod.unlockAt || null,
          lockAt: mod.lockAt || null,
          isLocked: isModLocked,
          isScheduleLocked: isModScheduleLocked,
          lessons: linkedLessons.map(({ position: lesPos, lesson }) => {
            const lesUnlockMs = lesson.unlockAt ? new Date(lesson.unlockAt).getTime() : null;
            const lesLockMs = lesson.lockAt ? new Date(lesson.lockAt).getTime() : null;

            const isLesUnlockPending = lesUnlockMs !== null && lesUnlockMs > nowMs;
            const isLesLockExpired = lesLockMs !== null && lesLockMs <= nowMs;
            const isLesScheduleLocked = isLesUnlockPending || isLesLockExpired || isModScheduleLocked;
            const isLesLocked = !isAdmin && (isModLocked || isLesScheduleLocked);

            let parsedContent: any = null;
            try {
              if (lesson.content && lesson.content.startsWith("{")) {
                parsedContent = JSON.parse(lesson.content);
              }
            } catch {}

            const isCoding =
              parsedContent?.testType === "CODING_TEST" ||
              parsedContent?.type === "CODING_TEST" ||
              lesson.slug?.includes("coding");
            const isVideoTest =
              parsedContent?.testType === "VIDEO_TEST" ||
              parsedContent?.type === "VIDEO_TEST" ||
              lesson.slug?.includes("viva");
            const isSubjTest =
              parsedContent?.testType === "SUBJECTIVE_TEST" ||
              parsedContent?.type === "SUBJECTIVE_TEST";
            const isQuizItem =
              parsedContent?.type === "QUIZ" ||
              parsedContent?.type === "quiz" ||
              parsedContent?.practiceType === "MCQ" ||
              lesson.id.includes("_quiz") ||
              lesson.slug?.includes("quiz") ||
              lesson.title?.toLowerCase().includes("quiz") ||
              lesson.title?.toLowerCase().includes("knowledge check");
            const isAssignmentItem =
              parsedContent?.type === "ASSIGNMENT" ||
              parsedContent?.type === "assignment" ||
              parsedContent?.practiceType === "PROJECT" ||
              parsedContent?.testType === "PROJECT" ||
              lesson.id.includes("_lab") ||
              lesson.id.includes("_cap") ||
              lesson.slug?.includes("task") ||
              lesson.slug?.includes("assignment") ||
              lesson.slug?.includes("capstone") ||
              lesson.title?.toLowerCase().includes("capstone") ||
              lesson.title?.toLowerCase().includes("task") ||
              lesson.title?.toLowerCase().includes("assignment") ||
              lesson.title?.toLowerCase().includes("lab");

            const isLiveItem =
              parsedContent?.type === "LIVE" ||
              parsedContent?.type === "live" ||
              parsedContent?.category === "LIVE" ||
              parsedContent?.curriculumMode === "LIVE" ||
              lesson.slug?.includes("live") ||
              lesson.id.includes("_live") ||
              lesson.title?.toLowerCase().includes("live");

            const isFolder =
              parsedContent?.type === "FOLDER" ||
              parsedContent?.curriculumMode === "FOLDER" ||
              lesson.slug?.includes("folder");

            let computedType = "video";
            let computedCategory = "LECTURE";

            if (isFolder) {
              computedType = "folder";
              computedCategory = "FOLDER";
            } else if (isLiveItem) {
              computedType = "live";
              computedCategory = "LIVE";
            } else if (isCoding) {
              computedType = "coding_test";
              computedCategory = "TEST";
            } else if (isVideoTest) {
              computedType = "video_test";
              computedCategory = "TEST";
            } else if (isSubjTest) {
              computedType = "subjective_test";
              computedCategory = "TEST";
            } else if (isQuizItem) {
              computedType = "quiz";
              computedCategory = parsedContent?.category || "PRACTICE";
            } else if (isAssignmentItem) {
              computedType = "assignment";
              computedCategory = parsedContent?.category || (parsedContent?.testType ? "TEST" : "PRACTICE");
            } else if (!lesson.videoUrl && lesson.content) {
              computedType = "reading";
              computedCategory = "LECTURE";
            }

            return {
              id: lesson.id,
              title: lesson.title,
              slug: lesson.slug,
              description: isLesLocked
                ? "This activity is scheduled and locked until unlock time."
                : lesson.description || parsedContent?.contentMarkdown,
              durationMinutes: lesson.durationMinutes,
              videoUrl: isLesLocked
                ? null
                : (lesson.videoUrl ||
                    parsedContent?.videoUrl ||
                    (computedType === "video"
                      ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1"
                      : null)),
              content: isLesLocked ? null : lesson.content,
              contentType: computedType.toUpperCase(),
              type: computedType,
              category: computedCategory,
              isTest: computedCategory === "TEST",
              folderId: parsedContent?.folderId || null,
              attachments: isLesLocked ? [] : (parsedContent?.attachments || []),
              config: isLesLocked
                ? null
                : (parsedContent?.codingTest ||
                    parsedContent?.subjectiveTest ||
                    parsedContent?.videoTest ||
                    parsedContent?.assignment ||
                    parsedContent?.quiz),
              questions: isLesLocked ? [] : (parsedContent?.quiz?.questions || parsedContent?.questions),
              instructions: isLesLocked
                ? "Content is scheduled and locked."
                : (parsedContent?.assignment?.instructions ||
                    parsedContent?.instructions ||
                    lesson.description),
              maxScore:
                parsedContent?.maxScore ||
                parsedContent?.assignment?.maxPoints ||
                parsedContent?.codingTest?.maxScore ||
                100,
              liveDate: parsedContent?.liveDate,
              liveTime: parsedContent?.liveTime,
              liveMeetingUrl: parsedContent?.liveMeetingUrl,
              mentorName: parsedContent?.mentorName,
              status: lesson.status,
              position: lesPos,
              unlockAt: lesson.unlockAt || mod.unlockAt || null,
              lockAt: lesson.lockAt || mod.lockAt || null,
              isLocked: isLesLocked,
              isScheduleLocked: isLesScheduleLocked,
            };
          }),
        });
      }

      courseList.push({
        ...course,
        position: coursePos,
        modules: moduleList,
      });
    }

    return {
      pathway,
      courses: courseList,
    };
  },

  /**
   * Get specific lesson content with access verification chain:
   * Lesson -> Module -> Course -> Pathway -> Active Enrollment
   */
  async getLessonContent(userId: string, lessonId: string, isAdmin = false): Promise<any> {
    const lessonRows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (lessonRows.length > 0) {
      const lesson = lessonRows[0];
      if (isAdmin) {
        return lesson;
      }

      // Time lock enforcement for students
      const nowMs = Date.now();
      if (lesson.unlockAt && new Date(lesson.unlockAt).getTime() > nowMs) {
        throw new ForbiddenError(
          `This activity is scheduled and locked until ${new Date(lesson.unlockAt).toLocaleString()}`
        );
      }
      if (lesson.lockAt && new Date(lesson.lockAt).getTime() <= nowMs) {
        throw new ForbiddenError(
          `This activity closed on ${new Date(lesson.lockAt).toLocaleString()}`
        );
      }

      // Check parent module time lock
      const parentModules = await db
        .select({ unlockAt: modules.unlockAt, lockAt: modules.lockAt })
        .from(moduleLessons)
        .innerJoin(modules, sql`${moduleLessons.moduleId}::text = ${modules.id}::text`)
        .where(sql`${moduleLessons.lessonId}::text = ${lessonId}::text`);

      for (const pm of parentModules) {
        if (pm.unlockAt && new Date(pm.unlockAt).getTime() > nowMs) {
          throw new ForbiddenError(
            `This module is scheduled and locked until ${new Date(pm.unlockAt).toLocaleString()}`
          );
        }
        if (pm.lockAt && new Date(pm.lockAt).getTime() <= nowMs) {
          throw new ForbiddenError(
            `This module closed on ${new Date(pm.lockAt).toLocaleString()}`
          );
        }
      }

      // Check if user has active enrollment in this lesson's pathway
      const accessiblePathways = await db
        .select({ pathwayId: pathwayCourses.pathwayId })
        .from(moduleLessons)
        .innerJoin(courseModules, eq(moduleLessons.moduleId, courseModules.moduleId))
        .innerJoin(pathwayCourses, eq(courseModules.courseId, pathwayCourses.courseId))
        .where(eq(moduleLessons.lessonId, lessonId));

      const pathwayIds = Array.from(new Set(accessiblePathways.map((p) => p.pathwayId)));

      if (pathwayIds.length > 0) {
        const userEnrollments = await db
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.userId, userId),
              eq(enrollments.status, "ACTIVE"),
              or(
                inArray(enrollments.pathwayId, pathwayIds),
                inArray(enrollments.itemId, pathwayIds)
              )
            )
          )
          .limit(1);

        if (userEnrollments.length === 0) {
          throw new ForbiddenError("You do not have access to this lesson. Please enroll in the relevant pathway.");
        }
      }

      return lesson;
    }

    throw new NotFoundError("Lesson not found");
  },

  /**
   * Mark lesson progress (completed / in-progress)
   */
  async markLessonProgress(userId: string, data: { lessonId: string; pathwayId?: string; isCompleted?: boolean }) {
    const isCompleted = data.isCompleted !== false;
    const now = new Date().toISOString();
    const id = `prog_${userId}_${data.lessonId}`;

    try {
      await db
        .insert(lessonProgress)
        .values({
          id,
          userId,
          lessonId: data.lessonId,
          pathwayId: data.pathwayId || null,
          isCompleted,
          completedAt: isCompleted ? now : null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: {
            isCompleted,
            completedAt: isCompleted ? now : null,
            updatedAt: now,
          },
        });
    } catch {
      // In-memory fallback
      inMemoryProgress[`${userId}:${data.lessonId}`] = {
        userId,
        lessonId: data.lessonId,
        pathwayId: data.pathwayId,
        isCompleted,
        completedAt: now,
      };
    }

    return {
      success: true,
      lessonId: data.lessonId,
      isCompleted,
      completedAt: isCompleted ? now : null,
    };
  },

  /**
   * Get student progress (completed lesson IDs)
   */
  async getStudentProgress(userId: string, pathwayId?: string) {
    try {
      const query = db
        .select()
        .from(lessonProgress)
        .where(
          pathwayId
            ? and(
                eq(lessonProgress.userId, userId),
                eq(lessonProgress.isCompleted, true),
                eq(lessonProgress.pathwayId, pathwayId)
              )
            : and(eq(lessonProgress.userId, userId), eq(lessonProgress.isCompleted, true))
        );

      const rows = await query;
      const completedLessonIds = rows.map((r) => r.lessonId);

      // Merge any in-memory progress for this user
      for (const key of Object.keys(inMemoryProgress)) {
        if (key.startsWith(`${userId}:`) && inMemoryProgress[key].isCompleted) {
          if (!pathwayId || inMemoryProgress[key].pathwayId === pathwayId) {
            if (!completedLessonIds.includes(inMemoryProgress[key].lessonId)) {
              completedLessonIds.push(inMemoryProgress[key].lessonId);
            }
          }
        }
      }

      return {
        userId,
        pathwayId,
        completedLessonIds,
        totalCompleted: completedLessonIds.length,
      };
    } catch {
      // In-memory fallback
      const completedLessonIds: string[] = [];
      for (const key of Object.keys(inMemoryProgress)) {
        if (key.startsWith(`${userId}:`) && inMemoryProgress[key].isCompleted) {
          if (!pathwayId || inMemoryProgress[key].pathwayId === pathwayId) {
            completedLessonIds.push(inMemoryProgress[key].lessonId);
          }
        }
      }
      return {
        userId,
        pathwayId,
        completedLessonIds,
        totalCompleted: completedLessonIds.length,
      };
    }
  },

  /**
   * Submit assignment or quiz
   */
  async submitAssignment(
    userId: string,
    data: {
      lessonId: string;
      pathwayId?: string;
      type?: string;
      title?: string;
      submissionUrl?: string;
      submissionText?: string;
      score?: number;
      maxScore?: number;
      status?: string;
    }
  ) {
    const id = `sub_${userId}_${data.lessonId}_${Date.now()}`;
    const now = new Date().toISOString();
    const type = data.type || (data.score !== undefined ? "quiz" : "assignment");
    const status = data.status || (type === "quiz" ? "APPROVED" : "SUBMITTED");

    const record = {
      id,
      userId,
      lessonId: data.lessonId,
      pathwayId: data.pathwayId || null,
      type,
      title: data.title || (type === "quiz" ? "Graded Quiz" : "Hands-on Lab"),
      submissionUrl: data.submissionUrl || null,
      submissionText: data.submissionText || null,
      score: data.score !== undefined ? data.score : null,
      maxScore: data.maxScore || 100,
      status,
      evaluatedAt: type === "quiz" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.insert(submissions).values(record);
    } catch {
      inMemorySubmissions.push(record as any);
    }

    // Automatically mark the lesson as completed
    await this.markLessonProgress(userId, {
      lessonId: data.lessonId,
      pathwayId: data.pathwayId,
      isCompleted: true,
    });

    return {
      success: true,
      submission: record,
    };
  },

  /**
   * Get student submissions
   */
  async getStudentSubmissions(userId: string, pathwayId?: string) {
    try {
      const rows = await db
        .select()
        .from(submissions)
        .where(
          pathwayId
            ? and(eq(submissions.userId, userId), eq(submissions.pathwayId, pathwayId))
            : eq(submissions.userId, userId)
        );

      const combined = [...rows];
      for (const mem of inMemorySubmissions) {
        if (mem.userId === userId && (!pathwayId || mem.pathwayId === pathwayId)) {
          if (!combined.some((c) => c.id === mem.id)) {
            combined.push(mem as any);
          }
        }
      }
      return combined;
    } catch {
      return inMemorySubmissions.filter(
        (s) => s.userId === userId && (!pathwayId || s.pathwayId === pathwayId)
      );
    }
  },

  /**
   * Dynamically build activities schedule & completed activities
   * from enrolled pathways, modules, lessons and student submissions
   */
  async getStudentActivities(userId: string) {
    const accessible = await this.getAccessiblePathways(userId);
    const studentSubmissions = await this.getStudentSubmissions(userId);
    const progress = await this.getStudentProgress(userId);

    const completedLessonIds = new Set(progress.completedLessonIds);

    const missedList: any[] = [];
    const upcomingList: any[] = [];
    const completedList: any[] = [];

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const now = new Date();

    let primaryCourseTitle = "AI Agent Engineering: From Fundamentals to Production";
    let primaryPathwayId = "cs-agentic";

    for (const enr of accessible) {
      const pathwayId = enr.pathway?.id || enr.pathway?.slug;
      if (!pathwayId) continue;

      let content: any = null;
      try {
        content = await this.getPathwayContent(userId, pathwayId, true);
      } catch {
        continue;
      }

      const coursesList = content?.courses || [];
      const courseTitle = content?.courses?.[0]?.title || content?.pathway?.title || enr.pathway?.title || "AI Agent Engineering";
      if (courseTitle && !primaryCourseTitle) {
        primaryCourseTitle = courseTitle;
        primaryPathwayId = pathwayId;
      } else if (pathwayId === "cs-agentic" || pathwayId === "course1") {
        primaryCourseTitle = courseTitle;
        primaryPathwayId = pathwayId;
      }

    const seenLessonIds = new Set<string>();

    for (const crs of coursesList) {
        const mods = crs.modules || [];
        mods.forEach((mod: any, mIdx: number) => {
          const modLessons = mod.lessons || [];
          modLessons.forEach((les: any, lIdx: number) => {
            if (seenLessonIds.has(les.id)) return;
            seenLessonIds.add(les.id);

            const isQuiz = les.contentType === "QUIZ" || les.id?.includes("_quiz");
            const isAssignment =
              les.contentType === "ASSIGNMENT" ||
              les.id?.includes("_lab") ||
              les.id?.includes("_cap") ||
              les.id?.includes("milestone");
            const isLive = les.contentType === "LIVE" || les.id?.includes("_live");
            const isLecture = !isQuiz && !isAssignment && !isLive;

            const existingSub = studentSubmissions.find((s) => s.lessonId === les.id);
            const isDone = completedLessonIds.has(les.id) || !!existingSub;

            const category = isQuiz
              ? "Graded Quiz"
              : isAssignment
              ? les.title?.toLowerCase().includes("capstone")
                ? "Capstone Project"
                : "Hands-on Lab"
              : isLive
              ? "Live Class"
              : "Video Lecture";

            // If completed, add to completedList
            if (isDone) {
              const subDate = existingSub?.createdAt ? new Date(existingSub.createdAt) : now;
              const day = String(subDate.getDate()).padStart(2, "0");
              const monthShort = subDate.toLocaleString("default", { month: "short" });
              const yr = String(subDate.getFullYear()).slice(-2);
              const time = subDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

              completedList.push({
                id: `act-${les.id}`,
                lessonId: les.id,
                pathwayId,
                type: isQuiz ? "quiz" : isAssignment ? "assignment" : isLive ? "live" : "lecture",
                category,
                course: courseTitle,
                moduleTitle: mod.title,
                title: les.title,
                datePrefix: isQuiz ? "Completed" : isAssignment ? "Submitted" : "Watched",
                date: `${day} ${monthShort} ${yr} ${time}`,
                statusText: isQuiz
                  ? `Marks: ${existingSub?.score !== null && existingSub?.score !== undefined ? existingSub.score : 10}/10`
                  : existingSub?.status === "APPROVED"
                  ? "Evaluation Complete"
                  : "Completed",
              });
            } else if (mIdx === 0) {
              // Week 1 (Past week) - Uncompleted lessons, quizzes, or assignments are MISSED
              missedList.push({
                id: `act-missed-${les.id}`,
                lessonId: les.id,
                pathwayId,
                type: isQuiz ? "quiz" : isAssignment ? "assignment" : isLive ? "live" : "lecture",
                category,
                course: courseTitle,
                moduleTitle: mod.title,
                title: les.title,
                dateText: isQuiz
                  ? "Missed deadline: 09 Oct 2026"
                  : isAssignment
                  ? "Missed deadline: 11 Oct 2026"
                  : "Missed schedule: 07 Oct 2026",
                status: "MISSED",
                isOverdue: true,
                actionText: isQuiz ? "Take Quiz" : isAssignment ? "Submit Lab" : "Watch Lecture",
              });
            } else if (mIdx === 1) {
              // Week 2 (Current week) - UPCOMING
              upcomingList.push({
                id: `act-up-${les.id}`,
                lessonId: les.id,
                pathwayId,
                type: isQuiz ? "quiz" : isAssignment ? "assignment" : isLive ? "live" : "lecture",
                category,
                course: courseTitle,
                moduleTitle: mod.title,
                title: les.title,
                dateText: isLive
                  ? "Today • 6:00 PM – 7:30 PM IST"
                  : isQuiz
                  ? "Due Tonight • 11:59 PM"
                  : isAssignment
                  ? "Due Friday • 11:59 PM"
                  : "Target: Today / This Week",
                status: "UPCOMING",
                isToday: isLive || isQuiz,
                isUrgent: isQuiz || isAssignment,
                meetUrl: isLive ? "https://meet.google.com/uni-sole-live" : undefined,
                actionText: isLive ? "Join Live Class" : isQuiz ? "Start Quiz" : isAssignment ? "Start Lab" : "Watch Now",
                sortTime: isLive ? now.getTime() + 1000 : isQuiz ? now.getTime() + 2000 : now.getTime() + 5000,
                monthGroup: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
              });
            } else if (mIdx === 2) {
              // Week 3 - UPCOMING
              upcomingList.push({
                id: `act-up-${les.id}`,
                lessonId: les.id,
                pathwayId,
                type: isQuiz ? "quiz" : isAssignment ? "assignment" : isLive ? "live" : "lecture",
                category,
                course: courseTitle,
                moduleTitle: mod.title,
                title: les.title,
                dateText: isLive
                  ? "Saturday • 6:00 PM – 8:00 PM IST"
                  : isQuiz
                  ? "Due Sunday • 11:59 PM"
                  : "Upcoming Next Week",
                status: "UPCOMING",
                isToday: false,
                isUrgent: false,
                meetUrl: isLive ? "https://meet.google.com/uni-sole-live" : undefined,
                actionText: isLive ? "Join Workshop" : isQuiz ? "View Quiz" : "Preview",
                sortTime: now.getTime() + 7 * 24 * 60 * 60 * 1000,
                monthGroup: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
              });
            }
          });
        });
      }
    }

    // Query live calendar events from DB to enrich upcoming activities
    try {
      const calRes = await db.execute<any>(sql`
        SELECT * FROM calendar_events
        WHERE scope = 'GLOBAL' OR course_id = 'cs-agentic' OR course_id = 'course1'
        ORDER BY start_time ASC;
      `);
      const calRows = calRes.rows || calRes;
      if (Array.isArray(calRows)) {
        calRows.forEach((cev: any) => {
          const isTodayEv = cev.id.includes("today") || (cev.start_time && new Date(cev.start_time).toDateString() === now.toDateString());
          if (!upcomingList.some((u) => u.lessonId === cev.lesson_id || u.title === cev.title)) {
            upcomingList.push({
              id: `act-cal-${cev.id}`,
              lessonId: cev.lesson_id || cev.id,
              pathwayId: primaryPathwayId,
              type: cev.event_type === "LIVE_CLASS" ? "live" : cev.event_type === "MILESTONE" ? "quiz" : "assignment",
              category: cev.event_type === "LIVE_CLASS" ? "Live Class" : cev.event_type === "MILESTONE" ? "Graded Quiz" : "Hands-on Lab",
              course: primaryCourseTitle,
              moduleTitle: "AI Agent Engineering Live",
              title: cev.title,
              dateText: isTodayEv ? "Today • " + new Date(cev.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : new Date(cev.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              status: "UPCOMING",
              isToday: isTodayEv,
              isUrgent: isTodayEv,
              meetUrl: cev.meet_url,
              actionText: cev.event_type === "LIVE_CLASS" ? "Join Live Class" : cev.event_type === "MILESTONE" ? "Take Quiz" : "View Lab",
              sortTime: cev.start_time ? new Date(cev.start_time).getTime() : now.getTime(),
              monthGroup: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
            });
          }
        });
      }
    } catch (calErr) {
      console.warn("[LMSService] Calendar enrichment notice:", calErr);
    }

    // Group upcoming by month for backwards compatibility
    upcomingList.sort((a, b) => (a.sortTime || 0) - (b.sortTime || 0));
    const monthGroupsMap: Record<string, any[]> = {};
    for (const item of upcomingList) {
      const g = item.monthGroup || `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      if (!monthGroupsMap[g]) {
        monthGroupsMap[g] = [];
      }
      monthGroupsMap[g].push(item);
    }

    const scheduled = Object.entries(monthGroupsMap).map(([month, items]) => ({
      month,
      items,
    }));

    return {
      courseName: primaryCourseTitle,
      pathwayId: primaryPathwayId,
      missed: missedList,
      upcoming: upcomingList,
      completed: completedList,
      scheduled,
    };
  },

  /**
   * Save or update lecture note
   */
  async saveNote(
    userId: string,
    data: { lessonId: string; pathwayId?: string; lessonTitle?: string; content: string }
  ) {
    const id = `note_${userId}_${data.lessonId}`;
    const now = new Date().toISOString();

    try {
      await db
        .insert(notes)
        .values({
          id,
          userId,
          lessonId: data.lessonId,
          pathwayId: data.pathwayId || null,
          lessonTitle: data.lessonTitle || null,
          content: data.content,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [notes.userId, notes.lessonId],
          set: {
            content: data.content,
            lessonTitle: data.lessonTitle || null,
            updatedAt: now,
          },
        });
    } catch {
      // In-memory fallback
      const existingIdx = inMemoryNotes.findIndex(
        (n) => n.userId === userId && n.lessonId === data.lessonId
      );
      if (existingIdx >= 0) {
        inMemoryNotes[existingIdx].content = data.content;
        inMemoryNotes[existingIdx].updatedAt = now;
      } else {
        inMemoryNotes.push({
          id,
          userId,
          lessonId: data.lessonId,
          pathwayId: data.pathwayId,
          lessonTitle: data.lessonTitle,
          content: data.content,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return {
      success: true,
      note: {
        id,
        userId,
        lessonId: data.lessonId,
        pathwayId: data.pathwayId,
        lessonTitle: data.lessonTitle,
        content: data.content,
        updatedAt: now,
      },
    };
  },

  /**
   * Get notes for user
   */
  async getNotes(userId: string, pathwayId?: string) {
    try {
      const rows = await db
        .select()
        .from(notes)
        .where(
          pathwayId
            ? and(eq(notes.userId, userId), eq(notes.pathwayId, pathwayId))
            : eq(notes.userId, userId)
        );

      const combined = [...rows];
      for (const mem of inMemoryNotes) {
        if (mem.userId === userId && (!pathwayId || mem.pathwayId === pathwayId)) {
          if (!combined.some((c) => c.lessonId === mem.lessonId)) {
            combined.push(mem as any);
          }
        }
      }
      return combined;
    } catch {
      return inMemoryNotes.filter(
        (n) => n.userId === userId && (!pathwayId || n.pathwayId === pathwayId)
      );
    }
  },

  /**
   * Get Cohort community details for a pathway
   */
  async getCohortData(pathwayId?: string) {
    const isIncubator = pathwayId?.includes("common") || pathwayId?.includes("entrepreneur");
    return {
      pathwayId: pathwayId || "cs-genai",
      cohortTitle: isIncubator
        ? "AI Incubator Cohort • Weekend Track (2026)"
        : "Generative AI Engineering • Flagship Batch (2026)",
      schedule: isIncubator ? "Saturdays & Sundays • 10:00 AM - 1:00 PM" : "Weekdays Mon-Fri • Hybrid Labs",
      mentor: {
        name: "Dr. Girish Sharma",
        role: "Lead AI Architect & Director",
        designation: "Ex-Founding AI Engineer, Systems Specialist",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        bio: "Specializing in distributed LLM architectures, production RAG pipelines, and autonomous agent swarms.",
        email: "girish@unisole.org",
      },
      community: {
        name: "Unisole Skill AI Labs Community",
        platform: "Discord & Slack",
        url: "https://discord.gg/unisole",
        activeMembers: 142,
      },
      peers: [
        {
          id: "peer-1",
          name: "Priya Verma",
          college: "Centre of Excellence GDC Sanjauli",
          branch: "BCA",
          status: "Active Now",
          completedCount: 3,
        },
        {
          id: "peer-2",
          name: "Rohan Mehta",
          college: "GDC Theog",
          branch: "B.Sc CS",
          status: "Completed Week 1",
          completedCount: 2,
        },
        {
          id: "peer-3",
          name: "Ananya Thakur",
          college: "ABV GDC Sunni",
          branch: "B.Tech IT",
          status: "Active Now",
          completedCount: 4,
        },
        {
          id: "peer-4",
          name: "Sahil Rana",
          college: "GDC Sanjauli",
          branch: "BCA",
          status: "Week 2 in Progress",
          completedCount: 2,
        },
        {
          id: "peer-5",
          name: "Vikram Chauhan",
          college: "HPU Shimla",
          branch: "MCA",
          status: "Active 2h ago",
          completedCount: 5,
        },
      ],
    };
  },

  /**
   * Update student profile fields
   */
  async updateUserProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      timezone?: string;
      linkedin?: string;
      avatar?: string;
    }
  ) {
    let existing: any[] = [];
    try {
      existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    } catch (err) {
      console.warn("[LMSService] DB user lookup notice in updateUserProfile:", err);
    }

    const currentUser = existing[0] || {
      id: userId,
      name: "Aarav Sharma",
      email: "aarav.sharma@unisole.org",
      phone: "+919876543210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      collegeName: "Indian Institute of Information Technology (IIIT)",
      branch: "Computer Science & Engineering (AI/ML)",
      role: "STUDENT",
      isActive: true,
      metadata: {
        timezone: "Asia/Kolkata",
        linkedin: "https://linkedin.com/in/aarav-sharma-ai",
      },
    };

    const currentMeta = (currentUser.metadata as Record<string, any>) || {};
    const updatedMeta = {
      ...currentMeta,
      ...(data.timezone ? { timezone: data.timezone } : {}),
      ...(data.linkedin ? { linkedin: data.linkedin } : {}),
    };

    const updateFields: any = {
      updatedAt: new Date().toISOString(),
      metadata: updatedMeta,
    };
    if (data.name) updateFields.name = data.name.trim();
    if (data.email) updateFields.email = data.email.trim();
    if (data.phone) updateFields.phone = data.phone.trim();
    if (data.avatar) updateFields.avatar = data.avatar.trim();

    try {
      await db.update(users).set(updateFields).where(eq(users.id, userId));
    } catch {
      // Non-critical fallback
    }

    return {
      success: true,
      user: {
        ...currentUser,
        ...updateFields,
        timezone: updatedMeta.timezone || "Asia/Kolkata",
        linkedin: updatedMeta.linkedin || "",
      },
    };
  },

  // -------------------------------------------------------------
  // MENTORSHIP & COHORT SYSTEMS
  // -------------------------------------------------------------

  async getStudentMentor(userId: string) {
    try {
      const mappings = await db
        .select()
        .from(mentorMentees)
        .where(eq(mentorMentees.menteeId, userId))
        .limit(1);

      if (mappings.length > 0) {
        const mRecord = await db
          .select()
          .from(mentors)
          .where(eq(mentors.id, mappings[0].mentorId))
          .limit(1);

        if (mRecord.length > 0) {
          const userRecord = await db
            .select()
            .from(users)
            .where(eq(users.id, mRecord[0].userId))
            .limit(1);

          const u = userRecord[0];
          return {
            id: mRecord[0].id,
            name: u?.name || "Assigned Mentor",
            email: u?.email || "",
            specialization: u?.designation || mRecord[0].specialization || "Technical Mentor & Project Evaluator",
            officeHours: mRecord[0].officeHours || "",
            bio: mRecord[0].bio || (u?.metadata as any)?.bio || "Senior technical mentor guiding student capstone projects and assessments.",
            avatar: u?.avatar || (u?.metadata as any)?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
          };
        }
      }

      // Check if any mentor user exists in system
      const anyMentorUser = await db
        .select()
        .from(users)
        .where(sql`role::text = 'MENTOR' OR metadata->'roles' ? 'MENTOR'`)
        .limit(1);

      if (anyMentorUser.length > 0) {
        const u = anyMentorUser[0];
        return {
          id: `mnt_${u.id}`,
          name: u.name || "Assigned Mentor",
          email: u.email || "",
          specialization: u.designation || "Technical Mentor & Project Evaluator",
          officeHours: "",
          bio: (u.metadata as any)?.bio || "Senior technical mentor guiding student capstone projects and assessments.",
          avatar: u.avatar || (u.metadata as any)?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        };
      }
    } catch (err) {
      console.warn("[LMSService] DB getStudentMentor fallback notice:", err);
    }

    // Default canonical mentor profile
    return {
      id: "mnt_dr_vikram",
      name: "Assigned Mentor",
      email: "mentor@unisole.org",
      specialization: "Technical Mentor & Project Evaluator",
      officeHours: "",
      bio: "Senior technical mentor guiding student capstone projects and assessments.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    };
  },

  async getMentorCockpit(
    firstArg: string | { callerUserId: string; callerRoles?: string[]; targetMentorId?: string },
    secondArg?: string
  ) {
    let callerUserId: string;
    let callerRoles: string[] = [];
    let targetMentorId: string | undefined = undefined;

    if (typeof firstArg === "object" && firstArg !== null) {
      callerUserId = firstArg.callerUserId;
      callerRoles = firstArg.callerRoles || [];
      targetMentorId = firstArg.targetMentorId;
    } else {
      callerUserId = firstArg;
      targetMentorId = secondArg;
    }

    const isAdmin = callerRoles.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r.toUpperCase()));
    const isProgramManager = callerRoles.some((r) => ["COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r.toUpperCase()));
    const isMentor = callerRoles.some((r) => r.toUpperCase() === "MENTOR");

    // 1. Auto-sync users having role = 'MENTOR' into mentors table if not already present
    try {
      const mentorRoleUsers = await db
        .select()
        .from(users)
        .where(sql`role::text = 'MENTOR' OR metadata->'roles' ? 'MENTOR'`);

      for (const u of mentorRoleUsers) {
        const existing = await db
          .select()
          .from(mentors)
          .where(eq(mentors.userId, u.id))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(mentors).values({
            id: `mnt_${u.id}`,
            userId: u.id,
            specialization: u.designation || "Technical Mentor & Evaluator",
            bio: "Technical mentor guiding student capstone projects and assessments.",
            isActive: u.isActive,
          });
        }
      }
    } catch (err) {
      console.warn("[LMSService] Auto-sync mentors warning:", err);
    }

    let menteesList: any[] = [];
    let mentorRecord: any = null;

    try {
      let specificMentorId: string | undefined = undefined;

      if (targetMentorId && targetMentorId !== "ALL") {
        const records = await db
          .select()
          .from(mentors)
          .where(or(eq(mentors.id, targetMentorId), eq(mentors.userId, targetMentorId)))
          .limit(1);
        if (records.length > 0) {
          mentorRecord = records[0];
          specificMentorId = mentorRecord.id;
        }
      } else if (isMentor && !isAdmin && !isProgramManager) {
        const records = await db
          .select()
          .from(mentors)
          .where(eq(mentors.userId, callerUserId))
          .limit(1);
        if (records.length > 0) {
          mentorRecord = records[0];
          specificMentorId = mentorRecord.id;
        }
      }

      if (specificMentorId && mentorRecord) {
        // Fetch mentor's user details if available
        const mentorUser = (await db.select().from(users).where(eq(users.id, mentorRecord.userId)).limit(1))[0];
        if (mentorUser) {
          mentorRecord = {
            ...mentorRecord,
            name: mentorUser.name,
            email: mentorUser.email,
            phone: mentorUser.phone,
            avatar: mentorUser.avatar,
          };
        }

        // Ensure calendar_events table exists
        try {
          await db.execute(sql`
            CREATE TABLE IF NOT EXISTS calendar_events (
              id VARCHAR(50) PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              event_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
              start_time TIMESTAMPTZ NOT NULL,
              end_time TIMESTAMPTZ NOT NULL,
              scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
              course_id VARCHAR(255),
              lesson_id VARCHAR(255),
              mentor_id VARCHAR(255),
              student_id VARCHAR(255),
              meet_url VARCHAR(500),
              color_scheme VARCHAR(50) DEFAULT 'blue',
              created_by VARCHAR(255),
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
          `);
        } catch {}

        // Ensure mentor_mentees table exists
        try {
          await db.execute(sql`
            CREATE TABLE IF NOT EXISTS mentor_mentees (
              id VARCHAR(50) PRIMARY KEY,
              mentor_id VARCHAR(50) NOT NULL,
              mentee_id VARCHAR(50) NOT NULL,
              course_id VARCHAR(50),
              pathway_id VARCHAR(50),
              status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
              metadata JSONB DEFAULT '{}'::jsonb,
              assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
          `);
        } catch {}

        if (!mentorRecord) {
          mentorRecord = {
            id: specificMentorId || "ALL",
            userId: specificMentorId || "ALL",
            name: "Cohort Mentor",
            specialization: "Full Cohort Technical Oversight",
            bio: "Mentor guiding student courses, submissions, and live sessions.",
          };
        }

        // 1. Fetch assigned mentees from DB
        let menteeRows: any[] = [];
        if (specificMentorId) {
          menteeRows = await db
            .select()
            .from(mentorMentees)
            .where(and(eq(mentorMentees.mentorId, specificMentorId), eq(mentorMentees.status, "ACTIVE")));
        } else {
          menteeRows = await db
            .select()
            .from(mentorMentees)
            .where(eq(mentorMentees.status, "ACTIVE"));
        }

        // Auto-seed / associate real students into DB if none exist in mentor_mentees
        if (menteeRows.length === 0) {
          let studentUsers = await db
            .select()
            .from(users)
            .where(sql`role::text = 'STUDENT' OR metadata->'roles' ? 'STUDENT'`)
            .limit(10);

          if (studentUsers.length === 0) {
            const sampleStudents = [
              {
                id: "usr_student_1",
                name: "Aarav Sharma",
                email: "aarav.sharma@unisole.org",
                phone: "+91 98765 43210",
                role: "STUDENT" as any,
                collegeName: "Govt Degree College Sunni",
                isActive: true,
              },
              {
                id: "usr_student_2",
                name: "Priya Verma",
                email: "priya.verma@unisole.org",
                phone: "+91 98765 43211",
                role: "STUDENT" as any,
                collegeName: "Centre of Excellence Sanjauli",
                isActive: true,
              },
              {
                id: "usr_student_3",
                name: "Rohan Mehta",
                email: "rohan.mehta@unisole.org",
                phone: "+91 98765 43212",
                role: "STUDENT" as any,
                collegeName: "Govt College Theog",
                isActive: true,
              },
            ];

            for (const s of sampleStudents) {
              await db.insert(users).values(s).onConflictDoNothing();
            }

            studentUsers = await db
              .select()
              .from(users)
              .where(sql`role::text = 'STUDENT' OR metadata->'roles' ? 'STUDENT'`)
              .limit(10);
          }

          const mentorIdToLink = specificMentorId || "ALL_MENTORS";
          for (const s of studentUsers) {
            await db.insert(mentorMentees).values({
              id: `mm_${mentorIdToLink}_${s.id}`,
              mentorId: mentorIdToLink,
              menteeId: s.id,
              status: "ACTIVE",
            }).onConflictDoNothing();
          }

          if (specificMentorId) {
            menteeRows = await db
              .select()
              .from(mentorMentees)
              .where(and(eq(mentorMentees.mentorId, specificMentorId), eq(mentorMentees.status, "ACTIVE")));
          } else {
            menteeRows = await db
              .select()
              .from(mentorMentees)
              .where(eq(mentorMentees.status, "ACTIVE"));
          }
        }

        // 2. Ensure default pathways exist in DB
        const allDbPathways = await db.select().from(pathways).where(eq(pathways.isActive, true));
        if (allDbPathways.length === 0) {
          const samplePathways = [
            {
              id: "cs-p1",
              title: "Machine Learning Engineering in Production",
              slug: "ml-production",
              shortDescription: "Production ML pipelines, PyTorch deep learning, FastAPI model serving, Docker MLOps.",
              status: "PUBLISHED" as any,
              isActive: true,
            },
            {
              id: "cs-p2",
              title: "Full Stack Web Development (AI-Powered)",
              slug: "ai-fullstack",
              shortDescription: "Modern full stack engineering with React, Node.js, Express, MongoDB, and integrated AI.",
              status: "PUBLISHED" as any,
              isActive: true,
            },
          ];
          for (const p of samplePathways) {
            await db.insert(pathways).values(p).onConflictDoNothing();
          }
        }

        // 3. Ensure calendar events (missed deadlines & upcoming live events) exist in DB
        const existingEvents = await db.select().from(calendarEvents).limit(1);
        if (existingEvents.length === 0) {
          const defaultEvents = [
            {
              id: "ev_missed_1",
              title: "Lab 1 Deliverable: Context Engineering Pipeline & Dynamic Prompts",
              description: "Submit GitHub repo URL and architecture notes for mentor evaluation.",
              eventType: "DEADLINE",
              startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              lessonId: "les_agent_w2_lab",
              colorScheme: "rose",
            },
            {
              id: "ev_missed_2",
              title: "Graded MCQ Quiz #1: Context Windows & Role Boundaries",
              description: "Mandatory architectural assessment on token limits and system roles.",
              eventType: "MILESTONE",
              startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              lessonId: "les_agent_w2_quiz",
              colorScheme: "purple",
            },
            {
              id: "ev_missed_3",
              title: "Weekly 1-on-1 Mentorship & Code Review Sync",
              description: "Scheduled code review sync with assigned mentor.",
              eventType: "VIVA_1ON1",
              startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              meetUrl: "https://meet.google.com/uni-sole-mentor",
              colorScheme: "amber",
            },
            {
              id: "ev_up_1",
              title: "Live Masterclass: Dynamic Tool Calling & ReAct Loops",
              description: "Interactive session with senior architect on tool dispatching and error handling.",
              eventType: "LIVE_CLASS",
              startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5400000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              meetUrl: "https://meet.google.com/uni-sole-live",
              colorScheme: "blue",
            },
            {
              id: "ev_up_2",
              title: "Lab 2 Deliverable: Production Autonomous Agent System",
              description: "Deliverable deadline: Submit complete implementation of stateful agent.",
              eventType: "DEADLINE",
              startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              lessonId: "les_agent_w3_lab",
              colorScheme: "rose",
            },
            {
              id: "ev_up_3",
              title: "1-on-1 Capstone Defense & Mentorship Evaluation",
              description: "Private viva evaluation covering ReAct loops and architecture defense.",
              eventType: "VIVA_1ON1",
              startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              meetUrl: "https://meet.google.com/uni-sole-viva",
              colorScheme: "amber",
            },
            {
              id: "ev_up_4",
              title: "Final Capstone Evaluation & Project Demo",
              description: "End of pathway capstone project presentation.",
              eventType: "MILESTONE",
              startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
              scope: "GLOBAL",
              courseId: "cs-p1",
              colorScheme: "purple",
            },
          ];

          for (const ev of defaultEvents) {
            await db.insert(calendarEvents).values(ev as any).onConflictDoNothing();
          }

          // Ensure events for arts-p1 (Applied AI for Humanities) exist
          const artsEvents = [
            {
              id: "ev_arts_missed_1",
              title: "Module 1 Portfolio: Executive Communication & Prompt Synthesis",
              description: "Submit portfolio draft analyzing LLM impact on humanities research.",
              eventType: "DEADLINE",
              startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "COURSE",
              courseId: "arts-p1",
              colorScheme: "rose",
            },
            {
              id: "ev_arts_missed_2",
              title: "Applied AI Ethics & Archival Case Study",
              description: "Critique of automated content pipelines and academic integrity.",
              eventType: "MILESTONE",
              startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "COURSE",
              courseId: "arts-p1",
              colorScheme: "purple",
            },
            {
              id: "ev_arts_up_1",
              title: "Live Masterclass: AI Archival Research & Scholarly Workflows",
              description: "Interactive session on prompt strategies for archival analysis and synthesis.",
              eventType: "LIVE_CLASS",
              startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5400000).toISOString(),
              scope: "COURSE",
              courseId: "arts-p1",
              meetUrl: "https://meet.google.com/uni-sole-humanities",
              colorScheme: "blue",
            },
            {
              id: "ev_arts_up_2",
              title: "1-on-1 Capstone Proposal Review & Career Mentorship",
              description: "Mentorship review of student capstone research deliverable.",
              eventType: "VIVA_1ON1",
              startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
              scope: "COURSE",
              courseId: "arts-p1",
              meetUrl: "https://meet.google.com/uni-sole-mentor",
              colorScheme: "amber",
            },
          ];

          for (const ev of artsEvents) {
            await db.insert(calendarEvents).values(ev as any).onConflictDoNothing();
          }

          try {
            await db.execute(sql`
              UPDATE calendar_events 
              SET scope = 'COURSE' 
              WHERE course_id IS NOT NULL AND scope = 'GLOBAL';
            `);
          } catch {}
        }

        // 4. Construct enriched student details with enrolled courses, missed, and upcoming items
        const studentIds = Array.from(new Set(menteeRows.map((r) => r.menteeId)));
        if (studentIds.length > 0) {
          const studentUsers = await db
            .select()
            .from(users)
            .where(inArray(users.id, studentIds));

          const allSubs = await db
            .select()
            .from(submissions)
            .where(inArray(submissions.userId, studentIds));

          const allProgress = await db
            .select()
            .from(lessonProgress)
            .where(and(inArray(lessonProgress.userId, studentIds), eq(lessonProgress.isCompleted, true)));

          const allEvents = await db.select().from(calendarEvents);
          const allPathways = await db.select().from(pathways);

          // Ensure enrollments exist for these students
          const allEnrollments = await db
            .select()
            .from(enrollments)
            .where(inArray(enrollments.userId, studentIds));

          for (const u of studentUsers) {
            const userEnrs = allEnrollments.filter((e) => e.userId === u.id);
            if (userEnrs.length === 0 && allPathways.length > 0) {
              const defaultPwy = allPathways[0];
              await db.insert(enrollments).values({
                userId: u.id,
                pathwayId: defaultPwy.id,
                status: "ACTIVE" as any,
                source: "CAMPUS_SPONSORED" as any,
              }).onConflictDoNothing();
            }
          }

          const refreshedEnrollments = await db
            .select()
            .from(enrollments)
            .where(and(inArray(enrollments.userId, studentIds), eq(enrollments.status, "ACTIVE")));

          // Ensure events with course_id are scoped to COURSE, not GLOBAL
          try {
            await db.execute(sql`
              UPDATE calendar_events 
              SET scope = 'COURSE' 
              WHERE course_id IS NOT NULL AND scope = 'GLOBAL';
            `);
          } catch {}

          const now = new Date();

          menteesList = studentUsers.map((u) => {
            const userSubs = allSubs.filter((s) => s.userId === u.id);
            const pendingSubs = userSubs.filter((s) => ["SUBMITTED", "UNDER_REVIEW", "PENDING"].includes(s.status as string));
            const sortedSubs = [...userSubs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const latestSub = sortedSubs[0];

            const userEnrs = refreshedEnrollments.filter((e) => e.userId === u.id);
            const userPathwayIds = Array.from(new Set(userEnrs.map((e) => e.pathwayId || e.itemId).filter(Boolean)));
            const enrolledPwys = allPathways.filter((p) => userPathwayIds.includes(p.id) || userPathwayIds.includes(p.slug));
            const finalPwys = enrolledPwys.length > 0 ? enrolledPwys : allPathways.slice(0, 2);

            const enrolledCourses = finalPwys.map((pwy) => {
              const courseEvents = allEvents.filter((ev) => {
                if (ev.courseId) {
                  return ev.courseId === pwy.id || ev.courseId === pwy.slug;
                }
                if (ev.studentId) {
                  return ev.studentId === u.id;
                }
                return ev.scope === "GLOBAL";
              });

              const missed: any[] = [];
              const upcoming: any[] = [];

              for (const ev of courseEvents) {
                const evTime = new Date(ev.startTime);
                if (evTime < now) {
                  const hasSub = userSubs.some((s) => s.lessonId === ev.lessonId || s.title?.toLowerCase() === ev.title?.toLowerCase());
                  if (!hasSub) {
                    missed.push({
                      id: ev.id,
                      title: ev.title,
                      type: ev.eventType || "DEADLINE",
                      dueDate: ev.startTime,
                      description: ev.description,
                    });
                  }
                } else {
                  upcoming.push({
                    id: ev.id,
                    title: ev.title,
                    type: ev.eventType || "LIVE_CLASS",
                    date: ev.startTime,
                    meetUrl: ev.meetUrl,
                    description: ev.description,
                  });
                }
              }

              missed.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
              upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              return {
                courseId: pwy.id,
                courseTitle: pwy.title,
                slug: pwy.slug,
                shortDescription: pwy.shortDescription,
                missed,
                upcoming,
              };
            });

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              avatar: u.avatar || null,
              college: u.collegeName || "Govt Degree College",
              progressPercent: Math.min(100, Math.round((userSubs.length / 5) * 100)),
              status: userSubs.length > 0 ? "ON_TRACK" : "NEEDS_REVIEW",
              lastActive: latestSub?.createdAt ? "Active recently" : "Enrolled",
              enrolledCourses,
              submissions: sortedSubs,
              latestSubmission: latestSub || null,
            };
          });
        }
      }
    } catch (err) {
      console.warn("[LMSService] DB getMentorCockpit notice:", err);
    }

    const totalSubmissions = menteesList.reduce((acc, m) => acc + m.submittedCount, 0);
    const totalPending = menteesList.reduce((acc, m) => acc + m.pendingReviews, 0);
    const totalEvaluated = totalSubmissions - totalPending;
    const atRiskCount = menteesList.filter((m) => m.status === "AT_RISK").length;

    return {
      mentor: mentorRecord ? {
        id: mentorRecord.id,
        userId: mentorRecord.userId,
        name: mentorRecord.name || "Assigned Mentor",
        email: mentorRecord.email,
        phone: mentorRecord.phone,
        avatar: mentorRecord.avatar,
        specialization: mentorRecord.specialization || "Technical Mentor",
        bio: mentorRecord.bio,
      } : null,
      milestones: {
        submitted: totalSubmissions,
        evaluated: totalEvaluated,
        pendingReview: totalPending,
        atRisk: atRiskCount,
      },
      mentees: menteesList,
    };
  },

  async getSubmissionsAudit(options: {
    callerUserId: string;
    callerRoles: string[];
    status?: string;
    search?: string;
    mentorId?: string;
    courseId?: string;
  }) {
    const { callerUserId, callerRoles, status, search, mentorId, courseId } = options;
    const isAdmin = callerRoles.includes("SUPER_ADMIN") || callerRoles.includes("ADMIN");
    const isMentor = callerRoles.includes("MENTOR") && !isAdmin;
    const isProgramManager = (callerRoles.includes("COURSE_MANAGER") || callerRoles.includes("PROGRAM_MANAGER")) && !isAdmin;

    const whereClauses: any[] = [];

    if (isMentor) {
      // Mentors strictly ONLY see submissions from students assigned to them
      whereClauses.push(sql`EXISTS (
        SELECT 1 FROM mentor_mentees mm
        JOIN mentors m ON m.id = mm.mentor_id
        WHERE mm.mentee_id = s.user_id 
          AND m.user_id = ${callerUserId} 
          AND mm.status = 'ACTIVE'
      )`);
    } else if (isProgramManager) {
      // Program Managers can see all submissions from students assigned to ANY mentor (or filtered by specific mentorId)
      if (mentorId) {
        whereClauses.push(sql`EXISTS (
          SELECT 1 FROM mentor_mentees mm
          WHERE mm.mentee_id = s.user_id 
            AND mm.mentor_id = ${mentorId} 
            AND mm.status = 'ACTIVE'
        )`);
      } else {
        whereClauses.push(sql`EXISTS (
          SELECT 1 FROM mentor_mentees mm
          WHERE mm.mentee_id = s.user_id 
            AND mm.status = 'ACTIVE'
        )`);
      }
    } else if (isAdmin && mentorId) {
      whereClauses.push(sql`EXISTS (
        SELECT 1 FROM mentor_mentees mm
        WHERE mm.mentee_id = s.user_id 
          AND mm.mentor_id = ${mentorId} 
          AND mm.status = 'ACTIVE'
      )`);
    }

    if (courseId) {
      whereClauses.push(sql`(s.pathway_id = ${courseId} OR s.lesson_id = ${courseId})`);
    }

    if (status && status !== "ALL") {
      if (status === "PENDING") {
        whereClauses.push(sql`s.status::text IN ('SUBMITTED', 'UNDER_REVIEW', 'PENDING')`);
      } else if (status === "APPROVED" || status === "GRADED") {
        whereClauses.push(sql`s.status::text IN ('GRADED', 'APPROVED')`);
      } else if (status === "CHANGES_REQUESTED") {
        whereClauses.push(sql`s.status::text = 'CHANGES_REQUESTED'`);
      } else {
        whereClauses.push(sql`s.status::text = ${status}`);
      }
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClauses.push(sql`(
        u.name ILIKE ${q} OR 
        u.email ILIKE ${q} OR 
        s.title ILIKE ${q} OR 
        c.title ILIKE ${q} OR
        p.title ILIKE ${q}
      )`);
    }

    const whereSql = whereClauses.length > 0 ? sql`WHERE ${sql.join(whereClauses, sql` AND `)}` : sql``;

    const query = sql`
      SELECT 
        s.id,
        s.user_id as "studentId",
        u.name as "studentName",
        u.email as "studentEmail",
        u.phone as "studentPhone",
        s.pathway_id as "courseId",
        COALESCE(c.title, p.title, s.pathway_id, 'Course Assignment') as "courseTitle",
        s.lesson_id as "lessonId",
        s.assignment_id as "assignmentId",
        s.title as "lessonTitle",
        s.title as "title",
        s.type,
        s.submission_url as "submissionUrl",
        s.submission_text as "submissionText",
        s.code_snippet as "codeSnippet",
        s.video_url as "videoUrl",
        s.score,
        s.max_score as "maxScore",
        s.status,
        s.mentor_feedback as "mentorFeedback",
        s.evaluated_at as "reviewedAt",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        m.id as "mentorId",
        u_m.name as "mentorName",
        u_m.name as "reviewedBy"
      FROM submissions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN courses c ON (c.id = s.pathway_id OR c.slug = s.pathway_id)
      LEFT JOIN pathways p ON (p.id = s.pathway_id OR p.slug = s.pathway_id)
      LEFT JOIN mentor_mentees mm ON (mm.mentee_id = s.user_id AND mm.status = 'ACTIVE')
      LEFT JOIN mentors m ON m.id = mm.mentor_id
      LEFT JOIN users u_m ON u_m.id = m.user_id
      ${whereSql}
      ORDER BY s.created_at DESC;
    `;

    const result = await db.execute<any>(query);
    return (result.rows || result).map((row: any) => ({
      ...row,
      status: ["GRADED", "APPROVED"].includes(row.status)
        ? "APPROVED"
        : row.status === "CHANGES_REQUESTED"
        ? "CHANGES_REQUESTED"
        : "PENDING",
      score: row.score ?? (row.status === "GRADED" || row.status === "APPROVED" ? 85 : null),
      maxScore: row.maxScore ?? 100,
    }));
  },

  // -------------------------------------------------------------
  // ASSIGNMENTS & EVALUATIONS (PRACTICE VS TEST)
  // -------------------------------------------------------------

  async getCourseAssignments(courseId?: string, moduleId?: string) {
    try {
      let query = db.select().from(courseAssignments);
      if (courseId && moduleId) {
        query = db
          .select()
          .from(courseAssignments)
          .where(and(eq(courseAssignments.courseId, courseId), eq(courseAssignments.moduleId, moduleId))) as any;
      } else if (courseId) {
        query = db.select().from(courseAssignments).where(eq(courseAssignments.courseId, courseId)) as any;
      } else if (moduleId) {
        query = db.select().from(courseAssignments).where(eq(courseAssignments.moduleId, moduleId)) as any;
      }

      const rows = await query;
      if (rows.length > 0) return rows;
    } catch (err) {
      console.warn("[LMSService] DB getCourseAssignments fallback notice:", err);
    }

    // Default canonical assignments catalog
    return [
      {
        id: "asg_practice_mcq_1",
        courseId: courseId || "cs-p1",
        moduleId: moduleId || "mod_w1",
        title: "Practice: PyTorch Tensor Operations Quiz",
        slug: "practice-pytorch-tensor-operations-quiz",
        description: "Formative self-check test on broadcasting, gradient graphs, and tensor manipulation.",
        category: "PRACTICE",
        type: "MCQ",
        maxScore: 10,
        position: 1,
        status: "PUBLISHED",
        config: {
          questions: [
            {
              id: "q1",
              question: "What happens when broadcasting two tensors of shapes (3, 1) and (1, 4)?",
              options: ["Error thrown", "Resulting shape is (3, 4)", "Resulting shape is (4, 3)", "Flattened to (12,)"],
              answerIndex: 1,
              explanation: "Broadcasting automatically stretches singleton dimensions (1) along the corresponding axis.",
            },
          ],
        },
      },
      {
        id: "asg_practice_proj_1",
        courseId: courseId || "cs-p1",
        moduleId: moduleId || "mod_w1",
        title: "Practice Project: Custom Autograd Layer",
        slug: "practice-project-custom-autograd-layer",
        description: "Implement a forward and backward pass for a custom Swish activation layer in Python.",
        category: "PRACTICE",
        type: "PROJECT",
        maxScore: 25,
        position: 2,
        status: "PUBLISHED",
        config: {
          starterRepo: "https://github.com/unisole-labs/practice-autograd-starter",
        },
      },
      {
        id: "asg_test_coding_1",
        courseId: courseId || "cs-p1",
        moduleId: moduleId || "mod_w2",
        title: "Coding Test: High-Throughput Matrix Multiplier",
        slug: "coding-test-high-throughput-matrix-multiplier",
        description: "Evaluated coding test with automated test cases. Memory & time benchmarks enforced.",
        category: "TEST",
        type: "CODING_TEST",
        maxScore: 50,
        position: 3,
        status: "PUBLISHED",
        config: {
          language: "python",
          starterCode: "def matrix_multiply(A, B):\n    # Write optimized solution\n    pass\n",
          testCases: [
            { input: "[[1, 2], [3, 4]], [[5, 6], [7, 8]]", expected: "[[19, 22], [43, 50]]", isHidden: false },
            { input: "[[0]], [[0]]", expected: "[[0]]", isHidden: true },
          ],
        },
      },
      {
        id: "asg_test_subj_1",
        courseId: courseId || "cs-p1",
        moduleId: moduleId || "mod_w2",
        title: "Subjective Test: RAG Architecture Trade-Offs",
        slug: "subjective-test-rag-architecture-trade-offs",
        description: "Explain chunking strategies and hybrid BM25 + dense vector search trade-offs with diagrams.",
        category: "TEST",
        type: "SUBJECTIVE_TEST",
        maxScore: 30,
        position: 4,
        status: "PUBLISHED",
        config: {
          rubrics: [
            { criterion: "Chunking & Overlap Analysis", maxPoints: 10 },
            { criterion: "Hybrid Search Precision", maxPoints: 10 },
            { criterion: "Latency & Re-ranking Cost", maxPoints: 10 },
          ],
        },
      },
      {
        id: "asg_test_video_1",
        courseId: courseId || "cs-p1",
        moduleId: moduleId || "mod_w3",
        title: "Video Test: Capstone Architectural Pitch & Viva",
        slug: "video-test-capstone-pitch",
        description: "Record and upload a 2-3 minute video walkthrough of your deployed ML inference pipeline.",
        category: "TEST",
        type: "VIDEO_TEST",
        maxScore: 35,
        position: 5,
        status: "PUBLISHED",
        config: {
          maxDurationSec: 180,
          checklist: ["Introduction & Problem", "Architecture & Serving Flow", "Latency Benchmark Demo"],
        },
      },
    ];
  },

  async createOrUpdateAssignment(data: {
    id?: string;
    courseId?: string;
    moduleId?: string;
    title: string;
    category: "PRACTICE" | "TEST";
    type: "MCQ" | "CODING_TEST" | "SUBJECTIVE_TEST" | "VIDEO_TEST" | "PROJECT";
    description?: string;
    config?: any;
    maxScore?: number;
    position?: number;
  }) {
    const id = data.id || `asg_${Date.now()}`;
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload: any = {
      id,
      courseId: data.courseId || "cs-p1",
      moduleId: data.moduleId || "mod_w1",
      title: data.title,
      slug,
      description: data.description || "",
      category: data.category,
      type: data.type,
      config: data.config || {},
      maxScore: data.maxScore || 100,
      position: data.position || 1,
      status: "PUBLISHED",
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.insert(courseAssignments).values(payload).onConflictDoUpdate({
        target: courseAssignments.id,
        set: payload,
      });
    } catch (err) {
      console.warn("[LMSService] DB createOrUpdateAssignment notice:", err);
    }

    return {
      success: true,
      assignment: payload,
    };
  },

  async submitAssessmentTask(userId: string, data: {
    assignmentId: string;
    lessonId?: string;
    pathwayId?: string;
    type?: string;
    title?: string;
    submissionUrl?: string;
    submissionText?: string;
    codeSnippet?: string;
    videoUrl?: string;
    metadata?: any;
  }) {
    const submissionId = `sub_${Date.now()}`;
    const payload: any = {
      id: submissionId,
      userId,
      lessonId: data.lessonId || data.assignmentId,
      assignmentId: data.assignmentId,
      pathwayId: data.pathwayId || "cs-p1",
      type: data.type || "assignment",
      title: data.title || "Assignment Submission",
      submissionUrl: data.submissionUrl || null,
      submissionText: data.submissionText || null,
      codeSnippet: data.codeSnippet || null,
      videoUrl: data.videoUrl || null,
      status: "SUBMITTED",
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.insert(submissions).values(payload);
    } catch (err) {
      console.warn("[LMSService] DB submitAssignment notice:", err);
    }

    return {
      success: true,
      submission: payload,
    };
  },

  async gradeSubmission(submissionId: string, mentorUserId: string, data: {
    score: number;
    mentorFeedback?: string;
    status?: string;
  }) {
    const updatePayload: any = {
      score: data.score,
      mentorFeedback: data.mentorFeedback || "Good effort. Review the suggestions for optimization.",
      status: data.status || "GRADED",
      evaluatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.update(submissions).set(updatePayload).where(eq(submissions.id, submissionId));
    } catch (err) {
      console.warn("[LMSService] DB gradeSubmission notice:", err);
    }

    return {
      success: true,
      submissionId,
      ...updatePayload,
    };
  },

  // -------------------------------------------------------------
  // CALENDAR & SCHEDULING (GLOBAL, COHORT, COURSE, 1:1 VIVA)
  // -------------------------------------------------------------

  async getCalendarEvents(options: {
    callerUserId: string;
    callerRoles: string[];
    startDate?: string;
    endDate?: string;
    eventType?: string;
    courseId?: string;
    mentorId?: string;
    studentId?: string;
    search?: string;
  }) {
    const { callerUserId, callerRoles, startDate, endDate, eventType, courseId, mentorId, studentId, search } = options;
    const isAdmin = callerRoles.includes("SUPER_ADMIN") || callerRoles.includes("ADMIN");
    const isProgramManager = (callerRoles.includes("COURSE_MANAGER") || callerRoles.includes("PROGRAM_MANAGER")) && !isAdmin;
    const isMentor = callerRoles.includes("MENTOR") && !isAdmin && !isProgramManager;
    const isStudent = !isAdmin && !isProgramManager && !isMentor;

    // Ensure calendar_events table exists in DB
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
          course_id VARCHAR(255),
          lesson_id VARCHAR(255),
          mentor_id VARCHAR(255),
          student_id VARCHAR(255),
          meet_url VARCHAR(500),
          color_scheme VARCHAR(50) DEFAULT 'blue',
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    } catch {}

    const whereClauses: any[] = [];

    if (isStudent) {
      let enrolledCourseIds: string[] = [];
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callerUserId);
        if (isUuid) {
          const enrRows = await db
            .select({
              itemId: enrollments.itemId,
              pathwayId: enrollments.pathwayId,
            })
            .from(enrollments)
            .where(and(eq(enrollments.userId, callerUserId), eq(enrollments.status, "ACTIVE")));
          enrRows.forEach((r) => {
            if (r.itemId) enrolledCourseIds.push(r.itemId);
            if (r.pathwayId) enrolledCourseIds.push(r.pathwayId);
          });
        }
      } catch (err) {
        console.warn("[LMSService] Enrollment lookup skipped:", err);
      }

      const courseFilter = enrolledCourseIds.length > 0
        ? sql`(ce.scope IN ('COURSE', 'COHORT') AND (ce.course_id IN (${sql.join(enrolledCourseIds.map((id) => sql`${id}`), sql`, `)}) OR ce.course_id IS NULL))`
        : sql`FALSE`;

      whereClauses.push(sql`(
        ce.scope = 'GLOBAL' OR
        ce.student_id = ${callerUserId} OR
        ${courseFilter}
      )`);
    } else if (isMentor) {
      whereClauses.push(sql`(
        ce.scope = 'GLOBAL' OR
        ce.mentor_id = ${callerUserId} OR
        ce.created_by = ${callerUserId} OR
        EXISTS (
          SELECT 1 FROM mentor_mentees mm
          JOIN mentors m ON m.id::text = mm.mentor_id::text
          WHERE mm.mentee_id::text = ce.student_id
            AND m.user_id::text = ${callerUserId}
            AND mm.status = 'ACTIVE'
        )
      )`);
    } else {
      if (courseId && courseId !== "ALL") {
        whereClauses.push(sql`(ce.course_id = ${courseId} OR ce.scope = 'GLOBAL')`);
      }
      if (mentorId && mentorId !== "ALL") {
        whereClauses.push(sql`(ce.mentor_id = ${mentorId} OR ce.scope = 'GLOBAL')`);
      }
      if (studentId && studentId !== "ALL") {
        whereClauses.push(sql`(ce.student_id = ${studentId} OR ce.scope = 'GLOBAL')`);
      }
    }

    if (eventType && eventType !== "ALL") {
      whereClauses.push(sql`ce.event_type = ${eventType}`);
    }

    if (startDate) {
      whereClauses.push(sql`ce.end_time >= ${startDate}`);
    }
    if (endDate) {
      whereClauses.push(sql`ce.start_time <= ${endDate}`);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClauses.push(sql`(ce.title ILIKE ${q} OR ce.description ILIKE ${q})`);
    }

    const whereSql = whereClauses.length > 0 ? sql`WHERE ${sql.join(whereClauses, sql` AND `)}` : sql``;

    const query = sql`
      SELECT 
        ce.id,
        ce.title,
        ce.description,
        ce.event_type as "eventType",
        ce.start_time as "startTime",
        ce.end_time as "endTime",
        ce.scope,
        ce.course_id as "courseId",
        ce.lesson_id as "lessonId",
        ce.mentor_id as "mentorId",
        ce.student_id as "studentId",
        ce.meet_url as "meetUrl",
        ce.color_scheme as "colorScheme",
        ce.created_by as "createdBy",
        ce.created_at as "createdAt",
        ce.updated_at as "updatedAt",
        u_s.name as "studentName",
        u_m.name as "mentorName",
        c.title as "courseTitle"
      FROM calendar_events ce
      LEFT JOIN users u_s ON u_s.id::text = ce.student_id
      LEFT JOIN users u_m ON u_m.id::text = ce.mentor_id
      LEFT JOIN courses c ON (c.id::text = ce.course_id OR c.slug = ce.course_id)
      ${whereSql}
      ORDER BY ce.start_time ASC;
    `;

    try {
      const res = await db.execute<any>(query);
      const rows = res.rows || res;
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.warn("[LMSService] DB getCalendarEvents notice:", err);
    }

    // In-memory events filter (for offline/test environments)
    if (inMemoryCalendarEvents.length > 0) {
      const filtered = inMemoryCalendarEvents.filter((ev) => {
        if (isStudent) {
          if (ev.scope === "GLOBAL") return true;
          if (ev.studentId === callerUserId) return true;
          return false;
        }
        if (isMentor) {
          if (ev.scope === "GLOBAL") return true;
          if (ev.mentorId === callerUserId || ev.createdBy === callerUserId) return true;
          return false;
        }
        return true;
      });
      if (filtered.length > 0) {
        return filtered;
      }
    }

    // 3. Build dynamic live schedule from DB (Enrolled courses, upcoming lectures, pending MCQs, lab deliverables, and mentor live sessions)
    try {
      const now = new Date();
      const monday = new Date(now);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);

      const makeDate = (dayOffset: number, hours: number, minutes = 0) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + dayOffset);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
      };

      // Query active enrollments for user
      const userEnrollments = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.userId, callerUserId), eq(enrollments.status, "ACTIVE")));

      const pathwayId = userEnrollments[0]?.pathwayId || userEnrollments[0]?.itemId || "cs-agentic";
      const canon = getCanonicalPathway(pathwayId) || CANONICAL_GROUPS[0].pathways[0];

      // Query completed lessons for student
      const userProgress = await db
        .select()
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, callerUserId), eq(lessonProgress.isCompleted, true)));
      const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

      // Query user submissions
      const userSubs = await db
        .select()
        .from(submissions)
        .where(eq(submissions.userId, callerUserId));
      const submittedLessonIds = new Set(userSubs.map((s) => s.lessonId || s.assignmentId));

      // Query assigned mentor
      const mentorAssigned = await db
        .select({
          mentorId: mentorMentees.mentorId,
          mentorUserId: mentors.userId,
          specialization: mentors.specialization,
          officeHours: mentors.officeHours,
          name: users.name,
        })
        .from(mentorMentees)
        .leftJoin(mentors, eq(mentors.id, mentorMentees.mentorId))
        .leftJoin(users, eq(users.id, mentors.userId))
        .where(and(eq(mentorMentees.menteeId, callerUserId), eq(mentorMentees.status, "ACTIVE")))
        .limit(1);

      const mentorInfo = mentorAssigned[0] || {
        name: "Dr. Vikram Sethi",
        specialization: "Principal AI Scientist & GenAI Systems",
        officeHours: "Tuesday & Thursday 6:00 PM - 7:30 PM IST",
      };

      // Collect pending items from modules
      const pendingLectures: any[] = [];
      const pendingQuizzes: any[] = [];
      const pendingAssignments: any[] = [];

      (canon?.modules || []).forEach((mod: any, mIdx: number) => {
        (mod.topics || []).forEach((topic: string, tIdx: number) => {
          const lId = `les_${canon.id}_${mod.num}_${tIdx + 1}`;
          if (!completedLessonIds.has(lId)) {
            pendingLectures.push({
              id: lId,
              title: topic,
              moduleTitle: mod.title,
              pathwayId: canon.id,
            });
          }
        });

        // Check for lab / assignment
        if (mod.practical) {
          const labId = `les_${canon.id}_${mod.num}_lab`;
          if (!submittedLessonIds.has(labId) && !completedLessonIds.has(labId)) {
            pendingAssignments.push({
              id: labId,
              title: `Lab: ${mod.title}`,
              description: mod.practical,
              moduleTitle: mod.title,
              pathwayId: canon.id,
            });
          }
        }
      });

      // Also check capstone
      const cap = canon?.capstone;
      if (cap) {
        (cap.outputs || []).forEach((out: string, oIdx: number) => {
          const capId = `les_${canon.id}_cap_${oIdx + 1}`;
          if (!submittedLessonIds.has(capId) && !completedLessonIds.has(capId)) {
            pendingAssignments.push({
              id: capId,
              title: `Capstone Deliverable: ${out}`,
              description: out,
              moduleTitle: `Capstone: ${cap.title}`,
              pathwayId: canon.id,
            });
          }
        });
      }

      const generatedEvents: any[] = [];

      // 1. Monday: Next Upcoming Lecture
      const nextLecture1 = pendingLectures[0] || { title: "Introduction to Neural Architectures", id: `les_${canon.id}_1_1`, moduleTitle: "Module 1" };
      generatedEvents.push({
        id: `ev_lec_mon_${nextLecture1.id}`,
        title: `Lecture: ${nextLecture1.title}`,
        description: `Enrolled: ${canon.title} · ${nextLecture1.moduleTitle || "Core Curriculum"}`,
        eventType: "LIVE_CLASS",
        startTime: makeDate(0, 10, 0),
        endTime: makeDate(0, 11, 0),
        scope: "COURSE",
        courseId: canon.id,
        lessonId: nextLecture1.id,
        colorScheme: "blue",
        createdAt: new Date().toISOString(),
      });

      // 2. Tuesday: Mentor Live Office Hours & Doubt Session
      generatedEvents.push({
        id: `ev_mentor_tue`,
        title: `Live Office Hours: ${mentorInfo.name || "Assigned Mentor"}`,
        description: `${mentorInfo.specialization || "Technical Mentorship"} — 1-on-1 doubt clearing & project review.`,
        eventType: "VIVA_1ON1",
        startTime: makeDate(1, 16, 30),
        endTime: makeDate(1, 17, 30),
        scope: isStudent ? "STUDENT" : "GLOBAL",
        studentId: isStudent ? callerUserId : undefined,
        mentorName: mentorInfo.name,
        meetUrl: "https://meet.google.com/uni-mentor-office-hours",
        colorScheme: "rose",
        createdAt: new Date().toISOString(),
      });

      // 3. Wednesday: Second Upcoming Lecture / Concept Review
      const nextLecture2 = pendingLectures[1] || { title: "Hands-on PyTorch Model Optimization", id: `les_${canon.id}_1_2`, moduleTitle: "Module 1" };
      generatedEvents.push({
        id: `ev_lec_wed_${nextLecture2.id}`,
        title: `Lecture: ${nextLecture2.title}`,
        description: `Enrolled: ${canon.title} · ${nextLecture2.moduleTitle || "Core Curriculum"}`,
        eventType: "LIVE_CLASS",
        startTime: makeDate(2, 10, 0),
        endTime: makeDate(2, 11, 0),
        scope: "COURSE",
        courseId: canon.id,
        lessonId: nextLecture2.id,
        colorScheme: "blue",
        createdAt: new Date().toISOString(),
      });

      // 4. Wednesday Afternoon: Pending MCQ / Practice Quiz Assessment
      generatedEvents.push({
        id: `ev_mcq_wed`,
        title: `MCQ Assessment: ${nextLecture1.title}`,
        description: `Knowledge check & practice quiz for ${nextLecture1.title}.`,
        eventType: "MILESTONE",
        startTime: makeDate(2, 14, 0),
        endTime: makeDate(2, 15, 0),
        scope: "COURSE",
        courseId: canon.id,
        lessonId: nextLecture1.id,
        colorScheme: "green",
        createdAt: new Date().toISOString(),
      });

      // 5. Thursday: Second Mentor Office Hours
      generatedEvents.push({
        id: `ev_mentor_thu`,
        title: `Mentorship Huddle: ${mentorInfo.name || "Assigned Mentor"}`,
        description: `${mentorInfo.specialization || "Technical Mentorship"} — Weekly milestone check-in.`,
        eventType: "VIVA_1ON1",
        startTime: makeDate(3, 16, 30),
        endTime: makeDate(3, 17, 30),
        scope: isStudent ? "STUDENT" : "GLOBAL",
        studentId: isStudent ? callerUserId : undefined,
        mentorName: mentorInfo.name,
        meetUrl: "https://meet.google.com/uni-mentor-office-hours",
        colorScheme: "rose",
        createdAt: new Date().toISOString(),
      });

      // 6. Friday: Pending Lab / Assignment Deliverable Due
      const nextAssignment = pendingAssignments[0] || {
        title: "Hands-on Practical Lab Deliverable",
        description: "Complete and commit code to your designated repository branch.",
        id: "lab_1",
      };
      generatedEvents.push({
        id: `ev_lab_fri_${nextAssignment.id}`,
        title: `Deliverable Due: ${nextAssignment.title}`,
        description: `${nextAssignment.description} · Due by end of week.`,
        eventType: "DEADLINE",
        startTime: makeDate(4, 15, 0),
        endTime: makeDate(4, 16, 30),
        scope: "COURSE",
        courseId: canon.id,
        lessonId: nextAssignment.id,
        colorScheme: "purple",
        createdAt: new Date().toISOString(),
      });

      // 7. Saturday: Weekend Live Online Class / Capstone Masterclass
      generatedEvents.push({
        id: `ev_weekend_masterclass`,
        title: `Weekend Live Class: Applied AI Systems`,
        description: `Interactive live coding session & industry architecture walkthrough.`,
        eventType: "LIVE_CLASS",
        startTime: makeDate(5, 11, 0),
        endTime: makeDate(5, 12, 30),
        scope: "GLOBAL",
        meetUrl: "https://meet.google.com/uni-ai-masterclass",
        colorScheme: "amber",
        createdAt: new Date().toISOString(),
      });

      let finalEvents = generatedEvents;
      if (eventType && eventType !== "ALL") {
        finalEvents = finalEvents.filter((e) => e.eventType === eventType);
      }
      if (search && search.trim()) {
        const q = String(search).toLowerCase();
        finalEvents = finalEvents.filter((e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q))
        );
      }

      return finalEvents;
    } catch (dbErr) {
      console.warn("[LMSService] Dynamic DB calendar generation notice:", dbErr);
      return [];
    }
  },

  async createCalendarEvent(
    callerUserId: string,
    arg2: string[] | any,
    arg3?: any
  ) {
    const callerRoles: string[] = Array.isArray(arg2) ? arg2 : [];
    const data: {
      title: string;
      description?: string;
      eventType?: string;
      startTime: string;
      endTime: string;
      scope?: string;
      courseId?: string;
      lessonId?: string;
      mentorId?: string;
      studentId?: string;
      meetUrl?: string;
      colorScheme?: string;
    } = Array.isArray(arg2) ? arg3 : arg2;

    const upperRoles = (callerRoles || []).map((r) => String(r).toUpperCase());
    const isAdmin = upperRoles.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r));
    const isCourseManager = upperRoles.some((r) => ["COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r));
    if (!isAdmin && !isCourseManager && callerRoles.length > 0) {
      throw new ForbiddenError("Only Course Managers and Admins can create calendar events");
    }

    const id = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload: any = {
      id,
      title: data.title,
      description: data.description || null,
      eventType: data.eventType || "GENERAL",
      startTime: data.startTime,
      endTime: data.endTime,
      scope: data.scope || "GLOBAL",
      courseId: data.courseId || null,
      lessonId: data.lessonId || null,
      mentorId: data.mentorId || null,
      studentId: data.studentId || null,
      meetUrl: data.meetUrl || null,
      colorScheme: data.colorScheme || "blue",
      createdBy: callerUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryCalendarEvents.push(payload);

    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
          course_id VARCHAR(255),
          lesson_id VARCHAR(255),
          mentor_id VARCHAR(255),
          student_id VARCHAR(255),
          meet_url VARCHAR(500),
          color_scheme VARCHAR(50) DEFAULT 'blue',
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await db.insert(calendarEvents).values(payload);
    } catch (err) {
      console.warn("[LMSService] DB createCalendarEvent notice:", err);
    }

    return {
      success: true,
      event: payload,
    };
  },

  async updateCalendarEvent(id: string, callerUserId: string, callerRoles: string[] = [], data: any) {
    const upperRoles = (callerRoles || []).map((r) => String(r).toUpperCase());
    const isAdmin = upperRoles.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r));
    const isCourseManager = upperRoles.some((r) => ["COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r));
    if (!isAdmin && !isCourseManager && callerRoles.length > 0) {
      throw new ForbiddenError("Only Course Managers and Admins can edit calendar events");
    }

    const updatePayload: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const idx = inMemoryCalendarEvents.findIndex((e) => e.id === id);
    if (idx !== -1) {
      inMemoryCalendarEvents[idx] = { ...inMemoryCalendarEvents[idx], ...updatePayload };
    }

    try {
      await db.update(calendarEvents).set(updatePayload).where(eq(calendarEvents.id, id));
    } catch (err) {
      console.warn("[LMSService] DB updateCalendarEvent notice:", err);
    }

    return {
      success: true,
      id,
      ...updatePayload,
    };
  },

  async deleteCalendarEvent(id: string, callerUserId: string, callerRoles: string[] = []) {
    const upperRoles = (callerRoles || []).map((r) => String(r).toUpperCase());
    const isAdmin = upperRoles.some((r) => ["SUPER_ADMIN", "ADMIN"].includes(r));
    const isCourseManager = upperRoles.some((r) => ["COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r));
    if (!isAdmin && !isCourseManager && callerRoles.length > 0) {
      throw new ForbiddenError("Only Course Managers and Admins can delete calendar events");
    }

    const idx = inMemoryCalendarEvents.findIndex((e) => e.id === id);
    if (idx !== -1) {
      inMemoryCalendarEvents.splice(idx, 1);
    }

    try {
      await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    } catch (err) {
      console.warn("[LMSService] DB deleteCalendarEvent notice:", err);
    }

    return {
      success: true,
      id,
    };
  },
};

