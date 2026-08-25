import { Response } from "express";
import { authManager } from "../managers/auth.manager";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const authController = {
  login: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authManager.login(req.body);
    res.json(result);
  }),

  refresh: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authManager.refreshToken(req.body);
    res.json(result);
  }),

  me: asyncHandler(async (req: CustomRequest, res: Response) => {
    const user = await authManager.me(req.user!.id);
    res.json(user);
  }),

  sendOtp: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authManager.sendOtp(req.body);
    res.status(200).json(result);
  }),

  verifyOtp: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authManager.verifyOtp(req.body);
    res.status(200).json(result);
  }),
};

