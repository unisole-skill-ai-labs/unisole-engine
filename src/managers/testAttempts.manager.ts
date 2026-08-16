import { testAttemptsRepository } from "../repositories/testAttempts.repository";
import { TestAttempt, NewTestAttempt, testAttempts } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const testAttemptsManager = {
  async list(): Promise<TestAttempt[]> {
    return testAttemptsRepository.list();
  },
  async getById(id: string): Promise<TestAttempt> {
    const row = await testAttemptsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<TestAttempt> {
    const values = filterColumns(body, testAttempts) as NewTestAttempt;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return testAttemptsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<TestAttempt> {
    const values = filterColumns(body, testAttempts) as NewTestAttempt;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await testAttemptsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await testAttemptsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
