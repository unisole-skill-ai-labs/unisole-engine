import { Router } from "express";
import { pathwaysController } from "../../controllers/pathways.controller";
import { categoriesController } from "../../controllers/categories.controller";
import { collegesController } from "../../controllers/colleges.controller";

export const publicRouter: Router = Router();

// Public catalog and metadata
publicRouter.get("/pathways", pathwaysController.listPublished);
publicRouter.get("/pathways/:slug", pathwaysController.getBySlug);
publicRouter.get("/categories", categoriesController.listActive);
publicRouter.get("/colleges", collegesController.listActive);
