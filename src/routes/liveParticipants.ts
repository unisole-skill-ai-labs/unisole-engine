import { Router } from "express";
import { liveParticipantsController } from "../controllers/liveParticipants.controller";
import { validateBody } from "../middleware/validate";

export const liveParticipantsRouter: Router = Router();

liveParticipantsRouter.get("/", liveParticipantsController.list);
liveParticipantsRouter.get("/:id", liveParticipantsController.getById);
liveParticipantsRouter.post(
  "/",
  validateBody({ required: ["session_id", "name", "phone"] }),
  liveParticipantsController.create
);
liveParticipantsRouter.put("/:id", liveParticipantsController.update);
liveParticipantsRouter.delete("/:id", liveParticipantsController.remove);
