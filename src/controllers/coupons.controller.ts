import { Request, Response } from "express";
import { couponsManager } from "../managers/coupons.manager";
import { asyncHandler } from "../middleware/async-handler";

export const couponsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await couponsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await couponsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await couponsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await couponsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await couponsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
