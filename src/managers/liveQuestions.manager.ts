import { liveQuestionsRepository } from "../repositories/liveQuestions.repository";
import { LiveQuestion, liveQuestions, NewLiveQuestion } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const liveQuestionsManager = {
  async list(): Promise<LiveQuestion[]> {
    return liveQuestionsRepository.list();
  },
  async getById(id: string): Promise<LiveQuestion> {
    const row = await liveQuestionsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<LiveQuestion> {
    const values = filterColumns(body, liveQuestions) as NewLiveQuestion;
    values.id = await generateId(liveQuestions, "liveQuestions", liveQuestions.id);
    return liveQuestionsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<LiveQuestion> {
    const values = filterColumns(body, liveQuestions) as NewLiveQuestion;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await liveQuestionsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await liveQuestionsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
