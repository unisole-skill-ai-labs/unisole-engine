import { Request, Response } from "express";
import { assignmentsManager } from "../managers/assignments.manager";
import { asyncHandler } from "../middleware/async-handler";

export const assignmentsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await assignmentsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await assignmentsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await assignmentsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await assignmentsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await assignmentsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
