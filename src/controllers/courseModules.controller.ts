import { Request, Response } from "express";
import { courseModulesManager } from "../managers/courseModules.manager";
import { asyncHandler } from "../middleware/async-handler";

export const courseModulesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await courseModulesManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await courseModulesManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await courseModulesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await courseModulesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await courseModulesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
