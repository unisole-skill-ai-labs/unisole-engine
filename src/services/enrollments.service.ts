import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { pathwaysRepository } from "../repositories/pathways.repository";
import { usersRepository } from "../repositories/users.repository";
import { Enrollment, NewEnrollment, ItemType, EnrollmentSource } from "../db/schema";
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from "../errors";

export interface ManualGrantDto {
  userId: string;
  itemType: ItemType;
  itemId: string;
  source?: EnrollmentSource;
  expiresAt?: string;
  notes?: string;
}

export const enrollmentsService = {
  async list(user?: { id: string; role: string }, options: { userId?: string; itemType?: ItemType; status?: string } = {}) {
    if (!user) return [];

    if (user.role === "ADMIN") {
      if (options.userId) return enrollmentsRepository.listByUser(options.userId);
      return enrollmentsRepository.listWithDetails({
        itemType: options.itemType,
        status: options.status,
      });
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

  /**
   * Universal Polymorphic Enrollment Create (Self or Admin)
   */
  async create(body: Record<string, unknown>, user?: { id: string; role: string }): Promise<Enrollment> {
    const targetUserId = (body.userId as string) || user?.id;
    const itemType = (body.itemType as ItemType) || "PATHWAY";
    const itemId = (body.itemId as string) || (body.pathwayId as string);

    if (!targetUserId || !itemId) {
      throw new ValidationError("userId and itemId (or pathwayId) are required");
    }

    if (user && user.role !== "ADMIN" && targetUserId !== user.id) {
      throw new ValidationError("Cannot enroll on behalf of another user");
    }

    // Verify item existence if pathway
    if (itemType === "PATHWAY") {
      const pathway = await pathwaysRepository.getById(itemId);
      if (!pathway) throw new NotFoundError("Pathway not found");
    }

    const existing = await enrollmentsRepository.getActiveByUserAndItem(targetUserId, itemType, itemId);
    if (existing) {
      throw new ConflictError(`User is already actively enrolled in this ${itemType.toLowerCase()}`);
    }

    return enrollmentsRepository.create({
      userId: targetUserId,
      itemType,
      itemId,
      pathwayId: itemType === "PATHWAY" ? itemId : undefined,
      source: "PURCHASE",
      status: "ACTIVE",
      enrolledAt: new Date().toISOString(),
      expiresAt: (body.expiresAt as string) || undefined,
    });
  },

  /**
   * Admin Manual Enrollment Grant (Free pass, scholarship, offline payment, internal team access)
   */
  async adminManualGrant(dto: ManualGrantDto, adminUser: { id: string; name: string }): Promise<Enrollment> {
    if (!dto.userId || !dto.itemType || !dto.itemId) {
      throw new ValidationError("userId, itemType, and itemId are required for manual grant");
    }

    const targetUser = await usersRepository.getById(dto.userId);
    if (!targetUser) throw new NotFoundError("Target user not found");

    const existing = await enrollmentsRepository.getActiveByUserAndItem(dto.userId, dto.itemType, dto.itemId);
    if (existing) {
      throw new ConflictError(`User is already actively enrolled in this ${dto.itemType.toLowerCase()}`);
    }

    const newEnrollment = await enrollmentsRepository.create({
      userId: dto.userId,
      itemType: dto.itemType,
      itemId: dto.itemId,
      pathwayId: dto.itemType === "PATHWAY" ? dto.itemId : undefined,
      source: dto.source || "ADMIN_MANUAL",
      status: "ACTIVE",
      enrolledAt: new Date().toISOString(),
      expiresAt: dto.expiresAt,
    });

    return newEnrollment;
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

  async revoke(id: string, adminUser: { id: string; name: string }): Promise<Enrollment> {
    const existing = await enrollmentsRepository.getById(id);
    if (!existing) throw new NotFoundError("Enrollment not found");

    const updated = await enrollmentsRepository.update(id, {
      status: "CANCELLED",
    });
    if (!updated) throw new NotFoundError("Enrollment not found");
    return updated;
  },
};

