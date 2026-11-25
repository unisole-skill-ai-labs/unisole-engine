import { Request, Response } from "express";
import { usersService } from "../services/users.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const usersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const {
      collegeId,
      branch,
      role,
      search,
      courseId,
      enrolledOnly,
      mentorId,
      assigned,
      status,
      page,
      limit,
      paginated,
    } = req.query as any;

    const userRole = customReq.user?.role;
    const userRoles = [
      userRole,
      ...(Array.isArray((customReq.user as any)?.roles) ? (customReq.user as any).roles : []),
      ...(Array.isArray((customReq.user as any)?.metadata?.roles) ? (customReq.user as any).metadata.roles : []),
    ].filter(Boolean);

    const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");
    const isMentor = userRoles.includes("MENTOR") && !isAdmin;
    const isProgramManager =
      (userRoles.includes("COURSE_MANAGER") || userRoles.includes("PROGRAM_MANAGER")) && !isAdmin;

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

    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : undefined;
    const limitNum = limit ? Math.max(1, parseInt(String(limit), 10)) : undefined;
    const offsetNum = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;

    const result = await usersService.list({
      collegeId: collegeId ? String(collegeId) : undefined,
      branch: branch ? String(branch) : undefined,
      role: roleFilter,
      search: search ? String(search) : undefined,
      courseId: courseId ? String(courseId) : undefined,
      enrolledOnly: shouldFilterEnrolledOnly,
      mentorUserId: mentorUserIdFilter,
      onlyAssignedMentorship: onlyAssignedMentorshipFilter,
      mentorId: mentorId ? String(mentorId) : undefined,
      assigned: assigned ? (String(assigned) as any) : undefined,
      status: status ? (String(status) as any) : undefined,
      limit: limitNum,
      offset: offsetNum,
    });

    if (result && typeof result === "object" && "items" in result) {
      res.setHeader("X-Total-Count", String(result.total));
      if (paginated === "true") {
        res.json({
          items: result.items,
          total: result.total,
          page: pageNum || 1,
          limit: limitNum || 25,
          totalPages: limitNum ? Math.ceil(result.total / limitNum) : 1,
        });
      } else {
        res.json(result.items);
      }
    } else {
      res.setHeader("X-Total-Count", String(Array.isArray(result) ? result.length : 0));
      res.json(result);
    }
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
  unenroll: asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.body || {};
    res.json(await usersService.unenroll(req.params.id, courseId));
  }),
};
