/**
 * Script to clean all dummy/old curriculum (modules, module_lessons, lessons, course_modules)
 * from any target database (local, staging, or production).
 *
 * Usage:
 *   $env:DATABASE_URL="<your_staging_db_connection_string>"; npx ts-node src/scripts/clean-staging-curriculum.ts
 */

import { pool } from "../db";

async function cleanCurriculum() {
  console.log("🧹 Starting curriculum database cleanup...");
  console.log("Target DB:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@") || "default pool");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Delete junction tables
    const mlRes = await client.query("DELETE FROM module_lessons");
    console.log(`✓ Deleted ${mlRes.rowCount} rows from module_lessons`);

    const cmRes = await client.query("DELETE FROM course_modules");
    console.log(`✓ Deleted ${cmRes.rowCount} rows from course_modules`);

    // 2. Delete lessons
    const lesRes = await client.query("DELETE FROM lessons");
    console.log(`✓ Deleted ${lesRes.rowCount} rows from lessons`);

    // 3. Delete modules
    const modRes = await client.query("DELETE FROM modules");
    console.log(`✓ Deleted ${modRes.rowCount} rows from modules`);

    await client.query("COMMIT");
    console.log("🎉 Curriculum cleanup completed successfully! All courses are now clean slates.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Cleanup failed, transaction rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanCurriculum();
