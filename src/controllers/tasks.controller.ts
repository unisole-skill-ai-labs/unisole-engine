import { Request, Response } from "express";
import { tasksService } from "../services/tasks.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const tasksController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const filter = {
      assigneeId: req.query.assigneeId as string,
      status: req.query.status as string,
      departmentId: req.query.departmentId as string,
      projectId: req.query.projectId as string,
      subProjectId: req.query.subProjectId as string,
      priority: req.query.priority as string,
      search: req.query.search as string,
      view: req.query.view as any,
      userId: req.user?.id,
      userRole: req.user?.role,
    };
    const tasks = await tasksService.listTasks(filter);
    res.json({ success: true, data: tasks });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await tasksService.getTaskById(req.params.id);
    res.json({ success: true, data: task });
  }),

  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    const reporterId = req.user?.id || "admin";
    const created = await tasksService.createTask(req.body, reporterId);
    res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    const currentUserId = req.user?.id || "admin";
    const updated = await tasksService.updateTask(req.params.id, req.body, currentUserId);
    res.json({ success: true, data: updated });
  }),

  toggleSubtask: asyncHandler(async (req: Request, res: Response) => {
    const { taskId, subtaskId } = req.params;
    const { isCompleted } = req.body;
    const updated = await tasksService.toggleSubtask(taskId, subtaskId, isCompleted);
    res.json({ success: true, data: updated });
  }),

  addSubtask: asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { title } = req.body;
    const updated = await tasksService.addSubtask(taskId, title);
    res.status(201).json({ success: true, data: updated });
  }),

  deleteSubtask: asyncHandler(async (req: Request, res: Response) => {
    const { taskId, subtaskId } = req.params;
    const updated = await tasksService.deleteSubtask(taskId, subtaskId);
    res.json({ success: true, data: updated });
  }),

  submitForReview: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id || "member";
    const updated = await tasksService.submitForReview(taskId, req.body, userId);
    res.json({ success: true, data: updated });
  }),

  flagBlocked: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id || "member";
    const updated = await tasksService.flagBlocked(taskId, req.body, userId);
    res.json({ success: true, data: updated });
  }),

  reviewTask: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId } = req.params;
    const reviewerId = req.user?.id || "admin";
    const updated = await tasksService.reviewTask(taskId, req.body, reviewerId);
    res.json({ success: true, data: updated });
  }),

  addComment: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id || "admin";
    const { content } = req.body;
    const updated = await tasksService.addComment(taskId, content, userId);
    res.status(201).json({ success: true, data: updated });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await tasksService.deleteTask(req.params.id);
    res.json({ success: true, message: "Task deleted successfully" });
  }),

  getLeaderRadar: asyncHandler(async (_req: Request, res: Response) => {
    const radar = await tasksService.getLeaderRadar();
    res.json({ success: true, data: radar });
  }),
};
