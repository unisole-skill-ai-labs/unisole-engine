import { Request, Response } from "express";
import { quizzesManager } from "../managers/quizzes.manager";
import { asyncHandler } from "../middleware/async-handler";

export const quizzesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await quizzesManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await quizzesManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await quizzesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await quizzesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await quizzesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
