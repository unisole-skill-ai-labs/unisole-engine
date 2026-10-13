import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { pool } from "../db";

async function seedCalendarEvents() {
  console.log("=== SEEDING CALENDAR EVENTS FROM DATABASE FOR AI AGENT ENGINEERING ===");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
        course_id VARCHAR(255),
        lesson_id VARCHAR(255),
        mentor_id VARCHAR(255),
        student_id VARCHAR(255),
        meet_url VARCHAR(500),
        color_scheme VARCHAR(50) DEFAULT 'blue',
        created_by VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Clean up previous AI Agent events if any to avoid duplicates
    await client.query(`
      DELETE FROM calendar_events 
      WHERE id LIKE 'ev_agent_%' OR id LIKE 'ev_live_today%' OR id LIKE 'ev_quiz_today%' OR id LIKE 'ev_lecture_today%';
    `);

    const eventsToInsert = [
      // 1. TODAY (Tuesday, 13 Oct 2026) - LIVE LECTURE
      {
        id: "ev_agent_live_today",
        title: "Live Masterclass: Context Engineering & Dynamic Prompt Hydration",
        description: "Interactive live session covering system roles, token limits, dynamic prompt hydration, and live Q&A with Lead AI Architect.",
        eventType: "LIVE_CLASS",
        startTime: "2026-10-13T12:30:00.000Z", // 18:00 IST
        endTime: "2026-10-13T14:00:00.000Z",   // 19:30 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: "les_agent_w2_live",
        meetUrl: "https://meet.google.com/uni-sole-live",
        colorScheme: "blue",
      },
      // 2. TODAY (Tuesday, 13 Oct 2026) - LECTURE TASK
      {
        id: "ev_agent_lecture_today",
        title: "Today's Core Lecture: System Roles & Tokenization in Production Agents",
        description: "Watch video module 2.1 on token limits, message schemas, and role boundaries before the live session.",
        eventType: "GENERAL",
        startTime: "2026-10-13T08:30:00.000Z", // 14:00 IST
        endTime: "2026-10-13T09:30:00.000Z",   // 15:00 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: "les_agent_w2_1",
        meetUrl: null,
        colorScheme: "green",
      },
      // 3. TODAY (Tuesday, 13 Oct 2026) - GRADED QUIZ DEADLINE
      {
        id: "ev_agent_quiz_today",
        title: "Due Tonight: Graded MCQ Quiz - Context Window Architecture",
        description: "3 comprehensive architectural questions on tokenization, role boundaries, and dynamic context hydration.",
        eventType: "MILESTONE",
        startTime: "2026-10-13T17:30:00.000Z", // 23:00 IST
        endTime: "2026-10-13T18:29:59.000Z",   // 23:59 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: "les_agent_w2_quiz",
        meetUrl: null,
        colorScheme: "purple",
      },
      // 4. Wednesday, 14 Oct 2026 - LAB KICKOFF
      {
        id: "ev_agent_lab_kickoff",
        title: "Lab Kickoff: Build a Context-Aware Agent & Context Builder Pipeline",
        description: "Hands-on implementation: Observe how context formatting drastically affects model reasoning.",
        eventType: "DEADLINE",
        startTime: "2026-10-14T09:30:00.000Z", // 15:00 IST
        endTime: "2026-10-14T11:00:00.000Z",   // 16:30 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: "les_agent_w2_lab",
        meetUrl: null,
        colorScheme: "rose",
      },
      // 5. Thursday, 15 Oct 2026 - MENTOR OFFICE HOURS
      {
        id: "ev_agent_mentor_office",
        title: "Live Mentor Office Hours: Debugging Context Injections & Tool Calling",
        description: "Open office hours for hands-on debugging, tool calling errors, and token optimization with Senior Mentor.",
        eventType: "LIVE_CLASS",
        startTime: "2026-10-15T11:30:00.000Z", // 17:00 IST
        endTime: "2026-10-15T13:00:00.000Z",   // 18:30 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: null,
        meetUrl: "https://meet.google.com/uni-sole-mentor",
        colorScheme: "blue",
      },
      // 6. Friday, 16 Oct 2026 - LAB DELIVERABLE SUBMISSION
      {
        id: "ev_agent_lab_due",
        title: "Lab Submission Due: Context Builder Pipeline Deliverable",
        description: "Submit GitHub repo URL with code and architecture notes for mentor evaluation.",
        eventType: "DEADLINE",
        startTime: "2026-10-16T17:30:00.000Z", // 23:00 IST
        endTime: "2026-10-16T18:29:59.000Z",   // 23:59 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: "les_agent_w2_lab",
        meetUrl: null,
        colorScheme: "rose",
      },
      // 7. Saturday, 17 Oct 2026 - WEEK 3 LIVE WORKSHOP
      {
        id: "ev_agent_live_w3",
        title: "Week 3 Live Workshop: Defensive Prompting & Injection Defense",
        description: "Live practical workshop on defending autonomous agents against jailbreaks and prompt leaking.",
        eventType: "LIVE_CLASS",
        startTime: "2026-10-17T12:30:00.000Z", // 18:00 IST
        endTime: "2026-10-17T14:30:00.000Z",   // 20:00 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: "les_agent_w3_live",
        meetUrl: "https://meet.google.com/uni-sole-live",
        colorScheme: "blue",
      },
      // 8. Monday, 19 Oct 2026 - 1-ON-1 VIVA
      {
        id: "ev_agent_viva_1",
        title: "1-on-1 Architecture Viva & Capstone Defense",
        description: "Private viva evaluation with Dr. Rajesh Sharma covering ReAct loops and Context Pipelines.",
        eventType: "VIVA_1ON1",
        startTime: "2026-10-19T05:00:00.000Z", // 10:30 IST
        endTime: "2026-10-19T06:00:00.000Z",   // 11:30 IST
        scope: "GLOBAL",
        courseId: "cs-agentic",
        lessonId: null,
        meetUrl: "https://meet.google.com/uni-sole-viva",
        colorScheme: "amber",
      },
    ];

    for (const ev of eventsToInsert) {
      await client.query(`
        INSERT INTO calendar_events (
          id, title, description, event_type, start_time, end_time, scope, course_id, lesson_id, meet_url, color_scheme, created_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'system_curriculum_seed', NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          event_type = EXCLUDED.event_type,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          scope = EXCLUDED.scope,
          course_id = EXCLUDED.course_id,
          lesson_id = EXCLUDED.lesson_id,
          meet_url = EXCLUDED.meet_url,
          color_scheme = EXCLUDED.color_scheme,
          updated_at = NOW();
      `, [
        ev.id,
        ev.title,
        ev.description,
        ev.eventType,
        ev.startTime,
        ev.endTime,
        ev.scope,
        ev.courseId,
        ev.lessonId,
        ev.meetUrl,
        ev.colorScheme,
      ]);
    }

    await client.query("COMMIT");
    console.log(`Successfully seeded ${eventsToInsert.length} calendar events directly into database!`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Calendar seeding failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedCalendarEvents().catch((err) => {
  console.error(err);
  process.exit(1);
});
