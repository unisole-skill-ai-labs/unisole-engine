import { Response } from "express";
import { CustomRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/async-handler";
import { workshopService } from "../services/workshop.service";

export const workshopController = {
  register: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await workshopService.register(req.body);
    res.status(200).json(result);
  }),

  getMyRegistration: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;
    const phone = req.query.phone as string | undefined;
    const registration = await workshopService.getMyRegistration(userId, phone);
    res.status(200).json({
      success: true,
      registration,
    });
  }),

  createTokenOrder: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;
    const { registrationId, phone } = req.body;
    const order = await workshopService.createTokenOrder(userId, registrationId, phone);
    res.status(200).json({
      success: true,
      data: order,
    });
  }),

  verifyTokenPayment: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await workshopService.verifyTokenPayment(req.body);
    res.status(200).json(result);
  }),

  generateQrCode: asyncHandler(async (req: CustomRequest, res: Response) => {
    const targetUrl = (req.query.url as string) || (req.body.url as string);
    const qrDataUrl = await workshopService.generateQrCode(targetUrl);
    res.status(200).json({
      success: true,
      qrDataUrl,
      targetUrl,
    });
  }),

  listRegistrations: asyncHandler(async (req: CustomRequest, res: Response) => {
    const filters = {
      search: req.query.search as string,
      paymentStatus: req.query.paymentStatus as string,
      collegeId: req.query.collegeId as string,
      referredBy: req.query.referredBy as string,
      campaignSource: req.query.campaignSource as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };
    const result = await workshopService.listRegistrations(filters);
    res.status(200).json({
      success: true,
      ...result,
    });
  }),

  getStats: asyncHandler(async (_req: CustomRequest, res: Response) => {
    const stats = await workshopService.getStats();
    res.status(200).json({
      success: true,
      stats,
    });
  }),
};
