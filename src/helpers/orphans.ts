import { sql } from "drizzle-orm";
import { db } from "../db";
import { courseModules, moduleItems, moduleLessons, modules } from "../db/schema";

type Tx = any;

export function deleteOrphanModules(tx: Tx = db) {
  return tx.delete(modules).where(
    sql`NOT EXISTS (SELECT 1 FROM ${courseModules} WHERE ${courseModules.module_id} = ${modules.id})`
  );
}

export function deleteOrphanLessons(tx: Tx = db) {
  return tx.delete(moduleItems).where(
    sql`NOT EXISTS (SELECT 1 FROM ${moduleLessons} WHERE ${moduleLessons.module_item_id} = ${moduleItems.id})`
  );
}
