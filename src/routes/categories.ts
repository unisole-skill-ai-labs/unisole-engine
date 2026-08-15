import { Router } from "express";
import { categoriesController } from "../controllers/categories.controller";
import { validateBody } from "../middleware/validate";

export const categoriesRouter: Router = Router();

categoriesRouter.get("/", categoriesController.list);
categoriesRouter.get("/:id", categoriesController.getById);
categoriesRouter.post(
  "/",
  validateBody({ required: ["name"] }),
  categoriesController.create
);
categoriesRouter.put("/:id", categoriesController.update);
categoriesRouter.delete("/:id", categoriesController.remove);
