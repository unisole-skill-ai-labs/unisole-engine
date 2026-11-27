import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function getClientIp(req: Request): string {
  const remote = req.socket?.remoteAddress || "";
  const isFromTrustedProxy =
    remote === "127.0.0.1" ||
    remote === "::1" ||
    remote === "::ffff:127.0.0.1" ||
    remote.startsWith("10.") ||
    remote.startsWith("172.") ||
    remote.startsWith("192.168.") ||
    remote.startsWith("::ffff:10.") ||
    remote.startsWith("::ffff:192.168.");

  if (isFromTrustedProxy) {
    const cfIp = req.headers["cf-connecting-ip"];
    if (typeof cfIp === "string" && cfIp.trim().length > 0) {
      return cfIp.trim();
    }
  }
  return req.ip || remote || "unknown";
}

export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  maxRequests = 50,
  message = "Too many requests, please try again later",
  keyGenerator,
}: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
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
  }, Math.min(windowMs, 60000)).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    let key: string;
    if (keyGenerator) {
      key = keyGenerator(req);
    } else {
      key = getClientIp(req);
    }

    const now = Date.now();
    const record = store.get(key);
    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      res.status(429).json({
        error: message,
        message,
        retryAfter,
      });
      return;
    }

    record.count += 1;
    next();
  };
}
