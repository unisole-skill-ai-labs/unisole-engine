import { usersRepository } from "../repositories/users.repository";
import { User, NewUser } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";

export const usersService = {
  async list(): Promise<User[]> {
    return usersRepository.list();
  },

  async getById(id: string): Promise<User> {
    const user = await usersRepository.getById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async update(id: string, body: Record<string, unknown>): Promise<User> {
    const existing = await usersRepository.getById(id);
    if (!existing) throw new NotFoundError("User not found");

    const data: Partial<NewUser> = {};
    if (body.name !== undefined) data.name = toTitleCase(body.name as string);
    if (body.role !== undefined) {
      const role = body.role as string;
      if (!["STUDENT", "ADMIN"].includes(role)) throw new ValidationError("Invalid role");
      data.role = role as "STUDENT" | "ADMIN";
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.phone !== undefined) {
      const phone = normalizePhone(body.phone as string);
      if (!phone) throw new ValidationError("Invalid phone number");
      data.phone = phone;
    }

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await usersRepository.update(id, data);
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  },

  async deactivate(id: string): Promise<User> {
    const updated = await usersRepository.update(id, { isActive: false });
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  },
};
