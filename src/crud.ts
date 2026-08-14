import { Router, Request, Response } from "express";
import { AnyPgTable } from "drizzle-orm/pg-core";
import { InferSelectModel, getTableColumns } from "drizzle-orm";
import { db } from "./db";

interface CrudConfig<T extends AnyPgTable> {
  table: T;
  hasUpdatedAt?: boolean;
  skipDelete?: boolean;
}

export function createCrudRouter<T extends AnyPgTable>({
  table,
  hasUpdatedAt = false,
  skipDelete = false,
}: CrudConfig<T>): Router {
  type Row = InferSelectModel<T>;
  const router = Router();
  const tbl = table as any;
  const d = db as any;

  router.get("/", async (_req: Request, res: Response) => {
    try {
      const rows: Row[] = await d.select().from(tbl);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const rows: Row[] = await d.select().from(tbl).where(tbl.id.eq(req.params.id));
      if (rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const values = filterBody(req.body, table);
      if (Object.keys(values).length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
      }
      const rows: Row[] = await d.insert(tbl).values(values).returning();
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const values = filterBody(req.body, table);
      if (Object.keys(values).length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
      }
      if (hasUpdatedAt) values.updated_at = new Date();
      const rows: Row[] = await d
        .update(tbl)
        .set(values)
        .where(tbl.id.eq(req.params.id))
        .returning();
      if (rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  if (!skipDelete) {
    router.delete("/:id", async (req: Request, res: Response) => {
      try {
        const rows: Row[] = await d.delete(tbl).where(tbl.id.eq(req.params.id)).returning();
        if (rows.length === 0) return res.status(404).json({ error: "Not found" });
        res.status(204).end();
      } catch (err) {
        res.status(500).json({ error: (err as Error).message });
      }
    });
  }

  return router;
}

function filterBody<T extends AnyPgTable>(
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
