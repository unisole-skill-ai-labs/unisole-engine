import { Request, Response } from "express";
import { webhookManager } from "../managers/webhook.manager";
import { asyncHandler } from "../middleware/async-handler";

export const webhookController = {
  handleRazorpay: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const result = await webhookManager.handleRazorpayWebhook(rawBody, signature, req.body);
    res.status(200).json({ status: "ok", result });
  }),
};
