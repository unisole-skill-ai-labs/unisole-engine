import { Router } from "express";
import { myWorkController } from "../../controllers/my-work.controller";

export const adminMyWorkRouter: Router = Router();

// Get summary of assigned work (tasks, leads, EOD logs)
adminMyWorkRouter.get("/summary", myWorkController.getSummary);
