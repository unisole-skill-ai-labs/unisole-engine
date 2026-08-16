import { Request, Response } from "express";
import { testAttemptsManager } from "../managers/testAttempts.manager";
import { asyncHandler } from "../middleware/async-handler";

export const testAttemptsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await testAttemptsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await testAttemptsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await testAttemptsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await testAttemptsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await testAttemptsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
