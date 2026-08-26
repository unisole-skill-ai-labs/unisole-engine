import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
import * as schema from "./db/schema";
import * as relations from "./db/relations";

dotenv.config();

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5433/unisole",
});

export const db = drizzle(pool, { schema: { ...schema, ...relations } });
