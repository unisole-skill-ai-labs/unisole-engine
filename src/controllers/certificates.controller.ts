import { Request, Response } from "express";
import { certificatesManager } from "../managers/certificates.manager";
import { asyncHandler } from "../middleware/async-handler";

export const certificatesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await certificatesManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await certificatesManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await certificatesManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await certificatesManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await certificatesManager.remove(req.params.id);
    res.status(204).end();
  }),
};
