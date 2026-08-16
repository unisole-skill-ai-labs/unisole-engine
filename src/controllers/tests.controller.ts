import { Request, Response } from "express";
import { testsManager } from "../managers/tests.manager";
import { asyncHandler } from "../middleware/async-handler";

export const testsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await testsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await testsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await testsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await testsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await testsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
