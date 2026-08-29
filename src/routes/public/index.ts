import { Router } from "express";
import { pathwaysController } from "../../controllers/pathways.controller";
import { categoriesController } from "../../controllers/categories.controller";
import { collegesController } from "../../controllers/colleges.controller";
import { branchesController } from "../../controllers/branches.controller";
import { presentationsController } from "../../controllers/presentations.controller";
import { validateBody } from "../../middleware/validate";

export const publicRouter: Router = Router();

// Public catalog and metadata
publicRouter.get("/pathways", pathwaysController.listPublished);
publicRouter.get("/pathways/:slug", pathwaysController.getBySlug);
publicRouter.get("/categories", categoriesController.listActive);
publicRouter.get("/colleges", collegesController.listActive);
publicRouter.get("/branches", branchesController.listActive);

// Public presentation & live roadshow endpoints
publicRouter.get(
  "/presentations/sessions/:sessionCode",
  presentationsController.getPublicSessionByCode
);
publicRouter.post(
  "/presentations/sessions/:sessionCode/join",
  validateBody({ required: ["name", "phone"] }),
  presentationsController.joinPublicSession
);
