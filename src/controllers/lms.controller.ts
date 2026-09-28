import { Response } from "express";
import { lmsService } from "../services/lms.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const lmsController = {
  getMyPathways: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathways = await lmsService.getAccessiblePathways(userId);
    res.json(pathways);
  }),

  getPathwayContent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const isStaffOrMentor = ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER"].includes(req.user?.role || "");
    const pathwayContent = await lmsService.getPathwayContent(userId, req.params.id, isStaffOrMentor);
    res.json(pathwayContent);
  }),

  getLessonContent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const isStaffOrMentor = ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER"].includes(req.user?.role || "");
    const lesson = await lmsService.getLessonContent(userId, req.params.id, isStaffOrMentor);
    res.json(lesson);
  }),

  markProgress: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const { lessonId, pathwayId, isCompleted } = req.body;
    const result = await lmsService.markLessonProgress(userId, { lessonId, pathwayId, isCompleted });
    res.json(result);
  }),

  getProgress: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathwayId = req.params.pathwayId || (req.query.pathwayId as string);
    const progress = await lmsService.getStudentProgress(userId, pathwayId);
    res.json(progress);
  }),

  submitAssignment: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await lmsService.submitAssignment(userId, req.body);
    res.json(result);
  }),

  getSubmissions: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathwayId = req.params.pathwayId || (req.query.pathwayId as string);
    const subs = await lmsService.getStudentSubmissions(userId, pathwayId);
    res.json(subs);
  }),

  getActivities: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const activities = await lmsService.getStudentActivities(userId);
    res.json(activities);
  }),
};
