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
  // SLIDE 4 — YOUR CAREER WORLD HAS CHANGED & OPENING QUESTION
  // =========================================================================
  {
    id: "sunni_slide_4",
    type: "BIG_QUESTION",
    badge: "PART 1: AI HISTORY & FOUNDATION",
    title: "YOUR CAREER WORLD HAS CHANGED",
    subtitle: "First understand AI → Then decide your path · What do you think… when did AI actually start?",
    maxBuildSteps: 2,
    questionPrompt: "What do you think… when did AI actually start?",
    speakerHook: "First understand AI → Then decide your path. Was it ChatGPT in 2022? Or does the story go 80 years deeper?",
    poll: {
      question: "When do you think AI started?",
      options: ["2022 (ChatGPT Era)", "1997 (Deep Blue / Chess)", "1956 (Dartmouth Conference)", "1943 (Neuron as a Switch)"],
      timeLimit: 20,
    },
    notes: "Before you decide whether to prepare for an exam, do an MBA, or learn coding, you must first understand the fundamental technology that is rewriting every white-collar profession on Earth. Ask: 'When did AI start? Was it ChatGPT in 2022?' Let's look back to where it all began.",
  },

  // =========================================================================
  // SLIDE 5 — THE BEGINNING (1943): NEURON AS A SWITCH
  // =========================================================================
  {
    id: "sunni_slide_5",
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
    poll: {
      question: "Can ON/OFF switches ever become as intelligent as humans?",
      options: ["YES — with enough scale & connections", "NO — humans have unique consciousness", "Maybe — for specific narrow tasks", "Not sure yet"],
      timeLimit: 20,
    },
    maxBuildSteps: 3,
    notes: "80 years ago, McCulloch and Pitts realized our brains are networks of simple switches. Connect enough switches properly, and you can compute anything.",
  },

  // =========================================================================
  // SLIDE 6 — WHAT MAKES A MACHINE INTELLIGENT?
  // =========================================================================
  {
    id: "sunni_slide_6",
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
    poll: {
      question: "What is hardest for AI even today?",
      options: ["Common Sense & Real Reasoning", "Complex Mathematics", "Memorizing Massive Datasets", "Generating Fast Code"],
      timeLimit: 20,
    },
    maxBuildSteps: 3,
    notes: "These are the four questions AI researchers chased for 70 years: Can it learn? Can it reason? Can it understand language? Can it improve over time? Today, models check all four boxes.",
  },

  // =========================================================================
  // SLIDE 7 — THE TURING TEST (1950)
  // =========================================================================
  {
    id: "sunni_slide_7",
    type: "BIG_QUESTION",
    badge: "1950: THE BENCHMARK",
    title: "The Turing Test (1950)",
    subtitle: "Alan Turing asked a simple question that defined the field of machine intelligence.",
    maxBuildSteps: 2,
    questionPrompt: "Can machines think? Or should we ask: Can machines act indistinguishably from humans?",
    speakerHook: "If a human cannot tell whether they are conversing with a human or a machine, the machine passes.",
    poll: {
      question: "Have you ever felt ChatGPT is almost human?",
      options: ["Yes, frequently!", "Sometimes, but catches hallucinations", "No, feels like advanced search", "Haven't used it enough"],
      timeLimit: 20,
    },
    notes: "In 1950, Alan Turing said: don't debate whether machines 'think'. If a machine converses with a human and they cannot tell it's a machine, it behaves intelligently.",
  },

  // =========================================================================
  // SLIDE 8 — 1956: THE NAME IS BORN
  // =========================================================================
  {
    id: "sunni_slide_8",
    type: "THREE_CARDS",
    badge: "1956: THE BIRTH OF 'AI'",
    title: "1956 — The Name is Born: Dartmouth Conference",
    subtitle: "John McCarthy coined the term 'Artificial Intelligence' and launched an official academic field.",
    cards: [
      {
        num: "01",
        title: "The Dartmouth Workshop",
        items: [
          "Organized in summer 1956 at Dartmouth College",
          "Gathered top mathematicians, engineers, and psychologists",
          "Formally separated AI from standard computer science",
        ],
      },
      {
        num: "02",
        title: "John McCarthy",
        items: [
          "Dartmouth professor and brilliant mathematician",
          "Coined the term 'Artificial Intelligence' in the proposal",
          "Later invented the Lisp programming language (1958)",
        ],
      },
      {
        num: "03",
        title: "The Core Premise",
        items: [
          "Every aspect of learning can in principle be simulated",
          "Expected machines to match human reasoning within decades",
          "Set the research agenda for the entire modern computing era",
        ],
      },
    ],
    punchline: "What began as a summer workshop 70 years ago now drives global economies.",
    maxBuildSteps: 3,
    notes: "John McCarthy coined the term in 1956. The dream: any aspect of learning could be simulated. It took decades of compute power to fulfill this vision.",
  },

  // =========================================================================
  // SLIDE 9 — AI WINTER → THE COMEBACK
  // =========================================================================
  {
    id: "sunni_slide_9",
    type: "TIMELINE",
    badge: "THE HISTORICAL CYCLES",
    title: "AI Winter → The Comeback",
    subtitle: "The major boom-and-bust cycles that forged modern AI.",
    timeline: [
      {
        period: "1970s–80s",
        event: "AI Winter",
        desc: "High expectations outpaced compute. Symbolic systems failed real-world tests. Global funding froze.",
        color: "#F43F5E",
      },
      {
        period: "1997",
        event: "Deep Blue",
        desc: "IBM's Deep Blue defeated World Chess Champion Garry Kasparov calculating 200M positions/sec.",
        color: "#06B6D4",
      },
      {
        period: "2010s",
        event: "Deep Learning",
        desc: "Internet generated massive datasets; GPUs provided parallel matrix compute. Neural nets triumphed.",
        color: "#6366F1",
      },
      {
        period: "2022+",
        event: "Generative AI",
        desc: "Transformers and Large Language Models (ChatGPT, Claude, Gemini). Reasoning and code synthesis at scale.",
        color: "#10B981",
      },
    ],
    maxBuildSteps: 4,
    notes: "AI went through brutal winters when early hype failed. But in 1997 Deep Blue beat Kasparov, in 2012 Deep Learning took off, and in 2022 ChatGPT exploded into mainstream use.",
  },

  // =========================================================================
  // SLIDE 10 — SUPERHUMAN AI BREAKTHROUGHS
  // =========================================================================
  {
    id: "sunni_slide_10",
    type: "THREE_CARDS",
    badge: "EXPONENTIAL CAPABILITY",
    title: "Beyond Text: Superhuman AI Breakthroughs",
    subtitle: "AI is predicting molecular biology with 83%+ accuracy and reinventing mathematics for itself.",
    cards: [
      {
        num: "01",
        title: "AlphaFold (83%+ Accuracy)",
        items: [
          "Solved a 50-year grand challenge in molecular biology",
          "Predicted 3D structures for 200,000,000+ proteins with >83%-90% GDT score atomic accuracy",
          "Completed what would take 1,000,000+ human lab years; 2024 Nobel Prize in Chemistry",
        ],
      },
      {
        num: "02",
        title: "Reinventing Mathematics",
        items: [
          "DeepMind FunSearch paired LLMs with automated evaluators to find new combinatorial solutions",
          "Discovered faster matrix algorithms missed for 50 years",
          "AlphaGeometry solved IMO Olympiad geometry at silver-medal level without human hints",
        ],
      },
      {
        num: "03",
        title: "The Reality for Students",
        items: [
          "AI is no longer simple autocomplete; it creates verifiable scientific proofs",
          "Textbook calculation speed is completely commoditized",
          "If you only do what AI does in 5 seconds, your role is eliminated",
        ],
      },
    ],
    punchline: "You cannot compete with AI on memory or calculation. You must compete on direction, judgment, and validation.",
    maxBuildSteps: 3,
    notes: "AI isn't just writing essays. AlphaFold predicted 200 million protein structures with 83%+ atomic accuracy. FunSearch and AlphaGeometry reinvented mathematics for themselves. Memorizing formulas will never give you a competitive edge again.",
  },

  // =========================================================================
  // SLIDE 11 — IF AI CAN DO ALL THE TASKS YOU CAN PERFORM…
  // =========================================================================
  {
    id: "sunni_slide_11",
    type: "THREE_CARDS",
    badge: "THE AUTOMATION REALITY",
    title: "If AI Can Do All the Tasks You Can Perform…",
    subtitle: "When algorithms execute your entire college syllabus faster, cheaper, and without errors.",
    cards: [
      {
        num: "01",
        title: "Tech & Coding Tasks",
        items: [
          "Writes complete React apps, Python scripts & backend APIs in 5 seconds",
          "Generates responsive UI components, detects syntax errors & fixes bugs",
          "Converts design mockups directly into working fullstack applications",
        ],
      },
      {
        num: "02",
        title: "Science & Research Tasks",
        items: [
          "Summarizes 50 academic research papers & extracts findings in 2 minutes",
          "Solves multi-variable differential equations & complex matrix math",
          "Predicts 3D molecular protein structures and biological interactions",
        ],
      },
      {
        num: "03",
        title: "Commerce & Business Tasks",
        items: [
          "Formats financial balance sheets, balances ledgers & audits vouchers",
          "Generates executive business proposals, SWOT analyses & pitch decks",
          "Calculates multi-state tax liabilities and automates invoicing pipelines",
        ],
      },
    ],
    punchline: "If AI can execute every routine task taught in college in 5 seconds… where does that leave you?",
    maxBuildSteps: 3,
    notes: "Pause and let this sink in: If an AI model on a smartphone can do your coding, solve your science equations, and format your commerce spreadsheets in 5 seconds... what is your value?",
  },

  // =========================================================================
  // SLIDE 12 — THE BIG QUESTION (HINDI HOOK)
  // =========================================================================
  {
    id: "sunni_slide_12",
    type: "BIG_QUESTION",
    badge: "THE CRITICAL QUESTION",
    title: "तो हम क्या करें?",
    subtitle: "If AI executes every routine task in seconds — what is your real strategy to survive and thrive?",
    maxBuildSteps: 1,
    questionPrompt: "तो हम क्या करें?",
    speakerHook: "अगर AI आपके सारे काम चुटकियों में कर सकता है... तो हम क्या करें? How do you make yourself indispensable in the AI job market?",
    poll: {
      question: "How many of you feel scared about future because of AI?",
      options: ["Very scared about job security", "A little worried", "Excited & optimistic", "Haven't thought about it yet"],
      timeLimit: 20,
    },
    notes: "Look straight at the students: 'तो हम क्या करें? If machines can code, write, and calculate... what should you do today so you don't get replaced?'",
  },

  // =========================================================================
  // SLIDE 13 — PARENTS' WORLD VS YOUR WORLD
  // =========================================================================
  {
    id: "sunni_slide_13",
    type: "COMPARISON",
    badge: "THE RECRUITMENT RESET",
    title: "Your Parents' World vs. Your World",
    subtitle: "The mass recruitment model that sustained Indian graduates for 20 years has permanently reset.",
    columns: [
      {
        label: "THEN (Parents & Professors)",
        color: "text-zinc-400",
        items: [
          "Private sector was small; Government jobs were the primary path",
          "One degree could lock a 30-year secure career",
          "Skills stayed useful for 15–20 years",
          "Learning mostly ended upon college graduation",
          "Mass IT recruited 6,00,000+ freshers per year for routine typing & testing",
        ],
      },
      {
        label: "NOW (Your Generation)",
        color: "text-rose-400",
        items: [
          "1.1 Crore students graduate every year across India",
          "Private sector fresher hiring collapsed from 6,00,000 to ~2,50,000 (~60% crash)",
          "Skills expire in 3–5 years without active upskilling",
          "AI executes routine boilerplate and testing in 5 seconds",
          "Proof of real skill & live projects matter 10x more than degree marksheets",
        ],
      },
    ],
    poll: {
      question: "Do your parents still think “degree = sorted life”?",
      options: ["Yes, 100% (Degree = Life Sorted)", "Somewhat, but noticing the shift", "No, they know skills matter now", "Only pushing for Govt exams"],
      timeLimit: 20,
    },
    maxBuildSteps: 2,
    notes: "For 20 years, mass IT hired 6 lakh freshers annually. Today, that intake has dropped to 2.5 lakhs because AI does routine entry-level coding and testing. 1.1 crore graduates compete for shrinking seats.",
  },

  // =========================================================================
  // SLIDE 14 — THE HARD NUMBER (1.1 CRORE GRADUATES)
  // =========================================================================
  {
    id: "sunni_slide_14",
    type: "METRIC_CARD",
    badge: "THE HARD NUMBER",
    title: "1.1 Crore Annual Graduates in India",
    subtitle: "Your competition is no longer just your college in Sunni — it is every ambitious student nationwide.",
    metrics: [
      {
        val: "1.1 Crore",
        label: "ANNUAL GRADUATES IN INDIA",
        sub: "Graduating across all university streams nationwide",
        color: "#F59E0B",
      },
      {
        val: "60%+ Drop",
        label: "IN MASS RECRUITMENT",
        sub: "Shrinking routine fresher seats in private IT & business",
        color: "#F43F5E",
      },
      {
        val: "Top 2%",
        label: "SELECTION REALITY",
        sub: "Candidates with verifiable proof of work and live systems",
        color: "#10B981",
      },
    ],
    punchline: "Your competition is nationwide. The only signal that breaks through the noise is verified, production-grade proof of work.",
    poll: {
      question: "What’s your first feeling when you hear 1.1 Crore?",
      options: ["Severe competition anxiety", "Urgency to stand out with skills", "Overwhelmed / Demotivated", "Confident I can beat the average"],
      timeLimit: 20,
    },
    maxBuildSteps: 3,
    notes: "1.1 Crore graduates every year. The competition is not just your classmate in Sunni—it is every hungry student in Bangalore, Pune, and Delhi. A plain marksheet won't save you.",
  },

  // =========================================================================
  // SLIDE 15 — YOUR ENVIRONMENT IS CHANGING FASTER THAN EVER
  // =========================================================================
  {
    id: "sunni_slide_15",
    type: "THREE_CARDS",
    badge: "THE SHIFTING ENVIRONMENT",
    title: "Your Environment is Changing Faster Than Ever",
    subtitle: "What 'Environment' Means: How you learn, what you learn, what jobs exist, and how to prepare.",
    cards: [
      {
        num: "01",
        title: "How & What You Learn",
        items: [
          "How You Learn: Stop spending months on basic syntax. Learn at 5x speed with AI as a 24/7 personal tutor.",
          "What You Learn: Textbook memorization is free. Focus on mental models, first principles, and synthesis.",
        ],
      },
      {
        num: "02",
        title: "What Jobs Exist Today",
        items: [
          "Routine entry-level clerical and repetitive tasks are shrinking across tech, science, and commerce.",
          "High-leverage new roles belong to students who can direct, orchestrate, and validate AI systems.",
        ],
      },
      {
        num: "03",
        title: "How to Prepare for Them",
        items: [
          "Your degree opens the door — but verified proof of real skill and live projects decides who gets hired.",
          "Move beyond textbook syllabus: build public GitHub proofs, live tools, and verifiable portfolios.",
        ],
      },
    ],
    punchline: "Tell them: Shift from memorizing facts to directing systems, validating outcomes, and proving real capability.",
    maxBuildSteps: 3,
    notes: "Tell the students: When we say 'your environment is changing faster than ever', what does environment mean? 1. How you learn (AI 24/7 supercomputer tutor), 2. What you learn (mental models over rote memory), 3. What jobs exist (routine roles disappearing, orchestration roles rising), and 4. How to prepare (degree opens door, verified proof of skill wins the job).",
  },

  // =========================================================================
  // SLIDE 16 — WHAT YOU SHOULD WORRY ABOUT (THE DEATH OF AVERAGE)
  // =========================================================================
  {
    id: "sunni_slide_16",
    type: "COMPARISON",
    badge: "THE MINDSET SHIFT",
    title: "What You Should Worry About (The Death of Average)",
    subtitle: "The modern market no longer rewards average effort or generic degree credentials.",
    columns: [
      {
        label: "What You Should NOT Worry About",
        color: "text-indigo-400",
        items: [
          "What AI can do — technology will continue advancing exponentially",
          "Trillions in global compute investment are driving models outside your control",
          "Fighting AI or hoping it slows down is a guaranteed losing path",
          "Routine clerical and repetitive syntax generation will vanish permanently",
          "These macroeconomic forces are completely outside your personal control",
        ],
      },
      {
        label: "What You MUST Worry About",
        color: "text-rose-400",
        items: [
          "Staying AVERAGE in a world that no longer pays for average output",
          "Graduating with only textbook exam marks and zero proof-of-work",
          "Having an empty GitHub, zero deployed URLs, and generic resumes",
          "Being unable to answer: 'If AI does this in 10 seconds, why hire you?'",
          "Failing to master the high-leverage skills that AI cannot automate",
        ],
      },
    ],
    poll: {
      question: "How much do you worry about becoming “just average”? (1–5)",
      options: ["1 — Not worried at all", "2 — Slightly worried", "3 — Moderately worried", "4 — Quite worried", "5 — Extremely worried"],
      timeLimit: 20,
    },
    maxBuildSteps: 2,
    notes: "Don't worry about what AI can do. Worry about staying average. The market for average is dead.",
  },

  // =========================================================================
  // SLIDE 17 — IF AI DOES THE DRAFTING… WHAT DOES INDUSTRY ACTUALLY DO?
  // =========================================================================
  {
    id: "sunni_slide_17",
    type: "STEP_CARDS",
    badge: "INDUSTRY REALITY",
    title: "If AI Does the Drafting… What Does Industry Actually Do?",
    subtitle: "Why companies still hire humans: The 6 sequential phases every production project requires.",
    steps: [
      {
        num: "01",
        title: "Market & User Research",
        desc: "Understand pain points: talking to 50 users, reading reviews, auditing competition",
      },
      {
        num: "02",
        title: "Product Specification",
        desc: "Decide exact features: writing clear functional requirements, constraints, and success metrics",
      },
      {
        num: "03",
        title: "Design & Architecture",
        desc: "How it looks & works: system diagrams, database schemas, wireframes, and API contracts",
      },
      {
        num: "04",
        title: "Implementation",
        desc: "Actually build it: writing production backend/frontend code, data pipelines, and integrations",
      },
      {
        num: "05",
        title: "Testing & Quality",
        desc: "Check if it works: automated unit tests, edge-case validation, security audits, and latency tests",
      },
      {
        num: "06",
        title: "Launch & Monitoring",
        desc: "Release & improve: deploying to cloud, watching uptime logs, user feedback, and metric telemetry",
      },
    ],
    poll: {
      question: "Which stage is AI already doing best?",
      options: ["First Drafts & Boilerplate Code", "Routine Testing & QA", "Market & User Research Summaries", "System Architecture & Problem Definition"],
      timeLimit: 20,
    },
    maxBuildSteps: 3,
    notes: "If AI can draft code, summarize reports, and run tests... why pay a salary to a fresh graduate? Because writing the draft is only 1 of 6 phases. Understanding real user needs, designing the architecture, and verifying safety is what companies actually pay for.",
  },

  // =========================================================================
  // SLIDE 18 — FROM THIS CYCLE… WHAT IS BECOMING CHEAP? (ALL STREAMS)
  // =========================================================================
  {
    id: "sunni_slide_18",
    type: "THREE_CARDS",
    badge: "COMMODITIZED TASKS ACROSS STREAMS",
    title: "From This Cycle… What is Becoming CHEAP?",
    subtitle: "Across every degree stream, repetitive execution and first drafts are now near-zero cost.",
    cards: [
      {
        num: "TECH",
        title: "Tech / BCA: Boilerplate & Syntax",
        items: [
          "Writing routine boilerplate code, basic CSS styling, and standard CRUD scripts",
          "AI writes working first-draft functions and script routines in 5 seconds",
          "Generating repetitive test suites and translating code between languages",
          "Building toy tutorial clones (calculators, simple clones) with no backend depth",
        ],
      },
      {
        num: "SCIENCE",
        title: "Science / B.Sc: Paper Reading & Formulas",
        items: [
          "Reading 50 research papers: AI parses and summarizes key findings in 2 minutes",
          "Routine textbook formula lookups, standard calculus, and manual data graphing",
          "Basic factual literature reviews and memorizing experimental constants",
          "Elementary statistical tabulations and standard laboratory math calculations",
        ],
      },
      {
        num: "COMMERCE",
        title: "Commerce / B.Com: Spreadsheets & Data Entry",
        items: [
          "Manual Excel data entry, tabular ledger formatting, and journal vouchers",
          "Routine tax rate lookups, basic balance sheet balancing, and standard invoicing",
          "Drafting generic business emails, basic meeting minutes, and standard reports",
          "Repetitive clerical bookkeeping that follows predictable static rules",
        ],
      },
    ],
    punchline: "Universal Rule: If your whole job is doing what a prompt does in 10 seconds, that role will disappear.",
    maxBuildSteps: 3,
    notes: "Tell all students: Whether you are in BCA, B.Sc, or B.Com, basic execution is cheap. For tech students: syntax and boilerplate code. For science students: reading 50 research papers and routine formula lookups. For commerce students: manual spreadsheet formatting, basic ledgers, and clerical reports. AI does all of this in seconds.",
  },

  // =========================================================================
  // SLIDE 19 — FROM THIS CYCLE… WHAT IS BECOMING VALUABLE? (ALL STREAMS)
  // =========================================================================
  {
    id: "sunni_slide_19",
    type: "THREE_CARDS",
    badge: "PREMIUM CAPABILITIES ACROSS STREAMS",
    title: "From This Cycle… What is Becoming VALUABLE?",
    subtitle: "Where human judgment, domain depth, critical verification, and ownership command premium pay.",
    cards: [
      {
        num: "TECH",
        title: "Tech / BCA: Architecture & Verification",
        items: [
          "Designing resilient system architecture, database schemas, and API contracts",
          "Catching subtle AI hallucinations, security loopholes, and performance bottlenecks",
          "Integrating AI agents, vector databases, and real-time streaming backends",
          "Taking end-to-end ownership: deploying to cloud and maintaining 99.9% uptime",
        ],
      },
      {
        num: "SCIENCE",
        title: "Science / B.Sc: Scientific Rigor & Validation",
        items: [
          "Scientific domain modeling: knowing when AI outputs violate physical or biological laws",
          "Rigorous hypothesis formulation: designing real laboratory tests and field trials",
          "Physics-informed ML: applying computational models to Himachal climate & agriculture",
          "Critical evaluation: deciding which research methodologies are valid vs flawed",
        ],
      },
      {
        num: "COMMERCE",
        title: "Commerce / B.Com: Business Judgment & Strategy",
        items: [
          "Strategic decision-making: prioritizing unit economics, ROI, and what NOT to build",
          "Financial anomaly auditing: spotting hidden balance-sheet risks and fraud AI misses",
          "Executive communication, client negotiations, and human stakeholder trust",
          "Deploying AI agents to automate business operations and drive corporate growth",
        ],
      },
    ],
    punchline: "Raw output is cheap. Human judgment, scientific validation, and business ownership command the highest salaries.",
    poll: {
      question: "Which will be most valuable for your career?",
      options: ["System Architecture & Edge-Case Verification (Tech)", "Scientific Rigor & Validation of AI Models (Science)", "Business Judgment & Financial Anomaly Auditing (Commerce)", "End-to-End Ownership & Communication"],
      timeLimit: 20,
    },
    maxBuildSteps: 3,
    notes: "Now look at what becomes valuable: For tech students, it is system architecture, verifying AI edge-cases, and production ownership. For science students, it is scientific rigor, hypothesis testing, and validating AI against real physical laws. For commerce students, it is business judgment, financial anomaly auditing, unit economics, and human negotiations.",
  },

  // =========================================================================
  // SLIDE 20 — SIMPLE SUMMARY: THE UNIVERSAL VALUE SHIFT (ALL STREAMS)
  // =========================================================================
  {
    id: "sunni_slide_20",
    type: "COMPARISON",
    badge: "THE VALUE MATRIX FOR ALL STREAMS",
    title: "Simple Summary: The Great Shift",
    subtitle: "A unified comparison of commoditized work vs. high-value skills across every discipline.",
    columns: [
      {
        label: "BECOMING CHEAP (Commoditized across Streams)",
        color: "text-zinc-400",
        items: [
          "Tech: Boilerplate code, syntax lookup, routine debugging, tutorial clones",
          "Science: Reading 50 research papers, standard formula lookup, basic calculations",
          "Commerce: Manual spreadsheet formatting, basic ledger entries, generic reports",
          "General: Rote memorization of textbook theory, definitions, and exam answers",
          "Rule: Any repetitive task that follows predictable rules without human judgment",
        ],
      },
      {
        label: "BECOMING VALUABLE (Premium across Streams)",
        color: "text-emerald-400",
        items: [
          "Tech: System design, edge-case verification, RAG/agent orchestration, live cloud deployment",
          "Science: Scientific domain rigor, hypothesis testing, real-world data validation, Physics-ML",
          "Commerce: Business judgment, financial anomaly auditing, unit economics, executive strategy",
          "General: Problem formulation, contextual observation, and end-to-end accountability",
          "Rule: The ability to direct AI tools, validate correctness, and take final responsibility",
        ],
      },
    ],
    maxBuildSteps: 2,
    notes: "Shift your identity: Tech students become System Architects. Science students become Scientific Validators. Commerce students become Strategic Decision Makers. Move from the left column to the right column.",
  },

  // =========================================================================
  // SLIDE 21 — GETTING A JOB IS NO LONGER SIMPLE
  // =========================================================================
  {
    id: "sunni_slide_21",
    type: "COMPARISON",
    badge: "THE HIRING RESET",
    title: "Getting a Job is No Longer Simple",
    subtitle: "The old linear degree path is broken — hiring is now a rigorous 5-layer proof process.",
    columns: [
      {
        label: "EARLIER: Linear Degree Path",
        color: "text-zinc-400",
        items: [
          "Education Level = Job",
          "Complete college degree → Attend mass campus drive → Receive offer",
          "Companies hired 600,000 freshers to train them on the job for 6 months",
          "College brand and marksheet were the primary screening filter",
          "Formulaic resumes with hobbies and textbook subjects worked",
        ],
      },
      {
        label: "NOW: The 5-Layer Proof Process",
        color: "text-indigo-400",
        items: [
          "1. Industry-Grade Skills (Beyond academic textbook syllabus)",
          "2. Production Projects (Live deployed URLs & public GitHub)",
          "3. High-Signal Resume (Quantified metrics & proof-of-work)",
          "4. Smart Job Hunting (Targeted outreach & practitioner networks)",
          "5. Interview Performance (Whiteboard defense without AI assistance)",
        ],
      },
    ],
    maxBuildSteps: 2,
    notes: "Earlier, Degree equaled Job. Today, you must clear 5 distinct layers of proof. Miss any one layer, and you get filtered out.",
  },

  // =========================================================================
  // SLIDE 22 — WHAT BECOMES VALUABLE IN YOUR STREAM
  // =========================================================================
  {
    id: "sunni_slide_22",
    type: "THREE_CARDS",
    badge: "STREAM VALUE MAPPING",
    title: "What Becomes More Valuable in Your Stream",
    subtitle: "Tailored high-leverage value vectors for BCA, B.Sc, and B.Com / BBA students.",
    cards: [
      {
        num: "BCA",
        title: "BCA / Tech",
        items: [
          "System Design & Architecture",
          "Building End-to-End AI Applications",
          "Reliability, Schema Validation & Ownership",
          "Vector databases, RAG & agentic loops",
          "PostgreSQL, Docker & CI/CD deployment",
        ],
      },
      {
        num: "BSC",
        title: "B.Sc / Science & Math",
        items: [
          "Scientific Domain Rigor & Modeling",
          "Scientific Validation of AI Outputs",
          "Physics-Informed ML & Simulations",
          "Statistical hypothesis testing & regression",
          "Bioinformatics & agricultural analytics",
        ],
      },
      {
        num: "BCOM",
        title: "B.Com / BBA / Commerce",
        items: [
          "Business Judgment & Prioritization",
          "Applying AI to Real Strategic Decisions",
          "Automating Auditing & Financial Anomaly Detection",
          "Unit economics, CAC/LTV & growth analytics",
          "AI-driven operations & process reengineering",
        ],
      },
    ],
    punchline: "Every degree stream has high-value AI roles — but only for students who master practical execution.",
    poll: {
      question: "Which role feels closest to what you want?",
      options: ["AI Full-Stack / App Developer (BCA)", "Data & Computational Modeling (B.Sc)", "Tech Revenue & Growth Analyst (B.Com/BBA)", "AI Workflow & Automation Specialist"],
      timeLimit: 20,
    },
    maxBuildSteps: 3,
    notes: "Whether you are in BCA, B.Sc, or B.Com, your degree gives you domain depth. Couple that depth with AI systems and you become unstoppable.",
  },

  // =========================================================================
  // SLIDE 23 — RISING ROLES FOR BCA STUDENTS
  // =========================================================================
  {
    id: "sunni_slide_23",
    type: "STREAM_ROLES",
    badge: "BCA & TECH SPECIALIZATION",
    stream: "BCA / TECH",
    title: "Rising Roles for BCA Students",
    subtitle: "High-growth specializations moving beyond routine syntax coding.",
    roles: [
      {
        num: "01",
        title: "Generative AI Engineer",
        desc: "Build applications using Large Language Models, RAG pipelines, and vector databases.",
      },
      {
        num: "02",
        title: "Agentic AI Engineer",
        desc: "Design and build autonomous AI agents that complete multi-step tasks with tool-use.",
      },
      {
        num: "03",
        title: "Full-Stack AI Engineer",
        desc: "Build complete products connecting reactive frontends to streaming AI backends.",
      },
      {
        num: "04",
        title: "AI Application Developer",
        desc: "Integrate production-ready AI capabilities into real-world software products.",
      },
    ],
    maxBuildSteps: 4,
    notes: "For BCA students: Stop building basic calculators. Aim for GenAI Engineer, Agentic AI Architect, or Full-Stack AI Developer.",
  },

  // =========================================================================
  // SLIDE 24 — RISING ROLES FOR B.SC STUDENTS
  // =========================================================================
  {
    id: "sunni_slide_24",
    type: "STREAM_ROLES",
    badge: "B.SC SCIENCE & MATH SPECIALIZATION",
    stream: "B.SC / SCIENCE",
    title: "Rising Roles for B.Sc Students",
    subtitle: "Combining scientific domain rigor with modern computational intelligence.",
    roles: [
      {
        num: "01",
        title: "Machine Learning Engineer",
        desc: "Build and improve machine learning models using real structured numerical datasets.",
      },
      {
        num: "02",
        title: "Scientific ML / Research Engineer",
        desc: "Build computational models that respect scientific principles (Physics-Informed PINNs).",
      },
      {
        num: "03",
        title: "Predictive Modeler",
        desc: "Create models that forecast outcomes for agriculture, hydrology, climate, and soil.",
      },
      {
        num: "04",
        title: "Data Scientist",
        desc: "Turn complex multi-dimensional data into insights that drive executive decisions.",
      },
    ],
    maxBuildSteps: 4,
    notes: "For B.Sc students: Your math and science foundation is invaluable for Scientific ML, predictive modeling, and data science.",
  },

  // =========================================================================
  // SLIDE 25 — RISING ROLES FOR B.COM / BBA STUDENTS
  // =========================================================================
  {
    id: "sunni_slide_25",
    type: "STREAM_ROLES",
    badge: "COMMERCE & BBA SPECIALIZATION",
    stream: "B.COM / BBA",
    title: "Rising Roles for B.Com / BBA Students",
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
  // SLIDE 26 — THE REAL STUDENT FUNNEL
  // =========================================================================
  {
    id: "sunni_slide_26",
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
    poll: {
      question: "Where do most students stop?",
      options: ["Watching YouTube tutorials", "Copying mini-projects from friends", "Passing exams without hands-on proof", "Building & deploying real apps"],
      timeLimit: 20,
    },
    maxBuildSteps: 4,
    notes: "Walk through the numbers: 100 students start. 75 never build real systems. 15 get rejected for generic resumes. Only 2-3 reach the final room. If you build real systems and prove your work, you win by default.",
  },

  // =========================================================================
  // SLIDE 27 — THE 5 PRACTICAL STEPS TO WIN
  // =========================================================================
  {
    id: "sunni_slide_27",
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
  // SLIDE 28 — INDUSTRIAL TRAINING PROGRAM: YOUR GUIDED PATH
  // =========================================================================
  {
    id: "sunni_slide_28",
    type: "PROGRAM_OVERVIEW",
    badge: "YOUR GUIDED PATH",
    title: "Industrial Training Program",
    subtitle: "3-MONTH INTENSIVE TRACK · ATAL BIHARI VAJPAYEE GOVT. DEGREE COLLEGE SUNNI",
    pillars: [
      "3-Month Intensive Training — Focused on real industry skills, containerized microservices, and production capstone projects",
      "Unisole Talent Pool — Top-performing students get inducted into the vetted talent pool for direct industry recommendations",
      "Internship Opportunity — Direct chance to work with partner tech startups and companies on live client systems",
      "Dedicated Mentorship — Weekly hands-on labs guided by engineers and researchers from NIT Hamirpur, IIT Delhi & BlackRock",
    ],
    maxBuildSteps: 2,
    notes: "This is our commitment to ABV GDC Sunni. 3 months of hands-on training, 2 containerized capstone systems, direct induction into the UNISOLE Talent Pool, and dedicated practitioner mentorship.",
  },

  // =========================================================================
  // SLIDE 29 — JOINT CERTIFICATION: NIT HAMIRPUR × IAPT × UNISOLE
  // =========================================================================
  {
    id: "sunni_slide_29",
    type: "CERTIFICATE_SHOWCASE",
    badge: "OFFICIAL ACCREDITATION",
    title: "JOINT CERTIFICATE",
    subtitle: "NIT HAMIRPUR × IAPT × UNISOLE",
    note: "Awarded upon successful completion of the industrial training & milestone projects.",
    credentials: [
      "National Institute of Technology, Hamirpur (NIT Hamirpur)",
      "Indian Association of Physics Teachers (IAPT)",
      "UNISOLE Skill AI Labs",
    ],
    highlights: [
      "Validates production-grade AI system architecture, schema integrity, and live cloud deployment",
      "Cryptographically verifiable credential recognized by hiring partner networks",
      "Awarded exclusively upon successful defense of 2 containerized milestone projects",
      "Direct fast-track into the UNISOLE Talent Pool for paid internship matching",
    ],
    maxBuildSteps: 2,
    notes: "Look at this credential. This is a joint certificate backed by NIT Hamirpur, IAPT, and UNISOLE. It is not an attendance slip. It proves to any employer in the country that you built and deployed real, verified production software.",
  },

  // =========================================================================
  // SLIDE 30 — CLOSING: TAKE RESPONSIBILITY & REGISTER
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
    poll: {
      question: "How much clearer do you feel now?",
      options: ["100% Crystal Clear & Ready to Build", "Much clearer than when I walked in", "Have some questions (Need guidance)", "Still processing everything"],
      timeLimit: 20,
    },
    maxBuildSteps: 2,
    notes: "In the age of AI, the students who win will not be the ones who know the most. They will be the ones who can prove they can solve real problems and take responsibility. Scan the QR code, join the program, and let us build your career together.",
  },
];
