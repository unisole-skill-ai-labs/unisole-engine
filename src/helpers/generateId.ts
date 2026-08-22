import { sql } from "drizzle-orm";
import { AnyPgTable, PgColumn } from "drizzle-orm/pg-core";
import { db } from "../db";

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
};

export async function generateId(table: AnyPgTable, tableName: string, idColumn: PgColumn): Promise<string> {
  const prefix = TABLE_PREFIXES[tableName];
  if (!prefix) throw new Error(`No prefix defined for table: ${tableName}`);

  const pattern = `${prefix}%`;
  const rows = await db
    .select({ id: idColumn })
    .from(table)
    .where(sql`${idColumn} LIKE ${pattern}`)
    .orderBy(sql`CAST(regexp_replace(CAST(${idColumn} AS text), '^[a-z_]+', '') AS int) DESC`)
    .limit(1);

  if (rows.length === 0) return `${prefix}1`;

  const currentId = rows[0].id as string;
  const num = parseInt(currentId.replace(/^[a-z_]+/, ""), 10);
  return `${prefix}${num + 1}`;
}
