import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { pathwaysRepository } from "../repositories/pathways.repository";
import { Enrollment, NewEnrollment } from "../db/schema";
import { ConflictError, NotFoundError, ValidationError } from "../errors";

export const enrollmentsService = {
  async list(user?: { id: string; role: string }, options: { userId?: string } = {}): Promise<Enrollment[]> {
    if (!user) return [];

    if (user.role === "ADMIN") {
      if (options.userId) return enrollmentsRepository.listByUser(options.userId);
      return enrollmentsRepository.list();
    }

    return enrollmentsRepository.listByUser(user.id);
  },

  async getById(id: string, user?: { id: string; role: string }): Promise<Enrollment> {
    const row = await enrollmentsRepository.getById(id);
    if (!row) throw new NotFoundError("Enrollment not found");
    if (user && user.role !== "ADMIN" && row.userId !== user.id) {
      throw new NotFoundError("Enrollment not found");
    }
    return row;
  },

  async create(body: Record<string, unknown>, user?: { id: string; role: string }): Promise<Enrollment> {
    const targetUserId = (body.userId as string) || user?.id;
    const pathwayId = body.pathwayId as string;

    if (!targetUserId || !pathwayId) throw new ValidationError("userId and pathwayId are required");

    if (user && user.role !== "ADMIN" && targetUserId !== user.id) {
      throw new ValidationError("Cannot enroll on behalf of another user");
    }

    const pathway = await pathwaysRepository.getById(pathwayId);
    if (!pathway) throw new NotFoundError("Pathway not found");

    const existing = await enrollmentsRepository.getActiveByUserAndPathway(targetUserId, pathwayId);
    if (existing) throw new ConflictError("Already enrolled in this pathway");

    return enrollmentsRepository.create({
      userId: targetUserId,
      pathwayId,
      status: "ACTIVE",
      enrolledAt: new Date().toISOString(),
    });
  },

  async update(id: string, body: Record<string, unknown>, user?: { id: string; role: string }): Promise<Enrollment> {
    const existing = await enrollmentsRepository.getById(id);
    if (!existing) throw new NotFoundError("Enrollment not found");
    if (user && user.role !== "ADMIN" && existing.userId !== user.id) {
      throw new NotFoundError("Enrollment not found");
    }

    const data: Partial<NewEnrollment> = {};
    if (body.status !== undefined) {
      const status = body.status as string;
      if (!["PENDING", "ACTIVE", "CANCELLED", "EXPIRED"].includes(status))
        throw new ValidationError("Invalid enrollment status");
      data.status = status as any;
    }
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt as string;

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await enrollmentsRepository.update(id, data);
    if (!updated) throw new NotFoundError("Enrollment not found");
    return updated;
  },
};
