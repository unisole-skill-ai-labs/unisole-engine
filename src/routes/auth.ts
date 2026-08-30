import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createRateLimiter } from "../middleware/rate-limiter";

export const authRouter: Router = Router();

// Rate limiter for sensitive auth routes
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
  message: "Too many authentication requests, please try again in 15 minutes",
});

// Mobile Direct Authentication & User Lookup
authRouter.post(
  "/check-user",
  authLimiter,
  validateBody({ required: ["phone"] }),
  authController.checkUser
);

authRouter.post(
  "/login",
  authLimiter,
  validateBody({ required: ["phone"] }),
  authController.login
);

authRouter.post(
  "/send-otp",
  authLimiter,
  validateBody({ required: ["phone"] }),
  authController.sendOtp
);

authRouter.post(
  "/verify-otp",
  authLimiter,
  validateBody({ required: ["phone"] }),
  authController.verifyOtp
);

authRouter.post(
  "/refresh",
  validateBody({ required: ["refreshToken"] }),
  authController.refresh
);

authRouter.get("/me", authMiddleware, authController.me);

// Simulated External Delivery Gateway (Plug & Play test route)
authRouter.post(
  "/mock-delivery-gateway",
  validateBody({ required: ["phone", "otp"] }),
  authController.mockDeliveryGateway
);
