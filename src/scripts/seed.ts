import { db, pool } from "../db";
import {
  assignmentSubmissions,
  assignments,
  categories,
  courseModules,
  courses,
  moduleItems,
  moduleLessons,
  modules,
  quizzes,
  users,
} from "../db/schema";
import {
  seedAssignmentSubmissions,
  seedAssignments,
  seedCategories,
  seedCourseModules,
  seedCourses,
  seedModuleItems,
  seedModuleLessons,
  seedModules,
  seedQuizzes,
  seedUsers,
} from "../config/seed-data";

async function seed() {
  try {
    await db.transaction(async (tx) => {
      for (const table of [
        assignmentSubmissions,
        assignments,
        quizzes,
        moduleLessons,
        courseModules,
        moduleItems,
        modules,
        courses,
        categories,
        users,
      ]) {
        await tx.delete(table);
      }

      const userIds = new Map<string, string>();
      for (const { key, ...data } of seedUsers) {
        const [row] = await tx
          .insert(users)
          .values(data)
          .returning({ id: users.id });
        userIds.set(key, row.id);
      }

      const categoryIds = new Map<string, string>();
      for (const { key, ...data } of seedCategories) {
        const [row] = await tx
          .insert(categories)
          .values(data)
          .returning({ id: categories.id });
        categoryIds.set(key, row.id);
      }

      const courseIds = new Map<string, string>();
      for (const course of seedCourses) {
        const [row] = await tx
          .insert(courses)
          .values({
            title: course.title,
            slug: course.slug,
            category_id: categoryIds.get(course.categoryKey),
            price: course.price,
            rating_avg: course.rating_avg,
            total_enrollments: course.total_enrollments,
          })
          .returning({ id: courses.id });
        courseIds.set(course.key, row.id);
      }

      const moduleIds = new Map<string, string>();
      for (const { key, ...data } of seedModules) {
        const [row] = await tx
          .insert(modules)
          .values(data)
          .returning({ id: modules.id });
        moduleIds.set(key, row.id);
      }

      const itemIds = new Map<string, string>();
      for (const item of seedModuleItems) {
        const [row] = await tx
          .insert(moduleItems)
          .values({
            title: item.title,
            type: item.type,
            content_url: item.content_url,
            order_index: item.order_index,
          })
          .returning({ id: moduleItems.id });
        itemIds.set(item.key, row.id);
      }

      await tx.insert(courseModules).values(
        seedCourseModules.map((link) => ({
          course_id: courseIds.get(link.courseKey)!,
          module_id: moduleIds.get(link.moduleKey)!,
          order_index: link.order_index,
        }))
      );

      await tx.insert(moduleLessons).values(
        seedModuleLessons.map((link) => ({
          module_id: moduleIds.get(link.moduleKey)!,
          module_item_id: itemIds.get(link.itemKey)!,
          order_index: link.order_index,
        }))
      );

      const assignmentIds = new Map<string, string>();
      for (const assignment of seedAssignments) {
        const [row] = await tx
          .insert(assignments)
          .values({
            lesson_id: itemIds.get(assignment.lessonItemKey),
            title: assignment.title,
            max_score: assignment.max_score,
            allowed_attempts: assignment.allowed_attempts,
          })
          .returning({ id: assignments.id });
        assignmentIds.set(assignment.key, row.id);
      }

      await tx.insert(assignmentSubmissions).values(
        seedAssignmentSubmissions.map((submission) => ({
          assignment_id: assignmentIds.get(submission.assignmentKey)!,
          user_id: userIds.get(submission.userKey)!,
          file_url: submission.file_url,
          status: submission.status,
        }))
      );

      for (const quiz of seedQuizzes) {
        await tx.insert(quizzes).values({
          moduel_item_id: itemIds.get(quiz.moduleItemKey),
          title: quiz.title,
          duration_min: quiz.duration_min,
          total_marks: quiz.total_marks,
          passing_marks: quiz.passing_marks,
          max_attempts: quiz.max_attempts,
        });
      }
    });

    console.log("Seed data inserted successfully.");
    console.log(
      `Users: ${seedUsers.length}, Categories: ${seedCategories.length}, Courses: ${seedCourses.length}, Modules: ${seedModules.length}, Lessons: ${seedModuleItems.length}, CourseLinks: ${seedCourseModules.length}, LessonLinks: ${seedModuleLessons.length}, Assignments: ${seedAssignments.length}, Submissions: ${seedAssignmentSubmissions.length}, Quizzes: ${seedQuizzes.length}`
    );
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
