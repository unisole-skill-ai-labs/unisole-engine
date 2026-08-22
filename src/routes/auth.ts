import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createRateLimiter } from "../middleware/rate-limiter";

export const authRouter: Router = Router();

// Rate limiter for sensitive auth routes (login, register, forgot-password)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
  message: "Too many authentication requests, please try again in 15 minutes",
});

authRouter.post(
  "/register",
  authLimiter,
  validateBody({ required: ["name", "email", "password"] }),
  authController.register
);

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

authRouter.post(
  "/forgot-password",
  authLimiter,
  validateBody({ required: ["email"] }),
  authController.forgotPassword
);

authRouter.get("/me", authMiddleware, authController.me);

authRouter.post(
  "/google",
  validateBody({ required: ["email", "name"] }),
  authController.googleAuth
);
