import { Router } from "express";
import { liveQuestionsController } from "../controllers/liveQuestions.controller";
import { validateBody } from "../middleware/validate";

export const liveQuestionsRouter: Router = Router();

liveQuestionsRouter.get("/", liveQuestionsController.list);
liveQuestionsRouter.get("/:id", liveQuestionsController.getById);
liveQuestionsRouter.post(
  "/",
  validateBody({ required: ["quiz_id", "question_text"] }),
  liveQuestionsController.create
);
liveQuestionsRouter.put("/:id", liveQuestionsController.update);
liveQuestionsRouter.delete("/:id", liveQuestionsController.remove);
