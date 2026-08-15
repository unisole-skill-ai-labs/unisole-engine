import { Router } from "express";
import { moduleLessonsController } from "../controllers/moduleLessons.controller";
import { validateBody } from "../middleware/validate";

export const moduleLessonsRouter: Router = Router();

moduleLessonsRouter.get("/", moduleLessonsController.list);
moduleLessonsRouter.get("/:id", moduleLessonsController.getById);
moduleLessonsRouter.post(
  "/",
  validateBody({ required: ["module_id", "module_item_id"] }),
  moduleLessonsController.create
);
moduleLessonsRouter.put("/:id", moduleLessonsController.update);
moduleLessonsRouter.delete("/:id", moduleLessonsController.remove);
