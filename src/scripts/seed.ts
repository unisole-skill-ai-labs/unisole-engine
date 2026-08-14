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

      await tx.insert(users).values({
        name: "Admin User",
        email: "admin@unisole.test",
        phone: "0000000000",
        password_hash: "placeholder-hash-1",
        role: "admin",
        auth_provider: "local",
        is_verified: true,
      });

      const studentRows = await tx
        .insert(users)
        .values([
          {
            name: "John Doe",
            email: "john@unisole.test",
            phone: "1111111111",
            password_hash: "placeholder-hash-2",
            role: "student",
            auth_provider: "local",
            is_verified: true,
          },
          {
            name: "Jane Smith",
            email: "jane@unisole.test",
            phone: "2222222222",
            password_hash: "placeholder-hash-3",
            role: "student",
            auth_provider: "local",
            is_verified: true,
          },
        ])
        .returning({ id: users.id });
      const studentIds = studentRows.map((r) => r.id);

      const [web] = await tx
        .insert(categories)
        .values({ name: "Web Development" })
        .returning({ id: categories.id });
      const [design] = await tx
        .insert(categories)
        .values({ name: "Design" })
        .returning({ id: categories.id });

      const courseRows = await tx
        .insert(courses)
        .values([
          {
            title: "Complete TypeScript Bootcamp",
            slug: "complete-typescript-bootcamp",
            category_id: web.id,
            price: "49.99",
            rating_avg: "4.5",
            total_enrollments: 120,
          },
          {
            title: "Modern React with Hooks",
            slug: "modern-react-hooks",
            category_id: web.id,
            price: "39.99",
            rating_avg: "4.5",
            total_enrollments: 120,
          },
          {
            title: "UI Design Fundamentals",
            slug: "ui-design-fundamentals",
            category_id: design.id,
            price: "29.99",
            rating_avg: "4.5",
            total_enrollments: 120,
          },
        ])
        .returning({ id: courses.id });
      const courseIds = courseRows.map((r) => r.id);

      const moduleRows = await tx
        .insert(modules)
        .values([
          { title: "Getting Started", order_index: 0 },
          { title: "TypeScript Basics", order_index: 1 },
          { title: "Advanced Types", order_index: 2 },
          { title: "React Essentials", order_index: 0 },
          { title: "Color Theory", order_index: 0 },
        ])
        .returning({ id: modules.id });
      const moduleIds = moduleRows.map((r) => r.id);

      const itemRows = await tx
        .insert(moduleItems)
        .values([
          {
            title: "Welcome Video",
            type: "video",
            content_url: "https://cdn.unisole.test/welcome.mp4",
            order_index: 0,
          },
          {
            title: "Course Syllabus",
            type: "pdf",
            content_url: "https://cdn.unisole.test/syllabus.pdf",
            order_index: 1,
          },
          {
            title: "Intro to Types",
            type: "article",
            content_url: "https://unisole.test/lessons/types-intro",
            order_index: 0,
          },
          {
            title: "Types Quiz",
            type: "quiz",
            content_url: null,
            order_index: 1,
          },
          {
            title: "Build a To-Do App",
            type: "assignment",
            content_url: null,
            order_index: 2,
          },
          {
            title: "Color Wheel Video",
            type: "video",
            content_url: "https://cdn.unisole.test/color-wheel.mp4",
            order_index: 0,
          },
        ])
        .returning({ id: moduleItems.id });
      const itemIds = itemRows.map((r) => r.id);

      await tx.insert(courseModules).values([
        { course_id: courseIds[0], module_id: moduleIds[0], order_index: 0 },
        { course_id: courseIds[0], module_id: moduleIds[1], order_index: 1 },
        { course_id: courseIds[0], module_id: moduleIds[2], order_index: 2 },
        { course_id: courseIds[1], module_id: moduleIds[0], order_index: 0 },
        { course_id: courseIds[1], module_id: moduleIds[3], order_index: 1 },
        { course_id: courseIds[2], module_id: moduleIds[4], order_index: 0 },
      ]);

      await tx.insert(moduleLessons).values([
        { module_id: moduleIds[0], module_item_id: itemIds[0], order_index: 0 },
        { module_id: moduleIds[0], module_item_id: itemIds[1], order_index: 1 },
        { module_id: moduleIds[1], module_item_id: itemIds[2], order_index: 0 },
        { module_id: moduleIds[1], module_item_id: itemIds[3], order_index: 1 },
        { module_id: moduleIds[1], module_item_id: itemIds[4], order_index: 2 },
        { module_id: moduleIds[3], module_item_id: itemIds[0], order_index: 0 },
        { module_id: moduleIds[4], module_item_id: itemIds[5], order_index: 0 },
      ]);

      const [assignment] = await tx
        .insert(assignments)
        .values({
          lesson_id: itemIds[4],
          title: "To-Do App Assignment",
          max_score: 100,
          allowed_attempts: 3,
        })
        .returning({ id: assignments.id });

      await tx.insert(assignmentSubmissions).values(
        studentIds.map((userId) => ({
          assignment_id: assignment.id,
          user_id: userId,
          file_url: "https://cdn.unisole.test/submissions/todo-app.zip",
          status: "pending" as const,
        }))
      );

      await tx.insert(quizzes).values({
        moduel_item_id: itemIds[3],
        title: "Intro to Types Quiz",
        duration_min: 10,
        total_marks: 20,
        passing_marks: 12,
        max_attempts: 2,
      });
    });

    console.log("Seed data inserted successfully.");
    console.log(
      "Users: 3, Categories: 2, Courses: 3, Modules: 5, Lessons: 6, CourseLinks: 6, LessonLinks: 7, Assignments: 1, Submissions: 2, Quizzes: 1"
    );
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
