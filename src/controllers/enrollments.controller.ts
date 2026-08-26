import { Response } from "express";
import { enrollmentsService } from "../services/enrollments.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const enrollmentsController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.query.userId as string | undefined;
    res.json(await enrollmentsService.list(req.user, { userId }));
  }),
  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await enrollmentsService.getById(req.params.id, req.user));
  }),
  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    const created = await enrollmentsService.create(req.body, req.user);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await enrollmentsService.update(req.params.id, req.body, req.user));
  }),
};
