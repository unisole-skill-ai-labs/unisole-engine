import { Router } from "express";
import { courseModulesController } from "../controllers/courseModules.controller";
import { validateBody } from "../middleware/validate";

export const courseModulesRouter: Router = Router();

courseModulesRouter.get("/", courseModulesController.list);
courseModulesRouter.get("/:id", courseModulesController.getById);
courseModulesRouter.post(
  "/",
  validateBody({ required: ["course_id", "module_id"] }),
  courseModulesController.create
);
courseModulesRouter.put("/:id", courseModulesController.update);
courseModulesRouter.delete("/:id", courseModulesController.remove);
