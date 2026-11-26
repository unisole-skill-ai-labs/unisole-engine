import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { coursesRepository } from "../repositories/courses.repository";
import { modulesRepository } from "../repositories/modules.repository";
import { lessonsRepository } from "../repositories/lessons.repository";
import { Course, NewCourse, courseAssignments } from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { appCache } from "../utils/cache";

export const coursesService = {
  async list(): Promise<Course[]> {
    return coursesRepository.list();
  },

  async listPublished(): Promise<Course[]> {
    return coursesRepository.listPublished();
  },

  async getById(id: string): Promise<Course> {
    const course = await coursesRepository.getById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async getBySlug(slug: string): Promise<Course> {
    const course = await coursesRepository.getBySlugOrId(slug);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async create(body: Record<string, unknown>): Promise<Course> {
    const { title, slug, shortDescription, description, pricePaise, mrpPaise, metadata, status, isActive } = body as any;
    if (!title || !slug) throw new ValidationError("title and slug are required");

    const existing = await coursesRepository.getBySlug(slug);
    if (existing) throw new ConflictError("A course with this slug already exists");

    const created = await coursesRepository.create({
      title,
      slug,
      shortDescription: shortDescription || null,
      description: description || null,
      pricePaise: Number(pricePaise) || 0,
      mrpPaise: Number(mrpPaise) || 0,
      metadata: metadata || {},
      status: "PUBLISHED",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return created;
  },

  async update(id: string, body: Record<string, unknown>): Promise<Course> {
    const existing = await coursesRepository.getById(id);
    if (!existing) throw new NotFoundError("Course not found");

    const data: Partial<NewCourse> = {};
    if (body.title !== undefined) data.title = body.title as string;
    if (body.slug !== undefined) data.slug = body.slug as string;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription as string;
    if (body.description !== undefined) data.description = body.description as string;
    if (body.pricePaise !== undefined) data.pricePaise = Number(body.pricePaise);
    if (body.mrpPaise !== undefined) data.mrpPaise = Number(body.mrpPaise);
    if (body.metadata !== undefined) data.metadata = body.metadata as Record<string, unknown>;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (Object.keys(data).length === 0) return existing;

    const updated = await coursesRepository.update(id, data);
    if (!updated) throw new NotFoundError("Course not found");
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return updated;
  },

  async delete(id: string): Promise<Course> {
    const existing = await coursesRepository.getById(id);
    if (!existing) throw new NotFoundError("Course not found");
    const removed = await coursesRepository.remove(id);
    if (!removed) throw new NotFoundError("Course not found");
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return removed;
  },

  async attachModule(courseId: string, moduleId: string, position: number): Promise<void> {
    await coursesRepository.attachModule({ courseId, moduleId, position });
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async detachModule(courseId: string, moduleId: string): Promise<void> {
    await coursesRepository.detachModule(courseId, moduleId);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async clearModules(courseId: string): Promise<void> {
    await coursesRepository.clearModules(courseId);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async purgeAllCurriculum(): Promise<{ modulesDeleted: number; lessonsDeleted: number }> {
    const res = await coursesRepository.purgeAllCurriculum();
    appCache.invalidatePattern(/^pathway_hierarchy:/);
    return res;
  },

  async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
    await coursesRepository.reorderModules(courseId, moduleIds);
    appCache.invalidatePattern(/^pathway_hierarchy:/);
  },

  async getModules(courseId: string) {
    return coursesRepository.getModules(courseId);
  },

  async exportCourse(courseId: string) {
    const course = await this.getById(courseId);
    const modulesList: any[] = [];
    try {
      const rawModules = await this.getModules(courseId);
      for (const mod of rawModules) {
        let lessonRows: any[] = [];
        try {
          lessonRows = await modulesRepository.getLessons(mod.moduleId || mod.id);
        } catch {}

        let assignmentsList: any[] = [];
        try {
          const assignRows = await db
            .select()
            .from(courseAssignments)
            .where(
              and(
                eq(courseAssignments.courseId, courseId),
                eq(courseAssignments.moduleId, mod.moduleId || mod.id)
              )
            );
          assignmentsList = assignRows.map((a) => ({
            title: a.title,
            slug: a.slug,
            category: a.category,
            type: a.type,
            maxScore: a.maxScore,
            config: a.config,
          }));
        } catch {}

        modulesList.push({
          title: mod.title,
          slug: mod.slug,
          description: mod.description,
          position: mod.position,
          unlockAt: mod.unlockAt,
          lockAt: mod.lockAt,
          lessons: lessonRows.map((l) => ({
            title: l.title,
            slug: l.slug,
            description: l.description,
            content: l.content,
            videoUrl: l.videoUrl,
            durationMinutes: l.durationMinutes,
            position: l.position,
          })),
          assignments: assignmentsList,
        });
      }
    } catch {}

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      course: {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        pricePaise: course.pricePaise,
        mrpPaise: course.mrpPaise,
        metadata: course.metadata,
        status: course.status,
      },
      modules: modulesList,
    };
  },

  async duplicateCourse(courseId: string, options?: { title?: string; slug?: string }) {
    const original = await this.getById(courseId);
    const title = options?.title || `${original.title} (Copy)`;
    let slug = options?.slug;
    if (!slug) {
      slug = `${original.slug}-copy`;
      let counter = 1;
      while (await coursesRepository.getBySlug(slug)) {
        counter++;
        slug = `${original.slug}-copy-${counter}`;
      }
    } else {
      const existing = await coursesRepository.getBySlug(slug);
      if (existing) throw new ConflictError(`Course with slug "${slug}" already exists`);
    }

    const duplicatedCourse = await coursesRepository.create({
      title,
      slug,
      shortDescription: original.shortDescription,
      description: original.description,
      pricePaise: original.pricePaise,
      mrpPaise: original.mrpPaise,
      metadata: { ...(original.metadata as any), duplicatedFrom: original.id },
      status: "PUBLISHED",
      isActive: true,
    });

    try {
      const rawModules = await this.getModules(courseId);
      for (const mod of rawModules) {
        const modSlug = `${mod.slug}-${duplicatedCourse.id.slice(-4)}`;
        const newMod = await modulesRepository.create({
          title: mod.title,
          slug: modSlug,
          description: mod.description,
          status: "PUBLISHED",
          isActive: true,
          unlockAt: mod.unlockAt,
          lockAt: mod.lockAt,
        });

        await coursesRepository.attachModule({
          courseId: duplicatedCourse.id,
          moduleId: newMod.id,
          position: mod.position,
        });

        const lessonRows = await modulesRepository.getLessons(mod.moduleId || mod.id);
        for (const les of lessonRows) {
          const lesSlug = `${les.slug}-${duplicatedCourse.id.slice(-4)}`;
          const newLes = await lessonsRepository.create({
            title: les.title,
            slug: lesSlug,
            description: les.description,
            content: les.content,
            videoUrl: les.videoUrl,
            durationMinutes: les.durationMinutes,
            status: "PUBLISHED",
            isActive: true,
            unlockAt: les.unlockAt,
            lockAt: les.lockAt,
          });

          await modulesRepository.attachLesson({
            moduleId: newMod.id,
            lessonId: newLes.id,
            position: les.position,
          });
        }
      }
    } catch (e) {
      console.warn("Notice: full module cloning encountered an exception, proceeding with course copy:", e);
    }

    return duplicatedCourse;
  },

  async importCourse(payload: any, overwrite?: boolean) {
    const courseData = payload.course || payload;
    const { title, slug, shortDescription, description, pricePaise, mrpPaise, metadata } = courseData;
    if (!title || !slug) throw new ValidationError("Course title and slug are required");

    const existing = await coursesRepository.getBySlug(slug);
    if (existing && !overwrite) {
      return {
        conflict: true,
        existingCourse: {
          id: existing.id,
          title: existing.title,
          slug: existing.slug,
        },
      };
    }

    let targetCourse: Course;
    if (existing && overwrite) {
      targetCourse = (await coursesRepository.update(existing.id, {
        title,
        shortDescription: shortDescription || null,
        description: description || null,
        pricePaise: Number(pricePaise) || 0,
        mrpPaise: Number(mrpPaise) || 0,
        metadata: metadata || {},
        status: "PUBLISHED",
      }))!;
      await coursesRepository.clearModules(targetCourse.id);
    } else {
      targetCourse = await coursesRepository.create({
        title,
        slug,
        shortDescription: shortDescription || null,
        description: description || null,
        pricePaise: Number(pricePaise) || 0,
        mrpPaise: Number(mrpPaise) || 0,
        metadata: metadata || {},
        status: "PUBLISHED",
        isActive: true,
      });
    }

    const rawModules = Array.isArray(payload.modules) ? payload.modules : [];
    for (let mIdx = 0; mIdx < rawModules.length; mIdx++) {
      const mod = rawModules[mIdx];
      const baseModSlug = mod.slug || `mod-${mIdx + 1}`;
      let modSlug = `${baseModSlug}-${targetCourse.id.slice(-4)}`;
      const existingMod = await modulesRepository.getBySlug(modSlug);
      if (existingMod) {
        modSlug = `${modSlug}-${Date.now().toString(36).slice(-4)}`;
      }

      const newMod = await modulesRepository.create({
        title: mod.title || `Module ${mIdx + 1}`,
        slug: modSlug,
        description: mod.description || null,
        status: "PUBLISHED",
        isActive: true,
        unlockAt: mod.unlockAt ? new Date(mod.unlockAt).toISOString() : null,
        lockAt: mod.lockAt ? new Date(mod.lockAt).toISOString() : null,
      });

      await coursesRepository.attachModule({
        courseId: targetCourse.id,
        moduleId: newMod.id,
        position: mod.position ?? mIdx + 1,
      });

      const rawLessons = Array.isArray(mod.lessons) ? mod.lessons : [];
      for (let lIdx = 0; lIdx < rawLessons.length; lIdx++) {
        const les = rawLessons[lIdx];
        const baseLesSlug = les.slug || `les-${mIdx + 1}-${lIdx + 1}`;
        let lesSlug = `${baseLesSlug}-${targetCourse.id.slice(-4)}`;
        const existingLes = await lessonsRepository.getBySlug(lesSlug);
        if (existingLes) {
          lesSlug = `${lesSlug}-${Date.now().toString(36).slice(-4)}`;
        }

        const newLes = await lessonsRepository.create({
          title: les.title || `Lesson ${lIdx + 1}`,
          slug: lesSlug,
          description: les.description || null,
          content: les.content || null,
          videoUrl: les.videoUrl || null,
          durationMinutes: les.durationMinutes ? Number(les.durationMinutes) : null,
          status: "PUBLISHED",
          isActive: true,
          unlockAt: les.unlockAt ? new Date(les.unlockAt).toISOString() : null,
          lockAt: les.lockAt ? new Date(les.lockAt).toISOString() : null,
        });

        await modulesRepository.attachLesson({
          moduleId: newMod.id,
          lessonId: newLes.id,
          position: les.position ?? lIdx + 1,
        });
      }
    }

    return {
      conflict: false,
      course: targetCourse,
      importedModulesCount: rawModules.length,
    };
  },
};
