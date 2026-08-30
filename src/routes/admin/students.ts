import { Router } from "express";
import { usersController } from "../../controllers/users.controller";
import { validateBody } from "../../middleware/validate";

export const adminStudentsRouter: Router = Router();

adminStudentsRouter.get("/", usersController.list);
adminStudentsRouter.post("/", validateBody({ required: ["phone"] }), usersController.create);
adminStudentsRouter.get("/:id", usersController.getById);
adminStudentsRouter.put("/:id", usersController.update);
adminStudentsRouter.delete("/:id", usersController.delete);
adminStudentsRouter.post("/:id/deactivate", usersController.deactivate);
