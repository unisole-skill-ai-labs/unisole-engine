import { Router } from "express";
import { adminDashboardController } from "../../controllers/admin/dashboard.controller";

export const adminDashboardRouter: Router = Router();

adminDashboardRouter.get("/stats", adminDashboardController.getStats);
