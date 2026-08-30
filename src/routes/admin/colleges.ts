import { Router } from "express";
import { collegesController } from "../../controllers/colleges.controller";
import { validateBody } from "../../middleware/validate";

export const adminCollegesRouter: Router = Router();

adminCollegesRouter.get("/", collegesController.list);
adminCollegesRouter.get("/lead-diversification", collegesController.getLeadDiversification);
adminCollegesRouter.get("/:id/analytics", collegesController.getAnalytics);
adminCollegesRouter.get("/:id", collegesController.getById);
adminCollegesRouter.post("/", validateBody({ required: ["name", "slug"] }), collegesController.create);
adminCollegesRouter.put("/:id", collegesController.update);
adminCollegesRouter.delete("/:id", collegesController.delete);
