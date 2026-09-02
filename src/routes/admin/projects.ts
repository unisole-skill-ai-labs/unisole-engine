import { Router } from "express";
import { projectsController } from "../../controllers/projects.controller";

export const adminProjectsRouter = Router();

// Project Routes
adminProjectsRouter.get("/", projectsController.listProjects);
adminProjectsRouter.get("/:id", projectsController.getProjectById);
adminProjectsRouter.get("/:id/hierarchy", projectsController.getProjectHierarchy);
adminProjectsRouter.post("/", projectsController.createProject);
adminProjectsRouter.put("/:id", projectsController.updateProject);
adminProjectsRouter.delete("/:id", projectsController.deleteProject);

// SubProject Routes under Project
adminProjectsRouter.get("/:projectId/sub-projects", projectsController.listSubProjects);
adminProjectsRouter.post("/:projectId/sub-projects", projectsController.createSubProject);

// Direct SubProject routes
export const adminSubProjectsRouter = Router();
adminSubProjectsRouter.put("/:id", projectsController.updateSubProject);
adminSubProjectsRouter.delete("/:id", projectsController.deleteSubProject);
