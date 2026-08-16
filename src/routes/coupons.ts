import { Router } from "express";
import { couponsController } from "../controllers/coupons.controller";
import { validateBody } from "../middleware/validate";

export const couponsRouter: Router = Router();

couponsRouter.get("/", couponsController.list);
couponsRouter.get("/:id", couponsController.getById);
couponsRouter.post(
  "/",
  validateBody({ required: ["code", "discount_type"] }),
  couponsController.create
);
couponsRouter.put("/:id", couponsController.update);
couponsRouter.delete("/:id", couponsController.remove);
