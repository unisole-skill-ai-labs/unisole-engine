import { Request, Response } from "express";
import { ordersManager } from "../managers/orders.manager";
import { asyncHandler } from "../middleware/async-handler";

export const ordersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await ordersManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await ordersManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await ordersManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await ordersManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await ordersManager.remove(req.params.id);
    res.status(204).end();
  }),
};
