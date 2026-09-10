import { Request, Response } from "express";
import { projectsService } from "../services/projects.service";

export const projectsController = {
  async listProjects(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

      const { departmentId, leadId, memberId, status, priority, search, hasBlockers, hasReview, limit, offset, includeHidden, onlyHidden } = req.query;
      const data = await projectsService.listProjects({
        departmentId: departmentId as string,
        leadId: leadId as string,
        memberId: (memberId || req.query.userId) as string,
        status: status as any,
        priority: priority as any,
        search: search as string,
        hasBlockers: hasBlockers === "true" || hasBlockers === "1",
        hasReview: hasReview === "true" || hasReview === "1",
        includeHidden: isAdmin && (includeHidden === "true" || includeHidden === "1"),
        onlyHidden: isAdmin && (onlyHidden === "true" || onlyHidden === "1"),
        userId: user?.id,
        userRole: user?.role,
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
      const user = (req as any).user;
      const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

      const data = await projectsService.getProjectById(id, user?.id, user?.role);
      if (!data) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      if (data.isHidden && !isAdmin) {
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
      const user = (req as any).user;
      const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
      const { memberId, userId: queryUserId } = req.query;

      const data = await projectsService.getProjectHierarchy(
        id,
        user?.id,
        user?.role,
        (memberId || queryUserId) as string
      );
      if (!data) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      if (data.project?.isHidden && !isAdmin) {
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
      const user = (req as any).user;
      
      // Admin-only check for toggling isHidden
      if (req.body.isHidden !== undefined) {
        const userRole = user?.role;
        if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
          return res.status(403).json({
            success: false,
            error: "Only administrators can change project visibility / hide projects in WorkSole",
          });
        }
      }

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
