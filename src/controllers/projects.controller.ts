import { Request, Response } from "express";
import { projectsService } from "../services/projects.service";

export const projectsController = {
  async listProjects(req: Request, res: Response) {
    try {
      const { departmentId, leadId, status, priority, search, limit, offset } = req.query;
      const data = await projectsService.listProjects({
        departmentId: departmentId as string,
        leadId: leadId as string,
        status: status as any,
        priority: priority as any,
        search: search as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("listProjects error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to list projects" });
    }
  },

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await projectsService.getProjectById(id);
      if (!data) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("getProjectById error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to get project" });
    }
  },

  async getProjectHierarchy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await projectsService.getProjectHierarchy(id);
      if (!data) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("getProjectHierarchy error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to get hierarchy" });
    }
  },

  async createProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await projectsService.createProject({
        ...req.body,
        createdById: userId,
      });
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      console.error("createProject error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to create project" });
    }
  },

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await projectsService.updateProject(id, req.body);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("updateProject error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to update project" });
    }
  },

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await projectsService.deleteProject(id);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("deleteProject error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to delete project" });
    }
  },

  async listSubProjects(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const data = await projectsService.listSubProjects(projectId);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("listSubProjects error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to list sub-projects" });
    }
  },

  async createSubProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const data = await projectsService.createSubProject(projectId, req.body);
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      console.error("createSubProject error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to create sub-project" });
    }
  },

  async updateSubProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await projectsService.updateSubProject(id, req.body);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("updateSubProject error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to update sub-project" });
    }
  },

  async deleteSubProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await projectsService.deleteSubProject(id);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("deleteSubProject error:", error);
      return res.status(500).json({ success: false, error: error.message || "Failed to delete sub-project" });
    }
  },
};
