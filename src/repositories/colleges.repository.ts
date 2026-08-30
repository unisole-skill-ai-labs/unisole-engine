import { eq, or, inArray, desc } from "drizzle-orm";
import { db } from "../db";
import {
  colleges,
  College,
  NewCollege,
  branches,
  presentationSessions,
  presentations,
  presentationLeads,
  users,
  enrollments,
  pathways,
} from "../db/schema";

export const collegesRepository = {
  async list(): Promise<College[]> {
    return db.select().from(colleges).orderBy(colleges.name);
  },

  async getById(id: string): Promise<College | null> {
    const rows = await db.select().from(colleges).where(eq(colleges.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async getBySlug(slug: string): Promise<College | null> {
    const rows = await db.select().from(colleges).where(eq(colleges.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewCollege): Promise<College> {
    const rows = await db.insert(colleges).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewCollege, "id">>): Promise<College | null> {
    const rows = await db
      .update(colleges)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(colleges.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<College | null> {
    // Unlink users associated with this college
    await db
      .update(users)
      .set({ collegeId: null, collegeName: null })
      .where(eq(users.collegeId, id));

    const rows = await db.delete(colleges).where(eq(colleges.id, id)).returning();
    return rows[0] ?? null;
  },

  // Analytics & Hierarchy Helpers
  async getCollegePresentations(collegeId: string) {
    return db
      .select()
      .from(presentations)
      .where(eq(presentations.collegeId, collegeId))
      .orderBy(desc(presentations.createdAt));
  },

  async getCollegeBranches(collegeId: string) {
    return db
      .select()
      .from(branches)
      .where(eq(branches.collegeId, collegeId))
      .orderBy(branches.name);
  },

  async getCollegeSessions(collegeId: string, collegeName?: string) {
    return db
      .select({
        id: presentationSessions.id,
        presentationId: presentationSessions.presentationId,
        presentationTitle: presentations.title,
        sessionCode: presentationSessions.sessionCode,
        status: presentationSessions.status,
        activeAttendeesCount: presentationSessions.activeAttendeesCount,
        startedAt: presentationSessions.startedAt,
        endedAt: presentationSessions.endedAt,
        createdAt: presentationSessions.createdAt,
      })
      .from(presentationSessions)
      .leftJoin(presentations, eq(presentationSessions.presentationId, presentations.id))
      .where(
        collegeName
          ? or(
              eq(presentationSessions.collegeId, collegeId),
              eq(presentationSessions.collegeName, collegeName)
            )
          : eq(presentationSessions.collegeId, collegeId)
      )
      .orderBy(desc(presentationSessions.createdAt));
  },

  async getCollegeLeads(collegeId: string, sessionIds: string[] = []) {
    if (sessionIds.length > 0) {
      return db
        .select()
        .from(presentationLeads)
        .where(
          or(
            eq(presentationLeads.collegeId, collegeId),
            inArray(presentationLeads.sessionId, sessionIds)
          )
        )
        .orderBy(desc(presentationLeads.totalScore));
    }

    return db
      .select()
      .from(presentationLeads)
      .where(eq(presentationLeads.collegeId, collegeId))
      .orderBy(desc(presentationLeads.totalScore));
  },

  async getCollegeStudents(collegeId: string, collegeName?: string) {
    return db
      .select({
        id: users.id,
        phone: users.phone,
        name: users.name,
        role: users.role,
        collegeId: users.collegeId,
        collegeName: users.collegeName,
        branch: users.branch,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        collegeName
          ? or(
              eq(users.collegeId, collegeId),
              eq(users.collegeName, collegeName)
            )
          : eq(users.collegeId, collegeId)
      )
      .orderBy(desc(users.createdAt));
  },

  async getStudentsEnrollments(userIds: string[]) {
    if (userIds.length === 0) return [];
    return db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        pathwayId: enrollments.pathwayId,
        pathwayTitle: pathways.title,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .leftJoin(pathways, eq(enrollments.pathwayId, pathways.id))
      .where(inArray(enrollments.userId, userIds))
      .orderBy(desc(enrollments.enrolledAt));
  },

  // Cross-College Diversification Helpers
  async getAllSessions() {
    return db
      .select({
        id: presentationSessions.id,
        presentationId: presentationSessions.presentationId,
        presentationTitle: presentations.title,
        collegeId: presentationSessions.collegeId,
        collegeName: presentationSessions.collegeName,
        sessionCode: presentationSessions.sessionCode,
        status: presentationSessions.status,
        activeAttendeesCount: presentationSessions.activeAttendeesCount,
        startedAt: presentationSessions.startedAt,
        endedAt: presentationSessions.endedAt,
        createdAt: presentationSessions.createdAt,
      })
      .from(presentationSessions)
      .leftJoin(presentations, eq(presentationSessions.presentationId, presentations.id))
      .orderBy(desc(presentationSessions.createdAt));
  },

  async getAllLeads() {
    return db
      .select()
      .from(presentationLeads)
      .orderBy(desc(presentationLeads.joinedAt));
  },

  async getAllBranches() {
    return db
      .select()
      .from(branches)
      .orderBy(branches.name);
  },

  async getAllEnrollments() {
    return db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        pathwayId: enrollments.pathwayId,
        pathwayTitle: pathways.title,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .leftJoin(pathways, eq(enrollments.pathwayId, pathways.id))
      .orderBy(desc(enrollments.enrolledAt));
  },

  async getAllStudents() {
    return db
      .select({
        id: users.id,
        phone: users.phone,
        name: users.name,
        role: users.role,
        collegeId: users.collegeId,
        collegeName: users.collegeName,
        branch: users.branch,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  },
};
