import { eq, or, and, ilike, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, User, colleges, branches } from "../db/schema";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";
import { usersRepository } from "../repositories/users.repository";
import { leadsRepository } from "../repositories/leads.repository";
import { collegesRepository } from "../repositories/colleges.repository";
import { branchesRepository } from "../repositories/branches.repository";
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
  let permissions = (user.metadata && Array.isArray(user.metadata.permissions))
    ? user.metadata.permissions
    : [];

  if (permissions.length === 0) {
    const des = (user.designation || "").toUpperCase();
    const role = (user.role || "").toUpperCase();
    if (role === "SALES" || des.includes("SALES") || des.includes("TELECALL") || des.includes("COUNSEL")) {
      permissions = ["leads:view", "leads:manage"];
    }
  }

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

    if (!["SUPER_ADMIN", "ADMIN", "MEMBER", "SALES"].includes(user.role)) {
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

    let resolvedCollegeName = (collegeName || college || "").trim() || null;
    let resolvedBranch = (branch || "").trim() || null;
    let resolvedCollegeId: string | null = (collegeId || "").trim() || null;
    const resolvedSessionCode = (sessionCode || "").trim().toUpperCase() || null;

    // Auto-resolve college by name if collegeId not provided
    if (resolvedCollegeName && !resolvedCollegeId) {
      try {
        const [existingCollege] = await db
          .select()
          .from(colleges)
          .where(ilike(colleges.name, `%${resolvedCollegeName}%`))
          .limit(1);

        if (existingCollege) {
          resolvedCollegeId = existingCollege.id;
          resolvedCollegeName = existingCollege.name;
        } else {
          // Check by keywords e.g. Hydro Engineering / Bandla / Bilaspur
          const [fuzzyCollege] = await db
            .select()
            .from(colleges)
            .where(
              or(
                ilike(colleges.name, "%Hydro%"),
                ilike(colleges.name, "%Bandla%"),
                ilike(colleges.shortName, "%Hydro%"),
                ilike(colleges.shortName, "%Bandla%")
              )
            )
            .limit(1);

          if (fuzzyCollege && resolvedCollegeName.toLowerCase().includes("hydro")) {
            resolvedCollegeId = fuzzyCollege.id;
            resolvedCollegeName = fuzzyCollege.name;
          } else {
            const slug =
              resolvedCollegeName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
                .slice(0, 40) + `-${Date.now().toString(36)}`;

            const newCol = await collegesRepository.create({
              name: resolvedCollegeName,
              slug,
              isActive: true,
            });
            if (newCol) {
              resolvedCollegeId = newCol.id;
            }
          }
        }
      } catch (colErr) {
        console.warn("[AuthService] Dynamic college lookup notice:", colErr);
      }
    }

    // Auto-register branch under college if not present
    if (resolvedBranch && resolvedCollegeId) {
      try {
        const [existingBranch] = await db
          .select()
          .from(branches)
          .where(
            and(
              eq(branches.collegeId, resolvedCollegeId),
              ilike(branches.name, resolvedBranch)
            )
          )
          .limit(1);

        if (!existingBranch) {
          const code =
            resolvedBranch
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 10) || "GEN";

          await branchesRepository.create({
            name: resolvedBranch,
            code,
            collegeId: resolvedCollegeId,
            isActive: true,
          });
        }
      } catch (brErr) {
        console.warn("[AuthService] Branch creation notice:", brErr);
      }
    }

    // Resolve source attribution: PAMPHLET_QR, SESSION_QR, IAPT, AI_WORKSHOP, PROFESSOR_NETWORK, NON_PAMPHLET
    const rawSource = (signupSource || source || "").trim().toUpperCase();
    let effectiveSource = "NON_PAMPHLET";
    if (rawSource === "PAMPHLET_QR" || rawSource === "PAMPHLET") {
      effectiveSource = "PAMPHLET_QR";
    } else if (rawSource === "SESSION_QR" || rawSource.includes("SESSION") || resolvedSessionCode) {
      effectiveSource = "SESSION_QR";
    } else if (rawSource === "IAPT" || rawSource.includes("IAPT")) {
      effectiveSource = "IAPT";
    } else if (rawSource === "AI_WORKSHOP" || rawSource === "WORKSHOP" || rawSource === "AI_MASTERCLASS") {
      effectiveSource = "AI_WORKSHOP";
    } else if (rawSource === "PROFESSOR_NETWORK" || rawSource === "PROFESSOR" || rawSource === "FACULTY") {
      effectiveSource = "PROFESSOR_NETWORK";
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
      if (metadata && typeof metadata === "object") {
        const prevMeta = (typeof user.metadata === "object" && user.metadata !== null)
          ? (user.metadata as Record<string, any>)
          : {};
        updateData.metadata = { ...prevMeta, ...metadata };
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
