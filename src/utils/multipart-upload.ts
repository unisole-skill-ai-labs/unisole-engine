import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import Busboy from "busboy";
import { Request } from "express";
import { ValidationError } from "../errors";

export interface TempUploadedFile {
  fieldName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  tempPath: string;
}

export interface MultipartParseOptions {
  maxFiles: number;
  maxTotalBytes: number;
  validateFile: (originalName: string, mimeType: string) => { ok: true; maxFileBytes: number } | { ok: false; error: string };
}

export interface MultipartParseResult {
  fields: Record<string, string>;
  files: TempUploadedFile[];
}

export function cleanupTempFiles(files: TempUploadedFile[]): void {
  for (const f of files) {
    try {
      if (f.tempPath && fs.existsSync(f.tempPath)) {
        fs.unlinkSync(f.tempPath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}

export function parseMultipartToTempFiles(
  req: Request,
  options: MultipartParseOptions
): Promise<MultipartParseResult> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      reject(new ValidationError("Expected multipart/form-data request"));
      return;
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: options.maxFiles,
        fileSize: options.maxTotalBytes,
      },
    });

    const fields: Record<string, string> = {};
    const files: TempUploadedFile[] = [];
    const writePromises: Promise<void>[] = [];
    let totalBytes = 0;
    let aborted = false;

    const fail = (err: Error) => {
      if (aborted) return;
      aborted = true;
      req.unpipe(busboy);
      cleanupTempFiles(files);
      reject(err);
    };

    busboy.on("field", (name, val) => {
      fields[name] = val;
    });

    busboy.on("filesLimit", () => {
      fail(new ValidationError(`Maximum ${options.maxFiles} file(s) allowed per upload.`));
    });

    busboy.on("file", (fieldName, stream, info) => {
      if (aborted) {
        stream.resume();
        return;
      }

      const originalName = info.filename || "file";
      const mimeType = (info.mimeType || "application/octet-stream").toLowerCase();
      const validation = options.validateFile(originalName, mimeType);
      if (validation.ok === false) {
        stream.resume();
        fail(new ValidationError(validation.error));
        return;
      }

      const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
      const tempPath = path.join(os.tmpdir(), `unisole-up-${crypto.randomUUID()}${ext}`);
      const ws = fs.createWriteStream(tempPath);
      const entry: TempUploadedFile = {
        fieldName,
        originalName,
        mimeType,
        sizeBytes: 0,
        tempPath,
      };
      files.push(entry);

      const p = new Promise<void>((resFile, rejFile) => {
        stream.on("data", (chunk: Buffer) => {
          if (aborted) return;
          entry.sizeBytes += chunk.length;
          totalBytes += chunk.length;
          if (entry.sizeBytes > validation.maxFileBytes) {
            const maxMb = Math.round(validation.maxFileBytes / (1024 * 1024));
            ws.destroy();
            stream.resume();
            fail(new ValidationError(`File "${originalName}" exceeds maximum size of ${maxMb} MB.`));
            resFile();
            return;
          }
          if (totalBytes > options.maxTotalBytes) {
            const maxTotalMb = Math.round(options.maxTotalBytes / (1024 * 1024));
            ws.destroy();
            stream.resume();
            fail(new ValidationError(`Total upload size exceeds ${maxTotalMb} MB.`));
            resFile();
            return;
          }
        });

        stream.on("limit", () => {
          ws.destroy();
          fail(new ValidationError(`File "${originalName}" exceeds size limit.`));
          resFile();
        });

        stream.on("error", (err) => {
          ws.destroy();
          fail(err);
          resFile();
        });

        ws.on("error", (err) => {
          fail(err);
          resFile();
        });

        ws.on("finish", () => {
          resFile();
        });

        stream.pipe(ws);
      });

      writePromises.push(p);
    });

    busboy.on("error", (err: Error) => {
      fail(err);
    });

    busboy.on("finish", async () => {
      if (aborted) return;
      try {
        await Promise.all(writePromises);
        if (!aborted) {
          resolve({ fields, files });
        }
      } catch (err: any) {
        if (!aborted) {
          fail(err);
        }
      }
    });

    req.pipe(busboy);
  });
}
