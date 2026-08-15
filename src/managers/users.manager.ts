import { usersRepository } from "../repositories/users.repository";
import { NewUser, User, users } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const usersManager = {
  async list(): Promise<User[]> {
    return usersRepository.list();
  },
  async getById(id: string): Promise<User> {
    const row = await usersRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<User> {
    const values = filterColumns(body, users) as NewUser;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return usersRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<User> {
    const values = filterColumns(body, users) as NewUser;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    values.updated_at = new Date();
    const row = await usersRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await usersRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
