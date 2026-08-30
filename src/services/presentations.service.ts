import QRCode from "qrcode";
import { ValidationError, NotFoundError } from "../errors";
import { presentationsRepository } from "../repositories/presentations.repository";
import { usersRepository } from "../repositories/users.repository";
import { collegesRepository } from "../repositories/colleges.repository";
import { normalizePhone, toTitleCase } from "../helpers/formatters";
import {
  NewPresentation,
  NewPresentationSession,
  Presentation,
  PresentationSession,
  PresentationLead,
} from "../db/schema";
import { UNISOLE_AI_CAMPUS_DECK_SLIDES } from "../data/aiCampusDeck.js";

function generateSessionCode(prefix = "UNI"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${random}`;
}

export const presentationsService = {
  // ==================== PRESENTATION DECKS ====================
  getTemplateSlides(): any[] {
    return UNISOLE_AI_CAMPUS_DECK_SLIDES;
  },

  async list(collegeId?: string): Promise<Presentation[]> {
    return presentationsRepository.listPresentations(collegeId);
  },

  async getById(id: string): Promise<Presentation> {
    const presentation = await presentationsRepository.getPresentationById(id);
    if (!presentation) {
      throw new NotFoundError("Presentation not found");
    }
    return presentation;
  },

  async create(data: {
    title: string;
    collegeId: string;
    description?: string;
    theme?: string;
    slides?: any[];
    createdById?: string;
  }): Promise<Presentation> {
    if (!data.title || !data.title.trim()) {
      throw new ValidationError("Title is required");
    }
    if (!data.collegeId || !data.collegeId.trim()) {
      throw new ValidationError("College is required. Presentations must belong to a college.");
    }

    const college = await collegesRepository.getById(data.collegeId.trim());
    if (!college) {
      throw new NotFoundError("Selected university/college not found");
    }

    const defaultSlides =
      data.slides && data.slides.length > 0
        ? data.slides
        : UNISOLE_AI_CAMPUS_DECK_SLIDES;

    return presentationsRepository.createPresentation({
      title: data.title.trim(),
      collegeId: college.id,
      collegeName: college.name,
      description: data.description ?? "",
      theme: data.theme ?? "dark",
      slides: defaultSlides,
      createdById: data.createdById ?? null,
      isActive: true,
    });
  },

  async update(
    id: string,
    data: {
      title?: string;
      collegeId?: string;
      description?: string;
      theme?: string;
      slides?: any[];
      isActive?: boolean;
    }
  ): Promise<Presentation> {
    const existing = await presentationsRepository.getPresentationById(id);
    if (!existing) {
      throw new NotFoundError("Presentation not found");
    }

    let collegeName = undefined;
    if (data.collegeId) {
      const college = await collegesRepository.getById(data.collegeId.trim());
      if (college) {
        collegeName = college.name;
      }
    }

    const updated = await presentationsRepository.updatePresentation(id, {
      ...data,
      title: data.title !== undefined ? data.title.trim() : undefined,
      collegeId: data.collegeId ? data.collegeId.trim() : undefined,
      collegeName,
    });

    if (!updated) throw new NotFoundError("Failed to update presentation");
    return updated;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await presentationsRepository.getPresentationById(id);
    if (!existing) {
      throw new NotFoundError("Presentation not found");
    }
    await presentationsRepository.removePresentation(id);
    return { success: true };
  },

  // ==================== LIVE SESSIONS ====================
  async listSessions(presentationId?: string): Promise<PresentationSession[]> {
    return presentationsRepository.listSessions(presentationId);
  },

  async getSessionById(id: string): Promise<PresentationSession> {
    const session = await presentationsRepository.getSessionById(id);
    if (!session) throw new NotFoundError("Session not found");
    return session;
  },

  async getSessionByCode(sessionCode: string): Promise<{
    session: PresentationSession;
    presentation: Presentation;
    collegeBranches: any[];
  }> {
    const cleanCode = sessionCode.trim().toUpperCase();
    const session = await presentationsRepository.getSessionByCode(cleanCode);
    if (!session) {
      throw new NotFoundError(`Session with code "${cleanCode}" not found`);
    }

    const presentation = await presentationsRepository.getPresentationById(
      session.presentationId
    );
    if (!presentation) {
      throw new NotFoundError("Associated presentation not found");
    }

    let collegeBranches: any[] = [];
    const targetCollegeId = session.collegeId || presentation.collegeId;
    if (targetCollegeId) {
      collegeBranches = await collegesRepository.getCollegeBranches(
        targetCollegeId
      );
    }

    return { session, presentation, collegeBranches };
  },

  async launchSession(
    presentationId: string,
    data: {
      collegeId?: string;
      customCode?: string;
      clientBaseUrl?: string;
    }
  ): Promise<{
    session: PresentationSession;
    qrCodeDataUrl: string;
    joinUrl: string;
  }> {
    const presentation = await presentationsRepository.getPresentationById(
      presentationId
    );
    if (!presentation) throw new NotFoundError("Presentation not found");

    const resolvedCollegeId = presentation.collegeId || data.collegeId;
    if (!resolvedCollegeId) {
      throw new ValidationError("College is required. Presentation sessions must belong to a college.");
    }
    const college = await collegesRepository.getById(resolvedCollegeId);
    if (!college) {
      throw new NotFoundError("Associated university/college not found");
    }
    const collegeName = college.name;

    // Determine code
    let code = data.customCode
      ? data.customCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "")
      : generateSessionCode();

    // Check if code exists, regenerate if collided
    let existing = await presentationsRepository.getSessionByCode(code);
    while (existing) {
      code = generateSessionCode();
      existing = await presentationsRepository.getSessionByCode(code);
    }

    const session = await presentationsRepository.createSession({
      presentationId,
      collegeId: resolvedCollegeId,
      collegeName,
      sessionCode: code,
      status: "LIVE",
      currentSlideIndex: 0,
      isQuizActive: false,
      isAnswerRevealed: false,
      isLeaderboardActive: false,
      quizTimeLimit: 30,
      activeAttendeesCount: 0,
      startedAt: new Date().toISOString(),
    });

    const seoBaseUrl =
      data.clientBaseUrl ||
      process.env.SEO_URL ||
      process.env.CLIENT_URL ||
      "https://unisole.org";
    const joinUrl = `${seoBaseUrl.replace(/\/+$/, "")}/live/${code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return {
      session,
      qrCodeDataUrl,
      joinUrl,
    };
  },

  async updateSessionStatus(
    sessionId: string,
    status: "DRAFT" | "LIVE" | "PAUSED" | "ENDED"
  ): Promise<PresentationSession> {
    const session = await presentationsRepository.getSessionById(sessionId);
    if (!session) throw new NotFoundError("Session not found");

    const payload: Partial<PresentationSession> = { status };
    if (status === "ENDED") {
      payload.endedAt = new Date().toISOString();
    }

    const updated = await presentationsRepository.updateSession(
      sessionId,
      payload
    );
    if (!updated) throw new NotFoundError("Failed to update session");
    return updated;
  },

  // ==================== FAST-PASS LEAD ONBOARDING ====================
  async joinSessionExpress(
    sessionCode: string,
    body: {
      name: string;
      phone: string;
      email?: string;
      branch?: string;
      yearOfStudy?: string;
      userId?: string;
    }
  ): Promise<{
    lead: PresentationLead;
    session: PresentationSession;
    presentation: Presentation;
  }> {
    const { session, presentation } = await this.getSessionByCode(sessionCode);

    if (!body.name || !body.name.trim()) {
      throw new ValidationError("Your name is required");
    }
    if (!body.phone) {
      throw new ValidationError("WhatsApp mobile number is required");
    }

    const normalizedPhone = normalizePhone(body.phone);
    if (!normalizedPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const formattedName = toTitleCase(body.name);
    const resolvedBranch = body.branch ? body.branch.trim() : null;
    const resolvedYear = body.yearOfStudy ? body.yearOfStudy.trim() : null;

    // Find or create student user
    let user = await usersRepository.getByPhone(normalizedPhone);
    if (!user && body.userId) {
      user = await usersRepository.getById(body.userId);
    }

    if (!user) {
      user = await usersRepository.create({
        phone: normalizedPhone,
        name: formattedName,
        role: "STUDENT",
        collegeId: session.collegeId ?? null,
        collegeName: session.collegeName ?? null,
        branch: resolvedBranch,
        isActive: true,
      });
    } else {
      const updates: any = {};
      if (!user.collegeId && session.collegeId) updates.collegeId = session.collegeId;
      if (!user.collegeName && session.collegeName) updates.collegeName = session.collegeName;
      if (resolvedBranch && (!user.branch || user.branch !== resolvedBranch)) {
        updates.branch = resolvedBranch;
      }
      if (Object.keys(updates).length > 0) {
        user = await usersRepository.update(user.id, updates);
      }
    }

    // Check if lead already joined this session
    let lead = await presentationsRepository.getLeadBySessionAndPhone(
      session.id,
      normalizedPhone
    );

    if (!lead) {
      lead = await presentationsRepository.createLead({
        sessionId: session.id,
        collegeId: session.collegeId,
        userId: user?.id ?? null,
        name: formattedName,
        phone: normalizedPhone,
        email: body.email ? body.email.trim().toLowerCase() : null,
        branch: resolvedBranch,
        yearOfStudy: resolvedYear,
        totalScore: 0,
        streak: 0,
        responses: {},
      });
    } else if (resolvedBranch && !lead.branch) {
      const updated = await presentationsRepository.updateLead(lead.id, {
        branch: resolvedBranch,
        yearOfStudy: resolvedYear || lead.yearOfStudy,
      });
      if (updated) lead = updated;
    }

    return {
      lead,
      session,
      presentation,
    };
  },

  async listSessionLeads(sessionId: string): Promise<PresentationLead[]> {
    return presentationsRepository.listLeadsBySession(sessionId);
  },
};
