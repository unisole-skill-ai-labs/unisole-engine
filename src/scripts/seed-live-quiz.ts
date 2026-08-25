import dotenv from "dotenv";
import { db } from "../db";
import { users, liveQuizzes, liveQuestions } from "../db/schema";
import { generateId } from "../helpers/generateId";
import { eq } from "drizzle-orm";

dotenv.config();

const sampleQuiz = {
  title: "Fullstack Web & AI Masterclass 2026",
  description: "10-question live interactive quiz for college seminars & workshops",
  questions: [
    {
      question_text: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "O(1)", is_correct: false },
        { id: "opt_2", text: "O(log N)", is_correct: true },
        { id: "opt_3", text: "O(N)", is_correct: false },
        { id: "opt_4", text: "O(N log N)", is_correct: false },
      ],
    },
    {
      question_text: "In React, which hook is used to perform side effects such as data fetching and subscriptions?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "useState", is_correct: false },
        { id: "opt_2", text: "useMemo", is_correct: false },
        { id: "opt_3", text: "useEffect", is_correct: true },
        { id: "opt_4", text: "useReducer", is_correct: false },
      ],
    },
    {
      question_text: "True or False: WebSockets provide full-duplex, bidirectional real-time communication over a single TCP connection.",
      type: "true_false" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "True", is_correct: true },
        { id: "opt_2", text: "False", is_correct: false },
      ],
    },
    {
      question_text: "Which SQL clause is used to filter rows AFTER an aggregation (GROUP BY) has been performed?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "WHERE", is_correct: false },
        { id: "opt_2", text: "ORDER BY", is_correct: false },
        { id: "opt_3", text: "HAVING", is_correct: true },
        { id: "opt_4", text: "FILTER", is_correct: false },
      ],
    },
    {
      question_text: "In Node.js, where does the Event Loop execute I/O callbacks?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "Single Main Thread", is_correct: true },
        { id: "opt_2", text: "Multi-threaded Cluster Pool", is_correct: false },
        { id: "opt_3", text: "GPU Pipeline", is_correct: false },
        { id: "opt_4", text: "Database Engine", is_correct: false },
      ],
    },
    {
      question_text: "True or False: In JavaScript, primitive data types (number, string, boolean) are passed by reference.",
      type: "true_false" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "True", is_correct: false },
        { id: "opt_2", text: "False", is_correct: true },
      ],
    },
    {
      question_text: "What HTTP status code represents '401'?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "Forbidden", is_correct: false },
        { id: "opt_2", text: "Unauthorized", is_correct: true },
        { id: "opt_3", text: "Not Found", is_correct: false },
        { id: "opt_4", text: "Bad Request", is_correct: false },
      ],
    },
    {
      question_text: "Which algorithm is commonly used for finding the shortest path in a graph with non-negative edge weights?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "Dijkstra Algorithm", is_correct: true },
        { id: "opt_2", text: "Kruskal Algorithm", is_correct: false },
        { id: "opt_3", text: "Prim Algorithm", is_correct: false },
        { id: "opt_4", text: "Floyd-Warshall", is_correct: false },
      ],
    },
    {
      question_text: "What does CSS 'flex-grow: 1' do to a flex child element?",
      type: "mcq" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "Locks the element size", is_correct: false },
        { id: "opt_2", text: "Allows the element to expand and take available free space", is_correct: true },
        { id: "opt_3", text: "Shrinks the element to zero", is_correct: false },
        { id: "opt_4", text: "Doubles font size", is_correct: false },
      ],
    },
    {
      question_text: "True or False: PostgreSQL supports JSONB columns with indexing support using GIN indexes.",
      type: "true_false" as const,
      time_limit_sec: 30,
      options: [
        { id: "opt_1", text: "True", is_correct: true },
        { id: "opt_2", text: "False", is_correct: false },
      ],
    },
  ],
};

async function run() {
  console.log("Seeding sample live quiz...");

  const existing = await db
    .select()
    .from(liveQuizzes)
    .where(eq(liveQuizzes.title, sampleQuiz.title))
    .limit(1);

  if (existing.length > 0) {
    console.log("Sample live quiz already exists:", existing[0].id);
    process.exit(0);
  }

  const adminRows = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
  const hostId = adminRows.length > 0 ? adminRows[0].id : null;

  const quizId = await generateId(liveQuizzes, "liveQuizzes", liveQuizzes.id);
  const [quiz] = await db
    .insert(liveQuizzes)
    .values({
      id: quizId,
      title: sampleQuiz.title,
      description: sampleQuiz.description,
      created_by: hostId,
    })
    .returning();

  for (let i = 0; i < sampleQuiz.questions.length; i++) {
    const q = sampleQuiz.questions[i];
    const qId = await generateId(liveQuestions, "liveQuestions", liveQuestions.id);
    await db.insert(liveQuestions).values({
      id: qId,
      quiz_id: quiz.id,
      question_order: i + 1,
      question_text: q.question_text,
      type: q.type,
      time_limit_sec: q.time_limit_sec,
      options: q.options,
    });
  }

  console.log(`Successfully created sample live quiz with 10 questions (ID: ${quiz.id})!`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding live quiz failed:", err);
  process.exit(1);
});
