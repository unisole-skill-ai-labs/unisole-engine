import { Router } from "express";
import { moduleItemsController } from "../controllers/moduleItems.controller";
import { validateBody } from "../middleware/validate";

export const moduleItemsRouter: Router = Router();

moduleItemsRouter.get("/", moduleItemsController.list);
moduleItemsRouter.get("/:id", moduleItemsController.getById);
moduleItemsRouter.post(
  "/",
  validateBody({ required: ["title", "type"] }),
  moduleItemsController.create
);
moduleItemsRouter.put("/:id", moduleItemsController.update);
moduleItemsRouter.delete("/:id", moduleItemsController.remove);
