import { sql } from "drizzle-orm";
import { db } from "../db";
import { moduleItems, moduleLessons } from "../db/schema";

type Tx = any;

export function deleteOrphanLessons(tx: Tx = db) {
  return tx.delete(moduleItems).where(
    sql`NOT EXISTS (SELECT 1 FROM ${moduleLessons} WHERE ${moduleLessons.module_item_id} = ${moduleItems.id})`
  );
}
