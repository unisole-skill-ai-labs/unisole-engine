-- ============================================================
-- EDTECH LMS PLATFORM
-- PostgreSQL: TABLES + SEED DATA
--
-- ID format:
--   users          -> usr_1
--   OTP            -> otp_1
--   colleges       -> clg_1
--   categories     -> cat_1
--   pathways       -> pwy_1
--   courses        -> crs_1
--   modules        -> mod_1
--   lessons        -> les_1
--   enrollments    -> enr_1
--   payments       -> pay_1
--
-- Run this file on a fresh PostgreSQL database.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE pathway_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_channel AS ENUM ('SMS', 'WHATSAPP');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_status AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('DRAFT', 'LIVE', 'PAUSED', 'ENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- ID SEQUENCES
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS users_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS otp_verifications_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS colleges_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS pathways_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS courses_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS modules_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS lessons_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS enrollments_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS payments_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS presentations_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS presentation_sessions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS presentation_leads_id_seq START 1;


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('usr_' || nextval('users_id_seq')),

    phone VARCHAR(20) NOT NULL,
    name VARCHAR(150),

    role user_role NOT NULL DEFAULT 'STUDENT',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_phone UNIQUE (phone)
);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_is_active
    ON users(is_active);


-- ============================================================
-- 2. OTP VERIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS otp_verifications (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('otp_' || nextval('otp_verifications_id_seq')),

    phone VARCHAR(20) NOT NULL,

    otp_hash VARCHAR(255) NOT NULL,

    channel otp_channel NOT NULL,

    status otp_status NOT NULL DEFAULT 'PENDING',

    attempts INTEGER NOT NULL DEFAULT 0,

    max_attempts INTEGER NOT NULL DEFAULT 5,

    expires_at TIMESTAMPTZ NOT NULL,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_otp_attempts
        CHECK (attempts >= 0),

    CONSTRAINT chk_otp_max_attempts
        CHECK (max_attempts > 0)
);

CREATE INDEX IF NOT EXISTS idx_otp_phone
    ON otp_verifications(phone);

CREATE INDEX IF NOT EXISTS idx_otp_status
    ON otp_verifications(status);

CREATE INDEX IF NOT EXISTS idx_otp_expires_at
    ON otp_verifications(expires_at);


-- ============================================================
-- 3. COLLEGES
-- ============================================================

CREATE TABLE IF NOT EXISTS colleges (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('clg_' || nextval('colleges_id_seq')),

    name VARCHAR(200) NOT NULL,

    slug VARCHAR(220) NOT NULL,

    short_name VARCHAR(100),

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_colleges_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_colleges_is_active
    ON colleges(is_active);


-- ============================================================
-- 4. CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('cat_' || nextval('categories_id_seq')),

    name VARCHAR(150) NOT NULL,

    slug VARCHAR(180) NOT NULL,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_categories_name UNIQUE (name),
    CONSTRAINT uq_categories_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_is_active
    ON categories(is_active);


-- ============================================================
-- 5. PATHWAYS
-- ============================================================

CREATE TABLE IF NOT EXISTS pathways (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('pwy_' || nextval('pathways_id_seq')),

    title VARCHAR(250) NOT NULL,

    slug VARCHAR(280) NOT NULL,

    short_description VARCHAR(500),

    description TEXT,

    price_paise BIGINT NOT NULL DEFAULT 0,

    status pathway_status NOT NULL DEFAULT 'DRAFT',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pathways_slug UNIQUE (slug),

    CONSTRAINT chk_pathways_price
        CHECK (price_paise >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pathways_status
    ON pathways(status);

CREATE INDEX IF NOT EXISTS idx_pathways_is_active
    ON pathways(is_active);


-- ============================================================
-- 6. PATHWAY ↔ CATEGORY
-- ============================================================

CREATE TABLE IF NOT EXISTS pathway_categories (
    pathway_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (pathway_id, category_id),

    CONSTRAINT fk_pathway_categories_pathway
        FOREIGN KEY (pathway_id)
        REFERENCES pathways(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pathway_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pathway_categories_category
    ON pathway_categories(category_id);


-- ============================================================
-- 7. PATHWAY ↔ COLLEGE
-- ============================================================

CREATE TABLE IF NOT EXISTS pathway_colleges (
    pathway_id VARCHAR(50) NOT NULL,
    college_id VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (pathway_id, college_id),

    CONSTRAINT fk_pathway_colleges_pathway
        FOREIGN KEY (pathway_id)
        REFERENCES pathways(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pathway_colleges_college
        FOREIGN KEY (college_id)
        REFERENCES colleges(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pathway_colleges_college
    ON pathway_colleges(college_id);


-- ============================================================
-- 8. COURSES
-- ============================================================

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('crs_' || nextval('courses_id_seq')),

    title VARCHAR(250) NOT NULL,

    slug VARCHAR(280) NOT NULL,

    short_description VARCHAR(500),

    description TEXT,

    status content_status NOT NULL DEFAULT 'DRAFT',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_courses_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_courses_status
    ON courses(status);

CREATE INDEX IF NOT EXISTS idx_courses_is_active
    ON courses(is_active);


-- ============================================================
-- 9. PATHWAY ↔ COURSE
-- ============================================================

CREATE TABLE IF NOT EXISTS pathway_courses (
    pathway_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,

    position INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (pathway_id, course_id),

    CONSTRAINT fk_pathway_courses_pathway
        FOREIGN KEY (pathway_id)
        REFERENCES pathways(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pathway_courses_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_pathway_courses_position
        CHECK (position > 0),

    CONSTRAINT uq_pathway_courses_position
        UNIQUE (pathway_id, position)
);

CREATE INDEX IF NOT EXISTS idx_pathway_courses_course
    ON pathway_courses(course_id);


-- ============================================================
-- 10. MODULES
-- ============================================================

CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('mod_' || nextval('modules_id_seq')),

    title VARCHAR(250) NOT NULL,

    slug VARCHAR(280) NOT NULL,

    description TEXT,

    status content_status NOT NULL DEFAULT 'DRAFT',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_modules_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_modules_status
    ON modules(status);

CREATE INDEX IF NOT EXISTS idx_modules_is_active
    ON modules(is_active);


-- ============================================================
-- 11. COURSE ↔ MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS course_modules (
    course_id VARCHAR(50) NOT NULL,
    module_id VARCHAR(50) NOT NULL,

    position INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (course_id, module_id),

    CONSTRAINT fk_course_modules_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_course_modules_module
        FOREIGN KEY (module_id)
        REFERENCES modules(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_course_modules_position
        CHECK (position > 0),

    CONSTRAINT uq_course_modules_position
        UNIQUE (course_id, position)
);

CREATE INDEX IF NOT EXISTS idx_course_modules_module
    ON course_modules(module_id);


-- ============================================================
-- 12. LESSONS
-- ============================================================

CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('les_' || nextval('lessons_id_seq')),

    title VARCHAR(250) NOT NULL,

    slug VARCHAR(280) NOT NULL,

    description TEXT,

    content TEXT,

    video_url TEXT,

    duration_minutes INTEGER,

    status content_status NOT NULL DEFAULT 'DRAFT',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lessons_slug UNIQUE (slug),

    CONSTRAINT chk_lessons_duration
        CHECK (
            duration_minutes IS NULL
            OR duration_minutes >= 0
        )
);

CREATE INDEX IF NOT EXISTS idx_lessons_status
    ON lessons(status);

CREATE INDEX IF NOT EXISTS idx_lessons_is_active
    ON lessons(is_active);


-- ============================================================
-- 13. MODULE ↔ LESSON
-- ============================================================

CREATE TABLE IF NOT EXISTS module_lessons (
    module_id VARCHAR(50) NOT NULL,
    lesson_id VARCHAR(50) NOT NULL,

    position INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (module_id, lesson_id),

    CONSTRAINT fk_module_lessons_module
        FOREIGN KEY (module_id)
        REFERENCES modules(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_module_lessons_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_module_lessons_position
        CHECK (position > 0),

    CONSTRAINT uq_module_lessons_position
        UNIQUE (module_id, position)
);

CREATE INDEX IF NOT EXISTS idx_module_lessons_lesson
    ON module_lessons(lesson_id);


-- ============================================================
-- 14. ENROLLMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('enr_' || nextval('enrollments_id_seq')),

    user_id VARCHAR(50) NOT NULL,

    pathway_id VARCHAR(50) NOT NULL,

    status enrollment_status NOT NULL DEFAULT 'PENDING',

    enrolled_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_enrollments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_enrollments_pathway
        FOREIGN KEY (pathway_id)
        REFERENCES pathways(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user
    ON enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_pathway
    ON enrollments(pathway_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_status
    ON enrollments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_enrollments_pathway_status
    ON enrollments(pathway_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_user_pathway_enrollment
    ON enrollments(user_id, pathway_id)
    WHERE status = 'ACTIVE';


-- ============================================================
-- 15. PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('pay_' || nextval('payments_id_seq')),

    user_id VARCHAR(50) NOT NULL,

    enrollment_id VARCHAR(50),

    pathway_id VARCHAR(50) NOT NULL,

    amount_paise BIGINT NOT NULL,

    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    status payment_status NOT NULL DEFAULT 'CREATED',

    provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',

    provider_order_id VARCHAR(150),

    provider_payment_id VARCHAR(150),

    provider_signature VARCHAR(500),

    failure_reason TEXT,

    paid_at TIMESTAMPTZ,

    refunded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_payments_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_payments_pathway
        FOREIGN KEY (pathway_id)
        REFERENCES pathways(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_payments_amount
        CHECK (amount_paise >= 0),

    CONSTRAINT chk_payments_currency
        CHECK (currency = 'INR')
);

CREATE INDEX IF NOT EXISTS idx_payments_user
    ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_enrollment
    ON payments(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_payments_pathway
    ON payments(pathway_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
    ON payments(status);

CREATE INDEX IF NOT EXISTS idx_payments_provider_order
    ON payments(provider_order_id);

CREATE INDEX IF NOT EXISTS idx_payments_provider_payment
    ON payments(provider_payment_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_order
    ON payments(provider_order_id)
    WHERE provider_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_payment
    ON payments(provider_payment_id)
    WHERE provider_payment_id IS NOT NULL;


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_colleges_updated_at ON colleges;
CREATE TRIGGER trg_colleges_updated_at
BEFORE UPDATE ON colleges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_pathways_updated_at ON pathways;
CREATE TRIGGER trg_pathways_updated_at
BEFORE UPDATE ON pathways
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON courses;
CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_modules_updated_at ON modules;
CREATE TRIGGER trg_modules_updated_at
BEFORE UPDATE ON modules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;
CREATE TRIGGER trg_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON enrollments;
CREATE TRIGGER trg_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 13. PRESENTATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS presentations (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('pres_' || nextval('presentations_id_seq')),

    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(50) DEFAULT 'dark' NOT NULL,
    slides JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_presentations_is_active ON presentations(is_active);

DROP TRIGGER IF EXISTS trg_presentations_updated_at ON presentations;
CREATE TRIGGER trg_presentations_updated_at
BEFORE UPDATE ON presentations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 14. PRESENTATION SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_sessions (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('sess_' || nextval('presentation_sessions_id_seq')),

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

CREATE INDEX IF NOT EXISTS idx_presentation_sessions_code ON presentation_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_status ON presentation_sessions(status);

DROP TRIGGER IF EXISTS trg_presentation_sessions_updated_at ON presentation_sessions;
CREATE TRIGGER trg_presentation_sessions_updated_at
BEFORE UPDATE ON presentation_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 15. PRESENTATION LEADS
-- ============================================================

CREATE TABLE IF NOT EXISTS presentation_leads (
    id VARCHAR(50) PRIMARY KEY
        DEFAULT ('lead_' || nextval('presentation_leads_id_seq')),

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

CREATE INDEX IF NOT EXISTS idx_presentation_leads_session ON presentation_leads(session_id);
CREATE INDEX IF NOT EXISTS idx_presentation_leads_phone ON presentation_leads(phone);
CREATE INDEX IF NOT EXISTS idx_presentation_leads_score ON presentation_leads(total_score DESC NULLS LAST);


-- ============================================================
-- ============================================================
-- SEED DATA
-- ============================================================
-- ============================================================


-- ============================================================
-- 16. SEED CATEGORIES
-- ============================================================

INSERT INTO categories
    (id, name, slug, description, is_active)
VALUES
    ('cat_1', 'Science', 'science',
     'Science and related academic disciplines', TRUE),

    ('cat_2', 'Computer Science / IT', 'computer-science-it',
     'Computer Science, Information Technology and related disciplines', TRUE),

    ('cat_3', 'Business / Commerce / Accounts', 'business-commerce-accounts',
     'Business, Commerce, Accounting and related disciplines', TRUE),

    ('cat_4', 'BA / Humanities', 'ba-humanities',
     'Bachelor of Arts and Humanities disciplines', TRUE),

    ('cat_5', 'Other', 'other',
     'Other academic disciplines', TRUE)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 17. SEED COLLEGES
-- ============================================================

INSERT INTO colleges
    (id, name, slug, short_name, description, is_active)
VALUES
    ('clg_1', 'ABC College', 'abc-college', 'ABC',
     'Partner college for demonstration purposes', TRUE),

    ('clg_2', 'XYZ University', 'xyz-university', 'XYZ',
     'Partner university for demonstration purposes', TRUE),

    ('clg_3', 'Delhi Institute of Technology',
     'delhi-institute-of-technology', 'DIT',
     'Technology-focused partner institution', TRUE)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 18. SEED USERS
-- ============================================================

INSERT INTO users
    (id, phone, name, role, is_active)
VALUES
    ('usr_1', '+919876543210', 'Admin User', 'ADMIN', TRUE),

    ('usr_2', '+919876543211', 'Rahul Sharma', 'STUDENT', TRUE),

    ('usr_3', '+919876543212', 'Priya Verma', 'STUDENT', TRUE),

    ('usr_4', '+919876543213', 'Aman Kumar', 'STUDENT', TRUE)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 19. SEED PATHWAYS
-- ============================================================

INSERT INTO pathways
    (
        id,
        title,
        slug,
        short_description,
        description,
        price_paise,
        status,
        is_active
    )
VALUES
    (
        'pwy_1',
        'Full Stack Developer Pathway',
        'full-stack-developer',
        'Complete pathway for becoming a full stack web developer.',
        'Learn HTML, CSS, JavaScript, React, Node.js and backend development.',
        1500000,
        'PUBLISHED',
        TRUE
    ),

    (
        'pwy_2',
        'Frontend Developer Pathway',
        'frontend-developer',
        'Learn modern frontend web development.',
        'Learn HTML, CSS, JavaScript, React and modern frontend development.',
        1000000,
        'PUBLISHED',
        TRUE
    ),

    (
        'pwy_3',
        'Business Analytics Pathway',
        'business-analytics',
        'Learn analytics skills for modern business environments.',
        'Learn spreadsheets, data analysis, SQL and business analytics.',
        1200000,
        'PUBLISHED',
        TRUE
    )

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 20. SEED COURSES
-- ============================================================

INSERT INTO courses
    (
        id,
        title,
        slug,
        short_description,
        description,
        status,
        is_active
    )
VALUES
    (
        'crs_1',
        'HTML & CSS Fundamentals',
        'html-css-fundamentals',
        'Learn the fundamentals of HTML and CSS.',
        'Build the foundation required for modern web development.',
        'PUBLISHED',
        TRUE
    ),

    (
        'crs_2',
        'JavaScript Fundamentals',
        'javascript-fundamentals',
        'Learn JavaScript from the ground up.',
        'Learn variables, functions, objects, arrays, DOM and modern JavaScript.',
        'PUBLISHED',
        TRUE
    ),

    (
        'crs_3',
        'React Development',
        'react-development',
        'Build modern web applications with React.',
        'Learn React components, state, props, hooks and application architecture.',
        'PUBLISHED',
        TRUE
    ),

    (
        'crs_4',
        'Node.js Backend Development',
        'nodejs-backend-development',
        'Learn backend development using Node.js.',
        'Learn REST APIs, Node.js, Express and backend architecture.',
        'PUBLISHED',
        TRUE
    ),

    (
        'crs_5',
        'Business Analytics Fundamentals',
        'business-analytics-fundamentals',
        'Introduction to business analytics.',
        'Learn basic analytical concepts and tools used in business.',
        'PUBLISHED',
        TRUE
    ),

    (
        'crs_6',
        'SQL for Analytics',
        'sql-for-analytics',
        'Learn SQL for data analysis.',
        'Learn SELECT, filtering, joins, grouping and analytical queries.',
        'PUBLISHED',
        TRUE
    )

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 21. SEED MODULES
-- ============================================================

INSERT INTO modules
    (
        id,
        title,
        slug,
        description,
        status,
        is_active
    )
VALUES
    ('mod_1', 'HTML Basics', 'html-basics',
     'Introduction to HTML and semantic markup.', 'PUBLISHED', TRUE),

    ('mod_2', 'CSS Basics', 'css-basics',
     'Introduction to CSS styling.', 'PUBLISHED', TRUE),

    ('mod_3', 'JavaScript Core', 'javascript-core',
     'Core JavaScript programming concepts.', 'PUBLISHED', TRUE),

    ('mod_4', 'DOM Manipulation', 'dom-manipulation',
     'Learn how JavaScript interacts with the browser DOM.', 'PUBLISHED', TRUE),

    ('mod_5', 'React Fundamentals', 'react-fundamentals',
     'Fundamentals of React development.', 'PUBLISHED', TRUE),

    ('mod_6', 'React Hooks', 'react-hooks',
     'Learn React hooks and state management.', 'PUBLISHED', TRUE),

    ('mod_7', 'Node.js Fundamentals', 'nodejs-fundamentals',
     'Introduction to Node.js backend development.', 'PUBLISHED', TRUE),

    ('mod_8', 'REST API Development', 'rest-api-development',
     'Build REST APIs using Node.js.', 'PUBLISHED', TRUE),

    ('mod_9', 'Analytics Fundamentals', 'analytics-fundamentals',
     'Basic concepts of business analytics.', 'PUBLISHED', TRUE),

    ('mod_10', 'SQL Fundamentals', 'sql-fundamentals',
     'Fundamentals of SQL.', 'PUBLISHED', TRUE)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 22. SEED LESSONS
-- ============================================================

INSERT INTO lessons
    (
        id,
        title,
        slug,
        description,
        content,
        duration_minutes,
        status,
        is_active
    )
VALUES
    ('les_1', 'What is HTML?', 'what-is-html',
     'Introduction to HTML.',
     'HTML is the standard markup language used to structure web pages.',
     15, 'PUBLISHED', TRUE),

    ('les_2', 'HTML Elements', 'html-elements',
     'Learn common HTML elements.',
     'Learn headings, paragraphs, links, images and lists.',
     20, 'PUBLISHED', TRUE),

    ('les_3', 'What is CSS?', 'what-is-css',
     'Introduction to CSS.',
     'CSS is used to style and layout web pages.',
     15, 'PUBLISHED', TRUE),

    ('les_4', 'CSS Selectors', 'css-selectors',
     'Learn how CSS selectors work.',
     'Learn element, class and ID selectors.',
     20, 'PUBLISHED', TRUE),

    ('les_5', 'JavaScript Variables', 'javascript-variables',
     'Learn JavaScript variables.',
     'Learn var, let and const.',
     20, 'PUBLISHED', TRUE),

    ('les_6', 'JavaScript Functions', 'javascript-functions',
     'Learn JavaScript functions.',
     'Learn function declarations, expressions and arrow functions.',
     25, 'PUBLISHED', TRUE),

    ('les_7', 'DOM Introduction', 'dom-introduction',
     'Introduction to the browser DOM.',
     'Understand how JavaScript interacts with HTML.',
     20, 'PUBLISHED', TRUE),

    ('les_8', 'DOM Events', 'dom-events',
     'Learn browser events.',
     'Learn click, input and submit events.',
     25, 'PUBLISHED', TRUE),

    ('les_9', 'React Components', 'react-components',
     'Learn React components.',
     'Understand functional components and component composition.',
     25, 'PUBLISHED', TRUE),

    ('les_10', 'React Props', 'react-props',
     'Learn how props work in React.',
     'Pass data between React components using props.',
     20, 'PUBLISHED', TRUE),

    ('les_11', 'React useState', 'react-usestate',
     'Learn the useState hook.',
     'Manage component state with useState.',
     25, 'PUBLISHED', TRUE),

    ('les_12', 'React useEffect', 'react-useeffect',
     'Learn the useEffect hook.',
     'Handle side effects in React applications.',
     25, 'PUBLISHED', TRUE),

    ('les_13', 'Introduction to Node.js', 'introduction-to-nodejs',
     'Learn what Node.js is.',
     'Understand Node.js and server-side JavaScript.',
     20, 'PUBLISHED', TRUE),

    ('les_14', 'Creating a REST API', 'creating-rest-api',
     'Build your first REST API.',
     'Learn the fundamentals of REST APIs.',
     30, 'PUBLISHED', TRUE),

    ('les_15', 'Analytics Concepts', 'analytics-concepts',
     'Introduction to analytics.',
     'Understand descriptive and diagnostic analytics.',
     20, 'PUBLISHED', TRUE),

    ('les_16', 'SQL SELECT', 'sql-select',
     'Learn SELECT queries.',
     'Retrieve data from relational database tables.',
     20, 'PUBLISHED', TRUE),

    ('les_17', 'SQL Filtering', 'sql-filtering',
     'Learn WHERE filtering.',
     'Filter database results using SQL conditions.',
     20, 'PUBLISHED', TRUE)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 23. SEED PATHWAY ↔ CATEGORY
-- ============================================================

INSERT INTO pathway_categories
    (pathway_id, category_id)
VALUES
    ('pwy_1', 'cat_2'),
    ('pwy_1', 'cat_5'),

    ('pwy_2', 'cat_2'),
    ('pwy_2', 'cat_5'),

    ('pwy_3', 'cat_3'),
    ('pwy_3', 'cat_5')

ON CONFLICT DO NOTHING;


-- ============================================================
-- 24. SEED PATHWAY ↔ COLLEGE
-- ============================================================

INSERT INTO pathway_colleges
    (pathway_id, college_id)
VALUES
    ('pwy_1', 'clg_1'),
    ('pwy_1', 'clg_2'),
    ('pwy_1', 'clg_3'),

    ('pwy_2', 'clg_1'),
    ('pwy_2', 'clg_3'),

    ('pwy_3', 'clg_1'),
    ('pwy_3', 'clg_2')

ON CONFLICT DO NOTHING;


-- ============================================================
-- 25. SEED PATHWAY ↔ COURSE
-- ============================================================

INSERT INTO pathway_courses
    (pathway_id, course_id, position)
VALUES
    ('pwy_1', 'crs_1', 1),
    ('pwy_1', 'crs_2', 2),
    ('pwy_1', 'crs_3', 3),
    ('pwy_1', 'crs_4', 4),

    ('pwy_2', 'crs_1', 1),
    ('pwy_2', 'crs_2', 2),
    ('pwy_2', 'crs_3', 3),

    ('pwy_3', 'crs_5', 1),
    ('pwy_3', 'crs_6', 2)

ON CONFLICT DO NOTHING;


-- ============================================================
-- 26. SEED COURSE ↔ MODULE
-- ============================================================

INSERT INTO course_modules
    (course_id, module_id, position)
VALUES
    ('crs_1', 'mod_1', 1),
    ('crs_1', 'mod_2', 2),

    ('crs_2', 'mod_3', 1),
    ('crs_2', 'mod_4', 2),

    ('crs_3', 'mod_5', 1),
    ('crs_3', 'mod_6', 2),

    ('crs_4', 'mod_7', 1),
    ('crs_4', 'mod_8', 2),

    ('crs_5', 'mod_9', 1),

    ('crs_6', 'mod_10', 1)

ON CONFLICT DO NOTHING;


-- ============================================================
-- 27. SEED MODULE ↔ LESSON
-- ============================================================

INSERT INTO module_lessons
    (module_id, lesson_id, position)
VALUES
    ('mod_1', 'les_1', 1),
    ('mod_1', 'les_2', 2),

    ('mod_2', 'les_3', 1),
    ('mod_2', 'les_4', 2),

    ('mod_3', 'les_5', 1),
    ('mod_3', 'les_6', 2),

    ('mod_4', 'les_7', 1),
    ('mod_4', 'les_8', 2),

    ('mod_5', 'les_9', 1),
    ('mod_5', 'les_10', 2),

    ('mod_6', 'les_11', 1),
    ('mod_6', 'les_12', 2),

    ('mod_7', 'les_13', 1),

    ('mod_8', 'les_14', 1),

    ('mod_9', 'les_15', 1),

    ('mod_10', 'les_16', 1),
    ('mod_10', 'les_17', 2)

ON CONFLICT DO NOTHING;


-- ============================================================
-- 28. SEED ENROLLMENT
-- ============================================================

INSERT INTO enrollments
    (
        id,
        user_id,
        pathway_id,
        status,
        enrolled_at
    )
VALUES
    (
        'enr_1',
        'usr_2',
        'pwy_1',
        'ACTIVE',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 29. SEED PAYMENT
-- ============================================================

INSERT INTO payments
    (
        id,
        user_id,
        enrollment_id,
        pathway_id,
        amount_paise,
        currency,
        status,
        provider,
        provider_order_id,
        provider_payment_id,
        paid_at
    )
VALUES
    (
        'pay_1',
        'usr_2',
        'enr_1',
        'pwy_1',
        1500000,
        'INR',
        'SUCCESS',
        'RAZORPAY',
        'order_seed_fullstack_001',
        'pay_seed_fullstack_001',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 30. SEED OTP
-- ============================================================
-- Placeholder only for local development.
-- Real OTP hashes must be generated by the application.

INSERT INTO otp_verifications
    (
        id,
        phone,
        otp_hash,
        channel,
        status,
        attempts,
        max_attempts,
        expires_at
    )
VALUES
    (
        'otp_1',
        '+919876543211',
        '$2b$10$LOCAL_DEVELOPMENT_ONLY_HASH',
        'SMS',
        'EXPIRED',
        0,
        5,
        NOW() - INTERVAL '10 minutes'
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 31. RESET SEQUENCES AFTER SEEDING
-- ============================================================

SELECT setval(
    'users_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^usr_([0-9]+)$') AS BIGINT))
         FROM users WHERE id ~ '^usr_[0-9]+$'),
        1
    )
);

SELECT setval(
    'otp_verifications_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^otp_([0-9]+)$') AS BIGINT))
         FROM otp_verifications WHERE id ~ '^otp_[0-9]+$'),
        1
    )
);

SELECT setval(
    'colleges_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^clg_([0-9]+)$') AS BIGINT))
         FROM colleges WHERE id ~ '^clg_[0-9]+$'),
        1
    )
);

SELECT setval(
    'categories_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^cat_([0-9]+)$') AS BIGINT))
         FROM categories WHERE id ~ '^cat_[0-9]+$'),
        1
    )
);

SELECT setval(
    'pathways_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^pwy_([0-9]+)$') AS BIGINT))
         FROM pathways WHERE id ~ '^pwy_[0-9]+$'),
        1
    )
);

SELECT setval(
    'courses_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^crs_([0-9]+)$') AS BIGINT))
         FROM courses WHERE id ~ '^crs_[0-9]+$'),
        1
    )
);

SELECT setval(
    'modules_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^mod_([0-9]+)$') AS BIGINT))
         FROM modules WHERE id ~ '^mod_[0-9]+$'),
        1
    )
);

SELECT setval(
    'lessons_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^les_([0-9]+)$') AS BIGINT))
         FROM lessons WHERE id ~ '^les_[0-9]+$'),
        1
    )
);

SELECT setval(
    'enrollments_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^enr_([0-9]+)$') AS BIGINT))
         FROM enrollments WHERE id ~ '^enr_[0-9]+$'),
        1
    )
);

SELECT setval(
    'payments_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^pay_([0-9]+)$') AS BIGINT))
         FROM payments WHERE id ~ '^pay_[0-9]+$'),
        1
    )
);

SELECT setval(
    'presentations_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^pres_([0-9]+)$') AS BIGINT))
         FROM presentations WHERE id ~ '^pres_[0-9]+$'),
        1
    )
);

SELECT setval(
    'presentation_sessions_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^sess_([0-9]+)$') AS BIGINT))
         FROM presentation_sessions WHERE id ~ '^sess_[0-9]+$'),
        1
    )
);

SELECT setval(
    'presentation_leads_id_seq',
    COALESCE(
        (SELECT MAX(CAST(SUBSTRING(id FROM '^lead_([0-9]+)$') AS BIGINT))
         FROM presentation_leads WHERE id ~ '^lead_[0-9]+$'),
        1
    )
);


-- ============================================================
-- 32. VERIFICATION
-- ============================================================

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'otp_verifications', COUNT(*) FROM otp_verifications
UNION ALL
SELECT 'colleges', COUNT(*) FROM colleges
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'pathways', COUNT(*) FROM pathways
UNION ALL
SELECT 'pathway_categories', COUNT(*) FROM pathway_categories
UNION ALL
SELECT 'pathway_colleges', COUNT(*) FROM pathway_colleges
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'pathway_courses', COUNT(*) FROM pathway_courses
UNION ALL
SELECT 'modules', COUNT(*) FROM modules
UNION ALL
SELECT 'course_modules', COUNT(*) FROM course_modules
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'module_lessons', COUNT(*) FROM module_lessons
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'presentations', COUNT(*) FROM presentations
UNION ALL
SELECT 'presentation_sessions', COUNT(*) FROM presentation_sessions
UNION ALL
SELECT 'presentation_leads', COUNT(*) FROM presentation_leads
ORDER BY table_name;


COMMIT;
