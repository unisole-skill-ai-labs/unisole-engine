import { Router } from "express";
import { enrollmentsController } from "../controllers/enrollments.controller";
import { validateBody } from "../middleware/validate";

export const enrollmentsRouter: Router = Router();

enrollmentsRouter.get("/", enrollmentsController.list);
enrollmentsRouter.get("/:id", enrollmentsController.getById);
enrollmentsRouter.post(
  "/",
  validateBody({ required: ["user_id", "course_id"] }),
  enrollmentsController.create
);
enrollmentsRouter.put("/:id", enrollmentsController.update);
enrollmentsRouter.delete("/:id", enrollmentsController.remove);
