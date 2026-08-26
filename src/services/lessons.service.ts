import { lessonsRepository } from "../repositories/lessons.repository";
import { Lesson, NewLesson } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export const lessonsService = {
  async list(): Promise<Lesson[]> {
    return lessonsRepository.list();
  },

  async getById(id: string): Promise<Lesson> {
    const lesson = await lessonsRepository.getById(id);
    if (!lesson) throw new NotFoundError("Lesson not found");
    return lesson;
  },

  async create(body: Record<string, unknown>): Promise<Lesson> {
    const { title, slug, description, content, videoUrl, durationMinutes } = body as any;
    if (!title || !slug) throw new ValidationError("title and slug are required");

    const existing = await lessonsRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A lesson with this slug already exists");

    return lessonsRepository.create({
      title,
      slug,
      description: description || null,
      content: content || null,
      videoUrl: videoUrl || null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      status: "DRAFT",
    });
  },

  async update(id: string, body: Record<string, unknown>): Promise<Lesson> {
    const existing = await lessonsRepository.getById(id);
    if (!existing) throw new NotFoundError("Lesson not found");

    const data: Partial<NewLesson> = {};
    if (body.title !== undefined) data.title = body.title as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.content !== undefined) data.content = body.content as string;
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl as string;
    if (body.durationMinutes !== undefined) data.durationMinutes = Number(body.durationMinutes);
    if (body.status !== undefined) {
      const status = body.status as string;
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) throw new ValidationError("Invalid status");
      data.status = status as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) throw new ValidationError("No valid fields provided");

    const updated = await lessonsRepository.update(id, data);
    if (!updated) throw new NotFoundError("Lesson not found");
    return updated;
  },
};
