import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  AssignmentSubmission,
  NewAssignmentSubmission,
  assignmentSubmissions,
} from "../db/schema";

export const assignmentSubmissionsRepository = {
  async list(): Promise<AssignmentSubmission[]> {
    return await db.select().from(assignmentSubmissions);
  },
  async getById(id: string): Promise<AssignmentSubmission | undefined> {
    const rows = await db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, id));
    return rows[0];
  },
  async create(
    values: NewAssignmentSubmission
  ): Promise<AssignmentSubmission> {
    const rows = await db
      .insert(assignmentSubmissions)
      .values(values)
      .returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewAssignmentSubmission>
  ): Promise<AssignmentSubmission | undefined> {
    const rows = await db
      .update(assignmentSubmissions)
      .set(values)
      .where(eq(assignmentSubmissions.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<AssignmentSubmission | undefined> {
    const rows = await db
      .delete(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, id))
      .returning();
    return rows[0];
  },
};
