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
  cleanupTempFiles,
  parseMultipartToTempFiles,
} from "../../utils/multipart-upload";
import { ValidationError } from "../../errors";

export const adminLessonsRouter: Router = Router();

const canManageLessons = requireRole(["SUPER_ADMIN", "ADMIN", "COURSE_MANAGER", "PROGRAM_MANAGER"]);

const attachmentUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
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

adminLessonsRouter.get("/", lessonsController.list);
adminLessonsRouter.get("/orphans", canManageLessons, lessonsController.listOrphans);
adminLessonsRouter.get("/:id", lessonsController.getById);
adminLessonsRouter.post("/", canManageLessons, validateBody({ required: ["title", "slug"] }), lessonsController.create);
adminLessonsRouter.put("/:id", canManageLessons, lessonsController.update);
