import { Router } from "express";
import { ordersController } from "../controllers/orders.controller";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const ordersRouter: Router = Router();

// Create checkout order (can be authenticated user or guest registration)
ordersRouter.post("/checkout", ordersController.createCheckout);

// Authenticated user order queries
ordersRouter.get("/my-orders", authMiddleware, ordersController.listMyOrders);
ordersRouter.get("/:id", authMiddleware, ordersController.getById);
