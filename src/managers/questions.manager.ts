import { questionsRepository } from "../repositories/questions.repository";
import { Question, NewQuestion, questions } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const questionsManager = {
  async list(): Promise<Question[]> {
    return questionsRepository.list();
  },
  async getById(id: string): Promise<Question> {
    const row = await questionsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Question> {
    const values = filterColumns(body, questions) as NewQuestion;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return questionsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Question> {
    const values = filterColumns(body, questions) as NewQuestion;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await questionsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await questionsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
