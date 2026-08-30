import { Request, Response } from "express";
import { usersService } from "../services/users.service";
import { asyncHandler } from "../middleware/async-handler";

export const usersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { collegeId, branch, role, search } = req.query as any;
    res.json(
      await usersService.list({
        collegeId: collegeId ? String(collegeId) : undefined,
        branch: branch ? String(branch) : undefined,
        role: role ? String(role) : undefined,
        search: search ? String(search) : undefined,
      })
    );
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
  delete: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersService.remove(req.params.id));
  }),
  deactivate: asyncHandler(async (req: Request, res: Response) => {
    res.json(await usersService.deactivate(req.params.id));
  }),
};
