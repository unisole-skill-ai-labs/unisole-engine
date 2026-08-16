import { Request, Response } from "express";
import { orderItemsManager } from "../managers/orderItems.manager";
import { asyncHandler } from "../middleware/async-handler";

export const orderItemsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await orderItemsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await orderItemsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await orderItemsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await orderItemsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await orderItemsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
