import { Request, Response } from "express";
import { modulesManager } from "../managers/modules.manager";
import { asyncHandler } from "../middleware/async-handler";

export const modulesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await modulesManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await modulesManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await modulesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await modulesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await modulesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
