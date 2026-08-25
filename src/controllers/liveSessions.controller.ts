import { Request, Response } from "express";
import { liveSessionsManager } from "../managers/liveSessions.manager";
import { asyncHandler } from "../middleware/async-handler";

export const liveSessionsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await liveSessionsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveSessionsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await liveSessionsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveSessionsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await liveSessionsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
