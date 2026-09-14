import { eq, desc, and, ilike, sql, or } from "drizzle-orm";
import { db } from "../db";
import { surveys, surveyResponses, Survey, NewSurvey, SurveyResponse, NewSurveyResponse } from "../db/schema";

export interface SurveyResponseFilters {
  collegeName?: string;
  stream?: string;
  yearOfStudy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const surveysRepository = {
  async list(): Promise<any[]> {
    const rows = await db
      .select({
        id: surveys.id,
        slug: surveys.slug,
        title: surveys.title,
        description: surveys.description,
        isActive: surveys.isActive,
        createdAt: surveys.createdAt,
        updatedAt: surveys.updatedAt,
        totalResponses: sql<number>`count(${surveyResponses.id})::int`,
      })
      .from(surveys)
      .leftJoin(surveyResponses, eq(surveys.id, surveyResponses.surveyId))
      .groupBy(surveys.id)
      .orderBy(desc(surveys.createdAt));

    return rows;
  },

  async getBySlug(slug: string): Promise<Survey | null> {
    const [row] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.slug, slug))
      .limit(1);
    return row ?? null;
  },

  async getById(id: string): Promise<Survey | null> {
    const [row] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, id))
      .limit(1);
    return row ?? null;
  },

  async create(data: NewSurvey): Promise<Survey> {
    const [row] = await db.insert(surveys).values(data).returning();
    return row;
  },

  async update(slug: string, data: Partial<Omit<NewSurvey, "id" | "slug">>): Promise<Survey | null> {
    const [row] = await db
      .update(surveys)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(surveys.slug, slug))
      .returning();
    return row ?? null;
  },

  async saveResponse(data: NewSurveyResponse): Promise<SurveyResponse> {
    const [row] = await db.insert(surveyResponses).values(data).returning();
    return row;
  },

  async listResponses(surveyId: string, filters: SurveyResponseFilters = {}) {
    const conditions = [eq(surveyResponses.surveyId, surveyId)];

    if (filters.collegeName) {
      conditions.push(ilike(surveyResponses.collegeName, `%${filters.collegeName}%`));
    }
    if (filters.stream) {
      conditions.push(eq(surveyResponses.stream, filters.stream));
    }
    if (filters.yearOfStudy) {
      conditions.push(eq(surveyResponses.yearOfStudy, filters.yearOfStudy));
    }
    if (filters.search) {
      const q = `%${filters.search}%`;
      const searchOr = or(
        ilike(surveyResponses.name, q),
        ilike(surveyResponses.phone, q),
        ilike(surveyResponses.collegeName, q),
        ilike(surveyResponses.stream, q)
      );
      if (searchOr) {
        conditions.push(searchOr);
      }
    }

    const whereClause = and(...conditions);
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(surveyResponses)
        .where(whereClause)
        .orderBy(desc(surveyResponses.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(surveyResponses)
        .where(whereClause),
    ]);

    return {
      items,
      total: countResult[0]?.count ?? 0,
      limit,
      offset,
    };
  },

  async getResponseStats(surveyId: string) {
    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId));

    const total = responses.length;
    const streamCounts: Record<string, number> = {};
    const collegeCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};
    const goalCounts: Record<string, number> = {};

    for (const r of responses) {
      if (r.stream) {
        streamCounts[r.stream] = (streamCounts[r.stream] || 0) + 1;
      }
      if (r.collegeName) {
        collegeCounts[r.collegeName] = (collegeCounts[r.collegeName] || 0) + 1;
      }
      if (r.yearOfStudy) {
        yearCounts[r.yearOfStudy] = (yearCounts[r.yearOfStudy] || 0) + 1;
      }

      // Analyze answers JSONB
      const answers = (r.answers || {}) as Record<string, any>;
      
      // Skills answers (could be under skills_bca, skills_mca, or skills)
      for (const [k, v] of Object.entries(answers)) {
        if (k.startsWith("skills") || k === "aiming_for" || k === "why_learn") {
          const list = Array.isArray(v) ? v : [v];
          for (const item of list) {
            if (item && typeof item === "string") {
              const cleanItem = item.trim();
              if (k.startsWith("skills")) {
                skillCounts[cleanItem] = (skillCounts[cleanItem] || 0) + 1;
              } else if (k === "aiming_for") {
                goalCounts[cleanItem] = (goalCounts[cleanItem] || 0) + 1;
              }
            }
          }
        }
      }
    }

    return {
      total,
      byStream: streamCounts,
      byCollege: collegeCounts,
      byYear: yearCounts,
      topSkills: Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([skill, count]) => ({ skill, count })),
      topGoals: Object.entries(goalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([goal, count]) => ({ goal, count })),
    };
  },
};
