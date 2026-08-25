import { Request, Response } from "express";
import { liveQuestionsManager } from "../managers/liveQuestions.manager";
import { asyncHandler } from "../middleware/async-handler";

export const liveQuestionsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await liveQuestionsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveQuestionsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await liveQuestionsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveQuestionsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await liveQuestionsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
