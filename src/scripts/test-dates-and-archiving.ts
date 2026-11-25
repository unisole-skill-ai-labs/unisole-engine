import "dotenv/config";
import { db } from "../db";
import { lessonsService } from "../services/lessons.service";
import { modulesService } from "../services/modules.service";
import { lmsService } from "../services/lms.service";
import { lessons, modules } from "../db/schema";
import { eq } from "drizzle-orm";
import { ValidationError, ForbiddenError } from "../errors";

if (process.env.NODE_ENV === "production") {
  console.error("[SAFETY ERROR] test-dates-and-archiving.ts cannot be executed with NODE_ENV=production. Aborting.");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL || "";
let dbHost = "";
try {
  dbHost = new URL(dbUrl).hostname;
} catch {
  dbHost = dbUrl.includes("@") ? dbUrl.split("@")[1].split("/")[0].split(":")[0] : "";
}
if (dbHost !== "localhost" && dbHost !== "127.0.0.1") {
  console.error(`[SAFETY ERROR] test-dates-and-archiving.ts is strictly prohibited from running against non-local databases (host: "${dbHost || "unknown"}"). Aborting.`);
  process.exit(1);
}

async function runDateAndArchiveTests() {
  console.log("=================================================");
  console.log("TESTING UNLOCK_AT / LOCK_AT & ARCHIVING BEHAVIOR");
  console.log("=================================================");

  // 1. Create a test module and lesson
  const timestamp = Date.now();
  const testModuleSlug = `test-mod-date-${timestamp}`;
  const testLessonSlug = `test-les-date-${timestamp}`;

  const unlock1 = new Date(Date.now() + 3600 * 1000).toISOString();
  const lock1 = new Date(Date.now() + 7200 * 1000).toISOString();

  console.log("\n[Test 1] Creating module & lesson with valid unlockAt < lockAt...");
  const createdMod = await modulesService.create({
    title: `Date Test Module ${timestamp}`,
    slug: testModuleSlug,
    unlockAt: unlock1,
    lockAt: lock1,
  });
  console.log(` -> Created module ${createdMod.id} with unlockAt: ${createdMod.unlockAt}, lockAt: ${createdMod.lockAt}`);

  const createdLes = await lessonsService.create({
    title: `Date Test Lesson ${timestamp}`,
    slug: testLessonSlug,
    unlockAt: unlock1,
    lockAt: lock1,
  });
  console.log(` -> Created lesson ${createdLes.id} with unlockAt: ${createdLes.unlockAt}, lockAt: ${createdLes.lockAt}`);

  // 2. Test server-side lockAt > unlockAt validation
  console.log("\n[Test 2] Testing server-side validation (lockAt <= unlockAt rejection)...");
  
  // 2a. Reject on create when lockAt < unlockAt
  let rejectedCreate = false;
  try {
    await lessonsService.create({
      title: "Invalid Lesson",
      slug: `invalid-les-${Date.now()}`,
      unlockAt: "2026-12-12T12:00:00.000Z",
      lockAt: "2026-12-12T10:00:00.000Z", // before unlockAt!
    });
  } catch (err: any) {
    if (err instanceof ValidationError && err.message.includes("lockAt")) {
      rejectedCreate = true;
    }
  }
  if (!rejectedCreate) throw new Error("Server failed to reject create with lockAt < unlockAt");
  console.log(" -> [PASS] Server strictly rejected lesson create with lockAt before unlockAt.");

  // 2b. Reject on update when updating lockAt earlier than existing unlockAt
  let rejectedUpdate = false;
  try {
    await modulesService.update(createdMod.id, {
      lockAt: new Date(Date.now() + 1800 * 1000).toISOString(), // earlier than unlock1 (3600s)
    });
  } catch (err: any) {
    if (err instanceof ValidationError && err.message.includes("lockAt")) {
      rejectedUpdate = true;
    }
  }
  if (!rejectedUpdate) throw new Error("Server failed to reject module update where lockAt < existing unlockAt");
  console.log(" -> [PASS] Server strictly rejected module update where new lockAt < existing unlockAt.");

  // 3. Test clearing unlockAt / lockAt (setting to null)
  console.log("\n[Test 3] Testing clearing dates (sending null)...");
  const updatedLes = await lessonsService.update(createdLes.id, {
    unlockAt: null,
    lockAt: null,
  });

  if (updatedLes.unlockAt !== null || updatedLes.lockAt !== null) {
    throw new Error(`Failed to clear lesson dates in memory: ${JSON.stringify(updatedLes)}`);
  }

  // Reload directly from database table to confirm NULL persists in Postgres
  const dbLesRows = await db.select().from(lessons).where(eq(lessons.id, createdLes.id)).limit(1);
  if (!dbLesRows[0] || dbLesRows[0].unlockAt !== null || dbLesRows[0].lockAt !== null) {
    throw new Error(`Database record did not persist NULL! Found: ${JSON.stringify(dbLesRows[0])}`);
  }
  console.log(" -> [PASS] Lesson unlockAt and lockAt cleared to NULL and confirmed in database reload.");

  // Clear module dates
  const updatedMod = await modulesService.update(createdMod.id, {
    unlockAt: null,
    lockAt: null,
  });
  const dbModRows = await db.select().from(modules).where(eq(modules.id, createdMod.id)).limit(1);
  if (!dbModRows[0] || dbModRows[0].unlockAt !== null || dbModRows[0].lockAt !== null) {
    throw new Error(`Database module record did not persist NULL! Found: ${JSON.stringify(dbModRows[0])}`);
  }
  console.log(" -> [PASS] Module unlockAt and lockAt cleared to NULL and confirmed in database reload.");

  // 4. Test Inactive (isActive: false) behavior & Student Protection
  console.log("\n[Test 4] Testing isActive: false & student protection...");
  // Deactivate the lesson
  await lessonsService.update(createdLes.id, {
    isActive: false,
  });
  const inactiveLes = await lessonsService.getById(createdLes.id);
  if (inactiveLes.isActive !== false) {
    throw new Error(`Lesson isActive was not set to false: ${inactiveLes.isActive}`);
  }
  console.log(" -> [PASS] Lesson successfully updated to isActive: false.");

  // Student getLessonContent should throw ForbiddenError
  let studentBlocked = false;
  try {
    await lmsService.getLessonContent("usr_test_student", createdLes.id, false); // isAdmin = false
  } catch (err: any) {
    if (err instanceof ForbiddenError) {
      studentBlocked = true;
    }
  }
  if (!studentBlocked) throw new Error("Student was not blocked from accessing inactive lesson content!");
  console.log(" -> [PASS] Student access to inactive lesson content was strictly blocked with ForbiddenError.");

  // Admin getLessonContent should succeed
  const adminAccess = await lmsService.getLessonContent("usr_test_admin", createdLes.id, true); // isAdmin = true
  if (adminAccess.id !== createdLes.id) {
    throw new Error("Admin failed to access inactive lesson!");
  }
  console.log(" -> [PASS] Admin successfully retrieved inactive lesson for editor maintenance.");

  // Student markLessonProgress should throw ForbiddenError
  let progressBlocked = false;
  try {
    await lmsService.markLessonProgress("usr_test_student", {
      lessonId: createdLes.id,
      isCompleted: true,
    });
  } catch (err: any) {
    if (err instanceof ForbiddenError) {
      progressBlocked = true;
    }
  }
  if (!progressBlocked) throw new Error("Student was not blocked from updating progress on inactive lesson!");
  console.log(" -> [PASS] Student progress update on inactive lesson strictly blocked with ForbiddenError.");

  // 5. Test Reactivating behavior (isActive: true)
  console.log("\n[Test 5] Testing Reactivate (isActive: false -> true)...");
  await lessonsService.update(createdLes.id, {
    isActive: true,
  });
  const restoredLes = await lessonsService.getById(createdLes.id);
  if (restoredLes.isActive !== true) {
    throw new Error(`Lesson failed to reactivate: ${restoredLes.isActive}`);
  }
  console.log(" -> [PASS] Lesson successfully reactivated (isActive: true).");

  // Cleanup test rows
  await db.delete(lessons).where(eq(lessons.id, createdLes.id));
  await db.delete(modules).where(eq(modules.id, createdMod.id));

  console.log("\n=================================================");
  console.log("✅ ALL DATE & ARCHIVE UNIT TESTS PASSED!");
  console.log("=================================================");
}

runDateAndArchiveTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });
