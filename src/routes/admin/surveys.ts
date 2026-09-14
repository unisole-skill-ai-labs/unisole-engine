import { Router } from "express";
import { surveysController } from "../../controllers/surveys.controller";

export const adminSurveysRouter: Router = Router();

// List all surveys
adminSurveysRouter.get("/", surveysController.listSurveys);

// Export responses to CSV
adminSurveysRouter.get("/:slug/export", surveysController.exportCsv);

// Aggregate stats for survey
adminSurveysRouter.get("/:slug/stats", surveysController.getStats);

// List responses for survey
adminSurveysRouter.get("/:slug/responses", surveysController.listResponses);

// Get survey detail with schema
adminSurveysRouter.get("/:slug", surveysController.getSurveyDetail);

// Update survey schema/settings
adminSurveysRouter.put("/:slug", surveysController.updateSurvey);
