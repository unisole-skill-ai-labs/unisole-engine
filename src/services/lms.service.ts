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
      const canon = getCanonicalPathway(targetId);
      const cat = PATHWAY_CATALOG[targetId] || {
        title: canon?.title || "Unisole Career Skill Pathway",
        description: canon?.description || "Verified academic training track.",
        duration: canon?.duration || "3 Months",
        level: canon?.level || "All Learners",
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
    const pathwayRows = await db
      .select()
      .from(pathways)
      .where(or(eq(pathways.id, pathwayId), eq(pathways.slug, pathwayId)))
      .limit(1);

    if (pathwayRows.length === 0) {
      throw new NotFoundError("Pathway not found");
    }

    const pathway = pathwayRows[0];

    if (!isAdmin) {
      const activeEnrollment = await db
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

      if (activeEnrollment.length === 0) {
        throw new ForbiddenError("You are not enrolled in this pathway");
      }
    }

    // Fetch linked courses
    const linkedCourses = await db
      .select({
        position: pathwayCourses.position,
        course: courses,
      })
      .from(pathwayCourses)
      .innerJoin(courses, eq(pathwayCourses.courseId, courses.id))
      .where(or(eq(pathwayCourses.pathwayId, pathway.id), eq(pathwayCourses.pathwayId, pathway.slug)))
      .orderBy(asc(pathwayCourses.position));

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
              status: "PUBLISHED",
              position: tIdx + 1,
            })),
            ...(mod.practical
              ? [
                  {
                    id: `les_${pathway.id}_${mod.num}_lab`,
                    title: `Lab: ${mod.title}`,
                    slug: `${pathway.slug}-w${mod.num}-lab`,
                    description: mod.practical,
                    durationMinutes: 60,
                    status: "PUBLISHED",
                    position: (mod.topics?.length || 0) + 1,
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
};

