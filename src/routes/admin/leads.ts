import { Router } from "express";
import { leadsController } from "../../controllers/leads.controller";

export const adminLeadsRouter: Router = Router();

// Analytics & Meta
adminLeadsRouter.get("/analytics", leadsController.getAnalytics);
adminLeadsRouter.get("/meta", leadsController.getMeta);

// Bulk Operations
adminLeadsRouter.post("/bulk-assign", leadsController.bulkAssign);
adminLeadsRouter.post("/bulk-status", leadsController.bulkUpdateStatus);
adminLeadsRouter.post("/import", leadsController.bulkImport);

// Lead Entity Operations
adminLeadsRouter.get("/", leadsController.list);
adminLeadsRouter.post("/", leadsController.create);
adminLeadsRouter.get("/:id", leadsController.getById);
adminLeadsRouter.patch("/:id", leadsController.update);
adminLeadsRouter.put("/:id", leadsController.update);
adminLeadsRouter.delete("/:id", leadsController.delete);

// Call Logging & History
adminLeadsRouter.post("/:id/calls", leadsController.logCall);
adminLeadsRouter.get("/:id/calls", leadsController.getCallLogs);
