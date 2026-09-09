import { leadsRepository, LeadFilters, normalizeLeadSource } from "../repositories/leads.repository";
import { Lead, NewLead, LeadCallLog } from "../db/schema";
import { NotFoundError, ValidationError, ForbiddenError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";

function cleanStr(val: any): string | null {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

function cleanIsoDate(val: any): string | null {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

export function isSalesRestrictedUser(user?: { id: string; role: string; designation?: string | null; permissions?: string[] }): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return false;
  const role = (user.role || "").toUpperCase();
  const des = (user.designation || "").toUpperCase();
  if (role === "SALES" || des.includes("SALES") || des.includes("TELECALL") || des.includes("COUNSEL")) {
    return true;
  }
  return false;
}

export const leadsService = {
  async list(filters?: LeadFilters, requestingUser?: any): Promise<any[]> {
    const effectiveFilters: LeadFilters = { ...(filters || {}) };
    if (isSalesRestrictedUser(requestingUser)) {
      effectiveFilters.assignedToUserId = requestingUser.id;
    }
    return leadsRepository.list(effectiveFilters);
  },

  async getById(id: string, requestingUser?: any): Promise<any> {
    const lead = await leadsRepository.getById(id);
    if (!lead) {
      throw new NotFoundError(`Lead not found with id ${id}`);
    }
    if (isSalesRestrictedUser(requestingUser) && lead.assignedToUserId !== requestingUser.id) {
      throw new ForbiddenError("Access restricted: You can only view leads assigned to you");
    }
    return lead;
  },

  async create(body: Record<string, any>, requestingUser?: any): Promise<Lead> {
    if (!body.name || !String(body.name).trim()) {
      throw new ValidationError("Lead full name is required");
    }
    if (!body.phone || !String(body.phone).trim()) {
      throw new ValidationError("Phone number is required");
    }

    const normalizedPhone = normalizePhone(String(body.phone).trim()) || String(body.phone).replace(/[^\d+]/g, "");
    if (!normalizedPhone || normalizedPhone.length < 10) {
      throw new ValidationError("Invalid phone number format. Please provide a valid 10-digit number.");
    }

    let assignedToUserId = cleanStr(body.assignedToUserId);
    if (isSalesRestrictedUser(requestingUser)) {
      assignedToUserId = requestingUser.id;
    }

    const leadData: Partial<NewLead> = {
      name: toTitleCase(String(body.name).trim()),
      phone: normalizedPhone,
      email: cleanStr(body.email) ? String(body.email).trim().toLowerCase() : null,
      userId: cleanStr(body.userId),
      collegeId: cleanStr(body.collegeId),
      collegeName: cleanStr(body.collegeName),
      branch: cleanStr(body.branch),
      yearOfStudy: cleanStr(body.yearOfStudy),
      assignedToUserId,
      quality: body.quality || "WARM",
      status: body.status || "NEW",
      source: normalizeLeadSource(body.source) as any,
      sourceDetails: body.sourceDetails && typeof body.sourceDetails === "object" ? body.sourceDetails : {},
      nextCallAt: cleanIsoDate(body.nextCallAt),
      notes: cleanStr(body.notes),
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdById: cleanStr(requestingUser?.id),
    };

    return leadsRepository.create(leadData);
  },

  async update(id: string, body: Record<string, any>, requestingUser?: any): Promise<Lead> {
    const existing = await leadsRepository.getById(id);
    if (!existing) {
      throw new NotFoundError(`Lead with id ${id} not found`);
    }

    if (isSalesRestrictedUser(requestingUser)) {
      if (existing.assignedToUserId !== requestingUser.id) {
        throw new ForbiddenError("Access restricted: You can only update leads assigned to you");
      }
    }

    const updatePayload: Partial<NewLead> = {};

    if (body.name !== undefined) updatePayload.name = toTitleCase(String(body.name).trim());
    if (body.phone !== undefined) {
      const norm = normalizePhone(String(body.phone).trim()) || String(body.phone).replace(/[^\d+]/g, "");
      if (norm) updatePayload.phone = norm;
    }
    if (body.email !== undefined) updatePayload.email = cleanStr(body.email) ? String(body.email).trim().toLowerCase() : null;
    if (body.userId !== undefined) updatePayload.userId = cleanStr(body.userId);
    if (body.collegeId !== undefined) updatePayload.collegeId = cleanStr(body.collegeId);
    if (body.collegeName !== undefined) updatePayload.collegeName = cleanStr(body.collegeName);
    if (body.branch !== undefined) updatePayload.branch = cleanStr(body.branch);
    if (body.yearOfStudy !== undefined) updatePayload.yearOfStudy = cleanStr(body.yearOfStudy);
    // Only admins can reassign leads to another user
    if (body.assignedToUserId !== undefined && !isSalesRestrictedUser(requestingUser)) {
      updatePayload.assignedToUserId = cleanStr(body.assignedToUserId);
    }
    if (body.quality !== undefined) updatePayload.quality = body.quality;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.source !== undefined) updatePayload.source = normalizeLeadSource(body.source) as any;
    if (body.nextCallAt !== undefined) updatePayload.nextCallAt = cleanIsoDate(body.nextCallAt);
    if (body.conversionValuePaise !== undefined) updatePayload.conversionValuePaise = Number(body.conversionValuePaise) || 0;
    if (body.notes !== undefined) updatePayload.notes = cleanStr(body.notes);
    if (body.tags !== undefined) updatePayload.tags = Array.isArray(body.tags) ? body.tags : [];

    const updated = await leadsRepository.update(id, updatePayload);
    if (!updated) {
      throw new NotFoundError(`Failed to update lead with id ${id}`);
    }
    return updated;
  },

  async delete(id: string, requestingUser?: any): Promise<boolean> {
    if (isSalesRestrictedUser(requestingUser)) {
      throw new ForbiddenError("Permission denied: Sales representatives cannot delete leads");
    }
    const success = await leadsRepository.delete(id);
    if (!success) {
      throw new NotFoundError(`Lead with id ${id} not found`);
    }
    return true;
  },

  async bulkAssign(leadIds: string[], assignedToUserId: string | null, requestingUser?: any): Promise<{ updatedCount: number }> {
    if (isSalesRestrictedUser(requestingUser)) {
      throw new ForbiddenError("Permission denied: Sales representatives cannot reassign leads");
    }
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new ValidationError("leadIds array is required");
    }
    const count = await leadsRepository.bulkAssign(leadIds, assignedToUserId);
    return { updatedCount: count };
  },

  async bulkUpdateStatus(leadIds: string[], status: string, requestingUser?: any): Promise<{ updatedCount: number }> {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new ValidationError("leadIds array is required");
    }
    if (!status) {
      throw new ValidationError("status is required");
    }
    // If sales user, only allow status update on leads assigned to them
    if (isSalesRestrictedUser(requestingUser)) {
      const allowedLeads = await leadsRepository.list({ assignedToUserId: requestingUser.id });
      const allowedIds = new Set(allowedLeads.map((l) => l.id));
      const filteredLeadIds = leadIds.filter((id) => allowedIds.has(id));
      if (filteredLeadIds.length === 0) {
        throw new ForbiddenError("No matching assigned leads found to update");
      }
      const count = await leadsRepository.bulkUpdateStatus(filteredLeadIds, status);
      return { updatedCount: count };
    }
    const count = await leadsRepository.bulkUpdateStatus(leadIds, status);
    return { updatedCount: count };
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
    requestingUser?: any
  ): Promise<{ imported: number; updated: number; failed: number }> {
    if (isSalesRestrictedUser(requestingUser)) {
      throw new ForbiddenError("Permission denied: Sales representatives cannot bulk import leads");
    }
    if (!Array.isArray(leadsList) || leadsList.length === 0) {
      throw new ValidationError("A non-empty list of leads is required for import");
    }
    return leadsRepository.bulkImport(leadsList, requestingUser?.id);
  },

  async logCall(
    leadId: string,
    body: {
      callDurationSeconds?: number;
      outcome: string;
      notes: string;
      newQuality?: string;
      newStatus?: string;
      scheduledNextCallAt?: string;
      recordingUrl?: string;
    },
    callerUser: { id: string; name?: string; phone?: string; role?: string; designation?: string | null }
  ): Promise<LeadCallLog> {
    if (!body.outcome) {
      throw new ValidationError("Call outcome is required");
    }
    if (!body.notes || !String(body.notes).trim()) {
      throw new ValidationError("Call discussion notes are required");
    }

    const lead = await leadsRepository.getById(leadId);
    if (!lead) {
      throw new NotFoundError(`Lead not found with id ${leadId}`);
    }
    if (isSalesRestrictedUser(callerUser as any) && lead.assignedToUserId !== callerUser.id) {
      throw new ForbiddenError("Access restricted: You can only log calls for leads assigned to you");
    }

    return leadsRepository.addCallLog({
      leadId,
      callerUserId: callerUser.id,
      callerName: callerUser.name || callerUser.phone || "Team Counselor",
      callDurationSeconds: Number(body.callDurationSeconds) || 0,
      outcome: body.outcome,
      notes: String(body.notes).trim(),
      newQuality: body.newQuality,
      newStatus: body.newStatus,
      scheduledNextCallAt: body.scheduledNextCallAt ? new Date(body.scheduledNextCallAt).toISOString() : undefined,
      recordingUrl: body.recordingUrl ? String(body.recordingUrl).trim() : undefined,
    });
  },

  async getCallLogs(leadId: string, requestingUser?: any): Promise<any[]> {
    const lead = await leadsRepository.getById(leadId);
    if (!lead) {
      throw new NotFoundError(`Lead not found with id ${leadId}`);
    }
    if (isSalesRestrictedUser(requestingUser) && lead.assignedToUserId !== requestingUser.id) {
      throw new ForbiddenError("Access restricted: You can only view call history for leads assigned to you");
    }
    return leadsRepository.getCallLogs(leadId);
  },

  async getAnalytics(filters?: {
    collegeId?: string;
    branch?: string;
    assignedToUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  }, requestingUser?: any): Promise<any> {
    const effectiveFilters = { ...(filters || {}) };
    if (isSalesRestrictedUser(requestingUser)) {
      effectiveFilters.assignedToUserId = requestingUser.id;
    }
    return leadsRepository.getAnalytics(effectiveFilters);
  },

  async getMeta(): Promise<any> {
    return leadsRepository.getMeta();
  },

  async syncAllUsers(requestingUser?: any): Promise<{ synced: number; existing: number; totalUsers: number }> {
    if (isSalesRestrictedUser(requestingUser)) {
      throw new ForbiddenError("Permission denied: Sales representatives cannot sync platform users");
    }
    return leadsRepository.syncAllUsersToLeads();
  },
};

