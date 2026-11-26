import { Router } from "express";
import { lessonsController } from "../../controllers/lessons.controller";
import { validateBody } from "../../middleware/validate";
import { requireRole } from "../../middleware/auth";
import { adminVideosRouter } from "./videos";

export const adminLessonsRouter: Router = Router();

const canManageLessons = requireRole(["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER"]);

adminLessonsRouter.use("/:id/video", adminVideosRouter);

adminLessonsRouter.get("/", lessonsController.list);
adminLessonsRouter.get("/orphans", canManageLessons, lessonsController.listOrphans);
adminLessonsRouter.get("/:id", lessonsController.getById);
adminLessonsRouter.post("/", canManageLessons, validateBody({ required: ["title", "slug"] }), lessonsController.create);
adminLessonsRouter.put("/:id", canManageLessons, lessonsController.update);
