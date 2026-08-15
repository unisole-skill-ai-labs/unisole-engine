import { Router } from "express";
import { assignmentSubmissionsController } from "../controllers/assignmentSubmissions.controller";
import { validateBody } from "../middleware/validate";

export const assignmentSubmissionsRouter: Router = Router();

assignmentSubmissionsRouter.get("/", assignmentSubmissionsController.list);
assignmentSubmissionsRouter.get("/:id", assignmentSubmissionsController.getById);
assignmentSubmissionsRouter.post(
  "/",
  validateBody({ required: ["assignment_id", "user_id"] }),
  assignmentSubmissionsController.create
);
assignmentSubmissionsRouter.put("/:id", assignmentSubmissionsController.update);
assignmentSubmissionsRouter.delete("/:id", assignmentSubmissionsController.remove);
