import { Response } from "express";
import { CustomRequest } from "../middleware/auth";
import { iaptService } from "../services/iapt.service";

export class IaptController {
  async registerNain(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Missing authentication" });
        return;
      }

      const { category, institution, cityState } = req.body;
      if (!category || !institution || !cityState) {
        res.status(400).json({
          error: "Missing required fields: category, institution, and city/state are required",
        });
        return;
      }

      const result = await iaptService.registerNain(userId, {
        category,
        institution,
        cityState,
      });

      res.status(200).json({
        success: true,
        message: result.isNew
          ? "Registered with NAIN successfully"
          : "NAIN registration updated successfully",
        data: result.registration,
      });
    } catch (err: any) {
      console.error("[IAPT Controller] Registration error:", err);
      res.status(500).json({
        error: err.message || "Failed to process NAIN registration",
      });
    }
  }

  async getMyRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Missing authentication" });
        return;
      }

      const registration = await iaptService.getMyRegistration(userId);
      res.status(200).json({
        success: true,
        data: registration,
      });
    } catch (err: any) {
      console.error("[IAPT Controller] Get registration error:", err);
      res.status(500).json({
        error: err.message || "Failed to fetch NAIN registration",
      });
    }
  }

  async getAllRegistrations(_req: CustomRequest, res: Response): Promise<void> {
    try {
      const registrations = await iaptService.getAllRegistrations();
      res.status(200).json({
        success: true,
        data: registrations,
      });
    } catch (err: any) {
      console.error("[IAPT Controller] List registrations error:", err);
      res.status(500).json({
        error: err.message || "Failed to list NAIN registrations",
      });
    }
  }
}

export const iaptController = new IaptController();
