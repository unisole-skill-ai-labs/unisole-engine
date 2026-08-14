import { Router, Request, Response } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { courseModules, courses, moduleItems, moduleLessons, modules } from "../db/schema";
import { deleteOrphanLessons, deleteOrphanModules } from "../helpers/orphans";
import { createCrudRouter } from "../crud";

export const coursesRouter: Router = createCrudRouter({
  table: courses,
  hasUpdatedAt: true,
  skipDelete: true,
});

async function getModulesForCourse(courseId: string) {
  const rows = await db
    .select()
    .from(courseModules)
    .innerJoin(modules, eq(courseModules.module_id, modules.id))
    .leftJoin(moduleLessons, eq(moduleLessons.module_id, modules.id))
    .leftJoin(moduleItems, eq(moduleLessons.module_item_id, moduleItems.id))
    .where(eq(courseModules.course_id, courseId))
    .orderBy(asc(courseModules.order_index), asc(moduleLessons.order_index));

  const map = new Map<string, any>();
  for (const row of rows) {
    const mod = row.modules;
    if (!map.has(mod.id)) map.set(mod.id, { ...mod, lessons: [] });
    if (row.module_item) map.get(mod.id).lessons.push(row.module_item);
  }
  return [...map.values()];
}

coursesRouter.get("/:id/modules", async (req: Request, res: Response) => {
  try {
    const found = await db.select().from(courses).where(eq(courses.id, req.params.id));
    if (found.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(await getModulesForCourse(req.params.id));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

coursesRouter.get("/:id/tree", async (req: Request, res: Response) => {
  try {
    const found = await db.select().from(courses).where(eq(courses.id, req.params.id));
    if (found.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ...found[0], modules: await getModulesForCourse(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

coursesRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await db.transaction(async (tx) => {
      const deleted = await tx.delete(courses).where(eq(courses.id, req.params.id)).returning();
      if (deleted.length === 0) return null;
      await deleteOrphanModules(tx);
      await deleteOrphanLessons(tx);
      return deleted;
    });
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
