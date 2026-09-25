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
};
