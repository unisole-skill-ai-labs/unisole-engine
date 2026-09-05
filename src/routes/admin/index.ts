import { Router } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth";
import { adminStudentsRouter } from "./students";
import { adminCollegesRouter } from "./colleges";
import { adminBranchesRouter } from "./branches";
import { adminCategoriesRouter } from "./categories";
import { adminPathwaysRouter } from "./pathways";
import { adminCoursesRouter } from "./courses";
import { adminModulesRouter } from "./modules";
import { adminLessonsRouter } from "./lessons";
import { adminEnrollmentsRouter } from "./enrollments";
import { adminPaymentsRouter } from "./payments";
import { adminPresentationsRouter } from "./presentations";
import { adminLeadsRouter } from "./leads";
import { adminTasksRouter } from "./tasks";
import { adminProjectsRouter, adminSubProjectsRouter } from "./projects";
import { adminHierarchyRouter } from "./hierarchy";
import { adminTeamRouter } from "./team";
import { adminTemplatesRouter } from "./templates";
import { adminDailyLogsRouter } from "./daily-logs";
import { adminMyWorkRouter } from "./my-work";
import { adminOrdersRouter } from "./orders";
import { adminPricingRouter } from "./pricing";
import { adminCouponsRouter } from "./coupons";

export const adminRouter: Router = Router();

// Protect all admin routes with authentication and role check (SUPER_ADMIN, ADMIN, MEMBER)
adminRouter.use(authMiddleware, requireRole(["SUPER_ADMIN", "ADMIN", "MEMBER"]));

// My Work - Centralized Staff Task & Lead Workspace
adminRouter.use("/my-work", adminMyWorkRouter);

// Lead Management CRM
adminRouter.use("/leads", adminLeadsRouter);

// WorkSole Projects & Hierarchy Management
adminRouter.use("/projects", adminProjectsRouter);
adminRouter.use("/sub-projects", adminSubProjectsRouter);
adminRouter.use("/hierarchy", adminHierarchyRouter);

// Team & Task Management
adminRouter.use("/tasks", adminTasksRouter);
adminRouter.use("/team", adminTeamRouter);
adminRouter.use("/templates", adminTemplatesRouter);
adminRouter.use("/daily-logs", adminDailyLogsRouter);

// Platform entities & content
adminRouter.use("/students", adminStudentsRouter);
adminRouter.use("/colleges", adminCollegesRouter);
adminRouter.use("/branches", adminBranchesRouter);
adminRouter.use("/categories", adminCategoriesRouter);
adminRouter.use("/pathways", adminPathwaysRouter);
adminRouter.use("/courses", adminCoursesRouter);
adminRouter.use("/modules", adminModulesRouter);
adminRouter.use("/lessons", adminLessonsRouter);
adminRouter.use("/enrollments", adminEnrollmentsRouter);
adminRouter.use("/presentations", adminPresentationsRouter);

// Financial Management & Pricing Suite (Super Admin & Admin)
adminRouter.use("/orders", requireRole(["SUPER_ADMIN", "ADMIN"]), adminOrdersRouter);
adminRouter.use("/pricing", requireRole(["SUPER_ADMIN", "ADMIN"]), adminPricingRouter);
adminRouter.use("/coupons", requireRole(["SUPER_ADMIN", "ADMIN"]), adminCouponsRouter);
adminRouter.use("/payments", requireRole(["SUPER_ADMIN", "ADMIN"]), adminPaymentsRouter);


