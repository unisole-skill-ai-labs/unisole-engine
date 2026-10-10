import { db, pool } from "../db";
import {
  courseModules,
  moduleLessons,
  lessons,
  modules,
  lessonProgress,
  submissions,
  notes,
} from "../db/schema";
import { sql } from "drizzle-orm";

async function clearDummyCurriculum() {
  console.log("=== CLEARING DUMMY MODULES & LESSONS FROM DB ===");

  try {
    // 1. Clear relations first to prevent foreign key issues
    const delCourseModules = await db.delete(courseModules);
    console.log("✓ Cleared courseModules relations");

    const delModuleLessons = await db.delete(moduleLessons);
    console.log("✓ Cleared moduleLessons relations");

    // 2. Clear progress, submissions, notes referencing old lessons if any
    try {
      await db.delete(lessonProgress);
      console.log("✓ Cleared lessonProgress records");
    } catch (e: any) {
      console.log("Note on lessonProgress:", e?.message);
    }

    try {
      await db.delete(notes);
      console.log("✓ Cleared old notes");
    } catch (e: any) {
      console.log("Note on notes:", e?.message);
    }

    // 3. Clear lessons
    const delLessons = await db.delete(lessons);
    console.log("✓ Cleared all lessons from database");

    // 4. Clear modules
    const delModules = await db.delete(modules);
    console.log("✓ Cleared all modules from database");

    console.log("\n=== DUMMY CURRICULUM DATA COMPLETELY REMOVED! ===");
    console.log("The Course Studio outline is now clean and empty for you to manually author your chapters and lessons.");
  } catch (err: any) {
    console.error("Error clearing curriculum:", err);
  } finally {
    await pool.end();
  }
}

clearDummyCurriculum();
