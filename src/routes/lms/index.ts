import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, CustomRequest, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/async-handler";
import { assignmentAttachmentService } from "../../services/assignment-attachment.service";
import {
  assignmentSubmissionsService,
  MAX_SUBMISSION_FILES,
  MAX_SUBMISSION_TOTAL_BYTES,
  validateSubmissionFile,
} from "../../services/assignment-submissions.service";
import {
  cleanupTempFiles,
  parseMultipartToTempFiles,
} from "../../utils/multipart-upload";
import { authController } from "../../controllers/auth.controller";
import { lmsController } from "../../controllers/lms.controller";
import { videoController } from "../../controllers/video.controller";
import { mentorshipController } from "../../controllers/mentorship.controller";
import { enrollmentsController } from "../../controllers/enrollments.controller";
import { paymentsController } from "../../controllers/payments.controller";
import { validateBody } from "../../middleware/validate";

export const lmsRouter: Router = Router();

const canManageCalendar = requireRole(["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER"]);
const canReviewSubmissions = requireRole(["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER", "MENTOR"]);

const submissionUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req: any) => req.user?.id || req.ip || "anon",
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submission upload requests, please try again shortly." },
});

// Signed HLS playlist delivery (authenticated via short-lived playJwt ?token= query param)
lmsRouter.get("/lessons/:id/hls/*", videoController.getHlsPlaylist);

// Protect all LMS routes with authentication
lmsRouter.use(authMiddleware);

// Profile
lmsRouter.get("/me", authController.me);
lmsRouter.put("/me", lmsController.updateProfile);

// Dashboard Aggregation (B2)
lmsRouter.get("/dashboard/summary", lmsController.getDashboardSummary);
lmsRouter.get("/dashboard", lmsController.getDashboardSummary);
lmsRouter.post("/module-visit", validateBody({ required: ["pathwayId", "moduleId"] }), lmsController.recordModuleVisit);

// Pathways & Content
lmsRouter.get("/pathways", lmsController.getMyPathways);
lmsRouter.get("/pathways/:id", lmsController.getPathwayContent);
lmsRouter.get("/lessons/:id", lmsController.getLessonContent);
lmsRouter.get(
  "/lessons/:id/attachment",
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const userRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ]
      .filter(Boolean)
      .map((r) => String(r).toUpperCase());
    const isStaffOrMentor = userRoles.some((r) =>
      ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER", "COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r)
    );
    const result = await assignmentAttachmentService.stream(
      req.params.id,
      userId,
      isStaffOrMentor,
      req.headers.range
    );
    res.status(result.statusCode);
    Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(result.originalName)}"`
    );
    res.setHeader("Cache-Control", "private, no-store");
    result.stream.pipe(res);
  })
);
lmsRouter.post("/lessons/:id/video-access", videoController.getVideoAccess);

// Progress & Submissions
lmsRouter.post("/progress", validateBody({ required: ["lessonId"] }), lmsController.markProgress);
lmsRouter.get("/progress", lmsController.getProgress);
lmsRouter.get("/progress/:pathwayId", lmsController.getProgress);
lmsRouter.get("/submissions/audit", canReviewSubmissions, lmsController.getSubmissionsAudit);
lmsRouter.post("/submissions", validateBody({ required: ["lessonId"] }), lmsController.submitAssignment);
lmsRouter.get("/submissions", lmsController.getSubmissions);
lmsRouter.get("/submissions/:pathwayId", lmsController.getSubmissions);
lmsRouter.get("/activities", lmsController.getActivities);

// Lecture Notes & Cohort Community
lmsRouter.post("/notes", validateBody({ required: ["lessonId", "content"] }), lmsController.saveNote);
lmsRouter.get("/notes", lmsController.getNotes);
lmsRouter.get("/notes/:pathwayId", lmsController.getNotes);
lmsRouter.get("/cohort", lmsController.getCohortData);
lmsRouter.get("/cohort/:pathwayId", lmsController.getCohortData);

// Mentorship System & Cockpit
lmsRouter.get("/mentors", mentorshipController.listMentors);
lmsRouter.get("/mentor/me", lmsController.getMyMentor);
lmsRouter.get("/mentor/cockpit", lmsController.getMentorCockpit);

// Course Assignments Studio (Practice vs Test)
lmsRouter.get("/assignments", lmsController.getAssignments);
lmsRouter.post("/assignments", validateBody({ required: ["title", "category", "type"] }), lmsController.createAssignment);
lmsRouter.post("/assignments/submit", validateBody({ required: ["assignmentId"] }), lmsController.submitAssessmentTask);
lmsRouter.get(
  "/assignments/:assignmentId/submission",
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const submission = await assignmentSubmissionsService.getMySubmission(
      req.user!.id,
      req.params.assignmentId
    );
    res.json({ submission });
  })
);
lmsRouter.post(
  "/assignments/:assignmentId/submission",
  submissionUploadLimiter,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const parsed = await parseMultipartToTempFiles(req, {
      maxFiles: MAX_SUBMISSION_FILES,
      maxTotalBytes: MAX_SUBMISSION_TOTAL_BYTES,
      validateFile: validateSubmissionFile,
    });
    try {
      const submission = await assignmentSubmissionsService.submit(
        {
          id: req.user!.id,
          phone: req.user!.phone,
          name: req.user!.name,
        },
        req.params.assignmentId,
        parsed.fields.text || "",
        parsed.files,
        parsed.fields.links
      );
      res.status(201).json({ submission });
    } finally {
      cleanupTempFiles(parsed.files);
    }
  })
);
lmsRouter.get(
  "/assignment-submissions/:submissionId/files/:fileIndex",
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const userRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ]
      .filter(Boolean)
      .map((r) => String(r).toUpperCase());
    const isStaffOrMentor = userRoles.some((r) =>
      ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER", "COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r)
    );
    const result = await assignmentSubmissionsService.streamFile(
      req.params.submissionId,
      Number(req.params.fileIndex),
      req.user!.id,
      isStaffOrMentor,
      req.headers.range
    );
    res.status(result.statusCode);
    Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(result.originalName)}"`
    );
    res.setHeader("Cache-Control", "private, no-store");
    result.stream.pipe(res);
  })
);
lmsRouter.post("/submissions/:id/grade", canReviewSubmissions, validateBody({ required: ["score"] }), lmsController.gradeSubmission);

// Enrollments
lmsRouter.get("/enrollments", enrollmentsController.list);

// Calendar & Scheduling
lmsRouter.get("/calendar/events", lmsController.getCalendarEvents);
lmsRouter.post("/calendar/events", canManageCalendar, validateBody({ required: ["title", "startTime", "endTime"] }), lmsController.createCalendarEvent);
lmsRouter.put("/calendar/events/:id", canManageCalendar, lmsController.updateCalendarEvent);
lmsRouter.delete("/calendar/events/:id", canManageCalendar, lmsController.deleteCalendarEvent);

// Payments
lmsRouter.post(
  "/payments/create-order",
  validateBody({ required: ["pathwayId"] }),
  paymentsController.createOrder
);
lmsRouter.post(
  "/payments/verify",
  validateBody({ required: ["providerOrderId", "providerPaymentId", "providerSignature"] }),
  paymentsController.verifyPayment
);
