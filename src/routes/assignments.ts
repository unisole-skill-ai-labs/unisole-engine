import { Router } from "express";
import { assignmentsController } from "../controllers/assignments.controller";
import { validateBody } from "../middleware/validate";

export const assignmentsRouter: Router = Router();

assignmentsRouter.get("/", assignmentsController.list);
assignmentsRouter.get("/:id", assignmentsController.getById);
assignmentsRouter.post(
  "/",
  validateBody({ required: ["title"] }),
  assignmentsController.create
);
assignmentsRouter.put("/:id", assignmentsController.update);
assignmentsRouter.delete("/:id", assignmentsController.remove);
