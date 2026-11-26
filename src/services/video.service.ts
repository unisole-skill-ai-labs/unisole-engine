import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { lessons } from "../db/schema";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { lmsService } from "./lms.service";
import {
  MAX_HLS_UPLOAD_FILES,
  VideoStorageProvider,
  assertValidHlsFile,
  getVideoStorageProvider,
  rewriteMasterPlaylist,
} from "./video-storage.service";

const JWT_SECRET = process.env.JWT_SECRET || "unisole-secret-key";
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STALE_UPLOADING_MS = 30 * 60 * 1000;
const CLI_TOKEN_TTL_SEC = 30 * 60; // 30 min
const WRITE_SAS_TTL_SEC = 20 * 60; // 20 min

export function getPlayTtlSeconds(): number {
  const parsed = Number(process.env.VIDEO_PLAY_TTL_SECONDS || 21600);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 21600; // default 6 hours
}

export interface CliVideoTokenPayload {
  sub: string;
  role: string;
  lessonId: string;
  scope: "video:upload";
}

export interface PlayVideoTokenPayload {
  sub: string;
  lessonId: string;
  scope: "video:play";
}

export function signCliVideoToken(userId: string, role: string, lessonId: string): string {
  const payload: CliVideoTokenPayload = {
    sub: userId,
    role,
    lessonId,
    scope: "video:upload",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: CLI_TOKEN_TTL_SEC });
}

export function verifyCliVideoToken(token: string, expectedLessonId: string): CliVideoTokenPayload {
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new ForbiddenError("Invalid or expired upload token");
  }
  if (
    !decoded ||
    decoded.scope !== "video:upload" ||
    decoded.lessonId !== expectedLessonId ||
    !decoded.sub
  ) {
    throw new ForbiddenError("Upload token scope or lesson mismatch");
  }
  return decoded as CliVideoTokenPayload;
}

export function signPlayVideoToken(userId: string, lessonId: string, ttlSeconds: number): string {
  const payload: PlayVideoTokenPayload = {
    sub: userId,
    lessonId,
    scope: "video:play",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ttlSeconds });
}

export function verifyPlayVideoToken(token: string, expectedLessonId: string): PlayVideoTokenPayload {
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new ForbiddenError("Invalid or expired playback token");
  }
  if (
    !decoded ||
    decoded.scope !== "video:play" ||
    decoded.lessonId !== expectedLessonId ||
    !decoded.sub
  ) {
    throw new ForbiddenError("Playback token scope or lesson mismatch");
  }
  return decoded as PlayVideoTokenPayload;
}

function escapeRegExp(val: string): string {
  return val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isStaleUploading(videoStatus: string, videoUpdatedAt: string | null): boolean {
  if (videoStatus !== "UPLOADING") return true;
  if (!videoUpdatedAt) return true;
  return Date.now() - new Date(videoUpdatedAt).getTime() > STALE_UPLOADING_MS;
}

export const videoService = {
  async createCliToken(lessonId: string, userId: string, role: string, apiOrigin: string) {
    const rows = await db
      .select({ id: lessons.id, videoStatus: lessons.videoStatus, videoUpdatedAt: lessons.videoUpdatedAt })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) throw new NotFoundError("Lesson not found");

    const cliToken = signCliVideoToken(userId, role, lessonId);
    const command = `unisole-video upload <path-to-video.mp4> --lesson ${lessonId} --token ${cliToken} --api ${apiOrigin}`;

    return {
      cliToken,
      expiresInSec: CLI_TOKEN_TTL_SEC,
      command,
      storageMode: getVideoStorageProvider().mode,
    };
  },

  async createUploadUrls(
    lessonId: string,
    uuid: string,
    files: string[],
    storage: VideoStorageProvider = getVideoStorageProvider()
  ) {
    if (!uuid || !UUID_V4_RE.test(uuid)) {
      throw new ValidationError("Valid uuid is required");
    }
    if (!Array.isArray(files) || files.length === 0) {
      throw new ValidationError("files array is required");
    }
    if (files.length > MAX_HLS_UPLOAD_FILES) {
      throw new ValidationError(`Too many files (max ${MAX_HLS_UPLOAD_FILES})`);
    }
    for (const f of files) {
      assertValidHlsFile(f);
    }

    const rows = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (rows.length === 0) throw new NotFoundError("Lesson not found");

    const lesson = rows[0];
    if (lesson.videoStatus === "UPLOADING" && !isStaleUploading(lesson.videoStatus, lesson.videoUpdatedAt)) {
      throw new ConflictError("An upload is already in progress for this lesson");
    }

    const prefix = `${lessonId}/${uuid}`;
    const hlsPath = `${prefix}/master.m3u8`;
    const uploadUrls = await storage.generateWriteSasUrls(prefix, files, WRITE_SAS_TTL_SEC);

    await db
      .update(lessons)
      .set({
        videoStatus: "UPLOADING",
        videoError: null,
        videoUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId));

    return {
      uploadUrls,
      hlsPath,
      expiresInSec: WRITE_SAS_TTL_SEC,
    };
  },

  async completeUpload(lessonId: string, hlsPath: string, durationMinutes?: number) {
    const expectedRe = new RegExp(
      `^${escapeRegExp(lessonId)}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/master\\.m3u8$`,
      "i"
    );
    if (!hlsPath || !expectedRe.test(hlsPath)) {
      throw new ValidationError("Invalid hlsPath for lesson");
    }

    const rows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (rows.length === 0) throw new NotFoundError("Lesson not found");

    const updateData: Record<string, any> = {
      videoProvider: "AZURE_HLS",
      videoStatus: "READY",
      videoHlsPath: hlsPath,
      videoError: null,
      videoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (durationMinutes !== undefined && Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0) {
      updateData.durationMinutes = Math.round(Number(durationMinutes));
    }

    await db.update(lessons).set(updateData).where(eq(lessons.id, lessonId));

    return { status: "READY", videoProvider: "AZURE_HLS", videoHlsPath: hlsPath };
  },

  async failUpload(lessonId: string, errorMessage: string) {
    const rows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (rows.length === 0) throw new NotFoundError("Lesson not found");

    const safeError = String(errorMessage || "Upload failed").slice(0, 500);
    await db
      .update(lessons)
      .set({
        videoStatus: "FAILED",
        videoError: safeError,
        videoUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId));

    return { status: "FAILED", videoError: safeError };
  },

  async switchToLink(lessonId: string) {
    const rows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (rows.length === 0) throw new NotFoundError("Lesson not found");

    await db
      .update(lessons)
      .set({
        videoProvider: "YOUTUBE",
        videoStatus: "NONE",
        videoHlsPath: null,
        videoError: null,
        videoUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId));

    return { videoProvider: "YOUTUBE", videoStatus: "NONE", videoHlsPath: null };
  },

  async getStatus(lessonId: string) {
    const rows = await db
      .select({
        videoProvider: lessons.videoProvider,
        videoStatus: lessons.videoStatus,
        videoHlsPath: lessons.videoHlsPath,
        videoError: lessons.videoError,
        videoUpdatedAt: lessons.videoUpdatedAt,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) throw new NotFoundError("Lesson not found");
    return rows[0];
  },

  async getVideoAccess(
    userId: string,
    lessonId: string,
    isStaffOrMentor: boolean,
    apiOrigin: string
  ) {
    // Reuse existing enrollment, archive, and unlock/lock checks
    const lesson = await lmsService.getLessonContent(userId, lessonId, isStaffOrMentor);

    if (lesson.videoProvider !== "AZURE_HLS" || lesson.videoStatus !== "READY" || !lesson.videoHlsPath) {
      throw new NotFoundError("HLS video is not available for this lesson");
    }

    const ttlSec = getPlayTtlSeconds();
    const playToken = signPlayVideoToken(userId, lessonId, ttlSec);
    const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString();
    const manifestUrl = `${apiOrigin}/api/lms/lessons/${encodeURIComponent(
      lessonId
    )}/hls/master.m3u8?token=${encodeURIComponent(playToken)}`;

    return {
      manifestUrl,
      expiresAt,
      ttlSeconds: ttlSec,
      storageMode: getVideoStorageProvider().mode,
    };
  },

  async getRewrittenPlaylist(
    lessonId: string,
    requestedPath: string,
    playToken: string,
    apiOrigin: string,
    storage: VideoStorageProvider = getVideoStorageProvider()
  ): Promise<string> {
    verifyPlayVideoToken(playToken, lessonId);
    assertValidHlsFile(requestedPath);
    if (!requestedPath.endsWith(".m3u8")) {
      throw new ValidationError("Only .m3u8 playlists are served through this endpoint");
    }

    const rows = await db
      .select({
        videoProvider: lessons.videoProvider,
        videoStatus: lessons.videoStatus,
        videoHlsPath: lessons.videoHlsPath,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) throw new NotFoundError("Lesson not found");
    const lesson = rows[0];
    if (lesson.videoProvider !== "AZURE_HLS" || lesson.videoStatus !== "READY" || !lesson.videoHlsPath) {
      throw new NotFoundError("HLS video is not ready");
    }

    const prefix = lesson.videoHlsPath.replace(/\/master\.m3u8$/, "");
    const blobPath = `${prefix}/${requestedPath}`;
    const rawPlaylist = await storage.getPlaylistText(blobPath);

    if (requestedPath === "master.m3u8") {
      return rewriteMasterPlaylist(
        rawPlaylist,
        (variantPath) =>
          `${apiOrigin}/api/lms/lessons/${encodeURIComponent(
            lessonId
          )}/hls/${variantPath}?token=${encodeURIComponent(playToken)}`
      );
    }

    const variantDir = requestedPath.split("/")[0] as "360p" | "480p" | "720p";
    const ttlSec = getPlayTtlSeconds();
    const lines = rawPlaylist.split(/\r?\n/);
    const rewrittenLines = await Promise.all(
      lines.map(async (line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return line;
        const relativePath = `${variantDir}/${trimmed}`;
        assertValidHlsFile(relativePath);
        if (!trimmed.endsWith(".ts")) {
          throw new ValidationError(`Unexpected segment reference: ${trimmed}`);
        }
        return storage.generateReadSasUrl(`${prefix}/${relativePath}`, ttlSec);
      })
    );
    return rewrittenLines.join("\n");
  },
};
