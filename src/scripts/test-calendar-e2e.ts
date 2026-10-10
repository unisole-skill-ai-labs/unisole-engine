import { lmsService } from "../services/lms.service";

async function runCalendarE2ETests() {
  console.log("=== RUNNING CALENDAR & SCHEDULING E2E TESTS ===");

  const adminUserId = "usr_admin_test_1";
  const student1Id = "usr_student_alpha";
  const student2Id = "usr_student_beta";

  // Test 1: Admin creates global event
  console.log("Test 1: Admin creates global event...");
  const globalEvent = await lmsService.createCalendarEvent(adminUserId, {
    title: "Global AI Orientation",
    description: "Welcome orientation for all enrolled batches.",
    eventType: "LIVE_CLASS",
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    scope: "GLOBAL",
    colorScheme: "blue",
    meetUrl: "https://meet.google.com/test-global",
  });
  console.log("✓ Global event created:", globalEvent.event.id);

  // Test 2: Admin creates private 1:1 Viva for Student 1
  console.log("Test 2: Admin creates private 1:1 Viva for Student 1...");
  const privateViva = await lmsService.createCalendarEvent(adminUserId, {
    title: "1-on-1 Milestone Viva with Student Alpha",
    description: "Private code walkthrough and grading.",
    eventType: "VIVA_1ON1",
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    scope: "STUDENT",
    studentId: student1Id,
    colorScheme: "rose",
  });
  console.log("✓ Private Viva created:", privateViva.event.id);

  // Test 3: Student 1 queries events - must see Global and their own 1:1 Viva
  console.log("Test 3: Student 1 queries calendar events...");
  const student1Events = await lmsService.getCalendarEvents({
    callerUserId: student1Id,
    callerRoles: ["STUDENT"],
  });
  const s1HasGlobal = student1Events.some((e: any) => e.title === "Global AI Orientation");
  const s1HasPrivate = student1Events.some((e: any) => e.title === "1-on-1 Milestone Viva with Student Alpha");
  if (!s1HasGlobal || !s1HasPrivate) {
    throw new Error(`Student 1 failed to see assigned events! Global: ${s1HasGlobal}, Private: ${s1HasPrivate}`);
  }
  console.log("✓ Student 1 sees both Global and their assigned 1:1 Viva correctly.");

  // Test 4: Student 2 queries events - must NOT see Student 1's private Viva!
  console.log("Test 4: Student 2 queries calendar events (Privacy Isolation Check)...");
  const student2Events = await lmsService.getCalendarEvents({
    callerUserId: student2Id,
    callerRoles: ["STUDENT"],
  });
  const s2HasPrivate = student2Events.some((e: any) => e.title === "1-on-1 Milestone Viva with Student Alpha");
  if (s2HasPrivate) {
    throw new Error("PRIVACY LEAK: Student 2 can see Student 1's private 1:1 Viva!");
  }
  console.log("✓ Privacy verified: Student 2 CANNOT see Student 1's private 1:1 Viva.");

  // Test 5: Clean up created test events
  console.log("Test 5: Clean up test events...");
  await lmsService.deleteCalendarEvent(globalEvent.event.id, adminUserId, ["ADMIN"]);
  await lmsService.deleteCalendarEvent(privateViva.event.id, adminUserId, ["ADMIN"]);
  console.log("✓ Test events cleaned up successfully.");

  console.log("=== ALL CALENDAR E2E TESTS PASSED SUCCESSFULLY! ===");
}

runCalendarE2ETests().catch((err) => {
  console.error("Calendar E2E Test Failed:", err);
  process.exit(1);
});
