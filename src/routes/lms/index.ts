import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { authController } from "../../controllers/auth.controller";
import { lmsController } from "../../controllers/lms.controller";
import { enrollmentsController } from "../../controllers/enrollments.controller";
import { paymentsController } from "../../controllers/payments.controller";
import { validateBody } from "../../middleware/validate";

export const lmsRouter: Router = Router();

// Protect all LMS routes with authentication
lmsRouter.use(authMiddleware);

// Profile
lmsRouter.get("/me", authController.me);

// Pathways & Content
lmsRouter.get("/pathways", lmsController.getMyPathways);
lmsRouter.get("/pathways/:id", lmsController.getPathwayContent);
lmsRouter.get("/lessons/:id", lmsController.getLessonContent);

// Enrollments
lmsRouter.get("/enrollments", enrollmentsController.list);

// Payments
lmsRouter.post(
  "/payments/create-order",
  validateBody({ required: ["pathwayId"] }),
  paymentsController.createOrder
);
lmsRouter.post(
  "/payments/verify",
  validateBody({ required: ["providerOrderId", "providerPaymentId", "providerSignature"] }),
  paymentsController.verifyPayment
);
