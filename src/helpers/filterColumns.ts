import { getTableColumns } from "drizzle-orm";
import { AnyPgTable } from "drizzle-orm/pg-core";

export function filterColumns<T extends AnyPgTable>(
  body: Record<string, unknown>,
  table: T
): Record<string, unknown> {
  const cols = getTableColumns(table);
  const values: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (key in cols) values[key] = body[key];
  }
  return values;
}
