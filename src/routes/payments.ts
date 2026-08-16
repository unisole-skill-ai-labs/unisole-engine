import { Router } from "express";
import { paymentsController } from "../controllers/payments.controller";
import { validateBody } from "../middleware/validate";

export const paymentsRouter: Router = Router();

paymentsRouter.get("/", paymentsController.list);
paymentsRouter.get("/:id", paymentsController.getById);
paymentsRouter.post(
  "/",
  validateBody({ required: ["order_id"] }),
  paymentsController.create
);
paymentsRouter.put("/:id", paymentsController.update);
paymentsRouter.delete("/:id", paymentsController.remove);
