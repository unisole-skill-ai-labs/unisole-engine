import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { coursesRepository } from "../repositories/courses.repository";
import { Enrollment, NewEnrollment, enrollments } from "../db/schema";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const enrollmentsManager = {
  async list(
    user?: { id: string; role: string },
    options: { userId?: string; includeCourse?: boolean } = {}
  ): Promise<any[]> {
    if (!user) return [];

    // Admins can see all enrollments, or filter by a specific user
    if (user.role === "admin") {
      if (options.userId) {
        return options.includeCourse
          ? enrollmentsRepository.listByUserWithCourse(options.userId)
          : enrollmentsRepository.listByUser(options.userId);
      }
      return enrollmentsRepository.list();
    }

    // Regular users see only their own enrollments
    const targetUserId = user.id;
    if (options.includeCourse) {
      return enrollmentsRepository.listByUserWithCourse(targetUserId);
    }
    return enrollmentsRepository.listByUser(targetUserId);
  },

  async getById(id: string, user?: { id: string; role: string }): Promise<Enrollment> {
    const row = await enrollmentsRepository.getById(id);
    if (!row) throw new NotFoundError("Enrollment not found");
    if (user && user.role !== "admin" && row.user_id !== user.id) {
      throw new NotFoundError("Enrollment not found");
    }
    return row;
  },

  async create(
    body: Record<string, unknown>,
    user?: { id: string; role: string }
  ): Promise<Enrollment> {
    const targetUserId = (body.user_id as string) || user?.id;
    const courseId = body.course_id as string;

    if (!targetUserId || !courseId) {
      throw new ValidationError("Both user_id and course_id are required");
    }

    // Non-admins cannot enroll on behalf of other users
    if (user && user.role !== "admin" && targetUserId !== user.id) {
      throw new ValidationError("Cannot enroll on behalf of another user");
    }

    // Check if course exists
    const course = await coursesRepository.getById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Check if already enrolled
    const existing = await enrollmentsRepository.getByUserAndCourse(
      targetUserId,
      courseId
    );
    if (existing) {
      throw new ConflictError("You are already enrolled in this course");
    }

    const values = filterColumns(
      {
        ...body,
        user_id: targetUserId,
        course_id: courseId,
        enrolled_at: new Date(),
        status: body.status || "active",
        progress_percent: Number(body.progress_percent ?? 0),
      },
      enrollments
    ) as NewEnrollment;

    values.id = await generateId(enrollments, "enrollments", enrollments.id);

    const created = await enrollmentsRepository.create(values);

    // Increment course total_enrollments
    const currentEnrollments = Number(course.total_enrollments ?? 0);
    await coursesRepository.update(courseId, {
      total_enrollments: currentEnrollments + 1,
      updated_at: new Date(),
    });

    return created;
  },

  async update(
    id: string,
    body: Record<string, unknown>,
    user?: { id: string; role: string }
  ): Promise<Enrollment> {
    const existing = await enrollmentsRepository.getById(id);
    if (!existing) throw new NotFoundError("Enrollment not found");
    if (user && user.role !== "admin" && existing.user_id !== user.id) {
      throw new NotFoundError("Enrollment not found");
    }

    const values = filterColumns(body, enrollments) as NewEnrollment;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }

    const row = await enrollmentsRepository.update(id, values);
    if (!row) throw new NotFoundError("Enrollment not found");
    return row;
  },

  async remove(id: string, user?: { id: string; role: string }): Promise<void> {
    const existing = await enrollmentsRepository.getById(id);
    if (!existing) throw new NotFoundError("Enrollment not found");
    if (user && user.role !== "admin" && existing.user_id !== user.id) {
      throw new NotFoundError("Enrollment not found");
    }

    const row = await enrollmentsRepository.remove(id);
    if (!row) throw new NotFoundError("Enrollment not found");
  },
};
