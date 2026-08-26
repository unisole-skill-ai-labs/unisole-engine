import { Request, Response } from "express";
import { paymentsService } from "../services/payments.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const paymentsController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await paymentsService.list(req.user));
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await paymentsService.getById(req.params.id));
  }),
  createOrder: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const { pathwayId } = req.body;
    const order = await paymentsService.createOrder(userId, pathwayId);
    res.status(201).json(order);
  }),
  verifyPayment: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentsService.verifyPayment(req.body);
    res.json(result);
  }),
  webhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const result = await paymentsService.handleWebhook(rawBody, signature, req.body);
    res.json(result);
  }),
};
