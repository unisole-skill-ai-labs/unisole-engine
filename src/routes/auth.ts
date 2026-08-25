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

// Admin email/password login (used by Unisole Admin Portal)
authRouter.post(
  "/login",
  authLimiter,
  validateBody({ required: ["email", "password"] }),
  authController.login
);

authRouter.post(
  "/refresh",
  validateBody({ required: ["refreshToken"] }),
  authController.refresh
);

authRouter.get("/me", authMiddleware, authController.me);

// Mobile OTP Authentication
authRouter.post(
  "/send-otp",
  authLimiter,
  validateBody({ required: ["phone"] }),
  authController.sendOtp
);

authRouter.post(
  "/verify-otp",
  authLimiter,
  validateBody({ required: ["phone", "otp"] }),
  authController.verifyOtp
);

