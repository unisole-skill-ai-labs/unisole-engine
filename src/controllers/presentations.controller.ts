import { Request, Response, NextFunction } from "express";
import { presentationsService } from "../services/presentations.service";

export const presentationsController = {
  // ==================== ADMIN: PRESENTATION DECKS ====================
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.list();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as any).user;
      const data = await presentationsService.create({
        ...req.body,
        createdById: authUser?.id,
      });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.remove(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ==================== ADMIN: LIVE SESSIONS ====================
  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const presentationId = req.query.presentationId as string | undefined;
      const data = await presentationsService.listSessions(presentationId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.getSessionById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async launchSession(req: Request, res: Response, next: NextFunction) {
    try {
      const clientBaseUrl =
        process.env.SEO_URL ||
        process.env.CLIENT_URL ||
        "https://unisole.org";
      const data = await presentationsService.launchSession(
        req.params.id,
        {
          ...req.body,
          clientBaseUrl,
        }
      );
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateSessionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.updateSessionStatus(
        req.params.id,
        req.body.status
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getSessionLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.listSessionLeads(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async exportSessionLeadsCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename, csvContent } =
        await presentationsService.exportSessionLeadsCsv(req.params.id);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(csvContent);
    } catch (err) {
      next(err);
    }
  },

  // ==================== PUBLIC: AUDIENCE ====================
  async getPublicSessionByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.getSessionByCode(
        req.params.sessionCode
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async joinPublicSession(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await presentationsService.joinSessionExpress(
        req.params.sessionCode,
        req.body
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
