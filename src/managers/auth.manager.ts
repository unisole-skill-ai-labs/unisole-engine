import { eq } from "drizzle-orm";
import { hashSync, compareSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users, User } from "../db/schema";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";
import { usersRepository } from "../repositories/users.repository";
import { generateId } from "../helpers/generateId";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../middleware/auth";

export function sanitizeUser<T extends Record<string, any>>(
  user: T | undefined | null
): Omit<T, "password_hash"> | null {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest as Omit<T, "password_hash">;
}

function generateTokens(user: { id: string; email: string; role: string; name?: string }) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return {
    token: accessToken, // Backward compatibility with admin panel & legacy callers
    accessToken,
    refreshToken,
  };
}

export const authManager = {
  async register(body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string;
  }) {
    const { name, email, password, role = "student", phone } = body;

    if (!name || !email || !password) {
      throw new ValidationError("Name, email, and password are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email address format");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters");
    }

    const validRoles = ["student", "admin"];
    // If role is instructor and schema enum doesn't have it yet, map to student or admin safely
    const assignedRole = validRoles.includes(role) ? (role as "student" | "admin") : "student";

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new ValidationError("Email already registered");
    }

    const id = await generateId(users, "users", users.id);
    const now = new Date();
    const password_hash = hashSync(password, 10);

    const rows = await db
      .insert(users)
      .values({
        id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        password_hash,
        role: assignedRole,
        auth_provider: "local",
        is_verified: false,
        created_at: now,
        updated_at: now,
      })
      .returning();

    const user = rows[0];
    const tokens = generateTokens(user);
    return { ...tokens, user: sanitizeUser(user) };
  },

  async login(body: { email?: string; password?: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    const user = rows[0];
    if (!user) {
      throw new ValidationError("Invalid email or password");
    }

    if (!user.password_hash || !compareSync(password, user.password_hash)) {
      throw new ValidationError("Invalid email or password");
    }

    const tokens = generateTokens(user);
    return { ...tokens, user: sanitizeUser(user) };
  },

  async refreshToken(body: { refreshToken?: string }) {
    const { refreshToken } = body;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        id: string;
      };
      const user = await usersRepository.getById(decoded.id);
      if (!user) {
        throw new UnauthorizedError("User no longer exists");
      }

      const tokens = generateTokens(user);
      return { ...tokens, user: sanitizeUser(user) };
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  },

  async forgotPassword(body: { email?: string }) {
    const { email } = body;
    if (!email) {
      throw new ValidationError("Email is required");
    }

    return {
      message:
        "If your email is registered in our platform, you will receive password reset instructions shortly.",
    };
  },

  async me(id: string) {
    const user = await usersRepository.getById(id);
    if (!user) throw new NotFoundError("User not found");
    return sanitizeUser(user);
  },

  async googleAuth(body: {
    googleId?: string;
    email?: string;
    name?: string;
    role?: string;
    avatar_url?: string;
    credential?: string;
  }) {
    let { googleId, email, name, role = "student", avatar_url } = body;

    if (!email || !name) {
      throw new ValidationError("googleId, email, and name are required");
    }

    const cleanEmail = email.toLowerCase().trim();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    let user = rows[0];

    if (!user) {
      const id = await generateId(users, "users", users.id);
      const now = new Date();
      const validRoles = ["student", "admin"];
      const assignedRole = validRoles.includes(role)
        ? (role as "student" | "admin")
        : "student";

      const inserted = await db
        .insert(users)
        .values({
          id,
          name: name.trim(),
          email: cleanEmail,
          role: assignedRole,
          auth_provider: "google",
          is_verified: true,
          created_at: now,
          updated_at: now,
        })
        .returning();
      user = inserted[0];
    }

    const tokens = generateTokens(user);
    return { ...tokens, user: sanitizeUser(user) };
  },
};
