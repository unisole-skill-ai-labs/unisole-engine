import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db";
import { assignmentSubmissions, lessons, users } from "../db/schema";
import { ForbiddenError, NotFoundError, ServiceUnavailableError, ValidationError } from "../errors";
import {
  buildStoredFileName,
  ensureStudentSubmissionFolder,
  getFileStorageProvider,
  getStorageProviderForRecord,
} from "./file-storage.service";
import { lmsService } from "./lms.service";
import { TempUploadedFile } from "../utils/multipart-upload";

export const MAX_SUBMISSION_FILES = 5;
export const MAX_SUBMISSION_TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_DOC_CODE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_ATTEMPTS = 3;
export const MAX_LINKS = 3;
export const MAX_LINK_LENGTH = 500;

export function validateAndNormalizeLinks(rawLinks: unknown): string[] {
  if (rawLinks === undefined || rawLinks === null || rawLinks === "") {
    return [];
  }
  let arr: unknown;
  if (typeof rawLinks === "string") {
    try {
      arr = JSON.parse(rawLinks);
    } catch {
      throw new ValidationError("Links must be a valid JSON array of URLs.");
    }
  } else {
    arr = rawLinks;
  }

  if (!Array.isArray(arr)) {
    throw new ValidationError("Links must be an array of URLs.");
  }
  if (arr.length > MAX_LINKS) {
    throw new ValidationError(`Maximum ${MAX_LINKS} links allowed per submission.`);
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item !== "string") {
      throw new ValidationError("Each link must be a string URL.");
    }
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (trimmed.length > MAX_LINK_LENGTH) {
      throw new ValidationError(`Each link must be ${MAX_LINK_LENGTH} characters or fewer.`);
    }
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new ValidationError(`Invalid link URL: "${trimmed}"`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new ValidationError(`Only http:// and https:// links are allowed (rejected "${trimmed}").`);
    }
    if (seen.has(trimmed)) {
      throw new ValidationError(`Duplicate link is not allowed: "${trimmed}"`);
    }
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

const DOC_CODE_EXTS = new Set([
  ".pdf", ".txt", ".md",
  ".py", ".js", ".ts", ".jsx", ".tsx",
  ".java", ".c", ".cpp", ".cs", ".go", ".rs",
  ".php", ".rb", ".sql", ".html", ".css", ".json", ".zip",
]);

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov"]);

const VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export interface StoredSubmissionFile {
  driveFileId: string;
  originalName: string;
  storedName: string;
  size: number;
  mime: string;
  durationSec?: number | null;
}

export function validateSubmissionFile(
  originalName: string,
  mimeType: string
): { ok: true; maxFileBytes: number } | { ok: false; error: string } {
  const ext = path.extname(originalName || "").toLowerCase();
  if (!ext) {
    return { ok: false, error: `File "${originalName}" must have a valid extension.` };
  }
  if (VIDEO_EXTS.has(ext)) {
    const normMime = (mimeType || "").toLowerCase().split(";")[0].trim();
    if (normMime && !VIDEO_MIMES.has(normMime) && normMime !== "application/octet-stream") {
      return { ok: false, error: `Invalid MIME type "${normMime}" for video ${ext}.` };
    }
    return { ok: true, maxFileBytes: MAX_VIDEO_BYTES };
  }
  if (DOC_CODE_EXTS.has(ext)) {
    return { ok: true, maxFileBytes: MAX_DOC_CODE_BYTES };
  }
  return {
    ok: false,
    error: `File type "${ext}" is not allowed. Allowed: documents/code (.pdf, .txt, .md, code, .zip) and short videos (.mp4, .webm, .mov).`,
  };
}

function guessCanonicalMime(originalName: string, fallbackMime: string): string {
  const ext = path.extname(originalName || "").toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".ts": "text/typescript",
    ".zip": "application/zip",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return map[ext] || fallbackMime || "application/octet-stream";
}

function probeVideoDurationSec(filePath: string): Promise<number | null> {
  return new Promise((resolve) => {
    execFile(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { timeout: 3000 },
      (err, stdout) => {
        if (err) {
          resolve(null);
          return;
        }
        const parsed = parseFloat(String(stdout || "").trim());
        resolve(Number.isFinite(parsed) ? Math.round(parsed) : null);
      }
    );
  });
}

export function sanitizeSubmissionForClient(row: any) {
  if (!row) return null;
  const files = Array.isArray(row.files)
    ? row.files.map((f: any, idx: number) => ({
        index: idx,
        originalName: f.originalName,
        storedName: f.storedName,
        size: f.size,
        mime: f.mime,
        durationSec: f.durationSec ?? null,
      }))
    : [];
  return {
    id: row.id,
    studentId: row.studentId,
    assignmentId: row.assignmentId,
    text: row.text || "",
    attemptCount: row.attemptCount,
    maxAttempts: MAX_ATTEMPTS,
    files,
    links: Array.isArray(row.links) ? row.links : [],
    reviewStatus: row.reviewStatus,
    adminComment: row.adminComment || null,
    reviewedBy: row.reviewedBy || null,
    reviewedAt: row.reviewedAt || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const assignmentSubmissionsService = {
  async getMySubmission(studentId: string, assignmentId: string) {
    const rows = await db
      .select()
      .from(assignmentSubmissions)
      .where(
        and(
          sql`${assignmentSubmissions.studentId}::text = ${studentId}::text`,
          sql`${assignmentSubmissions.assignmentId}::text = ${assignmentId}::text`
        )
      )
      .limit(1);
    return rows.length > 0 ? sanitizeSubmissionForClient(rows[0]) : null;
  },

  async submit(
    student: { id: string; phone: string; name?: string },
    assignmentId: string,
    text: string,
    files: TempUploadedFile[],
    rawLinks?: unknown
  ) {
    const trimmedText = (text || "").trim();
    const validatedLinks = validateAndNormalizeLinks(rawLinks);
    if (!trimmedText && files.length === 0 && validatedLinks.length === 0) {
      throw new ValidationError(
        "Please provide a text explanation, at least one link, or at least one file."
      );
    }

    // Verify enrollment & lesson availability
    const lesson = await lmsService.getLessonContent(student.id, assignmentId, false);

    // Check attempt count
    const existingRows = await db
      .select()
      .from(assignmentSubmissions)
      .where(
        and(
          sql`${assignmentSubmissions.studentId}::text = ${student.id}::text`,
          sql`${assignmentSubmissions.assignmentId}::text = ${assignmentId}::text`
        )
      )
      .limit(1);

    const existing = existingRows[0] || null;
    if (existing && existing.attemptCount >= MAX_ATTEMPTS) {
      throw new ForbiddenError(`Maximum ${MAX_ATTEMPTS} submission attempts reached for this assignment.`);
    }

    // Load student phone & name from DB to ensure canonical folder naming
    const userRows = await db
      .select({ phone: users.phone, name: users.name })
      .from(users)
      .where(sql`${users.id}::text = ${student.id}::text`)
      .limit(1);

    const phone = userRows[0]?.phone || student.phone || "";
    const studentName = userRows[0]?.name || student.name || "Student";
    const storage = getFileStorageProvider();
    const uploadedFiles: StoredSubmissionFile[] = [];

    if (files.length > 0) {
      try {
        const folderId = await ensureStudentSubmissionFolder(student.id, phone, studentName);
        for (const f of files) {
          const ext = path.extname(f.originalName).toLowerCase();
          const durationSec = VIDEO_EXTS.has(ext)
            ? await probeVideoDurationSec(f.tempPath)
            : null;
          const desiredName = buildStoredFileName(lesson.title || "assignment", f.originalName);
          const canonicalMime = guessCanonicalMime(f.originalName, f.mimeType);

          const uploaded = await storage.uploadFile({
            folderId,
            fileName: desiredName,
            mimeType: canonicalMime,
            sizeBytes: f.sizeBytes,
            stream: fs.createReadStream(f.tempPath),
          });

          uploadedFiles.push({
            provider: storage.mode,
            driveFileId: uploaded.fileId,
            originalName: f.originalName,
            storedName: uploaded.storedName,
            size: uploaded.sizeBytes,
            mime: canonicalMime,
            durationSec,
          } as any);
        }
      } catch (err: any) {
        // Roll back newly uploaded files if any upload fails
        for (const uf of uploadedFiles) {
          await storage.deleteFile(uf.driveFileId).catch(() => {});
        }
        console.error("[STORAGE_ERROR] Submission upload failed:", {
          studentId: student.id,
          assignmentId,
          provider: storage.mode,
          message: err?.message || "Unknown storage error",
        });
        throw new ServiceUnavailableError(
          "File storage is temporarily unavailable. Your submission was not saved — please try again shortly."
        );
      }
    }

    const nowIso = new Date().toISOString();
    let savedRow: any;

    if (existing) {
      // Delete previous submission files from Drive/storage
      const oldFiles = Array.isArray(existing.files) ? (existing.files as StoredSubmissionFile[]) : [];
      for (const oldF of oldFiles) {
        if (oldF?.driveFileId) {
          await storage.deleteFile(oldF.driveFileId).catch(() => {});
        }
      }

      const [updated] = await db
        .update(assignmentSubmissions)
        .set({
          text: trimmedText,
          attemptCount: existing.attemptCount + 1,
          files: uploadedFiles,
          links: validatedLinks,
          reviewStatus: "NOT_REVIEWED",
          adminComment: null,
          reviewedBy: null,
          reviewedAt: null,
          updatedAt: nowIso,
        })
        .where(eq(assignmentSubmissions.id, existing.id))
        .returning();
      savedRow = updated;
    } else {
      const id = `asub_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
      const [inserted] = await db
        .insert(assignmentSubmissions)
        .values({
          id,
          studentId: student.id,
          assignmentId,
          text: trimmedText,
          attemptCount: 1,
          files: uploadedFiles,
          links: validatedLinks,
          reviewStatus: "NOT_REVIEWED",
          adminComment: null,
          reviewedBy: null,
          reviewedAt: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        })
        .returning();
      savedRow = inserted;
    }

    return sanitizeSubmissionForClient(savedRow);
  },

  async streamFile(
    submissionId: string,
    fileIndex: number,
    callerUserId: string,
    isStaffOrMentor: boolean,
    rangeHeader?: string
  ) {
    const rows = await db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundError("Submission not found");
    }
    const sub = rows[0];
    if (!isStaffOrMentor && String(sub.studentId) !== String(callerUserId)) {
      throw new ForbiddenError("You do not have permission to access this submission file.");
    }

    const files = Array.isArray(sub.files) ? (sub.files as StoredSubmissionFile[]) : [];
    const target = files[fileIndex];
    if (!target?.driveFileId) {
      throw new NotFoundError("File not found in submission");
    }

    const storage = getStorageProviderForRecord((target as any).provider, target.driveFileId);
    const result = await storage.streamFile(target.driveFileId, rangeHeader);
    return {
      ...result,
      originalName: target.originalName,
      mime: target.mime,
    };
  },

  async listForAdmin(params: {
    assignmentId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 30));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (params.assignmentId) {
      conditions.push(sql`${assignmentSubmissions.assignmentId}::text = ${params.assignmentId}::text`);
    }
    if (params.status && ["NOT_REVIEWED", "REVIEWED"].includes(params.status)) {
      conditions.push(eq(assignmentSubmissions.reviewStatus, params.status));
    }
    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(users.name, q),
          ilike(users.phone, q),
          ilike(lessons.title, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        submission: assignmentSubmissions,
        studentName: users.name,
        studentPhone: users.phone,
        studentEmail: users.email,
        assignmentTitle: lessons.title,
      })
      .from(assignmentSubmissions)
      .leftJoin(users, sql`${assignmentSubmissions.studentId}::text = ${users.id}::text`)
      .leftJoin(lessons, sql`${assignmentSubmissions.assignmentId}::text = ${lessons.id}::text`)
      .where(whereClause)
      .orderBy(desc(assignmentSubmissions.updatedAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r) => ({
        ...sanitizeSubmissionForClient(r.submission),
        studentName: r.studentName || "Student",
        studentPhone: r.studentPhone || "",
        studentEmail: r.studentEmail || "",
        assignmentTitle: r.assignmentTitle || r.submission.assignmentId,
      })),
      page,
      limit,
    };
  },

  async review(
    submissionId: string,
    reviewerId: string,
    body: { reviewStatus: string; adminComment?: string | null }
  ) {
    const status = String(body.reviewStatus || "").toUpperCase();
    if (!["NOT_REVIEWED", "REVIEWED"].includes(status)) {
      throw new ValidationError("reviewStatus must be NOT_REVIEWED or REVIEWED");
    }
    const existing = await db
      .select({ id: assignmentSubmissions.id })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId))
      .limit(1);
    if (existing.length === 0) {
      throw new NotFoundError("Submission not found");
    }

    const nowIso = new Date().toISOString();
    const [updated] = await db
      .update(assignmentSubmissions)
      .set({
        reviewStatus: status,
        adminComment: body.adminComment !== undefined ? (body.adminComment ? String(body.adminComment) : null) : null,
        reviewedBy: reviewerId,
        reviewedAt: status === "REVIEWED" ? nowIso : null,
        updatedAt: nowIso,
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();

    return sanitizeSubmissionForClient(updated);
  },
};
