import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import {
  presentations,
  presentationSessions,
  presentationLeads,
  Presentation,
  NewPresentation,
  PresentationSession,
  NewPresentationSession,
  PresentationLead,
  NewPresentationLead,
} from "../db/schema";

export const presentationsRepository = {
  // ==================== PRESENTATIONS ====================
  async listPresentations(collegeId?: string): Promise<Presentation[]> {
    if (collegeId) {
      return db
        .select()
        .from(presentations)
        .where(eq(presentations.collegeId, collegeId))
        .orderBy(desc(presentations.createdAt));
    }
    return db
      .select()
      .from(presentations)
      .orderBy(desc(presentations.createdAt));
  },

  async getPresentationById(id: string): Promise<Presentation | null> {
    const rows = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async createPresentation(data: NewPresentation): Promise<Presentation> {
    const rows = await db.insert(presentations).values(data).returning();
    return rows[0];
  },

  async updatePresentation(
    id: string,
    data: Partial<Omit<NewPresentation, "id">>
  ): Promise<Presentation | null> {
    const rows = await db
      .update(presentations)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(presentations.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async removePresentation(id: string): Promise<Presentation | null> {
    const rows = await db
      .delete(presentations)
      .where(eq(presentations.id, id))
      .returning();
    return rows[0] ?? null;
  },

  // ==================== SESSIONS ====================
  async listSessions(presentationId?: string): Promise<PresentationSession[]> {
    if (presentationId) {
      return db
        .select()
        .from(presentationSessions)
        .where(eq(presentationSessions.presentationId, presentationId))
        .orderBy(desc(presentationSessions.createdAt));
    }
    return db
      .select()
      .from(presentationSessions)
      .orderBy(desc(presentationSessions.createdAt));
  },

  async getSessionById(id: string): Promise<PresentationSession | null> {
    const rows = await db
      .select()
      .from(presentationSessions)
      .where(eq(presentationSessions.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async getSessionByCode(
    sessionCode: string
  ): Promise<PresentationSession | null> {
    const rows = await db
      .select()
      .from(presentationSessions)
      .where(eq(presentationSessions.sessionCode, sessionCode.toUpperCase()))
      .limit(1);
    return rows[0] ?? null;
  },

  async createSession(
    data: NewPresentationSession
  ): Promise<PresentationSession> {
    const rows = await db
      .insert(presentationSessions)
      .values({
        ...data,
        sessionCode: data.sessionCode.toUpperCase(),
      })
      .returning();
    return rows[0];
  },

  async updateSession(
    id: string,
    data: Partial<Omit<NewPresentationSession, "id">>
  ): Promise<PresentationSession | null> {
    const rows = await db
      .update(presentationSessions)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(presentationSessions.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async removeSession(id: string): Promise<PresentationSession | null> {
    await db
      .delete(presentationLeads)
      .where(eq(presentationLeads.sessionId, id));
    const rows = await db
      .delete(presentationSessions)
      .where(eq(presentationSessions.id, id))
      .returning();
    return rows[0] ?? null;
  },

  // ==================== LEADS & ATTENDEES ====================
  async listLeadsBySession(sessionId: string): Promise<PresentationLead[]> {
    return db
      .select()
      .from(presentationLeads)
      .where(eq(presentationLeads.sessionId, sessionId))
      .orderBy(desc(presentationLeads.totalScore), desc(presentationLeads.joinedAt));
  },

  async getLeadBySessionAndPhone(
    sessionId: string,
    phone: string
  ): Promise<PresentationLead | null> {
    const rows = await db
      .select()
      .from(presentationLeads)
      .where(
        and(
          eq(presentationLeads.sessionId, sessionId),
          eq(presentationLeads.phone, phone)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async getLeadById(id: string): Promise<PresentationLead | null> {
    const rows = await db
      .select()
      .from(presentationLeads)
      .where(eq(presentationLeads.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async createLead(data: NewPresentationLead): Promise<PresentationLead> {
    const rows = await db.insert(presentationLeads).values(data).returning();
    return rows[0];
  },

  async updateLead(
    id: string,
    data: Partial<Omit<NewPresentationLead, "id">>
  ): Promise<PresentationLead | null> {
    const rows = await db
      .update(presentationLeads)
      .set(data)
      .where(eq(presentationLeads.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
