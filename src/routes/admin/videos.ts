import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireRole } from "../../middleware/auth";
import { videoController } from "../../controllers/video.controller";

export const adminVideosRouter: Router = Router({ mergeParams: true });
export const videoCliRouter: Router = Router({ mergeParams: true });

const canManageLessons = requireRole([
  "SUPER_ADMIN",
  "ADMIN",
  "COURSE_MANAGER",
  "PROGRAM_MANAGER",
]);

const videoMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many video requests, please try again shortly." },
});

// Admin UI endpoints (authenticated via adminRouter authMiddleware + canManageLessons)
adminVideosRouter.post("/cli-token", canManageLessons, videoMutationLimiter, videoController.createCliToken);
adminVideosRouter.get("/status", canManageLessons, videoController.getStatus);
adminVideosRouter.post("/switch-to-link", canManageLessons, videoController.switchToLink);

// CLI endpoints (authenticated via scoped video:upload JWT verified in controller)
videoCliRouter.post("/upload-urls", videoMutationLimiter, videoController.createUploadUrls);
videoCliRouter.post("/complete", videoMutationLimiter, videoController.completeUpload);
videoCliRouter.post("/fail", videoMutationLimiter, videoController.failUpload);
