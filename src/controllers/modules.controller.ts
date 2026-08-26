import { Request, Response } from "express";
import { modulesService } from "../services/modules.service";
import { asyncHandler } from "../middleware/async-handler";

export const modulesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await modulesService.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await modulesService.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await modulesService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await modulesService.update(req.params.id, req.body));
  }),
  attachLesson: asyncHandler(async (req: Request, res: Response) => {
    await modulesService.attachLesson(req.params.id, req.body.lessonId, req.body.position);
    res.json({ ok: true });
  }),
  detachLesson: asyncHandler(async (req: Request, res: Response) => {
    await modulesService.detachLesson(req.params.id, req.params.lessonId);
    res.json({ ok: true });
  }),
  getLessons: asyncHandler(async (req: Request, res: Response) => {
    res.json(await modulesService.getLessons(req.params.id));
  }),
};
