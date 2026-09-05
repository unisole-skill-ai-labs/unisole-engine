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
import { iaptRouter } from "./routes/iapt";
import { workshopRouter } from "./routes/workshop";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { setupPresentationSocket } from "./socket/presentation.socket";
import { pool, db } from "./db";
import { initializeDatabase } from "./db/init";
import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";

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
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Route Groups
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/lms", lmsRouter);
app.use("/api/public", publicRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/iapt", iaptRouter);
app.use("/api/v1/iapt", iaptRouter);
app.use("/api/workshop", workshopRouter);
app.use("/api/public/workshop", workshopRouter);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    const res = await pool.query("SELECT 1 as connected");
    if (res.rows?.[0]?.connected) {
      console.log("[BOOTSTRAP] PostgreSQL Database connection established successfully.");
    }

    // 1. Direct Idempotent DDL Execution (Guarantees all tables, sequences, enums, FKs, and columns exist)
    await initializeDatabase();

    // 2. Run Drizzle ORM official migrations
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[BOOTSTRAP] Drizzle migrations applied successfully.");
  } catch (err) {
    console.error("[BOOTSTRAP] Database bootstrap error:", err);
  }


  const PORT = Number(process.env.PORT ?? 3000);
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

bootstrap();
