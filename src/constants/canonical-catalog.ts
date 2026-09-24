export interface SyllabusModule {
  num: string;
  title: string;
  topics: string[];
  practical?: string;
  pipeline?: string[];
}

export interface PathwayCapstone {
  title: string;
  flow: string[];
  outputs: string[];
}

export interface CanonicalPathwayItem {
  id: string;
  eyebrow?: string;
  title: string;
  duration?: string;
  level?: string;
  handsOn?: string;
  price: number;
  mrp: number;
  syllabusLink?: string;
  description: string;
  roles?: string[];
  tools?: string[];
  modules?: SyllabusModule[];
  capstone?: PathwayCapstone;
}

export interface CanonicalGroupItem {
  id: string;
  badge: string;
  icon?: string;
  title: string;
  shortName: string;
  target: string;
  tagline: string;
  careerRoles: string[];
  tools: string[];
  pathways: CanonicalPathwayItem[];
}

export const CANONICAL_GROUPS: CanonicalGroupItem[] = [
  {
    "id": "group-1",
    "badge": "GROUP 01",
    "icon": "Laptop",
    "title": "Computer Science & IT",
    "shortName": "CS & IT",
    "target": "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT",
    "tagline": "Production AI engineering, autonomous agent systems, and MLOps deployment.",
    "careerRoles": [
      "Generative AI Engineer",
      "Agentic AI Architect",
      "Machine Learning Engineer",
      "Autonomous Systems Engineer",
      "MLOps Specialist"
    ],
    "tools": [
      "Python",
      "PyTorch",
      "LangGraph",
      "CrewAI",
      "FastAPI",
      "Docker",
      "Hugging Face",
      "Qdrant",
      "vLLM"
    ],
    "pathways": [
      {
        "id": "cs-genai",
        "eyebrow": "PATHWAY 01",
        "title": "Generative AI Engineering",
        "duration": "12 Weeks (132 Hours)",
        "level": "Foundations to Agentic AI",
        "handsOn": "Theory + Hands-on Labs + Capstone",
        "price": 2999,
        "mrp": 9999,
        "syllabusLink": "/syllabi/cs-genai.pdf",
        "description": "From data handling and backend engineering through classical NLP, sequence models, Transformers, and RAG into LLMOps and Agentic AI systems.",
        "roles": [
          "Generative AI Engineer",
          "LLMOps Specialist",
          "AI Application Developer",
          "Agentic Systems Engineer"
        ],
        "tools": [
          "FastAPI",
          "Docker",
          "PostgreSQL",
          "Redis",
          "NLTK",
          "PyTorch",
          "Transformers (BERT)",
          "FAISS",
          "Chroma",
          "LangChain",
          "LangGraph",
          "AWS/Azure"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Week 1 — Data Engineering for AI",
            "topics": [
              "Handling large/messy datasets, EDA strategy & data quality issues",
              "Git workflows, branching models & PR reviews in team AI projects",
              "Linux CLI drills & environment management for production AI"
            ],
            "practical": "Clean and profile a large real dataset with Pandas/NumPy; Git branching + PR workflow; Linux CLI drills."
          },
          {
            "num": "02",
            "title": "Week 2 — AI Backend Engineering I",
            "topics": [
              "REST API design principles for ML/LLM model serving",
              "FastAPI vs Flask architectural trade-offs & async performance",
              "Request/response serialization, typing & error handling in Pydantic"
            ],
            "practical": "Build a FastAPI service that serves a model endpoint; add request validation and error handling."
          },
          {
            "num": "03",
            "title": "Week 3 — AI Backend Engineering II",
            "topics": [
              "PostgreSQL fundamentals & relational schemas for AI applications",
              "Redis caching architectures for LLM inference & response caching",
              "Docker containerization, rate limiting, and structured logging/monitoring"
            ],
            "practical": "Dockerized AI backend with Postgres + Redis + rate limiter (the industry-readiness gate before NLP/LLMs)."
          },
          {
            "num": "04",
            "title": "Week 4 — NLP Foundations: Text Representation",
            "topics": [
              "Core NLP challenges, tokenization, stemming & lemmatization",
              "One-Hot Encoding, Bag of Words (BoW) & TF-IDF vectorization",
              "Sparse vector space models and lexical matching constraints"
            ],
            "practical": "Build text-cleaning pipeline with NLTK; implement BoW and TF-IDF from scratch and with scikit-learn."
          },
          {
            "num": "05",
            "title": "Week 5 — Word Embeddings & Sequence Models",
            "topics": [
              "Word2Vec (CBOW / Skip-gram), Average Word2Vec & dense embeddings",
              "Feedforward ANN vs recurrent RNN architectures and memory retention",
              "Sequence classification: comparative benchmarking of LSTM vs GRU vs BiRNN"
            ],
            "practical": "Train Word2Vec on custom corpus; build RNN & LSTM classifiers; benchmark LSTM vs GRU vs BiRNN on same task."
          },
          {
            "num": "06",
            "title": "Week 6 — Seq2Seq & Attention",
            "topics": [
              "Encoder-Decoder architecture & Seq2Seq modeling mechanics",
              "The fixed-context-vector bottleneck in sequence transduction",
              "The Attention mechanism (Bahdanau additive vs Luong multiplicative)"
            ],
            "practical": "Build toy Encoder-Decoder Seq2Seq model; implement Attention layer on top and benchmark improvement."
          },
          {
            "num": "07",
            "title": "Week 7 — Transformers",
            "topics": [
              "Self-attention, scaled dot-product & multi-head attention mechanics",
              "Positional encodings and feedforward sublayers in Transformers",
              "Why Transformers replaced recurrent models & BERT fine-tuning"
            ],
            "practical": "Fine-tune pretrained Transformer (BERT); complete evolution benchmark: BoW → Word2Vec → LSTM → Attention → Transformer."
          },
          {
            "num": "08",
            "title": "Week 8 — Embeddings, Vector Databases & Retrieval",
            "topics": [
              "Dense embedding spaces & similarity indexing (cosine, dot product)",
              "Vector database internals: FAISS & Chroma indexing mechanics",
              "Sparse lexical (BM25) vs dense semantic retrieval & hybrid search reranking"
            ],
            "practical": "Build embedding pipelines with FAISS and Chroma; implement hybrid BM25 + dense retrieval and compare recall."
          },
          {
            "num": "09",
            "title": "Week 9 — RAG, Prompt Engineering & LLM APIs",
            "topics": [
              "Retrieval-Augmented Generation (RAG) architecture & chunking strategies",
              "Few-shot, Chain-of-Thought & eval-driven prompt engineering",
              "Evaluation metrics: faithfulness, answer relevance, latency, and token cost"
            ],
            "practical": "Build full end-to-end RAG pipeline; build evaluation dashboard tracking faithfulness, relevance, latency & cost."
          },
          {
            "num": "10",
            "title": "Week 10 — LangChain/LangGraph & LLMOps",
            "topics": [
              "LangChain and LangGraph stateful graph workflow orchestration",
              "Prompt/dataset versioning, experiment tracking & LLM observability",
              "Security guardrails (input/output filters) and CI/CD eval-regression checks"
            ],
            "practical": "Rebuild RAG pipeline in LangGraph; instrument with versioning, observability, guardrails & CI/CD eval check."
          },
          {
            "num": "11",
            "title": "Week 11 — Agentic AI & Cloud Deployment",
            "topics": [
              "Multi-step reasoning loops, dynamic tool calling, memory & planning agents",
              "AWS / Azure cloud infrastructure basics and Kubernetes fundamentals",
              "High-throughput model serving, streaming APIs & horizontal autoscaling"
            ],
            "practical": "Build tool-calling agent with persistent memory using LangGraph; deploy system to cloud infrastructure with autoscaling."
          },
          {
            "num": "12",
            "title": "Week 12 — Capstone",
            "topics": [
              "Research methodology: problem framing, evaluation design & technical reporting",
              "Domain application: legal document assistant, medical Q&A, or knowledge bot",
              "End-to-end lifecycle: Design → Build → Evaluate → Deploy → Report"
            ],
            "practical": "Capstone Project: Student-chosen domain AI application deployed and defended before an evaluation panel."
          }
        ],
        "capstone": {
          "title": "Production Agentic RAG Application with LLMOps & Cloud Deployment",
          "flow": [
            "Document Ingestion",
            "Hybrid Retrieval Index",
            "LangGraph Agent with Memory",
            "Guardrails & Telemetry",
            "Cloud Deployment"
          ],
          "outputs": [
            "Agent/RAG system combining retrieval, dynamic tools, and persistent memory",
            "Evaluation framework with logged metrics (accuracy, cost, latency, safety)",
            "Containerized cloud deployment with documented V1→V2 improvement cycle"
          ]
        }
      },
      {
        "id": "cs-agentic",
        "eyebrow": "PATHWAY 02",
        "title": "AI Agent Engineering",
        "duration": "12 Weeks (132 Hours)",
        "level": "Fundamentals to Production",
        "handsOn": "Theory + Hands-on Labs + Capstone",
        "price": 2999,
        "mrp": 9999,
        "syllabusLink": "/syllabi/cs-agentic.pdf",
        "description": "From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.",
        "roles": [
          "AI Agent Engineer",
          "Autonomous Systems Developer",
          "Agentic Systems Architect",
          "Multi-Agent Systems Engineer"
        ],
        "tools": [
          "LangGraph",
          "Model Context Protocol (MCP)",
          "CrewAI",
          "AutoGen",
          "Docker Sandboxes",
          "LiteLLM",
          "Pydantic",
          "Arize Phoenix",
          "RAG & Vector DBs"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Week 1 — What is an AI Agent?",
            "topics": [
              "Agent loop, LLM vs Agent, and ReAct (Think → Act → Observe) loop",
              "Workflow vs agent patterns & modern agent architectures",
              "Heuristics & decision frameworks: when not to use an agent"
            ],
            "practical": "Build progressively from a simple LLM app to a tool-using ReAct agent. Mini Project: your first functional AI agent."
          },
          {
            "num": "02",
            "title": "Week 2 — Context Engineering I",
            "topics": [
              "Messages, system/user/tool roles, and context window mechanics",
              "Tokenization constraints, prompt architecture & dynamic context injection",
              "Static vs dynamic context management in runtime loops"
            ],
            "practical": "Build a context-aware agent and a context builder pipeline; observe how context changes model output."
          },
          {
            "num": "03",
            "title": "Week 3 — Context Engineering II",
            "topics": [
              "Production prompt engineering & semantic tool descriptions",
              "Prompt injection vulnerabilities & defensive system prompting",
              "Context compression techniques for long-running conversational threads"
            ],
            "practical": "Project: a production-style customer support agent with business rules and injection defenses — then attack and fix it."
          },
          {
            "num": "04",
            "title": "Week 4 — Memory Engineering",
            "topics": [
              "Short-term vs long-term memory architectures in agentic runtimes",
              "Episodic vs semantic memory, extraction, and indexing lifecycles",
              "Memory retrieval policies, conflict resolution & state hydration"
            ],
            "practical": "Build a personal AI assistant with persistent memory across conversations."
          },
          {
            "num": "05",
            "title": "Week 5 — RAG Engineering",
            "topics": [
              "Document chunking strategies, embeddings & vector databases",
              "Hybrid search (dense vector + sparse BM25), reranking & metadata filtering",
              "Identifying and debugging retrieval failure modes in production"
            ],
            "practical": "Build a full retrieval-augmented generation pipeline and compare chunking and retrieval strategies."
          },
          {
            "num": "06",
            "title": "Week 6 — Tool Engineering",
            "topics": [
              "Tool schemas, function calling specifications & JSON Schema validation",
              "Tool selection accuracy, retry reliability & deterministic error handling",
              "Granular tool permissions, credential segregation & security boundaries"
            ],
            "practical": "Build multiple tools (search, calculator, database, API) and a tool-using research agent."
          },
          {
            "num": "07",
            "title": "Week 7 — MCP & Production Tooling",
            "topics": [
              "Anthropic Model Context Protocol (MCP) concepts, servers and clients",
              "MCP resources, prompts, tools, authentication & runtime discovery",
              "Enterprise integration patterns: connecting private backends via MCP"
            ],
            "practical": "Connect and register multiple MCP tools with permission controls. Milestone: a personal AI work agent."
          },
          {
            "num": "08",
            "title": "Week 8 — Coding Agents",
            "topics": [
              "Coding agent architecture, AST parsing & repository understanding",
              "Code generation, containerized Docker sandboxing & test execution",
              "Autonomous agentic coding loop: inspect → edit → test → repair"
            ],
            "practical": "Project: a coding agent that inspects a real repository, edits files, runs tests, and fixes errors."
          },
          {
            "num": "09",
            "title": "Week 9 — Async, Event-Driven & Computer Use",
            "topics": [
              "Synchronous vs asynchronous agent execution models",
              "Event-driven architectures, webhooks & human-in-the-loop approvals",
              "Browser automation basics with Playwright & computer-use runtimes"
            ],
            "practical": "Build an event-driven agent triggered by an incoming event, plus a controlled browser-automation mini-lab."
          },
          {
            "num": "10",
            "title": "Week 10 — Agent Evaluation",
            "topics": [
              "Why demos aren’t evaluation: benchmarks vs real-world reliability",
              "Trajectory evaluation, LLM-as-a-judge & rubric design",
              "Benchmarking agent reliability, latency, token cost & safety boundaries"
            ],
            "practical": "Build an evaluation framework for your own agent and use it to find and log failure patterns."
          },
          {
            "num": "11",
            "title": "Week 11 — Agent Improvement",
            "topics": [
              "Diagnostic triage: when to improve prompt, context, tools, or model",
              "A/B test comparisons, versioned regression testing & continuous evolution",
              "Hardening agent graphs against edge cases and failure modes"
            ],
            "practical": "Take your Week 10 agent, diagnose failures, and ship an improved Version 2 — then compare results."
          },
          {
            "num": "12",
            "title": "Week 12 — Multi-Agent Systems & Capstone",
            "topics": [
              "Manager-worker, hierarchical, and peer-to-peer collaboration patterns",
              "Shared vs independent context, delegation protocols & consensus",
              "Coordination failure handling, deadlocks & swarm convergence"
            ],
            "practical": "Capstone: a multi-agent research system (manager, researcher, analyst, critic, synthesizer) — presented and defended."
          }
        ],
        "capstone": {
          "title": "Production Multi-Agent Research & Execution System",
          "flow": [
            "Agent Router",
            "Context & Memory Engine",
            "RAG & MCP Integrations",
            "Coding & Sandboxing",
            "Evaluation & V1→V2 Loop"
          ],
          "outputs": [
            "Complete multi-agent system (Manager, Researcher, Analyst, Critic, Synthesizer)",
            "Evaluation framework with logged metrics (accuracy, cost, latency, safety)",
            "Documented improvement cycle from Version 1 to Version 2 portfolio repository"
          ]
        }
      },
      {
        "id": "cs-p1",
        "eyebrow": "PATHWAY 03",
        "title": "Machine Learning in Production: MLOps Engineering",
        "duration": "12 Weeks (132 Hours)",
        "level": "Industry-Ready MLOps",
        "handsOn": "Theory + Hands-on Labs + Capstone",
        "price": 2999,
        "mrp": 9999,
        "syllabusLink": "/syllabi/cs-p1.pdf",
        "description": "From data engineering fundamentals through experiment tracking, deployment, monitoring, and automated retraining into managed cloud ML platforms through a progressive build.",
        "roles": [
          "MLOps Engineer",
          "Machine Learning Engineer",
          "Data & ML Platform Engineer",
          "Production AI Specialist"
        ],
        "tools": [
          "DuckDB",
          "Airflow",
          "Kafka",
          "Great Expectations",
          "DVC",
          "MLflow",
          "FastAPI",
          "Docker",
          "Evidently AI",
          "AWS SageMaker"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Week 1 — Python & Engineering Practices for ML",
            "topics": [
              "Writing production-grade Python (packaging, testing, typing)",
              "Why notebook prototype code fails in production & reproducibility basics",
              "Configuration management & CI-ready project structures"
            ],
            "practical": "Convert a notebook prototype into a packaged, tested Python module with a CI-ready project structure."
          },
          {
            "num": "02",
            "title": "Week 2 — Data Engineering Fundamentals: OLTP vs OLAP",
            "topics": [
              "OLTP vs OLAP workloads and why production ML requires both",
              "Data warehouse vs data lake & columnar storage mechanics",
              "Embedded analytics & analytical queries with DuckDB"
            ],
            "practical": "Model a transactional (OLTP) dataset and rebuild it as an analytical (OLAP) schema; run benchmarked analytical queries in DuckDB."
          },
          {
            "num": "03",
            "title": "Week 3 — ETL Pipelines & Orchestration",
            "topics": [
              "ETL vs ELT trade-offs and resilient pipeline design patterns",
              "Scheduling, idempotency, backfills & partition tracking",
              "Orchestration concepts and Directed Acyclic Graphs (DAGs)"
            ],
            "practical": "Build a scheduled, idempotent ETL pipeline (extract → transform → load) orchestrated with Airflow/Prefect."
          },
          {
            "num": "04",
            "title": "Week 4 — Streaming Data with Kafka",
            "topics": [
              "Batch vs streaming architectures in machine learning",
              "Kafka internals: producers, consumers, topics, and partitions",
              "Identifying when ML systems require real-time streaming ingestion"
            ],
            "practical": "Build a Kafka producer/consumer pair simulating real-time events feeding a feature pipeline."
          },
          {
            "num": "05",
            "title": "Week 5 — Data Labelling & Data Quality",
            "topics": [
              "Labelling strategies: manual, weak supervision & active learning",
              "Labelling tooling: Label Studio, CVAT, and Prodigy workflows",
              "Inter-annotator agreement & schema/drift validation at ingestion"
            ],
            "practical": "Set up a labelling workflow in Label Studio; add automated data-quality checks (Great Expectations) into the Week 3 pipeline."
          },
          {
            "num": "06",
            "title": "Week 6 — Data Versioning & Feature Stores",
            "topics": [
              "Data lineage auditing: verifying exactly which data trained a model",
              "Data version control with DVC and lakeFS concepts",
              "Feature stores and mitigating train/serve feature skew"
            ],
            "practical": "Version pipeline datasets with DVC; build a feature store serving consistent features for training and inference."
          },
          {
            "num": "07",
            "title": "Week 7 — ML Algorithms for Production",
            "topics": [
              "Selecting algorithms for production constraints (latency, interpretability, retraining cost)",
              "Linear models, gradient-boosted trees (XGBoost) and ensembles",
              "Engineering decision heuristics: when not to use deep learning"
            ],
            "practical": "Build a production-style training pipeline (scikit-learn/XGBoost) with reusable feature engineering, trained on the Week 6 feature store."
          },
          {
            "num": "08",
            "title": "Week 8 — Experiment Tracking & Model Versioning",
            "topics": [
              "Experiment tracking and metric logging with MLflow and W&B",
              "Model registries, semantic model versioning & lineage graphs",
              "Reproducible training runs, parameter logging & artifacts"
            ],
            "practical": "Instrument the Week 7 pipeline with MLflow tracking; register the best model with full lineage back to its data version."
          },
          {
            "num": "09",
            "title": "Week 9 — Model Deployment",
            "topics": [
              "Batch vs real-time model serving trade-offs & gRPC/REST APIs",
              "Docker containerization for machine learning workloads",
              "Production rollout patterns: shadow and canary deployments"
            ],
            "practical": "Containerize the registered model behind a FastAPI serving endpoint; deploy with a canary rollout strategy."
          },
          {
            "num": "10",
            "title": "Week 10 — Monitoring in Production",
            "topics": [
              "Data drift vs concept drift & model performance decay patterns",
              "Production observability metrics (latency, throughput, prediction distribution)",
              "Automated alerts and ML observability dashboards"
            ],
            "practical": "Instrument the Week 9 service with drift detection (Evidently AI) and an automated alerting dashboard."
          },
          {
            "num": "11",
            "title": "Week 11 — Retraining Pipelines & CI/CD/CT",
            "topics": [
              "Continuous Training (CT) triggers & automated retraining pipelines",
              "CI/CD for ML: testing data integrity and models alongside code",
              "Automated rollback strategies and promotion gates"
            ],
            "practical": "Build an automated retraining pipeline triggered by Week 10 drift alerts, with a CI/CD gate validating the new model before promotion."
          },
          {
            "num": "12",
            "title": "Week 12 — Cloud ML Services & Capstone",
            "topics": [
              "Managed cloud ML platforms: AWS SageMaker, Azure ML, and GCP Vertex AI",
              "Evaluating managed cloud vs self-hosted MLOps infrastructure",
              "Cost, latency, and operational trade-off comparisons across platforms"
            ],
            "practical": "Deploy the full pipeline on a managed cloud platform. Capstone: integrate Weeks 1–11 into one deployed, monitored, auto-retraining system — presented and defended."
          }
        ],
        "capstone": {
          "title": "Autonomous Self-Retraining Production MLOps System",
          "flow": [
            "Data & Kafka Ingestion",
            "Great Expectations & DVC",
            "MLflow Registry",
            "FastAPI & Canary Rollout",
            "Evidently Drift & Auto-Retraining"
          ],
          "outputs": [
            "End-to-end pipeline: raw data → ETL/streaming → validated → versioned → trained → deployed",
            "Model registry with full lineage and live drift detection dashboard with alerting",
            "Automated retraining trigger with CI/CD validation gate deployed on cloud (AWS SageMaker/Azure/GCP)"
          ]
        }
      },
      {
        "id": "cs-common",
        "eyebrow": "WEEKEND INCUBATOR TRACK",
        "title": "AI Entrepreneurship & Business Innovation",
        "duration": "3 Months (12 Weekends)",
        "level": "All Students (Weekend Track)",
        "handsOn": "Incubator Labs (Sat & Sun only)",
        "price": 599,
        "mrp": 2999,
        "syllabusLink": "/syllabi/cs-common.pdf",
        "description": "Structured incubator track teaching students how to convert AI technical capability into a validated commercial product and startup. Classes run only on Saturdays and Sundays.",
        "roles": [
          "AI Startup Founder",
          "AI Product Manager",
          "Venture Builder",
          "Innovation Lead"
        ],
        "tools": [
          "MVP Prototyping",
          "Business Model Canvas",
          "Pitch Decks",
          "Unit Economics",
          "Low-Code & AI Build Tools"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Weekend 1 — Design Thinking & Pain Points (Mod 1)",
            "topics": [
              "Saturday: Introduction to design thinking; empathy mapping; identifying real user pain points",
              "Sunday: Hands-on: map 3 candidate pain points from your own experience or target community; peer critique"
            ],
            "practical": "Milestone: Map 3 candidate pain points and initiate validated Problem Statement."
          },
          {
            "num": "02",
            "title": "Weekend 2 — Customer Discovery Interviews (Mod 1)",
            "topics": [
              "Saturday: Interview design: writing unbiased questions, avoiding leading the witness, structuring a discovery call",
              "Sunday: Conduct 3–5 mock customer discovery interviews; synthesize findings into a problem brief"
            ],
            "practical": "Conduct customer discovery interviews and synthesize findings into a problem brief."
          },
          {
            "num": "03",
            "title": "Weekend 3 — Competitor Matrix & Market Sizing (Mod 1)",
            "topics": [
              "Saturday: Competitive analysis frameworks; direct vs indirect competitors; positioning maps",
              "Sunday: Workshop: build a competitor matrix and a TAM/SAM/SOM market-sizing estimate for your idea"
            ],
            "practical": "Build competitor matrix and TAM/SAM/SOM market-sizing estimate."
          },
          {
            "num": "04",
            "title": "Weekend 4 — Problem Statement Lock-In (Mod 1)",
            "topics": [
              "Saturday: Peer review of problem briefs, market sizing, and competitor matrices; instructor feedback",
              "Sunday: Finalize and present a validated Problem Statement to the cohort"
            ],
            "practical": "Milestone Lock-In: Present and defend validated Problem Statement to cohort."
          },
          {
            "num": "05",
            "title": "Weekend 5 — Where AI Creates 10x Value (Mod 2)",
            "topics": [
              "Saturday: Framework for spotting AI opportunities vs plain automation; case studies of 10x value creation",
              "Sunday: Opportunity-mapping exercise: apply the framework to your own validated problem"
            ],
            "practical": "Opportunity-mapping: isolate where generative/agentic AI delivers 10x value."
          },
          {
            "num": "06",
            "title": "Weekend 6 — Rapid Prototyping Toolkit (Mod 2)",
            "topics": [
              "Saturday: Tour of low-code and AI-assisted build tools for fast prototyping",
              "Sunday: Build the first clickable/functional version of your prototype"
            ],
            "practical": "Milestone Kickoff: Build first clickable/functional version of MVP prototype."
          },
          {
            "num": "07",
            "title": "Weekend 7 — MVP Build Sprint (Mod 2)",
            "topics": [
              "Saturday: Iterate on the prototype; add the core AI-driven feature",
              "Sunday: Continue the build sprint; instructor office hours for debugging and scoping"
            ],
            "practical": "Intensive MVP build sprint with integrated AI feature and live debugging."
          },
          {
            "num": "08",
            "title": "Weekend 8 — Validating the MVP (Mod 2)",
            "topics": [
              "Saturday: Methods for testing an MVP with early users; structuring a feedback session",
              "Sunday: Run live validation sessions with early users; collect and log feedback on your Functional MVP"
            ],
            "practical": "Milestone Lock-In: Run live validation sessions with early users; collect feedback on Functional MVP."
          },
          {
            "num": "09",
            "title": "Weekend 9 — Business Model Canvas (Mod 3)",
            "topics": [
              "Saturday: Business Model Canvas (BMC) fundamentals; revenue model options for AI products",
              "Sunday: Build a complete BMC and revenue model for your validated MVP"
            ],
            "practical": "Build complete Business Model Canvas and revenue model for validated MVP."
          },
          {
            "num": "10",
            "title": "Weekend 10 — Go-To-Market Strategy (Mod 3)",
            "topics": [
              "Saturday: GTM frameworks: channels, positioning, early-adopter acquisition",
              "Sunday: Build a GTM plan; finalize the Business Model"
            ],
            "practical": "Milestone Lock-In: Finalize GTM early-adopter acquisition plan and business model."
          },
          {
            "num": "11",
            "title": "Weekend 11 — Investor Pitch Deck (Mod 3)",
            "topics": [
              "Saturday: Pitch deck structure and storytelling for investors; anatomy of a 10-slide deck",
              "Sunday: Build a draft pitch deck; peer review and iterate"
            ],
            "practical": "Build draft 10-slide pitch deck; peer review and iterate."
          },
          {
            "num": "12",
            "title": "Weekend 12 — Startup Validation & Pitch Deck (Capstone)",
            "topics": [
              "Saturday: Pitch rehearsal; feedback session with instructors and mentors",
              "Sunday: Final Pitch — capstone defense in front of an investor-style panel"
            ],
            "practical": "Milestone Defense: Final Pitch presentation and defense in front of investor panel."
          }
        ],
        "capstone": {
          "title": "Startup Validation & Investor-Ready Pitch Deck",
          "flow": [
            "Problem Statement",
            "Functional MVP",
            "Business Model",
            "Final Pitch"
          ],
          "outputs": [
            "Working functional MVP prototype",
            "Validated Business Model Canvas and GTM acquisition plan",
            "10-slide investor pitch deck defended before investor panel"
          ]
        }
      }
    ]
  },
  {
    "id": "group-2",
    "badge": "GROUP 02",
    "icon": "Microscope",
    "title": "Science & Mathematics",
    "shortName": "Science & Math",
    "target": "Physics • Mathematics • Statistics • Chemistry • Engineering • Quantitative Science",
    "tagline": "Scientific computing, differential equations, physics-informed neural networks (PINNs), and neural operators.",
    "careerRoles": [
      "Scientific AI Researcher",
      "Computational Data Scientist",
      "SciML / PINNs Engineer",
      "Simulation & Modeling Specialist",
      "Quantitative Analyst"
    ],
    "tools": [
      "Python",
      "PyTorch",
      "SciPy",
      "NumPy",
      "PINNs",
      "Autograd",
      "ODEs/PDEs",
      "DeepONet",
      "FNO",
      "Jupyter"
    ],
    "pathways": [
      {
        "id": "sci-p1",
        "eyebrow": "PATHWAY 01",
        "title": "Scientific Machine Learning for Basic Sciences (BSc Physics | BSc Maths)",
        "duration": "6 Months",
        "level": "Undergraduate → Early Professional",
        "handsOn": "100% Practical Labs",
        "price": 2999,
        "mrp": 8999,
        "syllabusLink": "/syllabi/sci-p1.pdf",
        "description": "Core progression: Mathematics → Python → Scientific Computing → Machine Learning → Deep Learning → Scientific AI → Capstone. Formulate differential equations as learning constraints, implement PINNs via PyTorch autograd, and solve forward/inverse problems.",
        "roles": [
          "Scientific AI Researcher",
          "Computational Data Scientist",
          "SciML / PINNs Engineer",
          "Simulation & Modeling Specialist",
          "Quantitative Analyst"
        ],
        "tools": [
          "Python",
          "NumPy",
          "SciPy",
          "Pandas",
          "PyTorch",
          "PINNs",
          "Autograd",
          "ODEs/PDEs",
          "DeepONet/FNO"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Mathematical & Computational Foundations for Scientific AI",
            "topics": [
              "Python fundamentals, data structures, scientific workflows & Git/GitHub",
              "Linear algebra for AI: vectors, matrices, norms, eigenvalues & eigenvectors",
              "Calculus for AI: partial derivatives, gradients, chain rule, Jacobian & Hessian intuition",
              "Probability, statistics, uncertainty, numerical error & loss functions"
            ],
            "practical": "Simulate a noisy scientific dataset, fit a mathematical model, quantify error, and publish a reproducible Python notebook.",
            "pipeline": [
              "Math Formulation",
              "Python / Colab",
              "Gradient Descent",
              "Reproducible Notebook"
            ]
          },
          {
            "num": "02",
            "title": "Scientific Computing, Numerical Methods & Differential Equations",
            "topics": [
              "NumPy, SciPy & Pandas: vectorization, scientific data pipelines & visualization",
              "Numerical errors, stability, convergence, root finding, interpolation & differentiation",
              "Numerical integration & ODEs: Euler, Runge–Kutta methods & dynamical systems",
              "PDE fundamentals: diffusion, heat & Poisson equations with finite-difference methods"
            ],
            "practical": "Implement a 1D heat-equation solver, generate reference simulation datasets, and compare numerical solutions across grid resolutions.",
            "pipeline": [
              "NumPy/SciPy",
              "ODE Solvers",
              "Finite Differences",
              "Reference Simulation"
            ]
          },
          {
            "num": "03",
            "title": "Machine Learning for Scientific & Engineering Applications",
            "topics": [
              "Scientific ML workflows: linear & polynomial regression, loss functions & regularization",
              "Classification algorithms: logistic regression, decision trees & Random Forest",
              "Model evaluation: bias-variance trade-off, cross-validation & hyperparameter tuning",
              "Clustering, PCA, feature scaling, model interpretability & scientific baselines"
            ],
            "practical": "Complete an end-to-end scientific ML pipeline with data cleaning, training, evaluation, error analysis, and GitHub documentation.",
            "pipeline": [
              "Lab Data Ingestion",
              "Feature Scaling",
              "ML Regressor/Classifier",
              "Scientific Baseline Report"
            ]
          },
          {
            "num": "04",
            "title": "Deep Learning, PyTorch & Differentiable Computing",
            "topics": [
              "Neural network fundamentals: perceptrons, activation functions, forward propagation & computational graphs",
              "Backpropagation & PyTorch autograd: loss functions, SGD, Adam & learning-rate schedules",
              "CNNs for spatial/scientific image data & sequence models intro",
              "Automatic differentiation, higher-order derivatives, tensor ops & GPU workflows"
            ],
            "practical": "Train a neural network to approximate a known analytical function and compute its derivatives using PyTorch autograd.",
            "pipeline": [
              "PyTorch Model",
              "Autograd Engine",
              "Higher-Order Derivatives",
              "Differentiable Graphs"
            ]
          },
          {
            "num": "05",
            "title": "Scientific Machine Learning & Physics-Informed Neural Networks (PINNs)",
            "topics": [
              "Scientific ML paradigm: data-driven vs physics-based models & hybrid modelling",
              "PINN mathematical formulation: PDE residuals, boundary/initial conditions & collocation points",
              "PINNs for ODEs & forward problems: automatic differentiation & convergence challenges",
              "PINNs for nonlinear PDEs (1D Burgers equation), loss balancing & sampling strategies",
              "Inverse PINNs: parameter estimation, noisy observations, scientific validation & neural operators intro"
            ],
            "practical": "Solve forward and inverse scientific problems using a PINN, benchmark against a classical numerical solver, and submit a technical report.",
            "pipeline": [
              "PDE Residual Formulation",
              "Collocation Sampling",
              "Composite Loss Optimization",
              "Physical Law Validation"
            ]
          },
          {
            "num": "06",
            "title": "Advanced Scientific AI, Research Engineering & Industry Capstone",
            "topics": [
              "Advanced PINN training: adaptive sampling, loss balancing & optimization strategies",
              "Neural operators (DeepONet / FNO concepts), hybrid physics-ML & model selection",
              "Research computing: experiment tracking, Git branching, modular code & configuration",
              "Benchmarking, ablation studies, uncertainty/error analysis & computational cost",
              "Technical communication, scientific paper/report preparation, portfolio development & viva defence"
            ],
            "practical": "Final Capstone Project: End-to-end scientific AI deliverable with GitHub repo, benchmark report, presentation, and technical project defence.",
            "pipeline": [
              "Neural Operators (FNO/DeepONet)",
              "Ablation & Benchmarking",
              "Research Engineering",
              "Capstone Defense"
            ]
          }
        ],
        "capstone": {
          "title": "Scientific AI Research & Industry Capstone Project",
          "flow": [
            "Problem Formulation",
            "Numerical Baseline & Dataset",
            "PINN / SciML Model",
            "Benchmarking & Ablation",
            "Technical Report & Defence"
          ],
          "outputs": [
            "Reproducible GitHub research repo",
            "Physics-Informed Neural Network (PINN) model",
            "Benchmark vs numerical solver report",
            "Capstone defense presentation"
          ]
        }
      },
      {
        "id": "sci-p2",
        "eyebrow": "PATHWAY 02",
        "title": "Mathematics + AI / Computational Intelligence",
        "duration": "3 Months",
        "level": "Mathematics & Statistics Majors",
        "handsOn": "100% Practical Labs",
        "price": 1500,
        "mrp": 5999,
        "syllabusLink": "/syllabi/sci-p2.pdf",
        "description": "Rigorous mathematics-oriented pathway focusing on mathematical proofs, optimization theory, statistical learning, and computational algorithms.",
        "roles": [
          "Quantitative Analyst",
          "Statistical Model Engineer",
          "Algorithm Researcher"
        ],
        "tools": [
          "Python",
          "Linear Algebra",
          "Convex Optimization",
          "Monte Carlo",
          "SymPy"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Mathematics Behind Modern AI",
            "topics": [
              "Vector spaces & matrix decompositions (SVD, PCA)",
              "Multivariable calculus & gradient fields",
              "Statistical inference & Bayesian theory"
            ]
          },
          {
            "num": "02",
            "title": "Optimization Theory & Algorithms",
            "topics": [
              "Convex optimization & gradient descent",
              "Stochastic optimization & momentum",
              "Convergence analysis"
            ]
          },
          {
            "num": "03",
            "title": "Algorithmic AI & Simulation",
            "topics": [
              "Numerical linear algebra",
              "Monte Carlo simulations",
              "Optimization-driven network training"
            ]
          }
        ],
        "capstone": {
          "title": "Mathematical Problem Solving via AI",
          "flow": [
            "Math Formulation",
            "Algorithm Design",
            "Computational Implementation",
            "Final Report"
          ],
          "outputs": [
            "Algorithm notebook",
            "Theoretical analysis report",
            "GitHub repository"
          ]
        }
      }
    ]
  },
  {
    "id": "group-3",
    "badge": "GROUP 03",
    "icon": "BarChart3",
    "title": "Commerce, BBA & Management",
    "shortName": "Commerce & Finance",
    "target": "B.Com • BBA • M.Com • MBA • Economics • Finance",
    "tagline": "Business analytics, SQL, modern data engineering, FinTech systems, and AI-driven decisions.",
    "careerRoles": [
      "Financial AI Analyst",
      "Business Intelligence Developer",
      "FinTech Risk Specialist",
      "Commercial Strategist"
    ],
    "tools": [
      "Advanced Excel",
      "PostgreSQL",
      "DuckDB",
      "Power BI",
      "Python",
      "Credit Risk ML",
      "Tableau"
    ],
    "pathways": [
      {
        "id": "mgmt-p1",
        "eyebrow": "PATHWAY 01",
        "title": "Business Analytics & Data Engineering",
        "duration": "3 Months",
        "level": "Undergraduate / Postgraduate",
        "handsOn": "100% Practical Labs",
        "price": 2000,
        "mrp": 6999,
        "syllabusLink": "/syllabi/mgmt-p1.pdf",
        "description": "Equips business students with advanced Excel, SQL, modern data engineering (ETL, Parquet, DuckDB), Power BI, and Generative AI.",
        "roles": [
          "Business Intelligence Analyst",
          "Data Engineer for Analytics",
          "Corporate Strategist"
        ],
        "tools": [
          "Excel",
          "SQL",
          "DuckDB",
          "Power BI",
          "ETL",
          "Prompt Engineering"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Business Data & Advanced Excel",
            "topics": [
              "Transactional & operational business data",
              "Dynamic array formulas & XLOOKUP",
              "Power Pivot & interactive dashboard design"
            ]
          },
          {
            "num": "02",
            "title": "SQL for Business Analytics",
            "topics": [
              "Relational schemas & multi-table JOINs",
              "Aggregations, GROUP BY & window functions",
              "Queries for churn, revenue, and customer KPIs"
            ]
          },
          {
            "num": "03",
            "title": "Data Engineering for Analysts",
            "topics": [
              "ETL pipelines & star schema design",
              "Columnar Parquet & fast DuckDB queries",
              "Event streaming fundamentals with Kafka"
            ],
            "pipeline": [
              "ERP/CRM Data",
              "ETL Pipeline",
              "Parquet Storage",
              "DuckDB Engine",
              "Power BI Dashboard"
            ]
          },
          {
            "num": "04",
            "title": "BI Dashboards & Data Storytelling",
            "topics": [
              "Power BI / Tableau visual hierarchy",
              "Interactive filters & KPI scorecards",
              "Executive data presentations"
            ]
          },
          {
            "num": "05",
            "title": "Generative AI for Business",
            "topics": [
              "Prompt engineering for analysts",
              "Automated document & market synthesis",
              "AI-driven executive decision support"
            ]
          }
        ],
        "capstone": {
          "title": "Enterprise Business Intelligence System",
          "flow": [
            "Raw Sales Data",
            "ETL Pipeline",
            "SQL Warehouse",
            "Power BI Dashboard",
            "Executive Deck"
          ],
          "outputs": [
            "Automated ETL pipeline in DuckDB",
            "Interactive Power BI dashboard",
            "Executive strategy slide deck"
          ]
        }
      },
      {
        "id": "cs-common",
        "eyebrow": "WEEKEND INCUBATOR TRACK",
        "title": "AI Entrepreneurship & Business Innovation",
        "duration": "3 Months (12 Weekends)",
        "level": "All Students (Weekend Track)",
        "handsOn": "Incubator Labs (Sat & Sun only)",
        "price": 599,
        "mrp": 2999,
        "syllabusLink": "/syllabi/cs-common.pdf",
        "description": "Structured incubator track teaching students how to convert AI technical capability into a validated commercial product and startup. Classes run on Saturdays and Sundays.",
        "roles": [
          "AI Venture Builder",
          "SaaS Business Analyst",
          "Corporate Innovation Manager"
        ],
        "tools": [
          "SaaS Economics",
          "MVP Wireframing",
          "Pitch Decks",
          "GTM Strategy"
        ],
        "modules": [
          {
            "num": "01",
            "title": "Commercial AI Discovery",
            "topics": [
              "FinTech & SME automation opportunities",
              "AI marketing & analytics tools",
              "Local business automated workflows"
            ]
          },
          {
            "num": "02",
            "title": "Business Model & Unit Economics",
            "topics": [
              "SaaS pricing models & CAC/LTV metrics",
              "Business Model Canvas design",
              "Go-to-market strategies"
            ]
          },
          {
            "num": "03",
            "title": "MVP Prototyping & Pitching",
            "topics": [
              "No-code MVP prototyping",
              "Validating willingness to pay",
              "10-slide investor pitch deck"
            ]
          }
        ],
        "capstone": {
          "title": "Commercial AI Venture Plan & Pitch",
          "flow": [
            "Market Need",
            "Product Concept",
            "Unit Economics",
            "Investor Pitch"
          ],
          "outputs": [
            "Validated Business Model Canvas",
            "Working prototype wireframe",
            "10-slide investor deck"
          ]
        }
      }
    ]
  },
  {
    "id": "group-4",
    "badge": "GROUP 04",
    "icon": "Palette",
    "title": "BA, Humanities & Other Disciplines",
    "shortName": "Humanities & Non-Tech",
    "target": "BA • Fine Arts • Education • Law • All Non-Tech Majors",
    "tagline": "AI-Enabled Professional Program — transforming students into high-productivity, AI-fluent leaders.",
    "careerRoles": [
      "AI Operations Lead",
      "Prompt Design Consultant",
      "Technical Content Architect",
      "Executive Research Analyst"
    ],
    "tools": [
      "Claude 3.5",
      "ChatGPT Plus",
      "Midjourney",
      "Notion AI",
      "Perplexity",
      "Make/Zapier",
      "Prompt Engineering"
    ],
    "pathways": [
      {
        "id": "arts-p1",
        "eyebrow": "AI-ENABLED PROFESSIONAL PROGRAM",
        "title": "Applied AI for Humanities, Research & Careers",
        "duration": "3 Months",
        "level": "All Students (No Coding Required)",
        "handsOn": "100% Practical Labs",
        "price": 999,
        "mrp": 3999,
        "syllabusLink": "/syllabi/arts-p1.pdf",
        "description": "Elite professional program: prompt engineering, AI research methods, automated content, executive communication, and career mastery.",
        "roles": [
          "AI Productivity Specialist",
          "Executive Research Associate",
          "Creative Technologist"
        ],
        "tools": [
          "Prompt Engineering",
          "Document Synthesis",
          "AI Copywriting",
          "ATS Resumes",
          "Perplexity"
        ],
        "modules": [
          {
            "num": "01",
            "title": "AI Literacy & Foundations",
            "topics": [
              "How LLMs work & practical limitations",
              "Ethical AI, academic integrity & privacy",
              "AI-collaborative professional mindset"
            ]
          },
          {
            "num": "02",
            "title": "Mastering Prompt Engineering",
            "topics": [
              "Context, role & constraint formulation",
              "Chain-of-thought & step-by-step reasoning",
              "Iterative prompt optimization & testing"
            ]
          },
          {
            "num": "03",
            "title": "AI for Research & Synthesis",
            "topics": [
              "Synthesizing 50+ page documents quickly",
              "Literature exploration & comparative analysis",
              "Fact-checking & citation verification"
            ]
          },
          {
            "num": "04",
            "title": "Productivity & Executive Writing",
            "topics": [
              "Drafting reports, proposals & memos",
              "Slide outlines & presentation workflows",
              "Custom AI productivity assistants"
            ]
          },
          {
            "num": "05",
            "title": "Career Acceleration & Branding",
            "topics": [
              "AI-optimized resume & ATS alignment",
              "LinkedIn transformation & personal branding",
              "AI mock interview preparation"
            ]
          }
        ],
        "capstone": {
          "title": "AI-Enabled Professional Portfolio",
          "flow": [
            "Research Statement",
            "AI Analysis",
            "Executive Content",
            "Portfolio & Resume"
          ],
          "outputs": [
            "In-depth AI research paper",
            "Optimized resume & LinkedIn profile",
            "Custom AI workflow dossier"
          ]
        }
      }
    ]
  }
];

export function getCanonicalPathway(idOrSlug: string): CanonicalPathwayItem | undefined {
  const norm = (idOrSlug || "").toLowerCase();
  for (const group of CANONICAL_GROUPS) {
    const found = group.pathways.find(p => p.id.toLowerCase() === norm);
    if (found) return found;
  }
  return undefined;
}
