import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { categoriesRouter } from "./routes/categories";
import { coursesRouter } from "./routes/courses";
import { modulesRouter } from "./routes/modules";
import { moduleItemsRouter } from "./routes/moduleItems";
import { assignmentsRouter } from "./routes/assignments";
import { assignmentSubmissionsRouter } from "./routes/assignmentSubmissions";
import { testsRouter } from "./routes/tests";
import { testAttemptsRouter } from "./routes/testAttempts";
import { cartsRouter } from "./routes/carts";
import { couponsRouter } from "./routes/coupons";
import { enrollmentsRouter } from "./routes/enrollments";
import { ordersRouter } from "./routes/orders";
import { orderItemsRouter } from "./routes/orderItems";
import { paymentsRouter } from "./routes/payments";
import { certificatesRouter } from "./routes/certificates";
import { reviewsRouter } from "./routes/reviews";
import { liveRouter } from "./routes/live";
import { liveQuizzesRouter } from "./routes/liveQuizzes";
import { liveQuestionsRouter } from "./routes/liveQuestions";
import { liveSessionsRouter } from "./routes/liveSessions";
import { liveParticipantsRouter } from "./routes/liveParticipants";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { ensureDefaultAdmin } from "./helpers/ensureAdmin";
import { initLiveSocket } from "./sockets/live.socket";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io for Real-Time Polling & Quiz Game Loop
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

initLiveSocket(io);

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Unisole Engine API",
    version: "1.0.0",
    health: "/health",
  });
});
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/module-items", moduleItemsRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/assignment-submissions", assignmentSubmissionsRouter);
app.use("/api/tests", testsRouter);
app.use("/api/test-attempts", testAttemptsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/order-items", orderItemsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/live", liveRouter);
app.use("/api/live-quizzes", liveQuizzesRouter);
app.use("/api/live-questions", liveQuestionsRouter);
app.use("/api/live-sessions", liveSessionsRouter);
app.use("/api/live-participants", liveParticipantsRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3000);
server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  await ensureDefaultAdmin();
});
