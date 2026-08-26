import { Router } from "express";
import { categoriesController } from "../../controllers/categories.controller";
import { validateBody } from "../../middleware/validate";

export const adminCategoriesRouter: Router = Router();

adminCategoriesRouter.get("/", categoriesController.list);
adminCategoriesRouter.get("/:id", categoriesController.getById);
adminCategoriesRouter.post("/", validateBody({ required: ["name", "slug"] }), categoriesController.create);
adminCategoriesRouter.put("/:id", categoriesController.update);
