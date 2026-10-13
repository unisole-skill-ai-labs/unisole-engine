import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { pool } from "../db";
import crypto from "crypto";

// Exact 12-week curriculum data transcribed from the official syllabus
export const WEEKS_DATA = [
  {
    weekNum: 1,
    title: "Week 1: What is an AI Agent?",
    keyConcepts: "Agent loop, LLM vs Agent, ReAct (Think → Act → Observe), workflow vs agent, agent architectures, when not to use an agent.",
    practical: "Build progressively from a simple LLM app to a tool-using ReAct agent. Mini Project: your first functional AI agent.",
    videoUrl: "https://www.youtube.com/watch?v=sal78ACtGTc",
    questions: [
      {
        id: "q-w1-1",
        question: "What is the primary difference between a static LLM workflow and an autonomous AI Agent?",
        options: [
          "An agent maintains a dynamic control loop (Think → Act → Observe) deciding its own execution path, whereas a workflow follows hardcoded deterministic steps.",
          "An agent requires finetuned weights, while a workflow uses prompt engineering only.",
          "An agent cannot call external tools or APIs.",
          "Workflows are asynchronous, while agents are strictly synchronous."
        ],
        correctOptionIndex: 0,
        explanation: "Agents operate in an autonomous loop where tool outputs feed back into the model to determine the next action dynamically."
      },
      {
        id: "q-w1-2",
        question: "In the ReAct prompting pattern, what sequence does the reasoning cycle follow?",
        options: [
          "Act → Think → Observe",
          "Thought → Action → Observation",
          "Prompt → Cache → Parse",
          "Observe → Evaluate → Deploy"
        ],
        correctOptionIndex: 1,
        explanation: "ReAct interleaves reasoning (Thought) with action execution (Action) and environmental feedback (Observation)."
      },
      {
        id: "q-w1-3",
        question: "When should you NOT use an AI agent architecture?",
        options: [
          "When tasks require 100% deterministic, predictable execution with zero tolerance for hallucinations and simple sequential business logic.",
          "When querying external REST APIs.",
          "When handling multi-turn conversations.",
          "When parsing unstructured JSON responses."
        ],
        correctOptionIndex: 0,
        explanation: "Deterministic, rule-based workflows are vastly more reliable and cheaper than autonomous agents for fixed pipelines."
      }
    ],
    assignmentDeliverable: "Mini Project Deliverable: Implement a functional ReAct loop in Python with Thought/Action/Observation tokens and tool invocation for arithmetic & search.",
    liveDate: "Saturday, 18 Oct 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Lead AI Systems Architect",
    liveTopic: "Live Architectural Workshop: ReAct Agent Loop & Live Q&A"
  },
  {
    weekNum: 2,
    title: "Week 2: Context Engineering I",
    keyConcepts: "Messages, system/user/tool roles, context window, tokenization, prompt architecture, static vs. dynamic context.",
    practical: "Build a context-aware agent and a context builder pipeline; observe how context changes model output.",
    videoUrl: "https://www.youtube.com/watch?v=0kNO_G_xS_0",
    questions: [
      {
        id: "q-w2-1",
        question: "Why is proper role separation (system, user, tool, assistant) critical in agentic context architecture?",
        options: [
          "It prevents prompt injection and helps the LLM distinguish developer instructions from untrusted user/tool inputs.",
          "It reduces tokenization overhead by 80%.",
          "It eliminates the need for attention heads in the Transformer.",
          "It forces the model to respond in JSON format only."
        ],
        correctOptionIndex: 0,
        explanation: "Role boundaries ensure system prompts maintain behavioral control over variable user inputs."
      },
      {
        id: "q-w2-2",
        question: "What is dynamic context injection in production agents?",
        options: [
          "Hardcoding all prompt templates inside the Docker container.",
          "Hydrating the prompt just-in-time with user profiles, tool outputs, and retrieved memory records.",
          "Pre-training the foundation model on customer support transcripts.",
          "Compiling Python code into C extensions."
        ],
        correctOptionIndex: 1,
        explanation: "Dynamic context injects real-time state, session parameters, and retrieved embeddings right before inference."
      },
      {
        id: "q-w2-3",
        question: "How does token truncation affect agent decision-making?",
        options: [
          "It can drop crucial system constraints or recent tool observations, leading to hallucinations or loops.",
          "It automatically speeds up token generation without semantic loss.",
          "It forces the agent to use tool calling.",
          "It has zero impact on modern frontier LLMs."
        ],
        correctOptionIndex: 0,
        explanation: "Losing recent observations or safety rules in a truncated context window impairs agent task completion."
      }
    ],
    assignmentDeliverable: "Context Builder Pipeline Deliverable: Build a dynamic context compilation engine with token budgeting, role encapsulation, and fallback truncation rules.",
    liveDate: "Saturday, 25 Oct 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Lead Prompt & Context Architect",
    liveTopic: "Live Context Engineering Lab: Token Budgeting & Dynamic Assembly"
  },
  {
    weekNum: 3,
    title: "Week 3: Context Engineering II",
    keyConcepts: "Prompt engineering, tool descriptions, prompt injection, defensive prompting, context compression, long conversations.",
    practical: "Project: a production-style customer support agent with business rules and injection defenses — then attack and fix it.",
    videoUrl: "https://www.youtube.com/watch?v=v21tZ9L51jA",
    questions: [
      {
        id: "q-w3-1",
        question: "What is an indirect prompt injection attack on an AI agent?",
        options: [
          "When an attacker embeds adversarial instructions inside an external webpage, PDF, or database record that the agent retrieves and reads via tools.",
          "When an attacker steals the OpenAI API key from client-side JavaScript.",
          "When an attacker floods the server with DDOS requests.",
          "When a developer uses bad Python indentation."
        ],
        correctOptionIndex: 0,
        explanation: "Indirect injection occurs when untrusted retrieved content hijacks the agent's decision logic."
      },
      {
        id: "q-w3-2",
        question: "Which defensive prompting pattern provides the strongest boundary against instruction hijacking?",
        options: [
          "Delimiter encapsulation (e.g. XML tags `<user_data>...</user_data>`) combined with output guardrails and strict system role priority.",
          "Adding 'Please do not hack me' to the prompt footer.",
          "Lowering temperature to exactly 0.0.",
          "Using only regex parsers for the entire pipeline."
        ],
        correctOptionIndex: 0,
        explanation: "Clear semantic delimiters combined with strict instruction prioritization enforce boundary isolation."
      },
      {
        id: "q-w3-3",
        question: "What is context compression in long-running agent threads?",
        options: [
          "Applying semantic summarization or LLM compaction to older messages while retaining key state entities.",
          "Using gzip on the prompt string before passing to the API.",
          "Deleting the system prompt.",
          "Replacing user names with integers."
        ],
        correctOptionIndex: 0,
        explanation: "Compaction and semantic summarization preserve crucial facts without overflowing the token window."
      }
    ],
    assignmentDeliverable: "Defensive Agent Red-Team Project: Deploy a customer support agent, document 3 successful prompt injections, and ship defensive guardrails.",
    liveDate: "Saturday, 1 Nov 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "AI Security & Alignment Lead",
    liveTopic: "Live Red-Teaming Workshop: Prompt Injection Defenses & Guardrails"
  },
  {
    weekNum: 4,
    title: "Week 4: Memory Engineering",
    keyConcepts: "Short-term vs. long-term memory, episodic vs. semantic memory, memory extraction, retrieval, lifecycle, and conflicts.",
    practical: "Build a personal AI assistant with persistent memory across conversations.",
    videoUrl: "https://www.youtube.com/watch?v=zjkBMFhNj_g",
    questions: [
      {
        id: "q-w4-1",
        question: "What differentiates episodic memory from semantic memory in cognitive agent design?",
        options: [
          "Episodic memory stores chronological user interaction experiences, while semantic memory stores generalized facts, preferences, and entity knowledge.",
          "Episodic memory is stored in RAM, while semantic memory is stored on floppy disks.",
          "Semantic memory only supports numbers, while episodic memory supports strings.",
          "There is no functional difference in production AI."
        ],
        correctOptionIndex: 0,
        explanation: "Episodic tracks past conversation events in order; semantic tracks distilled user facts and rules."
      },
      {
        id: "q-w4-2",
        question: "How should an agent handle conflicting memory statements (e.g., 'I live in Delhi' vs later 'I moved to Bangalore')?",
        options: [
          "By utilizing timestamped memory records, entity graph updates, and confidence reconciliation logic to supersede outdated facts.",
          "By deleting all memories permanently.",
          "By crashing the application.",
          "By concatenating both and ignoring discrepancies."
        ],
        correctOptionIndex: 0,
        explanation: "Temporal entity reconciliation ensures recent facts supersede expired historical preferences."
      },
      {
        id: "q-w4-3",
        question: "What is memory extraction pipeline in background agent processes?",
        options: [
          "An asynchronous job that parses user conversation turns to extract structured knowledge tuples (subject-predicate-object) into a store.",
          "A tool that reads operating system RAM directly.",
          "A GPU hardware accelerator driver.",
          "A prompt asking the user to retype their profile every message."
        ],
        correctOptionIndex: 0,
        explanation: "Asynchronous memory extraction condenses conversations into persistent structured knowledge."
      }
    ],
    assignmentDeliverable: "Persistent Assistant Deliverable: Build a personal assistant using SQLite/Postgres for persistent semantic memory with memory extraction.",
    liveDate: "Saturday, 8 Nov 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Agent Memory Systems Lead",
    liveTopic: "Live Memory Architecture Workshop: Entity Graphs & Vector Recall"
  },
  {
    weekNum: 5,
    title: "Week 5: RAG Engineering",
    keyConcepts: "Chunking, embeddings, vector databases, hybrid search, reranking, metadata filtering, retrieval failure modes.",
    practical: "Build a full retrieval-augmented generation pipeline and compare chunking and retrieval strategies.",
    videoUrl: "https://www.youtube.com/watch?v=2TJxpyO3ei4",
    questions: [
      {
        id: "q-w5-1",
        question: "Why does hybrid search (BM25 lexical + dense vector embeddings) outperform vector-only search?",
        options: [
          "It captures exact keyword/part-number matches via sparse indexing while retaining conceptual semantic similarity through dense embeddings.",
          "It cuts search latency by 90%.",
          "It eliminates the need for vector databases.",
          "It translates documents into SQL queries automatically."
        ],
        correctOptionIndex: 0,
        explanation: "Dense vectors miss exact acronyms and ID codes; BM25 catches exact matches, providing maximum recall."
      },
      {
        id: "q-w5-2",
        question: "What is the primary function of a cross-encoder Reranker in production RAG?",
        options: [
          "To re-evaluate top-K candidate chunks using joint query-document attention, producing accurate relevance scores before LLM ingestion.",
          "To generate images from text chunks.",
          "To compress text files into ZIP archives.",
          "To convert Markdown into HTML."
        ],
        correctOptionIndex: 0,
        explanation: "Cross-encoder rerankers jointly score query-chunk pairs, weeding out irrelevant vector neighbors."
      },
      {
        id: "q-w5-3",
        question: "Which chunking strategy is best for structured Markdown technical manuals?",
        options: [
          "Hierarchical heading-aware semantic chunking with overlapping child-parent document linkages.",
          "Fixed 50-character character slices.",
          "Chunking strictly every 10 lines of code.",
          "No chunking—feed the 500-page PDF directly into the prompt."
        ],
        correctOptionIndex: 0,
        explanation: "Heading-aware chunking preserves table and subsection context, maintaining semantic integrity."
      }
    ],
    assignmentDeliverable: "Production RAG Pipeline Deliverable: Build a multi-stage RAG engine with recursive chunking, hybrid search (Qdrant/Chroma), and Cohere/BGE reranker.",
    liveDate: "Saturday, 15 Nov 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Principal RAG Architect",
    liveTopic: "Live RAG Optimization Lab: Hybrid Search & Cross-Encoder Reranking"
  },
  {
    weekNum: 6,
    title: "Week 6: Tool Engineering",
    keyConcepts: "Tool schemas, function calling, tool selection and reliability, error handling, permissions, and security.",
    practical: "Build multiple tools (search, calculator, database, API) and a tool-using research agent.",
    videoUrl: "https://www.youtube.com/watch?v=I9r4gR17y5k",
    questions: [
      {
        id: "q-w6-1",
        question: "How should an agent handle a tool execution exception (e.g. 500 Internal Server Error or JSON parse failure)?",
        options: [
          "Return the error description formatted cleanly back into the agent observation loop so the LLM can self-correct or try an alternative approach.",
          "Crash the entire backend server immediately.",
          "Silently return an empty string and pretend it worked.",
          "Delete the agent container."
        ],
        correctOptionIndex: 0,
        explanation: "Observing error responses allows the LLM to inspect parameter mistakes and retry."
      },
      {
        id: "q-w6-2",
        question: "Why is Pydantic/JSONSchema validation essential for LLM tool function calling?",
        options: [
          "It enforces strict typing on LLM-generated arguments before code execution, preventing crashes and injection attacks.",
          "It speeds up GPU compilation.",
          "It automatically runs database migrations.",
          "It eliminates the need for unit tests."
        ],
        correctOptionIndex: 0,
        explanation: "Pydantic ensures parameters match required types, validating ranges and enums."
      },
      {
        id: "q-w6-3",
        question: "What is Principle of Least Privilege in tool security?",
        options: [
          "Granting tools read-only permissions by default and requiring explicit human-in-the-loop approvals for mutating or financial actions.",
          "Giving every tool full root access to the host machine.",
          "Writing tools without authentication headers.",
          "Allowing anyone to execute shell commands directly."
        ],
        correctOptionIndex: 0,
        explanation: "Least privilege and human confirmation guard against unintended side effects."
      }
    ],
    assignmentDeliverable: "Multi-Tool Research Agent Deliverable: Build an agent equipped with 4 validated tools (DuckDuckGo Search, Calculator, SQL Query, Weather API).",
    liveDate: "Saturday, 22 Nov 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Director of Tooling & Automation",
    liveTopic: "Live Tool Engineering Lab: Schema Validation & Defensive Execution"
  },
  {
    weekNum: 7,
    title: "Week 7: MCP & Production Tooling",
    keyConcepts: "MCP concepts, servers and clients, resources, authentication, permissions, and tool discovery.",
    practical: "Connect and register multiple MCP tools with permission controls. Milestone: a personal AI work agent.",
    videoUrl: "https://www.youtube.com/watch?v=SDeQzB_7XvU",
    questions: [
      {
        id: "q-w7-1",
        question: "What core problem does the Model Context Protocol (MCP) solve for AI engineering?",
        options: [
          "It establishes an open standard protocol for AI models to connect securely to external data sources, tools, and developer environments.",
          "It replaces the Transformer architecture with LSTM networks.",
          "It provides free unlimited GPU compute.",
          "It translates TypeScript into COBOL."
        ],
        correctOptionIndex: 0,
        explanation: "MCP standardizes client-server integrations across tools, databases, and IDEs."
      },
      {
        id: "q-w7-2",
        question: "In an MCP architecture, what is the role of an MCP Server?",
        options: [
          "It exposes standardized resources, prompts, and tools over stdio or SSE transport to consuming AI clients.",
          "It trains foundation model weights from scratch.",
          "It hosts vector embeddings exclusively on AWS.",
          "It generates random numbers for simulations."
        ],
        correctOptionIndex: 0,
        explanation: "MCP servers expose capability contracts (tools, resources) to client hosts."
      },
      {
        id: "q-w7-3",
        question: "How does MCP Tool Discovery work dynamically?",
        options: [
          "The client queries the server's `tools/list` endpoint at runtime, receiving JSON schemas that are injected into the agent context.",
          "Developers must hardcode Python functions manually in every script.",
          "The server reads client source code files.",
          "Tools are compiled directly into the LLM weights."
        ],
        correctOptionIndex: 0,
        explanation: "Runtime discovery retrieves schemas dynamically, decoupling server tools from client agents."
      }
    ],
    assignmentDeliverable: "Milestone Deliverable: Personal AI Work Agent connected to custom MCP server with dynamic tool discovery and permission gates.",
    liveDate: "Saturday, 29 Nov 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Lead MCP Integration Architect",
    liveTopic: "Live MCP Implementation Workshop: Building Custom Servers & Clients"
  },
  {
    weekNum: 8,
    title: "Week 8: Coding Agents",
    keyConcepts: "Coding agent architecture, repository understanding, code generation, sandboxing, testing, and the agentic coding loop.",
    practical: "Project: a coding agent that inspects a real repository, edits files, runs tests, and fixes errors.",
    videoUrl: "https://www.youtube.com/watch?v=y14T45XQh_g",
    questions: [
      {
        id: "q-w8-1",
        question: "What is the agentic coding loop?",
        options: [
          "Read files → Plan changes → Edit file chunks → Execute tests/linters → Parse test failures → Self-correct until tests pass.",
          "Write code once and immediately commit without testing.",
          "Generate comments only without modifying code.",
          "Convert Python code to bytecode manually."
        ],
        correctOptionIndex: 0,
        explanation: "The coding loop uses automated execution feedback (test errors, linter output) to iterate to a fix."
      },
      {
        id: "q-w8-2",
        question: "Why is execution sandboxing (Docker / Firecracker microVMs) non-negotiable for coding agents?",
        options: [
          "Because agents execute arbitrary shell commands and Python code that could corrupt host files, open backdoors, or consume unbounded compute.",
          "Because Docker makes code run 10x faster.",
          "Because git requires Docker containers.",
          "Because Python cannot run on bare metal."
        ],
        correctOptionIndex: 0,
        explanation: "Sandboxing isolates untrusted generated code, protecting host infrastructure."
      },
      {
        id: "q-w8-3",
        question: "Which file editing pattern is most token-efficient and resilient for coding agents?",
        options: [
          "Targeted block diff replacement (search-and-replace chunks) rather than rewriting whole 2000-line files on every change.",
          "Regenerating the entire repository from scratch.",
          "Appending code to the bottom of the file only.",
          "Using base64 encoded strings."
        ],
        correctOptionIndex: 0,
        explanation: "Chunk-based search-and-replace saves tokens and avoids dropping existing code."
      }
    ],
    assignmentDeliverable: "Coding Agent Project: Deploy an autonomous coding agent with sandboxed Docker runner, test runner loop, and diff-patching capabilities.",
    liveDate: "Saturday, 6 Dec 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Staff Developer Tools Engineer",
    liveTopic: "Live Coding Agent Lab: Sandboxed Execution & Automated Test Repair"
  },
  {
    weekNum: 9,
    title: "Week 9: Async, Event-Driven & Computer Use",
    keyConcepts: "Synchronous vs. asynchronous agents, event-driven architecture, human-in-the-loop, browser automation basics.",
    practical: "Build an event-driven agent triggered by an incoming event, plus a controlled browser-automation mini-lab.",
    videoUrl: "https://www.youtube.com/watch?v=N43pW_cM7OQ",
    questions: [
      {
        id: "q-w9-1",
        question: "What is an event-driven agent architecture in production?",
        options: [
          "An agent that wakes up upon message queue events (Kafka/RabbitMQ/Webhooks), executes a task asynchronously, and publishes results or requests human review.",
          "An agent that only runs when a user keeps their browser tab open.",
          "A command-line script that runs an infinite `while True: sleep(1)` loop.",
          "A static HTML webpage with JavaScript alerts."
        ],
        correctOptionIndex: 0,
        explanation: "Event-driven agents react to real-time webhook streams and queue messages asynchronously."
      },
      {
        id: "q-w9-2",
        question: "How does Computer Use / Browser Automation work in modern agent models?",
        options: [
          "The model consumes screenshots/accessibility trees, plans mouse coordinates and keystrokes, and executes browser interactions via Playwright/CDP.",
          "The model downloads the website source code and rewrites it in C++.",
          "The model bypasses all security certificates automatically.",
          "The model guesses what the website looks like without vision."
        ],
        correctOptionIndex: 0,
        explanation: "Vision-enabled models inspect DOM trees and coordinate clicks/keystrokes via Playwright."
      },
      {
        id: "q-w9-3",
        question: "Why is Human-in-the-Loop (HITL) mandatory for high-consequence agent actions?",
        options: [
          "To provide human verification for irreversible decisions (e.g. wire transfers, database drops, sending emails to customers).",
          "Because LLMs cannot run without a person typing on the keyboard.",
          "To slow down the agent intentionally.",
          "Because cloud providers require human signatures."
        ],
        correctOptionIndex: 0,
        explanation: "HITL pauses state machines at checkpoint thresholds until authorized by a human supervisor."
      }
    ],
    assignmentDeliverable: "Event-Driven & Browser Lab Deliverable: Build a webhook-triggered research agent that navigates a live website via Playwright and extracts data.",
    liveDate: "Saturday, 13 Dec 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Head of Autonomous Automation",
    liveTopic: "Live Event-Driven Agent Lab: Webhooks, Queues & Playwright Automation"
  },
  {
    weekNum: 10,
    title: "Week 10: Agent Evaluation",
    keyConcepts: "Why demos aren't evaluation, benchmarks, trajectory evaluation, LLM-as-judge, reliability, latency, cost, safety.",
    practical: "Build an evaluation framework for your own agent and use it to find and log failure patterns.",
    videoUrl: "https://www.youtube.com/watch?v=F_fP_k_1Q_0",
    questions: [
      {
        id: "q-w10-1",
        question: "Why are single-turn happy path demos insufficient for proving agent production readiness?",
        options: [
          "Because agent reliability drops exponentially over multi-step trajectories due to compounded tool errors, edge cases, and stochastic drift.",
          "Because demos do not have colorful UI themes.",
          "Because benchmarks only evaluate spelling.",
          "Because single turns take too long to run."
        ],
        correctOptionIndex: 0,
        explanation: "A 95% step success rate over 10 steps yields only ~59% total trajectory success."
      },
      {
        id: "q-w10-2",
        question: "What is Trajectory Evaluation in agent testing?",
        options: [
          "Scoring not just the final output, but each intermediate step: tool choice accuracy, parameter correctness, latency, and token waste.",
          "Measuring the physical speed of the computer hard drive.",
          "Checking the git commit history of the developer.",
          "Testing only the first prompt in the conversation."
        ],
        correctOptionIndex: 0,
        explanation: "Trajectory eval inspects the full chain of decisions, revealing looping and sub-optimal tool calls."
      },
      {
        id: "q-w10-3",
        question: "How does LLM-as-a-Judge work reliably in automated evaluation pipelines?",
        options: [
          "By using a frontier model with explicit scoring rubrics, few-shot examples, pairwise comparison, and structured chain-of-thought rationale.",
          "By asking the same model if its own answer was good.",
          "By checking if the output contains the letter 'A'.",
          "By comparing character counts."
        ],
        correctOptionIndex: 0,
        explanation: "Strict rubrics, chain-of-thought, and few-shot examples minimize judge model bias."
      }
    ],
    assignmentDeliverable: "Agent Eval Suite Deliverable: Build an evaluation harness testing 20 golden trajectories with LLM-as-a-judge rubrics, latency & cost logging.",
    liveDate: "Saturday, 20 Dec 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Lead AI Quality & Benchmarks Engineer",
    liveTopic: "Live Agent Evaluation Masterclass: Trajectory Logging & LLM Judges"
  },
  {
    weekNum: 11,
    title: "Week 11: Agent Improvement",
    keyConcepts: "When to improve the prompt, context, tools, or the model itself; version comparison; continuous evolution loop.",
    practical: "Take your Week 10 agent, diagnose failures, and ship an Improved Version 2 — then compare results.",
    videoUrl: "https://www.youtube.com/watch?v=U0kQvK78G4M",
    questions: [
      {
        id: "q-w11-1",
        question: "When should you improve tool definitions rather than prompt instructions?",
        options: [
          "When evaluation logs show the agent frequently hallucinates parameters, picks the wrong tool, or misinterprets argument types.",
          "When you want to change the color scheme of the web app.",
          "When the LLM API is down.",
          "Never—prompts are the only thing that matters."
        ],
        correctOptionIndex: 0,
        explanation: "Clear docstrings, schema parameter descriptions, and return type guidance drastically reduce tool calling errors."
      },
      {
        id: "q-w11-2",
        question: "What is an Agent Continuous Evolution Loop?",
        options: [
          "Logging production failure traces → Clustering error modes → Adding regression test cases → Improving prompts/tools → Re-running eval benchmark.",
          "Restarting the computer server every 24 hours.",
          "Buying a newer laptop for the developer.",
          "Rewriting the whole codebase from scratch every month."
        ],
        correctOptionIndex: 0,
        explanation: "Continuous evals turn production anomalies into automated regression test cases."
      },
      {
        id: "q-w11-3",
        question: "Why should you run side-by-side A/B evaluation before deploying prompt changes to production agents?",
        options: [
          "Because fixing one failure mode in a prompt often unintentionally regresses performance on three other task types.",
          "Because A/B testing reduces cloud server costs by 50%.",
          "Because prompt changes always succeed without side effects.",
          "Because git branching requires A/B testing."
        ],
        correctOptionIndex: 0,
        explanation: "Prompts have complex non-linear effects; regression testing guards against unintended behavioral regressions."
      }
    ],
    assignmentDeliverable: "Version 2 Improvement Deliverable: Diagnose Week 10 failure patterns, deploy Version 2 with refined tools/prompts, and prove benchmark uplift.",
    liveDate: "Saturday, 27 Dec 2026",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "VP of AI Systems Architecture",
    liveTopic: "Live Continuous Improvement Lab: Diagnosing Failure Clusters & V2 Uplift"
  },
  {
    weekNum: 12,
    title: "Week 12: Multi-Agent Systems & Capstone",
    keyConcepts: "Manager-worker and peer-to-peer patterns, shared vs. independent context, delegation, coordination, failure handling.",
    practical: "Capstone: a multi-agent research system (manager, researcher, analyst, critic, synthesizer) — presented and defended.",
    videoUrl: "https://www.youtube.com/watch?v=Kz6o4qZ4f3Y",
    questions: [
      {
        id: "q-w12-1",
        question: "What is the primary benefit of the Manager-Worker (Hierarchical) multi-agent architecture?",
        options: [
          "The manager decomposes a complex objective into bounded subtasks, delegating to specialized worker agents with isolated, clean contexts.",
          "It uses only 1 token per query.",
          "All worker agents share the exact same prompt string.",
          "It eliminates the need for tool execution."
        ],
        correctOptionIndex: 0,
        explanation: "Context isolation per specialized worker prevents prompt bloat and cognitive overload."
      },
      {
        id: "q-w12-2",
        question: "How should worker agents share state without polluting each other's context windows?",
        options: [
          "Through a centralized state graph (e.g. LangGraph state / blackboard pattern) where agents read and write specific typed keys only.",
          "By passing the full 100,000-token conversation history to every single worker.",
          "By writing code in Microsoft Word documents.",
          "By using global mutable Python variables across threads."
        ],
        correctOptionIndex: 0,
        explanation: "Typed state graphs isolate worker reasoning while maintaining a unified schema."
      },
      {
        id: "q-w12-3",
        question: "In a production multi-agent system, what role does a Critic/Reflector agent play?",
        options: [
          "It reviews the output generated by worker agents against explicit quality rubrics and rejects sub-par outputs, triggering targeted rework.",
          "It criticizes the user for asking questions.",
          "It cancels the subscription if the query is too hard.",
          "It converts the output into emojis."
        ],
        correctOptionIndex: 0,
        explanation: "Critic/Reflector agents verify quality and contract adherence before returning final deliverables."
      }
    ],
    assignmentDeliverable: "Capstone Project Deliverable: Deploy full multi-agent research system (Manager, Researcher, Analyst, Critic, Synthesizer) with defense report.",
    liveDate: "Saturday, 3 Jan 2027",
    liveTime: "6:00 PM - 8:00 PM IST",
    mentorName: "Chief AI Officer & Capstone Panel",
    liveTopic: "Capstone Defense & Live Venture Presentation Before Industry Panel"
  }
];

export async function seedAiAgentCurriculum() {
  console.log("[Seed:AI-Agent] Starting official 12-week AI Agent Engineering curriculum database sync...");

  // 0. PURGE ALL OTHER COURSES & PATHWAYS FROM DB
  try {
    console.log("[Seed:AI-Agent] Purging non-AI-Agent courses and pathways from DB...");
    // Explicitly delete any dummy modules (such as "Intro to AI Agents") and non-standard curriculum
    await pool.query(`DELETE FROM course_modules WHERE module_id IN (SELECT id FROM modules WHERE title ILIKE '%Intro to AI%' OR (title NOT LIKE 'Week %' AND slug NOT LIKE 'cs-agentic-week-%'))`);
    await pool.query(`DELETE FROM module_lessons WHERE module_id IN (SELECT id FROM modules WHERE title ILIKE '%Intro to AI%' OR (title NOT LIKE 'Week %' AND slug NOT LIKE 'cs-agentic-week-%'))`);
    await pool.query(`DELETE FROM modules WHERE title ILIKE '%Intro to AI%' OR (title NOT LIKE 'Week %' AND slug NOT LIKE 'cs-agentic-week-%')`);

    await pool.query(`DELETE FROM pathway_categories WHERE pathway_id NOT IN ('cs-agentic', 'course1')`);
    await pool.query(`DELETE FROM pathway_colleges WHERE pathway_id NOT IN ('cs-agentic', 'course1')`);
    await pool.query(`DELETE FROM pathway_courses WHERE pathway_id NOT IN ('cs-agentic', 'course1') AND course_id NOT IN ('cs-agentic', 'course1')`);
    await pool.query(`DELETE FROM course_modules WHERE course_id NOT IN ('cs-agentic', 'course1')`);
    await pool.query(`DELETE FROM module_lessons WHERE lesson_id NOT LIKE 'les_agent_%'`);
    await pool.query(`DELETE FROM lessons WHERE id NOT LIKE 'les_agent_%'`);
    await pool.query(`DELETE FROM modules WHERE course_id NOT IN ('cs-agentic', 'course1') AND course_id IS NOT NULL`);
    await pool.query(`DELETE FROM enrollments WHERE pathway_id NOT IN ('cs-agentic', 'course1') AND item_id NOT IN ('cs-agentic', 'course1')`);
    await pool.query(`DELETE FROM courses WHERE id NOT IN ('cs-agentic', 'course1') AND slug NOT IN ('cs-agentic', 'course1')`);
    await pool.query(`DELETE FROM pathways WHERE id NOT IN ('cs-agentic', 'course1') AND slug NOT IN ('cs-agentic', 'course1')`);
    console.log("[Seed:AI-Agent] Successfully purged non-AI-Agent courses and legacy content.");
  } catch (cleanErr) {
    console.warn("[Seed:AI-Agent] Notice during cleanup of legacy courses:", cleanErr);
  }

  // 1. Upsert Pathway entries: 'cs-agentic' and 'course1'
  const pathwayEntries = [
    {
      id: "cs-agentic",
      title: "AI Agent Engineering",
      slug: "cs-agentic",
      shortDescription: "12-Week AI Agent Engineering Certificate Program (Weeks 1 - 12)",
      description: "From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.",
      pricePaise: 299900
    },
    {
      id: "course1",
      title: "AI Agent Engineering",
      slug: "course1",
      shortDescription: "12-Week AI Agent Engineering Certificate Program (Weeks 1 - 12)",
      description: "From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.",
      pricePaise: 299900
    }
  ];

  for (const pwy of pathwayEntries) {
    await pool.query(
      `INSERT INTO pathways (id, title, slug, short_description, description, price_paise, status, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', TRUE, NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           short_description = EXCLUDED.short_description,
           description = EXCLUDED.description,
           price_paise = EXCLUDED.price_paise,
           status = 'PUBLISHED',
           is_active = TRUE,
           updated_at = NOW()`,
      [pwy.id, pwy.title, pwy.slug, pwy.shortDescription, pwy.description, pwy.pricePaise]
    );
  }
  console.log("[Seed:AI-Agent] Upserted pathways 'cs-agentic' and 'course1'.");

  // 2. Ensure Course entry in 'courses' table
  // Look up existing course by slug or create a new UUID
  let courseId: string;
  const existingCourse = await pool.query(
    `SELECT id FROM courses WHERE slug = 'cs-agentic' OR slug = 'course1' OR title = 'AI Agent Engineering' LIMIT 1`
  );

  if (existingCourse.rows && existingCourse.rows[0]) {
    courseId = existingCourse.rows[0].id;
    await pool.query(
      `UPDATE courses 
       SET title = 'AI Agent Engineering',
           slug = 'cs-agentic',
           short_description = '12-Week AI Agent Engineering Certificate Program (Weeks 1 - 12)',
           description = 'From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.',
           status = 'PUBLISHED',
           is_active = TRUE,
           price_paise = 299900,
           mrp_paise = 999900,
           metadata = '{"duration": "12 Weeks (132 Hours)", "level": "Production AI Agent Engineering", "group": "group-1"}'::jsonb,
           updated_at = NOW()
       WHERE id = $1`,
      [courseId]
    );
  } else {
    courseId = "cs-agentic";
    await pool.query(
      `INSERT INTO courses (id, title, slug, short_description, description, status, is_active, price_paise, mrp_paise, metadata, created_at, updated_at)
       VALUES ($1, 'AI Agent Engineering', 'cs-agentic', '12-Week AI Agent Engineering Certificate Program (Weeks 1 - 12)', 'From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.', 'PUBLISHED', TRUE, 299900, 999900, '{"duration": "12 Weeks (132 Hours)", "level": "Production AI Agent Engineering", "group": "group-1"}'::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title, slug = EXCLUDED.slug, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
      [courseId]
    );
  }
  console.log(`[Seed:AI-Agent] Using course ID: ${courseId}`);

  // Link pathway_courses
  await pool.query(
    `INSERT INTO pathway_courses (pathway_id, course_id, position, created_at)
     VALUES ('cs-agentic', $1, 1, NOW())
     ON CONFLICT DO NOTHING`,
    [courseId]
  );
  await pool.query(
    `INSERT INTO pathway_courses (pathway_id, course_id, position, created_at)
     VALUES ('course1', $1, 1, NOW())
     ON CONFLICT DO NOTHING`,
    [courseId]
  );

  // 3. For each week, create/update Module and 4 Lessons
  for (const week of WEEKS_DATA) {
    const modSlug = `cs-agentic-week-${week.weekNum}`;
    
    // Check or insert module
    let moduleId: string;
    const existingMod = await pool.query(
      `SELECT id FROM modules WHERE course_id = $1 AND order_index = $2 LIMIT 1`,
      [courseId, week.weekNum]
    );

    if (existingMod.rows && existingMod.rows[0]) {
      moduleId = existingMod.rows[0].id;
      await pool.query(
        `UPDATE modules 
         SET title = $1, slug = $2, description = $3, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()
         WHERE id = $4`,
        [week.title, modSlug, week.keyConcepts, moduleId]
      );
    } else {
      moduleId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO modules (id, course_id, title, slug, description, order_index, status, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', TRUE, NOW(), NOW())`,
        [moduleId, courseId, week.title, modSlug, week.keyConcepts, week.weekNum]
      );
    }

    // Link in course_modules for all course aliases
    const targetCourseIds = Array.from(new Set([courseId, "cs-agentic", "course1"]));
    for (const cId of targetCourseIds) {
      await pool.query(
        `INSERT INTO course_modules (course_id, module_id, position, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (course_id, module_id) DO UPDATE SET position = EXCLUDED.position`,
        [cId, moduleId, week.weekNum]
      );
    }

    // 4 Lessons per week:
    // 1. Lecture Video
    const lecId = `les_agent_w${week.weekNum}_lec`;
    const lecContent = JSON.stringify({
      category: "LECTURE",
      type: "video",
      contentType: "VIDEO",
      curriculumMode: "LECTURE",
      duration: "45 Mins",
      videoUrl: week.videoUrl,
      keyConcepts: week.keyConcepts,
      handsOn: week.practical
    });

    await pool.query(
      `INSERT INTO lessons (id, title, slug, description, content, video_url, duration_minutes, status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 45, 'PUBLISHED', TRUE, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, content = EXCLUDED.content, video_url = EXCLUDED.video_url, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
      [lecId, `${week.weekNum}.1 Concept Lecture: ${week.title.replace(/^Week \d+:\s*/, "")}`, `agent-w${week.weekNum}-lecture`, week.keyConcepts, lecContent, week.videoUrl]
    );

    // 2. Question Quiz (MCQ)
    const quizId = `les_agent_w${week.weekNum}_quiz`;
    const quizContent = JSON.stringify({
      category: "PRACTICE",
      type: "quiz",
      contentType: "QUIZ",
      curriculumMode: "PRACTICE",
      practiceType: "MCQ",
      duration: "20 Mins",
      questions: week.questions
    });

    await pool.query(
      `INSERT INTO lessons (id, title, slug, description, content, video_url, duration_minutes, status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NULL, 20, 'PUBLISHED', TRUE, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, content = EXCLUDED.content, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
      [quizId, `${week.weekNum}.2 Knowledge Check: MCQ Quiz (${week.questions.length} Questions)`, `agent-w${week.weekNum}-quiz`, `Test your understanding of ${week.title}.`, quizContent]
    );

    // 3. Hands-on Practical Assignment
    const labId = `les_agent_w${week.weekNum}_lab`;
    const labContent = JSON.stringify({
      category: "TEST",
      type: "assignment",
      contentType: "ASSIGNMENT",
      curriculumMode: "TEST",
      testType: "PROJECT",
      duration: "90 Mins",
      maxScore: 100,
      instructions: week.assignmentDeliverable,
      practical: week.practical
    });

    await pool.query(
      `INSERT INTO lessons (id, title, slug, description, content, video_url, duration_minutes, status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NULL, 90, 'PUBLISHED', TRUE, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, content = EXCLUDED.content, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
      [labId, `${week.weekNum}.3 Hands-on Practical: ${week.practical.split(".")[0]}`, `agent-w${week.weekNum}-lab`, week.assignmentDeliverable, labContent]
    );

    // 4. Live Interactive Session
    const liveId = `les_agent_w${week.weekNum}_live`;
    const liveContent = JSON.stringify({
      category: "LIVE",
      type: "live",
      contentType: "LIVE",
      curriculumMode: "LIVE",
      duration: "120 Mins",
      liveDate: week.liveDate,
      liveTime: week.liveTime,
      mentorName: week.mentorName,
      liveMeetingUrl: "https://meet.google.com/new",
      instructions: `Agenda for ${week.liveTopic}:\n• 45 Mins: Architecture Deep-dive & Code Walkthrough\n• 45 Mins: Hands-on Lab Implementation\n• 30 Mins: Live Open Q&A & Code Reviews with ${week.mentorName}.`
    });

    await pool.query(
      `INSERT INTO lessons (id, title, slug, description, content, video_url, duration_minutes, status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NULL, 120, 'PUBLISHED', TRUE, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, content = EXCLUDED.content, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
      [liveId, `${week.weekNum}.4 ${week.liveTopic}`, `agent-w${week.weekNum}-live`, `Interactive live cohort workshop on ${week.liveDate} at ${week.liveTime}.`, liveContent]
    );

    // Link lessons to module in module_lessons
    const lessonLinks = [
      { id: lecId, pos: 1 },
      { id: quizId, pos: 2 },
      { id: labId, pos: 3 },
      { id: liveId, pos: 4 },
    ];

    for (const lLink of lessonLinks) {
      const existingML = await pool.query(
        `SELECT id FROM module_lessons WHERE module_id = $1 AND lesson_id = $2 LIMIT 1`,
        [moduleId, lLink.id]
      );
      if (existingML.rows && existingML.rows[0]) {
        await pool.query(
          `UPDATE module_lessons SET position = $1 WHERE id = $2`,
          [lLink.pos, existingML.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO module_lessons (id, module_id, lesson_id, position, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [crypto.randomUUID(), moduleId, lLink.id, lLink.pos]
        );
      }
    }
  }

  // 4. Ensure ALL users in DB have active enrollment for cs-agentic and course1
  try {
    const allUsers = await pool.query(`SELECT id FROM users`);
    for (const u of allUsers.rows) {
      for (const pwyId of ["cs-agentic", "course1"]) {
        const enrId = "enr_" + crypto.createHash("md5").update(`${u.id}_${pwyId}`).digest("hex");
        await pool.query(
          `INSERT INTO enrollments (id, user_id, pathway_id, item_type, item_id, status, source, enrolled_at)
           VALUES ($1, $2, $3, 'PATHWAY', $3, 'ACTIVE', 'CAMPUS_SPONSORED', NOW())
           ON CONFLICT (id) DO UPDATE SET status = 'ACTIVE'`,
          [enrId, u.id, pwyId]
        );
      }
    }
    console.log(`[Seed:AI-Agent] Verified active enrollments for ${allUsers.rows?.length || 0} users.`);
  } catch (enrErr) {
    console.warn("[Seed:AI-Agent] Note on user auto-enrollment:", enrErr);
  }

  console.log(`[Seed:AI-Agent] Successfully seeded all 12 weeks with 48 lessons (Lectures, Quizzes, Labs, Live sessions) into PostgreSQL!`);
}

if (require.main === module) {
  seedAiAgentCurriculum()
    .then(async () => {
      console.log("[Seed:AI-Agent] Finished successfully.");
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("[Seed:AI-Agent] Execution failed:", err);
      await pool.end();
      process.exit(1);
    });
}
