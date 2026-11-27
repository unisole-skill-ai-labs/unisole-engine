import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { lessonsController } from "../../controllers/lessons.controller";
import { validateBody } from "../../middleware/validate";
import { CustomRequest, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/async-handler";
import { adminVideosRouter } from "./videos";
import {
  ATTACHMENT_MAX_BYTES,
  assignmentAttachmentService,
  validateAssignmentAttachmentFile,
} from "../../services/assignment-attachment.service";
import {
  RESOURCE_MAX_FILE_BYTES,
  RESOURCE_MAX_FILES_PER_LECTURE,
  lessonResourcesService,
  validateLectureResourceFile,
} from "../../services/lesson-resources.service";
import {
  cleanupTempFiles,
  parseMultipartToTempFiles,
} from "../../utils/multipart-upload";
import { ValidationError } from "../../errors";

export const adminLessonsRouter: Router = Router();

const canManageLessons = requireRole(["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER"]);

const attachmentUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => req.user?.id || req.ip || "anon",
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attachment upload requests, please try again shortly." },
});

adminLessonsRouter.use("/:id/video", adminVideosRouter);

adminLessonsRouter.post(
  "/:id/attachment",
  canManageLessons,
  attachmentUploadLimiter,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const parsed = await parseMultipartToTempFiles(req, {
      maxFiles: 1,
      maxTotalBytes: ATTACHMENT_MAX_BYTES,
      validateFile: validateAssignmentAttachmentFile,
    });
    try {
      if (parsed.files.length !== 1) {
        throw new ValidationError("Exactly one attachment file (.pdf, .txt, or .md) is required.");
      }
      const result = await assignmentAttachmentService.upload(req.params.id, parsed.files[0]);
      res.json({ attachment: result });
    } finally {
      cleanupTempFiles(parsed.files);
    }
  })
);

adminLessonsRouter.delete(
  "/:id/attachment",
  canManageLessons,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    res.json(await assignmentAttachmentService.remove(req.params.id));
  })
);

adminLessonsRouter.post(
  "/:id/resources",
  canManageLessons,
  attachmentUploadLimiter,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const parsed = await parseMultipartToTempFiles(req, {
      maxFiles: RESOURCE_MAX_FILES_PER_LECTURE,
      maxTotalBytes: RESOURCE_MAX_FILE_BYTES * RESOURCE_MAX_FILES_PER_LECTURE,
      validateFile: validateLectureResourceFile,
    });
    try {
      const resources = await lessonResourcesService.upload(req.params.id, parsed.files);
      res.json({ resources });
    } finally {
      cleanupTempFiles(parsed.files);
    }
  })
);

adminLessonsRouter.patch(
  "/:id/resources/:resourceId",
  canManageLessons,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const resources = await lessonResourcesService.rename(
      req.params.id,
      req.params.resourceId,
      req.body?.name
    );
    res.json({ resources });
  })
);

adminLessonsRouter.delete(
  "/:id/resources/:resourceId",
  canManageLessons,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const resources = await lessonResourcesService.remove(req.params.id, req.params.resourceId);
    res.json({ resources });
  })
);

adminLessonsRouter.get("/", lessonsController.list);
adminLessonsRouter.get("/orphans", canManageLessons, lessonsController.listOrphans);
adminLessonsRouter.get("/:id", lessonsController.getById);
adminLessonsRouter.post("/", canManageLessons, validateBody({ required: ["title", "slug"] }), lessonsController.create);
adminLessonsRouter.put("/:id", canManageLessons, lessonsController.update);
