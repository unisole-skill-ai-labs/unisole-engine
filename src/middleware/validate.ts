import { NextFunction, Request, Response } from "express";

export function validateBody({ required = [] }: { required?: string[] }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const field of required) {
      const value = req.body?.[field];
      if (value === undefined || value === null) {
        res.status(400).json({ error: `Missing required field: ${field}` });
        return;
      }
    }
    next();
  };
}
