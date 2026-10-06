import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { authController } from "../../controllers/auth.controller";
import { lmsController } from "../../controllers/lms.controller";
import { mentorshipController } from "../../controllers/mentorship.controller";
import { enrollmentsController } from "../../controllers/enrollments.controller";
import { paymentsController } from "../../controllers/payments.controller";
import { validateBody } from "../../middleware/validate";

export const lmsRouter: Router = Router();

// Protect all LMS routes with authentication
lmsRouter.use(authMiddleware);

// Profile
lmsRouter.get("/me", authController.me);
lmsRouter.put("/me", lmsController.updateProfile);

// Pathways & Content
lmsRouter.get("/pathways", lmsController.getMyPathways);
lmsRouter.get("/pathways/:id", lmsController.getPathwayContent);
lmsRouter.get("/lessons/:id", lmsController.getLessonContent);

// Progress & Submissions
lmsRouter.post("/progress", validateBody({ required: ["lessonId"] }), lmsController.markProgress);
lmsRouter.get("/progress", lmsController.getProgress);
lmsRouter.get("/progress/:pathwayId", lmsController.getProgress);
lmsRouter.get("/submissions/audit", lmsController.getSubmissionsAudit);
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
lmsRouter.post("/submissions/:id/grade", validateBody({ required: ["score"] }), lmsController.gradeSubmission);

// Enrollments
lmsRouter.get("/enrollments", enrollmentsController.list);

// Calendar & Scheduling
lmsRouter.get("/calendar/events", lmsController.getCalendarEvents);
lmsRouter.post("/calendar/events", validateBody({ required: ["title", "startTime", "endTime"] }), lmsController.createCalendarEvent);
lmsRouter.put("/calendar/events/:id", lmsController.updateCalendarEvent);
lmsRouter.delete("/calendar/events/:id", lmsController.deleteCalendarEvent);

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
