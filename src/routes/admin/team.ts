import { Router } from "express";
import { teamController } from "../../controllers/team.controller";
import { requireRole } from "../../middleware/auth";

export const adminTeamRouter: Router = Router();

// Executive Company Progress & Analytics
adminTeamRouter.get("/company-progress", teamController.getCompanyProgress);
adminTeamRouter.get("/leaderboard", teamController.getLeaderboard);
adminTeamRouter.get("/standup-summary", teamController.getStandupSummary);

// Members directory & management
adminTeamRouter.get("/members", teamController.listMembers);
adminTeamRouter.get("/members/:id/performance", teamController.getMemberPerformance);
adminTeamRouter.post("/members/:id/nudge", teamController.nudgeMember);
adminTeamRouter.post(
  "/members",
  requireRole(["SUPER_ADMIN"]),
  teamController.createMember
);
adminTeamRouter.patch(
  "/members/:id",
  requireRole(["SUPER_ADMIN"]),
  teamController.updateMember
);
adminTeamRouter.delete(
  "/members/:id",
  requireRole(["SUPER_ADMIN"]),
  teamController.deleteMember
);

// Departments
adminTeamRouter.get("/departments", teamController.listDepartments);
adminTeamRouter.post(
  "/departments",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  teamController.createDepartment
);
adminTeamRouter.patch(
  "/departments/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  teamController.updateDepartment
);
adminTeamRouter.delete(
  "/departments/:id",
  requireRole(["SUPER_ADMIN"]),
  teamController.deleteDepartment
);


