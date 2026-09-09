import { Request, Response } from "express";
import { leadsService } from "../services/leads.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const leadsController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const {
      search,
      collegeId,
      branch,
      assignedToUserId,
      quality,
      status,
      source,
      nextCallDue,
      excludeNonLeads,
      dateFrom,
      dateTo,
    } = req.query as any;

    const data = await leadsService.list({
      search: search ? String(search) : undefined,
      collegeId: collegeId ? String(collegeId) : undefined,
      branch: branch ? String(branch) : undefined,
      assignedToUserId: assignedToUserId ? String(assignedToUserId) : undefined,
      quality: quality ? String(quality) : undefined,
      status: status ? String(status) : undefined,
      source: source ? String(source) : undefined,
      excludeNonLeads: excludeNonLeads === "true" || excludeNonLeads === true,
      nextCallDue: nextCallDue ? (String(nextCallDue) as any) : undefined,
      dateFrom: dateFrom ? String(dateFrom) : undefined,
      dateTo: dateTo ? String(dateTo) : undefined,
    }, req.user);

    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    const data = await leadsService.getById(req.params.id, req.user);
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    const created = await leadsService.create(req.body, req.user);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    const updated = await leadsService.update(req.params.id, req.body, req.user);
    res.json({ success: true, data: updated });
  }),

  delete: asyncHandler(async (req: CustomRequest, res: Response) => {
    await leadsService.delete(req.params.id, req.user);
    res.json({ success: true, message: "Lead deleted successfully" });
  }),

  bulkAssign: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { leadIds, assignedToUserId } = req.body;
    const result = await leadsService.bulkAssign(leadIds, assignedToUserId, req.user);
    res.json({ success: true, ...result });
  }),

  bulkUpdateStatus: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { leadIds, status } = req.body;
    const result = await leadsService.bulkUpdateStatus(leadIds, status, req.user);
    res.json({ success: true, ...result });
  }),

  bulkImport: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { leads: leadsList } = req.body;
    const result = await leadsService.bulkImport(leadsList, req.user);
    res.json({ success: true, data: result });
  }),

  logCall: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callLog = await leadsService.logCall(
      req.params.id,
      req.body,
      req.user || { id: "system", name: "Team Counselor" }
    );
    res.status(201).json({ success: true, data: callLog });
  }),

  getCallLogs: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callLogs = await leadsService.getCallLogs(req.params.id, req.user);
    res.json({ success: true, data: callLogs });
  }),

  getAnalytics: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { collegeId, branch, assignedToUserId, dateFrom, dateTo } = req.query as any;
    const analytics = await leadsService.getAnalytics({
      collegeId: collegeId ? String(collegeId) : undefined,
      branch: branch ? String(branch) : undefined,
      assignedToUserId: assignedToUserId ? String(assignedToUserId) : undefined,
      dateFrom: dateFrom ? String(dateFrom) : undefined,
      dateTo: dateTo ? String(dateTo) : undefined,
    }, req.user);
    res.json({ success: true, data: analytics });
  }),

  getMeta: asyncHandler(async (_req: Request, res: Response) => {
    const meta = await leadsService.getMeta();
    res.json({ success: true, data: meta });
  }),

  syncUsers: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await leadsService.syncAllUsers(req.user);
    res.json({ success: true, data: result });
  }),
};

