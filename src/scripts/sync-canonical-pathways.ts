import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { pathwaysService } from "../services/pathways.service";
import { pricingService } from "../services/pricing.service";
import { pool } from "../db";

async function main() {
  console.log("[Sync] Connecting to database via Drizzle ORM...");
  try {
    const pwyResult = await pathwaysService.syncCanonicalPathways();
    console.log(`[Sync] Successfully synced ${pwyResult.synced}/${pwyResult.total} canonical pathways into 'pathways' database table via Drizzle.`);

    const prcResult = await pricingService.syncCanonicalOfferings();
    console.log(`[Sync] Successfully synced ${prcResult.total} canonical offerings into 'offerings_pricing' database table via Drizzle.`);

    const pathwaysList = await pathwaysService.list();
    console.log(`[Sync] Total pathways currently in database: ${pathwaysList.length}`);
    for (const p of pathwaysList) {
      console.log(`  - [${p.id}] ${p.title} (slug: ${p.slug})`);
    }
  } catch (err) {
    console.error("[Sync] Error running Drizzle sync:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
