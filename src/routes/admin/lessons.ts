import { Router } from "express";
import { lessonsController } from "../../controllers/lessons.controller";
import { validateBody } from "../../middleware/validate";

export const adminLessonsRouter: Router = Router();

adminLessonsRouter.get("/", lessonsController.list);
adminLessonsRouter.get("/:id", lessonsController.getById);
adminLessonsRouter.post("/", validateBody({ required: ["title", "slug"] }), lessonsController.create);
adminLessonsRouter.put("/:id", lessonsController.update);
