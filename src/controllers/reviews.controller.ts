import { Request, Response } from "express";
import { reviewsManager } from "../managers/reviews.manager";
import { asyncHandler } from "../middleware/async-handler";

export const reviewsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await reviewsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await reviewsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await reviewsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await reviewsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await reviewsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
