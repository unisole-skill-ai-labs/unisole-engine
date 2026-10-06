import { Router } from "express";
import { modulesController } from "../../controllers/modules.controller";
import { validateBody } from "../../middleware/validate";

export const adminModulesRouter: Router = Router();

adminModulesRouter.get("/", modulesController.list);
adminModulesRouter.get("/:id", modulesController.getById);
adminModulesRouter.post("/", validateBody({ required: ["title", "slug"] }), modulesController.create);
adminModulesRouter.put("/:id", modulesController.update);

// Lessons
adminModulesRouter.post("/:id/lessons", validateBody({ required: ["lessonId", "position"] }), modulesController.attachLesson);
adminModulesRouter.post("/:id/reorder-lessons", validateBody({ required: ["lessonIds"] }), modulesController.reorderLessons);
adminModulesRouter.post("/:id/move-lesson", validateBody({ required: ["targetModuleId", "lessonId"] }), modulesController.moveLesson);
adminModulesRouter.delete("/:id/lessons/:lessonId", modulesController.detachLesson);
adminModulesRouter.get("/:id/lessons", modulesController.getLessons);
