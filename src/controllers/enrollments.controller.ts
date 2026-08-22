import type { Response } from "express";
import { enrollmentsManager } from "../managers/enrollments.manager";
import { asyncHandler } from "../middleware/async-handler";
import type { CustomRequest } from "../middleware/auth";

export const enrollmentsController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const user = req.user;
    const queryUserId = req.query.user_id as string | undefined;
    const includeCourse = req.query.include === "course" || req.query.includeCourse === "true";
    res.json(await enrollmentsManager.list(user, { userId: queryUserId, includeCourse }));
  }),
  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await enrollmentsManager.getById(req.params.id, req.user));
  }),
  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.status(201).json(await enrollmentsManager.create(req.body, req.user));
  }),
  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await enrollmentsManager.update(req.params.id, req.body, req.user));
  }),
  remove: asyncHandler(async (req: CustomRequest, res: Response) => {
    await enrollmentsManager.remove(req.params.id, req.user);
    res.status(204).end();
  }),
};
