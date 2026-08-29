import { Server as SocketIOServer, Socket } from "socket.io";
import { presentationsRepository } from "../repositories/presentations.repository";

interface Attendee {
  socketId: string;
  leadId: string;
  name: string;
  phone: string;
  totalScore: number;
  streak: number;
  rank?: number;
}

interface SessionState {
  sessionId: string;
  sessionCode: string;
  presentationId: string;
  slides: any[];
  currentSlideIndex: number;
  buildStep?: number;
  attendees: Map<string, Attendee>; // leadId -> Attendee
  socketToLead: Map<string, string>; // socketId -> leadId
  quizState: {
    isQuizActive: boolean;
    isAnswerRevealed: boolean;
    isLeaderboardActive: boolean;
    slideId: string | null;
    slideType: string | null;
    question: string | null;
    startedAt: number | null;
    timeLimit: number;
    pollCounts: Record<number, number>;
    quizAnswers: Map<
      string,
      {
        optionIndex: number;
        isCorrect: boolean;
        responseTimeMs: number;
        pointsEarned: number;
      }
    >;
  };
}

const activeSessions = new Map<string, SessionState>();

export function setupPresentationSocket(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    // ==================== ADMIN / PRESENTER JOIN ====================
    socket.on(
      "admin:join",
      async ({
        sessionCode,
        sessionId,
      }: {
        sessionCode: string;
        sessionId: string;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        socket.join(room);
        socket.join(`${room}:admin`);

        let sessionState = activeSessions.get(code);
        if (!sessionState) {
          const session = await presentationsRepository.getSessionByCode(code);
          const presentation = session
            ? await presentationsRepository.getPresentationById(
                session.presentationId
              )
            : null;

          sessionState = {
            sessionId: session?.id ?? sessionId,
            sessionCode: code,
            presentationId: presentation?.id ?? "",
            slides: (presentation?.slides as any[]) ?? [],
            currentSlideIndex: session?.currentSlideIndex ?? 0,
            buildStep: 0,
            attendees: new Map(),
            socketToLead: new Map(),
            quizState: {
              isQuizActive: session?.isQuizActive ?? false,
              isAnswerRevealed: session?.isAnswerRevealed ?? false,
              isLeaderboardActive: session?.isLeaderboardActive ?? false,
              slideId: null,
              slideType: null,
              question: null,
              startedAt: null,
              timeLimit: 30,
              pollCounts: {},
              quizAnswers: new Map(),
            },
          };
          activeSessions.set(code, sessionState);
        }

        // Send full sync state to admin
        socket.emit("sync_state", {
          currentSlideIndex: sessionState.currentSlideIndex,
          buildStep: sessionState.buildStep ?? 0,
          attendeeCount: sessionState.attendees.size,
          quizState: {
            ...sessionState.quizState,
            quizAnswers: Object.fromEntries(
              sessionState.quizState.quizAnswers.entries()
            ),
          },
          leaderboard: getLeaderboard(sessionState),
        });
      }
    );

    // ==================== AUDIENCE / STUDENT JOIN ====================
    socket.on(
      "audience:join",
      async ({
        sessionCode,
        leadId,
        studentName,
        phone,
      }: {
        sessionCode: string;
        leadId: string;
        studentName: string;
        phone: string;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        socket.join(room);

        let sessionState = activeSessions.get(code);
        if (!sessionState) {
          const session = await presentationsRepository.getSessionByCode(code);
          const presentation = session
            ? await presentationsRepository.getPresentationById(
                session.presentationId
              )
            : null;

          sessionState = {
            sessionId: session?.id ?? "",
            sessionCode: code,
            presentationId: presentation?.id ?? "",
            slides: (presentation?.slides as any[]) ?? [],
            currentSlideIndex: session?.currentSlideIndex ?? 0,
            buildStep: 0,
            attendees: new Map(),
            socketToLead: new Map(),
            quizState: {
              isQuizActive: session?.isQuizActive ?? false,
              isAnswerRevealed: session?.isAnswerRevealed ?? false,
              isLeaderboardActive: session?.isLeaderboardActive ?? false,
              slideId: null,
              slideType: null,
              question: null,
              startedAt: null,
              timeLimit: 30,
              pollCounts: {},
              quizAnswers: new Map(),
            },
          };
          activeSessions.set(code, sessionState);
        }

        // Fetch lead details if existing
        let currentScore = 0;
        let currentStreak = 0;
        const dbLead = await presentationsRepository.getLeadById(leadId);
        if (dbLead) {
          currentScore = dbLead.totalScore ?? 0;
          currentStreak = dbLead.streak ?? 0;
        }

        sessionState.socketToLead.set(socket.id, leadId);
        sessionState.attendees.set(leadId, {
          socketId: socket.id,
          leadId,
          name: studentName,
          phone,
          totalScore: currentScore,
          streak: currentStreak,
        });

        // Update DB attendee count periodically
        presentationsRepository.updateSession(sessionState.sessionId, {
          activeAttendeesCount: sessionState.attendees.size,
        });

        // Broadcast updated attendee count
        io.to(room).emit("attendee_count", {
          count: sessionState.attendees.size,
        });

        // Send current slide & quiz state to joining audience
        const myAnswer = sessionState.quizState.quizAnswers.get(leadId);
        socket.emit("sync_state", {
          currentSlideIndex: sessionState.currentSlideIndex,
          buildStep: sessionState.buildStep ?? 0,
          attendeeCount: sessionState.attendees.size,
          quizState: {
            ...sessionState.quizState,
            myResponse: myAnswer ?? null,
            totalSubmissions: sessionState.quizState.quizAnswers.size,
          },
          myScore: currentScore,
          myRank: getStudentRank(sessionState, leadId),
        });
      }
    );

    // ==================== PRESENTER: SLIDE CHANGE ====================
    socket.on(
      "admin:change_slide",
      async ({
        sessionCode,
        slideIndex,
        buildStep,
      }: {
        sessionCode: string;
        slideIndex: number;
        buildStep?: number;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        const sessionState = activeSessions.get(code);
        if (!sessionState) return;

        const isSlideChanged = sessionState.currentSlideIndex !== slideIndex;
        sessionState.currentSlideIndex = slideIndex;
        sessionState.buildStep = typeof buildStep === "number" ? buildStep : 0;

        if (isSlideChanged) {
          // Reset quiz state on actual slide change
          sessionState.quizState = {
            isQuizActive: false,
            isAnswerRevealed: false,
            isLeaderboardActive: false,
            slideId: null,
            slideType: null,
            question: null,
            startedAt: null,
            timeLimit: 30,
            pollCounts: {},
            quizAnswers: new Map(),
          };

          // Persist slide change
          presentationsRepository.updateSession(sessionState.sessionId, {
            currentSlideIndex: slideIndex,
            isQuizActive: false,
            isAnswerRevealed: false,
            isLeaderboardActive: false,
          });
        }

        io.to(room).emit("slide_updated", {
          slideIndex,
          buildStep: sessionState.buildStep,
          quizState: sessionState.quizState,
        });
      }
    );

    // ==================== PRESENTER: START POLL / QUIZ ====================
    socket.on(
      "admin:start_quiz",
      async ({
        sessionCode,
        slideId,
        slideType,
        timeLimit,
      }: {
        sessionCode: string;
        slideId: string;
        slideType: string;
        timeLimit?: number;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        const sessionState = activeSessions.get(code);
        if (!sessionState) return;

        const duration = timeLimit || 30;
        const now = Date.now();

        sessionState.quizState = {
          isQuizActive: true,
          isAnswerRevealed: false,
          isLeaderboardActive: false,
          slideId,
          slideType,
          question: null,
          startedAt: now,
          timeLimit: duration,
          pollCounts: {},
          quizAnswers: new Map(),
        };

        presentationsRepository.updateSession(sessionState.sessionId, {
          isQuizActive: true,
          isAnswerRevealed: false,
          isLeaderboardActive: false,
          quizStartedAt: new Date(now).toISOString(),
          quizTimeLimit: duration,
        });

        io.to(room).emit("quiz_started", {
          slideId,
          slideType,
          timeLimit: duration,
          startedAt: now,
        });
      }
    );

    // ==================== AUDIENCE: SUBMIT RESPONSE ====================
    socket.on(
      "audience:submit_response",
      async ({
        sessionCode,
        leadId,
        slideId,
        slideType,
        optionIndex,
        isCorrect,
      }: {
        sessionCode: string;
        leadId: string;
        slideId: string;
        slideType: string;
        optionIndex: number;
        isCorrect?: boolean;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        const sessionState = activeSessions.get(code);
        if (!sessionState || !sessionState.quizState.isQuizActive) return;

        // Check if user already submitted for this slide
        if (sessionState.quizState.quizAnswers.has(leadId)) {
          return;
        }

        const now = Date.now();
        const startedAt = sessionState.quizState.startedAt || now;
        const elapsedMs = Math.max(0, now - startedAt);
        const timeLimitMs = sessionState.quizState.timeLimit * 1000;

        let pointsEarned = 0;
        const isAnswerCorrect = Boolean(isCorrect);

        if (slideType === "QUIZ" && isAnswerCorrect) {
          // Kahoot style formula: max 1000 points, min 300 points for correct answer within time limit
          const speedFactor = Math.max(0, (timeLimitMs - elapsedMs) / timeLimitMs);
          pointsEarned = Math.round(500 + speedFactor * 500);
        }

        // Update poll count tally
        sessionState.quizState.pollCounts[optionIndex] =
          (sessionState.quizState.pollCounts[optionIndex] || 0) + 1;

        // Record student submission
        const responseData = {
          optionIndex,
          isCorrect: isAnswerCorrect,
          responseTimeMs: elapsedMs,
          pointsEarned,
        };
        sessionState.quizState.quizAnswers.set(leadId, responseData);

        // Update Attendee cumulative stats
        const attendee = sessionState.attendees.get(leadId);
        if (attendee) {
          attendee.totalScore += pointsEarned;
          if (isAnswerCorrect) {
            attendee.streak += 1;
          } else if (slideType === "QUIZ") {
            attendee.streak = 0;
          }

          // Persist lead response to DB asynchronously
          presentationsRepository.getLeadById(leadId).then((lead) => {
            if (lead) {
              const currentResponses = (lead.responses as any) || {};
              currentResponses[slideId] = responseData;
              presentationsRepository.updateLead(leadId, {
                totalScore: attendee.totalScore,
                streak: attendee.streak,
                responses: currentResponses,
              });
            }
          });
        }

        // Send instant response confirmation back to student socket
        socket.emit("response_confirmed", {
          optionIndex,
          pointsEarned,
          totalScore: attendee?.totalScore ?? 0,
        });

        // Broadcast live submission count and updated poll distribution to Admin & Room
        io.to(room).emit("live_poll_update", {
          totalSubmissions: sessionState.quizState.quizAnswers.size,
          pollCounts: sessionState.quizState.pollCounts,
        });
      }
    );

    // ==================== PRESENTER: REVEAL ANSWER ====================
    socket.on(
      "admin:reveal_answer",
      async ({
        sessionCode,
        correctOptionIndex,
      }: {
        sessionCode: string;
        correctOptionIndex?: number;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        const sessionState = activeSessions.get(code);
        if (!sessionState) return;

        sessionState.quizState.isQuizActive = false;
        sessionState.quizState.isAnswerRevealed = true;

        presentationsRepository.updateSession(sessionState.sessionId, {
          isQuizActive: false,
          isAnswerRevealed: true,
        });

        const leaderboard = getLeaderboard(sessionState);

        io.to(room).emit("answer_revealed", {
          correctOptionIndex,
          pollCounts: sessionState.quizState.pollCounts,
          totalSubmissions: sessionState.quizState.quizAnswers.size,
          leaderboard: leaderboard.slice(0, 10),
        });
      }
    );

    // ==================== PRESENTER: SHOW LEADERBOARD ====================
    socket.on(
      "admin:show_leaderboard",
      async ({ sessionCode }: { sessionCode: string }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        const sessionState = activeSessions.get(code);
        if (!sessionState) return;

        sessionState.quizState.isLeaderboardActive = true;
        presentationsRepository.updateSession(sessionState.sessionId, {
          isLeaderboardActive: true,
        });

        const top10 = getLeaderboard(sessionState).slice(0, 10);
        io.to(room).emit("leaderboard_shown", {
          leaderboard: top10,
        });
      }
    );

    // ==================== AUDIENCE: FLOATING EMOJI REACTIONS ====================
    socket.on(
      "audience:reaction",
      ({
        sessionCode,
        emoji,
      }: {
        sessionCode: string;
        emoji: string;
      }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        io.to(room).emit("reaction_pulse", {
          emoji: emoji || "🔥",
          id: Math.random().toString(36).substring(2, 9),
        });
      }
    );

    // ==================== PRESENTER: END SESSION ====================
    socket.on(
      "admin:end_session",
      async ({ sessionCode }: { sessionCode: string }) => {
        const code = sessionCode.toUpperCase();
        const room = `session:${code}`;
        const sessionState = activeSessions.get(code);
        if (sessionState) {
          presentationsRepository.updateSession(sessionState.sessionId, {
            status: "ENDED",
            endedAt: new Date().toISOString(),
          });
        }

        io.to(room).emit("session_ended", {
          message: "Thank you for attending the Unisole College Roadshow!",
        });
      }
    );

    // ==================== DISCONNECT ====================
    socket.on("disconnect", () => {
      for (const [code, sessionState] of activeSessions.entries()) {
        const leadId = sessionState.socketToLead.get(socket.id);
        if (leadId) {
          sessionState.socketToLead.delete(socket.id);
          sessionState.attendees.delete(leadId);

          const room = `session:${code}`;
          io.to(room).emit("attendee_count", {
            count: sessionState.attendees.size,
          });
          break;
        }
      }
    });
  });
}

function getLeaderboard(sessionState: SessionState) {
  const list = Array.from(sessionState.attendees.values());
  list.sort((a, b) => b.totalScore - a.totalScore);
  return list.map((item, index) => ({
    leadId: item.leadId,
    name: item.name,
    score: item.totalScore,
    streak: item.streak,
    rank: index + 1,
  }));
}

function getStudentRank(
  sessionState: SessionState,
  leadId: string
): { rank: number; totalPlayers: number } {
  const leaderboard = getLeaderboard(sessionState);
  const foundIdx = leaderboard.findIndex((item) => item.leadId === leadId);
  return {
    rank: foundIdx !== -1 ? foundIdx + 1 : leaderboard.length + 1,
    totalPlayers: leaderboard.length,
  };
}
