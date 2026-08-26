import { Router } from "express";
import { coursesController } from "../../controllers/courses.controller";
import { validateBody } from "../../middleware/validate";

export const adminCoursesRouter: Router = Router();

adminCoursesRouter.get("/", coursesController.list);
adminCoursesRouter.get("/:id", coursesController.getById);
adminCoursesRouter.post("/", validateBody({ required: ["title", "slug"] }), coursesController.create);
adminCoursesRouter.put("/:id", coursesController.update);

// Modules
adminCoursesRouter.post("/:id/modules", validateBody({ required: ["moduleId", "position"] }), coursesController.attachModule);
adminCoursesRouter.delete("/:id/modules/:moduleId", coursesController.detachModule);
adminCoursesRouter.get("/:id/modules", coursesController.getModules);
