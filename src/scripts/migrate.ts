import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db";

async function run() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
