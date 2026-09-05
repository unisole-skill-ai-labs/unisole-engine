import { Router } from "express";
import { ordersController } from "../../controllers/orders.controller";

export const adminOrdersRouter: Router = Router();

adminOrdersRouter.get("/", ordersController.adminList);
adminOrdersRouter.get("/:id", ordersController.getById);
adminOrdersRouter.post("/:id/confirm-manual", ordersController.adminConfirmManual);
