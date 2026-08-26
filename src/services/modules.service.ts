import { modulesRepository } from "../repositories/modules.repository";
import { Module, NewModule } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const modulesService = {
  async list(): Promise<Module[]> {
    return modulesRepository.list();
  },

  async getById(id: string): Promise<Module> {
    const mod = await modulesRepository.getById(id);
    if (!mod) throw new NotFoundError("Module not found");
    return mod;
  },

  async create(body: Record<string, unknown>): Promise<Module> {
    const { title, slug, description } = body as any;
    if (!title || !slug) throw new ValidationError("title and slug are required");

    const existing = await modulesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A module with this slug already exists");

    return modulesRepository.create({
      title,
      slug,
      description: description || null,
      status: "DRAFT",
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<Module> {
    const existing = await modulesRepository.getById(id);
    if (!existing) throw new NotFoundError("Module not found");

    const data: Partial<NewModule> = {};
    if (body.title !== undefined) data.title = body.title as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.status !== undefined) {
      const status = body.status as string;
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) throw new ValidationError("Invalid status");
      data.status = status as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await modulesRepository.update(id, data);
    if (!updated) throw new NotFoundError("Module not found");
    return updated;
  },

  async attachLesson(moduleId: string, lessonId: string, position: number): Promise<void> {
    await modulesRepository.attachLesson({ moduleId, lessonId, position });
  },

  async detachLesson(moduleId: string, lessonId: string): Promise<void> {
    await modulesRepository.detachLesson(moduleId, lessonId);
  },

  async getLessons(moduleId: string) {
    return modulesRepository.getLessons(moduleId);
  },
};
