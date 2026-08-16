import { Router } from "express";
import { reviewsController } from "../controllers/reviews.controller";
import { validateBody } from "../middleware/validate";

export const reviewsRouter: Router = Router();

reviewsRouter.get("/", reviewsController.list);
reviewsRouter.get("/:id", reviewsController.getById);
reviewsRouter.post(
  "/",
  validateBody({ required: ["user_id", "course_id", "rating"] }),
  reviewsController.create
);
reviewsRouter.put("/:id", reviewsController.update);
reviewsRouter.delete("/:id", reviewsController.remove);
