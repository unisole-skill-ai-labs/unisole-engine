import { Request, Response } from "express";
import { usersService } from "../services/users.service";
import { asyncHandler } from "../middleware/async-handler";

export const usersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await usersService.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersService.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await usersService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersService.update(req.params.id, req.body));
  }),
  deactivate: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersService.deactivate(req.params.id));
  }),
};
