import { Router, Request, Response } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { moduleItems, moduleLessons, modules } from "../db/schema";
import { deleteOrphanLessons } from "../helpers/orphans";
import { createCrudRouter } from "../crud";

export const modulesRouter: Router = createCrudRouter({
  table: modules,
  skipDelete: true,
});

modulesRouter.get("/:id/lessons", async (req: Request, res: Response) => {
  try {
    const found = await db.select().from(modules).where(eq(modules.id, req.params.id));
    if (found.length === 0) return res.status(404).json({ error: "Not found" });
    const rows = await db
      .select()
      .from(moduleLessons)
      .innerJoin(moduleItems, eq(moduleLessons.module_item_id, moduleItems.id))
      .where(eq(moduleLessons.module_id, req.params.id))
      .orderBy(asc(moduleLessons.order_index));
    res.json(rows.map((r) => r.module_item));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

modulesRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await db.transaction(async (tx) => {
      const deleted = await tx.delete(modules).where(eq(modules.id, req.params.id)).returning();
      if (deleted.length === 0) return null;
      await deleteOrphanLessons(tx);
      return deleted;
    });
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
