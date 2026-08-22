import { Router } from "express";
import { modulesController } from "../controllers/modules.controller";
import { validateBody } from "../middleware/validate";

export const modulesRouter: Router = Router();

modulesRouter.get("/", modulesController.list);
modulesRouter.get("/:id", modulesController.getById);
modulesRouter.post(
  "/",
  validateBody({ required: ["title"] }),
  modulesController.create
);
modulesRouter.put("/:id", modulesController.update);
modulesRouter.delete("/:id", modulesController.remove);
