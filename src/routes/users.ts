import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { validateBody } from "../middleware/validate";

export const usersRouter: Router = Router();

usersRouter.get("/", usersController.list);
usersRouter.get("/:id", usersController.getById);
usersRouter.post(
  "/",
  validateBody({ required: ["name", "email"] }),
  usersController.create
);
usersRouter.put("/:id", usersController.update);
usersRouter.delete("/:id", usersController.remove);
