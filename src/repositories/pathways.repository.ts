import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  pathways, Pathway, NewPathway,
  pathwayCategories, NewPathwayCategory, categories,
  pathwayColleges, NewPathwayCollege, colleges,
  pathwayCourses, NewPathwayCourse, courses,
} from "../db/schema";

export const pathwaysRepository = {
  async list(): Promise<Pathway[]> {
    return db.select().from(pathways);
  },

  async getById(id: string): Promise<Pathway | null> {
    const rows = await db.select().from(pathways).where(eq(pathways.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<Pathway | null> {
    const rows = await db.select().from(pathways).where(eq(pathways.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewPathway): Promise<Pathway> {
    const rows = await db.insert(pathways).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewPathway, "id">>): Promise<Pathway | null> {
    const rows = await db
      .update(pathways)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(pathways.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Pathway | null> {
    const rows = await db.delete(pathways).where(eq(pathways.id, id)).returning();
    return rows[0] ?? null;
  },

  // --- Category relationships ---
  async attachCategory(data: NewPathwayCategory): Promise<void> {
    await db.insert(pathwayCategories).values(data).onConflictDoNothing();
  },

  async detachCategory(pathwayId: string, categoryId: string): Promise<void> {
    await db.delete(pathwayCategories).where(
      and(eq(pathwayCategories.pathwayId, pathwayId), eq(pathwayCategories.categoryId, categoryId))
    );
  },

  async getCategoriesWithDetails(pathwayId: string) {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(pathwayCategories)
      .innerJoin(categories, eq(pathwayCategories.categoryId, categories.id))
      .where(eq(pathwayCategories.pathwayId, pathwayId));
    return rows;
  },

  // --- College relationships ---
  async attachCollege(data: NewPathwayCollege): Promise<void> {
    await db.insert(pathwayColleges).values(data).onConflictDoNothing();
  },

  async detachCollege(pathwayId: string, collegeId: string): Promise<void> {
    await db.delete(pathwayColleges).where(
      and(eq(pathwayColleges.pathwayId, pathwayId), eq(pathwayColleges.collegeId, collegeId))
    );
  },

  async getCollegeIds(pathwayId: string): Promise<string[]> {
    const rows = await db.select({ collegeId: pathwayColleges.collegeId })
      .from(pathwayColleges).where(eq(pathwayColleges.pathwayId, pathwayId));
    return rows.map((r) => r.collegeId);
  },

  async getCollegesWithDetails(pathwayId: string) {
    const rows = await db
      .select({
        id: colleges.id,
        name: colleges.name,
        slug: colleges.slug,
        shortName: colleges.shortName,
      })
      .from(pathwayColleges)
      .innerJoin(colleges, eq(pathwayColleges.collegeId, colleges.id))
      .where(eq(pathwayColleges.pathwayId, pathwayId));
    return rows;
  },

  // --- Course relationships ---
  async attachCourse(data: NewPathwayCourse): Promise<void> {
    await db.insert(pathwayCourses).values(data);
  },

  async detachCourse(pathwayId: string, courseId: string): Promise<void> {
    await db.delete(pathwayCourses).where(
      and(eq(pathwayCourses.pathwayId, pathwayId), eq(pathwayCourses.courseId, courseId))
    );
  },

  async getCourses(pathwayId: string): Promise<{ courseId: string; position: number }[]> {
    const rows = await db.select({ courseId: pathwayCourses.courseId, position: pathwayCourses.position })
      .from(pathwayCourses).where(eq(pathwayCourses.pathwayId, pathwayId));
    return rows;
  },

  async getCoursesWithDetails(pathwayId: string) {
    const rows = await db
      .select({
        position: pathwayCourses.position,
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        shortDescription: courses.shortDescription,
        description: courses.description,
        status: courses.status,
      })
      .from(pathwayCourses)
      .innerJoin(courses, eq(pathwayCourses.courseId, courses.id))
      .where(eq(pathwayCourses.pathwayId, pathwayId))
      .orderBy(pathwayCourses.position);
    return rows;
  },
};
