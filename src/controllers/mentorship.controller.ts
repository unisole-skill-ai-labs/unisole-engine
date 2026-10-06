import { Request, Response } from "express";
import { mentorshipService } from "../services/mentorship.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const mentorshipController = {
  listMentors: asyncHandler(async (_req: Request, res: Response) => {
    const mentors = await mentorshipService.listMentors();
    res.json(mentors);
  }),

  listMentorships: asyncHandler(async (req: Request, res: Response) => {
    const { mentorId, courseId, menteeId } = req.query as any;
    const mappings = await mentorshipService.listMentorships({
      mentorId: mentorId ? String(mentorId) : undefined,
      courseId: courseId ? String(courseId) : undefined,
      menteeId: menteeId ? String(menteeId) : undefined,
    });
    res.json(mappings);
  }),

  assignMentor: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { mentorId, menteeIds, courseId, pathwayId } = req.body;
    const result = await mentorshipService.assignMentor({
      mentorId,
      menteeIds,
      courseId,
      pathwayId,
      adminUserId: req.user?.id,
    });
    res.status(200).json(result);
  }),

  unassignMentor: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { mappingId, menteeId, courseId } = req.body;
    const result = await mentorshipService.unassignMentor({
      mappingId,
      menteeId,
      courseId,
    });
    res.status(200).json(result);
  }),
};
