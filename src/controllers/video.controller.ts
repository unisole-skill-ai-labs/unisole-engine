import { Request, Response } from "express";
import { asyncHandler } from "../middleware/async-handler";
import { CustomRequest } from "../middleware/auth";
import { ForbiddenError, ValidationError } from "../errors";
import { verifyCliVideoToken, videoService } from "../services/video.service";

function getApiOrigin(req: Request): string {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "localhost:3000";
  return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}

function extractCliToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ForbiddenError("Missing CLI bearer token");
  }
  return authHeader.slice(7).trim();
}

export const videoController = {
  createCliToken: asyncHandler(async (req: CustomRequest, res: Response) => {
    const lessonId = req.params.id;
    const userId = req.user!.id;
    const role = req.user!.role;
    const result = await videoService.createCliToken(lessonId, userId, role, getApiOrigin(req));
    res.json(result);
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    res.json(await videoService.getStatus(req.params.id));
  }),

  switchToLink: asyncHandler(async (req: Request, res: Response) => {
    res.json(await videoService.switchToLink(req.params.id));
  }),

  createUploadUrls: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.id;
    verifyCliVideoToken(extractCliToken(req), lessonId);
    const { uuid, files } = req.body || {};
    res.json(await videoService.createUploadUrls(lessonId, uuid, files));
  }),

  completeUpload: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.id;
    verifyCliVideoToken(extractCliToken(req), lessonId);
    const { hlsPath, durationMinutes } = req.body || {};
    res.json(await videoService.completeUpload(lessonId, hlsPath, durationMinutes));
  }),

  failUpload: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.id;
    verifyCliVideoToken(extractCliToken(req), lessonId);
    const { error } = req.body || {};
    res.json(await videoService.failUpload(lessonId, error || "Upload failed"));
  }),

  getVideoAccess: asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user!.id;
    const userRoles = [
      req.user?.role,
      ...(Array.isArray((req.user as any)?.roles) ? (req.user as any).roles : []),
      ...(Array.isArray((req.user as any)?.metadata?.roles) ? (req.user as any).metadata.roles : []),
    ]
      .filter(Boolean)
      .map((r) => String(r).toUpperCase());

    const isStaffOrMentor = userRoles.some((r) =>
      ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER", "COURSE_MANAGER", "PROGRAM_MANAGER"].includes(r)
    );

    const result = await videoService.getVideoAccess(
      userId,
      req.params.id,
      isStaffOrMentor,
      getApiOrigin(req)
    );
    res.json(result);
  }),

  getHlsPlaylist: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.id;
    const requestedPath = req.params[0] || "";
    const token = String(req.query.token || "");
    if (!token) {
      throw new ValidationError("Missing playback token");
    }

    const playlist = await videoService.getRewrittenPlaylist(
      lessonId,
      requestedPath,
      token,
      getApiOrigin(req)
    );
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");
    res.send(playlist);
  }),
};
