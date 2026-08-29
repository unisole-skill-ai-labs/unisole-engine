import { pool } from "../db";

export async function ensureDatabaseSchema() {
  try {
    await pool.query(`
      -- 1. ENUMS
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
          CREATE TYPE "session_status" AS ENUM('DRAFT', 'LIVE', 'PAUSED', 'ENDED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
          CREATE TYPE "task_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
          CREATE TYPE "task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_activity_type') THEN
          CREATE TYPE "task_activity_type" AS ENUM('COMMENT', 'STATUS_CHANGE', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'BLOCKED');
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MEMBER';
          ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
        END IF;
      END $$;

      -- 2. SEQUENCES
      CREATE SEQUENCE IF NOT EXISTS presentations_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS presentation_sessions_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS presentation_leads_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS colleges_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS branches_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS team_departments_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS tasks_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS task_subtasks_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS task_templates_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS task_comments_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS daily_eod_logs_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

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

      CREATE TABLE IF NOT EXISTS team_departments (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('dept_' || nextval('team_departments_id_seq'::regclass)),
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        color VARCHAR(30) DEFAULT '#6366f1' NOT NULL,
        description TEXT,
        lead_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_templates (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('tmpl_' || nextval('task_templates_id_seq'::regclass)),
        title VARCHAR(255) NOT NULL,
        department_id VARCHAR(50) REFERENCES team_departments(id) ON DELETE SET NULL,
        description TEXT,
        default_checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
        guidelines_url TEXT,
        estimated_hours INTEGER DEFAULT 2,
        created_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('task_' || nextval('tasks_id_seq'::regclass)),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'TODO' NOT NULL,
        priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
        assignee_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        reporter_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        department_id VARCHAR(50) REFERENCES team_departments(id) ON DELETE SET NULL,
        template_id VARCHAR(50) REFERENCES task_templates(id) ON DELETE SET NULL,
        due_date TIMESTAMPTZ,
        estimated_hours INTEGER,
        submission_proof_url TEXT,
        submission_notes TEXT,
        blocked_reason TEXT,
        related_entity_type VARCHAR(50),
        related_entity_id VARCHAR(50),
        related_entity_name VARCHAR(255),
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_subtasks (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('stask_' || nextval('task_subtasks_id_seq'::regclass)),
        task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE NOT NULL,
        order_index INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_comments (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('tcomm_' || nextval('task_comments_id_seq'::regclass)),
        task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        activity_type VARCHAR(50) DEFAULT 'COMMENT' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_eod_logs (
        id VARCHAR(50) PRIMARY KEY DEFAULT ('eod_' || nextval('daily_eod_logs_id_seq'::regclass)),
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        log_date VARCHAR(10) NOT NULL,
        completed_summary TEXT NOT NULL,
        plan_tomorrow TEXT NOT NULL,
        blockers TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_subtasks_task ON task_subtasks(task_id);
      CREATE INDEX IF NOT EXISTS idx_comments_task ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_eod_user ON daily_eod_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_eod_date ON daily_eod_logs(log_date);

      -- 5. ENSURE REQUIRED COLUMNS & FOREIGN KEYS
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name VARCHAR(200);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
    `);

    // Ensure default seeded colleges exist
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
         ON CONFLICT (slug) DO UPDATE SET short_name = EXCLUDED.short_name, is_active = TRUE`,
        [clg.name, clg.slug, clg.shortName]
      );
    }
    console.log("[DB] Seeded / verified initial colleges list.");

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

    // Ensure secondary presentation deck exists
    const checkPres2 = await pool.query("SELECT COUNT(*) FROM presentations WHERE id = 'pres_2'");
    if (Number(checkPres2.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO presentations (id, title, description, theme, slides, is_active, created_by_id)
         VALUES ($1, $2, $3, $4, $5::jsonb, TRUE, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          "pres_2",
          "AI & Full Stack Career Bootcamp 2026",
          "Deep dive into production LLM agents, cloud deployment, and landing high-growth software roles.",
          "light",
          JSON.stringify([
            { id: "s1", type: "COVER", title: "AI & Full Stack Career Bootcamp 2026", subtitle: "Unisole Industry Immersion" },
            { id: "s2", type: "CONTENT", title: "The Next Decade in Software", subtitle: "Full Stack + AI Agents", bullets: ["Agentic workflows replace routine coding", "System design & distributed backends are #1 requirement"] },
            { id: "s3", type: "QUIZ", title: "Architecture Challenge", question: "Which protocol is ideal for streaming LLM tokens to the frontend?", timeLimit: 25, points: 1000, options: [{ text: "Server-Sent Events (SSE)", isCorrect: true }, { text: "FTP", isCorrect: false }, { text: "SOAP XML", isCorrect: false }] }
          ]),
          "usr_1",
        ]
      );
    }

    // Seed Sample Pathways if not existing
    const pathwaysCountRes = await pool.query("SELECT COUNT(*) FROM pathways");
    if (Number(pathwaysCountRes.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO pathways (id, title, slug, description, short_description, price_paise, status, is_active)
        VALUES 
          ('pwy_fullstack', 'Full Stack Web & Cloud Engineering', 'full-stack-web-engineering', 'Master TypeScript, React, Next.js, Node.js, PostgreSQL and Cloud Deployments from ground up.', 'Complete Full Stack mastery program.', 499900, 'PUBLISHED', TRUE),
          ('pwy_genai', 'Generative AI & LLM Systems Engineering', 'generative-ai-llm-engineering', 'Build production-ready LLM agents, RAG pipelines, fine-tuned models, and vector database systems.', 'Cutting-edge AI & Agentic development.', 599900, 'PUBLISHED', TRUE),
          ('pwy_datascience', 'Data Science & Machine Learning Masterclass', 'data-science-machine-learning', 'Comprehensive curriculum spanning Python, statistical modeling, PyTorch, and predictive analytics.', 'Data-driven engineering from scratch.', 449900, 'PUBLISHED', TRUE)
        ON CONFLICT (slug) DO NOTHING;
      `);
      console.log("[DB] Seeded demo pathways.");
    }

    // Seed Demo Presentation Sessions & Leads for Colleges
    const dtuRes = await pool.query("SELECT id, name FROM colleges WHERE slug = 'delhi-technological-university' LIMIT 1");
    const iitdRes = await pool.query("SELECT id, name FROM colleges WHERE slug = 'iit-delhi' LIMIT 1");
    const nsutRes = await pool.query("SELECT id, name FROM colleges WHERE slug = 'nsut-delhi' LIMIT 1");
    const pathwaysRes = await pool.query("SELECT id FROM pathways ORDER BY id ASC");
    const pwyId1 = pathwaysRes.rows[0]?.id || "pwy_1";
    const pwyId2 = pathwaysRes.rows[1]?.id || pwyId1;

    if (dtuRes.rows.length > 0) {
      const dtuId = dtuRes.rows[0].id;
      const dtuName = dtuRes.rows[0].name;

      // Seed DTU sessions
      await pool.query(
        `INSERT INTO presentation_sessions (id, presentation_id, college_id, college_name, session_code, status, active_attendees_count, started_at)
         VALUES 
           ('sess_dtu_1', 'pres_1', $1, $2, 'DTU-2026', 'LIVE', 48, NOW() - INTERVAL '1 hour'),
           ('sess_dtu_2', 'pres_2', $1, $2, 'DTU-AI-77', 'ENDED', 84, NOW() - INTERVAL '3 days')
         ON CONFLICT (session_code) DO NOTHING`,
        [dtuId, dtuName]
      );

      // Seed DTU demo student leads
      const dtuLeadsCount = await pool.query("SELECT COUNT(*) FROM presentation_leads WHERE college_id = $1", [dtuId]);
      if (Number(dtuLeadsCount.rows[0].count) === 0) {
        const demoLeads = [
          { name: "Aarav Sharma", phone: "9811234501", branch: "Computer Science & Engineering", year: "3rd Year", score: 980, rank: 1 },
          { name: "Priyanshu Verma", phone: "9811234502", branch: "Computer Science & Engineering", year: "3rd Year", score: 920, rank: 2 },
          { name: "Ananya Iyer", phone: "9811234503", branch: "Artificial Intelligence & Machine Learning", year: "2nd Year", score: 890, rank: 3 },
          { name: "Rohan Gupta", phone: "9811234504", branch: "Information Technology", year: "4th Year", score: 860, rank: 4 },
          { name: "Sneha Patel", phone: "9811234505", branch: "Artificial Intelligence & Machine Learning", year: "3rd Year", score: 830, rank: 5 },
          { name: "Vikrant Malhotra", phone: "9811234506", branch: "Electronics & Communication Engineering", year: "2nd Year", score: 790, rank: 6 },
          { name: "Divya Nair", phone: "9811234507", branch: "Data Science & Big Data Analytics", year: "3rd Year", score: 750, rank: 7 },
          { name: "Ayush Mehra", phone: "9811234508", branch: "Mechanical Engineering", year: "4th Year", score: 710, rank: 8 },
          { name: "Tanvi Saxena", phone: "9811234509", branch: "Computer Science & Engineering", year: "2nd Year", score: 670, rank: 9 },
          { name: "Kunal Rao", phone: "9811234510", branch: "Electronics & Communication Engineering", year: "3rd Year", score: 620, rank: 10 },
          { name: "Shreya Sen", phone: "9811234511", branch: "Information Technology", year: "3rd Year", score: 590, rank: 11 },
          { name: "Harsh Vardhan", phone: "9811234512", branch: "Mechanical Engineering", year: "4th Year", score: 540, rank: 12 },
          { name: "Riddhima Sethi", phone: "9811234513", branch: "Computer Science & Engineering", year: "1st Year", score: 510, rank: 13 },
          { name: "Nikhil Joshi", phone: "9811234514", branch: "Electrical & Electronics Engineering", year: "2nd Year", score: 480, rank: 14 },
          { name: "Kavya Menon", phone: "9811234515", branch: "Artificial Intelligence & Machine Learning", year: "2nd Year", score: 450, rank: 15 },
        ];

        for (const l of demoLeads) {
          await pool.query(
            `INSERT INTO presentation_leads (session_id, college_id, name, phone, branch, year_of_study, total_score, rank)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ["sess_dtu_1", dtuId, l.name, l.phone, l.branch, l.year, l.score, l.rank]
          );

          // Also register student in users table
          const userRes = await pool.query(
            `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
             VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
             ON CONFLICT (phone) DO UPDATE SET college_id = $3, college_name = $4, branch = $5
             RETURNING id`,
            [l.phone, l.name, dtuId, dtuName, l.branch]
          );

          // Enroll top 6 students in pathways
          if (l.rank <= 6 && userRes.rows.length > 0) {
            const uid = userRes.rows[0].id;
            const pId = l.rank % 2 === 0 ? pwyId1 : pwyId2;
            await pool.query(
              `INSERT INTO enrollments (user_id, pathway_id, status, enrolled_at)
               VALUES ($1, $2, 'ACTIVE', NOW() - INTERVAL '2 days')
               ON CONFLICT DO NOTHING`,
              [uid, pId]
            );
          }
        }
        console.log("[DB] Seeded demo leads, users, and enrollments for DTU.");
      }
    }

    if (iitdRes.rows.length > 0) {
      const iitdId = iitdRes.rows[0].id;
      const iitdName = iitdRes.rows[0].name;

      await pool.query(
        `INSERT INTO presentation_sessions (id, presentation_id, college_id, college_name, session_code, status, active_attendees_count, started_at)
         VALUES ('sess_iitd_1', 'pres_1', $1, $2, 'IITD-TECH', 'ENDED', 112, NOW() - INTERVAL '5 days')
         ON CONFLICT (session_code) DO NOTHING`,
        [iitdId, iitdName]
      );

      const iitdLeadsCount = await pool.query("SELECT COUNT(*) FROM presentation_leads WHERE college_id = $1", [iitdId]);
      if (Number(iitdLeadsCount.rows[0].count) === 0) {
        const iitdLeads = [
          { name: "Siddharth Deshmukh", phone: "9822345601", branch: "Computer Science & Engineering", year: "4th Year", score: 990, rank: 1 },
          { name: "Meera Krishnan", phone: "9822345602", branch: "Artificial Intelligence & Machine Learning", year: "3rd Year", score: 950, rank: 2 },
          { name: "Aditya Joshi", phone: "9822345603", branch: "Electronics & Communication Engineering", year: "3rd Year", score: 900, rank: 3 },
          { name: "Riya Kapoor", phone: "9822345604", branch: "Data Science & Big Data Analytics", year: "2nd Year", score: 850, rank: 4 },
          { name: "Tushar Bansal", phone: "9822345605", branch: "Computer Science & Engineering", year: "3rd Year", score: 810, rank: 5 },
        ];

        for (const l of iitdLeads) {
          await pool.query(
            `INSERT INTO presentation_leads (session_id, college_id, name, phone, branch, year_of_study, total_score, rank)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ["sess_iitd_1", iitdId, l.name, l.phone, l.branch, l.year, l.score, l.rank]
          );

          const userRes = await pool.query(
            `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
             VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
             ON CONFLICT (phone) DO UPDATE SET college_id = $3, college_name = $4, branch = $5
             RETURNING id`,
            [l.phone, l.name, iitdId, iitdName, l.branch]
          );

          if (userRes.rows.length > 0) {
            await pool.query(
              `INSERT INTO enrollments (user_id, pathway_id, status, enrolled_at)
               VALUES ($1, $2, 'ACTIVE', NOW() - INTERVAL '4 days')
               ON CONFLICT DO NOTHING`,
              [userRes.rows[0].id, pwyId1]
            );
          }
        }
        console.log("[DB] Seeded demo leads, users, and enrollments for IIT Delhi.");
      }
    }

    if (nsutRes.rows.length > 0) {
      const nsutId = nsutRes.rows[0].id;
      const nsutName = nsutRes.rows[0].name;

      await pool.query(
        `INSERT INTO presentation_sessions (id, presentation_id, college_id, college_name, session_code, status, active_attendees_count, started_at)
         VALUES ('sess_nsut_1', 'pres_1', $1, $2, 'NSUT-ROAD', 'ENDED', 65, NOW() - INTERVAL '7 days')
         ON CONFLICT (session_code) DO NOTHING`,
        [nsutId, nsutName]
      );

      const nsutLeadsCount = await pool.query("SELECT COUNT(*) FROM presentation_leads WHERE college_id = $1", [nsutId]);
      if (Number(nsutLeadsCount.rows[0].count) === 0) {
        const nsutLeads = [
          { name: "Varun Singhal", phone: "9833456701", branch: "Computer Science & Engineering", year: "3rd Year", score: 940, rank: 1 },
          { name: "Neha Aggarwal", phone: "9833456702", branch: "Information Technology", year: "3rd Year", score: 890, rank: 2 },
          { name: "Abhinav Kaushik", phone: "9833456703", branch: "Electronics & Communication Engineering", year: "2nd Year", score: 820, rank: 3 },
        ];

        for (const l of nsutLeads) {
          await pool.query(
            `INSERT INTO presentation_leads (session_id, college_id, name, phone, branch, year_of_study, total_score, rank)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ["sess_nsut_1", nsutId, l.name, l.phone, l.branch, l.year, l.score, l.rank]
          );

          const userRes = await pool.query(
            `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
             VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
             ON CONFLICT (phone) DO UPDATE SET college_id = $3, college_name = $4, branch = $5
             RETURNING id`,
            [l.phone, l.name, nsutId, nsutName, l.branch]
          );

          if (userRes.rows.length > 0) {
            await pool.query(
              `INSERT INTO enrollments (user_id, pathway_id, status, enrolled_at)
               VALUES ($1, $2, 'ACTIVE', NOW() - INTERVAL '6 days')
               ON CONFLICT DO NOTHING`,
              [userRes.rows[0].id, pwyId2]
            );
          }
        }
        console.log("[DB] Seeded demo leads, users, and enrollments for NSUT.");
      }
    }

    // ============================================================
    // SEED DEPARTMENTS & SOP TEMPLATES & DEMO TASKS
    // ============================================================
    await pool.query(`
      INSERT INTO team_departments (id, name, code, color, description)
      VALUES 
        ('dept_content', 'Curriculum & Content', 'CONTENT', '#6366f1', 'Course syllabus drafting, video lecture recordings, and quizzes.'),
        ('dept_outreach', 'College Outreach & BD', 'OUTREACH', '#06b6d4', 'College partnerships, MoUs, campus leads, and dean communications.'),
        ('dept_tech', 'Tech & Product', 'TECH', '#10b981', 'Admin console, SEO engine, live projector features, and bug fixes.'),
        ('dept_ops', 'Presentation & Operations', 'OPERATIONS', '#f59e0b', 'Live presentation moderation, hardware projector setup, and lead QA.')
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color;
    `);

    await pool.query(`
      INSERT INTO task_templates (id, title, department_id, description, default_checklist, guidelines_url, estimated_hours)
      VALUES 
        ('tmpl_presentation_prep', 'College Presentation & Roadshow Prep', 'dept_ops', 'Standard procedure before hosting a live auditorium session.', 
         '["1. Download approved pitch deck from Canva / Drive", "2. Verify session code & test live QR projector", "3. Configure 3 interactive quiz questions in Live Projector", "4. Run audio & screen mirroring test in auditorium", "5. Assign 2 floor volunteers for student check-ins"]'::jsonb, 
         'https://unisole.app/docs/sop/presentations', 3),

        ('tmpl_module_qc', 'Course Module & Video QC', 'dept_content', 'Quality assurance checklist before publishing any learning module.',
         '["1. Verify video audio clarity & 1080p resolution", "2. Confirm lecture notes & cheat-sheet PDF attached", "3. Add minimum 5 knowledge check questions", "4. Validate prerequisite skill tags", "5. Test playback on mobile viewport"]'::jsonb,
         'https://unisole.app/docs/sop/content-qc', 2),

        ('tmpl_college_onboard', 'College Onboarding & MoU Execution', 'dept_outreach', 'Checklist for onboarding a partner university.',
         '["1. Obtain signed MoU document from college registrar", "2. Collect official list of branch codes & student intake", "3. Seed college record & campus admin credentials", "4. Schedule kickoff auditorium presentation date", "5. Deliver promotional banners & WhatsApp flyers"]'::jsonb,
         'https://unisole.app/docs/sop/college-onboarding', 5),

        ('tmpl_bug_fix', 'Feature Delivery & Bug Resolution', 'dept_tech', 'Engineering QA checklist prior to production deployment.',
         '["1. Reproduce issue on local/staging environment", "2. Implement fix with typescript type compliance", "3. Verify dark/light mode and mobile responsiveness", "4. Test with edge cases and network latency", "5. Verify no regression on existing routes"]'::jsonb,
         'https://unisole.app/docs/sop/tech-qa', 2)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Ensure starter demo tasks exist if table is empty
    const tasksCountRes = await pool.query("SELECT COUNT(*) FROM tasks");
    if (Number(tasksCountRes.rows[0].count) === 0) {
      // Find an admin or first user
      const userAdminRes = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' OR role = 'SUPER_ADMIN' LIMIT 1");
      const adminId = userAdminRes.rows.length > 0 ? userAdminRes.rows[0].id : null;

      await pool.query(`
        INSERT INTO tasks (id, title, description, status, priority, department_id, template_id, due_date, estimated_hours, related_entity_type, related_entity_name)
        VALUES 
          ('task_demo_1', 'Prepare Live Presentation Decks for IIT Delhi Session', 'Review keynote slides, configure auditorium projector polls, and test attendee QR scanner on staging.', 'IN_PROGRESS', 'URGENT', 'dept_ops', 'tmpl_presentation_prep', NOW() + INTERVAL '1 day', 3, 'COLLEGE', 'IIT Delhi'),
          ('task_demo_2', 'Biotech Pathway Module 3 Video QC & Quiz Review', 'Review recorded video lectures for clarity and ensure 5 practice questions are attached.', 'SUBMITTED_FOR_REVIEW', 'HIGH', 'dept_content', 'tmpl_module_qc', NOW() + INTERVAL '2 days', 2, 'PATHWAY', 'Bio-Technology & Health Tech'),
          ('task_demo_3', 'Onboard NSUT Electronics & Communication Branch', 'Upload branch student roster and configure pathway catalog for 2nd and 3rd year students.', 'TODO', 'MEDIUM', 'dept_outreach', 'tmpl_college_onboard', NOW() + INTERVAL '4 days', 5, 'COLLEGE', 'NSUT Delhi'),
          ('task_demo_4', 'Refactor Admin Session Analytics Export & Leaderboard', 'Ensure CSV export is formatted properly and leaderboard points reflect correctly in dark mode.', 'COMPLETED', 'LOW', 'dept_tech', 'tmpl_bug_fix', NOW() - INTERVAL '1 day', 2, 'TECH', 'Session Analytics');
      `);

      await pool.query(`
        INSERT INTO task_subtasks (task_id, title, is_completed, order_index)
        VALUES
          ('task_demo_1', 'Download approved pitch deck from Canva', TRUE, 1),
          ('task_demo_1', 'Verify session code & test live QR projector', TRUE, 2),
          ('task_demo_1', 'Configure 3 interactive quiz questions in Live Projector', FALSE, 3),
          ('task_demo_1', 'Run audio & screen mirroring test in auditorium', FALSE, 4),
          ('task_demo_2', 'Verify video audio clarity & 1080p resolution', TRUE, 1),
          ('task_demo_2', 'Confirm lecture notes PDF attached', TRUE, 2),
          ('task_demo_2', 'Add minimum 5 knowledge check questions', TRUE, 3);
      `);

      console.log("[DB] Seeded starter tasks and subtasks.");
    }

    console.log("[DB] Presentation & Team management schema verified & auto-migrated.");
  } catch (err) {
    console.error("[DB] Error ensuring schema:", err);
  }
}
