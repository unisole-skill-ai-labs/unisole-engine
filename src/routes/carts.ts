import { Router } from "express";
import { cartsController } from "../controllers/carts.controller";
import { validateBody } from "../middleware/validate";

export const cartsRouter: Router = Router();

cartsRouter.get("/", cartsController.list);
cartsRouter.get("/:id", cartsController.getById);
cartsRouter.post(
  "/",
  validateBody({ required: ["user_id"] }),
  cartsController.create
);
cartsRouter.put("/:id", cartsController.update);
cartsRouter.delete("/:id", cartsController.remove);
