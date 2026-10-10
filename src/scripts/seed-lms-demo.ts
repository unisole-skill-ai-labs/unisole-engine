import { pool, db } from "../db";
import {
  categories,
  pathways,
  pathwayCategories,
  users,
  enrollments,
  lessonProgress,
  submissions,
  notes,
} from "../db/schema";
import { eq, or } from "drizzle-orm";
import { pathwaysService } from "../services/pathways.service";

/**
 * LMS Demo Seeder:
 * Populates categories, demo student account, active enrollments,
 * initial completed quiz, lab assignment submission, and course notes.
 */
export async function seedLmsDemoData() {
  console.log("[Seed:LMS] Starting LMS demo data synchronization...");

  try {
    // 1. Sync canonical pathways first to make sure cs-genai and cs-common exist in DB
    try {
      await pathwaysService.syncCanonicalPathways();
      console.log("[Seed:LMS] Verified canonical pathways synced.");
    } catch (e) {
      console.warn("[Seed:LMS] Pathway sync note:", e);
    }

    // 2. Seed Official Categories
    const demoCategories = [
      {
        id: "cat_cs_ai",
        name: "Computer Science & AI",
        slug: "cs-ai",
        description: "Foundational and advanced computer science, deep sequence models, Transformer architectures, and Agentic AI systems.",
      },
      {
        id: "cat_biz_ai",
        name: "AI Entrepreneurship & Business",
        slug: "ai-entrepreneurship",
        description: "Converting AI technical capability into commercial startups, validated products, and investor-ready pitches.",
      },
      {
        id: "cat_data_ai",
        name: "Data Engineering & Analytics",
        slug: "data-analytics",
        description: "Modern data pipelines, DuckDB, Parquet, vector indexing, and business intelligence dashboards.",
      },
    ];

    for (const cat of demoCategories) {
      try {
        await db
          .insert(categories)
          .values({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: categories.id,
            set: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              isActive: true,
            },
          });
      } catch (err) {
        console.warn(`[Seed:LMS] Note on category ${cat.id}:`, err);
      }
    }
    console.log("[Seed:LMS] Synchronized LMS categories.");

    // 3. Link Pathways to Categories
    const pathwayCatLinks = [
      { pathwayId: "cs-genai", categoryId: "cat_cs_ai" },
      { pathwayId: "cs-common", categoryId: "cat_biz_ai" },
      { pathwayId: "cs-agentic", categoryId: "cat_cs_ai" },
    ];

    for (const link of pathwayCatLinks) {
      try {
        await pool.query(
          `INSERT INTO pathway_categories (pathway_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [link.pathwayId, link.categoryId]
        );
      } catch {
        // Link may already exist or pathway table not yet loaded
      }
    }

    // 4. Create / Sync Demo Student User: Aarav Sharma
    const studentPhone = "+919876543210";
    const studentUserRes = await pool.query(
      `INSERT INTO users (
        id, phone, name, email, college_name, branch, role, is_active, metadata
       )
       VALUES (
        'usr_demo_aarav_sharma',
        $1,
        'Aarav Sharma',
        'aarav.sharma@unisole.org',
        'Centre of Excellence Govt. College Sanjauli',
        'BCA (Computer Applications)',
        'STUDENT',
        TRUE,
        '{"timezone": "Asia/Kolkata", "linkedin": "https://linkedin.com/in/aarav-sharma-ai", "semester": "5th Semester", "gradYear": "2026"}'::jsonb
       )
       ON CONFLICT (phone) DO UPDATE
       SET name = EXCLUDED.name,
           email = EXCLUDED.email,
           college_name = EXCLUDED.college_name,
           branch = EXCLUDED.branch,
           metadata = EXCLUDED.metadata,
           is_active = TRUE
       RETURNING id`,
      [studentPhone]
    );

    const studentId = studentUserRes.rows[0]?.id || "usr_demo_aarav_sharma";
    console.log(`[Seed:LMS] Synchronized Demo Student user: Aarav Sharma (${studentId})`);

    // 5. Enroll Demo Student in cs-genai and cs-common
    const enrollmentsToSeed = [
      {
        id: `enr_${studentId}_cs-genai`,
        userId: studentId,
        pathwayId: "cs-genai",
        itemType: "PATHWAY" as const,
        itemId: "cs-genai",
        status: "ACTIVE" as const,
        source: "PURCHASE" as const,
      },
      {
        id: `enr_${studentId}_cs-common`,
        userId: studentId,
        pathwayId: "cs-common",
        itemType: "PATHWAY" as const,
        itemId: "cs-common",
        status: "ACTIVE" as const,
        source: "CAMPUS_SPONSORED" as const,
      },
    ];

    for (const enr of enrollmentsToSeed) {
      try {
        await pool.query(
          `INSERT INTO enrollments (id, user_id, pathway_id, item_type, item_id, status, source, enrolled_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (id) DO UPDATE
           SET status = 'ACTIVE'`,
          [enr.id, enr.userId, enr.pathwayId, enr.itemType, enr.itemId, enr.status, enr.source]
        );
      } catch (e) {
        console.warn(`[Seed:LMS] Enrollment note for ${enr.pathwayId}:`, e);
      }
    }
    console.log(`[Seed:LMS] Enrolled Aarav Sharma in cs-genai and cs-common.`);

    // 6. Seed Initial Completed Lesson & Submissions
    // 6a. Lesson progress for Lesson 1
    try {
      await pool.query(
        `INSERT INTO lesson_progress (id, user_id, lesson_id, pathway_id, is_completed, completed_at, updated_at)
         VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
         ON CONFLICT (user_id, lesson_id) DO UPDATE
         SET is_completed = TRUE`,
        [`prog_${studentId}_cs-genai_1_1`, studentId, "cs-genai_1_1", "cs-genai"]
      );
    } catch {
      // Non-critical
    }

    // 6b. Graded Quiz submission (Week 1 Graded Quiz: Data & Linux Drills - 10/10)
    try {
      await pool.query(
        `INSERT INTO submissions (id, user_id, lesson_id, pathway_id, type, title, score, max_score, status, evaluated_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'quiz', 'Week 1 Graded Quiz: Data & Linux Drills', 10, 10, 'APPROVED', NOW(), NOW() - INTERVAL '2 hours', NOW())
         ON CONFLICT (id) DO NOTHING`,
        [`sub_${studentId}_cs-genai_1_quiz`, studentId, "cs-genai_1_quiz", "cs-genai"]
      );
    } catch {
      // Non-critical
    }

    // 6c. Lab Assignment submission (Week 1 Lab: Real Dataset Profiling with Pandas)
    try {
      await pool.query(
        `INSERT INTO submissions (id, user_id, lesson_id, pathway_id, type, title, submission_url, submission_text, score, max_score, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'assignment', 'Week 1 Lab: Real Dataset Profiling with Pandas', 'https://github.com/aarav-sharma/genai-week1-dataset-profiling', 'Implemented chunked CSV ingestion with Polars and Pandas, calculating summary statistics and missingness matrices for 2.4M rows.', NULL, 100, 'SUBMITTED', NOW() - INTERVAL '1 hour', NOW())
         ON CONFLICT (id) DO NOTHING`,
        [`sub_${studentId}_cs-genai_1_lab`, studentId, "cs-genai_1_lab", "cs-genai"]
      );
    } catch {
      // Non-critical
    }

    // 6d. Lecture Note for Week 1
    try {
      await pool.query(
        `INSERT INTO notes (id, user_id, lesson_id, pathway_id, lesson_title, content, updated_at)
         VALUES ($1, $2, $3, $4, '1.1 Data Engineering for AI: Real-World Ingestion', $5, NOW())
         ON CONFLICT (user_id, lesson_id) DO UPDATE
         SET content = EXCLUDED.content`,
        [
          `note_${studentId}_cs-genai_1_1`,
          studentId,
          "cs-genai_1_1",
          "cs-genai",
          "Key Takeaway: Vectorized columnar processing with Arrow/Parquet eliminates Python interpreter overhead. Always validate row schemas before pushing to embedding queues.",
        ]
      );
    } catch {
      // Non-critical
    }

    console.log("[Seed:LMS] Successfully seeded demo student submissions, progress, and lecture notes!");
    return { success: true };
  } catch (err) {
    console.error("[Seed:LMS] Error seeding demo data:", err);
    throw err;
  }
}

if (require.main === module) {
  seedLmsDemoData()
    .then(() => {
      console.log("[Seed:LMS] Complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed:LMS] Failed:", err);
      process.exit(1);
    });
}
