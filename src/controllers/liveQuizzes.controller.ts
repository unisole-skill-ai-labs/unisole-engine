import { Request, Response } from "express";
import { liveQuizzesManager } from "../managers/liveQuizzes.manager";
import { asyncHandler } from "../middleware/async-handler";

export const liveQuizzesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await liveQuizzesManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveQuizzesManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await liveQuizzesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveQuizzesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await liveQuizzesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
