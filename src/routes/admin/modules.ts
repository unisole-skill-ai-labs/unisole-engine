import { Router } from "express";
import { modulesController } from "../../controllers/modules.controller";
import { validateBody } from "../../middleware/validate";
import { requireRole } from "../../middleware/auth";

export const adminModulesRouter: Router = Router();

const canManageModules = requireRole(["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER"]);

adminModulesRouter.get("/", modulesController.list);
adminModulesRouter.get("/:id", modulesController.getById);
adminModulesRouter.post("/", canManageModules, validateBody({ required: ["title", "slug"] }), modulesController.create);
adminModulesRouter.put("/:id", canManageModules, modulesController.update);

// Lessons
adminModulesRouter.post("/:id/create-lesson", canManageModules, validateBody({ required: ["title", "slug"] }), modulesController.createAndAttachLesson);
adminModulesRouter.post("/:id/lessons", canManageModules, validateBody({ required: ["lessonId"] }), modulesController.attachLesson);
adminModulesRouter.post("/:id/reorder-lessons", canManageModules, validateBody({ required: ["lessonIds"] }), modulesController.reorderLessons);
adminModulesRouter.post("/:id/move-lesson", canManageModules, validateBody({ required: ["targetModuleId", "lessonId"] }), modulesController.moveLesson);
adminModulesRouter.delete("/:id/lessons/:lessonId", canManageModules, modulesController.detachLesson);
adminModulesRouter.get("/:id/lessons", modulesController.getLessons);
