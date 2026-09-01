import { seedSystemData } from "./seed-system";
import { pool } from "../db";

/**
 * System Data Seeder entrypoint.
 * Usage: npm run db:seed
 */
async function seed() {
  try {
    await seedSystemData();
  } catch (err) {
    console.error("[Seed] Failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

export { seed };

