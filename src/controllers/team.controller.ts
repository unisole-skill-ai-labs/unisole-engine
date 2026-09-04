import { Request, Response } from "express";
import { teamService } from "../services/team.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const teamController = {
  listMembers: asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string;
    const members = await teamService.listMembers(search);
    res.json({ success: true, data: members });
  }),

  createMember: asyncHandler(async (req: Request, res: Response) => {
    const created = await teamService.createMember(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  updateMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await teamService.updateMember(id, req.body);
    res.json({ success: true, data: updated });
  }),

  updateMemberPermissions: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permissions } = req.body;
    const updated = await teamService.updateMemberPermissions(id, permissions);
    res.json({ success: true, data: updated });
  }),

  deleteMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await teamService.deleteMember(id);
    res.json({ success: true, message: "Member deactivated successfully" });
  }),

  listDepartments: asyncHandler(async (_req: Request, res: Response) => {
    const departments = await teamService.listDepartments();
    res.json({ success: true, data: departments });
  }),

  createDepartment: asyncHandler(async (req: Request, res: Response) => {
    const created = await teamService.createDepartment(req.body);
    res.status(201).json({ success: true, data: created });
  }),

  updateDepartment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await teamService.updateDepartment(id, req.body);
    res.json({ success: true, data: updated });
  }),

  deleteDepartment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await teamService.deleteDepartment(id);
    res.json({ success: true, message: "Department deleted successfully" });
  }),

  listTemplates: asyncHandler(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string;
    const templates = await teamService.listTemplates(departmentId);
    res.json({ success: true, data: templates });
  }),

  createTemplate: asyncHandler(async (req: CustomRequest, res: Response) => {
    const createdById = req.user?.id || "admin";
    const created = await teamService.createTemplate(req.body, createdById);
    res.status(201).json({ success: true, data: created });
  }),

  updateTemplate: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await teamService.updateTemplate(id, req.body);
    res.json({ success: true, data: updated });
  }),

  deleteTemplate: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await teamService.deleteTemplate(id);
    res.json({ success: true, message: "SOP Template deleted successfully" });
  }),

  submitDailyEod: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id || "member";
    const created = await teamService.submitDailyEod(userId, req.body);
    res.status(201).json({ success: true, data: created });
  }),

  listDailyEodLogs: asyncHandler(async (req: Request, res: Response) => {
    const date = req.query.date as string;
    const userId = req.query.userId as string;
    const logs = await teamService.listDailyEodLogs(date, userId);
    res.json({ success: true, data: logs });
  }),

  getCompanyProgress: asyncHandler(async (_req: Request, res: Response) => {
    const progress = await teamService.getCompanyProgress();
    res.json({ success: true, data: progress });
  }),

  getMemberPerformance: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const performance = await teamService.getMemberPerformance(id);
    res.json({ success: true, data: performance });
  }),

  getLeaderboard: asyncHandler(async (_req: Request, res: Response) => {
    const leaderboard = await teamService.getLeaderboard();
    res.json({ success: true, data: leaderboard });
  }),

  getStandupSummary: asyncHandler(async (req: Request, res: Response) => {
    const date = req.query.date as string;
    const summary = await teamService.getStandupSummary(date);
    res.json({ success: true, data: summary });
  }),

  nudgeMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const message = req.body?.message as string;
    const result = await teamService.nudgeMember(id, message);
    res.json({ success: true, data: result });
  }),
};

