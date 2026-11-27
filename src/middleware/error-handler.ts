import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors";
import { CustomRequest } from "./auth";
import crypto from "crypto";

interface PgErrorLike {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  column?: string;
}

function extractPgError(err: unknown): PgErrorLike | null {
  let curr: any = err;
  for (let depth = 0; depth < 4 && curr && typeof curr === "object"; depth++) {
    if (typeof curr.code === "string" && /^[0-9A-Z]{5}$/.test(curr.code)) {
      return {
        code: curr.code,
        constraint: curr.constraint || curr.constraint_name,
        detail: curr.detail,
        table: curr.table || curr.table_name,
        column: curr.column || curr.column_name,
      };
    }
    curr = curr.cause;
  }
  return null;
}

function mapPgErrorToHttp(pgErr: PgErrorLike): { status: number; code: string; message: string } | null {
  const constraint = (pgErr.constraint || "").toLowerCase();
  const detail = (pgErr.detail || "").toLowerCase();

  switch (pgErr.code) {
    case "23505": {
      if (constraint.includes("slug")) {
        return { status: 409, code: "DUPLICATE_SLUG", message: "An item with this slug already exists." };
      }
      return { status: 409, code: "CONFLICT", message: "Could not add this activity. Please try again." };
    }
    case "23503": {
      if (detail.includes("is not present in table")) {
        return { status: 404, code: "NOT_FOUND", message: "Referenced module or lesson was not found." };
      }
      return { status: 409, code: "CONFLICT", message: "This item is still in use and cannot be modified." };
    }
    case "23502":
    case "22P02":
    case "23514":
      return { status: 400, code: "VALIDATION_ERROR", message: "Invalid request data. Please check your input and try again." };
    default:
      return null;
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req_${crypto.randomBytes(6).toString("hex")}`;

  const nodeEnv = (process.env.NODE_ENV || "").toLowerCase();
  const allowInternalDetails = nodeEnv === "development" || nodeEnv === "test";

  const anyErr = (err && typeof err === "object" ? err : {}) as Record<string, any>;
  const pgErr = extractPgError(err);
  const name = anyErr.name || (err instanceof Error ? err.constructor.name : "Error");
  const rawMessage =
    anyErr.message ||
    (typeof err === "string" ? err : "An unexpected error occurred");
  const stack = anyErr.stack;

  // Always log complete error details (including PG cause) to server/container console only
  console.error(
    `[ERROR][${requestId}] ${req.method} ${req.originalUrl || req.url} - ${name}: ${rawMessage}`,
    pgErr ? { pgErr, err } : err
  );

  if (err instanceof HttpError) {
    const responseBody: Record<string, any> = {
      error: err.message,
      message: err.message,
      code: err.code || `HTTP_${err.status}`,
      requestId,
    };

    if (err.details !== undefined) {
      responseBody.details = err.details;
    }

    if (allowInternalDetails && stack) {
      responseBody.stack = stack;
    }

    res.status(err.status).json(responseBody);
    return;
  }

  if (pgErr) {
    const mapped = mapPgErrorToHttp(pgErr);
    if (mapped) {
      res.status(mapped.status).json({
        error: mapped.message,
        message: mapped.message,
        code: mapped.code,
        requestId,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // 500 Unhandled / Database / System Errors — never expose raw SQL, table names, or query params
  const safeMessage = rawMessage.startsWith("Failed query:")
    ? "Could not complete this operation. Please try again."
    : rawMessage || "An unexpected error occurred. Please try again later.";

  res.status(500).json({
    error: safeMessage,
    message: safeMessage,
    code: "INTERNAL_SERVER_ERROR",
    requestId,
    timestamp: new Date().toISOString(),
  });
}
