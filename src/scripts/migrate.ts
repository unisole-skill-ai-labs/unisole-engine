import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db";

async function run() {
  try {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("Migrations applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
