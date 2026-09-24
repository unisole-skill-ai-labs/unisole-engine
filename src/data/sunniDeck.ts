export const SUNNI_COLLEGE_PPT_SLIDES = [
  // =========================================================================
  // HOOK & CREDIBILITY INTRODUCTION
  // =========================================================================

  // SLIDE 1 — COVER
  {
    id: "sunni_slide_1",
    type: "COVER",
    badge: "INDUSTRIAL TRAINING & INTERNSHIP OPPORTUNITY PROGRAM",
    title: "UNISOLE AI CAMPUS PROGRAM",
    subtitle: "Career Awareness & Industrial Training Masterclass · Atal Bihari Vajpayee Govt. Degree College, Sunni",
    org: "UNISOLE SKILL AI LABS",
    maxBuildSteps: 2,
    notes: "Welcome everyone at Atal Bihari Vajpayee Govt. Degree College Sunni! In the next 50 minutes, we are tackling the single most urgent question on every student's mind: In an era where AI can write code, analyze data, and draft documents in seconds, what happens to your degree and how do you build an indispensable career?",
  },

  // SLIDE 2 — THE HOOK QUESTION (HINDI ONLY)
  {
    id: "sunni_slide_2",
    type: "BIG_QUESTION",
    badge: "THE HOOK QUESTION",
    title: "आगे क्या सोचा है?",
    subtitle: "Think honestly — what have you planned after graduation?",
    maxBuildSteps: 1,
    questionPrompt: "Think honestly — what have you planned after graduation?",
    speakerHook: "Not what your parents planned 10 years ago. Not what your friends are filling in exam forms. What have YOU actively decided?",
    notes: "[THE ONLY HINDI SLIDE — DRAMATIC 10-SECOND PAUSE] Look across the room. Ask verbally: 'आगे क्या सोचा है? Think honestly—what have you planned after graduation?' Don't answer immediately. Let the silence register.",
  },

  // SLIDE 3 — LIVE POLL 01: CAREER PULSE
  {
    id: "sunni_slide_3",
    type: "POLL",
    badge: "LIVE AUDIENCE PULSE 01",
    title: "Career Direction Pulse",
    question: "What is your primary career plan after graduation from ABV GDC Sunni?",
    options: [
      "Software Engineering, AI & Tech Systems",
      "Government & Competitive Exams (HPAS, Banking, SSC, Police)",
      "Science, Analytics & Research Careers",
      "Commerce, Finance & Business Management",
      "Still Exploring & Undecided",
    ],
    maxBuildSteps: 1,
    notes: "Have students scan the live QR code on their mobile phones to cast their votes. Watch the live distribution appear on screen. Acknowledge that while traditional exams are common, modern technology has opened massive direct opportunities.",
  },

  // SLIDE 4 — CREDIBILITY & LEADERSHIP
  {
    id: "sunni_slide_4",
    type: "FOUNDER_BIO",
    badge: "CREDIBILITY & LEADERSHIP",
    title: "AJAY MOKTA",
    subtitle: "Founder — UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur",
    initials: "AM",
    credentials: [
      "B.Tech — NIT Hamirpur Alumnus",
      "AI Educator & Keynote Speaker",
      "Mentored 5,000+ Students Across India",
      "Team of Practitioners from IIT Delhi, IIT Patna, BlackRock & NASA Space Apps",
    ],
    quote: "“A degree from any college in Himachal should be backed by skills that compete globally.”",
    maxBuildSteps: 2,
    notes: "Walked the journey from a Himachal engineering college into deep-tech systems and mentoring thousands of students. Transition: 'Before we talk about careers, let us understand where AI actually came from and the exponential forces reshaping your future.'",
  },

  // =========================================================================
  // ACT 1 — THE ORIGIN & EVOLUTION OF AI (HISTORY)
  // =========================================================================

  // SLIDE 5 — THE BIRTH OF AI (1943–1956)
  {
    id: "sunni_slide_5",
    type: "TIMELINE_EVOLUTION",
    badge: "ACT 1: AI HISTORY",
    title: "How Did We Get Here? The Birth of AI",
    subtitle: "AI did not start in 2023 with ChatGPT — it began with a fundamental question 80 years ago.",
    timeline: [
      {
        year: "1943",
        label: "Neuron as a Switch (McCulloch & Pitts) · Proposed that brain neurons behave like electrical ON/OFF switches; connecting enough switches can solve any computational problem.",
      },
      {
        year: "1950",
        label: "The Turing Test (Alan Turing) · Asked: 'Can a machine imitate human conversation so well that an interrogator cannot tell machine from human?'",
      },
      {
        year: "1956",
        label: "Dartmouth Conference (John McCarthy) · Coined the phrase 'Artificial Intelligence' and established AI as an official field of scientific inquiry.",
      },
    ],
    stats: [
      { value: "1943", label: "BINARY NEURON", sub: "Mathematical brain foundation" },
      { value: "1950", label: "TURING TEST", sub: "Imitation game benchmark" },
      { value: "1956", label: "DARTMOUTH", sub: "Birth of Artificial Intelligence" },
    ],
    quote: "“The dream was always machine reasoning — but it took 80 years of compute and data to catch up.”",
    maxBuildSteps: 2,
    notes: "Connect with the students: AI is not magic that appeared yesterday. In 1943, scientists proved the brain is a network of binary switches. Alan Turing asked if machines can think. Dartmouth named it. But why did it explode right now?",
  },

  // SLIDE 6 — FROM AI WINTER TO THE GENERATIVE EXPLOSION
  {
    id: "sunni_slide_6",
    type: "TIMELINE_EVOLUTION",
    badge: "ACT 1: THE EVOLUTION",
    title: "From AI Winter to The Generative Era",
    subtitle: "Three major cycles that transformed theoretical mathematics into everyday reality.",
    timeline: [
      {
        year: "1970s–80s",
        label: "The AI Winter · Theoretical hype outran compute capabilities; funding froze and researchers returned to fundamental statistical math.",
      },
      {
        year: "1997",
        label: "Deep Blue Defeats Garry Kasparov · IBM's supercomputer proved machines could out-calculate the greatest human world chess champion.",
      },
      {
        year: "2012+",
        label: "Deep Learning Boom · Massive internet data + GPU parallel processing + multi-layer neural networks shattered computer vision benchmarks.",
      },
      {
        year: "2022–2026",
        label: "The LLM & Reasoning Era · Foundation models (ChatGPT, Claude, Gemini) and autonomous agents capable of code generation, logic, and multimodal reasoning.",
      },
    ],
    stats: [
      { value: "1997", label: "CHESS VICTORY", sub: "Deep Blue symbolic search" },
      { value: "2012", label: "DEEP LEARNING", sub: "ImageNet & GPU revolution" },
      { value: "2022+", label: "FOUNDATION AI", sub: "LLMs & Agentic systems" },
    ],
    quote: "“Technology moves slowly through skepticism, and then suddenly hits an exponential curve.”",
    maxBuildSteps: 2,
    notes: "Explain the AI Winter: When hype runs ahead of compute, disappointment follows. But when compute and data caught up after 2012, AI hit an escape velocity. Now let us see what AI can actually do today.",
  },

  // =========================================================================
  // ACT 2 — SUPERHUMAN CAPABILITIES (THE SCIENTIFIC PROOF)
  // =========================================================================

  // SLIDE 7 — SUPERHUMAN CAPABILITY 1: ALPHAFOLD & PROTEIN FOLDING
  {
    id: "sunni_slide_7",
    type: "THREE_CARDS",
    badge: "ACT 2: EXPONENTIAL CAPABILITY",
    title: "Beyond Chatbots: Solving 50-Year Biological Mysteries",
    subtitle: "AI is not just writing essays — it is predicting molecular reality with 83%+ atomic accuracy.",
    cards: [
      {
        num: "01",
        title: "The 50-Year Grand Challenge",
        items: [
          "Proteins fold into 3D shapes that dictate all disease and life",
          "10^300 possible shapes per protein (Levinthal's Paradox)",
          "Physical X-ray crystallography took 3–5 years per single protein",
        ],
      },
      {
        num: "02",
        title: "AlphaFold: 83%+ Atomic Accuracy",
        items: [
          "DeepMind AlphaFold achieved >83%–90% GDT score accuracy",
          "Predicted structures for 200,000,000+ (200 Million) proteins",
          "Solved in months what would take 1,000,000+ human lab years",
        ],
      },
      {
        num: "03",
        title: "Nobel Prize in Chemistry 2024",
        items: [
          "Demis Hassabis & John Jumper awarded 2024 Nobel Prize",
          "Accelerating malaria vaccines, cancer cures & enzyme design",
          "Proof that AI now solves physical and biological sciences",
        ],
      },
    ],
    punchline: "When AI predicts 200 million proteins with 83%+ accuracy, textbook memorization is permanently obsolete.",
    maxBuildSteps: 3,
    notes: "Ask students: 'Who thought AI is only a chatbot that generates poems?' DeepMind AlphaFold solved the 50-year protein folding challenge with 83%+ accuracy, predicted 200 million proteins in months, and won the 2024 Nobel Prize in Chemistry. That is superhuman capability.",
  },

  // SLIDE 8 — SUPERHUMAN CAPABILITY 2: REINVENTING MATH FOR ITSELF
  {
    id: "sunni_slide_8",
    type: "THREE_CARDS",
    badge: "ACT 2: SUPERHUMAN REASONING",
    title: "AI Reinventing Mathematics For Itself",
    subtitle: "AI is no longer just repeating training data — it is discovering brand-new mathematical algorithms.",
    cards: [
      {
        num: "01",
        title: "FunSearch: LLMs Discovering Math",
        items: [
          "DeepMind paired LLMs with automated mathematical code evaluators",
          "Discovered novel solutions to the Cap Set Problem in combinatorics",
          "Discovered faster matrix multiplication algorithms humans missed for 50 years",
        ],
      },
      {
        num: "02",
        title: "AlphaGeometry: Olympiad Proofs",
        items: [
          "Solved International Mathematical Olympiad (IMO) geometry at silver medal level",
          "Synthesized complex auxiliary constructions without human hints",
          "Proved 25 of 30 Olympiad geometry problems within standard time limits",
        ],
      },
      {
        num: "03",
        title: "The Reality for College Students",
        items: [
          "AI is writing and discovering algorithms that human mathematicians missed",
          "Solving repetitive textbook math by hand gives zero competitive edge",
          "True human value has shifted to problem formulation and verification",
        ],
      },
    ],
    punchline: "You cannot compete with AI on calculation. You must compete on direction, judgment, and validation.",
    maxBuildSteps: 3,
    notes: "DeepMind's FunSearch paired LLMs with evaluators to discover new mathematics for the Cap Set Problem and faster algorithms that humans missed for decades. AI is reinventing mathematics for itself. Now, what does this do to entry-level jobs?",
  },

  // =========================================================================
  // ACT 3 — THE WAKE-UP CALL & REALITY CHECK (CREATE FEAR)
  // =========================================================================

  // SLIDE 9 — THE FRESHER HIRING COLLAPSE (6L TO 2.5L)
  {
    id: "sunni_slide_9",
    type: "COMPARISON_STATS",
    badge: "ACT 3: THE REALITY CHECK",
    title: "The Indian Fresher Hiring Collapse: 6 Lakh to 2.5 Lakh",
    subtitle: "The mass recruitment model that sustained Indian graduates for 20 years has permanently reset.",
    stat1: {
      year: "Earlier (2021–22)",
      count: "6,00,000+",
      label: "FRESHERS RECRUITED PER YEAR",
      ratio: "Mass IT & Private Sector Campus Influx",
    },
    stat2: {
      year: "Today (2025–26)",
      count: "~2,50,000",
      label: "FRESHERS RECRUITED PER YEAR",
      ratio: "Over 60% Decline in Mass Entry Hiring",
    },
    statCompetition: {
      number: "1.1 Crore",
      label: "GRADUATES ENTERING JOB MARKET EACH YEAR",
      detail: "Competition is no longer your classmate in Sunni — it is 1.1 Crore graduates nationwide.",
    },
    insightBox: {
      title: "Why did fresher hiring crash by 60%?",
      text: "For two decades, companies hired 6 lakh freshers to write routine boilerplate, perform manual testing, format spreadsheets, and draft summaries. AI now does all three in seconds at $0.001 marginal cost. Companies no longer pay freshers to practice; they demand Day-1 verified execution.",
    },
    maxBuildSteps: 4,
    notes: "[CREATE URGENCY WITH HARD DATA] Look at these numbers: Private sector and IT intake collapsed from 6,00,000 freshers to ~2,50,000. That is a 60% drop. Meanwhile, 1.1 Crore students graduate each year. If you walk out of Sunni college with only a textbook degree, who is hiring you?",
  },

  // SLIDE 10 — THE DEATH OF AVERAGE
  {
    id: "sunni_slide_10",
    type: "SCENARIO_SPLIT",
    badge: "ACT 3: THE NEW REALITY",
    title: "What You Should Worry About (The Death of Average)",
    subtitle: "The market no longer rewards average effort or generic degree credentials.",
    scenarioA: {
      title: "WHAT YOU SHOULD NOT WORRY ABOUT",
      subtitle: "Forces completely outside your control",
      steps: [
        { time: "EXPONENTIAL AI", label: "AI models will keep getting faster and smarter" },
        { time: "GLOBAL CAPITAL", label: "Trillions in compute investment will keep expanding" },
        { time: "ROUTINE AUTOMATION", label: "Routine repetitive tasks will vanish permanently" },
      ],
      footer: "Fighting AI or hoping it slows down is a guaranteed losing path.",
    },
    scenarioB: {
      title: "WHAT YOU MUST WORRY ABOUT",
      subtitle: "The only risk that matters for your career",
      steps: [
        { time: "STAYING AVERAGE", label: "Producing work that an AI model does in 5 seconds" },
        { time: "SYLLABUS-ONLY DEGREE", label: "Relying on exam marks without deployed proof of work" },
        { time: "ZERO PORTFOLIO", label: "Having no live systems or evidence on GitHub / LinkedIn" },
      ],
      footer: "The world no longer pays for average. It pays for verified execution.",
    },
    maxBuildSteps: 2,
    notes: "Stop worrying about what AI can do—that is outside your control. Worry about staying average in a world that no longer pays for average. If an AI can do your job in 10 seconds for fractions of a penny, why would anyone hire you?",
  },

  // SLIDE 11 — THE PROJECT LIFECYCLE: CHEAP VS VALUABLE
  {
    id: "sunni_slide_11",
    type: "MYTH_REALITY_PAIRS",
    badge: "THE VALUE SHIFT",
    title: "The Project Lifecycle: What Became Cheap vs. Valuable",
    subtitle: "Every business project follows 6 stages — AI altered the economics of every single stage.",
    pairs: [
      {
        myth: "Phase 1: Understanding Real User Pain",
        reality: "AI cannot talk to local shopkeepers or feel real frustration → Human Empathy & Problem Context = HIGHEST VALUE",
      },
      {
        myth: "Phase 2: Defining Product Specifications",
        reality: "AI generates generic me-too specifications → Business Judgment & Feature Prioritization = HIGH VALUE",
      },
      {
        myth: "Phase 3: System Architecture & Data Design",
        reality: "AI generates fragmented snippets without holistic understanding → System Thinking & Fault Tolerance = HIGH VALUE",
      },
      {
        myth: "Phase 4: Writing Code & First Drafts",
        reality: "LLMs generate boilerplate, syntax, and summaries in 5 seconds → Raw Syntax Typing = CHEAP COMMODITY",
      },
      {
        myth: "Phase 5: Critical Quality & Verification",
        reality: "AI hallucinates subtle, breaking bugs with total confidence → Evaluation, Benchmarking & Testing = HIGH VALUE",
      },
      {
        myth: "Phase 6: Production Accountability",
        reality: "AI has zero legal or personal skin in the game → Human Ownership & Operational Responsibility = HIGHEST VALUE",
      },
    ],
    punchline: "Raw syntax and first drafts are cheap. Judgment, architecture, and ownership are more valuable than ever.",
    maxBuildSteps: 3,
    notes: "Look at Phase 4: Writing code and drafting text. That is what entry-level jobs used to pay for. Now that is free. But Phase 1, 2, 3, 5, and 6 are worth fortunes. Move from being a typist to being a systems architect.",
  },

  // =========================================================================
  // ACT 4 — THE SOLUTION (WHAT EMPLOYERS URGENTLY NEED)
  // =========================================================================

  // SLIDE 12 — WHAT MODERN EMPLOYERS URGENTLY NEED
  {
    id: "sunni_slide_12",
    type: "THREE_CARDS",
    badge: "ACT 4: THE SOLUTION",
    title: "What Modern Employers Urgently Need",
    subtitle: "Entry-level hiring did not disappear — it relocated to high-leverage engineering ground.",
    cards: [
      {
        num: "01",
        title: "Token Discipline & Local Models",
        items: [
          "Companies cannot afford runaway cloud API token bills",
          "Need builders who can self-host open-weight models (Ollama, vLLM, Llama-3)",
          "Running AI locally on private data at zero marginal token cost",
        ],
      },
      {
        num: "02",
        title: "Production Reliability & Schemas",
        items: [
          "Probabilistic LLM outputs break enterprise databases",
          "Need engineers enforcing strict schemas (Pydantic, Zod)",
          "Automated evaluation suites (Ragas) and multi-stage containerization",
        ],
      },
      {
        num: "03",
        title: "Agentic AI Orchestration",
        items: [
          "Moving beyond passive chatbot prompts to multi-agent loops",
          "Autonomous tool calling, memory management, and graceful recovery",
          "Connecting AI models directly to production SQL databases and APIs",
        ],
      },
    ],
    punchline: "Stop using AI as a homework copy-paste tool. Start engineering AI systems that run real businesses.",
    maxBuildSteps: 3,
    notes: "Companies don't need prompt copy-pasters. They urgently need engineers who can run small models locally, enforce strict data validation, and connect AI agents to databases without crashing.",
  },

  // SLIDE 13 — LIVE POLL 02: WHAT MATTERS MOST IN HIRING?
  {
    id: "sunni_slide_13",
    type: "POLL",
    badge: "LIVE AUDIENCE PULSE 02",
    title: "Hiring Evaluation Reality Check",
    question: "What is the single most decisive factor when engineering and business managers evaluate fresh graduates today?",
    options: [
      "College Tier & Degree Brand Name",
      "Live Deployed Projects & System Proof of Work",
      "Memorized Textbook Definitions & Exam Percentages",
      "Number of Free Online Course Certificates",
      "Typing Speed & Syntax Memorization",
    ],
    maxBuildSteps: 1,
    notes: "Launch Poll 02. Let the room vote. The answer is obvious: Live deployed systems and proof of work beat paper credentials every single time.",
  },

  // SLIDE 14 — THE 100-CANDIDATE DROP-OFF FUNNEL
  {
    id: "sunni_slide_14",
    type: "DROPOUT_FUNNEL",
    badge: "ACT 5: THE STRATEGIC PLAYBOOK",
    title: "The 100-Candidate Drop-off Funnel",
    subtitle: "Where 98 out of 100 college applicants fail — and how you can break into the top 2%.",
    stages: [
      {
        stage: "Learning Basic Syntax",
        remaining: "100",
        drop: "Baseline",
        cause: "College students memorizing textbook syntax and exam definitions.",
      },
      {
        stage: "Building Production Systems",
        remaining: "25",
        drop: "75 Drop Out",
        cause: "Stuck in passive tutorial loops building toy clones that recruiters ignore.",
      },
      {
        stage: "Proof-Driven Resume",
        remaining: "5",
        drop: "20 Drop Out",
        cause: "Generic resumes without live links or measurable engineering metrics.",
      },
      {
        stage: "Technical & Whiteboard Loops",
        remaining: "2",
        drop: "3 Drop Out",
        cause: "Panic when asked to defend architecture and trade-offs without AI assistance.",
      },
      {
        stage: "Final Offers & High Compensation",
        remaining: "1–2",
        drop: "Hired",
        cause: "Standout candidates who prove execution, humility, and system ownership.",
      },
    ],
    punchline: "Your college in Sunni is not your barrier. Your proof of execution is your competitive edge.",
    maxBuildSteps: 4,
    notes: "Walk through the funnel. 100 start. 75 drop out building tutorial clones. 20 drop out on generic resumes. If you simply build 2 production systems and learn to defend them, you defeat 98% of applicants.",
  },

  // =========================================================================
  // ACT 5 — KEY ROLES FOR SUNNI STUDENTS (STREAM-SPECIFIC)
  // =========================================================================

  // SLIDE 15 — STREAM OPPORTUNITIES: BCA & TECH STUDENTS
  {
    id: "sunni_slide_15",
    type: "STREAM_ROLES",
    badge: "BCA & TECH SPECIALIZATION",
    stream: "BCA & TECH",
    title: "High-Value Roles for BCA Students",
    subtitle: "Transitioning from routine syntax coder to high-leverage AI systems engineer.",
    roles: [
      {
        num: "01",
        title: "Generative AI Engineer",
        desc: "Architecting retrieval-augmented generation (RAG) pipelines, semantic embeddings, and local model inference.",
      },
      {
        num: "02",
        title: "Agentic Systems Developer",
        desc: "Building multi-agent workflows with autonomous tool execution, state memory, and deterministic fallbacks.",
      },
      {
        num: "03",
        title: "Full-Stack AI Engineer",
        desc: "Connecting reactive web/mobile user interfaces to asynchronous FastAPI microservices and AI endpoints.",
      },
      {
        num: "04",
        title: "Production Backend Engineer",
        desc: "Designing resilient REST/gRPC APIs, PostgreSQL composite indexing, Redis caching, and Docker CI/CD.",
      },
    ],
    maxBuildSteps: 4,
    notes: "For BCA students: Stop calling yourself a junior coder who knows HTML/CSS. Re-orient to Generative AI Engineer or Backend Systems Engineer building containerized microservices.",
  },

  // SLIDE 16 — STREAM OPPORTUNITIES: B.SC SCIENCE & MATHEMATICS
  {
    id: "sunni_slide_16",
    type: "STREAM_ROLES",
    badge: "B.SC SCIENCE & MATH SPECIALIZATION",
    stream: "B.SC SCIENCE",
    title: "High-Value Roles for B.Sc Students",
    subtitle: "Combining scientific domain rigor with modern computational intelligence.",
    roles: [
      {
        num: "01",
        title: "Data Scientist & ML Analyst",
        desc: "Extracting actionable predictive intelligence from complex experimental, numerical, and biological datasets.",
      },
      {
        num: "02",
        title: "Bioinformatics & Computational Bio",
        desc: "Applying structural prediction tools (AlphaFold) to pharmaceutical, agricultural, and genomics research.",
      },
      {
        num: "03",
        title: "Scientific ML / Research Associate",
        desc: "Implementing physics-informed neural networks (PINNs) and mathematical simulation algorithms.",
      },
      {
        num: "04",
        title: "Predictive Modeler",
        desc: "Statistical forecasting for agriculture, weather patterns, environmental hydrology, and drug discovery.",
      },
    ],
    maxBuildSteps: 4,
    notes: "For B.Sc students: Your advantage is scientific domain depth. You understand biology, chemistry, and differential equations. When you combine that with data science and AI modeling, you enter premium biotech and research fields.",
  },

  // SLIDE 17 — STREAM OPPORTUNITIES: B.COM & BBA COMMERCE
  {
    id: "sunni_slide_17",
    type: "STREAM_ROLES",
    badge: "B.COM & BBA SPECIALIZATION",
    stream: "COMMERCE & BBA",
    title: "High-Value Roles for B.Com & BBA Students",
    subtitle: "Deploying AI to supercharge financial auditing, operations, and corporate strategy.",
    roles: [
      {
        num: "01",
        title: "AI Financial Analyst",
        desc: "Automating financial statement audits, algorithmic forecasting, portfolio risk evaluation, and variance reporting.",
      },
      {
        num: "02",
        title: "GenAI Business Operations Lead",
        desc: "Implementing automated enterprise workflows across supply chains, inventory, and customer lifecycle management.",
      },
      {
        num: "03",
        title: "Quantitative Growth Analyst",
        desc: "Analyzing multi-channel customer acquisition metrics, unit economics, and churn prediction models.",
      },
      {
        num: "04",
        title: "AI Business Process Consultant",
        desc: "Auditing legacy corporate operations and implementing cost-saving automated AI agent workflows.",
      },
    ],
    maxBuildSteps: 4,
    notes: "For B.Com and BBA students: Traditional data entry is automated. But companies pay top salaries to people who understand finance AND know how to orchestrate AI agents to analyze balance sheets.",
  },

  // SLIDE 18 — STREAM OPPORTUNITIES: BA & HUMANITIES
  {
    id: "sunni_slide_18",
    type: "STREAM_ROLES",
    badge: "BA & HUMANITIES SPECIALIZATION",
    stream: "BA & HUMANITIES",
    title: "High-Value Roles for BA Students",
    subtitle: "Language, context, critical ethics, and human nuance are the ultimate AI interfaces.",
    roles: [
      {
        num: "01",
        title: "Context & Prompt Architect",
        desc: "Crafting structured domain taxonomies, multi-agent behavioral personas, and complex system prompts.",
      },
      {
        num: "02",
        title: "AI Content & Editorial Strategist",
        desc: "Directing generative media engines, evaluating voice and tone, and crafting narrative architectures.",
      },
      {
        num: "03",
        title: "AI Ethics & Governance Specialist",
        desc: "Auditing model outputs for bias, copyright, regulatory compliance, and responsible AI guardrails.",
      },
      {
        num: "04",
        title: "Digital Transformation Coordinator",
        desc: "Training corporate workforces on practical AI tooling, change management, and human-in-the-loop workflows.",
      },
    ],
    maxBuildSteps: 4,
    notes: "For BA students: AI operates entirely in human language. The people who structure prompts, ensure cultural context, audit bias, and bridge humans with AI tools are indispensable.",
  },

  // =========================================================================
  // ACT 6 — THE 5-STEP ACTION PLAYBOOK TO THRIVE
  // =========================================================================

  // SLIDE 19 — STEP 1: MASTER INDUSTRY-GRADE SKILLS
  {
    id: "sunni_slide_19",
    type: "DEDICATED_ROADMAP",
    badge: "PLAYBOOK STEP 01",
    title: "Step 1 — Master Non-Negotiable Industry Skills",
    subtitle: "Bridge the gap between college textbook syllabus and modern engineering infrastructure.",
    foundation: [
      "Algorithmic Problem Solving & Data Structures",
      "Modular Object-Oriented & Functional Code",
      "Relational Database Design & PostgreSQL Indexing",
      "RESTful APIs (FastAPI / Node.js) & Linux CLI",
      "Version Control with Git & GitHub Pull Requests",
    ],
    industrySkills: [
      "Docker Containers & Multi-Stage Image Builds",
      "In-Memory Caching & Queues with Redis",
      "Self-Hosting Small Local Models (Ollama / vLLM)",
      "Vector Retrieval & Semantic RAG (pgvector)",
      "Strict Schema Enforcement (Pydantic / Zod)",
    ],
    mindset: "Stop treating AI as a magical oracle. Treat it as a probabilistic microservice with concrete latency, error budgets, and token costs.",
    maxBuildSteps: 3,
    notes: "Master the fundamentals that outlast trends: Git, Docker, PostgreSQL. When combined with local AI models, you become a 10x builder.",
  },

  // SLIDE 20 — STEP 2: BUILD PRODUCTION SYSTEMS
  {
    id: "sunni_slide_20",
    type: "BUILD_VS_TUTORIAL",
    badge: "PLAYBOOK STEP 02",
    title: "Step 2 — Build Production Systems (Not Weekend Wrappers)",
    subtitle: "The Zero-Tolerance Toy Project Rule: Build systems an AI model update cannot erase overnight.",
    left: {
      title: "THE TOY TUTORIAL TRAP",
      items: [
        "20 lines of Python wrapping an OpenAI API key",
        "Copied Netflix or Todo list tutorial with hardcoded data",
        "Zero database indexing, no security, no tests",
        "Runs only on localhost:3000 — disappears when laptop shuts",
      ],
    },
    right: {
      title: "THE PRODUCTION SYSTEM STANDARD",
      items: [
        "Ingestion pipeline processing messy real-world domain data",
        "Strict Pydantic schema validation & zero unhandled crashes",
        "Automated evaluation benchmarks & latency profiling",
        "Multi-stage Docker container deployed to a live cloud URL",
      ],
    },
    maxBuildSteps: 2,
    notes: "Recruiters reject resumes with generic Todo apps or 20-line OpenAI wrappers. Build one serious production system that solves a real problem, has tests, and runs on a live URL.",
  },

  // SLIDE 21 — STEP 3: PROOF-DRIVEN RESUME (GOOGLE X-Y-Z)
  {
    id: "sunni_slide_21",
    type: "PROOF_HIERARCHY",
    badge: "PLAYBOOK STEP 03",
    title: "Step 3 — Construct a Proof-Driven Resume",
    subtitle: "Recruiters spend 6 seconds scanning. Make your proof impossible to miss.",
    layers: [
      {
        label: "THE 6-SECOND SCAN",
        desc: "Recruiters scan top-to-bottom hunting for live deployment links, GitHub repositories, and quantified impact.",
      },
      {
        label: "WEAK RESUME BULLET",
        desc: "“Built an AI chatbot using Python and OpenAI API.” (0 Metrics, 0 Engineering Proof, 0 Differentiation)",
      },
      {
        label: "THE GOOGLE X-Y-Z FORMULA",
        desc: "Accomplished [X], as measured by [Y], by doing [Z] — e.g., 'Engineered an asynchronous RAG pipeline processing 5,000+ local documents with sub-250ms latency using PostgreSQL pgvector and FastAPI.'",
      },
    ],
    punchline: "Live clickable URLs in the top 3 inches of your resume turn a 6-second scan into an immediate interview.",
    maxBuildSteps: 3,
    notes: "Use Google's X-Y-Z formula. Put your live clickable link right at the top of your resume. When an interviewer can open your project on their phone, you have won.",
  },

  // SLIDE 22 — STEP 4: HIGH-SIGNAL STRATEGIC OUTREACH
  {
    id: "sunni_slide_22",
    type: "SCENARIO_SPLIT",
    badge: "PLAYBOOK STEP 04",
    title: "Step 4 — High-Signal Outreach vs. The ATS Black Hole",
    subtitle: "Stop competing on crowded job boards alongside 5,000 identical applicants.",
    scenarioA: {
      title: "THE COLD ATS BLACK HOLE",
      subtitle: "The spray-and-pray trap",
      steps: [
        { time: "SUBMISSION", label: "Submitting 200 identical PDF resumes on LinkedIn Easy Apply" },
        { time: "PARSING", label: "Filtered out automatically by automated ATS keyword bots" },
        { time: "OUTCOME", label: "99.5% silence, rejection emails, and student demoralization" },
      ],
      footer: "Mass-applying to job portals produces fatigue, not offers.",
    },
    scenarioB: {
      title: "THE HIGH-SIGNAL STRATEGY",
      subtitle: "Proof-of-work direct outreach",
      steps: [
        { time: "TARGET", label: "Identify 10 high-growth tech startups or GCC engineering teams" },
        { time: "AUDIT", label: "Analyze their product, find a performance bug, or build a mini-tool" },
        { time: "OUTREACH", label: "Send a 90-second Loom demo directly to the Engineering Lead" },
      ],
      footer: "Engineering leaders hire proactive builders who solve their immediate headaches.",
    },
    maxBuildSteps: 2,
    notes: "Don't be applicant #4,500 on LinkedIn. Audit a company's app, build a small tool solving one of their bugs, and send a 90-second video demo to their engineering manager.",
  },

  // SLIDE 23 — STEP 5: WHITEBOARD DEFENSE & SYSTEM OWNERSHIP
  {
    id: "sunni_slide_23",
    type: "THREE_CARDS",
    badge: "PLAYBOOK STEP 05",
    title: "Step 5 — Whiteboard Defense: Owning Your Architecture",
    subtitle: "Never place a project on your resume that you cannot defend on a whiteboard without AI.",
    cards: [
      {
        num: "01",
        title: "Architectural Trade-offs",
        items: [
          "Explain why you chose PostgreSQL over NoSQL",
          "Defend your database indexes, connection pools & cache TTLs",
          "Explain your query latency profiles under concurrent load",
        ],
      },
      {
        num: "02",
        title: "Failure Mode Resilience",
        items: [
          "What happens when the AI model times out or rate limits?",
          "How does your backend handle malformed payloads or data corruption?",
          "Defend fallback caches, retry budgets, and dead-letter queues",
        ],
      },
      {
        num: "03",
        title: "Humility & Collaboration",
        items: [
          "Never become defensive when an interviewer critiques your code",
          "Top teams hire collaborative teammates, not rigid know-it-alls",
          "Ask clarifying questions and work through edge cases calmly",
        ],
      },
    ],
    punchline: "If you cannot explain your code on a whiteboard, you do not own the system — you borrowed debt.",
    maxBuildSteps: 3,
    notes: "If I take away Copilot and ask you to draw your project on a whiteboard, could you do it? You must own every single line of code and architectural decision.",
  },

  // =========================================================================
  // ACT 7 — UNISOLE SOLUTION & ACCREDITATION (ACTION PLAN)
  // =========================================================================

  // SLIDE 24 — A COURSE IS NOT A CAREER
  {
    id: "sunni_slide_24",
    type: "COURSE_VS_CAREER",
    badge: "PARADIGM SHIFT",
    title: "A Course Is Not a Career",
    subtitle: "Why online certificates fail to get you hired, but verified production systems succeed.",
    normalCourse: [
      "Passive video watching while scrolling on a phone",
      "Syntax memorization forgotten 2 weeks later",
      "Copy-pasting tutor code into localhost tutorials",
      "PDF certificate that no hiring manager verifies",
    ],
    careerProgram: [
      "Live systems engineering on real production infrastructure",
      "2 containerized capstone systems built from scratch",
      "Automated evaluation benchmarks & live cloud deployment",
      "Whiteboard architectural defense & direct Talent Pool access",
    ],
    punchline: "A certificate proves attendance. A production portfolio proves capability.",
    maxBuildSteps: 2,
    notes: "Certificates do not get people hired in 2026. Production systems do. Stop collecting PDF certificates. Start building verifiable systems.",
  },

  // SLIDE 25 — UNISOLE INDUSTRIAL TRAINING PROGRAM FOR ABV GDC SUNNI
  {
    id: "sunni_slide_25",
    type: "PROGRAM_OVERVIEW",
    badge: "THE ROADMAP",
    title: "UNISOLE Industrial Training cum Internship Program",
    subtitle: "3-MONTH INTENSIVE HANDS-ON TRACK · ABV GDC SUNNI",
    pillars: [
      "Month 1: Systems & Core Foundations (Python, PostgreSQL, FastAPI, Git & Linux)",
      "Month 2: Applied AI, LLMs & Containers (Local Ollama, pgvector RAG, Redis, Docker)",
      "Month 3: Production Deployment & Placement (CI/CD, Evals, Portfolio, Whiteboard Defense)",
      "Dedicated Lab Mentorship by Engineers from NIT Hamirpur, IIT Delhi & BlackRock",
      "Direct Access to UNISOLE Talent Pool for Industry Internships and Live Projects",
    ],
    maxBuildSteps: 2,
    notes: "Month 1 builds unshakeable fundamentals. Month 2 teaches local AI and containerized pipelines. Month 3 deploys your capstones to the cloud and prepares you to defend them.",
  },

  // SLIDE 26 — ACCREDITATION & JOINT CERTIFICATE
  {
    id: "sunni_slide_26",
    type: "CERTIFICATE_SHOWCASE",
    badge: "ACCREDITATION",
    title: "JOINT CERTIFICATE OF EXCELLENCE",
    subtitle: "NIT HAMIRPUR × IAPT × UNISOLE",
    note: "Awarded exclusively upon successful deployment of containerized capstones and successful defense in whiteboard technical code reviews.",
    maxBuildSteps: 2,
    notes: "This certificate is backed by NIT Hamirpur and IAPT. It is not handed out for video watching; it is earned by deploying real systems and defending your code.",
  },

  // SLIDE 27 — UNISOLE TALENT POOL PIPELINE
  {
    id: "sunni_slide_27",
    type: "TALENT_POOL_PIPELINE",
    badge: "CAREER PIPELINE",
    title: "Perform Well → Get Noticed → Get Hired",
    subtitle: "A direct bridge from college training to industry internships and enterprise projects.",
    steps: [
      "Stage 01: Complete Weekly Hands-on Lab Milestones",
      "Stage 02: Deploy Containerized Capstones to Live Cloud",
      "Stage 03: Induction into the Exclusive UNISOLE Talent Pool",
      "Stage 04: Direct Matching with Startups & Corporate Internships",
    ],
    disclaimer: "Top performers are directly recommended to partner startups, GCCs, and deep-tech engineering teams.",
    maxBuildSteps: 2,
    notes: "Perform well during the 3 months, get inducted into the UNISOLE Talent Pool, and receive direct internship and project placement opportunities.",
  },

  // SLIDE 28 — THE 30-DAY SUNNI ACTION CHALLENGE & ENROLLMENT (CTA)
  {
    id: "sunni_slide_28",
    type: "ENROLLMENT_CTA",
    badge: "TAKE ACTION TODAY",
    title: "The 30-Day Sunni Student Action Challenge",
    subtitle: "Four immediate actions you can take today to permanently alter your career trajectory.",
    actions: [
      "Archive toy tutorial clones from your GitHub profile",
      "Pick one real domain problem in Himachal Pradesh and architect a working system",
      "Deploy it to a live cloud URL with automated tests and an architectural README",
      "Register for the UNISOLE Industrial Training Program today",
    ],
    qrPrompt: "Scan QR Code to Register for the ABV GDC Sunni Program",
    qrUrl: "https://unisole.org/programs/sunni",
    maxBuildSteps: 2,
    notes: "Closing call to action: 'In an era where fresher hiring shrinks by 60% and AI writes routine code, degree alone is not enough. But a student from Sunni who can build, deploy, and defend real production systems will outcompete a textbook graduate every single day. Your future begins today.' Scan the QR code to register.",
  },
];
