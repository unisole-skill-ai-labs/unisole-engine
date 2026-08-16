import { Request, Response } from "express";
import { cartsManager } from "../managers/carts.manager";
import { asyncHandler } from "../middleware/async-handler";

export const cartsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await cartsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await cartsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await cartsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await cartsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await cartsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
