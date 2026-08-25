import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller";

export const webhooksRouter = Router();

// Route: POST /api/webhooks/razorpay
webhooksRouter.post("/razorpay", webhookController.handleRazorpay);
