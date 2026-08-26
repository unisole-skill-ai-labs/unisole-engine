import { categoriesRepository } from "../repositories/categories.repository";
import { Category, NewCategory } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const categoriesService = {
  async list(): Promise<Category[]> {
    return categoriesRepository.list();
  },

  async listActive(): Promise<Category[]> {
    const all = await categoriesRepository.list();
    return all.filter((c) => c.isActive);
  },

  async getById(id: string): Promise<Category> {
    const category = await categoriesRepository.getById(id);
    if (!category) throw new NotFoundError("Category not found");
    return category;
  },

  async create(body: Record<string, unknown>): Promise<Category> {
    const { name, slug, description } = body as any;
    if (!name || !slug) throw new ValidationError("name and slug are required");

    const existing = await categoriesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A category with this slug already exists");

    return categoriesRepository.create({
      name,
      slug,
      description: description || null,
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<Category> {
    const existing = await categoriesRepository.getById(id);
    if (!existing) throw new NotFoundError("Category not found");

    const data: Partial<NewCategory> = {};
    if (body.name !== undefined) data.name = body.name as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await categoriesRepository.update(id, data);
    if (!updated) throw new NotFoundError("Category not found");
    return updated;
  },
};
