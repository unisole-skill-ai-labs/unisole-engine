import { pool } from "../db";
import fs from "fs";
import path from "path";

/**
 * Seed script — executes the SQL schema+seed file directly.
 * Use this for non-Docker environments where the DB isn't auto-initialized.
 *
 * Usage: npm run db:seed
 */
async function seed() {
  const sqlPath = path.resolve(__dirname, "../../edtech_schema_and_seed.sql");

  if (!fs.existsSync(sqlPath)) {
    console.error(`[Seed] SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  try {
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sqlContent);
    console.log("[Seed] Schema and seed data applied successfully.");
  } catch (err) {
    console.error("[Seed] Failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
