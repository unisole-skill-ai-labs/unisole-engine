import { eq, and, or, ilike, desc, asc, inArray, isNull, sql, lte, gte } from "drizzle-orm";
import { db, pool } from "../db";
import {
  leads,
  leadCallLogs,
  users,
  colleges,
  Lead,
  NewLead,
  LeadCallLog,
  NewLeadCallLog,
} from "../db/schema";

export interface LeadFilters {
  search?: string;
  collegeId?: string;
  branch?: string;
  assignedToUserId?: string;
  quality?: string;
  status?: string;
  source?: string;
  excludeNonLeads?: boolean;
  nextCallDue?: "overdue" | "today" | "upcoming" | "all" | "none";
  dateFrom?: string;
  dateTo?: string;
}

export const leadsRepository = {
  async list(filters?: LeadFilters): Promise<any[]> {
    const conditions = [];

    if (filters?.collegeId) {
      conditions.push(eq(leads.collegeId, filters.collegeId));
    }

    if (filters?.branch) {
      conditions.push(
        or(
          eq(leads.branch, filters.branch),
          ilike(leads.branch, `%${filters.branch}%`)
        )
      );
    }

    if (filters?.assignedToUserId) {
      if (filters.assignedToUserId === "unassigned") {
        conditions.push(isNull(leads.assignedToUserId));
      } else {
        conditions.push(eq(leads.assignedToUserId, filters.assignedToUserId));
      }
    }

    if (filters?.quality) {
      conditions.push(eq(leads.quality, filters.quality as any));
    }

    if (filters?.status) {
      conditions.push(eq(leads.status, filters.status as any));
    } else if (filters?.excludeNonLeads) {
      conditions.push(sql`${leads.status} != 'NOT_A_LEAD'`);
    }

    if (filters?.source) {
      conditions.push(eq(leads.source, filters.source as any));
    }

    if (filters?.dateFrom) {
      conditions.push(gte(leads.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(leads.createdAt, filters.dateTo));
    }

    if (filters?.nextCallDue) {
      const nowIso = new Date().toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      if (filters.nextCallDue === "overdue") {
        conditions.push(
          and(
            lte(leads.nextCallAt, nowIso),
            or(
              eq(leads.status, "NEW" as any),
              eq(leads.status, "ATTEMPTED" as any),
              eq(leads.status, "CONTACTED" as any),
              eq(leads.status, "INTERESTED" as any),
              eq(leads.status, "FOLLOW_UP_SCHEDULED" as any)
            )
          )
        );
      } else if (filters.nextCallDue === "today") {
        conditions.push(
          and(
            gte(leads.nextCallAt, todayStart.toISOString()),
            lte(leads.nextCallAt, todayEnd.toISOString())
          )
        );
      } else if (filters.nextCallDue === "upcoming") {
        conditions.push(gte(leads.nextCallAt, nowIso));
      } else if (filters.nextCallDue === "none") {
        conditions.push(isNull(leads.nextCallAt));
      }
    }

    if (filters?.search) {
      const q = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(leads.name, q),
          ilike(leads.phone, q),
          ilike(leads.email, q),
          ilike(leads.branch, q),
          ilike(leads.collegeName, q),
          ilike(leads.notes, q)
        )
      );
    }

    const baseQuery = db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        email: leads.email,
        userId: leads.userId,
        collegeId: leads.collegeId,
        collegeName: leads.collegeName,
        branch: leads.branch,
        yearOfStudy: leads.yearOfStudy,
        assignedToUserId: leads.assignedToUserId,
        quality: leads.quality,
        status: leads.status,
        source: leads.source,
        sourceDetails: leads.sourceDetails,
        callCount: leads.callCount,
        lastCallAt: leads.lastCallAt,
        nextCallAt: leads.nextCallAt,
        convertedAt: leads.convertedAt,
        conversionValuePaise: leads.conversionValuePaise,
        notes: leads.notes,
        tags: leads.tags,
        createdById: leads.createdById,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        assignedToUser: {
          id: users.id,
          name: users.name,
          phone: users.phone,
          role: users.role,
        },
      })
      .from(leads)
      .leftJoin(users, eq(leads.assignedToUserId, users.id));

    if (conditions.length > 0) {
      return baseQuery
        .where(and(...conditions))
        .orderBy(desc(leads.updatedAt), desc(leads.createdAt));
    }

    return baseQuery.orderBy(desc(leads.updatedAt), desc(leads.createdAt));
  },

  async getById(id: string): Promise<any | null> {
    const rows = await db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        email: leads.email,
        collegeId: leads.collegeId,
        collegeName: leads.collegeName,
        branch: leads.branch,
        yearOfStudy: leads.yearOfStudy,
        assignedToUserId: leads.assignedToUserId,
        quality: leads.quality,
        status: leads.status,
        source: leads.source,
        sourceDetails: leads.sourceDetails,
        callCount: leads.callCount,
        lastCallAt: leads.lastCallAt,
        nextCallAt: leads.nextCallAt,
        convertedAt: leads.convertedAt,
        conversionValuePaise: leads.conversionValuePaise,
        notes: leads.notes,
        tags: leads.tags,
        createdById: leads.createdById,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        assignedToUser: {
          id: users.id,
          name: users.name,
          phone: users.phone,
          role: users.role,
        },
      })
      .from(leads)
      .leftJoin(users, eq(leads.assignedToUserId, users.id))
      .where(eq(leads.id, id));

    if (!rows[0]) return null;

    const callLogs = await db
      .select({
        id: leadCallLogs.id,
        leadId: leadCallLogs.leadId,
        callerUserId: leadCallLogs.callerUserId,
        callerName: leadCallLogs.callerName,
        callDurationSeconds: leadCallLogs.callDurationSeconds,
        outcome: leadCallLogs.outcome,
        notes: leadCallLogs.notes,
        previousQuality: leadCallLogs.previousQuality,
        newQuality: leadCallLogs.newQuality,
        previousStatus: leadCallLogs.previousStatus,
        newStatus: leadCallLogs.newStatus,
        scheduledNextCallAt: leadCallLogs.scheduledNextCallAt,
        recordingUrl: leadCallLogs.recordingUrl,
        createdAt: leadCallLogs.createdAt,
      })
      .from(leadCallLogs)
      .where(eq(leadCallLogs.leadId, id))
      .orderBy(desc(leadCallLogs.createdAt));

    return {
      ...rows[0],
      callLogs,
    };
  },

  async create(data: Partial<NewLead>): Promise<Lead> {
    const rows = await db.insert(leads).values(data as any).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<NewLead>): Promise<Lead | null> {
    const updateData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.status === "CONVERTED" && !data.convertedAt) {
      updateData.convertedAt = new Date().toISOString();
    }

    const rows = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();
    return rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const res = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
    return res.length > 0;
  },

  async bulkAssign(leadIds: string[], assignedToUserId: string | null): Promise<number> {
    if (!leadIds || leadIds.length === 0) return 0;
    const res = await db
      .update(leads)
      .set({
        assignedToUserId: assignedToUserId || null,
        updatedAt: new Date().toISOString(),
      })
      .where(inArray(leads.id, leadIds))
      .returning({ id: leads.id });
    return res.length;
  },

  async bulkUpdateStatus(leadIds: string[], status: string): Promise<number> {
    if (!leadIds || leadIds.length === 0) return 0;
    const updateData: any = {
      status: status as any,
      updatedAt: new Date().toISOString(),
    };
    if (status === "CONVERTED") {
      updateData.convertedAt = new Date().toISOString();
    }
    const res = await db
      .update(leads)
      .set(updateData)
      .where(inArray(leads.id, leadIds))
      .returning({ id: leads.id });
    return res.length;
  },

  async bulkImport(
    leadsList: Array<{
      name: string;
      phone: string;
      email?: string;
      collegeId?: string;
      collegeName?: string;
      branch?: string;
      yearOfStudy?: string;
      assignedToUserId?: string;
      quality?: string;
      status?: string;
      source?: string;
      notes?: string;
    }>,
    createdById?: string
  ): Promise<{ imported: number; updated: number; failed: number }> {
    let imported = 0;
    let updated = 0;
    let failed = 0;

    for (const item of leadsList) {
      try {
        if (!item.phone || !item.name) {
          failed++;
          continue;
        }

        const normalizedPhone = item.phone.replace(/[^\d+]/g, "");
        if (normalizedPhone.length < 10) {
          failed++;
          continue;
        }

        // Check if phone already exists
        const existing = await db
          .select()
          .from(leads)
          .where(eq(leads.phone, normalizedPhone))
          .limit(1);

        if (existing.length > 0) {
          // Update existing with new info if provided
          await db
            .update(leads)
            .set({
              collegeId: item.collegeId || existing[0].collegeId,
              collegeName: item.collegeName || existing[0].collegeName,
              branch: item.branch || existing[0].branch,
              yearOfStudy: item.yearOfStudy || existing[0].yearOfStudy,
              assignedToUserId: item.assignedToUserId || existing[0].assignedToUserId,
              quality: (item.quality as any) || existing[0].quality,
              status: (item.status as any) || existing[0].status,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(leads.id, existing[0].id));
          updated++;
        } else {
          await db.insert(leads).values({
            name: item.name.trim(),
            phone: normalizedPhone,
            email: item.email?.trim() || null,
            collegeId: item.collegeId || null,
            collegeName: item.collegeName || null,
            branch: item.branch || null,
            yearOfStudy: item.yearOfStudy || null,
            assignedToUserId: item.assignedToUserId || null,
            quality: (item.quality as any) || "WARM",
            status: (item.status as any) || "NEW",
            source: (item.source as any) || "MANUAL_IMPORT",
            notes: item.notes || null,
            createdById: createdById || null,
          });
          imported++;
        }
      } catch (err) {
        console.error("Error importing lead item:", item, err);
        failed++;
      }
    }

    return { imported, updated, failed };
  },

  async syncAllUsersToLeads(): Promise<{ synced: number; existing: number; totalUsers: number }> {
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "STUDENT" as any));

    let synced = 0;
    let existingCount = 0;

    for (const u of allUsers) {
      if (!u.phone) continue;
      const normalizedPhone = u.phone.replace(/[^\d+]/g, "");

      const existingLead = await db
        .select()
        .from(leads)
        .where(
          or(
            eq(leads.userId, u.id),
            eq(leads.phone, normalizedPhone),
            eq(leads.phone, u.phone)
          )
        )
        .limit(1);

      if (existingLead.length > 0) {
        if (!existingLead[0].userId) {
          await db
            .update(leads)
            .set({
              userId: u.id,
              name: existingLead[0].name || u.name || "Student Lead",
              collegeId: existingLead[0].collegeId || u.collegeId || null,
              collegeName: existingLead[0].collegeName || u.collegeName || null,
              branch: existingLead[0].branch || u.branch || null,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(leads.id, existingLead[0].id));
        }
        existingCount++;
      } else {
        await db.insert(leads).values({
          userId: u.id,
          name: u.name?.trim() || `Student (${u.phone.slice(-4)})`,
          phone: normalizedPhone,
          collegeId: u.collegeId || null,
          collegeName: u.collegeName || null,
          branch: u.branch || null,
          quality: "WARM",
          status: "NEW",
          source: (u.signupSource as any) || "WEBSITE_INQUIRY",
          notes: `Auto-synced platform user account created at ${u.createdAt}`,
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        synced++;
      }
    }

    return { synced, existing: existingCount, totalUsers: allUsers.length };
  },

  async upsertUserAsLead(user: {
    id: string;
    phone: string;
    name?: string | null;
    collegeId?: string | null;
    collegeName?: string | null;
    branch?: string | null;
    signupSource?: string | null;
  }): Promise<void> {
    if (!user.phone) return;
    const normalizedPhone = user.phone.replace(/[^\d+]/g, "");

    const existingLead = await db
      .select()
      .from(leads)
      .where(
        or(
          eq(leads.userId, user.id),
          eq(leads.phone, normalizedPhone),
          eq(leads.phone, user.phone)
        )
      )
      .limit(1);

    if (existingLead.length > 0) {
      if (!existingLead[0].userId) {
        await db
          .update(leads)
          .set({
            userId: user.id,
            name: existingLead[0].name || user.name || "Student Lead",
            collegeId: existingLead[0].collegeId || user.collegeId || null,
            collegeName: existingLead[0].collegeName || user.collegeName || null,
            branch: existingLead[0].branch || user.branch || null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(leads.id, existingLead[0].id));
      }
    } else {
      await db.insert(leads).values({
        userId: user.id,
        name: user.name?.trim() || `Student (${user.phone.slice(-4)})`,
        phone: normalizedPhone,
        collegeId: user.collegeId || null,
        collegeName: user.collegeName || null,
        branch: user.branch || null,
        quality: "WARM",
        status: "NEW",
        source: (user.signupSource as any) || "WEBSITE_INQUIRY",
        notes: "Auto-synced registered student",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  },


  async addCallLog(data: {
    leadId: string;
    callerUserId: string;
    callerName: string;
    callDurationSeconds?: number;
    outcome: string;
    notes: string;
    newQuality?: string;
    newStatus?: string;
    scheduledNextCallAt?: string;
    recordingUrl?: string;
  }): Promise<LeadCallLog> {
    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.id, data.leadId))
      .limit(1);

    if (!existingLead[0]) {
      throw new Error(`Lead with id ${data.leadId} not found`);
    }

    const previousQuality = existingLead[0].quality;
    const previousStatus = existingLead[0].status;
    const resolvedQuality = (data.newQuality as any) || previousQuality;
    const resolvedStatus = (data.newStatus as any) || previousStatus;

    // 1. Insert call log
    const callLogRows = await db
      .insert(leadCallLogs)
      .values({
        leadId: data.leadId,
        callerUserId: data.callerUserId,
        callerName: data.callerName,
        callDurationSeconds: data.callDurationSeconds || 0,
        outcome: data.outcome as any,
        notes: data.notes,
        previousQuality: previousQuality as any,
        newQuality: resolvedQuality as any,
        previousStatus: previousStatus as any,
        newStatus: resolvedStatus as any,
        scheduledNextCallAt: data.scheduledNextCallAt || null,
        recordingUrl: data.recordingUrl || null,
      })
      .returning();

    // 2. Update parent lead record
    const updatePayload: any = {
      callCount: existingLead[0].callCount + 1,
      lastCallAt: new Date().toISOString(),
      quality: resolvedQuality,
      status: resolvedStatus,
      updatedAt: new Date().toISOString(),
    };

    if (data.scheduledNextCallAt) {
      updatePayload.nextCallAt = data.scheduledNextCallAt;
    }

    if (resolvedStatus === "CONVERTED" && !existingLead[0].convertedAt) {
      updatePayload.convertedAt = new Date().toISOString();
    }

    await db
      .update(leads)
      .set(updatePayload)
      .where(eq(leads.id, data.leadId));

    return callLogRows[0];
  },

  async getCallLogs(leadId: string): Promise<any[]> {
    return db
      .select({
        id: leadCallLogs.id,
        leadId: leadCallLogs.leadId,
        callerUserId: leadCallLogs.callerUserId,
        callerName: leadCallLogs.callerName,
        callDurationSeconds: leadCallLogs.callDurationSeconds,
        outcome: leadCallLogs.outcome,
        notes: leadCallLogs.notes,
        previousQuality: leadCallLogs.previousQuality,
        newQuality: leadCallLogs.newQuality,
        previousStatus: leadCallLogs.previousStatus,
        newStatus: leadCallLogs.newStatus,
        scheduledNextCallAt: leadCallLogs.scheduledNextCallAt,
        recordingUrl: leadCallLogs.recordingUrl,
        createdAt: leadCallLogs.createdAt,
      })
      .from(leadCallLogs)
      .where(eq(leadCallLogs.leadId, leadId))
      .orderBy(desc(leadCallLogs.createdAt));
  },

  async getAnalytics(filters?: {
    collegeId?: string;
    branch?: string;
    assignedToUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const allLeads = await this.list(filters);
    const totalLeads = allLeads.length;
    const convertedLeads = allLeads.filter((l) => l.status === "CONVERTED").length;
    const conversionRatio = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let totalCalls = 0;
    let followUpsDueToday = 0;
    let followUpsOverdue = 0;

    const qualityCounts: Record<string, number> = {
      HOT: 0,
      WARM: 0,
      COLD: 0,
      POOR: 0,
      UNQUALIFIED: 0,
    };

    const statusCounts: Record<string, number> = {
      NEW: 0,
      ATTEMPTED: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      FOLLOW_UP_SCHEDULED: 0,
      DEMO_GIVEN: 0,
      CONVERTED: 0,
      LOST: 0,
      JUNK: 0,
    };

    const collegeMap: Record<string, { collegeName: string; total: number; converted: number; hot: number }> = {};
    const branchMap: Record<string, { branch: string; total: number; converted: number }> = {};
    const counselorMap: Record<
      string,
      { userId: string; name: string; role: string; assigned: number; converted: number; calls: number }
    > = {};

    for (const lead of allLeads) {
      totalCalls += lead.callCount || 0;

      if (lead.quality && qualityCounts[lead.quality] !== undefined) {
        qualityCounts[lead.quality]++;
      }
      if (lead.status && statusCounts[lead.status] !== undefined) {
        statusCounts[lead.status]++;
      }

      if (lead.nextCallAt) {
        const nextCallDate = new Date(lead.nextCallAt);
        if (nextCallDate >= todayStart && nextCallDate <= todayEnd) {
          followUpsDueToday++;
        } else if (nextCallDate < now && lead.status !== "CONVERTED" && lead.status !== "LOST" && lead.status !== "JUNK") {
          followUpsOverdue++;
        }
      }

      // College breakdown
      const cName = lead.collegeName || "Other / Unassigned";
      if (!collegeMap[cName]) {
        collegeMap[cName] = { collegeName: cName, total: 0, converted: 0, hot: 0 };
      }
      collegeMap[cName].total++;
      if (lead.status === "CONVERTED") collegeMap[cName].converted++;
      if (lead.quality === "HOT") collegeMap[cName].hot++;

      // Branch breakdown
      const bName = lead.branch || "General / Not Specified";
      if (!branchMap[bName]) {
        branchMap[bName] = { branch: bName, total: 0, converted: 0 };
      }
      branchMap[bName].total++;
      if (lead.status === "CONVERTED") branchMap[bName].converted++;

      // Counselor stats
      if (lead.assignedToUser) {
        const uid = lead.assignedToUser.id;
        if (!counselorMap[uid]) {
          counselorMap[uid] = {
            userId: uid,
            name: lead.assignedToUser.name || lead.assignedToUser.phone || "Team Member",
            role: lead.assignedToUser.role,
            assigned: 0,
            converted: 0,
            calls: 0,
          };
        }
        counselorMap[uid].assigned++;
        counselorMap[uid].calls += lead.callCount || 0;
        if (lead.status === "CONVERTED") counselorMap[uid].converted++;
      }
    }

    // Call logs count today
    const callLogsTodayRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(leadCallLogs)
      .where(
        and(
          gte(leadCallLogs.createdAt, todayStart.toISOString()),
          lte(leadCallLogs.createdAt, todayEnd.toISOString())
        )
      );
    const callsMadeToday = Number(callLogsTodayRes[0]?.count || 0);

    const collegeBreakdown = Object.values(collegeMap)
      .map((c) => ({
        ...c,
        conversionRate: c.total > 0 ? Number(((c.converted / c.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const branchBreakdown = Object.values(branchMap)
      .map((b) => ({
        ...b,
        conversionRate: b.total > 0 ? Number(((b.converted / b.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const counselorLeaderboard = Object.values(counselorMap)
      .map((c) => ({
        ...c,
        conversionRate: c.assigned > 0 ? Number(((c.converted / c.assigned) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.converted - a.converted || b.assigned - a.assigned);

    return {
      kpi: {
        totalLeads,
        convertedLeads,
        conversionRatio,
        totalCalls,
        callsMadeToday,
        followUpsDueToday,
        followUpsOverdue,
        hotLeadsCount: qualityCounts.HOT,
      },
      qualityBreakdown: Object.keys(qualityCounts).map((key) => ({
        quality: key,
        count: qualityCounts[key],
        percentage: totalLeads > 0 ? Number(((qualityCounts[key] / totalLeads) * 100).toFixed(1)) : 0,
      })),
      statusPipeline: Object.keys(statusCounts).map((key) => ({
        status: key,
        count: statusCounts[key],
        percentage: totalLeads > 0 ? Number(((statusCounts[key] / totalLeads) * 100).toFixed(1)) : 0,
      })),
      collegeBreakdown,
      branchBreakdown,
      counselorLeaderboard,
    };
  },

  async getMeta(): Promise<{
    colleges: Array<{ id: string; name: string }>;
    branches: string[];
    teamMembers: Array<{ id: string; name: string; phone: string; role: string }>;
    qualities: string[];
    statuses: string[];
    sources: string[];
    callOutcomes: string[];
  }> {
    const allColleges = await db
      .select({ id: colleges.id, name: colleges.name })
      .from(colleges)
      .where(eq(colleges.isActive, true))
      .orderBy(colleges.name);

    const allTeam = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          or(
            eq(users.role, "ADMIN" as any),
            eq(users.role, "SUPER_ADMIN" as any),
            eq(users.role, "MEMBER" as any)
          )
        )
      )
      .orderBy(users.name);

    // Get distinct branches from leads
    const distinctBranchRows = await db
      .select({ branch: leads.branch })
      .from(leads)
      .where(sql`branch IS NOT NULL AND branch != ''`)
      .groupBy(leads.branch);

    const defaultBranches = [
      "B.Tech CSE",
      "B.Tech ECE",
      "B.Tech Mechanical",
      "B.Tech Civil",
      "BCA",
      "MCA",
      "BCOM",
      "BBA",
      "BA",
      "B.Sc",
      "Diploma",
    ];

    const branchSet = new Set<string>(defaultBranches);
    for (const r of distinctBranchRows) {
      if (r.branch) branchSet.add(r.branch);
    }

    return {
      colleges: allColleges,
      branches: Array.from(branchSet).sort(),
      teamMembers: allTeam.map((t) => ({
        id: t.id,
        name: t.name || t.phone || "Team Member",
        phone: t.phone,
        role: t.role,
      })),
      qualities: ["HOT", "WARM", "COLD", "POOR", "UNQUALIFIED"],
      statuses: [
        "NEW",
        "ATTEMPTED",
        "CONTACTED",
        "INTERESTED",
        "FOLLOW_UP_SCHEDULED",
        "DEMO_GIVEN",
        "CONVERTED",
        "LOST",
        "JUNK",
        "NOT_A_LEAD",
      ],
      sources: [
        "PRESENTATION_SESSION",
        "COLLEGE_DRIVE",
        "PAMPHLET_SCAN",
        "WEBSITE_INQUIRY",
        "REFERRAL",
        "MANUAL_IMPORT",
        "OTHER",
      ],
      callOutcomes: [
        "CONNECTED_INTERESTED",
        "CONNECTED_FOLLOW_UP",
        "CONNECTED_NOT_INTERESTED",
        "CONNECTED_CONVERTED",
        "BUSY_NO_ANSWER",
        "WRONG_NUMBER",
        "CALL_BACK_REQUESTED",
        "VOICEMAIL",
      ],
    };
  },
};
