import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { lmsRouter } from "./routes/lms";
import { publicRouter } from "./routes/public";
import { webhooksRouter } from "./routes/webhooks";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { setupPresentationSocket } from "./socket/presentation.socket";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Real-time Socket.io Engine
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});
setupPresentationSocket(io);

app.use(cors());
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Unisole Engine API",
    version: "2.0.0",
    health: "/health",
  });
});
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Route Groups
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/lms", lmsRouter);
app.use("/api/public", publicRouter);
app.use("/api/webhooks", webhooksRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3000);
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
