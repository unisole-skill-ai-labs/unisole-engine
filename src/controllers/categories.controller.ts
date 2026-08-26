import { Request, Response } from "express";
import { categoriesService } from "../services/categories.service";
import { asyncHandler } from "../middleware/async-handler";

export const categoriesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await categoriesService.list());
  }),
  listActive: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await categoriesService.listActive());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await categoriesService.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await categoriesService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await categoriesService.update(req.params.id, req.body));
  }),
};
