import { modulesRepository } from "../repositories/modules.repository";
import { Module, modules, NewModule } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const modulesManager = {
  async list(): Promise<Module[]> {
    return modulesRepository.list();
  },
  async getById(id: string): Promise<Module> {
    const row = await modulesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Module> {
    const values = filterColumns(body, modules) as NewModule;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return modulesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Module> {
    const values = filterColumns(body, modules) as NewModule;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await modulesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await modulesRepository.removeWithCleanup(id);
    if (!row) throw new NotFoundError();
  },
  async getLessons(moduleId: string) {
    const found = await modulesRepository.getById(moduleId);
    if (!found) throw new NotFoundError();
    const rows = await modulesRepository.getLessonsForModule(moduleId);
    return rows.map((r) => r.module_item);
  },
};
