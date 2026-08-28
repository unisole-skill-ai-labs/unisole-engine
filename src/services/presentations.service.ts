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

function generateSessionCode(prefix = "UNI"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${random}`;
}

export const presentationsService = {
  // ==================== PRESENTATION DECKS ====================
  async list(): Promise<Presentation[]> {
    return presentationsRepository.listPresentations();
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
    description?: string;
    theme?: string;
    slides?: any[];
    createdById?: string;
  }): Promise<Presentation> {
    if (!data.title || !data.title.trim()) {
      throw new ValidationError("Title is required");
    }

    const defaultSlides = data.slides && data.slides.length > 0
      ? data.slides
      : [
          {
            id: "slide_1",
            type: "COVER",
            title: data.title.trim(),
            subtitle: "Unisole College Roadshow & Career Pitch",
            badge: "Interactive Session",
            theme: "dark",
          },
          {
            id: "slide_2",
            type: "CONTENT",
            title: "Why Industry Skills Matter Today",
            subtitle: "Bridging the gap between college & top tech careers",
            bullets: [
              "Over 85% of tech companies require hands-on production experience.",
              "Traditional syllabus vs. Modern AI & Full-Stack ecosystems.",
              "Unisole structured pathways: Mentorship, Projects & Certifications.",
            ],
          },
          {
            id: "slide_3",
            type: "POLL",
            title: "Live Pulse Check",
            question: "Which tech domain are you most passionate about pursuing?",
            options: [
              "Full Stack & Cloud Architecture",
              "AI, GenAI & Machine Learning",
              "Data Science & Analytics",
              "Cybersecurity & DevOps",
            ],
          },
          {
            id: "slide_4",
            type: "QUIZ",
            title: "Fast-Finger Tech Challenge",
            question: "In Modern Web Development, what is the primary role of WebSockets?",
            timeLimit: 20,
            points: 1000,
            options: [
              { text: "Server-side rendering HTML files", isCorrect: false },
              { text: "Two-way real-time bidirectional communication", isCorrect: true },
              { text: "Encrypting database passwords", isCorrect: false },
              { text: "Compressing static images for SEO", isCorrect: false },
            ],
          },
          {
            id: "slide_5",
            type: "OFFER_CTA",
            title: "Exclusive College Campus Grant",
            subtitle: "Thank you for joining today's session!",
            badge: "Special 40% Scholarship",
            couponCode: "CAMPUS40",
            buttonText: "Claim Your Spot on Unisole LMS",
            targetUrl: "https://unisole.in/programs",
          },
        ];

    return presentationsRepository.createPresentation({
      title: data.title.trim(),
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

    const updated = await presentationsRepository.updatePresentation(id, {
      ...data,
      title: data.title !== undefined ? data.title.trim() : undefined,
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

    return { session, presentation };
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

    let collegeName = "Open Roadshow Session";
    if (data.collegeId) {
      const college = await collegesRepository.getById(data.collegeId);
      if (college) {
        collegeName = college.name;
      }
    }

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
      collegeId: data.collegeId ?? null,
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
    const joinUrl = `${seoBaseUrl.replace(/\/+$/, "")}/login?redirect=/live/${code}`;
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

    // Find or create student user
    let user = await usersRepository.getByPhone(normalizedPhone);
    if (!user) {
      user = await usersRepository.create({
        phone: normalizedPhone,
        name: formattedName,
        role: "STUDENT",
        isActive: true,
      });
    }

    // Check if lead already joined this session
    let lead = await presentationsRepository.getLeadBySessionAndPhone(
      session.id,
      normalizedPhone
    );

    if (!lead) {
      lead = await presentationsRepository.createLead({
        sessionId: session.id,
        collegeId: session.collegeId ?? null,
        userId: user.id,
        name: formattedName,
        phone: normalizedPhone,
        email: body.email ? body.email.trim().toLowerCase() : null,
        branch: body.branch ? body.branch.trim() : null,
        yearOfStudy: body.yearOfStudy ? body.yearOfStudy.trim() : null,
        totalScore: 0,
        streak: 0,
        responses: {},
      });
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

  async exportSessionLeadsCsv(sessionId: string): Promise<{
    filename: string;
    csvContent: string;
  }> {
    const session = await this.getSessionById(sessionId);
    const leads = await presentationsRepository.listLeadsBySession(sessionId);

    const headers = [
      "Lead ID",
      "Student Name",
      "WhatsApp Phone",
      "Email",
      "Branch",
      "Year",
      "Total Score",
      "Rank",
      "Joined At",
    ];

    const rows = leads.map((lead, idx) => [
      `"${lead.id}"`,
      `"${(lead.name || "").replace(/"/g, '""')}"`,
      `"${lead.phone}"`,
      `"${lead.email || ""}"`,
      `"${(lead.branch || "").replace(/"/g, '""')}"`,
      `"${lead.yearOfStudy || ""}"`,
      lead.totalScore,
      lead.rank || idx + 1,
      `"${lead.joinedAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const filename = `unisole_leads_${session.sessionCode}_${new Date().toISOString().slice(0, 10)}.csv`;

    return { filename, csvContent };
  },
};
