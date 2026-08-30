import { pool } from "../db.js";
import { UNISOLE_AI_CAMPUS_DECK_SLIDES } from "../data/aiCampusDeck.js";
import { THEOG_COLLEGE_PPT_SLIDES } from "../data/theogDeck.js";

async function execSql(name: string, sql: string, params: any[] = []) {
  try {
    const res = await pool.query(sql, params);
    return res;
  } catch (err: any) {
    console.warn(`[DB Schema] Step '${name}' notice:`, err.message);
    return null;
  }
}

export async function ensureDatabaseSchema() {
  console.log("[DB] Starting schema synchronization & migration...");

  // 1. Critical Enums & Column Alterations (Step-by-step isolated execution)
  await execSql("create enum session_status", `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE "session_status" AS ENUM('DRAFT', 'LIVE', 'PAUSED', 'ENDED');
      END IF;
    END $$;
  `);

  await execSql("create enum task_status", `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE "task_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED');
      END IF;
    END $$;
  `);

  await execSql("create enum task_priority", `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE "task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      END IF;
    END $$;
  `);

  await execSql("create enum task_activity_type", `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_activity_type') THEN
        CREATE TYPE "task_activity_type" AS ENUM('COMMENT', 'STATUS_CHANGE', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'BLOCKED');
      END IF;
    END $$;
  `);

  await execSql("create enum otp_channel", `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'otp_channel') THEN
        CREATE TYPE "otp_channel" AS ENUM('SMS', 'WHATSAPP');
      END IF;
    END $$;
  `);

  await execSql("create enum otp_status", `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'otp_status') THEN
        CREATE TYPE "otp_status" AS ENUM('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');
      END IF;
    END $$;
  `);

  await execSql("alter user_role member", "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MEMBER'");
  await execSql("alter user_role super_admin", "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'");

  // 2. Sequences
  await execSql("seq users", "CREATE SEQUENCE IF NOT EXISTS users_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq otp", "CREATE SEQUENCE IF NOT EXISTS otp_verifications_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq presentations", "CREATE SEQUENCE IF NOT EXISTS presentations_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq sessions", "CREATE SEQUENCE IF NOT EXISTS presentation_sessions_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq leads", "CREATE SEQUENCE IF NOT EXISTS presentation_leads_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq colleges", "CREATE SEQUENCE IF NOT EXISTS colleges_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq branches", "CREATE SEQUENCE IF NOT EXISTS branches_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq dept", "CREATE SEQUENCE IF NOT EXISTS team_departments_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq tasks", "CREATE SEQUENCE IF NOT EXISTS tasks_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq subtasks", "CREATE SEQUENCE IF NOT EXISTS task_subtasks_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq templates", "CREATE SEQUENCE IF NOT EXISTS task_templates_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq comments", "CREATE SEQUENCE IF NOT EXISTS task_comments_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");
  await execSql("seq eod", "CREATE SEQUENCE IF NOT EXISTS daily_eod_logs_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1");

  // 3. Tables
  await execSql("create table users", `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('usr_' || nextval('users_id_seq'::regclass)),
      phone VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(150),
      college_id VARCHAR(50),
      college_name VARCHAR(200),
      branch VARCHAR(100),
      department_id VARCHAR(50),
      designation VARCHAR(150),
      role user_role DEFAULT 'STUDENT' NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("create table otp_verifications", `
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('otp_' || nextval('otp_verifications_id_seq'::regclass)),
      phone VARCHAR(20) NOT NULL,
      otp VARCHAR(20) NOT NULL,
      otp_hash VARCHAR(255),
      channel otp_channel NOT NULL,
      status otp_status DEFAULT 'PENDING' NOT NULL,
      attempts INTEGER DEFAULT 0 NOT NULL,
      max_attempts INTEGER DEFAULT 5 NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  // Ensure Columns Exist on Users & OTP tables even if tables already existed
  await execSql("add users.department_id", "ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id VARCHAR(50)");
  await execSql("add users.designation", "ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(150)");
  await execSql("add users.college_id", "ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
  await execSql("add users.college_name", "ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name VARCHAR(200)");
  await execSql("add users.branch", "ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100)");
  await execSql("add users.signup_source", "ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_source VARCHAR(50) DEFAULT 'NON_PAMPHLET'");
  await execSql("add users.signup_session_code", "ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_session_code VARCHAR(50)");
  await execSql("add users.signup_college_id", "ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_college_id VARCHAR(50)");
  await execSql("add users.signup_college_name", "ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_college_name VARCHAR(200)");
  await execSql("add users.metadata", "ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb");
  await execSql("index users.signup_source", "CREATE INDEX IF NOT EXISTS idx_users_signup_source ON users (signup_source)");
  await execSql("index users.signup_session", "CREATE INDEX IF NOT EXISTS idx_users_signup_session ON users (signup_session_code)");
  await execSql("add otp_verifications.otp", "ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS otp VARCHAR(20)");
  await execSql("alter otp_verifications.otp_hash", "ALTER TABLE otp_verifications ALTER COLUMN otp_hash DROP NOT NULL");

  await execSql("create table colleges", `
    CREATE TABLE IF NOT EXISTS colleges (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('clg_' || nextval('colleges_id_seq'::regclass)),
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      short_name VARCHAR(100),
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("add colleges.short_name", "ALTER TABLE colleges ADD COLUMN IF NOT EXISTS short_name VARCHAR(100)");
  await execSql("add colleges.description", "ALTER TABLE colleges ADD COLUMN IF NOT EXISTS description TEXT");
  await execSql("add colleges.is_active", "ALTER TABLE colleges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL");
  await execSql("set colleges.id default", "ALTER TABLE colleges ALTER COLUMN id SET DEFAULT ('clg_' || nextval('colleges_id_seq'::regclass))");

  await execSql("create table branches", `
    CREATE TABLE IF NOT EXISTS branches (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('brn_' || nextval('branches_id_seq'::regclass)),
      college_id VARCHAR(50) REFERENCES colleges(id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      code VARCHAR(100),
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("add branches.college_id", "ALTER TABLE branches ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
  await execSql("add branches.code", "ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(100)");
  await execSql("add branches.description", "ALTER TABLE branches ADD COLUMN IF NOT EXISTS description TEXT");
  await execSql("add branches.is_active", "ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL");
  await execSql("set branches.id default", "ALTER TABLE branches ALTER COLUMN id SET DEFAULT ('brn_' || nextval('branches_id_seq'::regclass))");
  await execSql("fk branches.college_id", `
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_branches_college'
      ) THEN
        ALTER TABLE branches 
        ADD CONSTRAINT fk_branches_college 
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await execSql("create table presentations", `
    CREATE TABLE IF NOT EXISTS presentations (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('pres_' || nextval('presentations_id_seq'::regclass)),
      college_id VARCHAR(50) REFERENCES colleges(id) ON DELETE CASCADE,
      college_name VARCHAR(200),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      theme VARCHAR(50) DEFAULT 'dark' NOT NULL,
      slides JSONB DEFAULT '[]'::jsonb NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("add presentations.college_id", "ALTER TABLE presentations ADD COLUMN IF NOT EXISTS college_id VARCHAR(50)");
  await execSql("add presentations.college_name", "ALTER TABLE presentations ADD COLUMN IF NOT EXISTS college_name VARCHAR(200)");
  await execSql("fk presentations.college_id", `
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_presentations_college'
      ) THEN
        ALTER TABLE presentations 
        ADD CONSTRAINT fk_presentations_college 
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  // Ensure branches table cascade constraint
  await execSql("fk branches.college_id", `
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_branches_college'
      ) THEN
        ALTER TABLE branches 
        ADD CONSTRAINT fk_branches_college 
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  // Ensure pathway_colleges table cascade constraint
  await execSql("fk pathway_colleges.college_id", `
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_pathway_colleges_college'
      ) THEN
        ALTER TABLE pathway_colleges DROP CONSTRAINT fk_pathway_colleges_college;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'pathway_colleges'
      ) THEN
        ALTER TABLE pathway_colleges 
        ADD CONSTRAINT fk_pathway_colleges_college 
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await execSql("create table presentation_sessions", `
    CREATE TABLE IF NOT EXISTS presentation_sessions (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('sess_' || nextval('presentation_sessions_id_seq'::regclass)),
      presentation_id VARCHAR(50) NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
      college_id VARCHAR(50) NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
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
    )
  `);

  await execSql("create table presentation_leads", `
    CREATE TABLE IF NOT EXISTS presentation_leads (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('lead_' || nextval('presentation_leads_id_seq'::regclass)),
      session_id VARCHAR(50) NOT NULL REFERENCES presentation_sessions(id) ON DELETE CASCADE,
      college_id VARCHAR(50) NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
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
    )
  `);

  await execSql("add presentation_leads.user_id", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS user_id VARCHAR(50)");
  await execSql("add presentation_leads.email", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS email VARCHAR(255)");
  await execSql("add presentation_leads.branch", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS branch VARCHAR(100)");
  await execSql("add presentation_leads.year_of_study", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(50)");
  await execSql("add presentation_leads.total_score", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0");
  await execSql("add presentation_leads.rank", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS rank INTEGER");
  await execSql("add presentation_leads.streak", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0");
  await execSql("add presentation_leads.responses", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '{}'::jsonb");
  await execSql("add presentation_leads.joined_at", "ALTER TABLE presentation_leads ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW()");

  // Ensure cascade constraints for existing sessions and leads
  await execSql("alter fk_sessions_college", `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_college') THEN
        ALTER TABLE presentation_sessions DROP CONSTRAINT fk_sessions_college;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'presentation_sessions') THEN
        ALTER TABLE presentation_sessions 
        ADD CONSTRAINT fk_sessions_college 
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await execSql("alter fk_leads_college", `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_leads_college') THEN
        ALTER TABLE presentation_leads DROP CONSTRAINT fk_leads_college;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'presentation_leads') THEN
        ALTER TABLE presentation_leads 
        ADD CONSTRAINT fk_leads_college 
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await execSql("create table team_departments", `
    CREATE TABLE IF NOT EXISTS team_departments (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('dept_' || nextval('team_departments_id_seq'::regclass)),
      name VARCHAR(150) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      color VARCHAR(30) DEFAULT '#6366f1' NOT NULL,
      description TEXT,
      lead_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("create table task_templates", `
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
    )
  `);

  await execSql("create table tasks", `
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
    )
  `);

  await execSql("create table task_subtasks", `
    CREATE TABLE IF NOT EXISTS task_subtasks (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('sub_' || nextval('task_subtasks_id_seq'::regclass)),
      task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE NOT NULL,
      order_index INTEGER DEFAULT 0 NOT NULL,
      completed_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("create table task_comments", `
    CREATE TABLE IF NOT EXISTS task_comments (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('tcom_' || nextval('task_comments_id_seq'::regclass)),
      task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      activity_type task_activity_type DEFAULT 'COMMENT' NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  await execSql("create table daily_eod_logs", `
    CREATE TABLE IF NOT EXISTS daily_eod_logs (
      id VARCHAR(50) PRIMARY KEY DEFAULT ('eod_' || nextval('daily_eod_logs_id_seq'::regclass)),
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      log_date DATE DEFAULT CURRENT_DATE NOT NULL,
      done_today TEXT NOT NULL,
      plan_tomorrow TEXT NOT NULL,
      blockers TEXT,
      hours_spent INTEGER DEFAULT 8 NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `);

  // ============================================================
  // FOUNDATIONAL SYSTEM DATA (Safe, Idempotent, Non-destructive)
  // ============================================================

  // Ensure default system departments exist without overriding custom changes
  await execSql("seed departments", `
    INSERT INTO team_departments (id, name, code, color, description)
    VALUES 
      ('dept_content', 'Curriculum & Content', 'CONTENT', '#6366f1', 'Course syllabus drafting, video lecture recordings, and quizzes.'),
      ('dept_outreach', 'College Outreach & BD', 'OUTREACH', '#06b6d4', 'College partnerships, MoUs, campus leads, and dean communications.'),
      ('dept_tech', 'Tech & Product', 'TECH', '#10b981', 'Admin console, SEO engine, live projector features, and bug fixes.'),
      ('dept_ops', 'Presentation & Operations', 'OPERATIONS', '#f59e0b', 'Live presentation moderation, hardware projector setup, and lead QA.')
    ON CONFLICT (code) DO NOTHING
  `);

  // Ensure an initial Super Admin exists only if no admin accounts exist
  await execSql("ensure initial super admin", `
    INSERT INTO users (phone, name, role, designation, is_active)
    SELECT '+919876543210', 'Admin', 'SUPER_ADMIN', 'Platform Administrator', TRUE
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN') LIMIT 1)
  `);

  // Seed standard SOP task templates if not already present
  await execSql("seed sop templates", `
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
    ON CONFLICT (id) DO NOTHING
  `);

  // ============================================================
  // SEED INITIAL COLLEGES & DEPARTMENTS & TEAM MEMBERS
  // ============================================================
  await execSql("seed colleges", `
    INSERT INTO colleges (name, slug, short_name, description)
    VALUES 
      ('Govt. Degree College Theog', 'theog-college', 'GC Theog', 'Government Degree College Theog, Shimla, Himachal Pradesh.'),
      ('Indian Institute of Technology Delhi', 'iit-delhi', 'IIT Delhi', 'Premier engineering and research institution located in New Delhi.'),
      ('Netaji Subhas University of Technology', 'nsut-delhi', 'NSUT', 'Top state university known for computing, electronics, and technical innovation.'),
      ('Delhi Technological University', 'dtu-delhi', 'DTU', 'Pioneering technical university with expansive engineering branches.'),
      ('Indraprastha Institute of Information Technology Delhi', 'iiit-delhi', 'IIIT Delhi', 'Excellence in computer science, AI, and information technology.'),
      ('Birla Institute of Technology and Science Pilani', 'bits-pilani', 'BITS Pilani', 'Nationally renowned private technical institute known for meritocracy.')
    ON CONFLICT (slug) DO NOTHING
  `);

  await execSql("seed standard branches for colleges", `
    INSERT INTO branches (college_id, name, code, description, is_active)
    SELECT c.id, d.name, d.code, d.description, TRUE
    FROM colleges c
    CROSS JOIN (
      VALUES 
        ('Computer Science & Engineering', 'CSE', 'Core computing, systems, and software engineering.'),
        ('Information Technology', 'IT', 'Software applications, cloud computing, and networking.'),
        ('Artificial Intelligence & Machine Learning', 'AIML', 'Deep learning, NLP, computer vision, and AI systems.'),
        ('Electronics & Communication Engineering', 'ECE', 'Embedded systems, microcontrollers, and wireless communications.'),
        ('Mechanical Engineering', 'ME', 'Thermodynamics, robotics, and industrial fabrication.'),
        ('Electrical Engineering', 'EE', 'Power systems, smart grids, and renewable energy.'),
        ('Commerce & Business Administration', 'BBA', 'Finance, analytics, marketing, and business systems.'),
        ('Science & Computational Physics', 'BSC', 'Physical modeling, quantitative physics, and computing.')
    ) AS d(name, code, description)
    ON CONFLICT (college_id, name) DO NOTHING
  `);

  // Ensure all presentations have a valid college_id and college_name
  await execSql("backfill presentation college references", `
    UPDATE presentations
    SET 
      college_id = (SELECT id FROM colleges ORDER BY id ASC LIMIT 1),
      college_name = (SELECT name FROM colleges ORDER BY id ASC LIMIT 1)
    WHERE college_id IS NULL
  `);

  // Seed Flagship UNISOLE AI Campus Program Presentation Deck
  try {
    const firstCollegeRes = await pool.query("SELECT id, name FROM colleges ORDER BY id ASC LIMIT 1");
    const defaultCollege = firstCollegeRes.rows[0];

    const presTitle = "UNISOLE AI Campus Program (Animated)";
    const existingPres = await pool.query(
      "SELECT id FROM presentations WHERE title = $1 LIMIT 1",
      [presTitle]
    );

    if (!existingPres.rows || existingPres.rows.length === 0) {
      if (defaultCollege) {
        await pool.query(
          `INSERT INTO presentations (id, college_id, college_name, title, description, theme, slides, is_active)
           VALUES ('pres_ai_campus_flagship', $1, $2, $3, $4, $5, $6, TRUE)
           ON CONFLICT (id) DO UPDATE SET slides = EXCLUDED.slides, title = EXCLUDED.title, college_id = EXCLUDED.college_id, college_name = EXCLUDED.college_name`,
          [
            defaultCollege.id,
            defaultCollege.name,
            presTitle,
            "Interactive 28-slide animated roadshow presentation for college students across Himachal Pradesh with real-time live pulse polls and fast-finger quizzes.",
            "dark",
            JSON.stringify(UNISOLE_AI_CAMPUS_DECK_SLIDES),
          ]
        );
        console.log(`[DB] Seeded flagship presentation: UNISOLE AI Campus Program for ${defaultCollege.name}`);
      }
    } else {
      if (defaultCollege) {
        await pool.query(
          `UPDATE presentations SET slides = $1, college_id = COALESCE(college_id, $2), college_name = COALESCE(college_name, $3) WHERE id = $4`,
          [JSON.stringify(UNISOLE_AI_CAMPUS_DECK_SLIDES), defaultCollege.id, defaultCollege.name, existingPres.rows[0].id]
        );
      }
    }
  } catch (err: any) {
    console.warn("[DB] Could not seed flagship presentation deck:", err.message);
  }

  // Seed Theog College PPT Presentation Deck
  try {
    const theogCollegeRes = await pool.query("SELECT id, name FROM colleges WHERE slug = 'theog-college' OR name ILIKE '%theog%' LIMIT 1");
    const theogCollege = theogCollegeRes.rows[0] || (await pool.query("SELECT id, name FROM colleges ORDER BY id ASC LIMIT 1")).rows[0];

    const theogPresTitle = "Theog College PPT";
    const existingTheogPres = await pool.query(
      "SELECT id FROM presentations WHERE title = $1 OR id = 'pres_theog_college_ppt' LIMIT 1",
      [theogPresTitle]
    );

    if (!existingTheogPres.rows || existingTheogPres.rows.length === 0) {
      if (theogCollege) {
        await pool.query(
          `INSERT INTO presentations (id, college_id, college_name, title, description, theme, slides, is_active)
           VALUES ('pres_theog_college_ppt', $1, $2, $3, $4, $5, $6, TRUE)
           ON CONFLICT (id) DO UPDATE SET slides = EXCLUDED.slides, title = EXCLUDED.title, college_id = EXCLUDED.college_id, college_name = EXCLUDED.college_name`,
          [
            theogCollege.id,
            theogCollege.name,
            theogPresTitle,
            "46-slide college student career awareness + industrial training presentation for Govt. Degree College Theog with 8 interactive live polls, stream-specific roadmaps, and career capital framework.",
            "dark",
            JSON.stringify(THEOG_COLLEGE_PPT_SLIDES),
          ]
        );
        console.log(`[DB] Seeded flagship presentation: Theog College PPT for ${theogCollege.name}`);
      }
    } else {
      if (theogCollege) {
        await pool.query(
          `UPDATE presentations SET slides = $1, title = $2, college_id = COALESCE(college_id, $3), college_name = COALESCE(college_name, $4) WHERE id = $5`,
          [JSON.stringify(THEOG_COLLEGE_PPT_SLIDES), theogPresTitle, theogCollege.id, theogCollege.name, existingTheogPres.rows[0].id]
        );
        console.log(`[DB] Synchronized Theog College PPT deck (${THEOG_COLLEGE_PPT_SLIDES.length} slides) for ${theogCollege.name}`);
      }
    }
  } catch (err: any) {
    console.warn("[DB] Could not seed Theog College PPT deck:", err.message);
  }

  console.log("[DB] Schema synchronization and migrations finished successfully.");
}
