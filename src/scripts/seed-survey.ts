import { db, pool } from "../db";
import { surveys } from "../db/schema";
import { eq } from "drizzle-orm";
import { studentSurveySchema } from "../constants/defaultSurvey";
async function seed() {
  console.log("[SEED] Seeding student-skills-survey definition...");
  try {
    const [existing] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.slug, studentSurveySchema.slug))
      .limit(1);

    if (existing) {
      console.log("[SEED] Survey already exists. Updating schema...");
      await db
        .update(surveys)
        .set({
          title: studentSurveySchema.title,
          description: studentSurveySchema.description,
          schema: studentSurveySchema,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(surveys.slug, studentSurveySchema.slug));
    } else {
      await db.insert(surveys).values({
        id: "srv_student_skills_2026",
        slug: studentSurveySchema.slug,
        title: studentSurveySchema.title,
        description: studentSurveySchema.description,
        schema: studentSurveySchema,
        isActive: true,
        metadata: {
          category: "CAREER_ASPIRATIONS",
          origin: "GOOGLE_FORM_MIGRATION",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log("✅ [SEED] Student skills survey seeded successfully!");
  } catch (err) {
    console.error("❌ [SEED] Error seeding survey:", err);
  } finally {
    await pool.end();
  }
}

seed();
