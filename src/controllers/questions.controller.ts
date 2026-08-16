import { Request, Response } from "express";
import { questionsManager } from "../managers/questions.manager";
import { asyncHandler } from "../middleware/async-handler";

export const questionsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await questionsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await questionsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await questionsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await questionsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await questionsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
