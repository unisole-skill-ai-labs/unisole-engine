import { Request, Response } from "express";
import { collegesService } from "../services/colleges.service";
import { asyncHandler } from "../middleware/async-handler";

export const collegesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await collegesService.list());
  }),
  listActive: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await collegesService.listActive());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await collegesService.getById(req.params.id));
  }),
  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    res.json(await collegesService.getBySlug(req.params.slug));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await collegesService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await collegesService.update(req.params.id, req.body));
  }),
};
