import { collegesRepository } from "../repositories/colleges.repository";
import { College, NewCollege } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const collegesService = {
  async list(): Promise<College[]> {
    return collegesRepository.list();
  },

  async listActive(): Promise<College[]> {
    const all = await collegesRepository.list();
    return all.filter((c) => c.isActive);
  },

  async getById(id: string): Promise<College> {
    const college = await collegesRepository.getById(id);
    if (!college) throw new NotFoundError("College not found");
    return college;
  },

  async getBySlug(slug: string): Promise<College> {
    const college = await collegesRepository.getBySlug(slug);
    if (!college) throw new NotFoundError("College not found");
    return college;
  },

  async create(body: Record<string, unknown>): Promise<College> {
    const { name, slug, shortName, description } = body as any;
    if (!name || !slug) throw new ValidationError("name and slug are required");

    const existing = await collegesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A college with this slug already exists");

    return collegesRepository.create({
      name,
      slug,
      shortName: shortName || null,
      description: description || null,
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<College> {
    const existing = await collegesRepository.getById(id);
    if (!existing) throw new NotFoundError("College not found");

    const data: Partial<NewCollege> = {};
    if (body.name !== undefined) data.name = body.name as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.shortName !== undefined) data.shortName = body.shortName as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await collegesRepository.update(id, data);
    if (!updated) throw new NotFoundError("College not found");
    return updated;
  },
};
