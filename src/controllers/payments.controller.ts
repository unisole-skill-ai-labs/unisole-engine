import { Request, Response } from "express";
import { paymentsService } from "../services/payments.service";
import { ordersService } from "../services/orders.service";
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
    const { pathwayId, workshopId, items, couponCode } = req.body;
    
    let resolvedItems = items;
    if (!resolvedItems && pathwayId) {
      resolvedItems = [{ itemType: "PATHWAY", itemId: pathwayId, quantity: 1 }];
    } else if (!resolvedItems && workshopId) {
      resolvedItems = [{ itemType: "WORKSHOP", itemId: workshopId, quantity: 1 }];
    }

    const orderResult = await ordersService.createCheckoutOrder({
      userId,
      items: resolvedItems,
      couponCode,
    });
    res.status(201).json(orderResult);
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
