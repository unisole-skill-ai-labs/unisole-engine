import { Request, Response } from "express";
import { dashboardService } from "../../services/dashboard.service";
import { asyncHandler } from "../../middleware/async-handler";
import { CustomRequest } from "../../middleware/auth";

export const adminDashboardController = {
  getStats: asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const period = (req.query.period as "Weekly" | "Monthly" | "Yearly") || "Monthly";
    const courseId = req.query.courseId ? String(req.query.courseId) : undefined;

    const userRole = customReq.user?.role;
    const userRoles = [
      userRole,
      ...(Array.isArray((customReq.user as any)?.roles) ? (customReq.user as any).roles : []),
      ...(Array.isArray((customReq.user as any)?.metadata?.roles) ? (customReq.user as any).metadata.roles : []),
    ].filter(Boolean);

    const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");
    const isMentor = userRoles.includes("MENTOR") && !isAdmin;

    const mentorUserId = isMentor ? customReq.user?.id : undefined;

    const stats = await dashboardService.getLmsStats({
      period,
      courseId,
      mentorUserId,
    });
    res.json({ success: true, data: stats });
  }),
};
