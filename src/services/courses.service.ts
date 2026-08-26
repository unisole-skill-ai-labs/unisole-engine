import { coursesRepository } from "../repositories/courses.repository";
import { Course, NewCourse } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const coursesService = {
  async list(): Promise<Course[]> {
    return coursesRepository.list();
  },

  async getById(id: string): Promise<Course> {
    const course = await coursesRepository.getById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async create(body: Record<string, unknown>): Promise<Course> {
    const { title, slug, shortDescription, description } = body as any;
    if (!title || !slug) throw new ValidationError("title and slug are required");

    const existing = await coursesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A course with this slug already exists");

    return coursesRepository.create({
      title,
      slug,
      shortDescription: shortDescription || null,
      description: description || null,
      status: "DRAFT",
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<Course> {
    const existing = await coursesRepository.getById(id);
    if (!existing) throw new NotFoundError("Course not found");

    const data: Partial<NewCourse> = {};
    if (body.title !== undefined) data.title = body.title as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.status !== undefined) {
      const status = body.status as string;
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) throw new ValidationError("Invalid status");
      data.status = status as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    // Enforce archive-instead-of-delete for used courses (PRD §33)
    const updated = await coursesRepository.update(id, data);
    if (!updated) throw new NotFoundError("Course not found");
    return updated;
  },

  async attachModule(courseId: string, moduleId: string, position: number): Promise<void> {
    await coursesRepository.attachModule({ courseId, moduleId, position });
  },

  async detachModule(courseId: string, moduleId: string): Promise<void> {
    await coursesRepository.detachModule(courseId, moduleId);
  },

  async getModules(courseId: string) {
    return coursesRepository.getModules(courseId);
  },
};
