import { pathwaysRepository } from "../repositories/pathways.repository";
import { Pathway, NewPathway } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { CANONICAL_SEO_OFFERINGS } from "../constants/offerings";

export const pathwaysService = {
  async list(): Promise<Pathway[]> {
    const dbPathways = await pathwaysRepository.list();
    const existingIds = new Set(dbPathways.map((p) => p.id));
    const existingSlugs = new Set(dbPathways.map((p) => p.slug));

    const canonicalPathways: Pathway[] = CANONICAL_SEO_OFFERINGS
      .filter((o) => !existingIds.has(o.itemId) && !existingSlugs.has(o.slug))
      .map((o) => ({
        id: o.itemId,
        title: o.title,
        slug: o.slug,
        shortDescription: o.description,
        description: o.description,
        pricePaise: o.pricePaise,
        status: "PUBLISHED" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    return [...dbPathways, ...canonicalPathways];
  },

  async listPublished() {
    const all = await this.list();
    const published = all.filter((p) => p.status === "PUBLISHED" && p.isActive);

    const enriched = await Promise.all(
      published.map(async (pathway) => {
        const [categories, colleges, courses] = await Promise.all([
          pathwaysRepository.getCategoriesWithDetails(pathway.id).catch(() => []),
          pathwaysRepository.getCollegesWithDetails(pathway.id).catch(() => []),
          pathwaysRepository.getCoursesWithDetails(pathway.id).catch(() => []),
        ]);
        return {
          ...pathway,
          categories,
          colleges,
          courses,
          courseCount: courses.length,
        };
      })
    );

    return enriched;
  },

  async getById(id: string) {
    const pathway = await pathwaysRepository.getById(id);
    if (!pathway) {
      const canonical = CANONICAL_SEO_OFFERINGS.find((o) => o.itemId === id || o.slug === id);
      if (!canonical) throw new NotFoundError("Pathway not found");
      return {
        id: canonical.itemId,
        title: canonical.title,
        slug: canonical.slug,
        shortDescription: canonical.description,
        description: canonical.description,
        pricePaise: canonical.pricePaise,
        status: "PUBLISHED" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [],
        colleges: [],
        courses: [],
        courseCount: 0,
      };
    }

    const [categories, colleges, courses] = await Promise.all([
      pathwaysRepository.getCategoriesWithDetails(pathway.id),
      pathwaysRepository.getCollegesWithDetails(pathway.id),
      pathwaysRepository.getCoursesWithDetails(pathway.id),
    ]);

    return {
      ...pathway,
      categories,
      colleges,
      courses,
    };
  },

  async getBySlug(slug: string) {
    const pathway = await pathwaysRepository.getBySlug(slug);
    if (!pathway) {
      const canonical = CANONICAL_SEO_OFFERINGS.find((o) => o.slug === slug || o.itemId === slug);
      if (!canonical) throw new NotFoundError("Pathway not found");
      return {
        id: canonical.itemId,
        title: canonical.title,
        slug: canonical.slug,
        shortDescription: canonical.description,
        description: canonical.description,
        pricePaise: canonical.pricePaise,
        status: "PUBLISHED" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [],
        colleges: [],
        courses: [],
        courseCount: 0,
      };
    }

    const [categories, colleges, courses] = await Promise.all([
      pathwaysRepository.getCategoriesWithDetails(pathway.id),
      pathwaysRepository.getCollegesWithDetails(pathway.id),
      pathwaysRepository.getCoursesWithDetails(pathway.id),
    ]);

    return {
      ...pathway,
      categories,
      colleges,
      courses,
    };
  },

  async create(body: Record<string, unknown>): Promise<Pathway> {
    const { title, slug, shortDescription, description, pricePaise } = body as any;
    if (!title || !slug) throw new ValidationError("title and slug are required");

    const existing = await pathwaysRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A pathway with this slug already exists");

    return pathwaysRepository.create({
      title,
      slug,
      shortDescription: shortDescription || null,
      description: description || null,
      pricePaise: pricePaise ?? 0,
      status: "DRAFT",
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<Pathway> {
    const existing = await pathwaysRepository.getById(id);
    if (!existing) throw new NotFoundError("Pathway not found");

    const data: Partial<NewPathway> = {};
    if (body.title !== undefined) data.title = body.title as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.pricePaise !== undefined) data.pricePaise = Number(body.pricePaise);
    if (body.status !== undefined) {
      const status = body.status as string;
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) throw new ValidationError("Invalid status");
      data.status = status as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await pathwaysRepository.update(id, data);
    if (!updated) throw new NotFoundError("Pathway not found");
    return updated;
  },

  // --- Relationship management ---
  async attachCategory(pathwayId: string, categoryId: string): Promise<void> {
    await pathwaysRepository.attachCategory({ pathwayId, categoryId });
  },

  async detachCategory(pathwayId: string, categoryId: string): Promise<void> {
    await pathwaysRepository.detachCategory(pathwayId, categoryId);
  },

  async attachCollege(pathwayId: string, collegeId: string): Promise<void> {
    await pathwaysRepository.attachCollege({ pathwayId, collegeId });
  },

  async detachCollege(pathwayId: string, collegeId: string): Promise<void> {
    await pathwaysRepository.detachCollege(pathwayId, collegeId);
  },

  async attachCourse(pathwayId: string, courseId: string, position: number): Promise<void> {
    await pathwaysRepository.attachCourse({ pathwayId, courseId, position });
  },

  async detachCourse(pathwayId: string, courseId: string): Promise<void> {
    await pathwaysRepository.detachCourse(pathwayId, courseId);
  },

  async getCourses(pathwayId: string) {
    return pathwaysRepository.getCourses(pathwayId);
  },
};
