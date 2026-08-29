import { Router } from "express";
import { teamController } from "../../controllers/team.controller";
import { requireRole } from "../../middleware/auth";

export const adminTemplatesRouter: Router = Router();

adminTemplatesRouter.get("/", teamController.listTemplates);
adminTemplatesRouter.post(
  "/",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  teamController.createTemplate
);
