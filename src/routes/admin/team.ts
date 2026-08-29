import { Router } from "express";
import { teamController } from "../../controllers/team.controller";
import { requireRole } from "../../middleware/auth";

export const adminTeamRouter: Router = Router();

// Members directory
adminTeamRouter.get("/members", teamController.listMembers);
adminTeamRouter.patch(
  "/members/:id",
  requireRole(["SUPER_ADMIN"]),
  teamController.updateMember
);

// Departments
adminTeamRouter.get("/departments", teamController.listDepartments);
adminTeamRouter.post(
  "/departments",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  teamController.createDepartment
);
