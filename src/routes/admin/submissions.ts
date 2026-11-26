import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { CustomRequest, requireRole } from "../../middleware/auth";
import { lmsService } from "../../services/lms.service";
import { adminSubmissionsService } from "../../services/admin-submissions.service";

export const adminSubmissionsRouter: Router = Router();

const canViewSubmissions = requireRole([
  "SUPER_ADMIN",
  "ADMIN",
  "COURSE_MANAGER",
  "PROGRAM_MANAGER",
  "MENTOR",
]);

function extractCallerContext(req: CustomRequest) {
  const callerUserId = req.user!.id;
  const callerRoles = [
    req.user?.role,
    ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
    ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
  ]
    .filter(Boolean)
    .map((r) => String(r).toUpperCase());
  return { callerUserId, callerRoles };
}

adminSubmissionsRouter.get(
  "/activities",
  canViewSubmissions,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const { callerUserId, callerRoles } = extractCallerContext(req);
    const { tab, courseId, moduleId, search, pendingOnly, sort, page, limit } = req.query;
    const result = await adminSubmissionsService.getActivities({
      callerUserId,
      callerRoles,
      tab: tab ? String(tab) : "assignments",
      courseId: courseId ? String(courseId) : undefined,
      moduleId: moduleId ? String(moduleId) : undefined,
      search: search ? String(search) : undefined,
      pendingOnly: String(pendingOnly) === "true",
      sort: sort ? String(sort) : "pending_desc",
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  })
);

adminSubmissionsRouter.get(
  "/activities/:activityId/not-submitted",
  canViewSubmissions,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const { callerUserId, callerRoles } = extractCallerContext(req);
    const { search, page, limit } = req.query;
    const result = await adminSubmissionsService.getActivityNotSubmitted({
      callerUserId,
      callerRoles,
      activityId: String(req.params.activityId),
      search: search ? String(search) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  })
);

adminSubmissionsRouter.get(
  "/activities/:activityId/export",
  canViewSubmissions,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const { callerUserId, callerRoles } = extractCallerContext(req);
    const { status, search, sort } = req.query;
    const exported = await adminSubmissionsService.exportActivityCsv({
      callerUserId,
      callerRoles,
      activityId: String(req.params.activityId),
      status: status ? String(status) : "ALL",
      search: search ? String(search) : undefined,
      sort: sort ? String(sort) : "submitted_desc",
    });
    if (!exported) {
      res.status(404).json({ message: "Activity not found" });
      return;
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${exported.filename}"`);
    res.send(exported.csv);
  })
);

adminSubmissionsRouter.get(
  "/activities/:activityId",
  canViewSubmissions,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const { callerUserId, callerRoles } = extractCallerContext(req);
    const { status, search, sort, page, limit } = req.query;
    const result = await adminSubmissionsService.getActivityDetail({
      callerUserId,
      callerRoles,
      activityId: String(req.params.activityId),
      status: status ? String(status) : "ALL",
      search: search ? String(search) : undefined,
      sort: sort ? String(sort) : "submitted_desc",
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    if (!result) {
      res.status(404).json({ message: "Activity not found" });
      return;
    }
    res.json(result);
  })
);

adminSubmissionsRouter.get(
  "/",
  canViewSubmissions,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const { callerUserId, callerRoles } = extractCallerContext(req);

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
