import crypto from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db";
import { enrollments, Enrollment, NewEnrollment, ItemType, EnrollmentSource } from "../db/schema";
import { enrollmentsRepository } from "../repositories/enrollments.repository";
import { pathwaysRepository } from "../repositories/pathways.repository";
import { usersRepository } from "../repositories/users.repository";
import { ordersRepository } from "../repositories/orders.repository";
import { pricingService } from "./pricing.service";
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from "../errors";
import { CANONICAL_SEO_OFFERINGS } from "../constants/offerings";

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

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
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
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && row.userId !== user.id) {
      throw new NotFoundError("Enrollment not found");
    }
    return row;
  },

  /**
   * Helper to resolve a display title for any course, pathway, workshop, or offering
   */
  async resolveItemDisplayTitle(itemType: ItemType, itemId: string): Promise<string> {
    try {
      const priceInfo = await pricingService.resolveItemPrice(itemType, itemId);
      if (priceInfo?.title) return priceInfo.title;
    } catch {
      // Fallback below
    }

    if (itemType === "PATHWAY") {
      try {
        const pwy = await pathwaysRepository.getById(itemId);
        if (pwy?.title) return pwy.title;
      } catch {
        // Fallback below
      }
      const canonical = CANONICAL_SEO_OFFERINGS.find((o) => o.itemId === itemId || o.slug === itemId);
      if (canonical?.title) return canonical.title;
    }

    return `${itemType} - ${itemId}`;
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

    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && targetUserId !== user.id) {
      throw new ValidationError("Cannot enroll on behalf of another user");
    }

    // Verify item existence if pathway
    if (itemType === "PATHWAY") {
      const pathway = await pathwaysRepository.getById(itemId);
      const isCanonical = CANONICAL_SEO_OFFERINGS.some((o) => o.itemId === itemId || o.slug === itemId);
      if (!pathway && !isCanonical) throw new NotFoundError("Pathway not found");
    }

    const existing = await enrollmentsRepository.getActiveByUserAndItem(targetUserId, itemType, itemId);
    if (existing) {
      throw new ConflictError(`User is already actively enrolled in this ${itemType.toLowerCase()}`);
    }

    const source = (body.source as EnrollmentSource) || (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "ADMIN_MANUAL" : "PURCHASE");
    let orderId = (body.orderId as string) || undefined;

    // If granted by admin or manual grant without an order, create complimentary ₹0 PAID order for tracking and SEO profile visibility
    if (!orderId && (source === "ADMIN_MANUAL" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      try {
        const targetUser = await usersRepository.getById(targetUserId);
        if (targetUser) {
          const itemTitle = await this.resolveItemDisplayTitle(itemType, itemId);
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
          const orderNumber = `ORD-${dateStr}-${randomHex}`;

          const userMeta = (typeof targetUser.metadata === "object" && targetUser.metadata !== null)
            ? (targetUser.metadata as Record<string, any>)
            : {};
          const customerEmail = userMeta.email || (targetUser as any).email || "student@unisole.org";
          const customerPhone = targetUser.phone || "";
          const customerName = targetUser.name || "Student";

          const createdOrder = await ordersRepository.create(
            {
              orderNumber,
              userId: targetUser.id,
              customerName,
              customerEmail,
              customerPhone,
              subtotalPaise: 0,
              discountPaise: 0,
              totalPaise: 0,
              currency: "INR",
              status: "PAID",
              paidAt: new Date().toISOString(),
              notes: (body.notes as string) || `Complimentary enrollment created by ${user?.role || "ADMIN"}`,
              metadata: {
                grantSource: source,
                itemType,
                itemId,
              },
            },
            [
              {
                itemType,
                itemId,
                itemTitle,
                unitPricePaise: 0,
                quantity: 1,
                totalPricePaise: 0,
                metadata: {
                  grantSource: source,
                },
              },
            ]
          );
          orderId = createdOrder.id;
        }
      } catch (orderErr) {
        console.warn("[EnrollmentsService] Failed to generate complimentary order for manual create:", orderErr);
      }
    }

    return enrollmentsRepository.create({
      userId: targetUserId,
      itemType,
      itemId,
      pathwayId: itemType === "PATHWAY" ? itemId : undefined,
      orderId,
      source,
      status: "ACTIVE",
      enrolledAt: new Date().toISOString(),
      expiresAt: (body.expiresAt as string) || undefined,
    });
  },

  /**
   * Admin Manual Enrollment Grant (Free pass, scholarship, offline payment, internal team access)
   * Also auto-generates a ₹0 COMPLETED/PAID Order record so the enrollment immediately displays
   * on the student's SEO profile and order history.
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

    const itemTitle = await this.resolveItemDisplayTitle(dto.itemType, dto.itemId);

    // Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHex}`;

    const userMeta = (typeof targetUser.metadata === "object" && targetUser.metadata !== null)
      ? (targetUser.metadata as Record<string, any>)
      : {};
    const customerEmail = userMeta.email || (targetUser as any).email || "student@unisole.org";
    const customerPhone = targetUser.phone || "";
    const customerName = targetUser.name || "Student";

    // 1. Create ₹0 COMPLETED/PAID Order record for the manual grant
    let orderId: string | undefined = undefined;
    try {
      const createdOrder = await ordersRepository.create(
        {
          orderNumber,
          userId: targetUser.id,
          customerName,
          customerEmail,
          customerPhone,
          subtotalPaise: 0,
          discountPaise: 0,
          totalPaise: 0,
          currency: "INR",
          status: "PAID",
          paidAt: new Date().toISOString(),
          notes: dto.notes || `Admin manual enrollment grant by ${adminUser.name}`,
          metadata: {
            grantSource: dto.source || "ADMIN_MANUAL",
            grantedBy: adminUser.id,
            grantedByName: adminUser.name,
            itemType: dto.itemType,
            itemId: dto.itemId,
          },
        },
        [
          {
            itemType: dto.itemType,
            itemId: dto.itemId,
            itemTitle,
            unitPricePaise: 0,
            quantity: 1,
            totalPricePaise: 0,
            metadata: {
              grantSource: dto.source || "ADMIN_MANUAL",
            },
          },
        ]
      );
      orderId = createdOrder.id;
    } catch (orderErr) {
      console.warn("[EnrollmentsService] Failed to create complimentary order for manual grant:", orderErr);
    }

    // 2. Create the active enrollment linked to the new order
    const newEnrollment = await enrollmentsRepository.create({
      userId: dto.userId,
      itemType: dto.itemType,
      itemId: dto.itemId,
      pathwayId: dto.itemType === "PATHWAY" ? dto.itemId : undefined,
      orderId,
      source: dto.source || "ADMIN_MANUAL",
      status: "ACTIVE",
      enrolledAt: new Date().toISOString(),
      expiresAt: dto.expiresAt,
    });

    return newEnrollment;
  },

  /**
   * Self-healing sync: Automatically backfill ₹0 PAID orders for any active enrollments
   * lacking an orderId (e.g. previous manual grants or imports) so they immediately appear in SEO profile.
   */
  async syncOrphanedEnrollments(userId?: string): Promise<number> {
    try {
      const conditions = [
        eq(enrollments.status, "ACTIVE"),
        isNull(enrollments.orderId),
      ];
      if (userId) {
        conditions.push(eq(enrollments.userId, userId));
      }

      const activeWithoutOrder = await db
        .select()
        .from(enrollments)
        .where(and(...conditions));

      let syncedCount = 0;
      for (const enr of activeWithoutOrder) {
        if (!enr.userId || !enr.itemId || !enr.itemType) continue;

        const targetUser = await usersRepository.getById(enr.userId);
        if (!targetUser) continue;

        const itemTitle = await this.resolveItemDisplayTitle(enr.itemType, enr.itemId);

        const dateStr = (enr.enrolledAt ? new Date(enr.enrolledAt) : new Date())
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
        const orderNumber = `ORD-${dateStr}-${randomHex}`;

        const userMeta =
          typeof targetUser.metadata === "object" && targetUser.metadata !== null
            ? (targetUser.metadata as Record<string, any>)
            : {};
        const customerEmail = userMeta.email || (targetUser as any).email || "student@unisole.org";
        const customerPhone = targetUser.phone || "";
        const customerName = targetUser.name || "Student";

        const createdOrder = await ordersRepository.create(
          {
            orderNumber,
            userId: targetUser.id,
            customerName,
            customerEmail,
            customerPhone,
            subtotalPaise: 0,
            discountPaise: 0,
            totalPaise: 0,
            currency: "INR",
            status: "PAID",
            paidAt: enr.enrolledAt || new Date().toISOString(),
            notes: `Auto-synced complimentary order for ${enr.source} enrollment (${enr.id})`,
            metadata: {
              grantSource: enr.source,
              enrollmentId: enr.id,
              autoSynced: true,
            },
          },
          [
            {
              itemType: enr.itemType,
              itemId: enr.itemId,
              itemTitle,
              unitPricePaise: 0,
              quantity: 1,
              totalPricePaise: 0,
              metadata: {
                grantSource: enr.source,
                enrollmentId: enr.id,
              },
            },
          ]
        );

        await enrollmentsRepository.update(enr.id, { orderId: createdOrder.id });
        syncedCount++;
      }

      if (syncedCount > 0) {
        console.log(`[EnrollmentsService] Synced ${syncedCount} active enrollments with complimentary orders.`);
      }
      return syncedCount;
    } catch (err) {
      console.warn("[EnrollmentsService] Warning during orphaned enrollments sync:", err);
      return 0;
    }
  },

  async update(id: string, body: Record<string, unknown>, user?: { id: string; role: string }): Promise<Enrollment> {
    const existing = await enrollmentsRepository.getById(id);
    if (!existing) throw new NotFoundError("Enrollment not found");
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && existing.userId !== user.id) {
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

