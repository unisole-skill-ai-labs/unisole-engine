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

  updateMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await teamService.updateMember(id, req.body);
    res.json({ success: true, data: updated });
  }),

  listDepartments: asyncHandler(async (_req: Request, res: Response) => {
    const departments = await teamService.listDepartments();
    res.json({ success: true, data: departments });
  }),

  createDepartment: asyncHandler(async (req: Request, res: Response) => {
    const created = await teamService.createDepartment(req.body);
    res.status(201).json({ success: true, data: created });
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
};
