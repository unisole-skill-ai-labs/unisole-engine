import { sql } from "drizzle-orm";
import { AnyPgTable, PgColumn } from "drizzle-orm/pg-core";
import { db } from "../db";
import crypto from "crypto";

const TABLE_PREFIXES: Record<string, string> = {
  users: "usr_",
  categories: "cat_",
  courses: "crs_",
  modules: "mod_",
  moduleItems: "mitem_",
  assignments: "asgn_",
  assignmentSubmissions: "asub_",
  tests: "test_",
  testAttempts: "tatt_",
  carts: "cart_",
  coupons: "coup_",
  enrollments: "enrl_",
  orders: "ordr_",
  orderItems: "oitm_",
  payments: "pay_",
  certificates: "cert_",
  reviews: "rev_",
  liveQuizzes: "lquiz_",
  liveQuestions: "lq_",
  liveSessions: "lsess_",
  liveParticipants: "lpart_",
};

export async function generateId(table: AnyPgTable, tableName: string, idColumn: PgColumn): Promise<string> {
  const prefix = TABLE_PREFIXES[tableName] || "id_";

  try {
    const rows = await db
      .select({ id: idColumn })
      .from(table)
      .where(sql`${idColumn} ~ ${`^${prefix}[0-9]+$`}`)
      .orderBy(sql`CAST(substring(CAST(${idColumn} AS text) from ${`^${prefix}([0-9]+)$`}) AS bigint) DESC`)
      .limit(1);

    if (rows.length > 0 && rows[0].id) {
      const currentId = String(rows[0].id);
      const match = currentId.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        return `${prefix}${num + 1}`;
      }
    } else {
      return `${prefix}1`;
    }
  } catch (err) {
    console.warn(`[generateId] Fallback for ${tableName}:`, err);
  }

  const rand = crypto.randomBytes(3).toString("hex");
  return `${prefix}${Date.now().toString(36)}_${rand}`;
}
