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
import { pool } from "./db";

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

async function bootstrap() {
  try {
    const res = await pool.query("SELECT 1 as connected");
    if (res.rows?.[0]?.connected) {
      console.log("[BOOTSTRAP] PostgreSQL Database connection established successfully.");
    }

    // Auto-apply WorkSole schema migration idempotently
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "project_status" AS ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "sub_project_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE SEQUENCE IF NOT EXISTS "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;
      CREATE SEQUENCE IF NOT EXISTS "sub_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;

      CREATE TABLE IF NOT EXISTS "projects" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('proj_'::text || nextval('projects_id_seq'::regclass)) NOT NULL,
        "code" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "department_id" varchar(50),
        "lead_id" varchar(50),
        "created_by_id" varchar(50),
        "status" "project_status" DEFAULT 'ACTIVE' NOT NULL,
        "priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
        "start_date" timestamp with time zone,
        "target_end_date" timestamp with time zone,
        "completed_at" timestamp with time zone,
        "color" varchar(30) DEFAULT '#6366f1' NOT NULL,
        "icon" varchar(50) DEFAULT 'folder' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "projects_code_unique" UNIQUE("code")
      );

      CREATE TABLE IF NOT EXISTS "sub_projects" (
        "id" varchar(50) PRIMARY KEY DEFAULT ('sproj_'::text || nextval('sub_projects_id_seq'::regclass)) NOT NULL,
        "project_id" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "lead_id" varchar(50),
        "status" "sub_project_status" DEFAULT 'TODO' NOT NULL,
        "order_index" integer DEFAULT 0 NOT NULL,
        "start_date" timestamp with time zone,
        "target_end_date" timestamp with time zone,
        "completed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "project_id" varchar(50);
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "sub_project_id" varchar(50);
    `);
    console.log("[BOOTSTRAP] WorkSole tables and sequences verified successfully.");
  } catch (err) {
    console.error("[BOOTSTRAP] Database bootstrap notice:", err);
  }

  const PORT = Number(process.env.PORT ?? 3000);
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

bootstrap();
