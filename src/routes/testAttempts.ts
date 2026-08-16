import { Router } from "express";
import { testAttemptsController } from "../controllers/testAttempts.controller";
import { validateBody } from "../middleware/validate";

export const testAttemptsRouter: Router = Router();

testAttemptsRouter.get("/", testAttemptsController.list);
testAttemptsRouter.get("/:id", testAttemptsController.getById);
testAttemptsRouter.post(
  "/",
  validateBody({ required: ["test_id", "user_id"] }),
  testAttemptsController.create
);
testAttemptsRouter.put("/:id", testAttemptsController.update);
testAttemptsRouter.delete("/:id", testAttemptsController.remove);
