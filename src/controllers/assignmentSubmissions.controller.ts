import { Request, Response } from "express";
import { assignmentSubmissionsManager } from "../managers/assignmentSubmissions.manager";
import { asyncHandler } from "../middleware/async-handler";

export const assignmentSubmissionsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await assignmentSubmissionsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await assignmentSubmissionsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await assignmentSubmissionsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await assignmentSubmissionsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await assignmentSubmissionsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
