import { eq } from "drizzle-orm";
import { hashSync, compareSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users, User } from "../db/schema";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";
import { usersRepository } from "../repositories/users.repository";
import { generateId } from "../helpers/generateId";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../middleware/auth";
import { otpService } from "../services/otp.service";
import { toTitleCase, normalizeEmail, normalizePhone } from "../helpers/formatters";

export function sanitizeUser<T extends Record<string, any>>(
  user: T | undefined | null
): Omit<T, "password_hash"> | null {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest as Omit<T, "password_hash">;
}

function generateTokens(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  name?: string;
}) {
  const payload = {
    id: user.id,
    email: user.email || undefined,
    phone: user.phone || undefined,
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

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) {
      throw new ValidationError("Invalid email address format");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new ValidationError("Invalid email address format");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters");
    }

    const validRoles = ["student", "admin"];
    const assignedRole = validRoles.includes(role) ? (role as "student" | "admin") : "student";

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      throw new ValidationError("Email already registered");
    }

    const id = await generateId(users, "users", users.id);
    const now = new Date();
    const password_hash = hashSync(password, 10);
    const formattedName = toTitleCase(name);
    const cleanPhone = normalizePhone(phone);

    const rows = await db
      .insert(users)
      .values({
        id,
        name: formattedName,
        email: cleanEmail,
        phone: cleanPhone || null,
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

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) {
      throw new ValidationError("Invalid email address format");
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
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

  async me(id: string) {
    const user = await usersRepository.getById(id);
    if (!user) throw new NotFoundError("User not found");
    return sanitizeUser(user);
  },


  async sendOtp(body: { phone?: string; name?: string }) {
    const { phone } = body;
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      throw new ValidationError("Mobile number is required");
    }
    const normalizedPhone = otpService.normalizePhone(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const result = await otpService.sendOtp(normalizedPhone);
    return result;
  },

  async verifyOtp(body: { phone?: string; otp?: string; name?: string }) {
    const { phone, otp, name } = body;
    if (!phone) {
      throw new ValidationError("Mobile number is required");
    }
    if (!otp) {
      throw new ValidationError("OTP is required");
    }

    const normalizedPhone = otpService.normalizePhone(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const isValid = await otpService.verifyOtp(normalizedPhone, String(otp));
    if (!isValid) {
      throw new ValidationError("Invalid or expired verification code");
    }


    // Look up user by phone number
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone))
      .limit(1);

    let user = existing[0];

    if (!user) {
      // User doesn't exist -> Create new user with role 'student' and provider 'phone'
      const id = await generateId(users, "users", users.id);
      const now = new Date();
      const userName = name && name.trim() ? toTitleCase(name) : `Learner ${normalizedPhone.slice(-4)}`;

      const inserted = await db
        .insert(users)
        .values({
          id,
          name: userName,
          phone: normalizedPhone,
          email: null,
          role: "student",
          auth_provider: "phone",
          is_verified: true,
          created_at: now,
          updated_at: now,
        })
        .returning();
      user = inserted[0];

    } else {
      // If existing user was provided a new name and had a generic or blank name, update it
      if (name && name.trim()) {
        const formattedName = toTitleCase(name);
        if (user.name.startsWith("Learner ") || !user.name || user.name !== formattedName) {
          const updated = await db
            .update(users)
            .set({ name: formattedName, updated_at: new Date() })
            .where(eq(users.id, user.id))
            .returning();
          user = updated[0];
        }
      }
    }

    const tokens = generateTokens(user);
    return { ...tokens, user: sanitizeUser(user) };
  },
};
