import { Router } from "express";
import { liveQuizzesController } from "../controllers/liveQuizzes.controller";
import { validateBody } from "../middleware/validate";

export const liveQuizzesRouter: Router = Router();

liveQuizzesRouter.get("/", liveQuizzesController.list);
liveQuizzesRouter.get("/:id", liveQuizzesController.getById);
liveQuizzesRouter.post(
  "/",
  validateBody({ required: ["title"] }),
  liveQuizzesController.create
);
liveQuizzesRouter.put("/:id", liveQuizzesController.update);
liveQuizzesRouter.delete("/:id", liveQuizzesController.remove);
