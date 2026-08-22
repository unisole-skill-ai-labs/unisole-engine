import { Response } from "express";
import { testAttemptsManager } from "../managers/testAttempts.manager";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const testAttemptsController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = (req.query.user_id as string) || (req.user ? req.user.id : undefined);
    const testId = req.query.test_id as string | undefined;
    res.json(await testAttemptsManager.list({ userId, testId }));
  }),
  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await testAttemptsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.status(201).json(await testAttemptsManager.create(req.body, req.user));
  }),
  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await testAttemptsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: CustomRequest, res: Response) => {
    await testAttemptsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
