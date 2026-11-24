import { Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const authController = {
  checkUser: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.checkUser(req.body);
    res.status(200).json(result);
  }),

  adminLogin: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.adminLogin(req.body);
    res.status(200).json(result);
  }),

  login: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }),

  sendOtp: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.sendOtp(req.body);
    res.status(200).json(result);
  }),

  verifyOtp: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.verifyOtp(req.body);
    res.status(200).json(result);
  }),

  refresh: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.refreshToken(req.body);
    res.json(result);
  }),

  me: asyncHandler(async (req: CustomRequest, res: Response) => {
    const user = await authService.me(req.user!.id);
    res.json(user);
  }),

  createSsoCode: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.createSsoCode(req.user!.id);
    res.status(200).json(result);
  }),

  exchangeSsoCode: asyncHandler(async (req: CustomRequest, res: Response) => {
    const { code } = req.body;
    const result = await authService.exchangeSsoCode(code);
    res.status(200).json(result);
  }),

  mockDeliveryGateway: asyncHandler(async (req: CustomRequest, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      res.status(404).json({ error: "Endpoint not available in production" });
      return;
    }
    const { phone, otp, channel, message } = req.body;
    console.log(`[SIMULATED EXTERNAL GATEWAY] Received OTP dispatch request:`, {
      phone,
      otp,
      channel,
      message,
    });
    res.status(200).json({
      success: true,
      status: "DELIVERED",
      gateway: "SIMULATED_EXTERNAL_SMS_GATEWAY",
      messageId: `ext_gw_${Date.now()}`,
      recipient: phone,
      deliveredAt: new Date().toISOString(),
    });
  }),
};
