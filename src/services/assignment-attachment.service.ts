import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { lessons } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { appCache } from "../utils/cache";
import {
  buildStoredFileName,
  getFileStorageProvider,
} from "./file-storage.service";
import { lmsService } from "./lms.service";
import { TempUploadedFile } from "../utils/multipart-upload";

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_ATTACHMENT_MIME_BY_EXT: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"],
};

export function validateAssignmentAttachmentFile(
  originalName: string,
  mimeType: string
): { ok: true; maxFileBytes: number } | { ok: false; error: string } {
  const ext = path.extname(originalName || "").toLowerCase();
  const allowedMimes = ALLOWED_ATTACHMENT_MIME_BY_EXT[ext];
  if (!allowedMimes) {
    return {
      ok: false,
      error: "Only .pdf, .txt, and .md files are allowed for assignment attachments.",
    };
  }
  const normalizedMime = (mimeType || "").toLowerCase().split(";")[0].trim();
  if (normalizedMime && !allowedMimes.includes(normalizedMime)) {
    return {
      ok: false,
      error: `Invalid MIME type "${normalizedMime}" for ${ext} file.`,
    };
  }
  return { ok: true, maxFileBytes: ATTACHMENT_MAX_BYTES };
}

export interface StoredAttachmentMeta {
  driveFileId: string;
  originalName: string;
  storedName: string;
  size: number;
  mime: string;
}

export function sanitizeAttachmentForClient(att: any) {
  if (!att) return null;
  return {
    originalName: att.originalName,
    storedName: att.storedName,
    size: att.size,
    mime: att.mime,
  };
}

export const assignmentAttachmentService = {
  async upload(lessonId: string, file: TempUploadedFile) {
    const rows = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        assignmentAttachment: lessons.assignmentAttachment,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Assignment lesson not found");
    }
    const lesson = rows[0];

    const storage = getFileStorageProvider();
    const folderId = await storage.ensureFolder(["assignments", lessonId]);
    const desiredName = buildStoredFileName(lesson.title || "assignment", file.originalName);
    const ext = path.extname(file.originalName).toLowerCase();
    const canonicalMime =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".md"
        ? "text/markdown"
        : "text/plain";

    const uploaded = await storage.uploadFile({
      folderId,
      fileName: desiredName,
      mimeType: canonicalMime,
      sizeBytes: file.sizeBytes,
      stream: fs.createReadStream(file.tempPath),
    });

    // Delete previous attachment from storage if replacing
    const prev = lesson.assignmentAttachment as StoredAttachmentMeta | null;
    if (prev?.driveFileId) {
      await storage.deleteFile(prev.driveFileId).catch(() => {});
    }

    const meta: StoredAttachmentMeta = {
      driveFileId: uploaded.fileId,
      originalName: file.originalName,
      storedName: uploaded.storedName,
      size: uploaded.sizeBytes,
      mime: canonicalMime,
    };

    await db
      .update(lessons)
      .set({
        assignmentAttachment: meta,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId));

    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return sanitizeAttachmentForClient(meta);
  },

  async remove(lessonId: string) {
    const rows = await db
      .select({ id: lessons.id, assignmentAttachment: lessons.assignmentAttachment })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);
    if (rows.length === 0) {
      throw new NotFoundError("Assignment lesson not found");
    }
    const prev = rows[0].assignmentAttachment as StoredAttachmentMeta | null;
    if (prev?.driveFileId) {
      const storage = getFileStorageProvider();
      await storage.deleteFile(prev.driveFileId).catch(() => {});
    }
    await db
      .update(lessons)
      .set({ assignmentAttachment: null, updatedAt: new Date().toISOString() })
      .where(eq(lessons.id, lessonId));
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return { removed: true };
  },

  async stream(
    lessonId: string,
    userId: string,
    isStaffOrMentor: boolean,
    rangeHeader?: string
  ) {
    // Enforce enrollment + lock/archive checks via lmsService.getLessonContent
    await lmsService.getLessonContent(userId, lessonId, isStaffOrMentor);
    const rows = await db
      .select({ assignmentAttachment: lessons.assignmentAttachment })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);
    const att = (rows[0]?.assignmentAttachment || null) as StoredAttachmentMeta | null;
    if (!att?.driveFileId) {
      throw new NotFoundError("No attachment found for this assignment");
    }
    const storage = getFileStorageProvider();
    const result = await storage.streamFile(att.driveFileId, rangeHeader);
    return {
      ...result,
      originalName: att.originalName,
      mime: att.mime,
    };
  },
};
