import { quizzesRepository } from "../repositories/quizzes.repository";
import { NewQuiz, Quiz, quizzes } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const quizzesManager = {
  async list(): Promise<Quiz[]> {
    return quizzesRepository.list();
  },
  async getById(id: string): Promise<Quiz> {
    const row = await quizzesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Quiz> {
    const values = filterColumns(body, quizzes) as NewQuiz;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return quizzesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Quiz> {
    const values = filterColumns(body, quizzes) as NewQuiz;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await quizzesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await quizzesRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
