import { Router } from "express";
import { usersController } from "../../controllers/users.controller";

export const adminStudentsRouter: Router = Router();

adminStudentsRouter.get("/", usersController.list);
adminStudentsRouter.get("/:id", usersController.getById);
adminStudentsRouter.put("/:id", usersController.update);
adminStudentsRouter.post("/:id/deactivate", usersController.deactivate);
