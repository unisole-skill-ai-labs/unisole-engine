import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors";
import { CustomRequest } from "./auth";
import crypto from "crypto";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req_${crypto.randomBytes(6).toString("hex")}`;

  const isDev = process.env.NODE_ENV !== "production";
  const isAdmin = (req as CustomRequest).user?.role === "admin";
  const allowInternalDetails = isDev || isAdmin;

  const anyErr = (err && typeof err === "object" ? err : {}) as Record<string, any>;
  const message =
    anyErr.message ||
    (typeof err === "string" ? err : "An unexpected error occurred");
  const name = anyErr.name || (err instanceof Error ? err.constructor.name : "Error");
  const code = anyErr.code || (err instanceof HttpError ? err.code : undefined);
  const detail = anyErr.detail;
  const details = anyErr.details || (err instanceof HttpError ? err.details : undefined);
  const table = anyErr.table_name || anyErr.table;
  const column = anyErr.column_name || anyErr.column;
  const constraint = anyErr.constraint_name || anyErr.constraint;
  const stack = anyErr.stack;

  // Always log complete error details to server/container console
  console.error(
    `[ERROR][${requestId}] ${req.method} ${req.originalUrl || req.url} - ${name}: ${message}`,
    err
  );

  if (err instanceof HttpError) {
    const responseBody: Record<string, any> = {
      error: err.message,
      message: err.message,
      code: err.code || `HTTP_${err.status}`,
      requestId,
    };

    if (details !== undefined) {
      responseBody.details = details;
    }

    if (allowInternalDetails && stack) {
      responseBody.stack = stack;
    }

    res.status(err.status).json(responseBody);
    return;
  }

  // 500 Unhandled / Database / System Errors
  if (allowInternalDetails) {
    // In development or for authenticated administrators: return full error body & diagnostics
    res.status(500).json({
      error: message,
      message,
      name,
      code: code || "INTERNAL_SERVER_ERROR",
      ...(detail ? { detail } : {}),
      ...(details !== undefined ? { details } : {}),
      ...(table ? { table } : {}),
      ...(column ? { column } : {}),
      ...(constraint ? { constraint } : {}),
      ...(stack ? { stack } : {}),
      requestId,
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // In production for public end-users: protect internal secrets while providing correlation requestId
  res.status(500).json({
    error: "An unexpected error occurred. Please try again later.",
    message: "An unexpected error occurred. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
    requestId,
  });
}
