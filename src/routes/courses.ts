import { Router } from "express";
import { coursesController } from "../controllers/courses.controller";
import { validateBody } from "../middleware/validate";

export const coursesRouter: Router = Router();

coursesRouter.get("/", coursesController.list);
coursesRouter.get("/:id", coursesController.getById);
coursesRouter.get("/:id/modules", coursesController.modules);
coursesRouter.get("/:id/tree", coursesController.tree);
coursesRouter.post(
  "/",
  validateBody({ required: ["title", "slug"] }),
  coursesController.create
);
coursesRouter.put("/:id", coursesController.update);
coursesRouter.delete("/:id", coursesController.remove);
