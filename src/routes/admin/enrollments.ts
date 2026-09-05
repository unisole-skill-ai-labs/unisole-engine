import { Router } from "express";
import { enrollmentsController } from "../../controllers/enrollments.controller";
import { validateBody } from "../../middleware/validate";

export const adminEnrollmentsRouter: Router = Router();

adminEnrollmentsRouter.get("/", enrollmentsController.list);
adminEnrollmentsRouter.get("/:id", enrollmentsController.getById);
adminEnrollmentsRouter.post(
  "/",
  validateBody({ required: ["userId"] }),
  enrollmentsController.create
);
adminEnrollmentsRouter.post(
  "/manual-grant",
  validateBody({ required: ["userId", "itemType", "itemId"] }),
  enrollmentsController.adminManualGrant
);
adminEnrollmentsRouter.post("/:id/revoke", enrollmentsController.adminRevoke);
adminEnrollmentsRouter.put("/:id", enrollmentsController.update);

