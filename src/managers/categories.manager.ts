import { categoriesRepository } from "../repositories/categories.repository";
import { Category, NewCategory, categories } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const categoriesManager = {
  async list(): Promise<Category[]> {
    return categoriesRepository.list();
  },
  async getById(id: string): Promise<Category> {
    const row = await categoriesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Category> {
    const values = filterColumns(body, categories) as NewCategory;
    values.id = await generateId(categories, "categories", categories.id);
    return categoriesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Category> {
    const values = filterColumns(body, categories) as NewCategory;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await categoriesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await categoriesRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
