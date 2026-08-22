import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { Enrollment, NewEnrollment, courses, enrollments } from "../db/schema";

export const enrollmentsRepository = {
  async list(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  },
  async listByUser(userId: string): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.user_id, userId));
  },
  async listByUserWithCourse(userId: string) {
    const rows = await db
      .select({
        id: enrollments.id,
        user_id: enrollments.user_id,
        course_id: enrollments.course_id,
        enrolled_at: enrollments.enrolled_at,
        expiry_at: enrollments.expiry_at,
        progress_percent: enrollments.progress_percent,
        status: enrollments.status,
        course: {
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
          category_id: courses.category_id,
          price: courses.price,
          rating_avg: courses.rating_avg,
          total_enrollments: courses.total_enrollments,
        },
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.course_id, courses.id))
      .where(eq(enrollments.user_id, userId));
    return rows;
  },
  async getById(id: string): Promise<Enrollment | undefined> {
    const rows = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id));
    return rows[0];
  },
  async getByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Enrollment | undefined> {
    const rows = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.user_id, userId),
          eq(enrollments.course_id, courseId)
        )
      );
    return rows[0];
  },
  async create(values: NewEnrollment): Promise<Enrollment> {
    const rows = await db.insert(enrollments).values(values).returning();
    return rows[0];
  },
  async update(
    id: string,
    values: Partial<NewEnrollment>
  ): Promise<Enrollment | undefined> {
    const rows = await db
      .update(enrollments)
      .set(values)
      .where(eq(enrollments.id, id))
      .returning();
    return rows[0];
  },
  async remove(id: string): Promise<Enrollment | undefined> {
    const rows = await db
      .delete(enrollments)
      .where(eq(enrollments.id, id))
      .returning();
    return rows[0];
  },
};
