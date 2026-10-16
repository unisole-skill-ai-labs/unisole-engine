import { eq } from "drizzle-orm";
import { db } from "../db";
import { lessons, Lesson, NewLesson, moduleLessons } from "../db/schema";
import { WEEKS_DATA } from "../scripts/seed-ai-agent-curriculum";

export const lessonsRepository = {
  async list(): Promise<Lesson[]> {
    return db.select().from(lessons);
  },

  async getById(id: string): Promise<Lesson | null> {
    try {
      const rows = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
      if (rows[0]) return rows[0];
    } catch {}

    const match = id.match(/les_agent_w(\d+)_(lec|quiz|lab|live)/i);
    if (match) {
      const weekNum = parseInt(match[1], 10);
      const type = match[2].toLowerCase();
      const week = WEEKS_DATA[weekNum - 1] || WEEKS_DATA[0];

      if (type === "lec") {
        return {
          id,
          title: `${week.weekNum}.1 Concept Lecture: ${week.title.replace(/^Week \d+:\s*/, "")}`,
          slug: `agent-w${week.weekNum}-lecture`,
          description: week.keyConcepts,
          content: JSON.stringify({
            category: "LECTURE",
            type: "video",
            contentType: "VIDEO",
            curriculumMode: "LECTURE",
            duration: "45 Mins",
            videoUrl: week.videoUrl,
            keyConcepts: week.keyConcepts,
            handsOn: week.practical,
          }),
          videoUrl: week.videoUrl,
          durationMinutes: 45,
          status: "PUBLISHED",
          isActive: true,
          unlockAt: null,
          lockAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Lesson;
      } else if (type === "quiz") {
        return {
          id,
          title: `${week.weekNum}.2 Knowledge Check: MCQ Quiz (${week.questions.length} Questions)`,
          slug: `agent-w${week.weekNum}-quiz`,
          description: `Test your understanding of ${week.title}.`,
          content: JSON.stringify({
            category: "PRACTICE",
            type: "quiz",
            contentType: "QUIZ",
            curriculumMode: "PRACTICE",
            practiceType: "MCQ",
            duration: "20 Mins",
            quiz: {
              passingScorePercent: 70,
              questions: week.questions,
            },
            questions: week.questions,
          }),
          videoUrl: null,
          durationMinutes: 20,
          status: "PUBLISHED",
          isActive: true,
          unlockAt: null,
          lockAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Lesson;
      } else if (type === "lab") {
        return {
          id,
          title: `${week.weekNum}.3 Hands-on Lab & Project Deliverable`,
          slug: `agent-w${week.weekNum}-lab`,
          description: week.assignmentDeliverable,
          content: JSON.stringify({
            category: "PRACTICE",
            type: "project",
            contentType: "PROJECT",
            curriculumMode: "PRACTICE",
            practiceType: "PROJECT",
            duration: "60 Mins",
            assignment: {
              instructions: week.assignmentDeliverable,
              allowedTypes: ["URL", "GITHUB"],
              maxPoints: 100,
            },
            handsOn: week.practical,
          }),
          videoUrl: null,
          durationMinutes: 60,
          status: "PUBLISHED",
          isActive: true,
          unlockAt: null,
          lockAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Lesson;
      } else if (type === "live") {
        return {
          id,
          title: `${week.weekNum}.4 Live Workshop: ${week.liveTopic}`,
          slug: `agent-w${week.weekNum}-live`,
          description: `Interactive live cohort workshop on ${week.liveDate} at ${week.liveTime}.`,
          content: JSON.stringify({
            category: "LIVE",
            type: "live",
            contentType: "LIVE",
            curriculumMode: "LIVE",
            duration: "120 Mins",
            liveDate: week.liveDate,
            liveTime: week.liveTime,
            mentorName: week.mentorName,
            liveMeetingUrl: "https://meet.google.com/new",
            instructions: `Agenda for ${week.liveTopic}:\n• 45 Mins: Architecture Deep-dive & Code Walkthrough\n• 45 Mins: Hands-on Lab Implementation\n• 30 Mins: Live Open Q&A & Code Reviews with ${week.mentorName}.`,
          }),
          videoUrl: null,
          durationMinutes: 120,
          status: "PUBLISHED",
          isActive: true,
          unlockAt: null,
          lockAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Lesson;
      }
    }

    return null;
  },

  async getBySlug(slug: string): Promise<Lesson | null> {
    const rows = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewLesson): Promise<Lesson> {
    const rows = await db.insert(lessons).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<Omit<NewLesson, "id">>): Promise<Lesson | null> {
    const rows = await db
      .update(lessons)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(lessons.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string): Promise<Lesson | null> {
    const rows = await db.delete(lessons).where(eq(lessons.id, id)).returning();
    return rows[0] ?? null;
  },

  // --- Usage lookups ---
  async getModulesUsingLesson(lessonId: string): Promise<string[]> {
    const rows = await db
      .select({ moduleId: moduleLessons.moduleId })
      .from(moduleLessons)
      .where(eq(moduleLessons.lessonId, lessonId));
    return rows.map((r) => r.moduleId);
  },
};
