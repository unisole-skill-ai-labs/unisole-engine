import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  maxRequests = 50,
  message = "Too many requests, please try again later",
}: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodically clean expired records
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = store.get(ip);
    if (!record || now > record.resetTime) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      res.status(429).json({ error: message, retryAfter });
      return;
    }

    record.count += 1;
    next();
  };
}
