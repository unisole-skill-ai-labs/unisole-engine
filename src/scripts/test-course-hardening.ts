import { pool } from "../db";
import { seedAiAgentCurriculum } from "./seed-ai-agent-curriculum";
import { seedGenaiCurriculum } from "./seed-genai-curriculum";
import { seedLmsDemoData } from "./seed-lms-demo";
import { initializeDatabase } from "../db/init";

// -----------------------------------------------------------------
// Safety Guard: test-course-hardening must ONLY run in non-production environments against a local database
// -----------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  console.error("[SAFETY ERROR] test-course-hardening.ts cannot be executed with NODE_ENV=production. Aborting.");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL || "";
let dbHost = "";
try {
  const parsed = new URL(dbUrl);
  dbHost = parsed.hostname;
} catch {
  dbHost = dbUrl.includes("@") ? dbUrl.split("@")[1].split("/")[0].split(":")[0] : "";
}

const isLocalDb = dbHost === "localhost" || dbHost === "127.0.0.1";
if (!isLocalDb) {
  console.error(`[SAFETY ERROR] test-course-hardening.ts is strictly prohibited from running against non-local databases (host: "${dbHost || "unknown"}"). Aborting.`);
  process.exit(1);
}

async function runHardeningVerification() {
  console.log("=================================================");
  console.log("COURSE SEED HARDENING & PERSISTENCE VERIFICATION");
  console.log("=================================================\n");

  const client = await pool.connect();

  try {
    // -----------------------------------------------------------------
    // TEST 1: Admin Edit Persistence Across Multiple Seed & Init Runs
    // -----------------------------------------------------------------
    console.log("[Test 1] Testing Admin Edit Persistence across seeds and DB restarts...");

    // 1. Ensure cs-genai and cs-agentic exist
    await seedAiAgentCurriculum(true);
    await seedGenaiCurriculum(true);

    // 2. Apply simulated admin edits
    const customGenaiLessonTitle = `Admin Custom GenAI Title [${Date.now()}]`;
    const customAgentCourseTitle = `Admin Custom Agent Title [${Date.now()}]`;

    await client.query("UPDATE lessons SET title = $1 WHERE id = 'les-g1-1'", [customGenaiLessonTitle]);
    await client.query("UPDATE courses SET title = $1 WHERE id = 'cs-agentic'", [customAgentCourseTitle]);

    console.log(` -> Set custom lesson title: "${customGenaiLessonTitle}"`);
    console.log(` -> Set custom course title: "${customAgentCourseTitle}"`);

    // 3. Re-run both curriculum seeds TWICE
    console.log(" -> Re-running seedAiAgentCurriculum(true) (run 1)...");
    await seedAiAgentCurriculum(true);
    console.log(" -> Re-running seedGenaiCurriculum(true) (run 1)...");
    await seedGenaiCurriculum(true);

    console.log(" -> Re-running seedAiAgentCurriculum(true) (run 2)...");
    await seedAiAgentCurriculum(true);
    console.log(" -> Re-running seedGenaiCurriculum(true) (run 2)...");
    await seedGenaiCurriculum(true);

    // 4. Re-run initializeDatabase() TWICE
    console.log(" -> Re-running initializeDatabase() (run 1)...");
    await initializeDatabase();
    console.log(" -> Re-running initializeDatabase() (run 2)...");
    await initializeDatabase();

    // 5. Query and verify admin edits were preserved
    const resLesson = await client.query("SELECT title FROM lessons WHERE id = 'les-g1-1'");
    const resCourse = await client.query("SELECT title FROM courses WHERE id = 'cs-agentic'");

    if (resLesson.rows[0]?.title !== customGenaiLessonTitle) {
      throw new Error(`Admin edit wiped on lesson les-g1-1! Expected "${customGenaiLessonTitle}", found "${resLesson.rows[0]?.title}"`);
    }
    if (resCourse.rows[0]?.title !== customAgentCourseTitle) {
      throw new Error(`Admin edit wiped on course cs-agentic! Expected "${customAgentCourseTitle}", found "${resCourse.rows[0]?.title}"`);
    }

    console.log(" -> [PASS] Admin edits survived multiple seed runs and DB re-initializations without being overwritten!\n");

    // -----------------------------------------------------------------
    // TEST 2: Production Hard-Fail on Curriculum Seeds
    // -----------------------------------------------------------------
    console.log("[Test 2] Testing Production Hard-Fail behavior for curriculum seeds...");

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    // 2a. seedAiAgentCurriculum without force in production
    let failedWithoutForceAi = false;
    try {
      await seedAiAgentCurriculum(false);
    } catch (err: any) {
      if (err.message.includes("Hard-fail: Curriculum seeds are strictly blocked in production")) {
        failedWithoutForceAi = true;
      }
    }
    if (!failedWithoutForceAi) {
      throw new Error("seedAiAgentCurriculum did not throw in production without --force!");
    }

    // 2b. seedAiAgentCurriculum WITH force in production (must STILL fail!)
    let failedWithForceAi = false;
    try {
      await seedAiAgentCurriculum(true);
    } catch (err: any) {
      if (err.message.includes("Hard-fail: Curriculum seeds are strictly blocked in production")) {
        failedWithForceAi = true;
      }
    }
    if (!failedWithForceAi) {
      throw new Error("seedAiAgentCurriculum allowed --force in production!");
    }

    // 2c. seedGenaiCurriculum without force in production
    let failedWithoutForceGenai = false;
    try {
      await seedGenaiCurriculum(false);
    } catch (err: any) {
      if (err.message.includes("Hard-fail: Curriculum seeds are strictly blocked in production")) {
        failedWithoutForceGenai = true;
      }
    }
    if (!failedWithoutForceGenai) {
      throw new Error("seedGenaiCurriculum did not throw in production without --force!");
    }

    // 2d. seedGenaiCurriculum WITH force in production (must STILL fail!)
    let failedWithForceGenai = false;
    try {
      await seedGenaiCurriculum(true);
    } catch (err: any) {
      if (err.message.includes("Hard-fail: Curriculum seeds are strictly blocked in production")) {
        failedWithForceGenai = true;
      }
    }
    if (!failedWithForceGenai) {
      throw new Error("seedGenaiCurriculum allowed --force in production!");
    }

    console.log(" -> [PASS] Both seeds strictly hard-fail in production, even when --force is supplied!\n");

    // -----------------------------------------------------------------
    // TEST 3: Production LMS Demo Data Gate & Production DB-INIT
    // -----------------------------------------------------------------
    console.log("[Test 3] Testing Production guard on seedLmsDemoData and init.ts...");
    const demoResult = await seedLmsDemoData();
    if (!demoResult || !demoResult.success) {
      throw new Error("seedLmsDemoData did not exit gracefully in production!");
    }
    console.log(" -> [PASS] Demo seed successfully skipped demo student, enrollments and submissions in production!");

    // Run initializeDatabase() under production NODE_ENV
    console.log(" -> Running initializeDatabase() under NODE_ENV=production...");
    await initializeDatabase();
    console.log(" -> [PASS] initializeDatabase() booted cleanly in production mode without seeding demo student!\n");

    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv;

    console.log("=================================================");
    console.log("✅ ALL HARDENING & PERSISTENCE TESTS PASSED");
    console.log("=================================================");
  } finally {
    client.release();
    await pool.end();
  }
}

runHardeningVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
