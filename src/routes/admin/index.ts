import { Router } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth";
import { adminStudentsRouter } from "./students";
import { adminCollegesRouter } from "./colleges";
import { adminCategoriesRouter } from "./categories";
import { adminPathwaysRouter } from "./pathways";
import { adminCoursesRouter } from "./courses";
import { adminModulesRouter } from "./modules";
import { adminLessonsRouter } from "./lessons";
import { adminEnrollmentsRouter } from "./enrollments";
import { adminPaymentsRouter } from "./payments";
import { adminPresentationsRouter } from "./presentations";

export const adminRouter: Router = Router();

// Protect all admin routes with authentication and ADMIN role check
adminRouter.use(authMiddleware, requireRole(["ADMIN"]));

adminRouter.use("/students", adminStudentsRouter);
adminRouter.use("/colleges", adminCollegesRouter);
adminRouter.use("/categories", adminCategoriesRouter);
adminRouter.use("/pathways", adminPathwaysRouter);
adminRouter.use("/courses", adminCoursesRouter);
adminRouter.use("/modules", adminModulesRouter);
adminRouter.use("/lessons", adminLessonsRouter);
adminRouter.use("/enrollments", adminEnrollmentsRouter);
adminRouter.use("/payments", adminPaymentsRouter);
adminRouter.use("/presentations", adminPresentationsRouter);
