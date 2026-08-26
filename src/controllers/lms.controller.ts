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
    const isAdmin = req.user?.role === "ADMIN";
    const pathwayContent = await lmsService.getPathwayContent(userId, req.params.id, isAdmin);
    res.json(pathwayContent);
  }),

  getLessonContent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user?.role === "ADMIN";
    const lesson = await lmsService.getLessonContent(userId, req.params.id, isAdmin);
    res.json(lesson);
  }),
};
