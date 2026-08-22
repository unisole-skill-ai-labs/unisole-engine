import { coursesRepository } from "../repositories/courses.repository";
import { Course, NewCourse, courses } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const coursesManager = {
  async list(filters?: { categoryId?: string; search?: string }): Promise<Course[]> {
    return coursesRepository.list(filters);
  },
  async getById(id: string): Promise<Course> {
    let row = await coursesRepository.getById(id);
    if (!row) {
      // Also try lookup by slug for friendly URLs
      row = await coursesRepository.getBySlug(id);
    }
    if (!row) throw new NotFoundError("Course not found");
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Course> {
    const values = filterColumns(body, courses) as NewCourse;
    values.id = await generateId(courses, "courses", courses.id);
    const now = new Date();
    values.created_at = now;
    values.updated_at = now;
    return coursesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Course> {
    const values = filterColumns(body, courses) as NewCourse;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    values.updated_at = new Date();
    const row = await coursesRepository.update(id, values);
    if (!row) throw new NotFoundError("Course not found");
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await coursesRepository.remove(id);
    if (!row) throw new NotFoundError("Course not found");
  },
  async getModules(courseId: string) {
    const course = await this.getById(courseId);
    const rows = await coursesRepository.getModulesForCourse(course.id);
    const map = new Map<string, any>();
    for (const row of rows) {
      const mod = row.modules;
      if (!map.has(mod.id)) map.set(mod.id, { ...mod, items: [] });
      if (row.module_item) map.get(mod.id).items.push(row.module_item);
    }
    return [...map.values()];
  },
  async getTree(courseId: string) {
    const course = await this.getById(courseId);
    return { ...course, modules: await this.getModules(course.id) };
  },
};
