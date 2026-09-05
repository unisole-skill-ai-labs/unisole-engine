import { Router } from "express";
import { workshopController } from "../controllers/workshop.controller";
import { authMiddleware, optionalAuthMiddleware, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

export const workshopRouter: Router = Router();

// Public / Student Registration & Status
workshopRouter.post(
  "/register",
  validateBody({ required: ["name", "phone"] }),
  workshopController.register
);

workshopRouter.get(
  "/my-registration",
  optionalAuthMiddleware,
  workshopController.getMyRegistration
);

// Payment Endpoints (₹39 Token fee)
workshopRouter.post(
  "/payment/create-order",
  optionalAuthMiddleware,
  workshopController.createTokenOrder
);

workshopRouter.post(
  "/payment/verify",
  validateBody({ required: ["providerOrderId", "providerPaymentId"] }),
  workshopController.verifyTokenPayment
);

// QR Code Generation
workshopRouter.get("/qr", workshopController.generateQrCode);
workshopRouter.post("/qr", workshopController.generateQrCode);

// Admin Reporting & Stats
workshopRouter.get(
  "/admin/registrations",
  authMiddleware,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
  workshopController.listRegistrations
);

workshopRouter.get(
  "/admin/stats",
  authMiddleware,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
  workshopController.getStats
);
