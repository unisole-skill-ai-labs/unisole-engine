import { testAttemptsRepository } from "../repositories/testAttempts.repository";
import { testsRepository } from "../repositories/tests.repository";
import { TestAttempt, NewTestAttempt, testAttempts } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const testAttemptsManager = {
  async list(options: { userId?: string; testId?: string } = {}): Promise<TestAttempt[]> {
    if (options.testId && options.userId) {
      return testAttemptsRepository.listByTestAndUser(options.testId, options.userId);
    }
    if (options.userId) {
      return testAttemptsRepository.listByUser(options.userId);
    }
    return testAttemptsRepository.list();
  },
  async getById(id: string): Promise<TestAttempt> {
    const row = await testAttemptsRepository.getById(id);
    if (!row) throw new NotFoundError("Test attempt not found");
    return row;
  },
  async create(
    body: Record<string, unknown>,
    user?: { id: string; role: string }
  ): Promise<TestAttempt> {
    const targetUserId = (body.user_id as string) || user?.id;
    const testId = body.test_id as string;

    if (!targetUserId || !testId) {
      throw new ValidationError("Both test_id and user_id are required");
    }

    const test = await testsRepository.getById(testId);
    if (!test) {
      throw new NotFoundError("Test not found");
    }

    const values = filterColumns(
      {
        ...body,
        user_id: targetUserId,
        test_id: testId,
        status: body.status || "submitted",
        score: body.score != null ? String(body.score) : "0",
        answers: body.answers || [],
      },
      testAttempts
    ) as NewTestAttempt;

    values.id = await generateId(testAttempts, "testAttempts", testAttempts.id);
    return testAttemptsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<TestAttempt> {
    const values = filterColumns(body, testAttempts) as NewTestAttempt;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await testAttemptsRepository.update(id, values);
    if (!row) throw new NotFoundError("Test attempt not found");
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await testAttemptsRepository.remove(id);
    if (!row) throw new NotFoundError("Test attempt not found");
  },
};
