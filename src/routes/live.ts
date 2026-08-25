import { Router, Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import * as XLSX from "xlsx";
import { db } from "../db";
import { users, liveQuizzes, liveQuestions, liveSessions, liveParticipants } from "../db/schema";
import { generateId } from "../helpers/generateId";
import { asyncHandler } from "../middleware/async-handler";
import { activeRooms } from "../sockets/live.socket";

export const liveRouter: Router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "unisole-super-secret-jwt-key";

// ----------------------------------------------------
// 1. Check if Phone Number exists
// ----------------------------------------------------
liveRouter.post(
  "/check-user",
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .limit(1);

    if (existing.length > 0) {
      res.json({
        exists: true,
        user: {
          id: existing[0].id,
          name: existing[0].name,
          phone: existing[0].phone,
        },
      });
      return;
    }

    res.json({ exists: false });
  })
);

// ----------------------------------------------------
// 2. Student Auth (Name + Phone + Dummy OTP)
// ----------------------------------------------------
liveRouter.post(
  "/auth",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    const trimmedName = name && String(name).trim() ? String(name).trim() : `Learner ${cleanPhone.slice(-4)}`;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .limit(1);

    let userRecord;

    if (existing.length > 0) {
      // Update name if provided
      await db
        .update(users)
        .set({ name: trimmedName, updated_at: new Date() })
        .where(eq(users.id, existing[0].id));

      userRecord = { ...existing[0], name: trimmedName };
    } else {
      const newId = await generateId(users, "users", users.id);
      const [inserted] = await db
        .insert(users)
        .values({
          id: newId,
          name: trimmedName,
          phone: cleanPhone,
          role: "student",
          auth_provider: "phone",
          is_verified: false,
        })
        .returning();
      userRecord = inserted;
    }

    const token = jwt.sign(
      {
        id: userRecord.id,
        phone: userRecord.phone,
        name: userRecord.name,
        role: userRecord.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: userRecord.id,
        name: userRecord.name,
        phone: userRecord.phone,
        role: userRecord.role,
      },
      token,
    });
  })
);

// ----------------------------------------------------
// 3. Quiz Management: List & Create Quizzes
// ----------------------------------------------------
liveRouter.get(
  "/quizzes",
  asyncHandler(async (_req: Request, res: Response) => {
    const allQuizzes = await db.select().from(liveQuizzes).orderBy(desc(liveQuizzes.created_at));

    // Attach question count
    const result = await Promise.all(
      allQuizzes.map(async (quiz) => {
        const qCount = await db
          .select()
          .from(liveQuestions)
          .where(eq(liveQuestions.quiz_id, quiz.id));
        return {
          ...quiz,
          questionCount: qCount.length,
        };
      })
    );

    res.json(result);
  })
);

liveRouter.post(
  "/quizzes",
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, created_by, questions } = req.body;
    if (!title) {
      res.status(400).json({ error: "Quiz title is required" });
      return;
    }

    const quizId = await generateId(liveQuizzes, "liveQuizzes", liveQuizzes.id);
    const [quiz] = await db
      .insert(liveQuizzes)
      .values({
        id: quizId,
        title,
        description: description || "",
        created_by: created_by || null,
      })
      .returning();

    // Insert questions if provided
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qId = await generateId(liveQuestions, "liveQuestions", liveQuestions.id);
        await db.insert(liveQuestions).values({
          id: qId,
          quiz_id: quizId,
          question_order: i + 1,
          question_text: q.question_text || `Question ${i + 1}`,
          image_url: q.image_url || null,
          type: q.type || "mcq",
          time_limit_sec: q.time_limit_sec || 30,
          options: q.options || [],
        });
      }
    }

    res.status(201).json(quiz);
  })
);

liveRouter.get(
  "/quizzes/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const quizRows = await db.select().from(liveQuizzes).where(eq(liveQuizzes.id, id)).limit(1);
    if (quizRows.length === 0) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const questions = await db
      .select()
      .from(liveQuestions)
      .where(eq(liveQuestions.quiz_id, id))
      .orderBy(liveQuestions.question_order);

    res.json({
      ...quizRows[0],
      questions,
    });
  })
);

// ----------------------------------------------------
// 4. Session Management: List & Create
// ----------------------------------------------------
liveRouter.get(
  "/sessions",
  asyncHandler(async (_req: Request, res: Response) => {
    const sessions = await db.select().from(liveSessions).orderBy(desc(liveSessions.created_at));
    res.json(sessions);
  })
);

liveRouter.post(
  "/sessions",
  asyncHandler(async (req: Request, res: Response) => {
    const { quiz_id, host_id, session_name, institute_name } = req.body;
    if (!quiz_id || !session_name || !institute_name) {
      res.status(400).json({ error: "quiz_id, session_name, and institute_name are required" });
      return;
    }

    // Generate unique 6-digit room PIN
    const room_code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = await generateId(liveSessions, "liveSessions", liveSessions.id);

    // Fallback host if none passed
    let effectiveHostId = host_id;
    if (!effectiveHostId) {
      const adminRows = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
      effectiveHostId = adminRows.length > 0 ? adminRows[0].id : "usr_1";
    }

    const [session] = await db
      .insert(liveSessions)
      .values({
        id: sessionId,
        room_code,
        quiz_id,
        host_id: effectiveHostId,
        session_name,
        institute_name,
        status: "lobby",
        total_participants: 0,
      })
      .returning();

    res.status(201).json(session);
  })
);

liveRouter.get(
  "/sessions/:roomCode",
  asyncHandler(async (req: Request, res: Response) => {
    const { roomCode } = req.params;
    const sessionRows = await db.select().from(liveSessions).where(eq(liveSessions.room_code, roomCode)).limit(1);
    if (sessionRows.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const memRoom = activeRooms.get(roomCode);

    res.json({
      ...sessionRows[0],
      activeParticipantCount: memRoom ? memRoom.participants.size : sessionRows[0].total_participants,
      isLocked: memRoom ? memRoom.isLocked : sessionRows[0].status !== "lobby",
    });
  })
);

// ----------------------------------------------------
// 5. Export Workshop Leads to Excel / CSV
// ----------------------------------------------------
liveRouter.get(
  "/export/:sessionId",
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const sessionRows = await db.select().from(liveSessions).where(eq(liveSessions.id, sessionId)).limit(1);
    if (sessionRows.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const session = sessionRows[0];
    const participants = await db
      .select()
      .from(liveParticipants)
      .where(eq(liveParticipants.session_id, sessionId))
      .orderBy(liveParticipants.final_rank);

    // Format data for spreadsheet
    const excelData = participants.map((p) => ({
      Rank: p.final_rank || "—",
      "Student Name": p.name,
      "Mobile Number": p.phone,
      "Total Points": p.total_score,
      "Correct Answers": p.correct_count,
      "Institute / College": session.institute_name,
      "Session Name": session.session_name,
      "Date Attended": p.joined_at ? new Date(p.joined_at).toLocaleDateString() : new Date().toLocaleDateString(),
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    // Write to buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    const safeInstituteName = session.institute_name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Unisole_Live_${safeInstituteName}_${session.room_code}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);
  })
);
