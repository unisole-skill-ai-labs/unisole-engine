import "dotenv/config";
import { Pool } from "pg";
import { LEGACY_ASSIGNMENT_WHERE, LEGACY_QUIZ_WHERE } from "../db/legacy-backfill";

/**
 * Read-only dry-run script for the legacy lesson type backfill.
 * Connects with DATABASE_URL inside a READ ONLY transaction and prints
 * a summary + every row that would be updated, without modifying any data.
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL is required.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    // Enforce read-only at the PostgreSQL transaction level so no write can ever succeed.
    await client.query("BEGIN TRANSACTION READ ONLY");

    const countResult = await client.query<{ total: number }>(
      `SELECT count(*)::int AS total FROM "lessons"`
    );
    const totalScanned = countResult.rows[0]?.total ?? 0;

    const sql = `
      SELECT
        "id",
        "title",
        "slug",
        "video_url",
        "video_provider",
        "video_status",
        "video_hls_path",
        CASE
          WHEN (${LEGACY_QUIZ_WHERE}) THEN 'quiz'
          WHEN (${LEGACY_ASSIGNMENT_WHERE}) THEN 'assignment'
        END AS "target_type"
      FROM "lessons"
      WHERE (${LEGACY_QUIZ_WHERE}) OR (${LEGACY_ASSIGNMENT_WHERE})
      ORDER BY "id"
    `;

    const result = await client.query<{
      id: string;
      title: string;
      slug: string;
      video_url: string | null;
      video_provider: string | null;
      video_status: string | null;
      video_hls_path: string | null;
      target_type: string;
    }>(sql);

    await client.query("COMMIT");

    const quizCount = result.rows.filter((r) => r.target_type === "quiz").length;
    const assignmentCount = result.rows.filter((r) => r.target_type === "assignment").length;

    console.log(`[backfill:dry-run] Summary (read-only, no changes made):`);
    console.log(`  Rows scanned : ${totalScanned}`);
    console.log(`  Matched quiz : ${quizCount}`);
    console.log(`  Matched task : ${assignmentCount}`);
    console.log(`  Total matched: ${result.rows.length}`);

    for (const row of result.rows) {
      const hasVideoUrl = Boolean(row.video_url && row.video_url.trim() !== "");
      const hasHlsPath = Boolean(row.video_hls_path && row.video_hls_path.trim() !== "");
      const hasNonEmptyProvider = Boolean(
        row.video_provider && !["NONE", "", "YOUTUBE"].includes(row.video_provider)
      );
      const hasActiveStatus = Boolean(
        row.video_status && !["NONE", ""].includes(row.video_status)
      );
      if (hasVideoUrl || hasHlsPath || hasNonEmptyProvider || hasActiveStatus) {
        console.warn(
          `[backfill:dry-run] WARNING: Matched row ${row.id} (${row.slug}) has non-empty video field(s)!`
        );
      }
      console.log(
        `  - id=${row.id} | slug=${row.slug} | title=${JSON.stringify(row.title)} -> would set type=${row.target_type}`
      );
    }
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback error
    }
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[backfill:dry-run] Failed:", err);
  process.exit(1);
});
