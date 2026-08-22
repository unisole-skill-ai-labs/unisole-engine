import { Router } from "express";
import { enrollmentsController } from "../controllers/enrollments.controller";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const enrollmentsRouter: Router = Router();

enrollmentsRouter.get("/", authMiddleware, enrollmentsController.list);
enrollmentsRouter.get("/:id", authMiddleware, enrollmentsController.getById);
enrollmentsRouter.post(
  "/",
  authMiddleware,
  validateBody({ required: ["course_id"] }),
  enrollmentsController.create
);
enrollmentsRouter.put("/:id", authMiddleware, enrollmentsController.update);
enrollmentsRouter.delete("/:id", authMiddleware, enrollmentsController.remove);
