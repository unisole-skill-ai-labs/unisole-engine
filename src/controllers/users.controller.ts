import { Request, Response } from "express";
import { usersService } from "../services/users.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const usersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const { collegeId, branch, role, search, courseId, enrolledOnly } = req.query as any;

    const userRole = customReq.user?.role;
    const userRoles = [
      userRole,
      ...(Array.isArray((customReq.user as any)?.roles) ? (customReq.user as any).roles : []),
      ...(Array.isArray((customReq.user as any)?.metadata?.roles) ? (customReq.user as any).metadata.roles : []),
    ];

    // Program Managers are strictly scoped to students who have active course enrollments
    const isProgramManager = userRoles.includes("PROGRAM_MANAGER") && !userRoles.includes("SUPER_ADMIN") && !userRoles.includes("ADMIN");
    const shouldFilterEnrolledOnly = isProgramManager || enrolledOnly === "true" || enrolledOnly === true;

    res.json(
      await usersService.list({
        collegeId: collegeId ? String(collegeId) : undefined,
        branch: branch ? String(branch) : undefined,
        role: role ? String(role) : undefined,
        search: search ? String(search) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        enrolledOnly: shouldFilterEnrolledOnly,
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
