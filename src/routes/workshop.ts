import { Router } from "express";
import { workshopController } from "../controllers/workshop.controller";
import { optionalAuthMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const workshopRouter: Router = Router();

// Public / Student Registration
workshopRouter.post(
  "/register",
  validateBody({ required: ["name", "phone"] }),
  workshopController.register
);

// Post-login survey & expectations
workshopRouter.post(
  "/survey",
  optionalAuthMiddleware,
  workshopController.saveSurvey
);

// Student registration & token status
workshopRouter.get(
  "/status",
  optionalAuthMiddleware,
  workshopController.getMyStatus
);

// ₹39 Razorpay Token Order & Verification
workshopRouter.post(
  "/payment/create-order",
  optionalAuthMiddleware,
  workshopController.createTokenOrder
);

workshopRouter.post(
  "/payment/verify",
  validateBody({ required: ["providerOrderId", "providerPaymentId"] }),
  optionalAuthMiddleware,
  workshopController.verifyTokenPayment
);

// Universal Workshop QR Code Generation
workshopRouter.get("/qr", workshopController.generateQrCode);
workshopRouter.post("/qr", workshopController.generateQrCode);
