import { Request, Response } from "express";
import { coursesManager } from "../managers/courses.manager";
import { asyncHandler } from "../middleware/async-handler";

export const coursesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const categoryId = (req.query.category_id as string) || (req.query.category as string);
    const search = (req.query.search as string) || (req.query.q as string);
    res.json(await coursesManager.list({ categoryId, search }));
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesManager.getById(req.params.id));
  }),
  modules: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesManager.getModules(req.params.id));
  }),
  tree: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesManager.getTree(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await coursesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await coursesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await coursesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
