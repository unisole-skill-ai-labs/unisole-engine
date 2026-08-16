import { Request, Response } from "express";
import { paymentsManager } from "../managers/payments.manager";
import { asyncHandler } from "../middleware/async-handler";

export const paymentsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await paymentsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await paymentsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await paymentsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await paymentsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await paymentsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
