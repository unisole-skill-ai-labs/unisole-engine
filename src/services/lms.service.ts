import { eq, and, inArray, asc } from "drizzle-orm";
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

export const lmsService = {
  /**
   * Get all pathways that the student has an ACTIVE enrollment in.
   */
  async getAccessiblePathways(userId: string) {
    const activeEnrollments = await db
      .select({
        enrollmentId: enrollments.id,
        enrolledAt: enrollments.enrolledAt,
        expiresAt: enrollments.expiresAt,
        status: enrollments.status,
        pathway: pathways,
      })
      .from(enrollments)
      .innerJoin(pathways, eq(enrollments.pathwayId, pathways.id))
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.status, "ACTIVE")
        )
      );

    return activeEnrollments;
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
