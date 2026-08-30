import { usersRepository } from "../repositories/users.repository";
import { User, NewUser } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";

export const usersService = {
  async list(filters?: {
    collegeId?: string;
    branch?: string;
    role?: string;
    search?: string;
  }): Promise<User[]> {
    return usersRepository.list(filters);
  },

  async getById(id: string): Promise<User> {
    const user = await usersRepository.getById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async create(body: Record<string, unknown>): Promise<User> {
    if (!body.phone) {
      throw new ValidationError("Mobile phone number is required");
    }

    const phone = normalizePhone(body.phone as string);
    if (!phone) {
      throw new ValidationError("Invalid phone number format");
    }

    const existing = await usersRepository.getByPhone(phone);
    if (existing) {
      throw new ConflictError("A user with this phone number already exists");
    }

    const role = (body.role as string) || "STUDENT";
    if (!["STUDENT", "ADMIN", "SUPER_ADMIN", "MEMBER"].includes(role)) {
      throw new ValidationError("Invalid role");
    }

    const name = body.name ? toTitleCase(body.name as string) : undefined;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
    const collegeId = body.collegeId ? String(body.collegeId).trim() : null;
    const collegeName = body.collegeName ? String(body.collegeName).trim() : null;
    const branch = body.branch ? String(body.branch).trim() : null;

    return usersRepository.create({
      phone,
      name,
      role: role as any,
      collegeId,
      collegeName,
      branch,
      isActive,
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<User> {
    const existing = await usersRepository.getById(id);
    if (!existing) throw new NotFoundError("User not found");

    const data: Partial<NewUser> = {};
    if (body.name !== undefined) data.name = body.name ? toTitleCase(body.name as string) : null;
    if (body.role !== undefined) {
      const role = body.role as string;
      if (!["STUDENT", "ADMIN", "SUPER_ADMIN", "MEMBER"].includes(role)) throw new ValidationError("Invalid role");
      data.role = role as any;
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.phone !== undefined) {
      const phone = normalizePhone(body.phone as string);
      if (!phone) throw new ValidationError("Invalid phone number");
      data.phone = phone;
    }
    if (body.collegeId !== undefined) data.collegeId = body.collegeId ? String(body.collegeId).trim() : null;
    if (body.collegeName !== undefined) data.collegeName = body.collegeName ? String(body.collegeName).trim() : null;
    if (body.branch !== undefined) data.branch = body.branch ? String(body.branch).trim() : null;

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await usersRepository.update(id, data);
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  },

  async remove(id: string): Promise<User> {
    const existing = await usersRepository.getById(id);
    if (!existing) throw new NotFoundError("User not found");

    const deleted = await usersRepository.remove(id);
    if (!deleted) throw new NotFoundError("User not found");
    return deleted;
  },

  async deactivate(id: string): Promise<User> {
    const updated = await usersRepository.update(id, { isActive: false });
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  },
};
