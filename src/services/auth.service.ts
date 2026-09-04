import { eq, or, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, User } from "../db/schema";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";
import { usersRepository } from "../repositories/users.repository";
import { leadsRepository } from "../repositories/leads.repository";
import { otpService } from "./otp.service";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../middleware/auth";
import { toTitleCase, normalizePhone } from "../helpers/formatters";

function generateTokens(user: {
  id: string;
  phone: string;
  role: string;
  username?: string | null;
  name?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  designation?: string | null;
  departmentId?: string | null;
  metadata?: any;
}) {
  const permissions = (user.metadata && Array.isArray(user.metadata.permissions))
    ? user.metadata.permissions
    : [];

  const payload = {
    id: user.id,
    phone: user.phone,
    username: user.username || null,
    role: user.role,
    name: user.name,
    collegeName: user.collegeName,
    branch: user.branch,
    designation: user.designation || null,
    departmentId: user.departmentId || null,
    permissions,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return {
    token: accessToken,
    accessToken,
    refreshToken,
  };
}

export const authService = {
  async adminLogin(body: { username?: string; password?: string; phone?: string }) {
    const { username, password, phone } = body;
    const loginIdentifier = (username || phone || "").trim();
    if (!loginIdentifier) {
      throw new ValidationError("Username is required");
    }
    if (!password || typeof password !== "string" || password.length === 0) {
      throw new ValidationError("Password is required");
    }

    const cleanLower = loginIdentifier.toLowerCase();
    const rows = await db
      .select()
      .from(users)
      .where(
        or(
          sql`LOWER(${users.username}) = ${cleanLower}`,
          eq(users.phone, loginIdentifier),
          eq(users.phone, `+91${loginIdentifier.slice(-10)}`),
          eq(users.id, loginIdentifier)
        )
      )
      .limit(1);

    const user = rows[0];
    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account has been deactivated. Please contact Super Administrator.");
    }

    if (!["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role)) {
      throw new UnauthorizedError("Access denied. Internal staff privileges required.");
    }

    let isMatch = false;
    if (user.password) {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch {
        isMatch = false;
      }

      // Legacy plaintext migration fallback (auto-upgrade to bcrypt hash on successful login)
      if (!isMatch && user.password === password) {
        isMatch = true;
        const newHash = await bcrypt.hash(password, 10);
        await usersRepository.update(user.id, { password: newHash });
      }
    }

    if (!isMatch) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const tokens = generateTokens(user);
    const { password: _p, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  },

  async checkUser(body: { phone?: string }) {
    const { phone } = body;
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      throw new ValidationError("Mobile number is required");
    }
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const user = await usersRepository.getByPhone(normalizedPhone);
    if (!user) {
      return { exists: false };
    }

    return {
      exists: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        collegeId: user.collegeId,
        collegeName: user.collegeName,
        branch: user.branch,
      },
    };
  },

  async sendOtp(body: { phone?: string; channel?: string }) {
    const { phone, channel } = body;
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      throw new ValidationError("Mobile number is required");
    }
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const existingUser = await usersRepository.getByPhone(normalizedPhone);
    const otpChannel = channel === "WHATSAPP" ? ("WHATSAPP" as const) : ("SMS" as const);
    const result = await otpService.sendOtp(normalizedPhone, otpChannel);

    return {
      ...result,
      exists: !!existingUser,
      user: existingUser
        ? {
            name: existingUser.name,
            phone: existingUser.phone,
            role: existingUser.role,
          }
        : undefined,
    };
  },

  async login(body: {
    phone?: string;
    username?: string;
    password?: string;
    name?: string;
    college?: string;
    collegeName?: string;
    collegeId?: string;
    branch?: string;
    signupSource?: string;
    source?: string;
    sessionCode?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }) {
    if (body.username || (body.password && !body.phone)) {
      return this.adminLogin(body);
    }

    const {
      phone,
      name,
      college,
      collegeName,
      collegeId,
      branch,
      signupSource,
      source,
      sessionCode,
      sessionId,
      metadata,
    } = body;
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      throw new ValidationError("Mobile number is required");
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    // Look up user by normalized phone (+91...) or raw 10-digit phone
    const clean10Digit = normalizedPhone.slice(-10);
    let user = await usersRepository.getByPhone(normalizedPhone);
    if (!user) {
      user = await usersRepository.getByPhone(clean10Digit);
      if (user) {
        // Upgrade user's phone in DB to normalized E.164 (+91) format
        user = await usersRepository.update(user.id, { phone: normalizedPhone });
      }
    }

    const resolvedCollegeName = (collegeName || college || "").trim() || null;
    const resolvedBranch = (branch || "").trim() || null;
    const resolvedCollegeId = (collegeId || "").trim() || null;
    const resolvedSessionCode = (sessionCode || "").trim().toUpperCase() || null;

    // Resolve source attribution: PAMPHLET_QR, SESSION_QR, IAPT, NON_PAMPHLET
    const rawSource = (signupSource || source || "").trim().toUpperCase();
    let effectiveSource = "NON_PAMPHLET";
    if (rawSource === "PAMPHLET_QR" || rawSource === "PAMPHLET") {
      effectiveSource = "PAMPHLET_QR";
    } else if (rawSource === "SESSION_QR" || rawSource.includes("SESSION") || resolvedSessionCode) {
      effectiveSource = "SESSION_QR";
    } else if (rawSource === "IAPT" || rawSource.includes("IAPT")) {
      effectiveSource = "IAPT";
    } else if (rawSource === "NON_PAMPHLET" || rawSource === "DIRECT_WEB" || rawSource === "ORGANIC") {
      effectiveSource = "NON_PAMPHLET";
    } else if (rawSource) {
      effectiveSource = rawSource;
    }

    if (!user) {
      // User doesn't exist -> Create new user with role 'STUDENT'
      const userName =
        name && name.trim() ? toTitleCase(name) : `Learner ${normalizedPhone.slice(-4)}`;

      user = await usersRepository.create({
        phone: normalizedPhone,
        name: userName,
        collegeId: resolvedCollegeId,
        collegeName: resolvedCollegeName,
        branch: resolvedBranch,
        role: "STUDENT",
        isActive: true,
        signupSource: effectiveSource,
        signupSessionCode: resolvedSessionCode,
        signupCollegeId: resolvedCollegeId,
        signupCollegeName: resolvedCollegeName,
        metadata: metadata || {},
      });
    } else if (user.role === "STUDENT") {
      // Only student accounts get lead/signup source attribution and branch updates
      const updateData: Partial<User> = {};
      if (name && name.trim()) {
        const formattedName = toTitleCase(name);
        if (
          !user.name ||
          user.name.startsWith("Learner ") ||
          user.name !== formattedName
        ) {
          updateData.name = formattedName;
        }
      }
      if (resolvedCollegeName && (!user.collegeName || user.collegeName !== resolvedCollegeName)) {
        updateData.collegeName = resolvedCollegeName;
      }
      if (resolvedCollegeId && (!user.collegeId || user.collegeId !== resolvedCollegeId)) {
        updateData.collegeId = resolvedCollegeId;
      }
      if (resolvedBranch && (!user.branch || user.branch !== resolvedBranch)) {
        updateData.branch = resolvedBranch;
      }
      if (resolvedSessionCode && !user.signupSessionCode) {
        updateData.signupSessionCode = resolvedSessionCode;
      }
      if (resolvedCollegeId && !user.signupCollegeId) {
        updateData.signupCollegeId = resolvedCollegeId;
      }
      if (resolvedCollegeName && !user.signupCollegeName) {
        updateData.signupCollegeName = resolvedCollegeName;
      }
      // If user had default NON_PAMPHLET or none, and joined via specific source like PAMPHLET_QR or SESSION_QR
      if (
        (!user.signupSource || user.signupSource === "NON_PAMPHLET") &&
        effectiveSource !== "NON_PAMPHLET"
      ) {
        updateData.signupSource = effectiveSource;
      }

      if (Object.keys(updateData).length > 0) {
        user = await usersRepository.update(user.id, updateData);
      }
    }
    // Non-student accounts (ADMIN, SUPER_ADMIN, MEMBER) are authenticated cleanly without student modifications.

    // Auto-sync student into CRM Leads
    if (user && user.role === "STUDENT") {
      try {
        await leadsRepository.upsertUserAsLead(user);
      } catch (e) {
        console.error("Auto-sync lead failed on login:", e);
      }
    }

    const tokens = generateTokens(user!);
    return { ...tokens, user };
  },

  async verifyOtp(body: {
    phone?: string;
    otp?: string;
    name?: string;
    college?: string;
    collegeName?: string;
    collegeId?: string;
    branch?: string;
    signupSource?: string;
    source?: string;
    sessionCode?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }) {
    // Seamlessly forward to login without requiring or checking OTP
    return this.login(body);
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
      return { ...tokens, user };
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  },

  async me(id: string) {
    const user = await usersRepository.getById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },
};
