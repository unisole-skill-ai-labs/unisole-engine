import { leadsRepository, LeadFilters } from "../repositories/leads.repository";
import { Lead, NewLead, LeadCallLog } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
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

export const leadsService = {
  async list(filters?: LeadFilters): Promise<any[]> {
    return leadsRepository.list(filters);
  },

  async getById(id: string): Promise<any> {
    const lead = await leadsRepository.getById(id);
    if (!lead) {
      throw new NotFoundError(`Lead not found with id ${id}`);
    }
    return lead;
  },

  async create(body: Record<string, any>, currentUserId?: string): Promise<Lead> {
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

    const leadData: Partial<NewLead> = {
      name: toTitleCase(String(body.name).trim()),
      phone: normalizedPhone,
      email: cleanStr(body.email) ? String(body.email).trim().toLowerCase() : null,
      userId: cleanStr(body.userId),
      collegeId: cleanStr(body.collegeId),
      collegeName: cleanStr(body.collegeName),
      branch: cleanStr(body.branch),
      yearOfStudy: cleanStr(body.yearOfStudy),
      assignedToUserId: cleanStr(body.assignedToUserId),
      quality: body.quality || "WARM",
      status: body.status || "NEW",
      source: body.source || "COLLEGE_DRIVE",
      sourceDetails: body.sourceDetails && typeof body.sourceDetails === "object" ? body.sourceDetails : {},
      nextCallAt: cleanIsoDate(body.nextCallAt),
      notes: cleanStr(body.notes),
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdById: cleanStr(currentUserId),
    };

    return leadsRepository.create(leadData);
  },

  async update(id: string, body: Record<string, any>): Promise<Lead> {
    const existing = await leadsRepository.getById(id);
    if (!existing) {
      throw new NotFoundError(`Lead with id ${id} not found`);
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
    if (body.assignedToUserId !== undefined) updatePayload.assignedToUserId = cleanStr(body.assignedToUserId);
    if (body.quality !== undefined) updatePayload.quality = body.quality;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.source !== undefined) updatePayload.source = body.source;
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


  async delete(id: string): Promise<boolean> {
    const success = await leadsRepository.delete(id);
    if (!success) {
      throw new NotFoundError(`Lead with id ${id} not found`);
    }
    return true;
  },

  async bulkAssign(leadIds: string[], assignedToUserId: string | null): Promise<{ updatedCount: number }> {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new ValidationError("leadIds array is required");
    }
    const count = await leadsRepository.bulkAssign(leadIds, assignedToUserId);
    return { updatedCount: count };
  },

  async bulkUpdateStatus(leadIds: string[], status: string): Promise<{ updatedCount: number }> {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new ValidationError("leadIds array is required");
    }
    if (!status) {
      throw new ValidationError("status is required");
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
    currentUserId?: string
  ): Promise<{ imported: number; updated: number; failed: number }> {
    if (!Array.isArray(leadsList) || leadsList.length === 0) {
      throw new ValidationError("A non-empty list of leads is required for import");
    }
    return leadsRepository.bulkImport(leadsList, currentUserId);
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
    callerUser: { id: string; name?: string; phone?: string }
  ): Promise<LeadCallLog> {
    if (!body.outcome) {
      throw new ValidationError("Call outcome is required");
    }
    if (!body.notes || !String(body.notes).trim()) {
      throw new ValidationError("Call discussion notes are required");
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

  async getCallLogs(leadId: string): Promise<any[]> {
    return leadsRepository.getCallLogs(leadId);
  },

  async getAnalytics(filters?: {
    collegeId?: string;
    branch?: string;
    assignedToUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    return leadsRepository.getAnalytics(filters);
  },

  async getMeta(): Promise<any> {
    return leadsRepository.getMeta();
  },

  async syncAllUsers(): Promise<{ synced: number; existing: number; totalUsers: number }> {
    return leadsRepository.syncAllUsersToLeads();
  },
};

