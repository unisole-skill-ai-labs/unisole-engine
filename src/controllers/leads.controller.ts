import { Request, Response } from "express";
import { leadsService } from "../services/leads.service";
import { asyncHandler } from "../middleware/async-handler";

export const leadsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
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
    });

    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const data = await leadsService.getById(req.params.id);
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req: any, res: Response) => {
    const created = await leadsService.create(req.body, req.user?.id);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await leadsService.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await leadsService.delete(req.params.id);
    res.json({ success: true, message: "Lead deleted successfully" });
  }),

  bulkAssign: asyncHandler(async (req: Request, res: Response) => {
    const { leadIds, assignedToUserId } = req.body;
    const result = await leadsService.bulkAssign(leadIds, assignedToUserId);
    res.json({ success: true, ...result });
  }),

  bulkUpdateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { leadIds, status } = req.body;
    const result = await leadsService.bulkUpdateStatus(leadIds, status);
    res.json({ success: true, ...result });
  }),

  bulkImport: asyncHandler(async (req: any, res: Response) => {
    const { leads: leadsList } = req.body;
    const result = await leadsService.bulkImport(leadsList, req.user?.id);
    res.json({ success: true, data: result });
  }),

  logCall: asyncHandler(async (req: any, res: Response) => {
    const callLog = await leadsService.logCall(
      req.params.id,
      req.body,
      req.user || { id: "system", name: "Team Counselor" }
    );
    res.status(201).json({ success: true, data: callLog });
  }),

  getCallLogs: asyncHandler(async (req: Request, res: Response) => {
    const callLogs = await leadsService.getCallLogs(req.params.id);
    res.json({ success: true, data: callLogs });
  }),

  getAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const { collegeId, branch, assignedToUserId, dateFrom, dateTo } = req.query as any;
    const analytics = await leadsService.getAnalytics({
      collegeId: collegeId ? String(collegeId) : undefined,
      branch: branch ? String(branch) : undefined,
      assignedToUserId: assignedToUserId ? String(assignedToUserId) : undefined,
      dateFrom: dateFrom ? String(dateFrom) : undefined,
      dateTo: dateTo ? String(dateTo) : undefined,
    });
    res.json({ success: true, data: analytics });
  }),

  getMeta: asyncHandler(async (_req: Request, res: Response) => {
    const meta = await leadsService.getMeta();
    res.json({ success: true, data: meta });
  }),

  syncUsers: asyncHandler(async (_req: Request, res: Response) => {
    const result = await leadsService.syncAllUsers();
    res.json({ success: true, data: result });
  }),
};

