import { lessonsRepository } from "../repositories/lessons.repository";
import { Lesson, NewLesson } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export function buildValidatedNewLesson(body: Record<string, unknown>): Omit<NewLesson, "id"> {
  const { title, slug, description, content, videoUrl, durationMinutes, unlockAt, lockAt } = body as any;
  if (!title || !slug) throw new ValidationError("title and slug are required");

  const unlockDate = unlockAt ? new Date(unlockAt) : null;
  const lockDate = lockAt ? new Date(lockAt) : null;
  if (unlockDate && lockDate && lockDate.getTime() <= unlockDate.getTime()) {
    throw new ValidationError("lockAt must be strictly after unlockAt");
  }

  return {
    title,
    slug,
    description: description || null,
    content: content || null,
    videoUrl: videoUrl || null,
    durationMinutes: durationMinutes ? Number(durationMinutes) : null,
    unlockAt: unlockDate ? unlockDate.toISOString() : null,
    lockAt: lockDate ? lockDate.toISOString() : null,
    status: "DRAFT",
  };
}

export const lessonsService = {
  async list(): Promise<Lesson[]> {
    return lessonsRepository.list();
  },

  async listOrphans(): Promise<any[]> {
    return lessonsRepository.listOrphans();
  },

  async getById(id: string): Promise<Lesson> {
    const lesson = await lessonsRepository.getById(id);
    if (!lesson) throw new NotFoundError("Lesson not found");
    return lesson;
  },

  async create(body: Record<string, unknown>): Promise<Lesson> {
    const newLesson = buildValidatedNewLesson(body);
    const existing = await lessonsRepository.getBySlug(newLesson.slug);
    if (existing) throw new ConflictError("A lesson with this slug already exists");

    return lessonsRepository.create(newLesson);
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
    if (body.unlockAt !== undefined) data.unlockAt = body.unlockAt ? new Date(body.unlockAt as string).toISOString() : null;
    if (body.lockAt !== undefined) data.lockAt = body.lockAt ? new Date(body.lockAt as string).toISOString() : null;

    // Server-side validation: lockAt must be strictly after unlockAt
    const effectiveUnlockStr = data.unlockAt !== undefined ? data.unlockAt : existing.unlockAt;
    const effectiveLockStr = data.lockAt !== undefined ? data.lockAt : existing.lockAt;
    if (effectiveUnlockStr && effectiveLockStr) {
      const unlockMs = new Date(effectiveUnlockStr).getTime();
      const lockMs = new Date(effectiveLockStr).getTime();
      if (!isNaN(unlockMs) && !isNaN(lockMs) && lockMs <= unlockMs) {
        throw new ValidationError("lockAt must be strictly after unlockAt");
      }
    }

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
