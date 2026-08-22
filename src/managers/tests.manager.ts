import { testsRepository } from "../repositories/tests.repository";
import { Test, NewTest, tests } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const testsManager = {
  async list(options: { withDetails?: boolean } = {}): Promise<any[]> {
    if (options.withDetails) {
      return testsRepository.listWithDetails();
    }
    return testsRepository.list();
  },
  async getById(id: string, options: { withDetails?: boolean } = {}): Promise<any> {
    if (options.withDetails) {
      const row = await testsRepository.getByIdWithDetails(id);
      if (!row) throw new NotFoundError("Test not found");
      return row;
    }
    const row = await testsRepository.getById(id);
    if (!row) throw new NotFoundError("Test not found");
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Test> {
    const values = filterColumns(body, tests) as NewTest;
    values.id = await generateId(tests, "tests", tests.id);
    return testsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Test> {
    const values = filterColumns(body, tests) as NewTest;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await testsRepository.update(id, values);
    if (!row) throw new NotFoundError("Test not found");
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await testsRepository.remove(id);
    if (!row) throw new NotFoundError("Test not found");
  },
};
