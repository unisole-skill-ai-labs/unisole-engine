import { Request, Response } from "express";
import { usersManager } from "../managers/users.manager";
import { asyncHandler } from "../middleware/async-handler";

export const usersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await usersManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await usersManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersManager.update(req.params.id, req.body));
  }),
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await usersManager.changePassword(req.params.id, req.body.password);
    res.json({ ok: true });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await usersManager.remove(req.params.id);
    res.status(204).end();
  }),
};
