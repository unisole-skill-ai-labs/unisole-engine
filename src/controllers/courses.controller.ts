import { Request, Response } from "express";
import { coursesService } from "../services/courses.service";
import { asyncHandler } from "../middleware/async-handler";

export const coursesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await coursesService.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesService.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await coursesService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesService.update(req.params.id, req.body));
  }),
  attachModule: asyncHandler(async (req: Request, res: Response) => {
    await coursesService.attachModule(req.params.id, req.body.moduleId, req.body.position);
    res.json({ ok: true });
  }),
  detachModule: asyncHandler(async (req: Request, res: Response) => {
    await coursesService.detachModule(req.params.id, req.params.moduleId);
    res.json({ ok: true });
  }),
  getModules: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesService.getModules(req.params.id));
  }),
};
