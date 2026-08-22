import { Router } from "express";
import { testAttemptsController } from "../controllers/testAttempts.controller";
import { optionalAuthMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const testAttemptsRouter: Router = Router();

testAttemptsRouter.get("/", optionalAuthMiddleware, testAttemptsController.list);
testAttemptsRouter.get("/:id", optionalAuthMiddleware, testAttemptsController.getById);
testAttemptsRouter.post(
  "/",
  optionalAuthMiddleware,
  validateBody({ required: ["test_id"] }),
  testAttemptsController.create
);
testAttemptsRouter.put("/:id", optionalAuthMiddleware, testAttemptsController.update);
testAttemptsRouter.delete("/:id", optionalAuthMiddleware, testAttemptsController.remove);
