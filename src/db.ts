import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
import * as schema from "./db/schema";
import * as relations from "./db/relations";

dotenv.config({ path: ".env.local" });
if (process.env.NODE_ENV === "staging") {
  dotenv.config({ path: ".env.staging" });
}
dotenv.config();

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/unisole",
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema: { ...schema, ...relations } });
