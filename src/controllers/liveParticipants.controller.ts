import { Request, Response } from "express";
import { liveParticipantsManager } from "../managers/liveParticipants.manager";
import { asyncHandler } from "../middleware/async-handler";

export const liveParticipantsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await liveParticipantsManager.list());
  }),
  getById: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveParticipantsManager.getById(req.params.id));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await liveParticipantsManager.create(req.body));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await liveParticipantsManager.update(req.params.id, req.body));
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await liveParticipantsManager.remove(req.params.id);
    res.status(204).end();
  }),
};
