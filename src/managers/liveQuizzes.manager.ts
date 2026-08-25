import { liveQuizzesRepository } from "../repositories/liveQuizzes.repository";
import { LiveQuiz, liveQuizzes, NewLiveQuiz } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const liveQuizzesManager = {
  async list(): Promise<LiveQuiz[]> {
    return liveQuizzesRepository.list();
  },
  async getById(id: string): Promise<LiveQuiz> {
    const row = await liveQuizzesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<LiveQuiz> {
    const values = filterColumns(body, liveQuizzes) as NewLiveQuiz;
    values.id = await generateId(liveQuizzes, "liveQuizzes", liveQuizzes.id);
    return liveQuizzesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<LiveQuiz> {
    const values = filterColumns(body, liveQuizzes) as NewLiveQuiz;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await liveQuizzesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await liveQuizzesRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
