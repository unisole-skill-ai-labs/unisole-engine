import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createRateLimiter, getClientIp } from "../middleware/rate-limiter";

export const authRouter: Router = Router();

function getPhoneOrIpKey(prefix: string) {
  return (req: any): string => {
    const rawPhone = req.body?.phone;
    if (typeof rawPhone === "string" && rawPhone.trim().length > 0) {
      const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        return `${prefix}:phone:${cleanPhone}`;
      }
    }
    return `${prefix}:ip:${getClientIp(req)}`;
  };
}

// 1. Staff / Admin Username & Password Limiters (IP and Username based protection)
const adminAuthIpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: "Too many admin login attempts from this IP, please try again in 15 minutes",
});

const adminAuthUserLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req) => {
    const rawUser = String(req.body?.username || req.body?.phone || "anonymous").trim().toLowerCase();
    return `admin_auth:user:${rawUser}`;
  },
  message: "Too many admin login attempts for this account, please try again in 15 minutes",
});

// 2. Student Roadshow & Direct Auth Limiter:
// Keyed by phone number so every student in the auditorium has an independent quota.
// High capacity ensures hundreds of concurrent students on the same college Wi-Fi or NAT join freely.
const studentAuthLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 60,
  keyGenerator: getPhoneOrIpKey("student_auth"),
  message: "Too many login attempts for this number, please try again in a few minutes",
});

// 3. OTP Send limiter: Keyed by phone number to prevent SMS/WhatsApp spamming
const otpSendLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: getPhoneOrIpKey("otp_send"),
  message: "Too many OTP requests for this mobile number, please wait 10 minutes",
});

// 4. OTP Verify limiter: Keyed by phone number
const otpVerifyLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 20,
  keyGenerator: getPhoneOrIpKey("otp_verify"),
  message: "Too many verification attempts, please try again in 10 minutes",
});

// 5. SSO Code Limiter (authenticated user): 10 requests per 10 minutes per user
const ssoCreateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req: any) => `sso_create:user:${req.user?.id || getClientIp(req)}`,
  message: "Too many SSO code requests. Please wait a few minutes.",
});

// 6. SSO Exchange Limiter (public): 30 requests per 10 minutes per IP
const ssoExchangeLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 30,
  keyGenerator: (req: any) => `sso_exchange:ip:${getClientIp(req)}`,
  message: "Too many code verification attempts, please try again later",
});

// Mobile Direct Authentication & User Lookup
authRouter.post(
  "/check-user",
  studentAuthLimiter,
  validateBody({ required: ["phone"] }),
  authController.checkUser
);

// Staff / Admin Username & Password Authentication
authRouter.post(
  "/admin-login",
  adminAuthIpLimiter,
  adminAuthUserLimiter,
  authController.adminLogin
);

// Generic Login / Student Roadshow Login
authRouter.post(
  "/login",
  studentAuthLimiter,
  authController.login
);

authRouter.post(
  "/send-otp",
  otpSendLimiter,
  validateBody({ required: ["phone"] }),
  authController.sendOtp
);

authRouter.post(
  "/verify-otp",
  otpVerifyLimiter,
  validateBody({ required: ["phone"] }),
  authController.verifyOtp
);

authRouter.post(
  "/refresh",
  validateBody({ required: ["refreshToken"] }),
  authController.refresh
);

authRouter.get("/me", authMiddleware, authController.me);

// SSO Cross-Portal Session Handoff
authRouter.post(
  "/sso/create",
  authMiddleware,
  ssoCreateLimiter,
  authController.createSsoCode
);

authRouter.post(
  "/sso/exchange",
  ssoExchangeLimiter,
  validateBody({ required: ["code"] }),
  authController.exchangeSsoCode
);

// Simulated External Delivery Gateway (Plug & Play test route)
authRouter.post(
  "/mock-delivery-gateway",
  validateBody({ required: ["phone", "otp"] }),
  authController.mockDeliveryGateway
);
