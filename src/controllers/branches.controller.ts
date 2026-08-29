import { Request, Response } from "express";
import { branchesService } from "../services/branches.service";
import { asyncHandler } from "../middleware/async-handler";

export const branchesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const collegeId = req.query.collegeId as string | undefined;
    res.json(await branchesService.list(collegeId));
  }),
  listActive: asyncHandler(async (req: Request, res: Response) => {
    const collegeId = req.query.collegeId as string | undefined;
    res.json(await branchesService.listActive(collegeId));
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await branchesService.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await branchesService.create(req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await branchesService.update(req.params.id, req.body));
  }),
  delete: asyncHandler(async (req: Request, res: Response) => {
    res.json(await branchesService.remove(req.params.id));
  }),
};
