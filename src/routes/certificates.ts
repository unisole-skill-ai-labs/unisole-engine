import { Router } from "express";
import { certificatesController } from "../controllers/certificates.controller";
import { validateBody } from "../middleware/validate";

export const certificatesRouter: Router = Router();

certificatesRouter.get("/", certificatesController.list);
certificatesRouter.get("/:id", certificatesController.getById);
certificatesRouter.post(
  "/",
  validateBody({ required: ["user_id", "course_id"] }),
  certificatesController.create
);
certificatesRouter.put("/:id", certificatesController.update);
certificatesRouter.delete("/:id", certificatesController.remove);
