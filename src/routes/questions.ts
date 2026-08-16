import { Router } from "express";
import { questionsController } from "../controllers/questions.controller";
import { validateBody } from "../middleware/validate";

export const questionsRouter: Router = Router();

questionsRouter.get("/", questionsController.list);
questionsRouter.get("/:id", questionsController.getById);
questionsRouter.post(
  "/",
  validateBody({ required: ["quiz_id", "question_text", "type"] }),
  questionsController.create
);
questionsRouter.put("/:id", questionsController.update);
questionsRouter.delete("/:id", questionsController.remove);
