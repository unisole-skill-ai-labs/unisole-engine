import { Server as SocketIOServer, Socket } from "socket.io";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, liveSessions, liveParticipants, liveQuizzes, liveQuestions } from "../db/schema";
import { generateId } from "../helpers/generateId";

export interface LiveQuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface LiveQuestionData {
  id: string;
  question_order: number;
  question_text: string;
  image_url?: string | null;
  type: "mcq" | "true_false";
  time_limit_sec: number;
  options: LiveQuestionOption[];
}

export interface ParticipantState {
  socketId: string;
  userId: string;
  name: string;
  phone: string;
  score: number;
  correctCount: number;
  streak: number;
  answeredCurrentQuestion: boolean;
  currentAnswerOptionId?: string;
  currentAnswerTimeMs?: number;
  pointsEarnedLastRound?: number;
}

export interface LiveRoomState {
  sessionId: string;
  roomCode: string;
  sessionName: string;
  instituteName: string;
  hostSocketId?: string;
  isLocked: boolean;
  status: "LOBBY" | "QUESTION_ACTIVE" | "SHOW_RESULTS" | "LEADERBOARD" | "PODIUM";
  currentQuestionIndex: number;
  questionStartTime: number;
  remainingSeconds: number;
  timerInterval?: NodeJS.Timeout;
  questions: LiveQuestionData[];
  participants: Map<string, ParticipantState>; // key: userId
  voteCounts: Record<string, number>;
}

// In-Memory Active Room Store
export const activeRooms = new Map<string, LiveRoomState>();

export function initLiveSocket(io: SocketIOServer) {
  const liveNamespace = io.of("/live-ws");

  liveNamespace.on("connection", (socket: Socket) => {
    // ----------------------------------------------------
    // 1. Host / Admin Attaches to Room
    // ----------------------------------------------------
    socket.on("admin:attach_room", async (data: { roomCode: string; sessionId?: string }) => {
      const { roomCode } = data;
      if (!roomCode) return;

      let room = activeRooms.get(roomCode);

      // If room not in memory, try loading from DB
      if (!room) {
        const sessionRows = await db
          .select()
          .from(liveSessions)
          .where(eq(liveSessions.room_code, roomCode))
          .limit(1);

        if (sessionRows.length > 0) {
          const sess = sessionRows[0];
          const qRows = await db
            .select()
            .from(liveQuestions)
            .where(eq(liveQuestions.quiz_id, sess.quiz_id))
            .orderBy(liveQuestions.question_order);

          const questions: LiveQuestionData[] = qRows.map((q) => ({
            id: q.id,
            question_order: q.question_order,
            question_text: q.question_text,
            image_url: q.image_url,
            type: q.type as "mcq" | "true_false",
            time_limit_sec: q.time_limit_sec,
            options: (Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)) as LiveQuestionOption[],
          }));

          room = {
            sessionId: sess.id,
            roomCode: sess.room_code,
            sessionName: sess.session_name,
            instituteName: sess.institute_name,
            hostSocketId: socket.id,
            isLocked: sess.status !== "lobby",
            status: "LOBBY",
            currentQuestionIndex: 0,
            questionStartTime: 0,
            remainingSeconds: 30,
            questions,
            participants: new Map(),
            voteCounts: {},
          };
          activeRooms.set(roomCode, room);
        }
      }

      if (!room) {
        socket.emit("error", { message: "Session room not found" });
        return;
      }

      room.hostSocketId = socket.id;
      socket.join(`room:${roomCode}`);
      socket.join(`host:${roomCode}`);

      // Send initial state to host
      socket.emit("admin:attached", {
        roomCode: room.roomCode,
        sessionName: room.sessionName,
        instituteName: room.instituteName,
        status: room.status,
        isLocked: room.isLocked,
        totalQuestions: room.questions.length,
        currentQuestionIndex: room.currentQuestionIndex,
        participantsCount: room.participants.size,
        participantsList: Array.from(room.participants.values()).map((p) => ({
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          score: p.score,
        })),
      });
    });

    // ----------------------------------------------------
    // 2. Student Joins Room
    // ----------------------------------------------------
    socket.on(
      "student:join_room",
      async (data: { roomCode: string; userId: string; name: string; phone: string }) => {
        const { roomCode, userId, name, phone } = data;
        if (!roomCode || !userId) {
          socket.emit("error", { message: "Invalid join payload" });
          return;
        }

        let room = activeRooms.get(roomCode);

        // If room not in memory, check DB
        if (!room) {
          const sessionRows = await db
            .select()
            .from(liveSessions)
            .where(eq(liveSessions.room_code, roomCode))
            .limit(1);

          if (sessionRows.length > 0) {
            const sess = sessionRows[0];
            const qRows = await db
              .select()
              .from(liveQuestions)
              .where(eq(liveQuestions.quiz_id, sess.quiz_id))
              .orderBy(liveQuestions.question_order);

            const questions: LiveQuestionData[] = qRows.map((q) => ({
              id: q.id,
              question_order: q.question_order,
              question_text: q.question_text,
              image_url: q.image_url,
              type: q.type as "mcq" | "true_false",
              time_limit_sec: q.time_limit_sec,
              options: (Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)) as LiveQuestionOption[],
            }));

            room = {
              sessionId: sess.id,
              roomCode: sess.room_code,
              sessionName: sess.session_name,
              instituteName: sess.institute_name,
              isLocked: sess.status !== "lobby",
              status: "LOBBY",
              currentQuestionIndex: 0,
              questionStartTime: 0,
              remainingSeconds: 30,
              questions,
              participants: new Map(),
              voteCounts: {},
            };
            activeRooms.set(roomCode, room);
          }
        }

        if (!room) {
          socket.emit("student:join_error", { message: "Room PIN is invalid or session not found" });
          return;
        }

        if (room.isLocked) {
          socket.emit("student:join_error", { message: "This session is strictly locked. The quiz has already started." });
          return;
        }

        // Add or update participant in memory
        let participant = room.participants.get(userId);
        if (!participant) {
          participant = {
            socketId: socket.id,
            userId,
            name: name || `Student ${phone ? phone.slice(-4) : ""}`,
            phone: phone || "",
            score: 0,
            correctCount: 0,
            streak: 0,
            answeredCurrentQuestion: false,
          };
          room.participants.set(userId, participant);
        } else {
          participant.socketId = socket.id;
          participant.name = name || participant.name;
        }

        socket.join(`room:${roomCode}`);
        socket.join(`user:${userId}`);

        // Acknowledge student
        socket.emit("student:joined", {
          roomCode,
          sessionName: room.sessionName,
          instituteName: room.instituteName,
          status: room.status,
          user: {
            userId: participant.userId,
            name: participant.name,
            phone: participant.phone,
            score: participant.score,
          },
        });

        // Broadcast updated lobby info to everyone (especially admin screen)
        const participantsList = Array.from(room.participants.values()).map((p) => ({
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          score: p.score,
        }));

        liveNamespace.to(`room:${roomCode}`).emit("room:lobby_update", {
          participantCount: room.participants.size,
          participantsList,
        });
      }
    );

    // ----------------------------------------------------
    // 3. Admin Kicks Participant
    // ----------------------------------------------------
    socket.on("admin:kick_participant", async (data: { roomCode: string; targetUserId: string }) => {
      const { roomCode, targetUserId } = data;
      const room = activeRooms.get(roomCode);
      if (!room || !targetUserId) return;

      const target = room.participants.get(targetUserId);
      if (target) {
        // Notify the target student
        liveNamespace.to(`user:${targetUserId}`).emit("student:kicked", {
          message: "You have been removed from this live session by the presenter.",
        });

        // Remove from memory
        room.participants.delete(targetUserId);

        // Delete from database (both live participants and users table if desired)
        try {
          await db.delete(liveParticipants).where(eq(liveParticipants.user_id, targetUserId));
          await db.delete(users).where(eq(users.id, targetUserId));
        } catch (err) {
          console.error("Error deleting kicked user from DB:", err);
        }

        // Broadcast updated lobby list
        const participantsList = Array.from(room.participants.values()).map((p) => ({
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          score: p.score,
        }));

        liveNamespace.to(`room:${roomCode}`).emit("room:lobby_update", {
          participantCount: room.participants.size,
          participantsList,
        });
      }
    });

    // ----------------------------------------------------
    // 4. Admin Starts Game / Quiz
    // ----------------------------------------------------
    socket.on("admin:start_game", async (data: { roomCode: string }) => {
      const { roomCode } = data;
      const room = activeRooms.get(roomCode);
      if (!room || room.questions.length === 0) return;

      room.isLocked = true;
      room.status = "QUESTION_ACTIVE";
      room.currentQuestionIndex = 0;

      // Update database session status
      await db
        .update(liveSessions)
        .set({
          status: "locked_active",
          started_at: new Date(),
          total_participants: room.participants.size,
        })
        .where(eq(liveSessions.room_code, roomCode));

      startQuestionCycle(liveNamespace, room, 0);
    });

    // ----------------------------------------------------
    // 5. Student Submits Answer
    // ----------------------------------------------------
    socket.on(
      "student:submit_answer",
      (data: { roomCode: string; userId: string; optionId: string; responseTimeMs?: number }) => {
        const { roomCode, userId, optionId } = data;
        const room = activeRooms.get(roomCode);
        if (!room || room.status !== "QUESTION_ACTIVE") return;

        const participant = room.participants.get(userId);
        if (!participant || participant.answeredCurrentQuestion) return;

        const currentQ = room.questions[room.currentQuestionIndex];
        if (!currentQ) return;

        const now = Date.now();
        const clientResponseTime = data.responseTimeMs || Math.max(100, now - room.questionStartTime);
        const cappedResponseTime = Math.min(30000, Math.max(100, clientResponseTime));

        participant.answeredCurrentQuestion = true;
        participant.currentAnswerOptionId = optionId;
        participant.currentAnswerTimeMs = cappedResponseTime;

        // Tally in-memory vote
        room.voteCounts[optionId] = (room.voteCounts[optionId] || 0) + 1;

        // Check correctness & calculate points
        const chosenOption = currentQ.options.find((o) => o.id === optionId);
        const isCorrect = !!chosenOption?.is_correct;

        if (isCorrect) {
          // Kahoot speed formula: Points = round((1 - (t / 60000)) * 1000) + streakBonus
          const speedFactor = 1 - cappedResponseTime / (2 * 30000);
          const basePoints = Math.round(speedFactor * 1000);
          const streakBonus = Math.min(150, participant.streak * 50);
          const pointsEarned = Math.max(500, Math.min(1150, basePoints + streakBonus));

          participant.score += pointsEarned;
          participant.correctCount += 1;
          participant.streak += 1;
          participant.pointsEarnedLastRound = pointsEarned;
        } else {
          participant.streak = 0;
          participant.pointsEarnedLastRound = 0;
        }

        // Acknowledge student that answer is locked in
        socket.emit("student:answer_locked", {
          optionId,
          score: participant.score,
        });

        // Broadcast progress to admin
        let answeredCount = 0;
        room.participants.forEach((p) => {
          if (p.answeredCurrentQuestion) answeredCount++;
        });

        liveNamespace.to(`host:${roomCode}`).emit("admin:live_progress", {
          answeredCount,
          totalParticipants: room.participants.size,
        });
      }
    );

    // ----------------------------------------------------
    // 6. Admin Shows Leaderboard
    // ----------------------------------------------------
    socket.on("admin:show_leaderboard", (data: { roomCode: string }) => {
      const { roomCode } = data;
      const room = activeRooms.get(roomCode);
      if (!room) return;

      room.status = "LEADERBOARD";

      const sorted = Array.from(room.participants.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((p, idx) => ({
          rank: idx + 1,
          userId: p.userId,
          name: p.name,
          score: p.score,
          streak: p.streak,
        }));

      liveNamespace.to(`room:${roomCode}`).emit("leaderboard:update", {
        top5: sorted,
      });
    });

    // ----------------------------------------------------
    // 7. Admin Triggers Next Question
    // ----------------------------------------------------
    socket.on("admin:next_question", (data: { roomCode: string }) => {
      const { roomCode } = data;
      const room = activeRooms.get(roomCode);
      if (!room) return;

      const nextIndex = room.currentQuestionIndex + 1;
      if (nextIndex < room.questions.length) {
        startQuestionCycle(liveNamespace, room, nextIndex);
      } else {
        finishGamePodium(liveNamespace, room);
      }
    });

    // ----------------------------------------------------
    // 8. Admin Finishes Game
    // ----------------------------------------------------
    socket.on("admin:finish_game", (data: { roomCode: string }) => {
      const { roomCode } = data;
      const room = activeRooms.get(roomCode);
      if (room) {
        finishGamePodium(liveNamespace, room);
      }
    });
  });
}

// --------------------------------------------------------
// Master Question Cycle Runner (Server-Authoritative 30s)
// --------------------------------------------------------
function startQuestionCycle(liveNamespace: any, room: LiveRoomState, qIndex: number) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }

  room.status = "QUESTION_ACTIVE";
  room.currentQuestionIndex = qIndex;
  room.questionStartTime = Date.now();
  room.remainingSeconds = 30;
  room.voteCounts = {};

  // Reset participant answers for this round
  room.participants.forEach((p) => {
    p.answeredCurrentQuestion = false;
    p.currentAnswerOptionId = undefined;
    p.currentAnswerTimeMs = undefined;
    p.pointsEarnedLastRound = 0;
  });

  const question = room.questions[qIndex];
  if (!question) return;

  // Prepare question payload (hide is_correct to prevent browser inspection cheating)
  const sanitizedOptions = question.options.map((opt) => ({
    id: opt.id,
    text: opt.text,
  }));

  // Broadcast question to both admin and students
  liveNamespace.to(`room:${room.roomCode}`).emit("question:start", {
    qIndex: qIndex + 1,
    totalQuestions: room.questions.length,
    questionId: question.id,
    questionText: question.question_text,
    imageUrl: question.image_url,
    type: question.type,
    timeLimit: 30,
    options: sanitizedOptions,
    serverStartTime: room.questionStartTime,
  });

  // Start 30s server master timer
  room.timerInterval = setInterval(() => {
    room.remainingSeconds -= 1;

    liveNamespace.to(`room:${room.roomCode}`).emit("timer:tick", {
      remainingSeconds: room.remainingSeconds,
    });

    if (room.remainingSeconds <= 0) {
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = undefined;
      }
      endQuestionRound(liveNamespace, room);
    }
  }, 1000);
}

// --------------------------------------------------------
// End Question Round & Broadcast Results
// --------------------------------------------------------
function endQuestionRound(liveNamespace: any, room: LiveRoomState) {
  room.status = "SHOW_RESULTS";

  const currentQ = room.questions[room.currentQuestionIndex];
  const correctOption = currentQ?.options.find((o) => o.is_correct);

  let totalVotes = 0;
  Object.values(room.voteCounts).forEach((v) => (totalVotes += v));

  // 1. Send vote distribution to all (Admin projector displays bar chart & green highlight)
  liveNamespace.to(`room:${room.roomCode}`).emit("question:time_up_results", {
    correctOptionId: correctOption?.id || "",
    voteCounts: room.voteCounts,
    totalVotes,
    totalParticipants: room.participants.size,
  });

  // 2. Send private score update to individual students (does NOT reveal right/wrong)
  room.participants.forEach((participant) => {
    liveNamespace.to(`user:${participant.userId}`).emit("student:round_ended", {
      score: participant.score,
      answered: participant.answeredCurrentQuestion,
    });
  });
}

// --------------------------------------------------------
// Finish Game & Generate Final Podium
// --------------------------------------------------------
async function finishGamePodium(liveNamespace: any, room: LiveRoomState) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }

  room.status = "PODIUM";

  const allSorted = Array.from(room.participants.values()).sort((a, b) => b.score - a.score);

  // Update DB session to finished
  await db
    .update(liveSessions)
    .set({
      status: "finished",
      ended_at: new Date(),
      total_participants: allSorted.length,
    })
    .where(eq(liveSessions.room_code, room.roomCode));

  // Persist all participants and final ranks to live_participants table in DB
  for (let i = 0; i < allSorted.length; i++) {
    const p = allSorted[i];
    const rank = i + 1;
    try {
      const partId = await generateId(liveParticipants, "liveParticipants", liveParticipants.id);
      await db.insert(liveParticipants).values({
        id: partId,
        session_id: room.sessionId,
        user_id: p.userId,
        name: p.name,
        phone: p.phone,
        total_score: p.score,
        correct_count: p.correctCount,
        final_rank: rank,
      });
    } catch (err) {
      console.error("Error saving participant rank to DB:", err);
    }
  }

  const top3 = allSorted.slice(0, 3).map((p, idx) => ({
    rank: idx + 1,
    name: p.name,
    score: p.score,
    correctCount: p.correctCount,
  }));

  // Broadcast final podium
  liveNamespace.to(`room:${room.roomCode}`).emit("game:podium", {
    top3,
    totalParticipants: allSorted.length,
  });

  // Send individual final rank to each student
  allSorted.forEach((p, idx) => {
    liveNamespace.to(`user:${p.userId}`).emit("student:final_rank", {
      rank: idx + 1,
      totalParticipants: allSorted.length,
      score: p.score,
      correctCount: p.correctCount,
    });
  });
}
