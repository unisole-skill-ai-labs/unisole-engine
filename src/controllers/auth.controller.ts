import { Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const authController = {
  checkUser: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await authService.checkUser(req.body);
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
};
