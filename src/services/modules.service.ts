import { modulesRepository } from "../repositories/modules.repository";
import { lessonsRepository } from "../repositories/lessons.repository";
import { buildValidatedNewLesson } from "./lessons.service";
import { Module, NewModule } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { appCache } from "../utils/cache";

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
    const { title, slug, description, unlockAt, lockAt } = body as any;
    if (!title || !slug) throw new ValidationError("title and slug are required");

    const unlockDate = unlockAt ? new Date(unlockAt) : null;
    const lockDate = lockAt ? new Date(lockAt) : null;
    if (unlockDate && lockDate && lockDate.getTime() <= unlockDate.getTime()) {
      throw new ValidationError("lockAt must be strictly after unlockAt");
    }

    const existing = await modulesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A module with this slug already exists");

    const created = await modulesRepository.create({
      title,
      slug,
      description: description || null,
      unlockAt: unlockDate ? unlockDate.toISOString() : null,
      lockAt: lockDate ? lockDate.toISOString() : null,
      status: "PUBLISHED",
    });
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return created;
  },

  async update(id: string, body: Record<string, unknown>): Promise<Module> {
    const existing = await modulesRepository.getById(id);
    if (!existing) throw new NotFoundError("Module not found");

    const data: Partial<NewModule> = {};
    if (body.title !== undefined) data.title = body.title as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.description !== undefined) data.description = body.description as string;
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

    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) return existing;

    const updated = await modulesRepository.update(id, data);
    if (!updated) throw new NotFoundError("Module not found");
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return updated;
  },

  async createAndAttachLesson(moduleId: string, body: Record<string, unknown>) {
    const newLesson = buildValidatedNewLesson(body);
    const existing = await lessonsRepository.getBySlug(newLesson.slug);
    if (existing) throw new ConflictError("A lesson with this slug already exists");

    const result = await modulesRepository.createAndAttachLesson(moduleId, newLesson);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return result;
  },

  async attachLesson(moduleId: string, lessonId: string, position?: number) {
    const result = await modulesRepository.attachLesson({ moduleId, lessonId, position });
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return result;
  },

  async detachLesson(moduleId: string, lessonId: string): Promise<void> {
    await modulesRepository.detachLesson(moduleId, lessonId);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
    await modulesRepository.reorderLessons(moduleId, lessonIds);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async moveLesson(sourceModuleId: string, targetModuleId: string, lessonId: string, targetPosition?: number): Promise<void> {
    await modulesRepository.moveLesson(sourceModuleId, targetModuleId, lessonId, targetPosition);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async getLessons(moduleId: string) {
    return modulesRepository.getLessons(moduleId);
  },
};
