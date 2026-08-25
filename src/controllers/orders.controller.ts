import { Response } from "express";
import { ordersManager } from "../managers/orders.manager";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const ordersController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const user = req.user;
    const queryUserId = req.query.user_id as string | undefined;
    res.json(await ordersManager.list(user, { userId: queryUserId }));
  }),
  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await ordersManager.getById(req.params.id, req.user));
  }),
  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.status(201).json(await ordersManager.create(req.body, req.user));
  }),
  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await ordersManager.update(req.params.id, req.body, req.user));
  }),
  remove: asyncHandler(async (req: CustomRequest, res: Response) => {
    await ordersManager.remove(req.params.id, req.user);
    res.status(204).end();
  }),
};
