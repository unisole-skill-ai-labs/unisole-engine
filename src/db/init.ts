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
      CREATE SEQUENCE IF NOT EXISTS colleges_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS branches_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

      -- 3. TABLES
      CREATE TABLE IF NOT EXISTS colleges (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('clg_' || nextval('colleges_id_seq'::regclass)),
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        short_name VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('brn_' || nextval('branches_id_seq'::regclass)),
        college_id VARCHAR(50) REFERENCES colleges(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

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
      CREATE INDEX IF NOT EXISTS idx_colleges_is_active ON colleges(is_active);
      CREATE INDEX IF NOT EXISTS idx_branches_college ON branches(college_id);
      CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
      CREATE INDEX IF NOT EXISTS idx_presentations_is_active ON presentations(is_active);
      CREATE INDEX IF NOT EXISTS idx_presentation_sessions_code ON presentation_sessions(session_code);
      CREATE INDEX IF NOT EXISTS idx_presentation_sessions_status ON presentation_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_presentation_leads_session ON presentation_leads(session_id);
      CREATE INDEX IF NOT EXISTS idx_presentation_leads_phone ON presentation_leads(phone);
      CREATE INDEX IF NOT EXISTS idx_presentation_leads_score ON presentation_leads(total_score DESC NULLS LAST);

      -- 5. ENSURE REQUIRED COLUMNS & FOREIGN KEYS
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name VARCHAR(200);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
    `);

    // Ensure default seeded colleges exist
    const collegesCountRes = await pool.query("SELECT COUNT(*) FROM colleges");
    if (Number(collegesCountRes.rows[0].count) === 0) {
      const defaultColleges = [
        { name: "Delhi Technological University", slug: "delhi-technological-university", shortName: "DTU" },
        { name: "Indian Institute of Technology Delhi", slug: "iit-delhi", shortName: "IITD" },
        { name: "Netaji Subhas University of Technology", slug: "nsut-delhi", shortName: "NSUT" },
        { name: "Indraprastha Institute of Information Technology Delhi", slug: "iiit-delhi", shortName: "IIITD" },
        { name: "National Institute of Technology", slug: "nit-delhi", shortName: "NIT" },
        { name: "Anna University", slug: "anna-university", shortName: "AU" },
        { name: "Other University / College", slug: "other-college", shortName: "OTHER" },
      ];
      for (const clg of defaultColleges) {
        await pool.query(
          `INSERT INTO colleges (name, slug, short_name, is_active)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (slug) DO NOTHING`,
          [clg.name, clg.slug, clg.shortName]
        );
      }
      console.log("[DB] Seeded initial colleges list.");
    }

    // Ensure default seeded branches exist for colleges
    const allCollegesRes = await pool.query("SELECT id, short_name FROM colleges WHERE is_active = TRUE");
    const defaultBranches = [
      { name: "Computer Science & Engineering", code: "CSE" },
      { name: "Information Technology", code: "IT" },
      { name: "Artificial Intelligence & Machine Learning", code: "AIML" },
      { name: "Data Science & Big Data Analytics", code: "DS" },
      { name: "Electronics & Communication Engineering", code: "ECE" },
      { name: "Electrical & Electronics Engineering", code: "EEE" },
      { name: "Mechanical Engineering", code: "MECH" },
      { name: "Civil Engineering", code: "CIVIL" },
      { name: "Cyber Security & Digital Forensics", code: "CS" },
      { name: "Computer Applications (BCA / MCA)", code: "BCA/MCA" },
      { name: "Management & Business Studies (BBA / MBA)", code: "BBA/MBA" },
      { name: "Other / Multidisciplinary", code: "OTHER" },
    ];

    for (const clg of allCollegesRes.rows) {
      const countRes = await pool.query(
        "SELECT COUNT(*) FROM branches WHERE college_id = $1",
        [clg.id]
      );
      if (Number(countRes.rows[0].count) === 0) {
        for (const brn of defaultBranches) {
          await pool.query(
            `INSERT INTO branches (college_id, name, code, is_active)
             VALUES ($1, $2, $3, TRUE)`,
            [clg.id, brn.name, brn.code]
          );
        }
      }
    }

    // Also ensure global fallback branches exist with college_id IS NULL
    const globalBranchesCountRes = await pool.query("SELECT COUNT(*) FROM branches WHERE college_id IS NULL");
    if (Number(globalBranchesCountRes.rows[0].count) === 0) {
      for (const brn of defaultBranches) {
        await pool.query(
          `INSERT INTO branches (name, code, is_active)
           VALUES ($1, $2, TRUE)`,
          [brn.name, brn.code]
        );
      }
    }

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
