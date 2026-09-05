import { eq, or, desc, ilike, and, sql, gte, lte } from "drizzle-orm";
import { db } from "../db";
import {
  workshopRegistrations,
  WorkshopRegistration,
  NewWorkshopRegistration,
  users,
} from "../db/schema";

export interface WorkshopListFilters {
  search?: string;
  paymentStatus?: string;
  collegeId?: string;
  referredBy?: string;
  campaignSource?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export const workshopRepository = {
  async create(data: NewWorkshopRegistration): Promise<WorkshopRegistration> {
    const [inserted] = await db
      .insert(workshopRegistrations)
      .values(data)
      .returning();
    return inserted;
  },

  async getById(id: string): Promise<WorkshopRegistration | null> {
    const [reg] = await db
      .select()
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.id, id))
      .limit(1);
    return reg || null;
  },

  async getByUserId(userId: string): Promise<WorkshopRegistration | null> {
    const [reg] = await db
      .select()
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.userId, userId))
      .orderBy(desc(workshopRegistrations.createdAt))
      .limit(1);
    return reg || null;
  },

  async getByPhone(phone: string): Promise<WorkshopRegistration | null> {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const raw10 = cleanPhone.slice(-10);

    const [reg] = await db
      .select()
      .from(workshopRegistrations)
      .where(
        or(
          eq(workshopRegistrations.phone, cleanPhone),
          eq(workshopRegistrations.phone, `+91${raw10}`),
          eq(workshopRegistrations.phone, raw10)
        )
      )
      .orderBy(desc(workshopRegistrations.createdAt))
      .limit(1);
    return reg || null;
  },

  async getByProviderOrderId(orderId: string): Promise<WorkshopRegistration | null> {
    const [reg] = await db
      .select()
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.providerOrderId, orderId))
      .limit(1);
    return reg || null;
  },

  async update(
    id: string,
    data: Partial<NewWorkshopRegistration>
  ): Promise<WorkshopRegistration | null> {
    const [updated] = await db
      .update(workshopRegistrations)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(workshopRegistrations.id, id))
      .returning();
    return updated || null;
  },

  async list(filters?: WorkshopListFilters): Promise<{
    items: WorkshopRegistration[];
    total: number;
  }> {
    const conditions = [];

    if (filters?.search) {
      const q = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(workshopRegistrations.name, q),
          ilike(workshopRegistrations.phone, q),
          ilike(workshopRegistrations.email, q),
          ilike(workshopRegistrations.collegeName, q),
          ilike(workshopRegistrations.referredBy, q)
        )
      );
    }

    if (filters?.paymentStatus) {
      conditions.push(eq(workshopRegistrations.paymentStatus, filters.paymentStatus));
    }

    if (filters?.collegeId) {
      conditions.push(eq(workshopRegistrations.collegeId, filters.collegeId));
    }

    if (filters?.referredBy) {
      conditions.push(ilike(workshopRegistrations.referredBy, `%${filters.referredBy}%`));
    }

    if (filters?.campaignSource) {
      conditions.push(eq(workshopRegistrations.campaignSource, filters.campaignSource));
    }

    if (filters?.dateFrom) {
      conditions.push(gte(workshopRegistrations.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(workshopRegistrations.createdAt, filters.dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const items = await db
      .select()
      .from(workshopRegistrations)
      .where(whereClause)
      .orderBy(desc(workshopRegistrations.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(workshopRegistrations)
      .where(whereClause);

    return {
      items,
      total: countResult?.count || 0,
    };
  },

  async getStats(): Promise<{
    totalRegistrations: number;
    paidRegistrations: number;
    pendingRegistrations: number;
    totalRevenuePaise: number;
  }> {
    const [stats] = await db
      .select({
        totalRegistrations: sql<number>`count(*)::int`,
        paidRegistrations: sql<number>`count(*) filter (where ${workshopRegistrations.paymentStatus} = 'SUCCESS')::int`,
        pendingRegistrations: sql<number>`count(*) filter (where ${workshopRegistrations.paymentStatus} != 'SUCCESS')::int`,
        totalRevenuePaise: sql<number>`coalesce(sum(${workshopRegistrations.tokenAmountPaise}) filter (where ${workshopRegistrations.paymentStatus} = 'SUCCESS'), 0)::bigint`,
      })
      .from(workshopRegistrations);

    return {
      totalRegistrations: stats?.totalRegistrations || 0,
      paidRegistrations: stats?.paidRegistrations || 0,
      pendingRegistrations: stats?.pendingRegistrations || 0,
      totalRevenuePaise: Number(stats?.totalRevenuePaise || 0),
    };
  },
};
