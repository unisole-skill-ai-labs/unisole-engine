import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users, User } from "../db/schema";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";
import { usersRepository } from "../repositories/users.repository";
import { otpService } from "./otp.service";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../middleware/auth";
import { toTitleCase, normalizePhone } from "../helpers/formatters";

function generateTokens(user: {
  id: string;
  phone: string;
  role: string;
  name?: string | null;
}) {
  const payload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
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
  async sendOtp(body: { phone?: string; channel?: string }) {
    const { phone, channel } = body;
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      throw new ValidationError("Mobile number is required");
    }
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const otpChannel = channel === "WHATSAPP" ? "WHATSAPP" as const : "SMS" as const;
    const result = await otpService.sendOtp(normalizedPhone, otpChannel);
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

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const isValid = await otpService.verifyOtp(normalizedPhone, String(otp));
    if (!isValid) {
      throw new ValidationError("Invalid or expired verification code");
    }

    // Look up user by phone number
    let user = await usersRepository.getByPhone(normalizedPhone);

    if (!user) {
      // User doesn't exist -> Create new user with role 'STUDENT'
      const userName =
        name && name.trim() ? toTitleCase(name) : `Learner ${normalizedPhone.slice(-4)}`;

      user = await usersRepository.create({
        phone: normalizedPhone,
        name: userName,
        role: "STUDENT",
        isActive: true,
      });
    } else {
      // If existing user was provided a new name and had a generic name, update it
      if (name && name.trim()) {
        const formattedName = toTitleCase(name);
        if (
          !user.name ||
          user.name.startsWith("Learner ") ||
          user.name !== formattedName
        ) {
          user = await usersRepository.update(user.id, { name: formattedName });
        }
      }
    }

    const tokens = generateTokens(user!);
    return { ...tokens, user };
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
