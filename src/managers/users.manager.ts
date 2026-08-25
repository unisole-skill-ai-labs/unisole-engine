import { hashSync } from "bcryptjs";
import { usersRepository } from "../repositories/users.repository";
import { NewUser, User, users } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export function sanitizeUser(user: User | undefined): Omit<User, "password_hash"> | undefined {
  if (!user) return undefined;
  const { password_hash, ...rest } = user;
  return rest;
}

export const usersManager = {
  async list(): Promise<Omit<User, "password_hash">[]> {
    const rows = await usersRepository.list();
    return rows.map((u) => sanitizeUser(u)!);
  },
  async getById(id: string): Promise<Omit<User, "password_hash">> {
    const row = await usersRepository.getById(id);
    if (!row) throw new NotFoundError("User not found");
    return sanitizeUser(row)!;
  },
  async create(body: Record<string, unknown>): Promise<Omit<User, "password_hash">> {
    const { password, ...rest } = body;
    const values = filterColumns(rest, users) as NewUser;
    values.id = await generateId(users, "users", users.id);
    const now = new Date();
    values.created_at = now;
    values.updated_at = now;

    // Validate and normalize role
    const validRoles = ["student", "admin"];
    if (values.role) {
      const normalizedRole = String(values.role).trim().toLowerCase();
      if (validRoles.includes(normalizedRole)) {
        values.role = normalizedRole as "student" | "admin";
      } else if (normalizedRole.startsWith("student")) {
        // Automatically map student typos like "studentb" to "student"
        values.role = "student";
      } else {
        throw new ValidationError(
          `Invalid role '${values.role}'. Allowed roles: ${validRoles.join(", ")}`
        );
      }
    } else {
      values.role = "student";
    }

    // Validate and normalize auth_provider
    const validProviders = ["local", "google", "supabase", "phone"];
    if (values.auth_provider) {
      const normalizedProvider = String(values.auth_provider).trim().toLowerCase();
      if (validProviders.includes(normalizedProvider)) {
        values.auth_provider = normalizedProvider as "local" | "google" | "supabase" | "phone";
      } else {
        throw new ValidationError(
          `Invalid auth_provider '${values.auth_provider}'. Allowed: ${validProviders.join(", ")}`
        );
      }
    } else {
      values.auth_provider = "local";
    }

    if (password) {
      values.password_hash = hashSync(String(password), 10);
    }
    const created = await usersRepository.create(values);
    return sanitizeUser(created)!;
  },
  async update(id: string, body: Record<string, unknown>): Promise<Omit<User, "password_hash">> {
    const values = filterColumns(body, users) as NewUser;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }

    const validRoles = ["student", "admin"];
    if (values.role) {
      const normalizedRole = String(values.role).trim().toLowerCase();
      if (validRoles.includes(normalizedRole)) {
        values.role = normalizedRole as "student" | "admin";
      } else if (normalizedRole.startsWith("student")) {
        values.role = "student";
      } else {
        throw new ValidationError(
          `Invalid role '${values.role}'. Allowed roles: ${validRoles.join(", ")}`
        );
      }
    }

    const validProviders = ["local", "google", "supabase", "phone"];
    if (values.auth_provider) {
      const normalizedProvider = String(values.auth_provider).trim().toLowerCase();
      if (validProviders.includes(normalizedProvider)) {
        values.auth_provider = normalizedProvider as "local" | "google" | "supabase" | "phone";
      } else {
        throw new ValidationError(
          `Invalid auth_provider '${values.auth_provider}'. Allowed: ${validProviders.join(", ")}`
        );
      }
    }

    values.updated_at = new Date();
    const row = await usersRepository.update(id, values);
    if (!row) throw new NotFoundError("User not found");
    return sanitizeUser(row)!;
  },
  async changePassword(id: string, password: string): Promise<void> {
    if (!password || password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters");
    }
    const row = await usersRepository.getById(id);
    if (!row) throw new NotFoundError("User not found");
    const password_hash = hashSync(password, 10);
    await usersRepository.update(id, { password_hash, updated_at: new Date() } as NewUser);
  },
  async remove(id: string): Promise<void> {
    const row = await usersRepository.remove(id);
    if (!row) throw new NotFoundError("User not found");
  },
};
