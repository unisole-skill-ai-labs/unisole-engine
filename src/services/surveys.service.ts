import { eq } from "drizzle-orm";
import { db } from "../db";
import { surveys, surveyResponses, leads, enrollments } from "../db/schema";
import { surveysRepository, SurveyResponseFilters } from "../repositories/surveys.repository";
import { usersRepository } from "../repositories/users.repository";
import { authService } from "./auth.service";
import { ValidationError, NotFoundError } from "../errors";
import { normalizePhone, toTitleCase } from "../helpers/formatters";

export interface SubmitSurveyDto {
  name: string;
  phone: string;
  email?: string;
  collegeName: string;
  stream: string;
  yearOfStudy: string;
  answers: Record<string, any>;
  metadata?: Record<string, any>;
}

export const surveysService = {
  /**
   * Public: Get survey configuration by slug
   */
  async getPublicSurvey(slug: string) {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey || !survey.isActive) {
      throw new NotFoundError(`Survey '${slug}' not found or is currently inactive`);
    }
    return {
      success: true,
      data: survey,
    };
  },

  /**
   * Public: Submit survey response
   * End-to-end creates:
   * 1. survey_responses record
   * 2. users (Learner account) with source: SURVEY
   * 3. leads (CRM lead) with source: SURVEY
   * 4. enrollments (Learner enrollment) with source: SURVEY
   */
  async submitSurvey(slug: string, dto: SubmitSurveyDto) {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey || !survey.isActive) {
      throw new NotFoundError(`Survey '${slug}' not found or is currently inactive`);
    }

    if (!dto.name || !dto.name.trim()) {
      throw new ValidationError("Student name is required");
    }
    if (!dto.phone || !dto.phone.trim()) {
      throw new ValidationError("Phone number is required");
    }
    if (!dto.collegeName || !dto.collegeName.trim()) {
      throw new ValidationError("Institution/College name is required");
    }

    const cleanPhone = normalizePhone(dto.phone);
    if (!cleanPhone) {
      throw new ValidationError("Please provide a valid 10-digit mobile number");
    }

    const formattedName = toTitleCase(dto.name.trim());
    const formattedCollege = dto.collegeName.trim();
    const formattedStream = dto.stream?.trim() || "GENERAL";
    const formattedYear = dto.yearOfStudy?.trim() || "";
    const email = dto.email?.trim().toLowerCase() || null;

    // 1. Authenticate / Create Learner User account
    let authResult: any = null;
    try {
      authResult = await authService.login({
        phone: cleanPhone,
        name: formattedName,
        collegeName: formattedCollege,
        branch: formattedStream,
        signupSource: "SURVEY",
        source: "SURVEY",
        metadata: {
          surveySubmission: true,
          surveySlug: slug,
          yearOfStudy: formattedYear,
          email,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (authErr) {
      console.warn("[SurveysService] Auth user initialization note:", authErr);
    }

    const user = authResult?.user || null;
    const userId = user?.id || null;
    const collegeId = user?.collegeId || null;

    // 2. Build Notes & Tags summarizing student's key interests
    const answers = dto.answers || {};
    const aimingFor = Array.isArray(answers.aiming_for) ? answers.aiming_for.join(", ") : answers.aiming_for || "";
    const selectedSkills = Object.entries(answers)
      .filter(([k]) => k.startsWith("skills"))
      .flatMap(([_, v]) => (Array.isArray(v) ? v : [v]))
      .filter(Boolean);

    const skillsSummary = selectedSkills.slice(0, 5).join(", ");
    const leadNotes = `Survey: ${survey.title}\nAiming for: ${aimingFor || "N/A"}\nTop Skills: ${skillsSummary || "N/A"}\nYear: ${formattedYear}`;

    const leadTags = ["SURVEY", slug, formattedStream, formattedYear].filter(Boolean);

    // 3. Create or Sync CRM Lead (Source: SURVEY)
    let leadId: string | null = null;
    try {
      const existingLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.phone, cleanPhone))
        .limit(1);

      if (existingLeads.length > 0) {
        const [existing] = existingLeads;
        leadId = existing.id;
        const currentTags = Array.isArray(existing.tags) ? (existing.tags as string[]) : [];
        const mergedTags = Array.from(new Set([...currentTags, ...leadTags]));

        await db
          .update(leads)
          .set({
            userId: userId || existing.userId,
            name: formattedName,
            collegeName: formattedCollege,
            collegeId: collegeId || existing.collegeId,
            branch: formattedStream,
            yearOfStudy: formattedYear,
            source: "SURVEY" as any,
            status: existing.status === "NEW" ? "INTERESTED" : existing.status,
            quality: existing.quality === "COLD" ? "WARM" : existing.quality,
            tags: mergedTags,
            notes: existing.notes ? `${existing.notes}\n\n${leadNotes}` : leadNotes,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(leads.id, existing.id));
      } else {
        const leadSeqId = `lead_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const [newLead] = await db
          .insert(leads)
          .values({
            id: leadSeqId,
            userId,
            name: formattedName,
            phone: cleanPhone,
            email,
            collegeName: formattedCollege,
            collegeId,
            branch: formattedStream,
            yearOfStudy: formattedYear,
            quality: "WARM",
            status: "INTERESTED",
            source: "SURVEY" as any,
            tags: leadTags,
            notes: leadNotes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning();
        if (newLead) leadId = newLead.id;
      }
    } catch (leadErr) {
      console.error("[SurveysService] Lead creation/sync error:", leadErr);
    }

    // 4. Create Learner Enrollment (Source: SURVEY, Status: ACTIVE)
    if (userId) {
      try {
        const enrollmentId = `enr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        await db.insert(enrollments).values({
          id: enrollmentId,
          userId,
          itemType: "PATHWAY",
          itemId: `survey-${formattedStream.toLowerCase()}`,
          status: "ACTIVE",
          source: "SURVEY" as any,
          enrolledAt: new Date().toISOString(),
          metadata: {
            surveySlug: slug,
            stream: formattedStream,
            collegeName: formattedCollege,
            yearOfStudy: formattedYear,
            enrolledVia: "SURVEY_SUBMISSION",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (enrErr) {
        console.warn("[SurveysService] Learner enrollment creation notice:", enrErr);
      }
    }

    // 5. Save Survey Response
    const responseId = `sr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const savedResponse = await surveysRepository.saveResponse({
      id: responseId,
      surveyId: survey.id,
      userId,
      leadId,
      name: formattedName,
      phone: cleanPhone,
      email,
      collegeName: formattedCollege,
      collegeId,
      stream: formattedStream,
      yearOfStudy: formattedYear,
      answers: dto.answers || {},
      metadata: {
        ...(dto.metadata || {}),
        submittedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: "Survey response recorded successfully!",
      responseId: savedResponse.id,
      token: authResult?.token || null,
      user: authResult?.user || null,
    };
  },

  /**
   * Admin: List all surveys
   */
  async listSurveys() {
    const list = await surveysRepository.list();
    return {
      success: true,
      data: list,
    };
  },

  /**
   * Admin: Get survey details including full schema
   */
  async getSurveyDetail(slug: string) {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey) {
      throw new NotFoundError(`Survey '${slug}' not found`);
    }
    const stats = await surveysRepository.getResponseStats(survey.id);
    return {
      success: true,
      data: {
        ...survey,
        stats,
      },
    };
  },

  /**
   * Admin: Update survey configuration / schema
   */
  async updateSurvey(slug: string, updates: { title?: string; description?: string; schema?: any; isActive?: boolean }) {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey) {
      throw new NotFoundError(`Survey '${slug}' not found`);
    }

    const updated = await surveysRepository.update(slug, updates);
    return {
      success: true,
      message: "Survey updated successfully",
      data: updated,
    };
  },

  /**
   * Admin: List responses with filters and search
   */
  async listResponses(slug: string, filters: SurveyResponseFilters) {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey) {
      throw new NotFoundError(`Survey '${slug}' not found`);
    }

    const result = await surveysRepository.listResponses(survey.id, filters);
    return {
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    };
  },

  /**
   * Admin: Get aggregate statistics
   */
  async getStats(slug: string) {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey) {
      throw new NotFoundError(`Survey '${slug}' not found`);
    }

    const stats = await surveysRepository.getResponseStats(survey.id);
    return {
      success: true,
      data: stats,
    };
  },

  /**
   * Admin: Export all responses to CSV format
   */
  async exportCsv(slug: string): Promise<string> {
    const survey = await surveysRepository.getBySlug(slug);
    if (!survey) {
      throw new NotFoundError(`Survey '${slug}' not found`);
    }

    const result = await surveysRepository.listResponses(survey.id, { limit: 10000 });
    const items = result.items;

    if (items.length === 0) {
      return "ID,Name,Phone,Email,College,Stream,Year,Date\n";
    }

    // Collect all unique answer keys for headers
    const answerKeys = new Set<string>();
    items.forEach((item) => {
      if (item.answers && typeof item.answers === "object") {
        Object.keys(item.answers).forEach((k) => answerKeys.add(k));
      }
    });

    const headers = [
      "Response ID",
      "Student Name",
      "Phone",
      "Email",
      "Institution",
      "Course/Stream",
      "Year of Study",
      "Submission Date",
      ...Array.from(answerKeys),
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = Array.isArray(val) ? val.join("; ") : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = items.map((item) => {
      const ans = (item.answers || {}) as Record<string, any>;
      const dynamicCols = Array.from(answerKeys).map((k) => escapeCsv(ans[k]));

      return [
        escapeCsv(item.id),
        escapeCsv(item.name),
        escapeCsv(item.phone),
        escapeCsv(item.email),
        escapeCsv(item.collegeName),
        escapeCsv(item.stream),
        escapeCsv(item.yearOfStudy),
        escapeCsv(item.createdAt),
        ...dynamicCols,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  },
};
