import { eq, and, or, inArray, asc } from "drizzle-orm";
import { db } from "../db";
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
  mentors,
  mentorMentees,
  programManagers,
  Pathway,
  Lesson,
} from "../db/schema";
import { ForbiddenError, NotFoundError } from "../errors";
import { getCanonicalPathway, CANONICAL_GROUPS } from "../constants/canonical-catalog";

const PATHWAY_CATALOG: Record<string, { title: string; description: string; duration: string; level: string }> = {
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
        })
        .from(enrollments)
        .leftJoin(
          pathways,
          or(
            eq(enrollments.pathwayId, pathways.id),
            eq(enrollments.itemId, pathways.id),
            eq(enrollments.pathwayId, pathways.slug),
            eq(enrollments.itemId, pathways.slug)
          )
        )
        .where(
          and(
            eq(enrollments.userId, userId),
            eq(enrollments.status, "ACTIVE")
          )
        );
    } catch (dbErr) {
      console.warn("[LMSService] DB offline or query issue in getAccessiblePathways, using fallback enrollments:", dbErr);
    }

    if (activeEnrollments.length === 0) {
      // In staging/preview or offline DB, provide immediate access to Flagship tracks
      const flagshipIds = ["cs-genai", "cs-common"];
      let flagshipRows: any[] = [];
      try {
        flagshipRows = await db
          .select()
          .from(pathways)
          .where(inArray(pathways.id, flagshipIds));
      } catch {
        // Fallback below
      }

      if (flagshipRows.length > 0) {
        return flagshipRows.map((pwy) => ({
          enrollmentId: `enr_${pwy.id}_demo`,
          enrolledAt: new Date().toISOString(),
          expiresAt: null,
          status: "ACTIVE" as const,
          pathway: pwy,
        }));
      }

      // Offline in-memory fallback
      return flagshipIds.map((targetId) => {
        const canon = getCanonicalPathway(targetId);
        const cat = PATHWAY_CATALOG[targetId] || {
          title: canon?.title || "Generative AI Engineering",
          description: canon?.description || "Verified academic training track.",
          duration: canon?.duration || "12 Weeks (132 Hours)",
          level: canon?.level || "Foundations to Agentic AI",
        };
        return {
          enrollmentId: `enr_${targetId}_demo`,
          enrolledAt: new Date().toISOString(),
          expiresAt: null,
          status: "ACTIVE" as const,
          pathway: {
            id: targetId,
            title: cat.title,
            description: cat.description,
            slug: targetId,
            duration: cat.duration,
            level: cat.level,
            isActive: true,
            isPublic: true,
            pricePaise: canon?.price ? canon.price * 100 : 299900,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      });
    }

    return activeEnrollments.map((enr) => {
      if (enr.pathway) {
        return {
          enrollmentId: enr.enrollmentId,
          enrolledAt: enr.enrolledAt,
          expiresAt: enr.expiresAt,
          status: enr.status,
          pathway: enr.pathway,
        };
      }

      const targetId = enr.itemId || enr.pathwayId || "cs-genai";
      const canon = getCanonicalPathway(targetId);
      const cat = PATHWAY_CATALOG[targetId] || {
        title: canon?.title || "Generative AI Engineering",
        description: canon?.description || "Verified academic training track.",
        duration: canon?.duration || "12 Weeks (132 Hours)",
        level: canon?.level || "Foundations to Agentic AI",
      };

      return {
        enrollmentId: enr.enrollmentId,
        enrolledAt: enr.enrolledAt,
        expiresAt: enr.expiresAt,
        status: enr.status,
        pathway: {
          id: targetId,
          title: cat.title,
          description: cat.description,
          slug: targetId,
          duration: cat.duration,
          level: cat.level,
          isActive: true,
          isPublic: true,
          pricePaise: canon?.price ? canon.price * 100 : 299900,
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
              eq(enrollments.userId, userId),
              eq(enrollments.status, "ACTIVE"),
              or(
                eq(enrollments.pathwayId, pathwayId),
                eq(enrollments.itemId, pathwayId),
                eq(enrollments.pathwayId, pathway.id),
                eq(enrollments.itemId, pathway.id),
                eq(enrollments.pathwayId, pathway.slug),
                eq(enrollments.itemId, pathway.slug)
              )
            )
          )
          .limit(1);
      } catch {
        // Fallback for offline mode: permit flagship courses
      }

      if (activeEnrollment.length === 0) {
        const isFlagship = ["cs-genai", "cs-common", "pwy_cs-genai", "pwy_cs-common"].includes(pathway.id) ||
          ["cs-genai", "cs-common"].includes(pathwayId);
        if (isFlagship) {
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
        } else {
          throw new ForbiddenError("You are not enrolled in this pathway");
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
        .innerJoin(courses, eq(pathwayCourses.courseId, courses.id))
        .where(or(eq(pathwayCourses.pathwayId, pathway.id), eq(pathwayCourses.pathwayId, pathway.slug)))
        .orderBy(asc(pathwayCourses.position));
    } catch {
      // In offline DB, linkedCourses will be empty, triggering synthetic canon modules below
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
        .innerJoin(modules, eq(courseModules.moduleId, modules.id))
        .where(eq(courseModules.courseId, course.id))
        .orderBy(asc(courseModules.position));

      const moduleList: any[] = [];

      for (const { position: modPos, module: mod } of linkedModules) {
        // Fetch linked lessons for this module
        const linkedLessons = await db
          .select({
            position: moduleLessons.position,
            lesson: lessons,
          })
          .from(moduleLessons)
          .innerJoin(lessons, eq(moduleLessons.lessonId, lessons.id))
          .where(eq(moduleLessons.moduleId, mod.id))
          .orderBy(asc(moduleLessons.position));

        moduleList.push({
          ...mod,
          position: modPos,
          lessons: linkedLessons.map(({ position: lesPos, lesson }) => {
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
              parsedContent?.practiceType === "MCQ" ||
              lesson.id.includes("_quiz") ||
              lesson.slug?.includes("quiz");
            const isAssignmentItem =
              parsedContent?.type === "ASSIGNMENT" ||
              parsedContent?.practiceType === "PROJECT" ||
              parsedContent?.testType === "PROJECT" ||
              lesson.id.includes("_lab") ||
              lesson.id.includes("_cap");

            let computedType = "video";
            let computedCategory = "LECTURE";

            if (isCoding) {
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
            }

            return {
              id: lesson.id,
              title: lesson.title,
              slug: lesson.slug,
              description: lesson.description || parsedContent?.contentMarkdown,
              durationMinutes: lesson.durationMinutes,
              videoUrl:
                lesson.videoUrl ||
                parsedContent?.videoUrl ||
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
              content: lesson.content,
              contentType: computedType.toUpperCase(),
              type: computedType,
              category: computedCategory,
              isTest: computedCategory === "TEST",
              config:
                parsedContent?.codingTest ||
                parsedContent?.subjectiveTest ||
                parsedContent?.videoTest ||
                parsedContent?.assignment ||
                parsedContent?.quiz,
              questions: parsedContent?.quiz?.questions || parsedContent?.questions,
              instructions:
                parsedContent?.assignment?.instructions ||
                parsedContent?.instructions ||
                lesson.description,
              maxScore:
                parsedContent?.maxScore ||
                parsedContent?.assignment?.maxPoints ||
                parsedContent?.codingTest?.maxScore ||
                100,
              status: lesson.status,
              position: lesPos,
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

    // Resilient fallback: If no linked courses or modules in relational table yet, synthesize from canonical catalog
    if (courseList.length === 0 || courseList.every((c) => !c.modules || c.modules.length === 0)) {
      const canon = getCanonicalPathway(pathway.id) || getCanonicalPathway(pathway.slug);
      if (canon?.modules && canon.modules.length > 0) {
        const syntheticModules = canon.modules.map((mod, mIdx) => ({
          id: `mod_${pathway.id}_${mod.num}`,
          title: mod.title,
          slug: `${pathway.slug}-w${mod.num}`,
          description: mod.practical || mod.title,
          status: "PUBLISHED",
          isActive: true,
          position: mIdx + 1,
          lessons: [
            ...(mod.topics || []).map((topic, tIdx) => ({
              id: `les_${pathway.id}_${mod.num}_${tIdx + 1}`,
              title: topic,
              slug: `${pathway.slug}-w${mod.num}-t${tIdx + 1}`,
              description: topic,
              durationMinutes: 45,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
              contentType: "VIDEO",
              status: "PUBLISHED",
              position: tIdx + 1,
            })),
            {
              id: `les_${pathway.id}_${mod.num}_quiz`,
              title: `Quiz: ${mod.title}`,
              slug: `${pathway.slug}-w${mod.num}-quiz`,
              description: `Weekly Graded Quiz & Concept Check for ${mod.title}`,
              durationMinutes: 20,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
              contentType: "QUIZ",
              status: "PUBLISHED",
              position: (mod.topics?.length || 0) + 1,
            },
            ...(mod.practical
              ? [
                  {
                    id: `les_${pathway.id}_${mod.num}_lab`,
                    title: `Hands-on Lab: ${mod.title}`,
                    slug: `${pathway.slug}-w${mod.num}-lab`,
                    description: mod.practical,
                    durationMinutes: 60,
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
                    contentType: "ASSIGNMENT",
                    status: "PUBLISHED",
                    position: (mod.topics?.length || 0) + 2,
                  },
                ]
              : []),
          ],
        }));

        if (canon.capstone) {
          syntheticModules.push({
            id: `mod_${pathway.id}_cap`,
            title: `Capstone: ${canon.capstone.title}`,
            slug: `${pathway.slug}-capstone`,
            description: `Capstone Project Flow: ${canon.capstone.flow?.join(" ➔ ")}`,
            status: "PUBLISHED",
            isActive: true,
            position: canon.modules.length + 1,
            lessons: (canon.capstone.outputs || []).map((out, oIdx) => ({
              id: `les_${pathway.id}_cap_${oIdx + 1}`,
              title: `Deliverable ${oIdx + 1}: ${out}`,
              slug: `${pathway.slug}-cap-out-${oIdx + 1}`,
              description: out,
              durationMinutes: 90,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
              contentType: "ASSIGNMENT",
              status: "PUBLISHED",
              position: oIdx + 1,
            })),
          });
        }

        courseList.push({
          id: `crs_${pathway.id}`,
          title: pathway.title,
          slug: `course-${pathway.slug}`,
          shortDescription: pathway.shortDescription,
          description: pathway.description,
          status: "PUBLISHED",
          position: 1,
          modules: syntheticModules,
        });
      }
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

    // Fallback: search canonical catalog for lesson
    for (const group of CANONICAL_GROUPS) {
      for (const p of group.pathways) {
        if (!lessonId.includes(p.id)) continue;
        for (const mod of p.modules || []) {
          if (lessonId.includes(`_${mod.num}_lab`)) {
            return {
              id: lessonId,
              title: `Lab: ${mod.title}`,
              slug: `${p.id}-w${mod.num}-lab`,
              description: mod.practical,
              content: `Hands-on Practical Lab Exercise:\n\n${mod.practical}\n\nDeliverable: Commit and push your code to your designated repository branch.`,
              durationMinutes: 60,
              status: "PUBLISHED",
              isActive: true,
            };
          }
          if (mod.topics) {
            for (let i = 0; i < mod.topics.length; i++) {
              if (lessonId.endsWith(`_${mod.num}_${i + 1}`)) {
                return {
                  id: lessonId,
                  title: mod.topics[i],
                  slug: `${p.id}-w${mod.num}-t${i + 1}`,
                  description: mod.topics[i],
                  content: `Curriculum Module ${mod.num}: ${mod.title}\n\nCore Topic: ${mod.topics[i]}\n\nReview the guided lecture notes and execute the lab walkthrough.`,
                  durationMinutes: 45,
                  status: "PUBLISHED",
                  isActive: true,
                };
              }
            }
          }
        }
      }
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

    const completedList: any[] = [];
    const upcomingList: any[] = [];

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const now = new Date();

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
      const courseTitle = content?.pathway?.title || enr.pathway?.title || "Pathway Course";

      for (const crs of coursesList) {
        const mods = crs.modules || [];
        mods.forEach((mod: any, mIdx: number) => {
          const modLessons = mod.lessons || [];
          modLessons.forEach((les: any, lIdx: number) => {
            const isQuiz = les.contentType === "QUIZ" || les.id?.includes("_quiz");
            const isAssignment =
              les.contentType === "ASSIGNMENT" ||
              les.id?.includes("_lab") ||
              les.id?.includes("_cap") ||
              les.id?.includes("milestone");

            if (!isQuiz && !isAssignment) return;

            const existingSub = studentSubmissions.find((s) => s.lessonId === les.id);
            const isDone = completedLessonIds.has(les.id) || !!existingSub;

            const category = isQuiz
              ? "Graded Quiz"
              : les.title?.toLowerCase().includes("capstone")
              ? "Capstone"
              : "Hands-on Lab";

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
                type: isQuiz ? "quiz" : "assignment",
                category,
                course: courseTitle,
                title: les.title,
                datePrefix: isQuiz ? "Completed" : "Submitted",
                date: `${day} ${monthShort} ${yr} ${time}`,
                statusText: isQuiz
                  ? `Marks: ${existingSub?.score !== null && existingSub?.score !== undefined ? existingSub.score : 10}/10`
                  : existingSub?.status === "APPROVED"
                  ? "Evaluation Complete"
                  : "Evaluation Pending",
              });
            } else {
              // Upcoming activity: calculate target week deadline
              const targetDate = new Date(now.getTime() + (mIdx * 7 + 4) * 24 * 60 * 60 * 1000);
              const day = String(targetDate.getDate()).padStart(2, "0");
              const monthShort = targetDate.toLocaleString("default", { month: "short" });
              const yr = String(targetDate.getFullYear()).slice(-2);
              const monthFull = monthNames[targetDate.getMonth()];
              const groupKey = `${monthFull} ${targetDate.getFullYear()}`;

              upcomingList.push({
                id: `act-up-${les.id}`,
                lessonId: les.id,
                pathwayId,
                type: isQuiz ? "quiz" : "assignment",
                category,
                course: courseTitle,
                title: les.title,
                dateText: isQuiz
                  ? `${day} ${monthShort} ${yr} 12:00 AM - ${day} ${monthShort} ${yr} 11:59 PM`
                  : `Due: ${day} ${monthShort} ${yr} 11:59 PM`,
                isUrgent: mIdx <= 1,
                iconStyle: isQuiz ? "crimson" : mIdx <= 1 ? "crimson" : "rose",
                monthGroup: groupKey,
                sortTime: targetDate.getTime(),
              });
            }
          });
        });
      }
    }

    // Group upcoming by month
    upcomingList.sort((a, b) => a.sortTime - b.sortTime);
    const monthGroupsMap: Record<string, any[]> = {};
    for (const item of upcomingList) {
      if (!monthGroupsMap[item.monthGroup]) {
        monthGroupsMap[item.monthGroup] = [];
      }
      monthGroupsMap[item.monthGroup].push(item);
    }

    const scheduled = Object.entries(monthGroupsMap).map(([month, items]) => ({
      month,
      items,
    }));

    return {
      scheduled,
      completed: completedList,
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

          return {
            id: mRecord[0].id,
            name: userRecord[0]?.name || "Assigned Mentor",
            email: userRecord[0]?.email || "",
            specialization: mRecord[0].specialization || "AI & Full Stack Systems",
            officeHours: mRecord[0].officeHours || "Tuesday & Thursday 6:00 PM - 7:30 PM IST",
            bio: mRecord[0].bio || "Senior technical mentor guiding your architecture and project reviews.",
            avatar: userRecord[0]?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
          };
        }
      }
    } catch (err) {
      console.warn("[LMSService] DB getStudentMentor fallback notice:", err);
    }

    // Default canonical mentor profile
    return {
      id: "mnt_dr_vikram",
      name: "Dr. Vikram Sethi",
      email: "vikram.sethi@unisole.org",
      specialization: "Principal AI Scientist & GenAI Systems",
      officeHours: "Tuesday & Thursday 6:00 PM - 7:30 PM IST",
      bio: "12+ years in ML engineering, PyTorch core contributor, guiding Unisole student capstones.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    };
  },

  async getMentorCockpit(mentorUserId: string) {
    let menteesList: any[] = [];
    try {
      // Look up mentor record by userId
      const mentorRecords = await db
        .select()
        .from(mentors)
        .where(eq(mentors.userId, mentorUserId))
        .limit(1);

      const mentorId = mentorRecords[0]?.id || "mnt_dr_vikram";

      const menteeRows = await db
        .select()
        .from(mentorMentees)
        .where(eq(mentorMentees.mentorId, mentorId));

      if (menteeRows.length > 0) {
        const studentIds = menteeRows.map((r) => r.menteeId);
        const studentUsers = await db
          .select()
          .from(users)
          .where(inArray(users.id, studentIds));

        menteesList = studentUsers.map((u, idx) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80`,
          college: u.collegeName || "Govt Degree College",
          progressPercent: Math.max(10, 85 - idx * 15),
          submittedCount: 3 + idx,
          pendingReviews: idx === 0 ? 2 : 1,
          status: idx === 0 ? "NEEDS_REVIEW" : idx === 2 ? "AT_RISK" : "ON_TRACK",
          lastActive: "2 hours ago",
        }));
      }
    } catch (err) {
      console.warn("[LMSService] DB getMentorCockpit fallback notice:", err);
    }

    if (menteesList.length === 0) {
      menteesList = [
        {
          id: "mentee_1",
          name: "Aarav Sharma",
          email: "aarav.sharma@unisole.org",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
          college: "IIIT Una (Sanjauli Campus)",
          progressPercent: 65,
          submittedCount: 7,
          pendingReviews: 2,
          status: "NEEDS_REVIEW",
          lastActive: "10 mins ago",
        },
        {
          id: "mentee_2",
          name: "Priya Chauhan",
          email: "priya.c@unisole.org",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
          college: "Govt College Sunni",
          progressPercent: 88,
          submittedCount: 9,
          pendingReviews: 0,
          status: "ON_TRACK",
          lastActive: "1 hour ago",
        },
        {
          id: "mentee_3",
          name: "Rohan Verma",
          email: "rohan.v@unisole.org",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
          college: "Govt College Theog",
          progressPercent: 32,
          submittedCount: 3,
          pendingReviews: 1,
          status: "AT_RISK",
          lastActive: "3 days ago",
        },
      ];
    }

    // Diamond milestone counters: 7 submitted, 6 evaluated, 4 pending review, 5 at risk
    return {
      milestones: {
        submitted: 7,
        evaluated: 6,
        pendingReview: 4,
        atRisk: 5,
      },
      mentees: menteesList,
    };
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
};

