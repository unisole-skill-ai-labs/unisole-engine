import { Request, Response } from "express";
import { lessonsService } from "../services/lessons.service";
import { asyncHandler } from "../middleware/async-handler";

export const lessonsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await lessonsService.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await lessonsService.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await lessonsService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await lessonsService.update(req.params.id, req.body));
  }),
};
