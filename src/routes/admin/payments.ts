import { Router } from "express";
import { paymentsController } from "../../controllers/payments.controller";

export const adminPaymentsRouter: Router = Router();

adminPaymentsRouter.get("/", paymentsController.list);
adminPaymentsRouter.get("/:id", paymentsController.getById);
