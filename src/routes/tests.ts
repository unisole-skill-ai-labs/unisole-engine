import { Router } from "express";
import { testsController } from "../controllers/tests.controller";
import { validateBody } from "../middleware/validate";

export const testsRouter: Router = Router();

testsRouter.get("/", testsController.list);
testsRouter.get("/:id", testsController.getById);
testsRouter.post(
  "/",
  validateBody({ required: ["title"] }),
  testsController.create
);
testsRouter.put("/:id", testsController.update);
testsRouter.delete("/:id", testsController.remove);
