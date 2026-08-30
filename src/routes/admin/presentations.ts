import { Router } from "express";
import { presentationsController } from "../../controllers/presentations.controller";
import { validateBody } from "../../middleware/validate";

export const adminPresentationsRouter: Router = Router();

// ==================== PRESENTATION DECKS ====================
adminPresentationsRouter.get("/", presentationsController.list);
adminPresentationsRouter.get("/:id", presentationsController.getById);
adminPresentationsRouter.post(
  "/",
  validateBody({ required: ["title", "collegeId"] }),
  presentationsController.create
);
adminPresentationsRouter.put("/:id", presentationsController.update);
adminPresentationsRouter.delete("/:id", presentationsController.remove);

// ==================== LIVE SESSIONS ====================
adminPresentationsRouter.get("/sessions/all", presentationsController.listSessions);
adminPresentationsRouter.get("/sessions/:id", presentationsController.getSession);
adminPresentationsRouter.post("/:id/launch", presentationsController.launchSession);
adminPresentationsRouter.patch(
  "/sessions/:id/status",
  validateBody({ required: ["status"] }),
  presentationsController.updateSessionStatus
);
adminPresentationsRouter.get(
  "/sessions/:id/leads",
  presentationsController.getSessionLeads
);
adminPresentationsRouter.get(
  "/sessions/:id/analytics",
  presentationsController.getSessionAnalytics
);
