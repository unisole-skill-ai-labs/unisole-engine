import { Router } from "express";
import { mentorshipController } from "../../controllers/mentorship.controller";
import { validateBody } from "../../middleware/validate";
import { requireRole } from "../../middleware/auth";

export const adminMentorshipRouter: Router = Router();

// List all active mentors with current mentee workloads
adminMentorshipRouter.get("/mentors", mentorshipController.listMentors);

// List active mentor-mentee allocations
adminMentorshipRouter.get("/mappings", mentorshipController.listMentorships);

// Strictly Admin-only: Assign or reassign mentee(s) to a mentor
adminMentorshipRouter.post(
  "/assign",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validateBody({ required: ["mentorId", "menteeIds"] }),
  mentorshipController.assignMentor
);

// Strictly Admin-only: Unassign a mentee
adminMentorshipRouter.post(
  "/unassign",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  mentorshipController.unassignMentor
);
