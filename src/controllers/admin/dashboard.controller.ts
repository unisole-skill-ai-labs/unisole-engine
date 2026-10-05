import { Request, Response } from "express";
import { dashboardService } from "../../services/dashboard.service";
import { asyncHandler } from "../../middleware/async-handler";

export const adminDashboardController = {
  getStats: asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as "Weekly" | "Monthly" | "Yearly") || "Monthly";
    const stats = await dashboardService.getLmsStats(period);
    res.json({ success: true, data: stats });
  }),
};
