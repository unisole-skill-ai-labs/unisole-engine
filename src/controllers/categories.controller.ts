import { Request, Response } from "express";
import { categoriesManager } from "../managers/categories.manager";
import { asyncHandler } from "../middleware/async-handler";

export const categoriesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await categoriesManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await categoriesManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await categoriesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await categoriesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoriesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
