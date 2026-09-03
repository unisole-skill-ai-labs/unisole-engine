import { Router } from "express";
import { iaptController } from "../controllers/iapt.controller";
import { authMiddleware, requireRole } from "../middleware/auth";

export const iaptRouter: Router = Router();

// Protected user routes (require valid IAPT or Unisole auth token)
iaptRouter.post("/nain/register", authMiddleware, iaptController.registerNain);
iaptRouter.get("/nain/my-registration", authMiddleware, iaptController.getMyRegistration);

// Admin-only reporting route
iaptRouter.get(
  "/nain/registrations",
  authMiddleware,
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  iaptController.getAllRegistrations
);
