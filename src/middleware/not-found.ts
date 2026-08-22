import { Request, Response } from "express";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl || req.url}`,
    message: `Cannot ${req.method} ${req.originalUrl || req.url}`,
    code: "NOT_FOUND",
    path: req.originalUrl || req.url,
    method: req.method,
  });
}
