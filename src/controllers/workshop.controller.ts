import { Response } from "express";
import { CustomRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/async-handler";
import { workshopService } from "../services/workshop.service";

export const workshopController = {
  register: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await workshopService.register(req.body);
    res.status(200).json(result);
  }),

  saveSurvey: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id || req.body.userId;
    const phone = req.body.phone;
    const result = await workshopService.saveSurvey({
      ...req.body,
      userId,
      phone,
    });
    res.status(200).json(result);
  }),

  getMyStatus: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;
    const phone = req.query.phone as string | undefined;
    const status = await workshopService.getMyStatus(userId, phone);
    res.status(200).json({
      success: true,
      status,
    });
  }),

  createTokenOrder: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id || req.body.userId;
    const phone = req.body.phone;
    const order = await workshopService.createTokenOrder(userId, phone);
    res.status(200).json({
      success: true,
      data: order,
    });
  }),

  verifyTokenPayment: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id || req.body.userId;
    const phone = req.body.phone;
    const result = await workshopService.verifyTokenPayment({
      ...req.body,
      userId,
      phone,
    });
    res.status(200).json(result);
  }),

  generateQrCode: asyncHandler(async (req: CustomRequest, res: Response) => {
    const targetUrl = (req.query.url as string) || (req.body.url as string) || "https://unisole.org/workshop";
    const qrDataUrl = await workshopService.generateQrCode(targetUrl);
    res.status(200).json({
      success: true,
      qrDataUrl,
      targetUrl,
    });
  }),
};
