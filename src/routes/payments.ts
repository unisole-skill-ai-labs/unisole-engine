import { Router } from "express";
import { ordersController } from "../controllers/orders.controller";
import { paymentsController } from "../controllers/payments.controller";
import { validateBody } from "../middleware/validate";

export const paymentsRouter: Router = Router();

// Universal order checkout (compatible with both legacy and new multi-item formats)
paymentsRouter.post("/create-order", ordersController.createCheckout);

// Razorpay payment verification and auto-enrollment fulfillment
paymentsRouter.post(
  "/verify",
  validateBody({ required: ["providerOrderId", "providerPaymentId"] }),
  paymentsController.verifyPayment
);

// Razorpay Webhook
paymentsRouter.post("/webhook", paymentsController.webhook);
