import { Response } from "express";
import { enrollmentsService } from "../services/enrollments.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const enrollmentsController = {
  list: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.query.userId as string | undefined;
    const itemType = req.query.itemType as any;
    const status = req.query.status as string | undefined;
    res.json(await enrollmentsService.list(req.user, { userId, itemType, status }));
  }),

  getById: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await enrollmentsService.getById(req.params.id, req.user));
  }),

  create: asyncHandler(async (req: CustomRequest, res: Response) => {
    const created = await enrollmentsService.create(req.body, req.user);
    res.status(201).json(created);
  }),

  adminManualGrant: asyncHandler(async (req: CustomRequest, res: Response) => {
    const adminUser = {
      id: req.user?.id || "admin",
      name: req.user?.name || "Admin",
    };
    const created = await enrollmentsService.adminManualGrant(req.body, adminUser);
    res.status(201).json({
      success: true,
      data: created,
      message: "Enrollment granted successfully",
    });
  }),

  update: asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await enrollmentsService.update(req.params.id, req.body, req.user));
  }),

  adminRevoke: asyncHandler(async (req: CustomRequest, res: Response) => {
    const adminUser = {
      id: req.user?.id || "admin",
      name: req.user?.name || "Admin",
    };
    const revoked = await enrollmentsService.revoke(req.params.id, adminUser);
    res.json({
      success: true,
      data: revoked,
      message: "Enrollment revoked successfully",
    });
  }),
};

