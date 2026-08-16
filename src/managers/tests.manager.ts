import { testsRepository } from "../repositories/tests.repository";
import { Test, NewTest, tests } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const testsManager = {
  async list(): Promise<Test[]> {
    return testsRepository.list();
  },
  async getById(id: string): Promise<Test> {
    const row = await testsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Test> {
    const values = filterColumns(body, tests) as NewTest;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return testsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Test> {
    const values = filterColumns(body, tests) as NewTest;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await testsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await testsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
