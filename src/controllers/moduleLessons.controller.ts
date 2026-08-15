import { Request, Response } from "express";
import { moduleLessonsManager } from "../managers/moduleLessons.manager";
import { asyncHandler } from "../middleware/async-handler";

export const moduleLessonsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await moduleLessonsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await moduleLessonsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await moduleLessonsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await moduleLessonsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await moduleLessonsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
