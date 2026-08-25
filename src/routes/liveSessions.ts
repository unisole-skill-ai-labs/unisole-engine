import { Router } from "express";
import { liveSessionsController } from "../controllers/liveSessions.controller";
import { validateBody } from "../middleware/validate";

export const liveSessionsRouter: Router = Router();

liveSessionsRouter.get("/", liveSessionsController.list);
liveSessionsRouter.get("/:id", liveSessionsController.getById);
liveSessionsRouter.post(
  "/",
  validateBody({ required: ["quiz_id", "session_name", "institute_name"] }),
  liveSessionsController.create
);
liveSessionsRouter.put("/:id", liveSessionsController.update);
liveSessionsRouter.delete("/:id", liveSessionsController.remove);
