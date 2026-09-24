export const SUNNI_COLLEGE_PPT_SLIDES = [
  // =========================================================================
  // SLIDE 1 — PROGRAM NAME & COVER
  // =========================================================================
  {
    id: "sunni_slide_1",
    type: "COVER",
    badge: "INDUSTRIAL TRAINING CUM INTERNSHIP OPPORTUNITY PROGRAM",
    title: "UNISOLE AI CAMPUS PROGRAM",
    subtitle: "Industrial Training cum Internship Opportunity Program · Atal Bihari Vajpayee Govt. Degree College, Sunni",
    org: "UNISOLE SKILL AI LABS",
    maxBuildSteps: 2,
    notes: "Welcome everyone at Atal Bihari Vajpayee Govt. Degree College Sunni! In the next 50 minutes, we are tackling the single most urgent question on every student's mind: In an era where AI can write code, analyze data, and draft documents in seconds, what happens to your degree and how do you build an indispensable career?",
  },

  // =========================================================================
  // SLIDE 2 — FOUNDER INTRODUCTION (REF: THEOG SLIDE)
  // =========================================================================
  {
    id: "sunni_slide_2",
    type: "FOUNDER_BIO",
    badge: "WHO IS TALKING TO YOU TODAY?",
    title: "AJAY MOKTA",
    subtitle: "Founder — UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur",
    initials: "AM",
    credentials: [
      "Founder — UNISOLE Skill AI Labs",
      "B.Tech, NIT Hamirpur Alumnus",
      "AI Educator & Keynote Speaker",
      "Deep-Tech Innovator & Entrepreneur",
      "Mentored 5,000+ students across India",
    ],
    quote: "“A degree from any college in Himachal should be backed by skills that compete globally.”",
    maxBuildSteps: 2,
    notes: "I walked the journey from an engineering college in Himachal to building deep-tech and mentoring thousands of students. Today, we're here to talk about what actually matters for your career in the age of AI.",
  },

  // =========================================================================
  // SLIDE 3 — OUR TEAM (REF: THEOG SLIDE)
  // =========================================================================
  {
    id: "sunni_slide_3",
    type: "TEAM_GRID",
    badge: "OUR TEAM",
    title: "Meet Our Team",
    subtitle: "Built by practitioners, engineers, and researchers from premier institutions.",
    pillars: ["AI SYSTEMS", "BACKEND ARCHITECTURE", "INDUSTRY RESEARCH", "ACADEMIC EXPOSURE"],
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
        role: "Software Engineer at BlackRock · B.Tech, NIT Hamirpur · AI Expert",
      },
      {
        initials: "KK",
        name: "Kushal Kesharwani",
        role: "IIT Patna · Engineer — Tech Mahindra · Systems Expert",
      },
      {
        initials: "AK",
        name: "Aditya Kaushal",
        role: "M.Tech — IIT Delhi · Academic & Technical Mentor",
      },
    ],
    maxBuildSteps: 2,
    notes: "Our team comprises practitioners who have built and shipped scalable systems at BlackRock, NASA Space Apps, Tech Mahindra, and IITs. We bring production standards directly to Himachal colleges.",
  },

  // =========================================================================
  // SLIDE 4 — YOUR CAREER WORLD HAS CHANGED
  // =========================================================================
  {
    id: "sunni_slide_4",
    type: "COVER",
    badge: "PART 1: AI HISTORY",
    title: "YOUR CAREER WORLD HAS CHANGED",
    subtitle: "First understand AI → Then decide your path · A clear guide for BCA • BSc • BCom • BBA students",
    org: "ACT 1: THE FOUNDATION",
    maxBuildSteps: 2,
    notes: "Before you decide whether to prepare for an exam, do an MBA, or learn coding, you must first understand the fundamental technology that is rewriting every white-collar profession on Earth.",
  },

  // =========================================================================
  // SLIDE 5 — OPENING QUESTION: WHEN DID AI START?
  // =========================================================================
  {
    id: "sunni_slide_5",
    type: "BIG_QUESTION",
    badge: "OPENING QUESTION",
    title: "What do you think… when did AI actually start?",
    subtitle: "Was it ChatGPT in 2022? Or does the story go much deeper?",
    maxBuildSteps: 1,
    questionPrompt: "What do you think… when did AI actually start?",
    speakerHook: "Most students believe AI started in 2022 with ChatGPT. In reality, it began with a biological insight 80 years ago in 1943.",
    notes: "Pause and ask the audience: 'Raise your hands—how many of you think AI started in 2022 with ChatGPT? Let's take a quick look back to where it all began.'",
  },

  // =========================================================================
  // SLIDE 6 — THE BEGINNING (1943): NEURON AS A SWITCH
  // =========================================================================
  {
    id: "sunni_slide_6",
    type: "THREE_CARDS",
    badge: "1943: THE BEGINNING",
    title: "It All Started in 1943: Neuron as a Switch",
    subtitle: "Two scientists tried to mimic the human brain with a mathematical model.",
    cards: [
      {
        num: "01",
        title: "The Two Pioneers",
        items: [
          "Warren McCulloch — Neuroscientist",
          "Walter Pitts — Logician & Mathematician",
          "First mathematical model of artificial neural networks",
        ],
      },
      {
        num: "02",
        title: "Their Big Idea",
        items: [
          "A biological neuron works like a switch (ON or OFF)",
          "Binary electrical logic modeling human cognition",
          "Simple switches combined to compute logic gates",
        ],
      },
      {
        num: "03",
        title: "The Big Hypothesis",
        items: [
          "“If we connect enough switches in the right way...”",
          "“...we can solve any complex problem on Earth.”",
          "The theoretical blueprint behind all modern AI models",
        ],
      },
    ],
    punchline: "80 years ago, scientists proved that connecting enough binary switches could recreate intelligence.",
    maxBuildSteps: 3,
    notes: "80 years ago, McCulloch and Pitts realized our brains are networks of simple switches. Connect enough switches properly, and you can compute anything.",
  },

  // =========================================================================
  // SLIDE 7 — WHAT MAKES A MACHINE INTELLIGENT?
  // =========================================================================
  {
    id: "sunni_slide_7",
    type: "THREE_CARDS",
    badge: "THE 4 CORE QUESTIONS",
    title: "What Makes a Machine Intelligent?",
    subtitle: "The four fundamental capabilities that define artificial intelligence.",
    cards: [
      {
        num: "01",
        title: "Learning & Adaptation",
        items: [
          "01: Can it learn from past experience and data?",
          "04: Can it improve its performance over time without being rewritten?",
          "Self-adjusting internal parameters and weights",
        ],
      },
      {
        num: "02",
        title: "Reasoning & Problem Solving",
        items: [
          "02: Can it reason and solve new, unseen problems?",
          "Synthesizing logical chains across different domains",
          "Handling novel situations outside its training set",
        ],
      },
      {
        num: "03",
        title: "Language & Communication",
        items: [
          "03: Can it understand, parse, and generate human language?",
          "Connecting abstract symbols to real-world meaning",
          "Engaging in context-aware conversations with humans",
        ],
      },
    ],
    punchline: "These 4 questions guided researchers for 70 years. Today, modern AI models check all four boxes.",
    maxBuildSteps: 3,
    notes: "These are the four questions AI researchers chased for 70 years: Can it learn? Can it reason? Can it understand language? Can it improve over time? Today, models check all four boxes.",
  },

  // =========================================================================
  // SLIDE 8 — THE TURING TEST (1950)
  // =========================================================================
  {
    id: "sunni_slide_8",
    type: "BIG_QUESTION",
    badge: "1950: THE BENCHMARK",
    title: "The Turing Test (1950)",
    subtitle: "Alan Turing asked a simple question that defined computing forever.",
    questionPrompt: "If a machine can talk to a human, and the human cannot tell whether it is a machine or another human… Can we call it intelligent?",
    speakerHook: "Alan Turing replaced the metaphysical question 'Can machines think?' with a practical test of imitation and communication.",
    notes: "Alan Turing in 1950 gave us the imitation game. In 2026, large language models pass the Turing Test effortlessly every single second.",
  },

  // =========================================================================
  // SLIDE 9 — 1956: THE NAME IS BORN
  // =========================================================================
  {
    id: "sunni_slide_9",
    type: "TIMELINE_EVOLUTION",
    badge: "1956: DARTMOUTH",
    title: "1956 — The Name is Born",
    subtitle: "The Dartmouth Summer Research Project on Artificial Intelligence.",
    timeline: [
      {
        year: "1956",
        label: "Dartmouth Conference · John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon organize the historic summer workshop at Dartmouth College.",
      },
      {
        year: "The Name",
        label: "John McCarthy coined the term “Artificial Intelligence” · Defining the quest to make machines simulate every aspect of human learning.",
      },
      {
        year: "Birth",
        label: "Official Birth of AI · This conference is officially recognized worldwide as the birth of AI as an independent scientific field.",
      },
    ],
    stats: [
      { value: "1956", label: "DARTMOUTH", sub: "Historic Summer Workshop" },
      { value: "McCarthy", label: "COINED AI", sub: "Father of Artificial Intelligence" },
      { value: "Official", label: "BIRTH OF AI", sub: "Scientific Discipline Founded" },
    ],
    quote: "“Every aspect of learning or any other feature of intelligence can in principle be simulated.”",
    maxBuildSteps: 2,
    notes: "John McCarthy coined the term in 1956. The ambition was total: they predicted that simulating every aspect of learning and intelligence was just a matter of time and compute.",
  },

  // =========================================================================
  // SLIDE 10 — AI WINTER → THE COMEBACK
  // =========================================================================
  {
    id: "sunni_slide_10",
    type: "TIMELINE_EVOLUTION",
    badge: "HISTORICAL WAVES",
    title: "AI Winter → The Comeback",
    subtitle: "How theoretical mathematics turned into everyday superhuman reality.",
    timeline: [
      {
        year: "1970s–80s",
        label: "AI Winter · High expectations outpaced compute power → Slow progress → Funding dropped and research froze worldwide.",
      },
      {
        year: "1997",
        label: "Deep Blue · IBM’s supercomputer defeated World Chess Champion Garry Kasparov through brute-force symbolic search.",
      },
      {
        year: "2010s",
        label: "Deep Learning · The internet created massive data; GPUs made multi-layer neural networks exponentially powerful.",
      },
      {
        year: "2022+",
        label: "ChatGPT Era · Large Language Models became useful, interactive, and accessible for everyone on Earth.",
      },
    ],
    stats: [
      { value: "1970s–80s", label: "AI WINTER", sub: "Funding froze worldwide" },
      { value: "1997", label: "DEEP BLUE", sub: "Kasparov chess victory" },
      { value: "2010s", label: "DEEP LEARNING", sub: "Data + GPU revolution" },
      { value: "2022+", label: "CHATGPT ERA", sub: "LLMs accessible to all" },
    ],
    quote: "“Technology moves slowly through skepticism, and then suddenly hits an exponential curve.”",
    maxBuildSteps: 2,
    notes: "Notice the cycle: Boom, winter, breakthrough, explosion. When compute and data arrived in the 2010s, AI crossed from academic labs into our everyday pockets.",
  },

  // =========================================================================
  // SLIDE 11 — BEYOND CHATBOTS: 83%+ PROTEIN PREDICTION & MATH REINVENTION
  // =========================================================================
  {
    id: "sunni_slide_11",
    type: "THREE_CARDS",
    badge: "SUPERHUMAN AI CAPABILITY",
    title: "Beyond Chatbots: Solving Biology & Reinventing Math",
    subtitle: "AI is not just writing text — it is solving 50-year biological mysteries and discovering algorithms.",
    cards: [
      {
        num: "01",
        title: "AlphaFold: 83%+ Protein Prediction",
        items: [
          "Solved the 50-year biological mystery of protein 3D folding",
          "Predicted 200,000,000+ protein structures with 83%+ atomic accuracy",
          "Completed in months what would take 1,000,000+ human lab years",
          "Won the 2024 Nobel Prize in Chemistry (Demis Hassabis & John Jumper)",
        ],
      },
      {
        num: "02",
        title: "FunSearch: Discovering Math",
        items: [
          "DeepMind paired LLMs with mathematical program evaluators",
          "Discovered novel solutions to the Cap Set Problem in combinatorics",
          "Discovered faster matrix multiplication algorithms missed for 50 years",
          "AI generating brand-new mathematical algorithms humans never found",
        ],
      },
      {
        num: "03",
        title: "AlphaGeometry: Olympiad Proofs",
        items: [
          "Solved International Mathematical Olympiad geometry at silver medal level",
          "Synthesized complex auxiliary constructions without human hints",
          "Proved 25 of 30 Olympiad geometry problems within standard time limits",
          "Proves AI is capable of deep, verifiable multi-step formal reasoning",
        ],
      },
    ],
    punchline: "When AI predicts 200 million proteins and discovers new mathematics, textbook memorization is obsolete.",
    maxBuildSteps: 3,
    notes: "AI predicted 200 million proteins with 83%+ accuracy, winning the 2024 Nobel Prize in Chemistry. And with FunSearch, AI is discovering new mathematical algorithms that human mathematicians missed for 50 years. This is an intellectual revolution.",
  },

  // =========================================================================
  // SLIDE 12 — THE TRANSITION: “आगे क्या सोचा है?”
  // =========================================================================
  {
    id: "sunni_slide_12",
    type: "BIG_QUESTION",
    badge: "THE PIVOT QUESTION",
    title: "आगे क्या सोचा है?",
    subtitle: "Today AI can write, code, analyse and design… And it is starting to take over many human tasks. So the real question becomes…",
    maxBuildSteps: 1,
    questionPrompt: "Today AI can write, code, analyse and design… And it is starting to take over many human tasks. So the real question becomes… आगे क्या सोचा है?",
    speakerHook: "If AI can write code, analyze data, design interfaces, and solve math in seconds... what have YOU planned for your career?",
    notes: "[THE DRAMATIC PAUSE] Today AI can write code, analyze data, design interfaces, and solve math. It is rapidly automating entry-level white-collar work. So look inside yourself and answer honestly: आगे क्या सोचा है?",
  },

  // =========================================================================
  // SLIDE 13 — PARENTS' WORLD VS YOUR WORLD
  // =========================================================================
  {
    id: "sunni_slide_13",
    type: "SCENARIO_SPLIT",
    badge: "PART 2: THE GENERATIONAL RESET",
    title: "Your Parents’ World vs. Your World",
    subtitle: "The rules of the economy changed completely while academic advice stayed frozen.",
    scenarioA: {
      title: "THEN (Parents & Professors)",
      subtitle: "The 1995–2015 Career Landscape",
      steps: [
        { time: "ECONOMY", label: "Private sector was still small; Government job was the main path" },
        { time: "DEGREE", label: "One degree could lock a stable, respected life for 30 years" },
        { time: "SKILLS", label: "Skills stayed useful for 15–20 years without needing retraining" },
        { time: "LEARNING", label: "Learning mostly stopped after college convocation" },
      ],
      footer: "One degree = lifetime security.",
    },
    scenarioB: {
      title: "NOW (Your Generation)",
      subtitle: "The 2026 AI Era Reality",
      steps: [
        { time: "HIRING SQUEEZE", label: "Private sector fresher hiring fell from 6 Lakh to 2.5 Lakh/year" },
        { time: "COMPETITION", label: "1.1 Crore students graduate every single year in India" },
        { time: "LIFECYCLE", label: "Technical skills expire in 3–5 years; AI rewrites entry-level tasks" },
        { time: "CURRENCY", label: "Proof of real skill and execution matters far more than degree" },
      ],
      footer: "Skills expire in 3 years. Proof of work is the only currency.",
    },
    maxBuildSteps: 2,
    notes: "Contrast the two eras clearly. Your parents could get one degree and relax for 25 years. Today, 1.1 Crore students enter the market every year, fresher hiring fell by 60%, and skills expire every 3 years.",
  },

  // =========================================================================
  // SLIDE 14 — THE HARD NUMBER: 1.1 CRORE
  // =========================================================================
  {
    id: "sunni_slide_14",
    type: "COMPARISON_STATS",
    badge: "THE MACRO SCALE",
    title: "The Hard Number: 1.1 Crore Graduates",
    subtitle: "Your competition is no longer just your college. It is every ambitious student across the country.",
    stat1: {
      year: "Annual Graduates",
      count: "1.1 Crore",
      label: "STUDENTS GRADUATE EVERY YEAR IN INDIA",
      ratio: "Massive competition for entry-level white-collar roles",
    },
    stat2: {
      year: "Fresher Intake",
      count: "2.5 Lakh",
      label: "FRESHERS RECRUITED PER YEAR",
      ratio: "Slashed from 6 Lakh freshers recruited previously",
    },
    statCompetition: {
      number: "44 : 1",
      label: "APPLICANTS PER ENTRY SEAT",
      detail: "Textbook syllabus marks cannot differentiate you in a pool of 1.1 Crore candidates.",
    },
    insightBox: {
      title: "The Hard Truth",
      text: "When millions hold a degree, companies filter candidates by proof of execution and live projects, not paper certificates.",
    },
    maxBuildSteps: 4,
    notes: "Deliver the number with weight: 1.1 Crore graduates every single year. You cannot stand out by doing what everyone else is doing.",
  },

  // =========================================================================
  // SLIDE 15 — AI IS THE BIGGEST CATALYST OF CHANGE
  // =========================================================================
  {
    id: "sunni_slide_15",
    type: "THREE_CARDS",
    badge: "CATALYST OF CHANGE",
    title: "AI is the Biggest Catalyst of Change",
    subtitle: "How learning, jobs, and career preparation are being permanently rewritten.",
    cards: [
      {
        num: "01",
        title: "What You Learn",
        items: [
          "Memorisation is becoming cheap",
          "AI already knows more facts than any textbook",
          "Understanding system architecture beats memorizing syntax",
        ],
      },
      {
        num: "02",
        title: "How You Learn & Prepare",
        items: [
          "Don’t spend 1 month on one concept; become an absolute quick learner",
          "Degree opens the door; proof of real skill decides who gets selected",
          "Build systems instead of reading theory passively",
        ],
      },
      {
        num: "03",
        title: "What Jobs Exist",
        items: [
          "Many routine entry-level tasks are shrinking",
          "New roles need people who direct and build with AI",
          "High-value orchestration replacing manual data entry",
        ],
      },
    ],
    punchline: "Memorization is cheap. Your competitive edge is how quickly you learn, apply, and direct AI systems.",
    maxBuildSteps: 3,
    notes: "Memorization is cheap. AI has read every textbook ever printed. Your edge is how quickly you learn, apply, and direct these tools.",
  },

  // =========================================================================
  // SLIDE 16 — WHAT TO WORRY ABOUT (THE DEATH OF AVERAGE)
  // =========================================================================
  {
    id: "sunni_slide_16",
    type: "SCENARIO_SPLIT",
    badge: "THE REAL RISK",
    title: "What You Should NOT Worry About vs. What You SHOULD",
    subtitle: "Focus your energy on what is within your control.",
    scenarioA: {
      title: "WHAT YOU SHOULD NOT WORRY ABOUT",
      subtitle: "Forces completely outside your control",
      steps: [
        { time: "AI CAPABILITIES", label: "You should not worry about what AI can do" },
        { time: "ACCELERATION", label: "AI will keep getting better, faster, and cheaper at tasks" },
        { time: "REALITY", label: "That is not in your control — fighting it is futile" },
      ],
      footer: "Stop worrying about the tools.",
    },
    scenarioB: {
      title: "WHAT YOU SHOULD WORRY ABOUT",
      subtitle: "The only risk that determines your career",
      steps: [
        { time: "STAYING AVERAGE", label: "Staying average in a world that no longer rewards average" },
        { time: "PASSIVE DEGREE", label: "Relying on textbook marks without building real projects" },
        { time: "NO PROOF", label: "Having zero evidence that you can solve real problems" },
      ],
      footer: "The world no longer rewards average. It rewards verified builders.",
    },
    maxBuildSteps: 2,
    notes: "Stop wasting time panicking about AI updates. Panic about staying average. The market will gladly pay high salaries to exceptional builders, but it will pay zero to average graduates.",
  },

  // =========================================================================
  // SLIDE 17 — THE BIG QUESTION
  // =========================================================================
  {
    id: "sunni_slide_17",
    type: "BIG_QUESTION",
    badge: "THE BIG QUESTION",
    title: "The Big Question",
    subtitle: "If AI can research, code, analyse and design… Why will companies still hire fresh graduates?",
    maxBuildSteps: 1,
    questionPrompt: "If AI can research, code, analyse and design… Why will companies still hire fresh graduates?",
    speakerHook: "Companies do not hire freshers for raw syntax or clerical typing anymore. They hire candidates who understand the project cycle and own the solution.",
    notes: "Pause. Ask the room to answer: 'If an AI can write 500 lines of code in 10 seconds, why would a company pay you ₹50,000 a month to write code?' Let us look at what industry actually does.",
  },

  // =========================================================================
  // SLIDE 18 — WHAT INDUSTRY ACTUALLY DOES (THE 6-STAGE CYCLE)
  // =========================================================================
  {
    id: "sunni_slide_18",
    type: "PIPELINE_FLOW",
    badge: "PART 3: UNDERSTANDING INDUSTRY",
    title: "First Understand What Industry Actually Does",
    subtitle: "Most companies follow a similar 6-stage project cycle from idea to production.",
    stages: [
      "1. Understand Problem (Market & User Research: Talking to 50 users, reading reviews)",
      "2. Product Specification (Decide exact features: Writing clear requirements)",
      "3. Design Solution (How it looks & works: Wireframes, system design)",
      "4. Build It (Implementation: Writing code / creating models)",
      "5. Test & Improve (Check quality + user feedback: Bug testing)",
      "6. Launch & Monitor (Release and keep improving: Watching live metrics)",
    ],
    punchline: "College exams only test Stage 4 (memorizing syntax). But industry lives across all 6 stages.",
    maxBuildSteps: 3,
    notes: "Walk through the 6 stages. College exams only test Stage 4 (memorizing syntax). But industry lives across all 6 stages. Now see where AI fits into this cycle.",
  },

  // =========================================================================
  // SLIDE 19 — FROM THIS CYCLE… WHAT IS BECOMING CHEAP?
  // =========================================================================
  {
    id: "sunni_slide_19",
    type: "THREE_CARDS",
    badge: "COMMODITIZED TASKS",
    title: "From This Cycle… What is Becoming CHEAP?",
    subtitle: "Anything that is repetitive, boilerplate, or first-draft is being commoditized by AI.",
    cards: [
      {
        num: "01",
        title: "Research & Documentation",
        items: [
          "Reading 50 papers / reports → AI summarises them in minutes",
          "Writing long documents → AI drafts documents quickly",
          "Summarizing user surveys and industry reports instantly",
        ],
      },
      {
        num: "02",
        title: "First Drafts & Wireframes",
        items: [
          "Writing code, content, reports → AI generates first version very fast",
          "Making initial wireframes → AI generates multiple design options",
          "Routine boilerplate scaffolding created in seconds",
        ],
      },
      {
        num: "03",
        title: "Routine Testing & Debugging",
        items: [
          "Writing basic test cases → AI can generate and run many tests",
          "Catching common syntax typos and formatting code",
          "Trivial unit test generation automated",
        ],
      },
    ],
    punchline: "Key point: Anything that is repetitive or first-draft is becoming cheap.",
    maxBuildSteps: 3,
    notes: "Point out: What used to take junior engineers 3 weeks—drafting boilerplate, reading documents, writing basic tests—now takes an AI 3 minutes. That is why routine fresher hiring dropped.",
  },

  // =========================================================================
  // SLIDE 20 — FROM THIS CYCLE… WHAT IS BECOMING VALUABLE?
  // =========================================================================
  {
    id: "sunni_slide_20",
    type: "THREE_CARDS",
    badge: "PREMIUM HUMAN SKILLS",
    title: "From This Cycle… What is Becoming VALUABLE?",
    subtitle: "Where human judgment, critical evaluation, and ownership command premium compensation.",
    cards: [
      {
        num: "01",
        title: "Problem Understanding & Specs",
        items: [
          "AI cannot feel real user pain → Talking to real people + deep observation",
          "AI cannot decide what truly matters → Judgment + ruthless prioritisation",
          "Framing the right questions and business goals",
        ],
      },
      {
        num: "02",
        title: "Architecture & Quality Judgment",
        items: [
          "AI misses long-term reliability → System thinking + ownership",
          "AI cannot decide if output is good enough → Critical review of AI output",
          "Designing fault-tolerant databases and resilient pipelines",
        ],
      },
      {
        num: "03",
        title: "Final Decision & Accountability",
        items: [
          "AI has zero accountability when systems fail",
          "Human ownership, legal liability, and operational responsibility",
          "Standing behind the code and making the ultimate call",
        ],
      },
    ],
    punchline: "When first drafts become free, judgment and ownership become priceless.",
    maxBuildSteps: 3,
    notes: "AI cannot talk to a customer in Sunni or Shimla and feel their real frustration. AI cannot take legal or operational responsibility when a bank server crashes. Ownership and judgment are where your value lives.",
  },

  // =========================================================================
  // SLIDE 21 — SIMPLE SUMMARY: CHEAP VS VALUABLE
  // =========================================================================
  {
    id: "sunni_slide_21",
    type: "COMPARISON_STATS",
    badge: "THE TAKEAWAY MATRIX",
    title: "Simple Summary: Becoming Cheap vs. Valuable",
    subtitle: "A clear compass for where to invest your learning time.",
    stat1: {
      year: "BECOMING CHEAP",
      count: "First Drafts",
      label: "COMMODITIZED TASKS",
      ratio: "Research summaries · Routine work · Repetitive tasks",
    },
    stat2: {
      year: "BECOMING VALUABLE",
      count: "Judgment",
      label: "HIGH-VALUE SKILLS",
      ratio: "Context · Prioritisation · Architecture · Ownership",
    },
    statCompetition: {
      number: "10x",
      label: "ENGINEERING LEVERAGE",
      detail: "Builders who master judgment and AI orchestration achieve 10x the output of traditional coders.",
    },
    insightBox: {
      title: "The Core Lesson",
      text: "Stop spending your college years mastering what AI makes cheap. Invest your time mastering what AI makes valuable.",
    },
    maxBuildSteps: 4,
    notes: "Memorize this slide: First drafts, research summaries, routine work, repetitive tasks = CHEAP. Judgment, context, prioritization, ownership = VALUABLE.",
  },

  // =========================================================================
  // SLIDE 22 — GETTING A JOB IS NO LONGER SIMPLE
  // =========================================================================
  {
    id: "sunni_slide_22",
    type: "PROOF_HIERARCHY",
    badge: "THE HIRING PROCESS",
    title: "Getting a Job is No Longer Simple",
    subtitle: "The old linear path has been replaced by a multi-layered verification process.",
    layers: [
      {
        label: "EARLIER (DEGREE → JOB)",
        desc: "Your education level was almost equivalent to getting a job. Degree = Placement.",
      },
      {
        label: "LAYER 1: INDUSTRY SKILLS",
        desc: "Modern core foundations beyond textbook theory (Git, Docker, APIs, Local LLMs).",
      },
      {
        label: "LAYER 2: REAL PROJECTS",
        desc: "Production-grade projects with live cloud endpoints, tests, and real data.",
      },
      {
        label: "LAYER 3: STRONG RESUME",
        desc: "Quantified Google X-Y-Z formula proving measurable engineering impact.",
      },
      {
        label: "LAYER 4: SMART OUTREACH",
        desc: "High-signal proof-of-work outreach bypassing crowded ATS black holes.",
      },
      {
        label: "LAYER 5: INTERVIEW PERFORMANCE",
        desc: "Whiteboard architecture defense, trade-offs, and failure mode resilience.",
      },
    ],
    punchline: "Degree alone is step zero. The other five layers decide who actually gets hired.",
    maxBuildSteps: 3,
    notes: "In 2005, having a degree was enough to get hired. In 2026, the degree only gets you to the starting line. You need skills, projects, a proof resume, smart outreach, and interview defense.",
  },

  // =========================================================================
  // SLIDE 23 — WHAT BECOMES MORE VALUABLE IN YOUR STREAM
  // =========================================================================
  {
    id: "sunni_slide_23",
    type: "THREE_CARDS",
    badge: "PART 4: SOLUTION — HOW TO WIN",
    title: "What Becomes More Valuable in Your Stream",
    subtitle: "How students from BCA, B.Sc, and B.Com/BBA differentiate themselves.",
    cards: [
      {
        num: "01",
        title: "BCA / Tech",
        items: [
          "System Design & Architecture",
          "Building Production AI Applications",
          "Reliability, Testing & System Ownership",
        ],
      },
      {
        num: "02",
        title: "BSc / Science",
        items: [
          "Deep Scientific Domain Expertise",
          "Scientific Validation of AI Models",
          "Applying AI Models to Real Research & Data",
        ],
      },
      {
        num: "03",
        title: "BCom / BBA",
        items: [
          "Business Judgment & Unit Economics",
          "Applying AI Tools to Real Corporate Decisions",
          "Financial Forecasting, Auditing & Growth",
        ],
      },
    ],
    punchline: "Every stream has a direct superpower in the AI age if you pair domain knowledge with AI orchestration.",
    maxBuildSteps: 3,
    notes: "Look at your specific stream: BCA students must master system design and AI apps. B.Sc students must master scientific validation. B.Com/BBA students must master business judgment and applying AI to financial decisions.",
  },

  // =========================================================================
  // SLIDE 24 — RISING ROLES FOR BCA STUDENTS
  // =========================================================================
  {
    id: "sunni_slide_24",
    type: "STREAM_ROLES",
    badge: "BCA SPECIALIZATION",
    stream: "BCA / TECH",
    title: "Rising Roles for BCA Students",
    subtitle: "High-growth career tracks replacing legacy service desk positions.",
    roles: [
      {
        num: "01",
        title: "Generative AI Engineer",
        desc: "Build applications using Large Language Models, embeddings, and vector RAG pipelines.",
      },
      {
        num: "02",
        title: "Agentic AI Engineer",
        desc: "Design and build AI agents that autonomously complete multi-step business tasks.",
      },
      {
        num: "03",
        title: "Full-Stack AI Engineer",
        desc: "Build complete AI-powered products connecting modern web/mobile interfaces to microservices.",
      },
      {
        num: "04",
        title: "AI Application Developer",
        desc: "Create production-ready AI features, streaming endpoints, and tools inside real products.",
      },
    ],
    maxBuildSteps: 4,
    notes: "These are the exact job titles hiring in 2026. Stop applying as a generic 'PHP developer' or 'HTML/CSS coder.' Position yourself as an AI Application Developer or Generative AI Engineer.",
  },

  // =========================================================================
  // SLIDE 25 — RISING ROLES FOR B.SC STUDENTS
  // =========================================================================
  {
    id: "sunni_slide_25",
    type: "STREAM_ROLES",
    badge: "B.SC SPECIALIZATION",
    stream: "B.SC SCIENCE",
    title: "Rising Roles for BSc Students",
    subtitle: "Applying mathematical and scientific rigor to modern computational problems.",
    roles: [
      {
        num: "01",
        title: "Machine Learning Engineer",
        desc: "Build and improve machine learning models using real-world messy domain data.",
      },
      {
        num: "02",
        title: "Scientific ML / Research Engineer",
        desc: "Build models that respect scientific principles (PINNs, molecular modeling, biochemistry).",
      },
      {
        num: "03",
        title: "Predictive Modeler",
        desc: "Create models that predict outcomes, weather patterns, crop yields, and support decisions.",
      },
      {
        num: "04",
        title: "Data Scientist",
        desc: "Turn complex scientific and business data into insights that drive real decisions.",
      },
    ],
    maxBuildSteps: 4,
    notes: "B.Sc students have the quantitative foundation. Combine your science background with Python, data modeling, and machine learning to become a Data Scientist or Scientific ML Engineer.",
  },

  // =========================================================================
  // SLIDE 26 — RISING ROLES FOR B.COM / BBA STUDENTS
  // =========================================================================
  {
    id: "sunni_slide_26",
    type: "STREAM_ROLES",
    badge: "COMMERCE & BBA SPECIALIZATION",
    stream: "B.COM / BBA",
    title: "Rising Roles for BCom / BBA Students",
    subtitle: "Leading the AI transformation across corporate finance, auditing, and business strategy.",
    roles: [
      {
        num: "01",
        title: "AI Finance Analyst",
        desc: "Use AI tools for financial analysis, algorithmic budgeting, forecasting and reporting.",
      },
      {
        num: "02",
        title: "AI-enabled Business Analyst",
        desc: "Bridge business domain knowledge with AI tools to improve enterprise decision-making.",
      },
      {
        num: "03",
        title: "Growth Analyst",
        desc: "Analyse customer acquisition data, unit economics, and support strategy using AI tools.",
      },
      {
        num: "04",
        title: "Generative AI Business Analyst",
        desc: "Apply GenAI for market analysis, pricing optimization and business process improvement.",
      },
    ],
    maxBuildSteps: 4,
    notes: "B.Com and BBA students: Companies don't need manual data entry clerks. They need AI Finance Analysts and Business Analysts who understand the numbers AND know how to deploy AI agents to streamline business operations.",
  },

  // =========================================================================
  // SLIDE 27 — THE REAL STUDENT FUNNEL
  // =========================================================================
  {
    id: "sunni_slide_27",
    type: "DROPOUT_FUNNEL",
    badge: "THE CANDIDATE FUNNEL",
    title: "The Real Student Funnel",
    subtitle: "Where 98% of students get filtered out — and how you can secure a final round offer.",
    stages: [
      {
        stage: "Students Start Learning Skills",
        remaining: "100",
        drop: "Baseline",
        cause: "College students memorizing textbook theory and basic syntax.",
      },
      {
        stage: "Build Industry-Grade Projects",
        remaining: "25",
        drop: "75 Drop Out",
        cause: "75 never build industry-grade projects; stuck in tutorial loops and toy clones.",
      },
      {
        stage: "Strong Resume Screening",
        remaining: "10",
        drop: "15 Drop Out",
        cause: "15 get rejected due to weak, generic resumes without verifiable proof.",
      },
      {
        stage: "Final Interview Rounds",
        remaining: "2–3",
        drop: "7–8 Drop Out",
        cause: "Panic when asked to defend architecture, trade-offs, and failure modes on a whiteboard.",
      },
      {
        stage: "Final High-Paying Offers",
        remaining: "1–2",
        drop: "Hired",
        cause: "Candidates who prove verified execution, humility, and system ownership.",
      },
    ],
    punchline: "Fix the leaks at each step of the funnel to guarantee an offer.",
    maxBuildSteps: 4,
    notes: "Walk through the numbers: 100 students start. 75 never build real systems. 15 get rejected for generic resumes. Only 2-3 reach the final room. If you build real systems and prove your work, you win by default.",
  },

  // =========================================================================
  // SLIDE 28 — THE 5 PRACTICAL STEPS TO WIN
  // =========================================================================
  {
    id: "sunni_slide_28",
    type: "DEDICATED_ROADMAP",
    badge: "ACTION PLAYBOOK",
    title: "The 5 Practical Steps to Win",
    subtitle: "The unified roadmap to transition from student learner to hired professional.",
    foundation: [
      "01. Industry-grade Skills (CS Core, Databases, Docker, APIs, Local LLMs)",
      "02. Industry-grade Projects (Real problem, schema validation, tests, live cloud URL)",
      "03. Strong Resume (Google X-Y-Z formula with clickable links in the top 3 inches)",
    ],
    industrySkills: [
      "04. Smart Job Hunting (High-signal proof-of-work outreach bypassing cold job boards)",
      "05. Interview Preparation (Whiteboard architectural defense, trade-offs, and failure modes)",
    ],
    mindset: "Master all 5 steps as an interconnected system. If any step is broken, your career funnel leaks.",
    maxBuildSteps: 3,
    notes: "Here are your five non-negotiable steps: 1. Skills → 2. Projects → 3. Resume → 4. Smart Outreach → 5. Interview Defense. Master all five, and no hiring freeze can stop you.",
  },

  // =========================================================================
  // SLIDE 29 — INDUSTRIAL TRAINING PROGRAM: YOUR GUIDED PATH
  // =========================================================================
  {
    id: "sunni_slide_29",
    type: "PROGRAM_OVERVIEW",
    badge: "YOUR GUIDED PATH",
    title: "Industrial Training Program",
    subtitle: "3-MONTH INTENSIVE TRACK · ATAL BIHARI VAJPAYEE GOVT. DEGREE COLLEGE SUNNI",
    pillars: [
      "3-Month Intensive Training — Focused on real industry skills and containerized production projects",
      "Unisole Talent Pool — Get selected into the vetted talent pool after successful training",
      "Internship Opportunity — Direct chance to work with partner tech startups and companies",
      "Joint Certification — Nationally recognized accreditation: NIT Hamirpur • Unisole • IAPT",
      "Dedicated Mentorship — Weekly labs guided by engineers from NIT Hamirpur, IIT Delhi & BlackRock",
    ],
    maxBuildSteps: 2,
    notes: "This is our commitment to ABV GDC Sunni. 3 months of hands-on training, 2 containerized capstone systems, joint certification with NIT Hamirpur and IAPT, and direct induction into the UNISOLE Talent Pool for internships.",
  },

  // =========================================================================
  // SLIDE 30 — CLOSING: TAKE RESPONSIBILITY
  // =========================================================================
  {
    id: "sunni_slide_30",
    type: "ENROLLMENT_CTA",
    badge: "CLOSING MESSAGE & ENROLLMENT",
    title: "In the Age of AI, Who Wins?",
    subtitle: "The students who win will not be the ones who know the most. They will be the ones who can prove they can solve real problems and take responsibility.",
    actions: [
      "Archive toy tutorial clones from your GitHub profile",
      "Pick one real domain problem in Himachal Pradesh and build a containerized system",
      "Deploy it to a live cloud URL with automated tests and an architectural README",
      "Register for the UNISOLE Industrial Training Program today",
    ],
    qrPrompt: "Scan QR Code to Register for the ABV GDC Sunni Program",
    qrUrl: "https://unisole.org/programs/sunni",
    maxBuildSteps: 2,
    notes: "In the age of AI, the students who win will not be the ones who know the most. They will be the ones who can prove they can solve real problems and take responsibility. Scan the QR code, join the program, and let us build your career together.",
  },
];
