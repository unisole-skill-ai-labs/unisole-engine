import { Router } from "express";
import { enrollmentsController } from "../../controllers/enrollments.controller";
import { validateBody } from "../../middleware/validate";

export const adminEnrollmentsRouter: Router = Router();

adminEnrollmentsRouter.get("/", enrollmentsController.list);
adminEnrollmentsRouter.get("/:id", enrollmentsController.getById);
adminEnrollmentsRouter.post("/", validateBody({ required: ["userId", "pathwayId"] }), enrollmentsController.create);
adminEnrollmentsRouter.put("/:id", enrollmentsController.update);
