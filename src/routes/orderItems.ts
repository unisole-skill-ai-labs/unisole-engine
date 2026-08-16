import { Router } from "express";
import { orderItemsController } from "../controllers/orderItems.controller";
import { validateBody } from "../middleware/validate";

export const orderItemsRouter: Router = Router();

orderItemsRouter.get("/", orderItemsController.list);
orderItemsRouter.get("/:id", orderItemsController.getById);
orderItemsRouter.post(
  "/",
  validateBody({ required: ["order_id", "course_id"] }),
  orderItemsController.create
);
orderItemsRouter.put("/:id", orderItemsController.update);
orderItemsRouter.delete("/:id", orderItemsController.remove);
