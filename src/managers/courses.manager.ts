import { coursesRepository } from "../repositories/courses.repository";
import { Course, NewCourse, courses } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";

export const coursesManager = {
  async list(): Promise<Course[]> {
    return coursesRepository.list();
  },
  async getById(id: string): Promise<Course> {
    const row = await coursesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Course> {
    const values = filterColumns(body, courses) as NewCourse;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    return coursesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Course> {
    const values = filterColumns(body, courses) as NewCourse;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    values.updated_at = new Date();
    const row = await coursesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await coursesRepository.removeWithCleanup(id);
    if (!row) throw new NotFoundError();
  },
  async getModules(courseId: string) {
    const course = await coursesRepository.getById(courseId);
    if (!course) throw new NotFoundError();
    const rows = await coursesRepository.getModulesForCourse(courseId);
    const map = new Map<string, any>();
    for (const row of rows) {
      const mod = row.modules;
      if (!map.has(mod.id)) map.set(mod.id, { ...mod, lessons: [] });
      if (row.module_item) map.get(mod.id).lessons.push(row.module_item);
    }
    return [...map.values()];
  },
  async getTree(courseId: string) {
    const course = await this.getById(courseId);
    return { ...course, modules: await this.getModules(courseId) };
  },
};
