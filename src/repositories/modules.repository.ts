import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { Module, modules, NewModule } from "../db/schema";

export const modulesRepository = {
  async list(): Promise<Module[]> {
    return await db.select().from(modules);
  },
  async getById(id: string): Promise<Module | undefined> {
    const rows = await db.select().from(modules).where(eq(modules.id, id));
    return rows[0];
  },
  async create(values: NewModule): Promise<Module> {
    const rows = await db.insert(modules).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewModule>
  ): Promise<Module | undefined> {
    const rows = await db
      .update(modules)
      .set(values)
      .where(eq(modules.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Module | undefined> {
    const rows = await db.delete(modules).where(eq(modules.id, id)).returning();
    return rows[0];
  },
};
