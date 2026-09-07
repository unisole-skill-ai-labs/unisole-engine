import { eq, and, or, inArray, asc } from "drizzle-orm";
import { db } from "../db";
import {
  enrollments,
  pathways,
  courses,
  pathwayCourses,
  modules,
  courseModules,
  lessons,
  moduleLessons,
  Pathway,
  Lesson,
} from "../db/schema";
import { ForbiddenError, NotFoundError } from "../errors";

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

export const lmsService = {
  /**
   * Get all pathways that the student has an ACTIVE enrollment in.
   */
  async getAccessiblePathways(userId: string) {
    const activeEnrollments = await db
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
          eq(enrollments.itemId, pathways.id)
        )
      )
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.status, "ACTIVE")
        )
      );

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

      const targetId = enr.itemId || enr.pathwayId || "cs-p1";
      const cat = PATHWAY_CATALOG[targetId] || {
        title: "Unisole Career Skill Pathway",
        description: "Verified academic training track.",
        duration: "3 Months",
        level: "All Learners",
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
    if (!isAdmin) {
      const activeEnrollment = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.userId, userId),
            eq(enrollments.pathwayId, pathwayId),
            eq(enrollments.status, "ACTIVE")
          )
        )
        .limit(1);

      if (activeEnrollment.length === 0) {
        throw new ForbiddenError("You are not enrolled in this pathway");
      }
    }

    const pathwayRows = await db
      .select()
      .from(pathways)
      .where(eq(pathways.id, pathwayId))
      .limit(1);

    if (pathwayRows.length === 0) {
      throw new NotFoundError("Pathway not found");
    }

    const pathway = pathwayRows[0];

    // Fetch linked courses
    const linkedCourses = await db
      .select({
        position: pathwayCourses.position,
        course: courses,
      })
      .from(pathwayCourses)
      .innerJoin(courses, eq(pathwayCourses.courseId, courses.id))
      .where(eq(pathwayCourses.pathwayId, pathwayId))
      .orderBy(asc(pathwayCourses.position));

    const courseList = [];

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

      const moduleList = [];

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
          lessons: linkedLessons.map(({ position: lesPos, lesson }) => ({
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            durationMinutes: lesson.durationMinutes,
            status: lesson.status,
            position: lesPos,
          })),
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
  async getLessonContent(userId: string, lessonId: string, isAdmin = false): Promise<Lesson> {
    const lessonRows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (lessonRows.length === 0) {
      throw new NotFoundError("Lesson not found");
    }

    const lesson = lessonRows[0];

    if (isAdmin) {
      return lesson;
    }

    // Access check: User -> Enrollment -> Pathway -> Course -> Module -> Lesson (PRD §37)
    // Find all pathways containing this lesson
    const accessiblePathways = await db
      .select({ pathwayId: pathwayCourses.pathwayId })
      .from(moduleLessons)
      .innerJoin(courseModules, eq(moduleLessons.moduleId, courseModules.moduleId))
      .innerJoin(pathwayCourses, eq(courseModules.courseId, pathwayCourses.courseId))
      .where(eq(moduleLessons.lessonId, lessonId));

    const pathwayIds = Array.from(new Set(accessiblePathways.map((p) => p.pathwayId)));

    if (pathwayIds.length === 0) {
      throw new ForbiddenError("Lesson is not part of any published pathway");
    }

    // Check if user has active enrollment in any of these pathways
    const userEnrollments = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.status, "ACTIVE"),
          inArray(enrollments.pathwayId, pathwayIds)
        )
      )
      .limit(1);

    if (userEnrollments.length === 0) {
      throw new ForbiddenError("You do not have access to this lesson. Please enroll in the relevant pathway.");
    }

    return lesson;
  },
};
