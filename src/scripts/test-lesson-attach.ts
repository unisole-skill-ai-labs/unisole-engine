import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { lessonsRepository } from "../repositories/lessons.repository";

if (process.env.NODE_ENV === "production") {
  console.error("[SAFETY ERROR] test-lesson-attach.ts cannot be executed with NODE_ENV=production. Aborting.");
  process.exit(1);
}

const DB_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/unisole_copy";
let dbHost = "";
try {
  dbHost = new URL(DB_URL).hostname;
} catch {
  dbHost = DB_URL.includes("@") ? DB_URL.split("@")[1].split("/")[0].split(":")[0] : "";
}
if (dbHost !== "localhost" && dbHost !== "127.0.0.1") {
  console.error(`[SAFETY ERROR] test-lesson-attach.ts is strictly prohibited from running against non-local databases (host: "${dbHost || "unknown"}"). Aborting.`);
  process.exit(1);
}

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "unisole-secret-key";

async function api(path: string, method = "GET", body?: any, token?: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch {}
  return { status: res.status, data, raw: text };
}

function assertNoRawSql(raw: string, label: string) {
  const forbidden = ["Failed query", "insert into", "module_lessons", "params:"];
  for (const term of forbidden) {
    if (raw.toLowerCase().includes(term.toLowerCase())) {
      throw new Error(`[${label}] Raw SQL leaked in API error response: ${raw}`);
    }
  }
}

async function run() {
  const pool = new Pool({ connectionString: DB_URL });
  const ts = Date.now();
  const createdLessonIds: string[] = [];
  const createdModuleIds: string[] = [];

  try {
    // Ensure test admin token
    const hash = await bcrypt.hash("password123", 10);
    await pool.query(
      `INSERT INTO users (id, username, password, phone, name, role, is_active)
       VALUES ('usr_test_attach_admin', 'testattachadmin', $1, '+919999900099', 'Test Attach Admin', 'ADMIN', TRUE)
       ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', is_active = TRUE`,
      [hash]
    );
    const token = jwt.sign(
      { userId: "usr_test_attach_admin", role: "ADMIN", phone: "+919999900099" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 1. Create a module with 5 existing items
    const modRes = await api(
      "/api/admin/modules",
      "POST",
      { title: `Test Module 5 Items ${ts}`, slug: `test-mod-5-${ts}` },
      token
    );
    if (modRes.status !== 201) throw new Error(`Failed to create test module: ${modRes.raw}`);
    const mod5Id = modRes.data.id;
    createdModuleIds.push(mod5Id);

    for (let i = 1; i <= 5; i++) {
      const r = await api(
        `/api/admin/modules/${mod5Id}/create-lesson`,
        "POST",
        {
          title: `Seeded Item ${i}`,
          slug: `seed-item-${i}-${ts}`,
          content: JSON.stringify({ type: "VIDEO", category: "LECTURE" }),
        },
        token
      );
      if (r.status !== 201 || r.data.position !== i) {
        throw new Error(`Expected position ${i}, got ${r.status} ${r.raw}`);
      }
      createdLessonIds.push(r.data.id);
    }

    // 2. Add each activity type to the module with 5 existing items
    const types = [
      { label: "VIDEO", content: { type: "VIDEO", category: "LECTURE" } },
      { label: "READING", content: { type: "READING", category: "LECTURE" } },
      { label: "QUIZ", content: { type: "QUIZ", category: "PRACTICE" } },
      { label: "ASSIGNMENT", content: { type: "ASSIGNMENT", category: "PRACTICE" } },
      { label: "LIVE", content: { type: "LIVE", category: "LIVE" } },
    ];
    for (let i = 0; i < types.length; i++) {
      const t = types[i];
      const r = await api(
        `/api/admin/modules/${mod5Id}/create-lesson`,
        "POST",
        {
          title: `Activity ${t.label} ${ts}`,
          slug: `act-${t.label.toLowerCase()}-${ts}`,
          content: JSON.stringify(t.content),
        },
        token
      );
      if (r.status !== 201 || !r.data.id.startsWith("les_") || r.data.position !== 6 + i) {
        throw new Error(`Failed adding ${t.label}: ${r.status} ${r.raw}`);
      }
      createdLessonIds.push(r.data.id);
    }
    console.log("PASS: Added all 5 activity types to module with 5 existing items (positions 6..10).");

    // 3. Concurrent adds to the same module
    const [concA, concB] = await Promise.all([
      api(
        `/api/admin/modules/${mod5Id}/create-lesson`,
        "POST",
        { title: `Concurrent A ${ts}`, slug: `conc-a-${ts}`, content: '{"type":"VIDEO"}' },
        token
      ),
      api(
        `/api/admin/modules/${mod5Id}/create-lesson`,
        "POST",
        { title: `Concurrent B ${ts}`, slug: `conc-b-${ts}`, content: '{"type":"QUIZ"}' },
        token
      ),
    ]);
    if (concA.status !== 201 || concB.status !== 201) {
      throw new Error(`Concurrent create-lesson failed: A=${concA.status} B=${concB.status}`);
    }
    createdLessonIds.push(concA.data.id, concB.data.id);
    const concPositions = [concA.data.position, concB.data.position].sort((a, b) => a - b);
    if (concPositions[0] !== 11 || concPositions[1] !== 12) {
      throw new Error(`Expected concurrent positions [11, 12], got ${JSON.stringify(concPositions)}`);
    }
    console.log("PASS: Concurrent adds succeeded with distinct consecutive positions [11, 12].");

    // 4. Add to an empty module
    const emptyModRes = await api(
      "/api/admin/modules",
      "POST",
      { title: `Empty Mod ${ts}`, slug: `empty-mod-${ts}` },
      token
    );
    const emptyModId = emptyModRes.data.id;
    createdModuleIds.push(emptyModId);
    const emptyAdd = await api(
      `/api/admin/modules/${emptyModId}/create-lesson`,
      "POST",
      { title: `First In Empty ${ts}`, slug: `first-empty-${ts}` },
      token
    );
    if (emptyAdd.status !== 201 || emptyAdd.data.position !== 1) {
      throw new Error(`Expected position 1 in empty module, got ${emptyAdd.status} ${emptyAdd.raw}`);
    }
    createdLessonIds.push(emptyAdd.data.id);
    console.log("PASS: Add to empty module assigned position 1.");

    // 5. Idempotent re-attach of the same lesson
    const reattach = await api(
      `/api/admin/modules/${emptyModId}/lessons`,
      "POST",
      { lessonId: emptyAdd.data.id },
      token
    );
    if (reattach.status !== 200 || reattach.data.position !== 1) {
      throw new Error(`Idempotent re-attach failed: ${reattach.status} ${reattach.raw}`);
    }
    const countRes = await pool.query(
      `SELECT count(*)::int AS cnt FROM module_lessons WHERE module_id = $1 AND lesson_id = $2`,
      [emptyModId, emptyAdd.data.id]
    );
    if (countRes.rows[0].cnt !== 1) {
      throw new Error(`Expected 1 link row after re-attach, got ${countRes.rows[0].cnt}`);
    }
    console.log("PASS: Re-attaching same lesson is idempotent (no error, no duplicate).");

    // 6. Gap test: create a gap in module_lessons on local copy, then detach & verify new add still works
    await pool.query(`DELETE FROM module_lessons WHERE module_id = $1 AND position = 2`, [mod5Id]);
    const afterGapAdd = await api(
      `/api/admin/modules/${mod5Id}/create-lesson`,
      "POST",
      { title: `After Gap ${ts}`, slug: `after-gap-${ts}` },
      token
    );
    if (afterGapAdd.status !== 201 || afterGapAdd.data.position !== 13) {
      throw new Error(`Expected position 13 after gap, got ${afterGapAdd.status} ${afterGapAdd.raw}`);
    }
    createdLessonIds.push(afterGapAdd.data.id);
    // Detach one item -> triggers automatic renumbering 1..12 without gaps
    const detachRes = await api(
      `/api/admin/modules/${mod5Id}/lessons/${createdLessonIds[2]}`,
      "DELETE",
      undefined,
      token
    );
    if (detachRes.status !== 200) throw new Error(`Detach failed: ${detachRes.raw}`);
    const posAfterDetach = await pool.query(
      `SELECT position FROM module_lessons WHERE module_id = $1 ORDER BY position`,
      [mod5Id]
    );
    const expectedSeq = posAfterDetach.rows.map((_: any, idx: number) => idx + 1);
    const actualSeq = posAfterDetach.rows.map((r: any) => r.position);
    if (JSON.stringify(actualSeq) !== JSON.stringify(expectedSeq)) {
      throw new Error(`Expected contiguous positions after detach, got ${JSON.stringify(actualSeq)}`);
    }
    console.log("PASS: Gap handling & automatic renumbering on detach verified.");

    // 7. Force failure on link insert (missing module) -> verify 404, no raw SQL, and NO orphan lesson
    const failSlug = `orphan-check-${ts}`;
    const failRes = await api(
      `/api/admin/modules/mod_missing_nonexistent_${ts}/create-lesson`,
      "POST",
      { title: "Should Rollback", slug: failSlug },
      token
    );
    if (failRes.status !== 404) {
      throw new Error(`Expected 404 for missing module, got ${failRes.status} ${failRes.raw}`);
    }
    assertNoRawSql(failRes.raw, "Missing module");
    const orphanCheck = await lessonsRepository.getBySlug(failSlug);
    if (orphanCheck) {
      throw new Error(`Orphan lesson was left behind after failed attach: ${orphanCheck.id}`);
    }
    console.log("PASS: Failed attach rolled back cleanly with 0 orphan lessons.");

    // 8. Duplicate slug error -> clean 409, no raw SQL
    const dupSlugRes = await api(
      `/api/admin/modules/${emptyModId}/create-lesson`,
      "POST",
      { title: "Dup Slug", slug: `first-empty-${ts}` },
      token
    );
    if (dupSlugRes.status !== 409) {
      throw new Error(`Expected 409 for duplicate slug, got ${dupSlugRes.status} ${dupSlugRes.raw}`);
    }
    assertNoRawSql(dupSlugRes.raw, "Duplicate slug");
    console.log("PASS: Duplicate slug returns clean 409 with no raw SQL.");

    // 9. Orphan report endpoint works
    const orphanReport = await api("/api/admin/lessons/orphans", "GET", undefined, token);
    if (orphanReport.status !== 200 || !Array.isArray(orphanReport.data)) {
      throw new Error(`Orphan report endpoint failed: ${orphanReport.status} ${orphanReport.raw}`);
    }
    console.log(`PASS: Orphan lessons report returned ${orphanReport.data.length} orphan(s).`);

    console.log("\nALL ATOMIC LESSON ATTACH ENGINE TESTS PASSED!");
  } finally {
    // Cleanup test rows
    if (createdModuleIds.length > 0) {
      await pool.query(`DELETE FROM module_lessons WHERE module_id = ANY($1::text[])`, [createdModuleIds]);
      await pool.query(`DELETE FROM modules WHERE id = ANY($1::text[])`, [createdModuleIds]);
    }
    if (createdLessonIds.length > 0) {
      await pool.query(`DELETE FROM lessons WHERE id = ANY($1::text[])`, [createdLessonIds]);
    }
    await pool.query(`DELETE FROM users WHERE id = 'usr_test_attach_admin'`);
    await pool.end();
  }
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
