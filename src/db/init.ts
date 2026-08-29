import { pool } from "../db";

export async function ensureDatabaseSchema() {
  try {
    await pool.query(`
      -- 1. ENUMS
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
          CREATE TYPE "session_status" AS ENUM('DRAFT', 'LIVE', 'PAUSED', 'ENDED');
        END IF;
      END $$;

      -- 2. SEQUENCES
      CREATE SEQUENCE IF NOT EXISTS presentations_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS presentation_sessions_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS presentation_leads_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

      -- 3. TABLES
      CREATE TABLE IF NOT EXISTS presentations (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('pres_' || nextval('presentations_id_seq'::regclass)),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        theme VARCHAR(50) DEFAULT 'dark' NOT NULL,
        slides JSONB DEFAULT '[]'::jsonb NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS presentation_sessions (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('sess_' || nextval('presentation_sessions_id_seq'::regclass)),
        presentation_id VARCHAR(50) NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
        college_id VARCHAR(50) REFERENCES colleges(id) ON DELETE SET NULL,
        college_name VARCHAR(200),
        session_code VARCHAR(20) NOT NULL UNIQUE,
        status session_status DEFAULT 'DRAFT' NOT NULL,
        current_slide_index INTEGER DEFAULT 0 NOT NULL,
        is_quiz_active BOOLEAN DEFAULT FALSE NOT NULL,
        is_answer_revealed BOOLEAN DEFAULT FALSE NOT NULL,
        is_leaderboard_active BOOLEAN DEFAULT FALSE NOT NULL,
        quiz_started_at TIMESTAMPTZ,
        quiz_time_limit INTEGER DEFAULT 30 NOT NULL,
        active_attendees_count INTEGER DEFAULT 0 NOT NULL,
        started_at TIMESTAMPTZ,
        ended_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS presentation_leads (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('lead_' || nextval('presentation_leads_id_seq'::regclass)),
        session_id VARCHAR(50) NOT NULL REFERENCES presentation_sessions(id) ON DELETE CASCADE,
        college_id VARCHAR(50) REFERENCES colleges(id) ON DELETE SET NULL,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        branch VARCHAR(100),
        year_of_study VARCHAR(50),
        total_score INTEGER DEFAULT 0 NOT NULL,
        rank INTEGER,
        streak INTEGER DEFAULT 0 NOT NULL,
        responses JSONB DEFAULT '{}'::jsonb NOT NULL,
        joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      -- 4. INDEXES
      CREATE INDEX IF NOT EXISTS idx_presentations_is_active ON presentations(is_active);
      CREATE INDEX IF NOT EXISTS idx_presentation_sessions_code ON presentation_sessions(session_code);
      CREATE INDEX IF NOT EXISTS idx_presentation_sessions_status ON presentation_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_presentation_leads_session ON presentation_leads(session_id);
      CREATE INDEX IF NOT EXISTS idx_presentation_leads_phone ON presentation_leads(phone);
      CREATE INDEX IF NOT EXISTS idx_presentation_leads_score ON presentation_leads(total_score DESC NULLS LAST);

      -- 5. ENSURE USERS TABLE HAS COLLEGE AND BRANCH COLUMNS
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name VARCHAR(200);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
    `);

    // Ensure default seeded presentation deck exists
    const checkRes = await pool.query("SELECT COUNT(*) FROM presentations");
    if (Number(checkRes.rows[0].count) === 0) {
      const defaultSlides = JSON.stringify([
        {
          id: "slide_1",
          type: "COVER",
          title: "Campus Tech Masterclass & Career Accelerator",
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
      ]);

      await pool.query(
        `INSERT INTO presentations (id, title, description, theme, slides, is_active, created_by_id)
         VALUES ($1, $2, $3, $4, $5::jsonb, TRUE, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          "pres_1",
          "Campus Tech Masterclass & Career Accelerator",
          "Interactive college roadshow deck featuring real-time audience quiz, tech pulse check, and student scholarships.",
          "dark",
          defaultSlides,
          "usr_1",
        ]
      );
      console.log("[DB] Seeded initial presentation deck pres_1");
    }

    console.log("[DB] Presentation schema verified & auto-migrated.");
  } catch (err) {
    console.error("[DB] Error ensuring schema:", err);
  }
}
