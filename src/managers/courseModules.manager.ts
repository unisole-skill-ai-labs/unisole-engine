import { courseModulesRepository } from "../repositories/courseModules.repository";
import { CourseModule, NewCourseModule, courseModules } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const courseModulesManager = {
  async list(): Promise<CourseModule[]> {
    return courseModulesRepository.list();
  },
  async getById(id: string): Promise<CourseModule> {
    const row = await courseModulesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<CourseModule> {
    const values = filterColumns(body, courseModules) as NewCourseModule;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return courseModulesRepository.create(values);
  },
  async update(
    id: string,
    body: Record<string, unknown>
  ): Promise<CourseModule> {
    const values = filterColumns(body, courseModules) as NewCourseModule;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await courseModulesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await courseModulesRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
