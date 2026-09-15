import { Router } from "express";
import { surveysController } from "../controllers/surveys.controller";
import { validateBody } from "../middleware/validate";

export const surveysPublicRouter: Router = Router();

// Get public survey definition by slug
surveysPublicRouter.get("/:slug", surveysController.getPublicSurvey);

// Submit student survey response
surveysPublicRouter.post(
  "/:slug/responses",
  validateBody({ required: ["name", "phone", "collegeName", "answers"] }),
  surveysController.submitSurvey
);
