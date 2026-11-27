import crypto from "crypto";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { lessons } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { appCache } from "../utils/cache";
import { buildStoredFileName, getFileStorageProvider } from "./file-storage.service";
import { lmsService } from "./lms.service";
import { TempUploadedFile } from "../utils/multipart-upload";

export const RESOURCE_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const RESOURCE_MAX_FILES_PER_LECTURE = 10;

const ALLOWED_RESOURCE_MIME_BY_EXT: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".md": ["text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"],
  ".txt": ["text/plain"],
  ".py": ["text/x-python", "text/plain", "application/x-python-code", "application/octet-stream"],
  ".js": ["application/javascript", "text/javascript", "text/plain", "application/octet-stream"],
  ".ts": ["application/typescript", "text/typescript", "text/plain", "application/octet-stream"],
  ".jsx": ["text/jsx", "text/javascript", "application/javascript", "text/plain", "application/octet-stream"],
  ".tsx": ["text/tsx", "text/typescript", "application/typescript", "text/plain", "application/octet-stream"],
  ".java": ["text/x-java-source", "text/plain", "application/octet-stream"],
  ".c": ["text/x-c", "text/plain", "application/octet-stream"],
  ".cpp": ["text/x-c++src", "text/x-c++", "text/plain", "application/octet-stream"],
  ".cs": ["text/plain", "text/x-csharp", "application/octet-stream"],
  ".go": ["text/x-go", "text/plain", "application/octet-stream"],
  ".rs": ["text/rust", "text/plain", "application/octet-stream"],
  ".php": ["application/x-httpd-php", "text/x-php", "text/plain", "application/octet-stream"],
  ".rb": ["application/x-ruby", "text/x-ruby", "text/plain", "application/octet-stream"],
  ".sql": ["application/sql", "text/x-sql", "text/plain", "application/octet-stream"],
  ".html": ["text/html", "text/plain"],
  ".css": ["text/css", "text/plain"],
  ".json": ["application/json", "text/json", "text/plain"],
  ".zip": ["application/zip", "application/x-zip-compressed", "multipart/x-zip", "application/octet-stream"],
};

const EXECUTABLE_EXTS = new Set([
  ".exe", ".sh", ".bat", ".cmd", ".msi", ".dll", ".ps1", ".vbs", ".app", ".bin", ".com", ".scr", ".jar",
]);

export function validateLectureResourceFile(
  originalName: string,
  mimeType: string
): { ok: true; maxFileBytes: number } | { ok: false; error: string } {
  const ext = path.extname(originalName || "").toLowerCase();
  if (EXECUTABLE_EXTS.has(ext)) {
    return { ok: false, error: `Executable files (${ext}) are not allowed.` };
  }
  const allowedMimes = ALLOWED_RESOURCE_MIME_BY_EXT[ext];
  if (!allowedMimes) {
    return {
      ok: false,
      error: `Unsupported file type (${ext || "unknown"}). Allowed: PDF, MD, TXT, ZIP, and code files.`,
    };
  }
  const normalizedMime = (mimeType || "").toLowerCase().split(";")[0].trim();
  if (normalizedMime && !allowedMimes.includes(normalizedMime)) {
    return {
      ok: false,
      error: `Invalid MIME type "${normalizedMime}" for ${ext} file.`,
    };
  }
  return { ok: true, maxFileBytes: RESOURCE_MAX_FILE_BYTES };
}

export interface StoredLectureResource {
  id: string;
  driveFileId: string;
  originalName: string;
  storedName: string;
  size: number;
  mime: string;
}

export function sanitizeResourcesForClient(resources: any) {
  if (!Array.isArray(resources)) return [];
  return resources.map((r) => ({
    id: r.id,
    originalName: r.originalName,
    storedName: r.storedName,
    size: r.size,
    mime: r.mime,
  }));
}

function canonicalMimeForExt(ext: string): string {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".md") return "text/markdown";
  if (ext === ".zip") return "application/zip";
  if (ext === ".json") return "application/json";
  if (ext === ".html") return "text/html";
  if (ext === ".css") return "text/css";
  return "text/plain";
}

export const lessonResourcesService = {
  async upload(lessonId: string, files: TempUploadedFile[]) {
    if (!files || files.length === 0) {
      throw new ValidationError("At least one file is required.");
    }

    const rows = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        lessonResources: lessons.lessonResources,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Lesson not found");
    }

    const lesson = rows[0];
    const existing: StoredLectureResource[] = Array.isArray(lesson.lessonResources)
      ? (lesson.lessonResources as StoredLectureResource[])
      : [];

    if (existing.length + files.length > RESOURCE_MAX_FILES_PER_LECTURE) {
      throw new ValidationError(
        `Maximum ${RESOURCE_MAX_FILES_PER_LECTURE} files allowed per lecture (currently ${existing.length}).`
      );
    }

    const storage = getFileStorageProvider();
    const folderId = await storage.ensureFolder(["resources", lessonId]);

    const added: StoredLectureResource[] = [];
    try {
      for (const file of files) {
        if (file.sizeBytes > RESOURCE_MAX_FILE_BYTES) {
          throw new ValidationError(`File "${file.originalName}" exceeds the 10 MB limit.`);
        }
        const ext = path.extname(file.originalName).toLowerCase();
        const canonicalMime = canonicalMimeForExt(ext);
        const desiredName = buildStoredFileName(lesson.title || "resource", file.originalName);

        const uploaded = await storage.uploadFile({
          folderId,
          fileName: desiredName,
          mimeType: canonicalMime,
          sizeBytes: file.sizeBytes,
          stream: fs.createReadStream(file.tempPath),
        });

        added.push({
          id: `res_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
          driveFileId: uploaded.fileId,
          originalName: file.originalName,
          storedName: uploaded.storedName,
          size: uploaded.sizeBytes,
          mime: canonicalMime,
        });
      }

      const nextList = [...existing, ...added];
      await db
        .update(lessons)
        .set({
          lessonResources: nextList,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(lessons.id, lessonId));

      appCache.invalidatePattern(/^pathway_hierarchy:/);
      return sanitizeResourcesForClient(nextList);
    } catch (err) {
      for (const item of added) {
        await storage.deleteFile(item.driveFileId).catch(() => {});
      }
      throw err;
    }
  },

  async rename(lessonId: string, resourceId: string, newName: string) {
    const trimmed = String(newName || "").trim().slice(0, 140);
    if (!trimmed) {
      throw new ValidationError("File name cannot be empty.");
    }
    const rows = await db
      .select({ id: lessons.id, lessonResources: lessons.lessonResources })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Lesson not found");
    }
    const existing: StoredLectureResource[] = Array.isArray(rows[0].lessonResources)
      ? (rows[0].lessonResources as StoredLectureResource[])
      : [];
    const idx = existing.findIndex((r) => r.id === resourceId);
    if (idx === -1) {
      throw new NotFoundError("Resource not found");
    }

    const updated = existing.map((r, i) =>
      i === idx ? { ...r, originalName: trimmed } : r
    );
    await db
      .update(lessons)
      .set({
        lessonResources: updated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId));

    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return sanitizeResourcesForClient(updated);
  },

  async remove(lessonId: string, resourceId: string) {
    const rows = await db
      .select({ id: lessons.id, lessonResources: lessons.lessonResources })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Lesson not found");
    }
    const existing: StoredLectureResource[] = Array.isArray(rows[0].lessonResources)
      ? (rows[0].lessonResources as StoredLectureResource[])
      : [];
    const target = existing.find((r) => r.id === resourceId);
    if (!target) {
      throw new NotFoundError("Resource not found");
    }

    if (target.driveFileId) {
      const storage = getFileStorageProvider();
      await storage.deleteFile(target.driveFileId).catch(() => {});
    }

    const updated = existing.filter((r) => r.id !== resourceId);
    await db
      .update(lessons)
      .set({
        lessonResources: updated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId));

    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return sanitizeResourcesForClient(updated);
  },

  async stream(
    lessonId: string,
    resourceId: string,
    userId: string,
    isStaffOrMentor: boolean,
    rangeHeader?: string
  ) {
    await lmsService.getLessonContent(userId, lessonId, isStaffOrMentor);
    const rows = await db
      .select({ lessonResources: lessons.lessonResources })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    const existing: StoredLectureResource[] = Array.isArray(rows[0]?.lessonResources)
      ? (rows[0].lessonResources as StoredLectureResource[])
      : [];
    const target = existing.find((r) => r.id === resourceId);
    if (!target?.driveFileId) {
      throw new NotFoundError("Resource not found");
    }

    const storage = getFileStorageProvider();
    const result = await storage.streamFile(target.driveFileId, rangeHeader);
    return {
      ...result,
      originalName: target.originalName,
      mime: target.mime,
    };
  },
};
