import { Response } from "express";
import { hierarchyService } from "../services/hierarchy.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const hierarchyController = {
  upgradeSubtask: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId, subtaskId } = req.body;
    const reporterId = req.user?.id;
    const result = await hierarchyService.upgradeSubtaskToTask({ taskId, subtaskId, reporterId });
    res.json({ success: true, data: result, message: "Subtask upgraded to Task successfully" });
  }),

  downgradeTask: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId, targetTaskId } = req.body;
    const result = await hierarchyService.downgradeTaskToSubtask({ taskId, targetTaskId });
    res.json({ success: true, data: result, message: "Task downgraded to Sub-Task successfully" });
  }),

  upgradeTask: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { taskId, targetProjectId } = req.body;
    const userId = req.user?.id;
    const result = await hierarchyService.upgradeTaskToSubProject({ taskId, targetProjectId, userId });
    res.json({ success: true, data: result, message: "Task upgraded to Sub-Project Milestone successfully" });
  }),

  downgradeSubProject: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { subProjectId, targetProjectId, targetSubProjectId } = req.body;
    const userId = req.user?.id;
    const result = await hierarchyService.downgradeSubProjectToTask({
      subProjectId,
      targetProjectId,
      targetSubProjectId,
      userId,
    });
    res.json({ success: true, data: result, message: "Sub-Project downgraded to Task successfully" });
  }),

  upgradeSubProject: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { subProjectId, code } = req.body;
    const userId = req.user?.id;
    const result = await hierarchyService.upgradeSubProjectToProject({ subProjectId, code, userId });
    res.json({ success: true, data: result, message: "Sub-Project upgraded to Project successfully" });
  }),

  downgradeProject: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { projectId, targetProjectId } = req.body;
    const result = await hierarchyService.downgradeProjectToSubProject({ projectId, targetProjectId });
    res.json({ success: true, data: result, message: "Project downgraded to Sub-Project successfully" });
  }),

  moveItem: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await hierarchyService.moveItem(req.body);
    res.json({ success: true, data: result, message: "Hierarchy item moved successfully" });
  }),
};
