import { Router } from "express";
import { quizzesController } from "../controllers/quizzes.controller";
import { validateBody } from "../middleware/validate";

export const quizzesRouter: Router = Router();

quizzesRouter.get("/", quizzesController.list);
quizzesRouter.get("/:id", quizzesController.getById);
quizzesRouter.post(
  "/",
  validateBody({ required: ["title"] }),
  quizzesController.create
);
quizzesRouter.put("/:id", quizzesController.update);
quizzesRouter.delete("/:id", quizzesController.remove);
