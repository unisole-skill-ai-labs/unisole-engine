import { pathwaysRepository } from "../repositories/pathways.repository";
import { pricingRepository } from "../repositories/pricing.repository";
import { db } from "../db";
import {
  Pathway,
  NewPathway,
  courses,
  pathwayCourses,
  modules,
  courseModules,
  lessons,
  moduleLessons,
} from "../db/schema";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { CANONICAL_SEO_OFFERINGS } from "../constants/offerings";
import { CANONICAL_GROUPS, getCanonicalPathway } from "../constants/canonical-catalog";

export const pathwaysService = {
  /**
   * Synchronize canonical pathways, syllabus modules, lessons, and pricing into PostgreSQL via Drizzle ORM.
   */
  async syncCanonicalPathways(): Promise<{ total: number; synced: number }> {
    let synced = 0;
    const pathwaysToSync = CANONICAL_SEO_OFFERINGS.filter((o) => o.itemType === "PATHWAY");

    for (const offering of pathwaysToSync) {
      // 1. Upsert Pathway
      const pwy = await pathwaysRepository.upsert({
        id: offering.itemId,
        title: offering.title,
        slug: offering.slug,
        shortDescription: offering.description,
        description: offering.description,
        pricePaise: offering.pricePaise,
        status: "PUBLISHED",
        isActive: true,
      });

      const canon = getCanonicalPathway(offering.itemId);
      const courseId = `crs_${offering.itemId}`;

      // 2. Upsert Associated Primary Course
      await db
        .insert(courses)
        .values({
          id: courseId,
          title: offering.title,
          slug: `course-${offering.slug}`,
          shortDescription: offering.description,
          description: offering.description,
          pricePaise: offering.pricePaise,
          mrpPaise: offering.mrpPaise,
          status: "PUBLISHED",
          isActive: true,
          metadata: {
            pathwayId: pwy.id,
            duration: canon?.duration || "12 Weeks",
            level: canon?.level || "Beginner to Advanced",
            syllabusLink: canon?.syllabusLink,
          },
        })
        .onConflictDoUpdate({
          target: [courses.id],
          set: {
            title: offering.title,
            shortDescription: offering.description,
            description: offering.description,
            status: "PUBLISHED",
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
        });

      // 3. Link Pathway -> Course
      await db
        .insert(pathwayCourses)
        .values({
          pathwayId: pwy.id,
          courseId: courseId,
          position: 1,
        })
        .onConflictDoNothing();

      // 4. Sync Syllabus Modules & Topics/Labs as Lessons
      if (canon?.modules && canon.modules.length > 0) {
        for (let mIdx = 0; mIdx < canon.modules.length; mIdx++) {
          const mod = canon.modules[mIdx];
          const moduleId = `mod_${offering.itemId}_${mod.num}`;
          const moduleSlug = `${offering.slug}-w${mod.num}`;

          await db
            .insert(modules)
            .values({
              id: moduleId,
              title: mod.title,
              slug: moduleSlug,
              description: mod.practical || mod.title,
              status: "PUBLISHED",
              isActive: true,
            })
            .onConflictDoUpdate({
              target: [modules.id],
              set: {
                title: mod.title,
                description: mod.practical || mod.title,
                status: "PUBLISHED",
                isActive: true,
                updatedAt: new Date().toISOString(),
              },
            });

          await db
            .insert(courseModules)
            .values({
              courseId: courseId,
              moduleId: moduleId,
              position: mIdx + 1,
            })
            .onConflictDoNothing();

          // Sync topics as lessons
          if (mod.topics && mod.topics.length > 0) {
            for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
              const topic = mod.topics[tIdx];
              const lessonId = `les_${offering.itemId}_${mod.num}_${tIdx + 1}`;
              const lessonSlug = `${offering.slug}-w${mod.num}-t${tIdx + 1}`;

              await db
                .insert(lessons)
                .values({
                  id: lessonId,
                  title: topic,
                  slug: lessonSlug,
                  description: topic,
                  content: `Curriculum Module ${mod.num}: ${mod.title}\n\nCore Topic: ${topic}\n\nKey Concepts & Theory: Review the lecture materials and implement the guided coding exercises.`,
                  durationMinutes: 45,
                  status: "PUBLISHED",
                  isActive: true,
                })
                .onConflictDoUpdate({
                  target: [lessons.id],
                  set: {
                    title: topic,
                    description: topic,
                    status: "PUBLISHED",
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                  },
                });

              await db
                .insert(moduleLessons)
                .values({
                  moduleId: moduleId,
                  lessonId: lessonId,
                  position: tIdx + 1,
                })
                .onConflictDoNothing();
            }
          }

          // If practical lab, create lab lesson
          if (mod.practical) {
            const labLessonId = `les_${offering.itemId}_${mod.num}_lab`;
            const labLessonSlug = `${offering.slug}-w${mod.num}-lab`;

            await db
              .insert(lessons)
              .values({
                id: labLessonId,
                title: `Lab: ${mod.title}`,
                slug: labLessonSlug,
                description: mod.practical,
                content: `Hands-on Practical Lab Exercise:\n\n${mod.practical}\n\nDeliverable: Commit and push your code to the designated repository branch or sandbox environment.`,
                durationMinutes: 60,
                status: "PUBLISHED",
                isActive: true,
              })
              .onConflictDoUpdate({
                target: [lessons.id],
                set: {
                  title: `Lab: ${mod.title}`,
                  description: mod.practical,
                  content: `Hands-on Practical Lab Exercise:\n\n${mod.practical}\n\nDeliverable: Commit and push your code to the designated repository branch or sandbox environment.`,
                  status: "PUBLISHED",
                  isActive: true,
                  updatedAt: new Date().toISOString(),
                },
              });

            await db
              .insert(moduleLessons)
              .values({
                moduleId: moduleId,
                lessonId: labLessonId,
                position: (mod.topics?.length || 0) + 1,
              })
              .onConflictDoNothing();
          }
        }
      }

      // 5. If Capstone present, create Capstone Module & Deliverable Lessons
      if (canon?.capstone) {
        const capModuleId = `mod_${offering.itemId}_cap`;
        const capSlug = `${offering.slug}-capstone`;

        await db
          .insert(modules)
          .values({
            id: capModuleId,
            title: `Capstone: ${canon.capstone.title}`,
            slug: capSlug,
            description: `Capstone Project Flow: ${canon.capstone.flow?.join(" ➔ ")}`,
            status: "PUBLISHED",
            isActive: true,
          })
          .onConflictDoUpdate({
            target: [modules.id],
            set: {
              title: `Capstone: ${canon.capstone.title}`,
              description: `Capstone Project Flow: ${canon.capstone.flow?.join(" ➔ ")}`,
              status: "PUBLISHED",
              isActive: true,
              updatedAt: new Date().toISOString(),
            },
          });

        await db
          .insert(courseModules)
          .values({
            courseId: courseId,
            moduleId: capModuleId,
            position: (canon.modules?.length || 0) + 1,
          })
          .onConflictDoNothing();

        if (canon.capstone.outputs && canon.capstone.outputs.length > 0) {
          for (let oIdx = 0; oIdx < canon.capstone.outputs.length; oIdx++) {
            const out = canon.capstone.outputs[oIdx];
            const capLessonId = `les_${offering.itemId}_cap_${oIdx + 1}`;
            const capLessonSlug = `${offering.slug}-cap-out-${oIdx + 1}`;

            await db
              .insert(lessons)
              .values({
                id: capLessonId,
                title: `Deliverable ${oIdx + 1}: ${out}`,
                slug: capLessonSlug,
                description: out,
                content: `Capstone Final Deliverable Requirement:\n\n${out}\n\nSubmission & Defense: Present this component to the evaluation panel during your final capstone defense review.`,
                durationMinutes: 90,
                status: "PUBLISHED",
                isActive: true,
              })
              .onConflictDoUpdate({
                target: [lessons.id],
                set: {
                  title: `Deliverable ${oIdx + 1}: ${out}`,
                  description: out,
                  status: "PUBLISHED",
                  isActive: true,
                  updatedAt: new Date().toISOString(),
                },
              });

            await db
              .insert(moduleLessons)
              .values({
                moduleId: capModuleId,
                lessonId: capLessonId,
                position: oIdx + 1,
              })
              .onConflictDoNothing();
          }
        }
      }

      synced++;
    }

    return { total: pathwaysToSync.length, synced };
  },

  async list(): Promise<Pathway[]> {
    return pathwaysRepository.list();
  },

  /**
   * Get public programs grouped by category with live DB pricing, active status and syllabus
   */
  async getPublicPrograms() {
    const allPricing = await pricingRepository.listAll({ isPublicOnly: true });
    const pricingMap = new Map<string, any>();
    for (const prc of allPricing) {
      pricingMap.set(prc.itemId.toLowerCase(), prc);
      if (prc.slug) pricingMap.set(prc.slug.toLowerCase(), prc);
    }

    const dbPathways = await pathwaysRepository.list();
    const pathwayMap = new Map<string, Pathway>();
    for (const p of dbPathways) {
      pathwayMap.set(p.id.toLowerCase(), p);
      if (p.slug) pathwayMap.set(p.slug.toLowerCase(), p);
    }

    const groups = CANONICAL_GROUPS.map((group) => {
      const livePathways = group.pathways
        .map((p) => {
          const prc = pricingMap.get(p.id.toLowerCase());
          const dbP = pathwayMap.get(p.id.toLowerCase());

          // Respect deactivate toggle from admin pricing suite or pathways
          if (prc && prc.isActive === false) return null;
          if (dbP && dbP.isActive === false) return null;

          let price = p.price;
          let mrp = p.mrp;
          let title = p.title;
          let description = p.description;

          if (prc) {
            price = Math.round((Number(prc.pricePaise) || 0) / 100);
            mrp = Math.round((Number(prc.mrpPaise) || 0) / 100);
            if (prc.title) title = prc.title;
            if (prc.description) description = prc.description;
          } else if (dbP) {
            price = Math.round(Number(dbP.pricePaise) / 100);
            if (dbP.title) title = dbP.title;
            if (dbP.description) description = dbP.description;
          }

          return {
            ...p,
            title,
            description,
            price,
            mrp,
          };
        })
        .filter(Boolean);

      return {
        ...group,
        pathways: livePathways,
      };
    }).filter((g) => g.pathways.length > 0);

    return {
      success: true,
      groups,
    };
  },

  async listPublished() {
    const all = await this.list();
    const published = all.filter((p) => p.status === "PUBLISHED" && p.isActive);

    const enriched = await Promise.all(
      published.map(async (pathway) => {
        const [categories, colleges, coursesList, pricing] = await Promise.all([
          pathwaysRepository.getCategoriesWithDetails(pathway.id).catch(() => []),
          pathwaysRepository.getCollegesWithDetails(pathway.id).catch(() => []),
          pathwaysRepository.getCoursesWithDetails(pathway.id).catch(() => []),
          pricingRepository.getByItem("PATHWAY" as any, pathway.id).catch(() => null),
        ]);

        const canon = getCanonicalPathway(pathway.id) || getCanonicalPathway(pathway.slug);

        return {
          ...pathway,
          pricePaise: pricing?.pricePaise ?? pathway.pricePaise,
          mrpPaise: pricing?.mrpPaise ?? (pricing?.pricePaise ? pricing.pricePaise * 3 : pathway.pricePaise * 3),
          categories,
          colleges,
          courses: coursesList,
          courseCount: coursesList.length,
          modules: canon?.modules || (pricing?.metadata as any)?.modules || [],
          capstone: canon?.capstone || (pricing?.metadata as any)?.capstone,
          roles: canon?.roles || (pricing?.metadata as any)?.roles || [],
          tools: canon?.tools || (pricing?.metadata as any)?.tools || [],
          duration: canon?.duration || (pricing?.metadata as any)?.duration || "12 Weeks (132 Hours)",
          level: canon?.level || (pricing?.metadata as any)?.level || "Foundations to Production",
          handsOn: canon?.handsOn || (pricing?.metadata as any)?.handsOn || "Theory + Hands-on Labs + Capstone",
          syllabusLink: canon?.syllabusLink || (pricing?.metadata as any)?.syllabusLink || `/syllabi/${pathway.slug}.pdf`,
        };
      })
    );

    return enriched;
  },

  async getById(id: string) {
    const pathway = await pathwaysRepository.getById(id);
    if (!pathway) throw new NotFoundError("Pathway not found");

    const [categories, colleges, coursesList, pricing] = await Promise.all([
      pathwaysRepository.getCategoriesWithDetails(pathway.id).catch(() => []),
      pathwaysRepository.getCollegesWithDetails(pathway.id).catch(() => []),
      pathwaysRepository.getCoursesWithDetails(pathway.id).catch(() => []),
      pricingRepository.getByItem("PATHWAY" as any, pathway.id).catch(() => null),
    ]);

    const canon = getCanonicalPathway(pathway.id) || getCanonicalPathway(pathway.slug);

    return {
      ...pathway,
      pricePaise: pricing?.pricePaise ?? pathway.pricePaise,
      mrpPaise: pricing?.mrpPaise ?? (pricing?.pricePaise ? pricing.pricePaise * 3 : pathway.pricePaise * 3),
      categories,
      colleges,
      courses: coursesList,
      modules: canon?.modules || (pricing?.metadata as any)?.modules || [],
      capstone: canon?.capstone || (pricing?.metadata as any)?.capstone,
      roles: canon?.roles || (pricing?.metadata as any)?.roles || [],
      tools: canon?.tools || (pricing?.metadata as any)?.tools || [],
      duration: canon?.duration || (pricing?.metadata as any)?.duration || "12 Weeks",
      level: canon?.level || (pricing?.metadata as any)?.level || "Foundations to Production",
      handsOn: canon?.handsOn || (pricing?.metadata as any)?.handsOn || "Theory + Hands-on Labs + Capstone",
      syllabusLink: canon?.syllabusLink || (pricing?.metadata as any)?.syllabusLink || `/syllabi/${pathway.slug}.pdf`,
    };
  },

  async getBySlug(slug: string) {
    const pathway = await pathwaysRepository.getBySlug(slug);
    if (!pathway) throw new NotFoundError("Pathway not found");

    const [categories, colleges, coursesList, pricing] = await Promise.all([
      pathwaysRepository.getCategoriesWithDetails(pathway.id).catch(() => []),
      pathwaysRepository.getCollegesWithDetails(pathway.id).catch(() => []),
      pathwaysRepository.getCoursesWithDetails(pathway.id).catch(() => []),
      pricingRepository.getByItem("PATHWAY" as any, pathway.id).catch(() => null),
    ]);

    const canon = getCanonicalPathway(pathway.id) || getCanonicalPathway(pathway.slug);

    return {
      ...pathway,
      pricePaise: pricing?.pricePaise ?? pathway.pricePaise,
      mrpPaise: pricing?.mrpPaise ?? (pricing?.pricePaise ? pricing.pricePaise * 3 : pathway.pricePaise * 3),
      categories,
      colleges,
      courses: coursesList,
      modules: canon?.modules || (pricing?.metadata as any)?.modules || [],
      capstone: canon?.capstone || (pricing?.metadata as any)?.capstone,
      roles: canon?.roles || (pricing?.metadata as any)?.roles || [],
      tools: canon?.tools || (pricing?.metadata as any)?.tools || [],
      duration: canon?.duration || (pricing?.metadata as any)?.duration || "12 Weeks",
      level: canon?.level || (pricing?.metadata as any)?.level || "Foundations to Production",
      handsOn: canon?.handsOn || (pricing?.metadata as any)?.handsOn || "Theory + Hands-on Labs + Capstone",
      syllabusLink: canon?.syllabusLink || (pricing?.metadata as any)?.syllabusLink || `/syllabi/${pathway.slug}.pdf`,
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
