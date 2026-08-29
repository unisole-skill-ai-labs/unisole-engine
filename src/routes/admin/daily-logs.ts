import { Router } from "express";
import { teamController } from "../../controllers/team.controller";

export const adminDailyLogsRouter: Router = Router();

adminDailyLogsRouter.get("/", teamController.listDailyEodLogs);
adminDailyLogsRouter.post("/", teamController.submitDailyEod);
