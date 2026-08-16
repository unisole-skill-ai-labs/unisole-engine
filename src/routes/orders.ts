import { Router } from "express";
import { ordersController } from "../controllers/orders.controller";
import { validateBody } from "../middleware/validate";

export const ordersRouter: Router = Router();

ordersRouter.get("/", ordersController.list);
ordersRouter.get("/:id", ordersController.getById);
ordersRouter.post(
  "/",
  validateBody({ required: ["user_id"] }),
  ordersController.create
);
ordersRouter.put("/:id", ordersController.update);
ordersRouter.delete("/:id", ordersController.remove);
