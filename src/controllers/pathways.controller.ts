import { Request, Response } from "express";
import { pathwaysService } from "../services/pathways.service";
import { asyncHandler } from "../middleware/async-handler";

export const pathwaysController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await pathwaysService.list());
  }),
  listPublished: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await pathwaysService.listPublished());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await pathwaysService.getById(req.params.id));
  }),
  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    res.json(await pathwaysService.getBySlug(req.params.slug));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await pathwaysService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await pathwaysService.update(req.params.id, req.body));
  }),

  // Relationship endpoints
  attachCategory: asyncHandler(async (req: Request, res: Response) => {
    await pathwaysService.attachCategory(req.params.id, req.body.categoryId);
    res.json({ ok: true });
  }),
  detachCategory: asyncHandler(async (req: Request, res: Response) => {
    await pathwaysService.detachCategory(req.params.id, req.params.categoryId);
    res.json({ ok: true });
  }),

  attachCollege: asyncHandler(async (req: Request, res: Response) => {
    await pathwaysService.attachCollege(req.params.id, req.body.collegeId);
    res.json({ ok: true });
  }),
  detachCollege: asyncHandler(async (req: Request, res: Response) => {
    await pathwaysService.detachCollege(req.params.id, req.params.collegeId);
    res.json({ ok: true });
  }),

  attachCourse: asyncHandler(async (req: Request, res: Response) => {
    await pathwaysService.attachCourse(req.params.id, req.body.courseId, req.body.position);
    res.json({ ok: true });
  }),
  detachCourse: asyncHandler(async (req: Request, res: Response) => {
    await pathwaysService.detachCourse(req.params.id, req.params.courseId);
    res.json({ ok: true });
  }),
  getCourses: asyncHandler(async (req: Request, res: Response) => {
    res.json(await pathwaysService.getCourses(req.params.id));
  }),
};
