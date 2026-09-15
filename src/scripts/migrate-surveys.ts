import { pool } from '../db';

async function migrate() {
  console.log('Starting survey tables migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure enum values exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_source') THEN
          CREATE TYPE enrollment_source AS ENUM ('PURCHASE', 'ADMIN_MANUAL', 'CAMPUS_SPONSORED', 'FREE', 'INVITE', 'SURVEY');
        ELSE
          ALTER TYPE enrollment_source ADD VALUE IF NOT EXISTS 'SURVEY';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
          CREATE TYPE lead_source AS ENUM ('PRESENTATION_SESSION', 'COLLEGE_DRIVE', 'PAMPHLET_SCAN', 'PAMPHLET_QR', 'SESSION_QR', 'IAPT', 'AI_WORKSHOP', 'PROFESSOR_NETWORK', 'NON_PAMPHLET', 'ORGANIC', 'DIRECT_WEB', 'WEBSITE_INQUIRY', 'REFERRAL', 'MANUAL_IMPORT', 'OTHER', 'SURVEY');
        ELSE
          ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'SURVEY';
        END IF;
      END$$;
    `);

    // 2. Create surveys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id VARCHAR(50) PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        schema JSONB DEFAULT '{}'::jsonb NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // 3. Create survey_responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id VARCHAR(50) PRIMARY KEY,
        survey_id VARCHAR(50) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
        user_id VARCHAR(50),
        lead_id VARCHAR(50),
        name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        college_name VARCHAR(255),
        college_id VARCHAR(50),
        stream VARCHAR(100),
        year_of_study VARCHAR(50),
        answers JSONB DEFAULT '{}'::jsonb NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // 4. Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(slug);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_lead ON survey_responses(lead_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_phone ON survey_responses(phone);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_college ON survey_responses(college_name);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_stream ON survey_responses(stream);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at DESC);
    `);

    await client.query('COMMIT');
    console.log('✅ Survey tables migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
