import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db";
import { initializeDatabase } from "../db/init";

async function run() {
  try {
    console.log("[MIGRATE] Running idempotent database schema initialization...");
    await initializeDatabase();
    console.log("[MIGRATE] ✅ Schema DDL synchronized successfully.");

    try {
      const migrationsFolder = path.resolve(process.cwd(), "drizzle");
      await migrate(db, { migrationsFolder });
      console.log("[MIGRATE] ✅ Drizzle migration journal synchronized.");
    } catch (migErr: any) {
      console.log("[MIGRATE] Note: Drizzle migration notice:", migErr?.message || migErr);
    }
  } catch (err) {
    console.error("[MIGRATE] ❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
