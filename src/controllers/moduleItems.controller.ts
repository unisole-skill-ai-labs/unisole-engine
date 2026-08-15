import { Request, Response } from "express";
import { moduleItemsManager } from "../managers/moduleItems.manager";
import { asyncHandler } from "../middleware/async-handler";

export const moduleItemsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await moduleItemsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await moduleItemsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await moduleItemsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await moduleItemsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await moduleItemsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
