import { moduleLessonsRepository } from "../repositories/moduleLessons.repository";
import { ModuleLesson, NewModuleLesson, moduleLessons } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const moduleLessonsManager = {
  async list(): Promise<ModuleLesson[]> {
    return moduleLessonsRepository.list();
  },
  async getById(id: string): Promise<ModuleLesson> {
    const row = await moduleLessonsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<ModuleLesson> {
    const values = filterColumns(body, moduleLessons) as NewModuleLesson;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return moduleLessonsRepository.create(values);
  },
  async update(
    id: string,
    body: Record<string, unknown>
  ): Promise<ModuleLesson> {
    const values = filterColumns(body, moduleLessons) as NewModuleLesson;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await moduleLessonsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await moduleLessonsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
