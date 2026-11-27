import fs from "fs";
import path from "path";
import os from "os";
import http from "http";
import https from "https";
import { Readable } from "stream";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { NotFoundError, ServiceUnavailableError } from "../errors";

export interface UploadFileParams {
  folderId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  stream: Readable;
}

export interface UploadedFileResult {
  fileId: string;
  storedName: string;
  sizeBytes: number;
}

export interface StreamFileResult {
  stream: Readable;
  statusCode: number;
  headers: Record<string, string>;
}

export interface FileStorageProvider {
  readonly mode: "gdrive" | "local";
  ensureFolder(pathSegments: string[]): Promise<string>;
  verifyFolderExists(folderId: string): Promise<boolean>;
  resolveUniqueFileName(folderId: string, desiredName: string): Promise<string>;
  uploadFile(params: UploadFileParams): Promise<UploadedFileResult>;
  streamFile(fileId: string, rangeHeader?: string): Promise<StreamFileResult>;
  deleteFile(fileId: string): Promise<void>;
}

/**
 * Sanitise a file or folder name for Google Drive and filesystem safety.
 */
export function sanitizeName(raw: string, fallback = "item"): string {
  const cleaned = String(raw || "")
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
    .replace(/\.+/g, ".")
    .replace(/\s+/g, "_")
    .replace(/^[_.-]+|[_.-]+$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

/**
 * Strip all non-digits, drop a leading country code or zero, and return the last 10 digits
 * only when the result is a valid 10-digit number; otherwise fall back to sanitized userId.
 */
export function resolveStudentFolderPrefix(
  phone: string | null | undefined,
  userId: string
): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    if (/^\d{10}$/.test(last10)) {
      return last10;
    }
  }
  return sanitizeName(userId, "student");
}

export function buildStudentFolderName(
  phone: string | null | undefined,
  studentName: string | null | undefined,
  userId: string
): string {
  const prefix = resolveStudentFolderPrefix(phone, userId);
  const safeStudent = sanitizeName(studentName || "", "Student").slice(0, 60) || "Student";
  return `${prefix}_${safeStudent}`;
}

/**
 * Format a Date as YYYY-MM-DD_HHmm in IST (Asia/Kolkata, UTC+05:30).
 */
export function formatIstTimestamp(date = new Date()): string {
  const istMs = date.getTime() + 5.5 * 60 * 60 * 1000;
  const d = new Date(istMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

/**
 * Build `<AssignmentOrModuleName>_<YYYY-MM-DD_HHmm>.<ext>` in IST.
 */
export function buildStoredFileName(baseLabel: string, originalFileName: string): string {
  const ext = path.extname(originalFileName || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
  const safeBase = sanitizeName(baseLabel, "file");
  const stamp = formatIstTimestamp();
  return ext ? `${safeBase}_${stamp}${ext}` : `${safeBase}_${stamp}`;
}

/**
 * Append -2, -3, ... before extension if desiredName collides with existingNames.
 */
function pickNonCollidingName(desiredName: string, existingNames: Set<string>): string {
  if (!existingNames.has(desiredName.toLowerCase())) {
    return desiredName;
  }
  const ext = path.extname(desiredName);
  const stem = ext ? desiredName.slice(0, -ext.length) : desiredName;
  let counter = 2;
  while (existingNames.has(`${stem}-${counter}${ext}`.toLowerCase())) {
    counter += 1;
  }
  return `${stem}-${counter}${ext}`;
}

function escapeDriveQueryValue(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

const folderLocks = new Map<string, Promise<string>>();

async function withFolderLock(key: string, fn: () => Promise<string>): Promise<string> {
  const prev = folderLocks.get(key) || Promise.resolve("");
  const next = prev.catch(() => "").then(fn);
  folderLocks.set(key, next);
  try {
    return await next;
  } finally {
    if (folderLocks.get(key) === next) {
      folderLocks.delete(key);
    }
  }
}

export class GoogleDriveStorageProvider implements FileStorageProvider {
  readonly mode = "gdrive" as const;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;
  private tokenRefreshPromise: Promise<string> | null = null;
  private readonly fileCache = new Map<
    string,
    { buffer: Buffer; mimeType: string; sizeBytes: number; cachedAt: number }
  >();
  private fileCacheBytes = 0;
  private readonly inFlightDownloads = new Map<
    string,
    Promise<{ buffer: Buffer; mimeType: string; sizeBytes: number }>
  >();
  private static readonly MAX_CACHE_FILE_BYTES = 15 * 1024 * 1024;
  private static readonly MAX_CACHE_TOTAL_BYTES = 50 * 1024 * 1024;
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly refreshToken: string,
    private readonly rootFolderId: string,
    private readonly endpoints = {
      tokenUrl: "https://oauth2.googleapis.com/token",
      driveApiBase: "https://www.googleapis.com/drive/v3",
      driveUploadBase: "https://www.googleapis.com/upload/drive/v3",
    }
  ) {}

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 1): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, init);
        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
        }
        return res;
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      const body = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      });
      const res = await this.fetchWithRetry(this.endpoints.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) {
        let oauthError = "";
        try {
          const errJson = (await res.json()) as { error?: string };
          oauthError = errJson?.error || "";
        } catch {
          // ignore non-JSON error body
        }
        if (oauthError === "invalid_grant") {
          console.error("[STORAGE_ERROR] Drive refresh token invalid or expired");
          throw new ServiceUnavailableError("File storage is temporarily unavailable.");
        }
        throw new Error(`Google OAuth token refresh failed with HTTP ${res.status}`);
      }
      const data = (await res.json()) as { access_token: string; expires_in?: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return this.accessToken;
    })();

    try {
      return await this.tokenRefreshPromise;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  private async ensureSingleChildFolder(parentId: string, name: string): Promise<string> {
    const safeSegment = sanitizeName(name, "folder");
    return withFolderLock(`${parentId}/${safeSegment}`, async () => {
      const q = `name = '${escapeDriveQueryValue(safeSegment)}' and '${escapeDriveQueryValue(
        parentId
      )}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const listUrl = `${this.endpoints.driveApiBase}/files?q=${encodeURIComponent(
        q
      )}&fields=files(id,name)&pageSize=1`;

      // Idempotent lookup-then-create: on transient error during create, re-run lookup before creating again
      for (let attempt = 0; attempt < 2; attempt++) {
        const token = await this.getAccessToken();
        const listRes = await this.fetchWithRetry(listUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!listRes.ok) {
          throw new Error(`Drive folder lookup failed with HTTP ${listRes.status}`);
        }
        const listData = (await listRes.json()) as { files?: Array<{ id: string }> };
        if (listData.files && listData.files.length > 0) {
          return listData.files[0].id;
        }

        try {
          const createRes = await fetch(`${this.endpoints.driveApiBase}/files?fields=id`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: safeSegment,
              mimeType: "application/vnd.google-apps.folder",
              parents: [parentId],
            }),
          });
          if (createRes.ok) {
            const created = (await createRes.json()) as { id: string };
            return created.id;
          }
          if (attempt === 0 && (createRes.status === 429 || createRes.status >= 500)) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          throw new Error(`Drive folder creation failed with HTTP ${createRes.status}`);
        } catch (err) {
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          throw err;
        }
      }
      throw new Error("Drive folder creation failed after retry");
    });
  }

  async ensureFolder(pathSegments: string[]): Promise<string> {
    let currentParent = this.rootFolderId;
    for (const segment of pathSegments) {
      if (!segment) continue;
      currentParent = await this.ensureSingleChildFolder(currentParent, segment);
    }
    return currentParent;
  }

  async verifyFolderExists(folderId: string): Promise<boolean> {
    if (!folderId) return false;
    const token = await this.getAccessToken();
    const res = await this.fetchWithRetry(
      `${this.endpoints.driveApiBase}/files/${encodeURIComponent(
        folderId
      )}?fields=id,trashed,mimeType`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 404) {
      return false;
    }
    if (!res.ok) {
      throw new Error(`Drive folder verification failed with HTTP ${res.status}`);
    }
    const meta = (await res.json()) as { trashed?: boolean; mimeType?: string };
    if (meta.trashed) return false;
    if (meta.mimeType && meta.mimeType !== "application/vnd.google-apps.folder") return false;
    return true;
  }

  async resolveUniqueFileName(folderId: string, desiredName: string): Promise<string> {
    const token = await this.getAccessToken();
    const ext = path.extname(desiredName);
    const stem = ext ? desiredName.slice(0, -ext.length) : desiredName;
    const q = `'${escapeDriveQueryValue(folderId)}' in parents and name contains '${escapeDriveQueryValue(
      stem
    )}' and trashed = false`;
    const url = `${this.endpoints.driveApiBase}/files?q=${encodeURIComponent(
      q
    )}&fields=files(name)&pageSize=100`;

    const res = await this.fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return desiredName;
    }
    const data = (await res.json()) as { files?: Array<{ name: string }> };
    const existing = new Set((data.files || []).map((f) => f.name.toLowerCase()));
    return pickNonCollidingName(desiredName, existing);
  }

  async uploadFile(params: UploadFileParams): Promise<UploadedFileResult> {
    const token = await this.getAccessToken();
    const storedName = await this.resolveUniqueFileName(params.folderId, params.fileName);

    // 1. Initiate resumable upload session
    const initRes = await this.fetchWithRetry(
      `${this.endpoints.driveUploadBase}/files?uploadType=resumable&fields=id,name,size`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": params.mimeType || "application/octet-stream",
          "X-Upload-Content-Length": String(params.sizeBytes),
        },
        body: JSON.stringify({
          name: storedName,
          parents: [params.folderId],
        }),
      }
    );

    if (!initRes.ok) {
      throw new Error(`Drive resumable upload init failed with HTTP ${initRes.status}`);
    }
    const sessionUri = initRes.headers.get("location");
    if (!sessionUri) {
      throw new Error("Drive resumable upload did not return a Location header");
    }

    // 2. Stream file body to sessionUri without buffering in memory
    const uploadResult = await new Promise<{ id: string; name?: string; size?: string }>(
      (resolve, reject) => {
        const parsed = new URL(sessionUri);
        const transport = parsed.protocol === "http:" ? http : https;
        const req = transport.request(
          {
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === "http:" ? 80 : 443),
            path: parsed.pathname + parsed.search,
            method: "PUT",
            headers: {
              "Content-Type": params.mimeType || "application/octet-stream",
              "Content-Length": String(params.sizeBytes),
            },
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (c) => chunks.push(c));
            res.on("end", () => {
              const raw = Buffer.concat(chunks).toString("utf8");
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  resolve(JSON.parse(raw));
                } catch {
                  reject(new Error("Invalid JSON response from Drive upload"));
                }
              } else {
                reject(new Error(`Drive upload stream failed with HTTP ${res.statusCode}`));
              }
            });
          }
        );
        req.on("error", reject);
        params.stream.on("error", (err) => {
          req.destroy(err);
          reject(err);
        });
        params.stream.pipe(req);
      }
    );

    return {
      fileId: uploadResult.id,
      storedName: uploadResult.name || storedName,
      sizeBytes: Number(uploadResult.size || params.sizeBytes),
    };
  }

  private putFileCache(
    key: string,
    entry: { buffer: Buffer; mimeType: string; sizeBytes: number; cachedAt: number }
  ) {
    const existing = this.fileCache.get(key);
    if (existing) {
      this.fileCacheBytes -= existing.buffer.length;
      this.fileCache.delete(key);
    }
    while (
      this.fileCacheBytes + entry.buffer.length > GoogleDriveStorageProvider.MAX_CACHE_TOTAL_BYTES &&
      this.fileCache.size > 0
    ) {
      const oldestKey = this.fileCache.keys().next().value;
      if (!oldestKey) break;
      const oldest = this.fileCache.get(oldestKey);
      if (oldest) this.fileCacheBytes -= oldest.buffer.length;
      this.fileCache.delete(oldestKey);
    }
    this.fileCache.set(key, entry);
    this.fileCacheBytes += entry.buffer.length;
  }

  private serveBufferRange(
    buffer: Buffer,
    mimeType: string,
    rangeHeader?: string
  ): StreamFileResult {
    const total = buffer.length;
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-");
      const start = startStr ? parseInt(startStr, 10) : 0;
      const end = endStr ? Math.min(parseInt(endStr, 10), total - 1) : total - 1;
      if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end && start < total) {
        const slice = buffer.subarray(start, end + 1);
        return {
          stream: Readable.from(slice),
          statusCode: 206,
          headers: {
            "Content-Type": mimeType,
            "Accept-Ranges": "bytes",
            "Content-Length": String(slice.length),
            "Content-Range": `bytes ${start}-${end}/${total}`,
          },
        };
      }
    }
    return {
      stream: Readable.from(buffer),
      statusCode: 200,
      headers: {
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
        "Content-Length": String(total),
      },
    };
  }

  async streamFile(fileId: string, rangeHeader?: string): Promise<StreamFileResult> {
    const token = await this.getAccessToken();

    const metaRes = await this.fetchWithRetry(
      `${this.endpoints.driveApiBase}/files/${encodeURIComponent(
        fileId
      )}?fields=size,mimeType,name,trashed,modifiedTime`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (metaRes.status === 404) {
      console.warn(`[STORAGE_MISSING] Google Drive file not found: ${fileId}`);
      throw new NotFoundError("Attachment is no longer available");
    }
    if (!metaRes.ok) {
      throw new Error(`Drive file metadata failed with HTTP ${metaRes.status}`);
    }
    const meta = (await metaRes.json()) as {
      size?: string;
      mimeType?: string;
      name?: string;
      trashed?: boolean;
      modifiedTime?: string;
    };
    if (meta.trashed) {
      console.warn(`[STORAGE_MISSING] Google Drive file is trashed: ${fileId}`);
      throw new NotFoundError("Attachment is no longer available");
    }

    const declaredSize = Number(meta.size || 0);
    if (declaredSize > 0 && declaredSize <= GoogleDriveStorageProvider.MAX_CACHE_FILE_BYTES) {
      const cacheKey = `${fileId}:${declaredSize}:${meta.modifiedTime || ""}`;
      const cached = this.fileCache.get(cacheKey);
      if (cached && Date.now() - cached.cachedAt < GoogleDriveStorageProvider.CACHE_TTL_MS) {
        // Refresh LRU position
        this.fileCache.delete(cacheKey);
        this.fileCache.set(cacheKey, cached);
        return this.serveBufferRange(cached.buffer, cached.mimeType, rangeHeader);
      }

      let downloadPromise = this.inFlightDownloads.get(cacheKey);
      if (!downloadPromise) {
        downloadPromise = (async () => {
          const freshToken = await this.getAccessToken();
          const mediaRes = await this.fetchWithRetry(
            `${this.endpoints.driveApiBase}/files/${encodeURIComponent(fileId)}?alt=media`,
            { headers: { Authorization: `Bearer ${freshToken}` } }
          );
          if (!mediaRes.ok) {
            throw new Error(`Drive media stream failed with HTTP ${mediaRes.status}`);
          }
          const buf = Buffer.from(await mediaRes.arrayBuffer());
          const mimeType =
            mediaRes.headers.get("content-type") || meta.mimeType || "application/octet-stream";
          const entry = { buffer: buf, mimeType, sizeBytes: buf.length, cachedAt: Date.now() };
          this.putFileCache(cacheKey, entry);
          return entry;
        })().finally(() => {
          if (this.inFlightDownloads.get(cacheKey) === downloadPromise) {
            this.inFlightDownloads.delete(cacheKey);
          }
        });
        this.inFlightDownloads.set(cacheKey, downloadPromise);
      }
      const downloaded = await downloadPromise;
      return this.serveBufferRange(downloaded.buffer, downloaded.mimeType, rangeHeader);
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (rangeHeader) {
      headers.Range = rangeHeader;
    }

    const mediaRes = await this.fetchWithRetry(
      `${this.endpoints.driveApiBase}/files/${encodeURIComponent(fileId)}?alt=media`,
      { headers }
    );
    if (!mediaRes.ok && mediaRes.status !== 206) {
      throw new Error(`Drive media stream failed with HTTP ${mediaRes.status}`);
    }
    if (!mediaRes.body) {
      throw new Error("Drive media response has no body stream");
    }

    const outHeaders: Record<string, string> = {
      "Content-Type":
        mediaRes.headers.get("content-type") || meta.mimeType || "application/octet-stream",
      "Accept-Ranges": "bytes",
    };
    const contentLength = mediaRes.headers.get("content-length") || meta.size;
    if (contentLength) {
      outHeaders["Content-Length"] = contentLength;
    }
    const contentRange = mediaRes.headers.get("content-range");
    if (contentRange) {
      outHeaders["Content-Range"] = contentRange;
    }

    return {
      stream: Readable.fromWeb(mediaRes.body as any),
      statusCode: mediaRes.status,
      headers: outHeaders,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!fileId) return;
    const token = await this.getAccessToken();
    const res = await this.fetchWithRetry(
      `${this.endpoints.driveApiBase}/files/${encodeURIComponent(fileId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok && res.status !== 404) {
      throw new Error(`Drive file delete failed with HTTP ${res.status}`);
    }
  }
}

/**
 * Local disk storage provider used only in non-production when Google Drive OAuth
 * env vars are not configured (e.g. local dev / Playwright E2E).
 */
export class LocalDiskStorageProvider implements FileStorageProvider {
  readonly mode = "local" as const;
  private readonly baseDir: string;

  constructor(baseDir = path.join(os.tmpdir(), "unisole-local-storage")) {
    this.baseDir = baseDir;
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  private resolveFolderAbs(folderId: string): string {
    const cleaned = folderId.replace(/\.\./g, "").replace(/^[/\\]+/, "");
    return path.join(this.baseDir, cleaned);
  }

  async ensureFolder(pathSegments: string[]): Promise<string> {
    const safeSegments = pathSegments.filter(Boolean).map((s) => sanitizeName(s, "folder"));
    const rel = safeSegments.join("/");
    const abs = path.join(this.baseDir, ...safeSegments);
    fs.mkdirSync(abs, { recursive: true });
    return rel;
  }

  async verifyFolderExists(folderId: string): Promise<boolean> {
    if (!folderId) return false;
    const absDir = this.resolveFolderAbs(folderId);
    return fs.existsSync(absDir) && fs.statSync(absDir).isDirectory();
  }

  async resolveUniqueFileName(folderId: string, desiredName: string): Promise<string> {
    const absDir = this.resolveFolderAbs(folderId);
    fs.mkdirSync(absDir, { recursive: true });
    const entries = fs.readdirSync(absDir);
    const existing = new Set(entries.map((e) => e.toLowerCase()));
    return pickNonCollidingName(desiredName, existing);
  }

  async uploadFile(params: UploadFileParams): Promise<UploadedFileResult> {
    const absDir = this.resolveFolderAbs(params.folderId);
    fs.mkdirSync(absDir, { recursive: true });
    const storedName = await this.resolveUniqueFileName(params.folderId, params.fileName);
    const absFile = path.join(absDir, storedName);

    let bytesWritten = 0;
    await new Promise<void>((resolve, reject) => {
      const ws = fs.createWriteStream(absFile);
      params.stream.on("data", (chunk: Buffer) => {
        bytesWritten += chunk.length;
      });
      params.stream.on("error", reject);
      ws.on("error", reject);
      ws.on("finish", resolve);
      params.stream.pipe(ws);
    });

    // Save sidecar mime metadata for Range streaming
    fs.writeFileSync(
      `${absFile}.meta.json`,
      JSON.stringify({ mimeType: params.mimeType, sizeBytes: bytesWritten })
    );

    const fileId = `${params.folderId}/${storedName}`;
    return { fileId, storedName, sizeBytes: bytesWritten };
  }

  async streamFile(fileId: string, rangeHeader?: string): Promise<StreamFileResult> {
    const cleaned = fileId.replace(/\.\./g, "").replace(/^[/\\]+/, "");
    const absFile = path.join(this.baseDir, cleaned);
    if (!fs.existsSync(absFile)) {
      console.warn(`[STORAGE_MISSING] Local file not found: ${cleaned}`);
      throw new NotFoundError("Attachment is no longer available");
    }
    const stat = fs.statSync(absFile);
    const total = stat.size;
    let mimeType = "application/octet-stream";
    try {
      const meta = JSON.parse(fs.readFileSync(`${absFile}.meta.json`, "utf8"));
      if (meta?.mimeType) mimeType = meta.mimeType;
    } catch {
      // ignore
    }

    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? Math.min(parseInt(match[2], 10), total - 1) : total - 1;
        if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end && start < total) {
          return {
            stream: fs.createReadStream(absFile, { start, end }),
            statusCode: 206,
            headers: {
              "Content-Type": mimeType,
              "Content-Length": String(end - start + 1),
              "Content-Range": `bytes ${start}-${end}/${total}`,
              "Accept-Ranges": "bytes",
            },
          };
        }
      }
    }

    return {
      stream: fs.createReadStream(absFile),
      statusCode: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(total),
        "Accept-Ranges": "bytes",
      },
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!fileId) return;
    const cleaned = fileId.replace(/\.\./g, "").replace(/^[/\\]+/, "");
    const absFile = path.join(this.baseDir, cleaned);
    try {
      if (fs.existsSync(absFile)) fs.unlinkSync(absFile);
      if (fs.existsSync(`${absFile}.meta.json`)) fs.unlinkSync(`${absFile}.meta.json`);
    } catch {
      // ignore
    }
  }
}

let cachedProvider: { key: string; provider: FileStorageProvider } | null = null;

export function isStorageStrict(): boolean {
  if (process.env.STORAGE_STRICT === "true") return true;
  if (process.env.STORAGE_STRICT === "false") return false;
  return process.env.NODE_ENV === "production" || process.env.APP_ENV === "staging";
}

export function getMissingDriveEnvVars(): string[] {
  const required = [
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "GOOGLE_OAUTH_REFRESH_TOKEN",
    "GDRIVE_ROOT_FOLDER_ID",
  ] as const;
  return required.filter((k) => !(process.env[k] || "").trim());
}

export function getMissingAzureVideoEnvVars(): string[] {
  const required = [
    "AZURE_STORAGE_ACCOUNT",
    "AZURE_STORAGE_ACCOUNT_KEY",
    "AZURE_HLS_CONTAINER",
  ] as const;
  return required.filter((k) => !(process.env[k] || "").trim());
}

export function getFileStorageProvider(): FileStorageProvider {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "";
  const rootFolderId = process.env.GDRIVE_ROOT_FOLDER_ID || "";

  const missingDrive = getMissingDriveEnvVars();
  const hasGdrive = missingDrive.length === 0;
  if (!hasGdrive && isStorageStrict()) {
    throw new Error(
      `Google Drive OAuth storage is required (STORAGE_STRICT=true / production / staging) but missing environment variable(s): ${missingDrive.join(", ")}`
    );
  }

  const key = hasGdrive
    ? `gdrive|${clientId}|${rootFolderId}`
    : `local|${process.env.LOCAL_STORAGE_DIR || ""}`;

  if (cachedProvider && cachedProvider.key === key) {
    return cachedProvider.provider;
  }

  const provider = hasGdrive
    ? new GoogleDriveStorageProvider(clientId, clientSecret, refreshToken, rootFolderId)
    : new LocalDiskStorageProvider(process.env.LOCAL_STORAGE_DIR || undefined);

  cachedProvider = { key, provider };
  return provider;
}

/**
 * Determine the storage provider for an existing DB record.
 * Local disk fileIds always contain '/' (e.g. "assignments/les_123/file.pdf");
 * Google Drive fileIds are opaque IDs without '/'.
 */
export function resolveRecordProvider(
  recordProvider?: string | null,
  fileId?: string | null
): "gdrive" | "local" {
  if (recordProvider === "local") return "local";
  if (recordProvider === "gdrive") return "gdrive";
  if (fileId && fileId.includes("/")) return "local";
  return "gdrive";
}

/**
 * Resolve a FileStorageProvider for reading/deleting an existing record.
 * Never silently falls back to local disk for a Drive-backed record.
 */
export function getStorageProviderForRecord(
  recordProvider?: string | null,
  fileId?: string | null
): FileStorageProvider {
  const mode = resolveRecordProvider(recordProvider, fileId);
  if (mode === "local") {
    return new LocalDiskStorageProvider(process.env.LOCAL_STORAGE_DIR || undefined);
  }
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "";
  const rootFolderId = process.env.GDRIVE_ROOT_FOLDER_ID || "";
  if (!clientId || !clientSecret || !refreshToken || !rootFolderId) {
    console.error(
      "[STORAGE_ERROR] Record is stored on Google Drive, but Drive OAuth env vars are not configured in this environment."
    );
    throw new ServiceUnavailableError(
      "File storage (Google Drive) is not configured in this environment."
    );
  }
  return getFileStorageProvider();
}

export function logFileStorageStartupStatus(): FileStorageProvider {
  const provider = getFileStorageProvider();
  const videoMode = (process.env.VIDEO_STORAGE_MODE || "stub").toLowerCase().trim() === "azure" ? "azure" : "stub";
  if (videoMode === "azure") {
    const missingAzure = getMissingAzureVideoEnvVars();
    if (missingAzure.length > 0) {
      throw new Error(
        `VIDEO_STORAGE_MODE=azure is enabled but missing environment variable(s): ${missingAzure.join(", ")}`
      );
    }
  }
  console.log(`[STORAGE] Active storage modes — files: ${provider.mode}, video: ${videoMode}`);
  return provider;
}

const studentFolderLocks = new Map<string, Promise<string>>();

/**
 * Ensure `submissions/<phone10>_<StudentName>/` exists in storage and persist
 * `users.driveFolderId` atomically so concurrent uploads never create duplicate folders.
 */
export async function ensureStudentSubmissionFolder(
  userId: string,
  phone: string,
  studentName: string
): Promise<string> {
  const existingPromise = studentFolderLocks.get(userId);
  if (existingPromise) {
    return existingPromise;
  }

  const run = (async () => {
    const rows = await db
      .select({ driveFolderId: users.driveFolderId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const storage = getFileStorageProvider();

    if (rows[0]?.driveFolderId) {
      const exists = await storage.verifyFolderExists(rows[0].driveFolderId);
      if (exists) {
        return rows[0].driveFolderId;
      }
      console.warn(
        `[STORAGE_WARN] Stale student submission folder ${rows[0].driveFolderId} for user ${userId}; recreating.`
      );
      await db
        .update(users)
        .set({ driveFolderId: null, updatedAt: new Date().toISOString() })
        .where(eq(users.id, userId));
    }

    const folderName = buildStudentFolderName(phone, studentName, userId);
    const folderId = await storage.ensureFolder(["submissions", folderName]);

    // Atomic conditional update so concurrent requests cannot overwrite each other
    await db
      .update(users)
      .set({ driveFolderId: folderId, updatedAt: new Date().toISOString() })
      .where(and(eq(users.id, userId), isNull(users.driveFolderId)));

    const recheck = await db
      .select({ driveFolderId: users.driveFolderId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return recheck[0]?.driveFolderId || folderId;
  })();

  studentFolderLocks.set(userId, run);
  try {
    return await run;
  } finally {
    if (studentFolderLocks.get(userId) === run) {
      studentFolderLocks.delete(userId);
    }
  }
}
