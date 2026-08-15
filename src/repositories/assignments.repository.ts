import { eq } from "drizzle-orm";
import { db } from "../db";
import { Assignment, NewAssignment, assignments } from "../db/schema";

export const assignmentsRepository = {
  async list(): Promise<Assignment[]> {
    return await db.select().from(assignments);
  },
  async getById(id: string): Promise<Assignment | undefined> {
    const rows = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));
    return rows[0];
  },
  async create(values: NewAssignment): Promise<Assignment> {
    const rows = await db.insert(assignments).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewAssignment>
  ): Promise<Assignment | undefined> {
    const rows = await db
      .update(assignments)
      .set(values)
      .where(eq(assignments.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Assignment | undefined> {
    const rows = await db
      .delete(assignments)
      .where(eq(assignments.id, id))
      .returning();
    return rows[0];
  },
};
