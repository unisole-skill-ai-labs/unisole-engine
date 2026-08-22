import { moduleItemsRepository } from "../repositories/moduleItems.repository";
import { ModuleItem, NewModuleItem, moduleItems } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const moduleItemsManager = {
  async list(): Promise<ModuleItem[]> {
    return moduleItemsRepository.list();
  },
  async getById(id: string): Promise<ModuleItem> {
    const row = await moduleItemsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<ModuleItem> {
    const values = filterColumns(body, moduleItems) as NewModuleItem;
    values.id = await generateId(moduleItems, "moduleItems", moduleItems.id);
    return moduleItemsRepository.create(values);
  },
  async update(
    id: string,
    body: Record<string, unknown>
  ): Promise<ModuleItem> {
    const values = filterColumns(body, moduleItems) as NewModuleItem;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await moduleItemsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await moduleItemsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
