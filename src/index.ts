import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { usersRouter } from "./routes/users";
import { categoriesRouter } from "./routes/categories";
import { coursesRouter } from "./routes/courses";
import { modulesRouter } from "./routes/modules";
import { courseModulesRouter } from "./routes/courseModules";
import { moduleLessonsRouter } from "./routes/moduleLessons";
import { moduleItemsRouter } from "./routes/moduleItems";
import { assignmentsRouter } from "./routes/assignments";
import { assignmentSubmissionsRouter } from "./routes/assignmentSubmissions";
import { quizzesRouter } from "./routes/quizzes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/course-modules", courseModulesRouter);
app.use("/api/module-lessons", moduleLessonsRouter);
app.use("/api/module-items", moduleItemsRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/assignment-submissions", assignmentSubmissionsRouter);
app.use("/api/quizzes", quizzesRouter);

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
