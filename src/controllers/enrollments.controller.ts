import { Request, Response } from "express";
import { enrollmentsManager } from "../managers/enrollments.manager";
import { asyncHandler } from "../middleware/async-handler";

export const enrollmentsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await enrollmentsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await enrollmentsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await enrollmentsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await enrollmentsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await enrollmentsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
