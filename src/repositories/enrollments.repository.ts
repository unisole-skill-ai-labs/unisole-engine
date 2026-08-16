import { eq } from "drizzle-orm";
import { db } from "../db";
import { Enrollment, NewEnrollment, enrollments } from "../db/schema";

export const enrollmentsRepository = {
  async list(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  },
  async getById(id: string): Promise<Enrollment | undefined> {
    const rows = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return rows[0];
  },
  async create(values: NewEnrollment): Promise<Enrollment> {
    const rows = await db.insert(enrollments).values(values).returning();
    return rows[0];
  },
  async update(id: string, values: Partial<NewEnrollment>): Promise<Enrollment | undefined> {
    const rows = await db
      .update(enrollments)
      .set(values)
      .where(eq(enrollments.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Enrollment | undefined> {
    const rows = await db.delete(enrollments).where(eq(enrollments.id, id)).returning();
    return rows[0];
  },
};
