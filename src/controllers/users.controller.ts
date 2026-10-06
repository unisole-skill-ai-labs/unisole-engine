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
    ].filter(Boolean);

    const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");
    const isMentor = userRoles.includes("MENTOR") && !isAdmin;
    const isProgramManager = userRoles.includes("PROGRAM_MANAGER") && !isAdmin;

    let mentorUserIdFilter: string | undefined = undefined;
    let onlyAssignedMentorshipFilter: boolean | undefined = undefined;
    let roleFilter = role ? String(role) : undefined;
    let shouldFilterEnrolledOnly = enrolledOnly === "true" || enrolledOnly === true;

    if (isMentor) {
      // Mentors strictly ONLY see the students assigned to them
      mentorUserIdFilter = customReq.user?.id;
      roleFilter = "STUDENT";
      shouldFilterEnrolledOnly = true;
    } else if (isProgramManager) {
      // Program Managers strictly see students assigned to ANY mentor
      onlyAssignedMentorshipFilter = true;
      roleFilter = "STUDENT";
      shouldFilterEnrolledOnly = true;
    }

    res.json(
      await usersService.list({
        collegeId: collegeId ? String(collegeId) : undefined,
        branch: branch ? String(branch) : undefined,
        role: roleFilter,
        search: search ? String(search) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        enrolledOnly: shouldFilterEnrolledOnly,
        mentorUserId: mentorUserIdFilter,
        onlyAssignedMentorship: onlyAssignedMentorshipFilter,
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
