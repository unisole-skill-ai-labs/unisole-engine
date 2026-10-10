import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
    name?: string;
    username?: string | null;
    designation?: string | null;
    departmentId?: string | null;
    permissions?: string[];
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "unisole-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "unisole-refresh-secret-key";

export function authMiddleware(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      phone: string;
      role: string;
      roles?: string[];
      metadata?: any;
      name?: string;
      username?: string | null;
      designation?: string | null;
      departmentId?: string | null;
      permissions?: string[];
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: Token expired or invalid" });
  }
}

export function optionalAuthMiddleware(
  req: CustomRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        phone: string;
        role: string;
        roles?: string[];
        metadata?: any;
        name?: string;
        username?: string | null;
        designation?: string | null;
        departmentId?: string | null;
        permissions?: string[];
      };
      req.user = decoded;
    } catch {
      // Ignore error for optional auth
    }
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userPrimaryRole = req.user.role;
    const userSecondaryRoles: string[] = Array.isArray((req.user as any).roles)
      ? (req.user as any).roles
      : Array.isArray((req.user as any).metadata?.roles)
      ? (req.user as any).metadata.roles
      : [];
    const allUserRoles = [userPrimaryRole, ...userSecondaryRoles];

    // SUPER_ADMIN and ADMIN always have global operational access across all features
    if (allUserRoles.includes("SUPER_ADMIN") || allUserRoles.includes("ADMIN")) {
      next();
      return;
    }

    const hasMatchingRole = roles.some((r) => allUserRoles.includes(r));

    if (!hasMatchingRole) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    // SUPER_ADMIN has full permissions everywhere
    if (req.user.role === "SUPER_ADMIN") {
      next();
      return;
    }
    // ADMIN has operational access unless specific super_admin capability is needed
    if (req.user.role === "ADMIN" && !permission.startsWith("super_admin:")) {
      next();
      return;
    }
    const userPerms = req.user.permissions || [];
    if (userPerms.includes(permission) || userPerms.includes("*")) {
      next();
      return;
    }
    res.status(403).json({ error: `Forbidden: Missing required permission (${permission})` });
  };
}

export { JWT_SECRET, JWT_REFRESH_SECRET };

