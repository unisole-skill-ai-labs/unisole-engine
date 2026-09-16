export const SANJAULI_COLLEGE_PPT_SLIDES = [
  // SLIDE 1 — HOOK COVER
  {
    id: "sanjauli_slide_1",
    type: "COVER",
    badge: "INDUSTRIAL TRAINING & INTERNSHIP PROGRAM",
    title: "UNISOLE",
    subtitle: "Industrial Training cum Internship Opportunity Program · Centre of Excellence Govt. College Sanjauli (BCA Department)",
    org: "UNISOLE SKILL AI LABS",
    maxBuildSteps: 2,
    notes: "BUILD: UNISOLE → thin orange line → program name. Centre of Excellence Govt. College Sanjauli BCA orientation. Minimal dark navy background. No bullet points. No program explanation.",
  },

  // SLIDE 2 — THE HOOK QUESTION
  {
    id: "sanjauli_slide_2",
    type: "BIG_QUESTION",
    badge: "THE HOOK QUESTION",
    title: "आगे क्या सोचा है?",
    subtitle: "Think honestly — what have you planned after graduation?",
    maxBuildSteps: 1,
    notes: "This is the ONLY Hindi slide. Nothing else. No English. No poll. No subtitle on screen. Pause and ask students verbally: 'Think honestly — what have you planned after graduation?'",
  },

  // SLIDE 3 — CAREER SURVEY
  {
    id: "sanjauli_slide_3",
    type: "POLL",
    badge: "LIVE POLL 01",
    title: "Career Pulse for BCA Students",
    question: "What is your primary career target after your BCA?",
    options: [
      "Software Engineering & Backend APIs",
      "AI / ML & Intelligent Systems",
      "Cloud, DevOps & Systems Engineering",
      "Higher Studies (MCA / Specialized MS)",
      "Still Deciding / Exploring Options",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 01. Large live-result area. Show percentages dynamically after students vote. Presenter transition: 'Interesting. Let\'s keep this result in mind and understand what the actual post-bubble tech market looks like.'",
  },

  // SLIDE 4 — CREDIBILITY
  {
    id: "sanjauli_slide_4",
    type: "FOUNDER_BIO",
    badge: "CREDIBILITY",
    title: "AJAY MOKTA",
    subtitle: "Founder — UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur",
    initials: "AM",
    credentials: [
      "B.Tech — NIT Hamirpur",
      "AI Educator & Keynote Speaker",
      "Innovator & Deep-Tech Entrepreneur",
      "Mentored 5,000+ students across India",
    ],
    quote: "“A degree from any college in Himachal should be backed by skills that compete globally.”",
    sideSection: {
      title: "UNISOLE",
      items: ["AI Education", "Systems Engineering", "Career Awareness", "Production Projects"],
    },
    maxBuildSteps: 3,
    notes: "Build trust before dissecting the industry shifts.",
  },

  // SLIDE 5 — OUR TEAM
  {
    id: "sanjauli_slide_5",
    type: "TEAM_GRID",
    badge: "OUR TEAM",
    title: "Meet Our Team",
    subtitle: "Built by practitioners and engineers from top-tier institutions.",
    pillars: ["AI SYSTEMS", "BACKEND ARCHITECTURE", "INDUSTRY RESEARCH", "MENTORSHIP"],
    members: [
      {
        initials: "AM",
        name: "Ajay Mokta",
        role: "Founder — UNISOLE · B.Tech, NIT Hamirpur · Mentored 5k+ students",
      },
      {
        initials: "GG",
        name: "Girish Gaurav Sharma",
        role: "CTO @ UNISOLE · 20th Rank NASA Space Apps · AIR 1 AIEC-DAE",
      },
      {
        initials: "SP",
        name: "Shabd Patel",
        role: "B.Tech, NIT Hamirpur · Software Engineer at BlackRock · AI Expert",
      },
      {
        initials: "KK",
        name: "Kushal Kesharwani",
        role: "IIT Patna · Engineer — Tech Mahindra · Industry Expert",
      },
      {
        initials: "AK",
        name: "Aditya Kaushal",
        role: "M.Tech — IIT Delhi · Academic & Technical Expert at UNISOLE",
      },
    ],
    maxBuildSteps: 3,
    notes: "Mentors from BlackRock, Tech Mahindra, NASA challenge, IIT & NIT.",
  },

  // SLIDE 6 — TRANSITION: THE REAL QUESTION
  {
    id: "sanjauli_slide_6",
    type: "TEXT_TRANSITION",
    badge: "A VITAL QUESTION",
    title: "If tech opportunities are exploding globally...",
    subtitle: "Why are so many BCA students anxious, uncertain, and struggling to break through?",
    maxBuildSteps: 2,
    notes: "Dark slide. Use a dramatic pause before revealing the subtitle.",
  },

  // SLIDE 7 — THE MODERN TECH ECOSYSTEM MAP
  {
    id: "sanjauli_slide_7",
    type: "ECOSYSTEM_HUB",
    badge: "THE TECH LANDSCAPE",
    title: "Where Do Modern Software Engineers Actually Work?",
    subtitle: "Your degree is a starting point — the global tech landscape has expanded far beyond legacy IT service desks.",
    centerLabel: "TECH ECOSYSTEM",
    items: [
      "AI & Deep-Tech Labs",
      "Global Capability Centres (GCCs)",
      "Product Startups (Seed to Series B)",
      "High-Growth Enterprise SaaS",
      "Cloud & DevOps Infrastructure",
      "FinTech & Algorithmic Systems",
      "Remote / Global Engineering Teams",
      "Open-Source Tooling & Developer Infrastructure",
    ],
    punchline: "The modern software ecosystem rewards domain depth, resilience, and verified code over pedigree.",
    maxBuildSteps: 3,
    notes: "Build the ecosystem around TECH ECOSYSTEM. Highlight that opportunities extend far beyond mass IT service hiring.",
  },

  // SLIDE 8 — THE INFORMATION GAP
  {
    id: "sanjauli_slide_8",
    type: "THREE_CARDS",
    badge: "INFORMATION GAP",
    title: "Why Don't BCA Students Hear About These Roles?",
    subtitle: "The market changed exponentially faster than academic career advice.",
    cards: [
      {
        num: "01",
        title: "Traditional College Advice",
        items: [
          "Parents, relatives, and general seniors",
          "Focus on legacy government exams or mass recruiting drives",
          "Advice rooted in the 2005–2015 tech market",
        ],
      },
      {
        num: "02",
        title: "Academic Syllabus Lag",
        items: [
          "Textbook syntax without modern toolchains (Docker, Git, CI/CD)",
          "Focus on theoretical exams rather than live deployed architectures",
          "Zero exposure to microservices, async queues, or local LLMs",
        ],
      },
      {
        num: "03",
        title: "The Modern Engineering Reality",
        items: [
          "Containerized backends, REST/gRPC contracts, and API performance",
          "Small open-weight AI models (Ollama, vLLM) & vector embeddings",
          "Proof-of-work hiring: live GitHub repos, Dockerfiles & public demos",
        ],
      },
    ],
    punchline: "The industry demands production builders while traditional advice remains stuck in legacy theory.",
    maxBuildSteps: 3,
    notes: "Three large cards showing why standard guidance lagged behind real-world engineering shifts.",
  },

  // SLIDE 9 — THE EDUCATION SURGE
  {
    id: "sanjauli_slide_9",
    type: "EDUCATION_SHIFT",
    badge: "EDUCATION SHIFT",
    title: "The Indian Higher Education Surge",
    subtitle: "More graduates than ever before. A degree alone is no longer enough to differentiate yourself.",
    stat1: {
      year: "1990–91",
      count: "~49 LAKH",
      label: "Higher Education Enrolment",
      ratio: "GER ≈ 6%",
    },
    stat2: {
      year: "2023–24",
      count: "~4.5 CRORE",
      label: "Higher Education Enrolment",
      ratio: "GER ≈ 30% (9x surge)",
    },
    punchline: "When millions hold a degree, companies filter candidates by proof of execution, not certificates.",
    maxBuildSteps: 3,
    notes: "Large visual comparison with animated bars. Highlight that a degree alone is no longer a moat—verifiable capability is.",
  },

  // SLIDE 10 — WHAT MODERN TECH OFFERS BCA GRADUATES
  {
    id: "sanjauli_slide_10",
    type: "BENEFITS_GRID",
    badge: "CAREER ADVANTAGES",
    title: "What Can a Modern Tech Career Offer You?",
    subtitle: "One strong technical foundation → Multiple roles → Compounding career upside.",
    benefits: [
      { title: "REMOTE & HYBRID WORK", value: "Global", sub: "Build for world-class teams from Shimla" },
      { title: "PERFORMANCE-DRIVEN PAY", value: "Compounding", sub: "Merit-based compensation that scales with impact" },
      { title: "RAPID MERITOCRACY", value: "Fast Track", sub: "Promotions based on shipping code, not seniority" },
      { title: "CONTINUOUS CUTTING-EDGE TECH", value: "AI & Cloud", sub: "Work with modern LLM pipelines & cloud infra" },
      { title: "2,100+ GCC HUBS IN INDIA", value: "Enterprise", sub: "Global engineering headquarters operating in India" },
    ],
    maxBuildSteps: 3,
    notes: "Highlight the immense upside of modern software engineering: remote capability, meritocracy, and 2,100+ GCCs in India.",
  },

  // SLIDE 11 — LIVE POLL 02
  {
    id: "sanjauli_slide_11",
    type: "POLL",
    badge: "LIVE POLL 02",
    title: "What Matters Most in Modern Software Hiring?",
    question: "What do top tech hiring managers value most when evaluating junior engineers?",
    options: [
      "College Tier & Degree Name",
      "Live Deployed Projects & System Proof",
      "Problem Solving & CS Fundamentals",
      "Quantity of Online Course Certificates",
      "Syntax Memorization & Typing Speed",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 02. Let students vote. Transition: 'Now let\'s look at how the tech industry actually evaluated talent in 2026.'",
  },

  // SLIDE 12 — ACT 1: BEYOND THE HYPE & PANIC TRIGGER
  {
    id: "sanjauli_slide_12",
    type: "MYTH_REALITY_PAIRS",
    badge: "ACT 1: THE WAKE-UP CALL",
    title: "Beyond the Hype — The New Rules of Tech Careers",
    subtitle: "Navigating the Post-Bubble AI Market for BCA Students",
    pairs: [
      {
        myth: "“AI can write code now, software engineering is dead, don't bother learning to code.”",
        reality: "Syntax typing is dead. Software engineering—deciding what to build, handling failure modes, and keeping systems alive—is more in demand than ever.",
      },
      {
        myth: "“Speed of typing syntax gets you hired.”",
        reality: "Landing an engineering role today is not about typing speed; it is about building reliable, maintainable systems with clean data contracts.",
      },
      {
        myth: "“Glossy social media demos represent real industry jobs.”",
        reality: "The tech landscape has shifted decisively from speculative 'cool demos' to disciplined 'production systems' with verified enterprise ROI.",
      },
    ],
    maxBuildSteps: 3,
    notes: "Audience Question #1 (The Panic Trigger): 'Raise your hand if you’ve seen a post saying AI can write code now, software engineering is dead, don't bother learning to code. Be honest—who here is worried about this?'\n\nSpeaker Hook: 'Syntax typing is dead. Software engineering—deciding what to build, handling failure modes, and keeping systems alive—is more in demand than ever.'",
  },

  // SLIDE 13 — CODING IS NO LONGER THE BOTTLENECK
  {
    id: "sanjauli_slide_13",
    type: "THREE_CARDS",
    badge: "SYSTEM COMPLEXITY",
    title: "Coding is No Longer the Bottleneck",
    subtitle: "Speed vs. Specification — The Changing Dynamics of Software Engineering",
    cards: [
      {
        num: "01",
        title: "Exponential Agent Horizon",
        items: [
          "Task horizon capabilities for AI agents have historically doubled every 7 months",
          "Code generation & boilerplate scaffolding occur in seconds",
          "Raw syntax is no longer a scarce economic skill",
        ],
      },
      {
        num: "02",
        title: "The True Bottleneck",
        items: [
          "Not 'How do I write this loop?'",
          "Can you define clear, unambiguous specifications?",
          "Can you handle corner cases and user constraints?",
          "Can you systematically verify the output actually works?",
        ],
      },
      {
        num: "03",
        title: "From Coder to System Architect",
        items: [
          "Design system interfaces and data contracts",
          "Defensive error handling and boundary testing",
          "Understanding latency profiles, caching & fallbacks",
        ],
      },
    ],
    punchline: "Anyone can scaffold code in seconds. The bottleneck is defining specs and verifying resilience.",
    maxBuildSteps: 3,
    notes: "Speed vs. Spec: The new bottleneck is no longer 'How do I write this algorithm?' but 'Can I define a clear spec, handle user needs, and verify that the output actually works?'",
  },

  // SLIDE 14 — THE 2021-2026 RESET & CREDENTIAL INSECURITY
  {
    id: "sanjauli_slide_14",
    type: "TIMELINE_EVOLUTION",
    badge: "THE 2021–2026 CYCLE",
    title: "Why Has Tech Hiring Shifted? (The Great Reset)",
    subtitle: "Understanding Macro Market Waves & The Credential Insecurity",
    timeline: [
      {
        year: "2021–2022 (Pandemic Surge)",
        label: "Zero-interest rates + remote lockdown created an artificial tech hiring surge with loose evaluation standards.",
      },
      {
        year: "2022–2023 (Generative AI FOMO)",
        label: "Corporate talent hoarding. Companies hired anyone with 'AI' on their resume with zero clear product ROI.",
      },
      {
        year: "2024–2026 (The Great Reset)",
        label: "Fiscal discipline returned. Speculative hiring froze. Teams pivot strictly to verified execution, cost efficiency, and bottom-line ROI.",
      },
    ],
    quote: "“In a boom market, pedigree gets people hired into rotation pools. In a disciplined market, companies hire verified execution. A BCA student with a live, containerized, documented project beats a textbook B.Tech student with zero production experience every single day.”",
    maxBuildSteps: 3,
    notes: "Audience Question #2 (The Credential Insecurity): 'How many of you feel that because you are pursuing a BCA rather than a B.Tech from a top-tier university, top companies won't give you a chance?'\n\nSpeaker Hook: 'In a boom market, pedigree gets people hired into rotation pools. In a disciplined market, companies hire verified execution. A BCA student with a live, containerized, documented project beats a textbook B.Tech student with zero production experience every single day.'",
  },

  // SLIDE 15 — WHAT EMPLOYERS URGENTLY NEED
  {
    id: "sanjauli_slide_15",
    type: "THREE_CARDS",
    badge: "EMPLOYER DEMAND",
    title: "Should You Worry? What Employers Urgently Need",
    subtitle: "Entry-level hiring feels scarce only if you rely on the 2022 tutorial playbook.",
    cards: [
      {
        num: "01",
        title: "Cost & Token Discipline",
        items: [
          "Engineers who drastically reduce cloud API and token expenses",
          "Prompt caching, compact context windows, and efficient embeddings",
          "Knowing when NOT to call an expensive proprietary model",
        ],
      },
      {
        num: "02",
        title: "Open-Weight & Local Models",
        items: [
          "Developers building with small, self-hosted models (Ollama, vLLM)",
          "Enterprise data privacy, on-premise compliance & quantization",
          "Deploying 3B–8B models at zero marginal token cost",
        ],
      },
      {
        num: "03",
        title: "Production Resilience",
        items: [
          "Builders with product sense who test against real production edge cases",
          "Automated evaluation suites & deterministic schema fallbacks",
          "Containerized microservices that stay online under stress",
        ],
      },
    ],
    punchline: "Companies face a severe shortage of engineers who actually know how to deploy, evaluate, and maintain software.",
    maxBuildSteps: 3,
    notes: "What Companies Desperately Seek: Engineers who reduce cloud costs, developers who build with small open-weight models, and builders who test code against production edge cases.",
  },

  // SLIDE 16 — VIBE CODING & THE REALITY CHECK
  {
    id: "sanjauli_slide_16",
    type: "MYTH_REALITY_PAIRS",
    badge: "ACT 2: THE DOUBLE-EDGED SWORD",
    title: "Vibe Coding: Power vs. The Illusion of Competence",
    subtitle: "Modern AI Tools (Claude Code, Cursor, Copilot) — Power vs. Whiteboard Reality",
    pairs: [
      {
        myth: "The Superpower",
        reality: "Instant scaffolding, rapid prototyping, and dropping the cost of failure to a lost weekend. Builders can test ideas in hours rather than months.",
      },
      {
        myth: "The Illusion of Competence",
        reality: "Mistaking AI-generated syntax for personal architectural understanding. Piling prompt upon prompt creates brittle, unreadable 'spaghetti code.'",
      },
      {
        myth: "The Whiteboard Reality Check",
        reality: "If you cannot explain memory management, concurrency, edge cases, and failure modes on a whiteboard without an AI prompt, you cannot pass a technical loop.",
      },
    ],
    maxBuildSteps: 3,
    notes: "Audience Question #3 (The Reality Check): 'If I took away ChatGPT, Claude, and Copilot right now and asked you to build a simple CRUD API and connect it to a database on a whiteboard, could you do it?'\n\nSpeaker Hook: 'If you can't explain the code on a whiteboard, you don't own the system—you borrowed debt.'",
  },

  // SLIDE 17 — TECHNICAL DEBT: MORTGAGE VS CREDIT CARD
  {
    id: "sanjauli_slide_17",
    type: "SCENARIO_SPLIT",
    badge: "ARCHITECTURAL OWNERSHIP",
    title: "Technical Debt: The Mortgage vs. The Credit Card Trap",
    subtitle: "How you use AI determines whether you compound capability or accumulate toxic debt.",
    scenarioA: {
      title: "THE CREDIT CARD TRAP (High-Interest Debt)",
      subtitle: "Mindlessly prompting code without understanding architecture",
      steps: [
        "Copy-pasting syntax until red error squiggles disappear",
        "Zero understanding of database queries, indexes, or memory limits",
        "No unit tests, no schema validation, no structured logs",
        "The debt compounds until the system collapses in production or during interviews",
      ],
      footer: "High interest debt · Collapses on the whiteboard",
    },
    scenarioB: {
      title: "THE MORTGAGE MINDSET (Disciplined Leverage)",
      subtitle: "Using AI to accelerate typing while owning every architectural contract",
      steps: [
        "Use AI to accelerate typing speed and boilerplate generation",
        "Define rigorous data schemas, API contracts & specs yourself",
        "Write automated unit tests and evaluation benchmarks",
        "Own and defend every line of code, memory profile, and trade-off",
      ],
      footer: "Compounding equity · Whiteboard & production mastery",
    },
    maxBuildSteps: 2,
    notes: "The 'Mortgage' Mindset: Use AI to accelerate typing, but own every single line of code, data contract, and test suite yourself.",
  },

  // SLIDE 18 — IS AI IN A MASSIVE BUBBLE?
  {
    id: "sanjauli_slide_18",
    type: "THREE_CARDS",
    badge: "THE MACRO LANDSCAPE",
    title: "Is AI in a Massive Bubble Right Now?",
    subtitle: "Audience Question #4: Debunking the Hype and Spotting Genuine Opportunity",
    cards: [
      {
        num: "01",
        title: "The Wrapper Bubble",
        items: [
          "Thin API wrappers with zero proprietary depth are collapsing",
          "Speculative hype and engagement farming are fading fast",
          "Foundation model updates replace simple wrappers overnight",
        ],
      },
      {
        num: "02",
        title: "Permanent Utility",
        items: [
          "Underlying generative technology is a permanent general-purpose utility",
          "Enterprise workflow automation has massive, irreversible ROI",
          "Small AI & edge deployment on private data is exploding",
        ],
      },
      {
        num: "03",
        title: "Who Inherits the Industry",
        items: [
          "When the bubble bursts, hype tourist coders disappear",
          "Real engineers with deep CS fundamentals inherit the industry",
          "Traditional sectors (healthcare, finance, logistics) urgently need practical builders",
        ],
      },
    ],
    punchline: "When the bubble bursts, hype disappears, but real systems engineers inherit the industry.",
    maxBuildSteps: 3,
    notes: "Audience Question #4 (The Market Bubble): 'Is AI in a massive bubble right now that is about to burst?'\n\nSpeaker Hook: 'Yes and no. The speculation and wrapper apps are in an enormous bubble. But the underlying utility is permanent. When the bubble bursts, the hype disappears, but the real engineers inherit the entire industry.'",
  },

  // SLIDE 19 — WHEN BUBBLES BURST: WHO SURVIVES
  {
    id: "sanjauli_slide_19",
    type: "COURSE_VS_CAREER",
    badge: "MARKET FILTER",
    title: "When Bubbles Burst: The Fallout vs. Who Survives",
    subtitle: "Speculation collapses, real engineering value compounds.",
    normalCourseTitle: "THE FALLOUT (Who Gets Filtered Out)",
    normalCourse: [
      "Speculative venture funding dries up completely",
      "'Me-too' wrapper startups fold overnight",
      "Tutorial-clone coders face ATS rejection black holes",
      "Untested, prompt-only coders flood the market without callbacks",
    ],
    careerProgramTitle: "WHO SURVIVES & COMPOUNDS (BCA Builders)",
    careerProgram: [
      "Engineers with deep CS, algorithms, and systems fundamentals",
      "Builders with proven delivery records (live deployed apps)",
      "Professionals who speak the language of business ROI & cost savings",
      "Collaborative teammates with humility who welcome code feedback",
    ],
    punchline: "Speculation collapses, real value compounds.",
    maxBuildSteps: 3,
    notes: "The shake-out separates superficial wrapper creators from disciplined systems engineers.",
  },

  // SLIDE 20 — THE 100-CANDIDATE DROPOUT FUNNEL
  {
    id: "sanjauli_slide_20",
    type: "DROPOUT_FUNNEL",
    badge: "ACT 3: THE STRATEGIC PLAYBOOK",
    title: "The 100-Candidate Drop-off Funnel",
    subtitle: "Visualizing why high-effort students fail to land offers due to strategic funnel leaks.",
    stages: [
      {
        stage: "Learning Basic Syntax",
        remaining: "100",
        drop: "Baseline",
        cause: "Finish basic tutorials, YouTube courses, and syntax drills.",
      },
      {
        stage: "Production-Grade Projects",
        remaining: "25",
        drop: "75 Drop Out",
        cause: "75% build clone tutorials (Netflix/Todo/Chatbot wrappers) with zero real users, tests, or backend depth.",
      },
      {
        stage: "Resume / ATS Screening",
        remaining: "5",
        drop: "20 Drop Out",
        cause: "Poor resumes with no metrics, generic buzzword bullet points, or missing GitHub proofs fail automated screens.",
      },
      {
        stage: "Technical & System Loops",
        remaining: "2",
        drop: "3 Drop Out",
        cause: "Candidates crumble under edge cases, cannot explain architectural trade-offs, or display defensive attitudes.",
      },
      {
        stage: "Final Offer",
        remaining: "1–2",
        drop: "Top Hires",
        cause: "Hired candidates who demonstrate production mindset, business value, and strong culture add.",
      },
    ],
    takeaway: "Your degree is not your barrier—your portfolio quality and communication funnel are.",
    maxBuildSteps: 4,
    notes: "Speaker Takeaway for BCA Students: 'Your degree is not your barrier—your portfolio quality and communication funnel are.' Walk through the numbers: 100 → 25 → 5 → 2 → 1-2.",
  },

  // SLIDE 21 — STEP 1: MASTER INDUSTRY-GRADE SKILLS
  {
    id: "sanjauli_slide_21",
    type: "DEDICATED_ROADMAP",
    badge: "PLAYBOOK STEP 01",
    title: "Step 1 — Master Non-Negotiable Industry-Grade Skills",
    subtitle: "The T-Shaped AI & Backend Profile for BCA Students",
    stream: "BCA Systems & AI",
    foundation: [
      "Data Structures & Algorithms",
      "Modular OOP / Functional Patterns",
      "Relational Databases & Indexing (PostgreSQL)",
      "RESTful APIs & Microservices (FastAPI / Node)",
      "Linux Fundamentals & Git Hygiene",
    ],
    industrySkills: [
      "Docker & Container Orchestration",
      "Redis Caching & Async Message Queues",
      "Small Local LLMs (Ollama / vLLM)",
      "RAG Architectures & Vector Embeddings",
      "Deterministic Schemas (Pydantic / Zod)",
    ],
    projects: "High-throughput microservices treating LLMs like probabilistic microservices with latency, rate limits & error budgets",
    proof: "Verifiable code on GitHub, containerized live endpoints, and clean API schemas",
    opportunity: "Backend Engineer · AI Systems Developer · Full Stack Software Associate",
    maxBuildSteps: 4,
    notes: "Demystify the Stack: Stop treating LLMs like magic; treat them like probabilistic microservices with latency, rate limits, and failure modes.",
  },

  // SLIDE 22 — STEP 2: BUILD PRODUCTION-GRADE SYSTEMS
  {
    id: "sanjauli_slide_22",
    type: "BUILD_VS_TUTORIAL",
    badge: "PLAYBOOK STEP 02",
    title: "Step 2 — Build Production-Grade Systems (Not Weekend Wrappers)",
    subtitle: "The Zero-Tolerance Wrapper Rule: Would a real business pay for this or save 5 hours a week?",
    tutorialChain: ["API WRAPPER", "NO DB", "NO TESTS", "MODEL UPDATE BREAKS IT", "UNHIRED"],
    tutorialNote: "Weekend API wrappers provide zero systems engineering and can be replaced overnight.",
    projectSteps: [
      { step: 1, label: "DOMAIN UTILITY (Real Operational Data)" },
      { step: 2, label: "SCHEMA ENFORCEMENT (Pydantic / Zod)" },
      { step: 3, label: "EVALUATION BENCHMARKS (Automated)" },
      { step: 4, label: "COST OPTIMIZATION (Local / Quantized LLMs)" },
      { step: 5, label: "DOCKER & CI/CD PIPELINE" },
      { step: 6, label: "LIVE ACCESSIBLE CLOUD URL" },
    ],
    punchline: "The Zero-Tolerance Wrapper Rule: Avoid plain API wrapper projects that any foundation model update can replace overnight.",
    maxBuildSteps: 3,
    notes: "Key Hallmarks of a Production Project: Domain utility, automated evaluation suites, cost/latency discipline, and live containerized deployment.",
  },

  // SLIDE 23 — CAPSTONE PROJECT BLUEPRINT 1
  {
    id: "sanjauli_slide_23",
    type: "THREE_CARDS",
    badge: "FLAGSHIP BLUEPRINT 01",
    title: "Capstone 1: Enterprise Agentic RAG & Document Intelligence",
    subtitle: "A complete production architecture that separates you from 95% of applicants.",
    cards: [
      {
        num: "01",
        title: "Ingestion & Vector Pipeline",
        items: [
          "Document parsing & semantic chunking with metadata tagging",
          "PostgreSQL with pgvector for hybrid dense/sparse retrieval",
          "Local quantized embedding models running at zero cloud cost",
        ],
      },
      {
        num: "02",
        title: "Deterministic Engine & APIs",
        items: [
          "FastAPI backend with Pydantic v2 strict schema enforcement",
          "Local LLM fallback (Ollama Llama-3 / Mistral) when APIs timeout",
          "Redis semantic caching for sub-50ms repeat query responses",
        ],
      },
      {
        num: "03",
        title: "Evaluation & Deployment",
        items: [
          "Ragas evaluation framework: faithfulness, recall, and answer relevance",
          "Multi-stage Dockerfile with non-root security privileges",
          "GitHub Actions CI/CD running automated unit tests on every PR",
        ],
      },
    ],
    punchline: "Live deployed endpoint + automated eval benchmark = instant recruiter callback.",
    maxBuildSteps: 3,
    notes: "Walk through Capstone 1: Show how this project solves real enterprise document search with zero recurring API costs and strict schema validation.",
  },

  // SLIDE 24 — CAPSTONE PROJECT BLUEPRINT 2
  {
    id: "sanjauli_slide_24",
    type: "THREE_CARDS",
    badge: "FLAGSHIP BLUEPRINT 02",
    title: "Capstone 2: High-Throughput Resilient Microservice",
    subtitle: "Proving backend depth: handling async task queues, rate limits, and failure modes.",
    cards: [
      {
        num: "01",
        title: "Asynchronous Workflows",
        items: [
          "Decoupled job processing via Redis BullMQ / Celery worker pool",
          "Graceful backoff, exponential jitter retries, and dead-letter queues",
          "WebSocket / Server-Sent Events (SSE) for real-time progress streaming",
        ],
      },
      {
        num: "02",
        title: "Database Performance & Indexing",
        items: [
          "Optimized relational schema in PostgreSQL with composite B-Tree indexes",
          "Connection pooling via PgBouncer handling 1,000+ concurrent requests",
          "Database migration management using Alembic / Prisma migrations",
        ],
      },
      {
        num: "03",
        title: "Production Observability",
        items: [
          "Structured JSON logging with unique distributed correlation IDs",
          "Prometheus metrics & Grafana latency/error rate dashboards",
          "One-command spin-up via Docker Compose with seeded test fixtures",
        ],
      },
    ],
    punchline: "When an interviewer asks 'How do you handle system crashes?', this project gives you the complete answer.",
    maxBuildSteps: 3,
    notes: "Walk through Capstone 2: Highlight how distributed task queues, structured logging, and connection pooling prove senior-grade engineering discipline.",
  },

  // SLIDE 25 — STEP 3: PROOF-DRIVEN RESUME
  {
    id: "sanjauli_slide_25",
    type: "PROOF_HIERARCHY",
    badge: "PLAYBOOK STEP 03",
    title: "Step 3 — Construct a Proof-Driven Resume",
    subtitle: "The 6-Second Rule & The Google X-Y-Z Impact Formula",
    layers: [
      { label: "THE 6-SECOND SCAN", desc: "Recruiters do not read resumes; they hunt for verifiable proof of work and live URLs in the top third." },
      { label: "BAD RESUME BULLET", desc: "“Built an AI chatbot using Python and OpenAI.” (0 Metrics, 0 Differentiation, 0 Engineering Proof)" },
      { label: "THE X-Y-Z FORMULA", desc: "Accomplished [X], as measured by [Y], by doing [Z] — focusing on engineering and business impact." },
      { label: "GOOD RESUME BULLET", desc: "“Engineered an agentic document search pipeline handling 10k+ records, reducing query latency by 45% and slashing API token costs by 60% through prompt caching and local quantized models.”" },
      { label: "PROMINENT PROOF LINKS", desc: "Place live demo URLs, clean GitHub repositories, and system architecture diagrams right at the top." },
    ],
    punchline: "Frame every bullet point around business and engineering impact.",
    maxBuildSteps: 3,
    notes: "The 6-Second Rule: Recruiters do not read resumes; they scan for verifiable proof of work. Frame every bullet with the X-Y-Z formula.",
  },

  // SLIDE 26 — STEP 4: GITHUB SHOWCASE
  {
    id: "sanjauli_slide_26",
    type: "THREE_CARDS",
    badge: "PLAYBOOK STEP 04",
    title: "Step 4 — Turn GitHub into a Technical Showcase",
    subtitle: "Treat your GitHub as your primary engineering portfolio.",
    cards: [
      {
        num: "01",
        title: "Flagship Repositories",
        items: [
          "No empty repositories or cloned assignment forks without attribution",
          "Pin your top 2 flagship production systems",
          "Demonstrate disciplined commit history and PR hygiene",
        ],
      },
      {
        num: "02",
        title: "README Architecture",
        items: [
          "System architecture diagram showing data flow and failure modes",
          "One-command local setup via Docker / Docker Compose",
          "API request/response schema specifications",
          "Documented latency, cost, and architectural trade-offs",
        ],
      },
      {
        num: "03",
        title: "Production Proof",
        items: [
          "CI/CD passing status badge with automated test runs",
          "High test coverage with unit and integration tests",
          "Clickable live production link deployed to cloud",
        ],
      },
    ],
    punchline: "A clean README with Docker setup and system architecture diagrams proves you build for real users.",
    maxBuildSteps: 3,
    notes: "The README Anatomy: Include an architectural system design diagram, clear local setup instructions via Docker, an API schema breakdown, and a documented section on failure modes and performance trade-offs.",
  },

  // SLIDE 27 — STEP 5: TARGET STRATEGICALLY
  {
    id: "sanjauli_slide_27",
    type: "MYTH_REALITY_PAIRS",
    badge: "PLAYBOOK STEP 05",
    title: "Step 5 — Target Companies Strategically",
    subtitle: "Bypassing the Job Board Abyss with High-Signal Outreach",
    pairs: [
      {
        myth: "The Cold Application Trap",
        reality: "Submitting 500 applications into ATS black holes yields a sub-2% response rate and leads to burnout.",
      },
      {
        myth: "Targeting the 'Bifurcation'",
        reality: "Target mid-size enterprises, traditional industries (finance, healthcare, logistics), and startups that need pragmatic builders to automate internal workflows using open-weight models.",
      },
      {
        myth: "The Trusted Advisor Outreach",
        reality: "Find engineering leads and founders on LinkedIn/X. Audit their product: identify a bug, propose an optimization, or link to a mini-tool you built that directly relates to their stack.",
      },
    ],
    maxBuildSteps: 3,
    notes: "The Trusted Advisor Outreach: Send low-friction, high-signal messages: 'Hey [Name], noticed your API has this rate-limit edge case on streaming endpoints. Built a quick demo showing how to handle it gracefully with deterministic retries. Here’s the repo.'",
  },

  // SLIDE 28 — STEP 6: TECHNICAL INTERVIEW PREP
  {
    id: "sanjauli_slide_28",
    type: "PIPELINE_FLOW",
    badge: "PLAYBOOK STEP 06",
    title: "Step 6 — Technical Interview Preparation & Architecture Defense",
    subtitle: "Whiteboard Fundamentals & Graceful Degradation",
    stages: [
      "Whiteboard Algorithms (No AI Assistant)",
      "System Design & Corner Cases",
      "Broken Inputs & Model Hallucinations",
      "Network Timeouts & Graceful Degradation",
      "Memory & Concurrency Limits",
      "Defend Every Line on Your Resume",
    ],
    punchline: "If it’s on your resume or GitHub, you must be able to explain the underlying libraries, data flow, and runtime complexities on a whiteboard.",
    maxBuildSteps: 3,
    notes: "Whiteboard Fundamentals: Be ready to code algorithms without an AI assistant prompting syntax. System Design & Corner Cases: Explain how your system degrades gracefully.",
  },

  // SLIDE 29 — STEP 7: COMMUNICATION, HUMILITY & NO JERKS RULE
  {
    id: "sanjauli_slide_29",
    type: "SCENARIO_SPLIT",
    badge: "PLAYBOOK STEP 07",
    title: "Step 7 — Communication, Humility & Cultural Fit",
    subtitle: "The 'No Jerks' Rule — Why Companies Hire Teammates Over Brilliant Egos",
    scenarioA: {
      title: "THE DEFENSIVE CANDIDATE (Fails 300+ Loops)",
      subtitle: "Argues aggressively when an interviewer challenges code",
      steps: [
        "Elite syntax coding skills, but hostile when challenged",
        "Blames vague requirements instead of seeking clarity",
        "Lawrence Moroni case study: 300+ loop failures due to rigidity",
        "Company verdict: Brilliant jerks poison engineering teams",
      ],
      footer: "Defensive attitude = Instant rejection",
    },
    scenarioB: {
      title: "THE COLLABORATIVE TEAMMATE (Receives Offers)",
      subtitle: "Treats the interviewer as a collaborative problem solver",
      steps: [
        "Treats the interviewer as a teammate working on a shared problem",
        "Clarifies constraints, boundary conditions, and verbalizes trade-offs",
        "Admits what they don't know and accepts feedback with grace",
        "Exhibits product sense and care for business ROI",
      ],
      footer: "Humility + systems rigor = Immediate offer",
    },
    maxBuildSteps: 2,
    notes: "Audience Question #5 (The Culture Check): 'If an interviewer challenges your code and says, This solution will fail when latency spikes, do you argue back and stand your ground, or do you ask questions?'\n\nSpeaker Hook: 'Lawrence Moroni mentored an elite coder who failed over 300 interview loops because he was trained to be rigid and defensive. Companies don't hire brilliant jerks; they hire teammates.'",
  },

  // SLIDE 30 — A COURSE IS NOT A CAREER
  {
    id: "sanjauli_slide_30",
    type: "COURSE_VS_CAREER",
    badge: "PARADIGM SHIFT",
    title: "A Course Is Not a Career",
    subtitle: "Certificate proves completion. Portfolio proves capability.",
    normalCourseTitle: "A NORMAL COURSE",
    normalCourse: [
      "Watch Recorded Video Lectures Passively",
      "Memorize Theoretical Syntax",
      "Copy Weekend Todo / Chatbot Tutorial",
      "Collect Generic Certificate Nobody Verifies",
    ],
    careerProgramTitle: "UNISOLE CAREER ACCELERATION",
    careerProgram: [
      "Master Production-Grade Systems & AI Architectures",
      "Build Containerized Flagship Capstones with Real Data",
      "Implement Automated Evaluation Suites & Testing",
      "Architect a Proof-Driven Resume & GitHub Showcase",
      "Whiteboard System Design & Project Defense Coaching",
      "Unlock Direct Pipeline to UNISOLE Talent Pool",
    ],
    punchline: "Certificate proves completion. Portfolio proves capability.",
    maxBuildSteps: 3,
    notes: "Two-column comparison between passive courses and active career-building programs.",
  },

  // SLIDE 31 — MONTH-BY-MONTH CURRICULUM
  {
    id: "sanjauli_slide_31",
    type: "THREE_CARDS",
    badge: "3-MONTH ROADMAP",
    title: "The 3-Month Month-by-Month Technical Curriculum",
    subtitle: "Structured progressive mastery tailored specifically for Sanjauli BCA students.",
    cards: [
      {
        num: "01",
        title: "Month 1: Systems & Core APIs",
        items: [
          "Modern Python / Node.js & OOP paradigms",
          "Relational modeling in PostgreSQL & query optimization",
          "RESTful API architectures & FastAPI backend design",
          "Linux terminal mastery, Git branch flows & PR hygiene",
        ],
      },
      {
        num: "02",
        title: "Month 2: AI Pipelines & Containers",
        items: [
          "Local open-weight models (Ollama, vLLM) & quantization",
          "pgvector hybrid embeddings & agentic RAG workflows",
          "Redis caching, background task queues & message brokers",
          "Docker containerization & multi-stage build optimization",
        ],
      },
      {
        num: "03",
        title: "Month 3: Production Defense & Career",
        items: [
          "Automated test suites (PyTest) & LLM evaluation benchmarks",
          "CI/CD pipelines & live cloud deployment on production URLs",
          "Google X-Y-Z proof resume & GitHub technical showcase",
          "Whiteboard architecture defense & mock interview loops",
        ],
      },
    ],
    punchline: "From classroom student to production software engineer in 90 days of disciplined building.",
    maxBuildSteps: 3,
    notes: "Month-by-month technical roadmap breakdown: Month 1 (Core APIs & DB), Month 2 (AI Pipelines & Docker), Month 3 (Evals, Whiteboard & Deployment).",
  },

  // SLIDE 32 — UNISOLE SANJAULI PROGRAM
  {
    id: "sanjauli_slide_32",
    type: "PROGRAM_OVERVIEW",
    badge: "STRUCTURED PROGRAM",
    title: "UNISOLE Industrial Training cum Internship Opportunity Program",
    subtitle: "3-Month Live Industrial Training for BCA Students · Centre of Excellence Sanjauli",
    pillars: [
      "BCA-Dedicated Production Systems & AI Roadmap",
      "Live Weekend Labs & Architectural Masterclasses",
      "Two Containerized Flagship Capstone Deployments",
      "Automated Testing, Evals & Pydantic Schemas",
      "ATS-Optimized X-Y-Z Resume & GitHub Showcase",
      "Whiteboard System Defense & Mock Interview Rounds",
      "Exclusive Access to UNISOLE Hiring Talent Pool",
    ],
    maxBuildSteps: 3,
    notes: "Large visual highlight of the 3-Month Live Program structure tailored for Sanjauli BCA students.",
  },

  // SLIDE 33 — JOINT CERTIFICATE
  {
    id: "sanjauli_slide_33",
    type: "CERTIFICATE_SHOWCASE",
    badge: "ACCREDITATION",
    title: "JOINT CERTIFICATE",
    subtitle: "NIT HAMIRPUR × IAPT × UNISOLE",
    note: "Awarded to BCA students upon successful deployment of containerized capstone systems, automated test suites, and project defense.",
    maxBuildSteps: 2,
    notes: "Extremely premium and minimal. NIT Hamirpur x IAPT x UNISOLE.",
  },

  // SLIDE 34 — TALENT POOL
  {
    id: "sanjauli_slide_34",
    type: "TALENT_POOL_PIPELINE",
    badge: "OPPORTUNITY PIPELINE",
    title: "Perform Well → Get Noticed",
    subtitle: "Direct Pipeline to Startups, GCCs & Engineering Internships",
    steps: [
      "Program Performance & Live Labs",
      "Milestone Evaluation & Code Defense",
      "UNISOLE TALENT POOL",
      "Internship & Project Opportunities",
    ],
    disclaimer: "Opportunities are performance-based and awarded on verified system capability.",
    maxBuildSteps: 3,
    notes: "Dark navy pipeline showing progression into the UNISOLE Talent Pool.",
  },

  // SLIDE 35 — 30-DAY CHALLENGE & ENROLLMENT (FINAL MESSAGE)
  {
    id: "sanjauli_slide_35",
    type: "ENROLLMENT_CTA",
    badge: "ACTION CHALLENGE & ENROLLMENT",
    title: "The 30-Day BCA Action Challenge",
    subtitle: "Centre of Excellence Govt. College Sanjauli · BCA Industrial Training Program",
    actions: [
      "01. Delete or archive toy projects and tutorial clones from your GitHub",
      "02. Pick one real-world domain problem and build an end-to-end containerized system",
      "03. Ship it to a live cloud endpoint with tests and automated eval benchmarks",
      "04. Register for UNISOLE Industrial Training to accelerate your engineering career",
    ],
    qrUrl: "https://unisole.org/programs",
    qrPrompt: "Scan QR Code to Register for Sanjauli College BCA Program",
    maxBuildSteps: 3,
    notes: "Closing Spoken Line: 'In a disciplined market, pedigree gets people into rotation pools, but verified execution gets you hired. A BCA student who builds and deploys real systems beats a textbook graduate every single day.'\n\nScan QR Code to Register.",
  },
];
