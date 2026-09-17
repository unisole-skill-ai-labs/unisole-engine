export const SANJAULI_COLLEGE_PPT_SLIDES = [
  // =========================================================================
  // ACT 1 — BREAK THEIR OLD MENTAL MODEL (THE WAKE-UP CALL)
  // =========================================================================

  // SLIDE 1 — HOOK COVER
  {
    id: "sanjauli_slide_1",
    type: "COVER",
    badge: "BCA & UNDERGRADUATE CAREER BLUEPRINT",
    title: "YOUR CAREER AFTER AI",
    subtitle: "How to Become Valuable When AI Can Code · Centre of Excellence Govt. College Sanjauli",
    org: "UNISOLE SKILL AI LABS",
    maxBuildSteps: 2,
    notes: "Welcome everyone. In the next 50 minutes, we are going to tackle the single biggest question on every student's mind: If AI can write code, build apps, and debug in seconds, where do you fit in? Today is not a lecture—it is an actionable roadmap designed to make you indispensable.",
  },

  // SLIDE 2 — THE QUESTION
  {
    id: "sanjauli_slide_2",
    type: "BIG_QUESTION",
    badge: "THE CORE QUESTION",
    title: "“If AI can code... why should a company hire YOU?”",
    subtitle: "Think before I answer. Don't Google it.",
    maxBuildSteps: 1,
    questionPrompt: "If ChatGPT and Claude can produce 500 lines of functional code in 30 seconds, what exactly are you bringing to the engineering table?",
    speakerHook: "Syntax typing is dead. Software engineering—deciding what to build, handling failure modes, and keeping systems alive—is more in demand than ever.",
    notes: "Don't Google the answer. Just think for 10 seconds. If I give ChatGPT a problem and it produces 500 lines of code in 30 seconds... what exactly are you bringing to the table?\n\n[PAUSE FOR 10 SECONDS. TAKE 2-3 ANSWERS FROM AUDIENCE]\n\nGood. Today we're going to answer that question properly.\n\n[ENGAGEMENT / HANDS UP]: 'Who here has thought at least once: AI is going to make my BCA degree less valuable?'",
  },

  // SLIDE 3 — THE WORLD YOU ENTERED
  {
    id: "sanjauli_slide_3",
    type: "TIMELINE_EVOLUTION",
    badge: "THE MACRO SHIFT",
    title: "The World You Entered",
    subtitle: "You are not entering the same job market your seniors entered.",
    timeline: [
      {
        year: "2020 (The Old Career Pipeline)",
        label: "Learn Syntax & Loops → Build Tutorial Projects → Land Internship → Junior Developer Job",
      },
      {
        year: "2026 (The AI-Accelerated Reality)",
        label: "AI Generates Code → AI Researches → AI Debugs → AI Designs → Outcome Engineering",
      },
    ],
    quote: "“Your seniors learned how to produce code. You have to learn how to produce outcomes using technology.”",
    maxBuildSteps: 2,
    notes: "In 2020, raw syntax knowledge was a scarce economic skill. In 2026, generating boilerplate code is free and instantaneous. The tech landscape shifted from typing speed to outcome engineering.\n\nTransition: 'Before we talk about what you should learn, let's look at what is actually happening to the entry-level hiring market.'",
  },

  // SLIDE 4 — THE ENTRY-LEVEL PROBLEM
  {
    id: "sanjauli_slide_4",
    type: "SCENARIO_SPLIT",
    badge: "MARKET MECHANICS",
    title: "The Entry-Level Squeeze",
    subtitle: "AI may not replace everyone. It can change who gets to start.",
    scenarioA: {
      title: "THE OLD LADDER (Pre-AI)",
      subtitle: "Junior tasks provided a gradual learning ramp",
      steps: [
        "Company hires junior graduates for simple boilerplate tasks",
        "Junior learns on the job through trial and error",
        "Gradually advances to intermediate and senior systems engineer",
        "Plenty of entry-level openings with low evaluation thresholds",
      ],
      footer: "Easy entry ramp · High tolerance for tutorial knowledge",
    },
    scenarioB: {
      title: "THE NEW REALITY (Post-2024)",
      subtitle: "AI handles the basic tasks, raising the entry bar",
      steps: [
        "AI agents handle boilerplate, simple CRUD & unit test generation",
        "Companies need fewer people for mechanical syntax typing",
        "Entry-level bar rises: companies demand verified execution",
        "Junior candidates must demonstrate systems resilience on day 1",
      ],
      footer: "Higher entry bar · Demands real proof of work",
    },
    punchline: "Stanford Research: Employment among 22–25-year-olds in AI-exposed fields has weakened due to automated entry-level hiring.",
    maxBuildSteps: 2,
    notes: "The biggest impact of AI isn't 'everyone gets fired.' It is: 'The easiest work becomes automated, so getting your first opportunity becomes harder.'\n\n[IMPORTANT: DO NOT SCARE STUDENTS]. Immediately say: 'And that creates the biggest opportunity of your career.'",
  },

  // SLIDE 5 — LIVE POLL 01
  {
    id: "sanjauli_slide_5",
    type: "POLL",
    badge: "LIVE POLL 01",
    title: "Audience Pulse: The AI Anxiety Check",
    question: "Be honest: How worried are you that AI code generators will make entry-level programming jobs obsolete?",
    options: [
      "Extremely worried — Wondering if coding is still worth learning",
      "Moderately concerned — Feel I need more than basic syntax",
      "Confident — AI is just a tool for real builders",
      "Curious — Waiting to see where the real opportunity is",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 01. Give students 20 seconds to vote on their mobile screens. Highlight the dynamic percentages on the big screen.\n\nTransition: 'Most of you feel the anxiety. Now let's look at why the market reset is actually a massive gift for disciplined builders.'",
  },

  // SLIDE 6 — THE MARKET RESET
  {
    id: "sanjauli_slide_6",
    type: "THREE_CARDS",
    badge: "THE MARKET RESET",
    title: "When Easy Work Disappears...",
    subtitle: "The value of difficult, disciplined engineering multiplies.",
    cards: [
      {
        num: "01",
        title: "Problem Solving & Specs",
        items: [
          "Taking messy, ambiguous requirements and defining clean specs",
          "Understanding user constraints and business domain logic",
          "Designing precise data contracts and API interfaces",
        ],
      },
      {
        num: "02",
        title: "Systems Resilience",
        items: [
          "Defensive error handling and boundary conditions",
          "Database indexing, connection pooling & memory management",
          "Graceful degradation when external APIs or networks fail",
        ],
      },
      {
        num: "03",
        title: "Verification & Testing",
        items: [
          "Automated unit, integration, and benchmark test suites",
          "Evaluating AI outputs against deterministic schema rules",
          "Containerized deployment and live cloud monitoring",
        ],
      },
    ],
    punchline: "Companies don't just need someone who can make code appear. They need someone who makes systems work.",
    maxBuildSteps: 3,
    notes: "When easy work disappears, the value of difficult work skyrockets: Problem solving, System design, Verification, Product thinking, and Communication. Companies don't just need syntax typers; they need builders who solve real-world problems.\n\nTransition: 'And this is where the most talked-about development in software enters the story: Vibe Coding.'",
  },

  // =========================================================================
  // ACT 2 — VIBE CODING: POWER VS. PRODUCTION REALITY
  // =========================================================================

  // SLIDE 7 — VIBE CODING
  {
    id: "sanjauli_slide_7",
    type: "BIG_QUESTION",
    badge: "ACT 2: THE MODERN TOOLKIT",
    title: "“Build Me An App.”",
    subtitle: "The Rise of Vibe Coding (Claude Code, Cursor, Copilot)",
    maxBuildSteps: 1,
    notes: "Show an AI tool spinning up a full-stack application in 30 seconds from a single prompt.\n\n[ASK AUDIENCE]: 'How many of you think this is amazing?' (Hands up). 'It is.' [PAUSE]. 'But here is the dangerous part.'",
  },

  // SLIDE 8 — THE VIBE-CODING ILLUSION
  {
    id: "sanjauli_slide_8",
    type: "PROOF_HIERARCHY",
    badge: "THE COMPETENCE TRAP",
    title: "The Vibe-Coding Illusion",
    subtitle: "AI can make you look like a developer before you actually become one.",
    layers: [
      {
        label: "LEVEL 1: PROMPT → APP",
        desc: "Copy-pasting prompts until red squiggles disappear. Zero architectural understanding. High illusion of competence.",
      },
      {
        label: "LEVEL 2: PROMPT → UNDERSTAND → MODIFY",
        desc: "Inspecting AI-generated code, understanding data flow, tweaking components, and debugging edge cases.",
      },
      {
        label: "LEVEL 3: SPEC → AI → TEST → VERIFY → DEPLOY",
        desc: "You define data contracts, schemas & specs. AI writes boilerplate. You write test suites, benchmark latency, and deploy.",
      },
    ],
    punchline: "I don't want you to stop vibe coding. I want you to become so good at systems that you vibe code responsibly.",
    maxBuildSteps: 3,
    notes: "Vibe coding is a superpower, but mistaking AI-generated syntax for personal architectural understanding is toxic. Level 1 coders get filtered out on whiteboards. Level 3 engineers become 10x more productive.\n\nTransition: 'Let's test this with a live thought experiment.'",
  },

  // SLIDE 9 — LIVE DEMO & PRODUCTION TEST
  {
    id: "sanjauli_slide_9",
    type: "MYTH_REALITY_PAIRS",
    badge: "THE PRODUCTION TEST",
    title: "The Live Test: Would You Trust This in Production?",
    subtitle: "Generating software is cheap. Engineering software is not.",
    pairs: [
      {
        myth: "The Demo Illusion (Localhost)",
        reality: "AI generates a quick UI for scholarship documents in 2 minutes. It works smoothly on localhost for 1 user.",
      },
      {
        myth: "The Production Reality (10,000 Users)",
        reality: "What if 10,000 students apply simultaneously? What if the database deadlocks? What if personal Aadhaar data leaks?",
      },
      {
        myth: "The Economic Reality (API Costs)",
        reality: "What if the model hallucinates wrong scholarship eligibility? What if unoptimized API calls cost ₹5 per request?",
      },
    ],
    questionPrompt: "If I took away ChatGPT, Claude, and Copilot right now and asked you to build a simple CRUD API and connect it to a database on a whiteboard, could you do it?",
    speakerHook: "Generating software is becoming cheap. Engineering software is not. If you can't explain it on a whiteboard, you don't own the system—you borrowed technical debt.",
    maxBuildSteps: 3,
    notes: "Ask students: 'Give me a college problem (e.g. scholarship documents). AI generates it. Would you deploy it to 100k students? What if the API costs ₹5 per request?'\n\nSpeaker Hook: 'Generating software is becoming cheap. Engineering software is not.'",
  },

  // SLIDE 10 — THE AI PRODUCTIVITY PARADOX
  {
    id: "sanjauli_slide_10",
    type: "SCENARIO_SPLIT",
    badge: "EMPIRICAL RESEARCH",
    title: "The AI Productivity Paradox",
    subtitle: "FASTER CODE ≠ FASTER ENGINEERING",
    scenarioA: {
      title: "THE 10-MINUTE SYNTAX ILLUSION",
      subtitle: "What AI accelerates in seconds",
      steps: [
        "Instant boilerplate scaffolding and function templates",
        "Fast CSS layout formatting and component generation",
        "High initial dopamine: 'I built an app in 5 minutes!'",
        "Zero automated tests or verified error boundaries",
      ],
      footer: "Fast syntax generation · High illusion of speed",
    },
    scenarioB: {
      title: "THE 90% ENGINEERING REALITY",
      subtitle: "Where real engineering time is actually spent",
      steps: [
        "Validating business constraints and edge cases",
        "Debugging silent model hallucinations and race conditions",
        "API security, auth tokens, database migrations & indexes",
        "Deploying, monitoring, load-testing & container orchestration",
      ],
      footer: "METR Study: AI increased completion time when debugging unverified code",
    },
    punchline: "Never measure AI by how fast it writes code. Measure by whether you solved the problem faster.",
    maxBuildSteps: 2,
    notes: "A METR randomized study of experienced developers found that AI tools can actually increase total completion time when developers spend hours debugging subtle AI-generated hallucinations.\n\nTransition: 'So AI is powerful, but it has also attracted astronomical amounts of hype and capital. Which brings us to a much bigger question: Are we in an AI bubble?'",
  },

  // =========================================================================
  // ACT 3 — THE AI BUBBLE & SPECULATION
  // =========================================================================

  // SLIDE 11 — BUBBLE?
  {
    id: "sanjauli_slide_11",
    type: "THREE_CARDS",
    badge: "ACT 3: MACRO REALITY",
    title: "Are We in an AI Bubble?",
    subtitle: "Three distinct forces can exist at the exact same time.",
    cards: [
      {
        num: "01",
        title: "Real Technology",
        items: [
          "Generative intelligence is a permanent general-purpose utility",
          "Large language models, embeddings & reasoning engines are real",
          "Automates cognitive, repetitive developer workflows",
        ],
      },
      {
        num: "02",
        title: "Real Business Value",
        items: [
          "Enterprises saving millions in document intelligence & support",
          "Accelerating software delivery and internal operations",
          "Irreversible productivity compounding across industries",
        ],
      },
      {
        num: "03",
        title: "Massive Speculation",
        items: [
          "Thin API wrappers funded at unsustainable valuations",
          "Hype farming, FOMO capital, and unrealistic revenue projections",
          "Foundation model updates destroy wrapper startups overnight",
        ],
      },
    ],
    punchline: "The technology does not have to be fake for market valuations to be overhyped.",
    questionPrompt: "Is AI in a massive bubble right now that is about to burst?",
    speakerHook: "Yes and no. The speculation and wrapper apps are in an enormous bubble. But the underlying utility is permanent. When the bubble bursts, the hype disappears, but real systems engineers inherit the industry.",
    maxBuildSteps: 3,
    notes: "Audience Question #4: 'Is AI in a massive bubble right now?'\n\nSpeaker Hook: 'Three things exist simultaneously: Real tech + Real business value + Massive speculation. That is what makes bubbles complicated.'\n\nTransition: 'To understand how this plays out without panic, let's look at what creates a bubble.'",
  },

  // SLIDE 12 — WHAT CREATES A BUBBLE?
  {
    id: "sanjauli_slide_12",
    type: "PIPELINE_FLOW",
    badge: "MARKET DYNAMICS",
    title: "The Anatomy of a Technology Bubble",
    subtitle: "How excitement turns into speculation and how markets correct.",
    stages: [
      "Breakthrough Tech",
      "Huge Expectations",
      "Capital Floods In",
      "Valuations Soar",
      "Weak Wrappers Funded",
      "Market Reset & Discipline",
    ],
    punchline: "When capital tightens, speculative hype dies — but foundational infrastructure remains.",
    maxBuildSteps: 3,
    notes: "Every major technological revolution follows this curve: Steam engines, Railroads, Electricity, the Internet, and now AI.\n\nTransition: 'To understand what this means for your career, let's go back to 1999.'",
  },

  // =========================================================================
  // ACT 4 — THE 1999 DOT-COM LESSON
  // =========================================================================

  // SLIDE 13 — LET'S GO BACK TO 1999
  {
    id: "sanjauli_slide_13",
    type: "BIG_QUESTION",
    badge: "HISTORICAL PERSPECTIVE",
    title: "“Let's Go Back to 1999.”",
    subtitle: "Imagine sitting in a college classroom at the peak of the Internet boom.",
    maxBuildSteps: 1,
    notes: "Dark slide. Pause. Imagine you are sitting in a college classroom in 1999. Someone tells you: 'The Internet is going to change everything.' Was that true? YES. 'Every company must go online.' True? YES. 'This company has no revenue, but its stock is up 500%.' That's where things become dangerous.",
  },

  // SLIDE 14 — THE DOT-COM CRASH (1999-2000)
  {
    id: "sanjauli_slide_14",
    type: "TIMELINE_EVOLUTION",
    badge: "DOT-COM PARALLEL",
    title: "The 1999–2000 Dot-Com Boom & Crash",
    subtitle: "Understanding what collapsed and what permanently survived.",
    timeline: [
      {
        year: "1998–1999 (The Internet Euphoria)",
        label: "Massive capital flood. Startups with zero revenue raised millions simply by putting '.com' in their name.",
      },
      {
        year: "March 2000 (The Peak & Crash)",
        label: "The Nasdaq peaked and crashed 78%. Hundreds of speculative, unprofitable startups vanished overnight.",
      },
      {
        year: "2001–2026 (The Permanent Utility)",
        label: "The Internet did NOT die. It grew into a multi-trillion dollar foundation of modern civilization.",
      },
    ],
    quote: "“The lesson isn't that the Internet was fake. The lesson is that technology adoption and business survival are two different things.”",
    maxBuildSteps: 3,
    notes: "Ask the students: 'Did the Internet die after the 2000 crash?' (Students: NO!).\n\nTransition: 'Let's see what that means for who survived and compounded.'",
  },

  // SLIDE 15 — LIVE POLL 02: THE DOT-COM TEST
  {
    id: "sanjauli_slide_15",
    type: "POLL",
    badge: "LIVE POLL 02",
    title: "Prediction Check: What Survived 2000?",
    question: "When the Dot-Com bubble burst and 1,000+ startups died, what happened to software engineering?",
    options: [
      "Software jobs vanished permanently",
      "Hype died, but real systems & infrastructure grew 100x",
      "Companies stopped building on the Internet",
      "Only elite tier-1 university graduates got hired",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 02. Let students vote. Transition: 'Exactly. The hype and speculation died, but servers, databases, networking, e-commerce, and real systems engineers inherited the next 20 years.'",
  },

  // SLIDE 16 — THIS IS THE LESSON
  {
    id: "sanjauli_slide_16",
    type: "MYTH_REALITY_PAIRS",
    badge: "THE LESSON OF 2000",
    title: "What Disappeared vs. What Compounded",
    subtitle: "Separating transient market noise from durable engineering capabilities.",
    pairs: [
      {
        myth: "What the Crash Destroyed",
        reality: "Weak business models, Pets.com, slide-deck startups, and tutorial coders who only knew superficial syntax.",
      },
      {
        myth: "What Permanently Survived",
        reality: "Networking protocols, Linux servers, relational databases, web browsers, e-commerce & distributed systems.",
      },
      {
        myth: "Who Compounded Career Equity",
        reality: "Engineers who understood core CS fundamentals, algorithms, database queries, and system reliability.",
      },
    ],
    punchline: "Speculation collapses. Real engineering value compounds.",
    maxBuildSteps: 3,
    notes: "The crash filtered out the tourist coders and speculative wrappers. Real systems engineers inherited the entire digital economy.",
  },

  // SLIDE 17 — AMAZON CASE STUDY
  {
    id: "sanjauli_slide_17",
    type: "SCENARIO_SPLIT",
    badge: "CASE STUDY",
    title: "Amazon in 2000: Surviving the Downturn",
    subtitle: "Don't spend your career trying to predict which AI startup wins.",
    scenarioA: {
      title: "SPECULATIVE STARTUPS (Folded 2000)",
      subtitle: "Relying purely on hype and easy venture capital",
      steps: [
        "Zero positive unit economics or real customer retention",
        "Spent millions on Super Bowl ads with no product moat",
        "Collapsed within months once venture capital dried up",
        "Built on shallow ideas with zero engineering defensibility",
      ],
      footer: "Vanished overnight · Zero residual value",
    },
    scenarioB: {
      title: "AMAZON'S FOUNDATION (Survived & Scaled)",
      subtitle: "Focusing on real customers and resilient infrastructure",
      steps: [
        "Real customer demand, logistics execution & disciplined unit economics",
        "Raised critical financing right before the crash (HBR Case)",
        "Invested heavily in server infrastructure (which later birthed AWS)",
        "Compounded through the downturn to become a global titan",
      ],
      footer: "Compounded 100x · Built enduring infrastructure",
    },
    punchline: "Build your career on durable infrastructure skills, not on fleeting startup hype.",
    maxBuildSteps: 2,
    notes: "Would you have known in 1999 which AI company will win in 2026? Probably not. Don't build your identity on one AI tool; build it on engineering fundamentals.",
  },

  // SLIDE 18 — BRING IT BACK TO AI
  {
    id: "sanjauli_slide_18",
    type: "THREE_CARDS",
    badge: "POST-CORRECTION REALITY",
    title: "What Happens to YOU in a Correction?",
    subtitle: "When the AI hype cools, real systems engineers inherit the industry.",
    cards: [
      {
        num: "01",
        title: "Thin Wrappers Fold",
        items: [
          "Generic chatbot wrappers without proprietary data collapse",
          "Engagement farming and prompt-only hype fades away",
          "Companies demand strict ROI and cost efficiency",
        ],
      },
      {
        num: "02",
        title: "Tourist Coders Filtered",
        items: [
          "Prompt-only coders unable to debug systems face ATS rejections",
          "Tutorial clone portfolios fail technical whiteboard loops",
          "Surface-level syntax familiarity loses all market value",
        ],
      },
      {
        num: "03",
        title: "Systems Builders Inherit",
        items: [
          "Engineers who connect open-weight models to private enterprise data",
          "Builders who optimize token latency and cloud API costs",
          "Disciplined problem solvers who ship containerized systems",
        ],
      },
    ],
    punchline: "When the bubble bursts, hype disappears, but real systems engineers inherit the industry.",
    maxBuildSteps: 3,
    notes: "What happens to YOU? If you only know how to prompt, you're in trouble. If you know how to build, test, and deploy resilient systems, you inherit the industry.\n\nTransition: 'So how do you position yourself right now as a student?'",
  },

  // =========================================================================
  // ACT 5 — WHAT THIS MEANS FOR A STUDENT (THE CAREER HEDGE)
  // =========================================================================

  // SLIDE 19 — THE CAREER HEDGE
  {
    id: "sanjauli_slide_19",
    type: "SCENARIO_SPLIT",
    badge: "THE CAREER HEDGE",
    title: "Don't Become \"AI-Proof\" — Become Valuable in BOTH Worlds",
    subtitle: "A bulletproof engineering skillset thrives in any economic climate.",
    scenarioA: {
      title: "WORLD 1: THE AI BOOM CONTINUES",
      subtitle: "Massive corporate investment into intelligent systems",
      steps: [
        "Companies urgently need AI agent orchestration & RAG pipelines",
        "Integration of local open-weight models (Ollama, vLLM, DeepSeek)",
        "Engineers who build autonomous workflows and tool-calling systems",
        "High demand for AI infrastructure and vector database architects",
      ],
      footer: "High growth · AI systems engineering mastery",
    },
    scenarioB: {
      title: "WORLD 2: AN AI MARKET CORRECTION",
      subtitle: "Fiscal discipline, cost reduction & operational efficiency",
      steps: [
        "Companies demand cloud token optimization & prompt caching",
        "Focus shifts to reliable, fault-tolerant offline microservices",
        "Demand for engineers who can do more with smaller budgets",
        "Pragmatic builders who solve messy internal business workflows",
      ],
      footer: "High stability · Cost efficiency & systems resilience",
    },
    punchline: "Notice what survives both scenarios: Systems engineering, problem solving, and cost discipline.",
    maxBuildSteps: 2,
    notes: "Don't try to become 'AI-proof.' Become valuable in BOTH worlds. Notice what survives: problem solving, system design, testing, and business ROI.\n\nTransition: 'Let's look at how student profiles must evolve.'",
  },

  // SLIDE 20 — THE NEW STUDENT PROFILE
  {
    id: "sanjauli_slide_20",
    type: "COMPARISON_STATS",
    badge: "PARADIGM SHIFT",
    title: "The Old Student Resume vs. The Modern Builder",
    subtitle: "Proof > Claims. Projects > Certificates.",
    stat1: {
      year: "THE OLD RESUME PROFILE",
      count: "KEYWORD STACKING",
      label: "BCA · Python · Java · HTML · CSS · ChatGPT · 7 Certificates",
      ratio: "0 Live Proof · 0 Verified Users · 0 ATS Differentiation",
    },
    stat2: {
      year: "THE MODERN BUILDER PROFILE",
      count: "VERIFIED EXECUTION",
      label: "Understands → Builds → Tests → Deploys → Measures → Communicates",
      ratio: "Live URL · GitHub Proof · Architecture Spec · Measurable Impact",
    },
    quote: "“Your resume says what you claim to know. Your project demonstrates what you can actually deliver under pressure.”",
    maxBuildSteps: 2,
    notes: "Would a generic resume with 'Python, Java, Machine Learning' and 7 certificates impress an engineering lead today? No. What impresses them is verified execution: 'Understands → Builds → Tests → Deploys → Measures → Communicates.'",
  },

  // SLIDE 21 — THE 100-CANDIDATE DROPOUT FUNNEL
  {
    id: "sanjauli_slide_21",
    type: "DROPOUT_FUNNEL",
    badge: "STRATEGIC FUNNEL",
    title: "The 100-Candidate Drop-off Funnel",
    subtitle: "Visualizing why hardworking students fail to land offers due to strategic leaks.",
    stages: [
      {
        stage: "Learning Basic Syntax",
        remaining: "100",
        drop: "Baseline",
        cause: "Complete YouTube courses, syntax tutorials & university assignments.",
      },
      {
        stage: "Production-Grade Projects",
        remaining: "25",
        drop: "75 Drop Out",
        cause: "75% build clone tutorial apps (Weather/Todo/Netflix) with zero tests, users, or backend depth.",
      },
      {
        stage: "Outcome-Driven Resume",
        remaining: "10",
        drop: "15 Drop Out",
        cause: "Resumes describe tasks ('built a chatbot') rather than measurable engineering impact.",
      },
      {
        stage: "Targeted Strategic Outreach",
        remaining: "4",
        drop: "6 Drop Out",
        cause: "Mass-apply to 500 LinkedIn job boards instead of high-signal proof outreach to founders.",
      },
      {
        stage: "Technical Loop & Whiteboard Offer",
        remaining: "1",
        drop: "3 Drop Out",
        cause: "Panic when asked to defend architecture, latency spikes & failure modes on a whiteboard.",
      },
    ],
    punchline: "Fix the leaks at each step of the funnel to guarantee an offer.",
    maxBuildSteps: 4,
    notes: "Walk through the 100-candidate drop-off funnel. 100 start. 75 die at toy projects. 15 die at weak resumes. 6 die at cold applying. Only 1 survives. We are going to fix every single leak right now.",
  },

  // =========================================================================
  // ACT 6 — THE PEAK: THE 5-STEP CAREER BLUEPRINT
  // =========================================================================

  // SLIDE 22 — THE 5-STEP BLUEPRINT REVEAL
  {
    id: "sanjauli_slide_22",
    type: "PIPELINE_FLOW",
    badge: "ACT 6: THE PEAK FRAMEWORK",
    title: "The 5-Step AI-Era Career Blueprint",
    subtitle: "The interconnected system to move from student learner to hired engineer.",
    stages: [
      "1. SKILL (Deep Foundations)",
      "2. PROJECT (Real Problem)",
      "3. RESUME (Proof of Work)",
      "4. APPROACH (High-Signal)",
      "5. INTERVIEW (Whiteboard)",
    ],
    punchline: "These 5 steps are strictly connected. If step 1 is weak, step 2 fails. If step 3 is weak, zero callbacks. Master all five.",
    maxBuildSteps: 3,
    notes: "Here is the master formula: 1. SKILL → 2. PROJECT → 3. RESUME → 4. APPROACH → 5. INTERVIEW.\n\nTransition: 'Let's break down each step in detail.'",
  },

  // SLIDE 23 — STEP 1: SKILL (THE 3-LAYER FOUNDATION)
  {
    id: "sanjauli_slide_23",
    type: "THREE_CARDS",
    badge: "STEP 01 — SKILL",
    title: "Step 1 — Build the 3-Layer Foundation",
    subtitle: "Don't learn 25 disconnected tools. Master the core stack deeply.",
    cards: [
      {
        num: "01",
        title: "Computer Science Core",
        items: [
          "Data Structures & Algorithms (Arrays, Hashmaps, Trees, Graphs)",
          "Relational Database Design, SQL queries, Indexing & Joins",
          "HTTP protocols, RESTful APIs, Git version control & Linux shell",
        ],
      },
      {
        num: "02",
        title: "Applied AI Layer",
        items: [
          "LLM prompting, structured JSON outputs & schema validation",
          "Retrieval-Augmented Generation (RAG) & Vector Embeddings",
          "Tool calling, autonomous agents & local models via Ollama",
        ],
      },
      {
        num: "03",
        title: "Engineering Discipline",
        items: [
          "Automated unit, integration, and end-to-end testing",
          "Docker containerization & multi-stage image builds",
          "API rate-limiting, error logging, monitoring & CI/CD workflows",
        ],
      },
    ],
    punchline: "Learn the fundamentals deeply enough that new tools become effortless to pick up.",
    maxBuildSteps: 3,
    notes: "Don't jump between 25 random frameworks. Master the CS Core, the Applied AI Layer, and Engineering Discipline.",
  },

  // SLIDE 24 — STEP 2: PROJECT (STOP BUILDING TOY PROJECTS)
  {
    id: "sanjauli_slide_24",
    type: "MYTH_REALITY_PAIRS",
    badge: "STEP 02 — PROJECT",
    title: "Step 2 — Stop Building Toy Projects",
    subtitle: "The Project Test: Would someone actually use this under real conditions?",
    pairs: [
      {
        myth: "The Toy Project Trap",
        reality: "Calculators, to-do lists, Netflix clones, weather widgets, and tutorial copy-pastes that impress zero recruiters.",
      },
      {
        myth: "The 5-Question Project Test",
        reality: "Who has the problem? How often? What does it cost them? What if the system fails? How do you measure success?",
      },
      {
        myth: "Project Volume vs Depth",
        reality: "Build ONE serious flagship production system with tests, Docker, and real users—not ten mediocre weekend clones.",
      },
    ],
    punchline: "Build one serious project with verified users, error handling, and clean documentation.",
    maxBuildSteps: 3,
    notes: "Ask the room: 'Who has built a calculator? Weather app? To-do app?' (Hands up). 'Good. You learned from them. Now it's time to graduate to production systems.'",
  },

  // SLIDE 25 — STEP 3: RESUME (THE X-Y-Z IMPACT FORMULA)
  {
    id: "sanjauli_slide_25",
    type: "PROOF_HIERARCHY",
    badge: "STEP 03 — RESUME",
    title: "Step 3 — Outcome-Driven Resume (The X-Y-Z Formula)",
    subtitle: "Don't write what you did. Write what changed because you did it.",
    layers: [
      {
        label: "THE 6-SECOND SCAN",
        desc: "Recruiters scan top-to-bottom in 6 seconds hunting for verifiable proof links, live URLs, and metrics.",
      },
      {
        label: "WEAK RESUME BULLET",
        desc: "“Built an AI chatbot using Python and OpenAI API.” (0 Metrics, 0 Differentiation, 0 Engineering Proof)",
      },
      {
        label: "THE GOOGLE X-Y-Z FORMULA",
        desc: "Accomplished [X], as measured by [Y], by doing [Z] — focusing on engineering and business impact.",
      },
      {
        label: "STRONG RESUME BULLET",
        desc: "“Engineered an agentic document search pipeline handling 5,000+ PDFs, reducing query latency by 45% and cutting API token costs by 60% through prompt caching and local quantized models.”",
      },
      {
        label: "PROMINENT PROOF LINKS",
        desc: "Place live demo URLs, clean GitHub repositories, and system architecture diagrams right at the top.",
      },
    ],
    punchline: "Frame every bullet point around business outcome and engineering impact.",
    maxBuildSteps: 3,
    notes: "The 6-Second Rule: Recruiters do not read resumes; they scan for verifiable proof of work. Frame every bullet with the Google X-Y-Z formula.",
  },

  // SLIDE 26 — STEP 4: APPROACH (HIGH-SIGNAL OUTREACH)
  {
    id: "sanjauli_slide_26",
    type: "SCENARIO_SPLIT",
    badge: "STEP 04 — APPROACH",
    title: "Step 4 — Stop Waiting on Job Boards (High-Signal Outreach)",
    subtitle: "Bypassing the ATS black hole with value-first demonstrations.",
    scenarioA: {
      title: "THE COLD APPLICATION TRAP (Sub-2% Response)",
      subtitle: "Mindlessly applying to hundreds of portal job postings",
      steps: [
        "Submitting 500 applications into ATS portal black holes",
        "Generic message: 'Sir, please give me an internship opportunity'",
        "Zero differentiation; filtered by automated keyword scanners",
        "Leads to burnout, frustration, and complete radio silence",
      ],
      footer: "Sub-2% response rate · ATS black hole",
    },
    scenarioB: {
      title: "THE TRUSTED ADVISOR OUTREACH (40%+ Response)",
      subtitle: "Demonstrating immediate value before asking for anything",
      steps: [
        "Identify engineering leads and startup founders on LinkedIn / X",
        "Audit their product: identify a bug, UI flaw, or API rate-limit edge case",
        "Build a working mini-prototype and record a 90-second Loom demo",
        "Message: 'Noticed this edge case in your docs workflow. Built a prototype handling it with retry fallbacks. Here’s the demo.'",
      ],
      footer: "40%+ callback rate · Demonstrates immediate value",
    },
    punchline: "Don't ask for a job first. Demonstrate value first.",
    maxBuildSteps: 2,
    notes: "Stop spamming job portals. Audit a company's product, build a 90-second working prototype, and send it to the engineering lead. That instantly separates you from 99% of applicants.",
  },

  // SLIDE 27 — LIVE POLL 03: THE WHITEBOARD CHECK
  {
    id: "sanjauli_slide_27",
    type: "POLL",
    badge: "LIVE POLL 03",
    title: "The Whiteboard & Interview Reality Check",
    question: "If an interviewer took away ChatGPT, Cursor, and Copilot right now and asked you to build a simple CRUD API on a whiteboard, could you do it?",
    options: [
      "Yes — I know the data flow, database queries & HTTP status codes",
      "Partially — I can draw the architecture, but need help with syntax",
      "Honest No — I rely heavily on AI to scaffold everything",
      "Panic Mode — I have never coded without an AI assistant",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 03. Let students vote. Transition: 'This is the exact dividing line in 2026. Let's look at how to prepare for the technical loop.'",
  },

  // SLIDE 28 — STEP 5: INTERVIEW PREPARATION
  {
    id: "sanjauli_slide_28",
    type: "THREE_CARDS",
    badge: "STEP 05 — INTERVIEW",
    title: "Step 5 — Technical Interview Preparation & Architecture Defense",
    subtitle: "The interview is no longer just \"Do you know coding?\"",
    cards: [
      {
        num: "01",
        title: "System & DB Defense",
        items: [
          "Explain data flow, database indexing, and query optimization",
          "Handling latency spikes, network timeouts & broken inputs",
          "Explaining concurrency limits and memory trade-offs",
        ],
      },
      {
        num: "02",
        title: "AI Trade-Off Mastery",
        items: [
          "Why did you choose this specific model architecture?",
          "How do you evaluate and eliminate model hallucinations?",
          "What is the token cost and latency profile per user request?",
        ],
      },
      {
        num: "03",
        title: "The 'No Jerks' Rule",
        items: [
          "Treat the interviewer as a collaborative teammate",
          "Clarify ambiguous constraints and verbalize your trade-offs",
          "Accept code critique with humility, poise, and systems rigor",
        ],
      },
    ],
    questionPrompt: "If an interviewer challenges your code and says, 'This solution will fail when latency spikes,' do you argue back and stand your ground, or do you ask questions?",
    speakerHook: "Lawrence Moroni mentored an elite coder who failed over 300 interview loops because he was trained to be rigid and defensive. Companies don't hire brilliant jerks; they hire teammates.",
    punchline: "When an interviewer challenges your code, clarify constraints and defend trade-offs with humility.",
    maxBuildSteps: 3,
    notes: "Audience Question #5: 'If an interviewer challenges your code, do you argue back or ask questions?'\n\nSpeaker Hook: 'Companies don't hire brilliant jerks; they hire teammates who collaborate and defend systems with humility.'",
  },

  // SLIDE 29 — THE ULTIMATE INTERVIEW TEST
  {
    id: "sanjauli_slide_29",
    type: "BIG_QUESTION",
    badge: "THE ULTIMATE TEST",
    title: "“Never Put an AI Project on Your Resume That You Cannot Defend on a Whiteboard.”",
    subtitle: "If an interviewer takes your project apart for 30 minutes, can you defend every single decision?",
    maxBuildSteps: 1,
    notes: "If the interviewer tears down your architecture for 30 minutes, can you defend every decision? If yes: YOU built it. If no: AI built it.\n\nTransition: 'Now, how do you actually execute all of this while in college?'",
  },

  // =========================================================================
  // ACT 7 — UNISOLE PROGRAM REVEAL & CALL TO ACTION
  // =========================================================================

  // SLIDE 30 — THE EXECUTION GAP
  {
    id: "sanjauli_slide_30",
    type: "SCENARIO_SPLIT",
    badge: "ACT 7: THE EXECUTION PATHWAY",
    title: "College Teaches Knowledge. Industry Demands Execution.",
    subtitle: "Bridging the gap between classroom theory and production engineering.",
    scenarioA: {
      title: "COLLEGE SYLLABUS (Theoretical Knowledge)",
      subtitle: "Essential theoretical academic foundation",
      steps: [
        "Classroom lectures, textbook theory & paper-based exams",
        "Syntax memorization without live production deployment",
        "Building toy assignment clones without real users or stress tests",
        "Zero exposure to cloud infrastructure, CI/CD, or production logs",
      ],
      footer: "Academic foundation · Knowledge without execution",
    },
    scenarioB: {
      title: "THE INDUSTRY GAP (What Employers Demand)",
      subtitle: "The practical skills required to land top engineering roles",
      steps: [
        "Real-world problem-based capstone systems with live users",
        "Applied AI toolchains: RAG, tool calling, local models & evaluation",
        "Docker containerization, cloud deployment & CI/CD test suites",
        "Outcome-driven resume, portfolio showcase & interview defense",
      ],
      footer: "The execution bridge · Moving from student to hired engineer",
    },
    punchline: "This gap is exactly what prevents ambitious BCA students from breaking into top roles.",
    maxBuildSteps: 2,
    notes: "College teaches knowledge. Industry demands execution. Between them is a massive gap: skills, projects, industry tools, mentorship, portfolio, and interview preparation. This gap is what students struggle with.\n\nTransition: 'And that is why UNISOLE exists.'",
  },

  // SLIDE 31 — UNISOLE PROGRAM REVEAL (6 PILLARS)
  {
    id: "sanjauli_slide_31",
    type: "THREE_CARDS",
    badge: "UNISOLE INDUSTRIAL TRAINING",
    title: "Industrial Training & Internship Opportunity Program",
    subtitle: "By UNISOLE Skill AI Labs · The 6 Core Execution Pillars",
    cards: [
      {
        num: "01",
        title: "Skills & Applied AI",
        items: [
          "Full-stack REST APIs, SQL databases, Git & Linux shell",
          "LLM prompting, RAG architectures, local models & agent tool calling",
          "Production test suites and defensive error boundaries",
        ],
      },
      {
        num: "02",
        title: "Flagship Projects",
        items: [
          "Build real problem-based microservices, not toy clones",
          "One-command setup via Docker & Docker Compose",
          "Live cloud deployment with documented architecture specs",
        ],
      },
      {
        num: "03",
        title: "Portfolio & Interviews",
        items: [
          "Google X-Y-Z impact resume & flagship GitHub showcase",
          "High-signal prototype outreach to engineering leads",
          "Mock technical whiteboard loops and architecture defense",
        ],
      },
    ],
    punchline: "Not another certificate course. An execution engine to build verified proof of work.",
    maxBuildSteps: 3,
    notes: "Present the 6 pillars: Skills, Projects, AI Tooling, Portfolio, Career Outreach, and Interview Mastery.\n\nTransition: 'Let's look at the complete 9-stage transformation journey.'",
  },

  // SLIDE 32 — THE 9-STAGE JOURNEY
  {
    id: "sanjauli_slide_32",
    type: "PIPELINE_FLOW",
    badge: "THE TRANSFORMATION PIPELINE",
    title: "The 9-Stage Execution Pipeline",
    subtitle: "From student learner to verified, employable software engineer.",
    stages: [
      "1. LEARN",
      "2. BUILD",
      "3. TEST",
      "4. DEPLOY",
      "5. DOCUMENT",
      "6. PORTFOLIO",
      "7. APPROACH",
      "8. INTERVIEW",
      "9. INTERNSHIP",
    ],
    punchline: "Move from 'I am a student who learned things' to 'I am an engineer who demonstrates proof of work.'",
    maxBuildSteps: 3,
    notes: "Walk through the pipeline: LEARN → BUILD → TEST → DEPLOY → DOCUMENT → PORTFOLIO → APPROACH → INTERVIEW → INTERNSHIP.\n\nThis is not a theoretical certificate. It is a systematic roadmap to capability.",
  },

  // SLIDE 33 — THE BIG QUESTION
  {
    id: "sanjauli_slide_33",
    type: "BIG_QUESTION",
    badge: "THE ACTION CHECK",
    title: "“What Will You Do Differently After Today?”",
    subtitle: "Don't say 'I will learn AI.' That's too vague.",
    maxBuildSteps: 1,
    notes: "Dark screen. Give them 10 seconds of silence. Then: 'Don't tell me you will learn AI. That's too vague. Tell yourself: What will I build? What skill will I master? What company will I approach? What proof will I create?'",
  },

  // SLIDE 34 — THE VALUE CHAIN HAS MOVED
  {
    id: "sanjauli_slide_34",
    type: "PROOF_HIERARCHY",
    badge: "THE MOVING VALUE CHAIN",
    title: "The Value Chain Has Moved",
    subtitle: "AI is changing the game. Position yourself where value compounds.",
    layers: [
      {
        label: "TYPING SYNTAX",
        desc: "Automated by AI models in seconds (Low economic value / Commodity)",
      },
      {
        label: "SCAFFOLDING BOILERPLATE",
        desc: "Instantly generated via modern AI prompts and scaffolding tools",
      },
      {
        label: "PROBLEM DEFINITION & SPECS",
        desc: "Translating messy real-world ambiguity into precise architectural specifications",
      },
      {
        label: "DEFENSIVE SYSTEM DESIGN",
        desc: "Ensuring security, database resilience, latency optimization & error boundaries",
      },
      {
        label: "BUSINESS VALUE & OUTCOMES",
        desc: "Slashing costs, automating workflows, and delivering reliable customer ROI",
      },
    ],
    punchline: "Don't compete at the bottom of the value chain. Lead at the top.",
    maxBuildSteps: 3,
    notes: "AI is not killing software engineering. It is moving the value chain upward: From Typing → Building → Problem Solving → Systems Architecture → Business Value.",
  },

  // SLIDE 35 — FINAL MESSAGE & CALLBACK
  {
    id: "sanjauli_slide_35",
    type: "FINAL_MESSAGE",
    badge: "YOUR CAREER AFTER AI",
    title: "DON'T COMPETE WITH AI. LEARN TO DIRECT IT.",
    subtitle: "Understand deeply. Build boldly. Verify everything. Show your work.",
    quote: "“Your degree gets you into the conversation. Your proof gets you taken seriously.”",
    punchline: "The future belongs to builders who direct AI with deep systems understanding.",
    maxBuildSteps: 3,
    notes: "Return to the opening question: 'If AI can code, why should a company hire you?'\n\nBecause companies aren't hiring syntax typers. They are hiring engineers who understand, build, verify, communicate, and create value.\n\nYour degree gets you into the conversation. Your proof gets you taken seriously.\n\nThank you, and now go build!",
  },
];
