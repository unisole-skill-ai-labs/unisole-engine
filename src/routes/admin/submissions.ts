import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { CustomRequest, requireRole } from "../../middleware/auth";
import { lmsService } from "../../services/lms.service";

export const adminSubmissionsRouter: Router = Router();

const canViewSubmissions = requireRole([
  "SUPER_ADMIN",
  "ADMIN",
  "COURSE_MANAGER",
  "PROGRAM_MANAGER",
  "MENTOR",
]);

adminSubmissionsRouter.get(
  "/",
  canViewSubmissions,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const callerRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ]
      .filter(Boolean)
      .map((r) => String(r).toUpperCase());

    const { courseId, lessonId, type, status, search, page, limit } = req.query;
    const result = await lmsService.getAdminSubmissions({
      callerUserId,
      callerRoles,
      courseId: courseId ? String(courseId) : undefined,
      lessonId: lessonId ? String(lessonId) : undefined,
      type: type ? String(type) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  })
);
