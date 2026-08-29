import { Router } from "express";
import { tasksController } from "../../controllers/tasks.controller";
import { requireRole } from "../../middleware/auth";

export const adminTasksRouter: Router = Router();

// Leader Radar KPI Summary (Super Admin & Admin)
adminTasksRouter.get("/radar", tasksController.getLeaderRadar);

// Tasks List & Detail
adminTasksRouter.get("/", tasksController.list);
adminTasksRouter.get("/:id", tasksController.getById);
adminTasksRouter.post("/", tasksController.create);
adminTasksRouter.patch("/:id", tasksController.update);
adminTasksRouter.delete("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), tasksController.delete);

// Subtasks / Checklist actions
adminTasksRouter.patch("/:taskId/subtasks/:subtaskId", tasksController.toggleSubtask);
adminTasksRouter.post("/:taskId/subtasks", tasksController.addSubtask);
adminTasksRouter.delete("/:taskId/subtasks/:subtaskId", tasksController.deleteSubtask);

// Workflow Actions: Submit Proof, Flag Blocked, Leader Review
adminTasksRouter.post("/:taskId/submit", tasksController.submitForReview);
adminTasksRouter.post("/:taskId/block", tasksController.flagBlocked);
adminTasksRouter.post("/:taskId/review", requireRole(["SUPER_ADMIN", "ADMIN"]), tasksController.reviewTask);

// Comments
adminTasksRouter.post("/:taskId/comments", tasksController.addComment);
