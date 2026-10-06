import { Response } from "express";
import { lmsService } from "../services/lms.service";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";

export const lmsController = {
  getMyPathways: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathways = await lmsService.getAccessiblePathways(userId);
    res.json(pathways);
  }),

  getPathwayContent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const isStaffOrMentor = ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER"].includes(req.user?.role || "");
    const pathwayContent = await lmsService.getPathwayContent(userId, req.params.id, isStaffOrMentor);
    res.json(pathwayContent);
  }),

  getLessonContent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const isStaffOrMentor = ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER"].includes(req.user?.role || "");
    const lesson = await lmsService.getLessonContent(userId, req.params.id, isStaffOrMentor);
    res.json(lesson);
  }),

  markProgress: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const { lessonId, pathwayId, isCompleted } = req.body;
    const result = await lmsService.markLessonProgress(userId, { lessonId, pathwayId, isCompleted });
    res.json(result);
  }),

  getProgress: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathwayId = req.params.pathwayId || (req.query.pathwayId as string);
    const progress = await lmsService.getStudentProgress(userId, pathwayId);
    res.json(progress);
  }),

  submitAssignment: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await lmsService.submitAssignment(userId, req.body);
    res.json(result);
  }),

  getSubmissions: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathwayId = req.params.pathwayId || (req.query.pathwayId as string);
    const subs = await lmsService.getStudentSubmissions(userId, pathwayId);
    res.json(subs);
  }),

  getActivities: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const activities = await lmsService.getStudentActivities(userId);
    res.json(activities);
  }),

  saveNote: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await lmsService.saveNote(userId, req.body);
    res.json(result);
  }),

  getNotes: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const pathwayId = req.params.pathwayId || (req.query.pathwayId as string);
    const result = await lmsService.getNotes(userId, pathwayId);
    res.json(result);
  }),

  getCohortData: asyncHandler(async (req: CustomRequest, res: Response) => {
    const pathwayId = req.params.pathwayId || (req.query.pathwayId as string);
    const result = await lmsService.getCohortData(pathwayId);
    res.json(result);
  }),

  updateProfile: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await lmsService.updateUserProfile(userId, req.body);
    res.json(result);
  }),

  // Mentorship
  getMyMentor: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const mentor = await lmsService.getStudentMentor(userId);
    res.json(mentor);
  }),

  getMentorCockpit: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const callerRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ].filter(Boolean);
    const { mentorId, mentorUserId } = req.query as any;
    const targetMentorId = mentorId || mentorUserId ? String(mentorId || mentorUserId) : undefined;
    const cockpit = await lmsService.getMentorCockpit({
      callerUserId,
      callerRoles,
      targetMentorId,
    });
    res.json(cockpit);
  }),

  getSubmissionsAudit: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const callerRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ].filter(Boolean);
    const { status, search, mentorId, courseId } = req.query as any;
    const audit = await lmsService.getSubmissionsAudit({
      callerUserId,
      callerRoles,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      mentorId: mentorId ? String(mentorId) : undefined,
      courseId: courseId ? String(courseId) : undefined,
    });
    res.json(audit);
  }),

  // Course Assignments (Practice vs Test)
  getAssignments: asyncHandler(async (req: CustomRequest, res: Response) => {
    const courseId = req.query.courseId as string;
    const moduleId = req.query.moduleId as string;
    const assignments = await lmsService.getCourseAssignments(courseId, moduleId);
    res.json(assignments);
  }),

  createAssignment: asyncHandler(async (req: CustomRequest, res: Response) => {
    const result = await lmsService.createOrUpdateAssignment(req.body);
    res.json(result);
  }),

  submitAssessmentTask: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await lmsService.submitAssessmentTask(userId, req.body);
    res.json(result);
  }),

  gradeSubmission: asyncHandler(async (req: CustomRequest, res: Response) => {
    const mentorUserId = req.user!.id;
    const submissionId = req.params.id;
    const result = await lmsService.gradeSubmission(submissionId, mentorUserId, req.body);
    res.json(result);
  }),

  // Calendar
  getCalendarEvents: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const callerRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ].filter(Boolean);
    const { startDate, endDate, eventType, courseId, mentorId, studentId, search } = req.query as any;

    const events = await lmsService.getCalendarEvents({
      callerUserId,
      callerRoles,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      eventType: eventType ? String(eventType) : undefined,
      courseId: courseId ? String(courseId) : undefined,
      mentorId: mentorId ? String(mentorId) : undefined,
      studentId: studentId ? String(studentId) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(events);
  }),

  createCalendarEvent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const result = await lmsService.createCalendarEvent(callerUserId, req.body);
    res.json(result);
  }),

  updateCalendarEvent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const callerRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ].filter(Boolean);
    const id = req.params.id;
    const result = await lmsService.updateCalendarEvent(id, callerUserId, callerRoles, req.body);
    res.json(result);
  }),

  deleteCalendarEvent: asyncHandler(async (req: CustomRequest, res: Response) => {
    const callerUserId = req.user!.id;
    const callerRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ].filter(Boolean);
    const id = req.params.id;
    const result = await lmsService.deleteCalendarEvent(id, callerUserId, callerRoles);
    res.json(result);
  }),
};
