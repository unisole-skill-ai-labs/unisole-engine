export const AI_TRAINING_ROADSHOW_DECK_SLIDES = [
  // =========================================================================
  // SLIDE 1 — COVER
  // =========================================================================
  {
    id: "ai_train_slide_1",
    type: "COVER",
    badge: "INDUSTRIAL TRAINING CUM INTERNSHIP PROGRAM",
    title: "Industrial Training cum Internship Program",
    subtitle: "Learn AI Today or remain Behind Tomorrow",
    org: "UNISOLE SKILL AI LABS",
    maxBuildSteps: 2,
    notes: "Welcome students! Today we are announcing the Unisole Industrial Training cum Internship Opportunity Program. The simple truth of 2026: Learn AI Today or remain Behind Tomorrow.",
  },

  // =========================================================================
  // SLIDE 2 — FOUNDER BIO (AJAY MOKTA)
  // =========================================================================
  {
    id: "ai_train_slide_2",
    type: "FOUNDER_BIO",
    badge: "LEADERSHIP & MENTORSHIP",
    title: "Ajay Mokta",
    subtitle: "CEO — Unisole Skill AI Labs",
    initials: "AM",
    credentials: [
      "CEO Unisole",
      "Mentor 10,000+ students across Himachal Pradesh",
      "Positioned Unisole 3rd in National Startup Summit",
      "Leading technical skilling transformations statewide",
    ],
    quote: "“A degree from any college in Himachal should be backed by skills that compete globally.”",
    sideSection: {
      title: "UNISOLE",
      items: ["AI Education", "Industry Skills", "Career Awareness", "Practical Projects"],
    },
    maxBuildSteps: 2,
    notes: "Ajay Mokta - CEO Unisole, mentored 10,000+ students across Himachal, positioned Unisole 3rd in National Startup Summit.",
  },

  // =========================================================================
  // SLIDE 3 — TEAM
  // =========================================================================
  {
    id: "ai_train_slide_3",
    type: "TEAM_GRID",
    badge: "CREDIBILITY",
    title: "Meet Our Team",
    subtitle: "Built by practitioners, engineers, and researchers.",
    pillars: ["AI SYSTEMS", "BACKEND ARCHITECTURE", "INDUSTRY RESEARCH", "ACADEMIC EXPOSURE"],
    members: [
      {
        initials: "GG",
        name: "Girish Gaurav Sharma",
        role: "CTO @ Unisole · 20th rank at NASA app · AIR 1 in AIEC-DAE 35 · Start-up advisor",
      },
      {
        initials: "SP",
        name: "Shabd Patel",
        role: "AI Expert @ Unisole · Software engineer at BlackRock · B.Tech, NIT Hamirpur",
      },
      {
        initials: "KK",
        name: "Kushal Kesharwani",
        role: "Industry Expert @ Unisole · IIT Patna · Engineer at Tech Mahindra",
      },
      {
        initials: "AK",
        name: "Aditya Kaushal",
        role: "Academic guide @ Unisole · M.Tech, IIT Delhi · Lead researcher",
      },
    ],
    maxBuildSteps: 2,
    notes: "Our team of practitioners from BlackRock, Tech Mahindra, NIT Hamirpur, and IIT Delhi.",
  },

  // =========================================================================
  // SLIDE 4 — आगे क्या सोचा है? (THE HOOK QUESTION)
  // =========================================================================
  {
    id: "ai_train_slide_4",
    type: "BIG_QUESTION",
    badge: "THE HOOK QUESTION",
    title: "आगे क्या सोचा है?",
    subtitle: "Think honestly — what have you planned after graduation?",
    maxBuildSteps: 1,
    questionPrompt: "Think honestly — what have you planned after graduation?",
    speakerHook: "Pause here and ask students verbally: 'Think honestly — what have you planned after graduation?'",
    notes: "This is the ONLY Hindi slide. Nothing else. Pause and ask students verbally: 'Think honestly — what have you planned after graduation?'",
  },

  // =========================================================================
  // SLIDE 5 — POLL: HOW MUCH DOES A DEGREE MATTER?
  // =========================================================================
  {
    id: "ai_train_slide_5",
    type: "POLL",
    badge: "LIVE POLL 01",
    title: "Poll: How Much Does a Degree Matter?",
    question: "How much degree matter for job?",
    options: [
      "100% — Degree is everything for a job",
      "50% — Degree opens the door, skills do the rest",
      "20–30% — Degree is just a basic eligibility filter",
      "<10% — Skills & practical proof matter almost completely",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 01: 4 options. Show live votes on screen.",
  },

  // =========================================================================
  // SLIDE 6 — YOUR CAREER ENVIRONMENT HAS CHANGED
  // =========================================================================
  {
    id: "ai_train_slide_6",
    type: "EDUCATION_SHIFT",
    badge: "ENVIRONMENT CHANGE",
    title: "Your Career Environment Has Changed",
    subtitle: "The rules that worked in the 90s no longer apply in the 2020s.",
    stat1: {
      year: "90s Environment",
      count: "49 LAKHS",
      label: "Enrolment in Higher Education · Private sector did not exist",
      ratio: "Then: Degree = Job",
    },
    stat2: {
      year: "20s Environment",
      count: "4.33 CRORE",
      label: "Enrolled in H.E. · Private sector contributes 7% of total GDP",
      ratio: "Now: Degree = Job equation is NOT relevant",
    },
    punchline: "Now: Degree = Job — this equation is not relevant anymore.",
    maxBuildSteps: 3,
    notes: "Contrast 90s vs 20s environment. In 90s: 49L enrolled, no private sector, Degree = Job. Now: 4.33Cr enrolled, 7% GDP private, Degree = Job is not relevant.",
  },

  // =========================================================================
  // SLIDE 7 — JOB LANDSCAPE
  // =========================================================================
  {
    id: "ai_train_slide_7",
    type: "COMPARISON",
    badge: "MARKET REALITY",
    title: "Job Landscape",
    subtitle: "Private Sector vs Government Sector in India",
    columns: [
      {
        label: "Job in Private Sector",
        stat: "570 Million Jobs",
        color: "text-cyan-400",
        items: [
          "Formal + informal + micro enterprises contain 570 million jobs",
          "Which is 40 times more than govt sector job",
        ],
      },
      {
        label: "Job in Govt. Sector",
        stat: "1.4 Crore Jobs",
        color: "text-amber-400",
        items: [
          "Indian govt sector hold 1.4 crore jobs",
          "1.1 crore students get pass out in one year",
          "Then paper leak, outsourcing, direct approach scope get narrow down",
        ],
      },
    ],
    punchline: "Private sector contains 40x more opportunities than the entire government sector.",
    maxBuildSteps: 3,
    notes: "Job in Private Sector: Formal + informal + micro enterprises contain 570 million jobs (40 times more than govt sector job). Job in Govt. Sector: Indian govt sector hold 1.4 crore jobs vs 1.1 crore students get pass out in one year. Then paper leak, outsourcing, direct approach scope get narrow down.",
  },

  // =========================================================================
  // SLIDE 8 — POLL: ARE PRIVATE JOBS UNSTABLE?
  // =========================================================================
  {
    id: "ai_train_slide_8",
    type: "POLL",
    badge: "LIVE POLL 02",
    title: "Poll: Are Private Jobs Unstable?",
    question: "How many of you think private jobs are not stable?",
    options: [
      "Yes — Private jobs are not stable / high risk",
      "No — Private jobs offer growth and stability through skills",
    ],
    maxBuildSteps: 1,
    notes: "Poll: How many of you think private jobs are not stable? Options: Yes / No.",
  },

  // =========================================================================
  // SLIDE 9 — PRIVATE JOBS ARE UNSTABLE??
  // =========================================================================
  {
    id: "ai_train_slide_9",
    type: "PIPELINE_FLOW",
    badge: "RETHINKING STABILITY",
    title: "Private Jobs Are Unstable??",
    subtitle: "Job switching is becoming part of the modern career",
    stagesLabel: "Career Path",
    stages: [
      "College",
      "Job",
      "1–3 Years Exp",
      "Skill Upgrade",
      "New Role / Company",
      "Leadership / Entrepreneurship",
    ],
    stats: [
      {
        label: "Market Transformation till 2030",
        value: "+78M Net Jobs",
        color: "text-emerald-400",
        desc: "Till 2030 market transformation could create 170 million jobs globally while displacing 92 million, resulting in net growth of 78 million jobs.",
      },
      {
        label: "Startup India Annual Generation",
        value: "25 Lakhs Jobs",
        color: "text-cyan-400",
        desc: "In each year Startup India registers ~2.5 lakh startups. If each startup needs 10 people, that generates 25 lakh new jobs.",
      },
    ],
    quote: "“The question is no longer simply: 'Will I get a stable job?' The better question is: 'Will I have skills that remain valuable when the job changes?'”",
    punchline: "Job switching is becoming part of the modern career. Career capital keeps you indispensable.",
    maxBuildSteps: 3,
    notes: "Career path: College -> Job -> 1-3 yrs -> Skill upgrade -> New role -> Leadership. 170M jobs created globally vs 92M displaced (+78M net). 2.5L startups = 25L jobs.",
  },

  // =========================================================================
  // SLIDE 10 — PRIVATE JOBS LAYOFFS
  // =========================================================================
  {
    id: "ai_train_slide_10",
    type: "MYTH_REALITY_PAIRS",
    badge: "DISPLACEMENT REALITY",
    title: "Private Jobs Layoffs",
    subtitle: "There will be significant job creation — but also displacement.",
    pairs: [
      {
        myth: "Layoffs Due to Overhiring",
        reality: "Companies over-recruited and are correcting headcounts in bloated legacy departments.",
      },
      {
        myth: "Layoffs Due to AI",
        reality: "AI agents automate repetitive coding and docs. Who got hired and who does not depends on one thing...",
      },
    ],
    punchline: "Who got hired and who does not depends on ONE thing...",
    maxBuildSteps: 2,
    notes: "Layoffs due to Overhiring and Layoffs due to AI. Who got hired and who does not depends on one thing...",
  },

  // =========================================================================
  // SLIDE 11 — WHAT IS THAT ONE THING?
  // =========================================================================
  {
    id: "ai_train_slide_11",
    type: "POLL",
    badge: "LIVE POLL 03",
    title: "What Is That One Thing?",
    question: "What you think what is that one thing due to which fresher get hired?",
    options: [
      "High College Marks / CGPA",
      "Reputed College Degree",
      "Industry-Grade Skills & Proof of Work",
      "Good Luck & Referrals",
    ],
    maxBuildSteps: 1,
    notes: "What is that ONE thing due to which freshers get hired? 4 options.",
  },

  // =========================================================================
  // SLIDE 12 — CAREER CAPITAL
  // =========================================================================
  {
    id: "ai_train_slide_12",
    type: "CAREER_CAPITAL_GRID",
    badge: "CORE PRINCIPLE",
    title: "Career Capital",
    subtitle: "Everything you build through education, work and activities that increases your ability to get opportunities.",
    definition: "Everything you build through your education, work and activities that increases your ability to get opportunities.",
    studentA: {
      name: "Student A",
      path: "2 years → Exam preparation → Multiple attempts → No job",
      capital: "Career capital gained: limited outside the exam ecosystem",
    },
    studentB: {
      name: "Student B",
      path: "2 years → Degree + Python + SQL + AI + Projects + Internship + Communication + Portfolio",
      capital: "Career capital gained: multiple employability options",
    },
    maxBuildSteps: 2,
    notes: "Example: Two students, same 2 years. Student A vs Student B comparison.",
  },

  // =========================================================================
  // SLIDE 13 — HOW TO MAXIMIZE CAREER CAPITAL
  // =========================================================================
  {
    id: "ai_train_slide_13",
    type: "BIG_QUESTION",
    badge: "STRATEGIC MINDSET",
    title: "How to Maximize Career Capital",
    subtitle: "“Don’t learn what you love to do, learn what industry value”",
    questionPrompt: "“Don’t learn what you love to do, learn what industry value”",
    speakerHook: "Before understanding industry demands, let's understand the industry itself.",
    maxBuildSteps: 1,
    notes: "Don't learn what you love to do, learn what industry value. Before understand the industry demands lets understand industry itself.",
  },

  // =========================================================================
  // SLIDE 14 — WHAT INDUSTRY DO (PRODUCT DEV CYCLE)
  // =========================================================================
  {
    id: "ai_train_slide_14",
    type: "PIPELINE_FLOW",
    badge: "SYSTEMS THINKING",
    title: "What Industry Do",
    subtitle: "Product Development Cycle",
    stagesLabel: "7-Stage Development Lifecycle",
    stages: [
      "Problem Discovery",
      "Define the Product",
      "Design the Solution",
      "Build Implementation",
      "Test and Validate",
      "Launch",
      "Monitor & Improve",
    ],
    punchline: "You need to discover what becomes cheap and valuable in this cycle.",
    maxBuildSteps: 3,
    notes: "Problem discovery / Market Research -> Define the product -> Design the solution -> Build implementation -> Test and validate -> Launch -> Monitor and improve. You need to discover what becomes cheap and valuable in this cycle.",
  },

  // =========================================================================
  // SLIDE 15 — WHAT PART BECOMES VERY CHEAP?
  // =========================================================================
  {
    id: "ai_train_slide_15",
    type: "BIG_QUESTION",
    badge: "AUDIENCE REFLECTION",
    title: "What Part Becomes Very Cheap?",
    subtitle: "By looking in the product cycle what you think what part become very cheap?",
    questionPrompt: "By looking in the product cycle what you think what part become very cheap?",
    maxBuildSteps: 1,
    notes: "Interactive audience reflection: By looking in the product cycle what you think what part become very cheap?",
  },

  // =========================================================================
  // SLIDE 16 — WHAT BECOMES CHEAP
  // =========================================================================
  {
    id: "ai_train_slide_16",
    type: "STEP_CARDS",
    badge: "COMMODITIZATION",
    title: "What Becomes Cheap",
    subtitle: "As execution becomes cheaper... Judgment becomes more valuable.",
    steps: [
      { num: "01", title: "Generating Code", desc: "Writing syntax, boilerplate APIs, and standard functions in seconds." },
      { num: "02", title: "Prototypes", desc: "Building interactive mockups in 10 minutes instead of 2 weeks." },
      { num: "03", title: "Content & Copy", desc: "Marketing copy, product descriptions, emails generated instantly." },
      { num: "04", title: "Documentation", desc: "API docs, readme files, and architecture explanations auto-generated." },
      { num: "05", title: "Basic Analysis", desc: "Data aggregation, SQL drafting, and routine log parsing automated." },
    ],
    punchline: "AI dramatically reduces the cost and time of research, prototyping, coding, documentation, and testing.",
    maxBuildSteps: 3,
    notes: "As execution becomes cheaper, judgment becomes more valuable. Cheap: Generating code, Prototypes, Content, Documentation, Basic analysis.",
  },

  // =========================================================================
  // SLIDE 17 — WHAT PART BECOMES VERY VALUABLE?
  // =========================================================================
  {
    id: "ai_train_slide_17",
    type: "BIG_QUESTION",
    badge: "THE FLIP SIDE",
    title: "What Part Becomes Very Valuable?",
    subtitle: "By looking in the product cycle what you think what part become very Valuable?",
    questionPrompt: "By looking in the product cycle what you think what part become very Valuable?",
    maxBuildSteps: 1,
    notes: "Interactive audience reflection: By looking in the product cycle what you think what part become very Valuable?",
  },

  // =========================================================================
  // SLIDE 18 — THE VALUE IS MOVING UPSTREAM
  // =========================================================================
  {
    id: "ai_train_slide_18",
    type: "STEP_CARDS",
    badge: "THE UPSTREAM SHIFT",
    title: "The Value Is Moving Upstream",
    subtitle: "Build is becoming cheaper. Deciding WHAT to build is becoming more valuable.",
    steps: [
      { num: "01", title: "Problem Discovery", desc: "What problem is worth solving? (HIGH VALUE)" },
      { num: "02", title: "Define the Product", desc: "What exactly should we build? For whom? (HIGH VALUE)" },
      { num: "03", title: "Design the Solution", desc: "What is the best way to solve it? (HIGH VALUE)" },
      { num: "04", title: "Build & Implement", desc: "Can we turn idea into software? (AI is making this dramatically cheaper)" },
    ],
    punchline: "Train yourself to be an Architect & Problem Solver, not just a line-by-line typist.",
    maxBuildSteps: 4,
    notes: "01 Problem Discovery (HIGH VALUE), 02 Define the Product (HIGH VALUE), 03 Design the Solution (HIGH VALUE), 04 Build & Implement (AI is making this dramatically cheaper).",
  },

  // =========================================================================
  // SLIDE 19 — LEARN WHAT IS VALUABLE (THE CATCH)
  // =========================================================================
  {
    id: "ai_train_slide_19",
    type: "BIG_QUESTION",
    badge: "THE CATCH",
    title: "Now you know the valuable part...",
    subtitle: "So, Learn What Is Valuable. But here is the catch...",
    questionPrompt: "100 → 25 → 15 → 10 → 4 (Job)\nIf 100 people start learning skills, out of 100 only 4 get a job.\nNow where do 96 people lack?",
    speakerHook: "Knowledge alone does not guarantee a career. Crossing the full funnel does.",
    maxBuildSteps: 1,
    notes: "Now you know the valuable part. So, Learn What Is Valuable. But here is catch.... 100 -> 25 -> 15 -> 10 -> 4 (Job). Out of 100, 4 get job. Now where 96 people lack?",
  },

  // =========================================================================
  // SLIDE 20 — LEARN → PROJECT → RESUME → INTERVIEW → JOB (FUNNEL)
  // =========================================================================
  {
    id: "ai_train_slide_20",
    type: "DROPOUT_FUNNEL",
    badge: "THE HIRING LEAK",
    title: "Learn → Project → Resume → Interview → Job",
    subtitle: "The 100 → 25 → 15 → 10 → 4 Funnel Drop-off",
    stages: [
      { stage: "Learn Skills", remaining: "100", drop: "Baseline", cause: "100 students start learning technical skills." },
      { stage: "Build Project", remaining: "25", drop: "75 Drop Out", cause: "75 quit before building real industry-grade projects." },
      { stage: "Craft Resume", remaining: "15", drop: "10 Drop Out", cause: "10 fail to package their proof-of-work into strong resumes." },
      { stage: "Reach Interview", remaining: "10", drop: "5 Drop Out", cause: "5 drop out due to poor job hunting and outreach." },
      { stage: "Land Job Offer", remaining: "4", drop: "6 Drop Out", cause: "Only 4 successfully clear the interview and secure the offer." },
    ],
    punchline: "Fix the leaks at each step of the funnel to guarantee an offer.",
    maxBuildSteps: 4,
    notes: "Learn -> Project -> Resume -> Interview -> Job. 100 -> 25 -> 15 -> 10 -> 4.",
  },

  // =========================================================================
  // SLIDE 21 — GO THROUGH THE FUNNEL
  // =========================================================================
  {
    id: "ai_train_slide_21",
    type: "STEP_CARDS",
    badge: "EXECUTION PLAYBOOK",
    title: "So You Have to Go Through the Funnel",
    subtitle: "The 5 mandatory steps to convert your efforts into an offer",
    steps: [
      { num: "01", title: "Learn Industry Grade Skills", desc: "Go beyond basic tutorials into modern AI stacks & system design." },
      { num: "02", title: "Make Industry Grade Project", desc: "Build real production software solving genuine user problems." },
      { num: "03", title: "Put Your Work Out", desc: "Deploy live links, GitHub repos with documentation & portfolio." },
      { num: "04", title: "How to Hunt a Job", desc: "Targeted outreach, cold emailing founders, bypassing ATS filters." },
      { num: "05", title: "Interview Mastery", desc: "Technical system design, coding rounds & confident communication." },
    ],
    punchline: "Unisole guides you step-by-step through every single stage of this funnel.",
    maxBuildSteps: 5,
    notes: "1. Learn Industry Grade skills, 2. Make Industry Grade Project, 3. How to Put your work in, 4. How to Hunt a Job, 5. Interview.",
  },

  // =========================================================================
  // SLIDE 22 — WHAT IS IN BOOM
  // =========================================================================
  {
    id: "ai_train_slide_22",
    type: "STATS",
    badge: "EXPONENTIAL DEMAND",
    title: "What Is in Boom",
    subtitle: "The 3 fastest-growing employment sectors creating massive premiums",
    stats: [
      {
        value: "+985%",
        label: "Agentic AI Surge",
        desc: "Driving a massive 985% surge in autonomous AI job postings.",
      },
      {
        value: "+60%",
        label: "Generative AI",
        desc: "India's generative AI job market is surging with a 60% increase in AI engineering postings.",
      },
      {
        value: "30%–54%",
        label: "ML in Production",
        desc: "Machine learning (ML) and artificial intelligence (AI) hiring in India has surged by over 30% to 54% year-on-year.",
      },
    ],
    punchline: "Position your career where demand is expanding at 10x speed.",
    maxBuildSteps: 3,
    notes: "Agentic AI (+985% surge), Generative AI (+60% increase), Machine Learning in Production (surged 30% to 54% YoY).",
  },

  // =========================================================================
  // SLIDE 23 — AGENTIC AI ENGINEERING
  // =========================================================================
  {
    id: "ai_train_slide_23",
    type: "BIG_QUESTION",
    badge: "PARADIGM SHIFT",
    title: "Agentic AI Engineering",
    subtitle: "“Every software company will be an agentic company in the future”",
    questionPrompt: "“Every software company will be agentic company in future”\n— Jensen Huang, CEO Nvidia",
    speakerHook: "There will be around about 1 billion agents in the market by 2028. Software is shifting from writing loops to orchestrating agents.",
    maxBuildSteps: 2,
    notes: "Jensen Huang quote: “Every software company will be agentic company in future”. There will be around about 1 billion agents in the market by 2028.",
  },

  // =========================================================================
  // SLIDE 24 — UNISOLE INDUSTRIAL TRAINING PROGRAM
  // =========================================================================
  {
    id: "ai_train_slide_24",
    type: "PROGRAM_PILLARS",
    badge: "THE SOLUTION",
    title: "Unisole Industrial Training Program",
    subtitle: "With the support of Govt. of Himachal Pradesh we are launching the industrial training cum internship opportunity program.",
    pillars: [
      {
        title: "3.5 Month Training Program",
        desc: "You will get mentorship from industry leaders who have graduated from NIT and IIT.",
      },
      {
        title: "We Will Prepare You for Job",
        desc: "Industry grade skills, Industry grade projects, Resume and portfolio building, Interview preparation.",
      },
      {
        title: "Unisole Talent Pool",
        desc: "If you perform good in training, you will be pooled in the Unisole Talent Pool and upcoming internship opportunities will be given to you.",
      },
    ],
    maxBuildSteps: 3,
    notes: "Supported by Govt. of HP. 3.5 Month Training Program (NIT/IIT mentors). Prepare for Job (skills, projects, resume, interview). Unisole Talent Pool.",
  },

  // =========================================================================
  // SLIDE 25 — SCHEDULE OF PROGRAM
  // =========================================================================
  {
    id: "ai_train_slide_25",
    type: "THREE_CARDS",
    badge: "LOGISTICS",
    title: "Schedule of Program",
    subtitle: "Designed around your college semester calendar",
    cards: [
      {
        title: "Online Live Classes",
        desc: "Classes will be held online on evenings and weekends with recorded sessions available 24/7.",
      },
      {
        title: "Starts in November",
        desc: "Your batch will start from November after your examination finishes.",
      },
      {
        title: "Campus Project Implementation",
        desc: "If we get 20+ students from your college, we will do the project and implementation part here offline on weekends.",
      },
    ],
    maxBuildSteps: 3,
    notes: "Online classes. Batch starts Nov after exams. If 20+ students from your college, offline weekend project sessions at your campus.",
  },

  // =========================================================================
  // SLIDE 26 — INDUSTRIAL CERTIFICATE
  // =========================================================================
  {
    id: "ai_train_slide_26",
    type: "CERTIFICATE_SHOWCASE",
    badge: "CREDENTIAL",
    title: "Industrial Certificate",
    subtitle: "Joint certificate will be issued by: NIT Hamirpur × IAPT × Unisole × Govt. of H.P.",
    note: "Official joint industrial certification issued upon successful project and program completion.",
    maxBuildSteps: 2,
    notes: "Joint certificate will be issued by: NIT Hamirpur, IAPT, Unisole, Govt. of H.P.",
  },

  // =========================================================================
  // SLIDE 27 — PROGRAM QR CODE (CTA)
  // =========================================================================
  {
    id: "ai_train_slide_27",
    type: "ENROLLMENT_CTA",
    badge: "ENROLLMENT",
    title: "Program QR Code",
    subtitle: "Scan the QR code to register and secure your seat in the upcoming cohort",
    actions: [
      "Scan QR Code with your smartphone",
      "Fill your details (College, Branch, WhatsApp)",
      "Get Onboarded into the Unisole Talent Pool",
    ],
    qrUrl: "https://unisole.org/programs",
    qrPrompt: "Scan QR Code for Registration / Enrollment",
    maxBuildSteps: 3,
    notes: "Program QR code for registration/enrollment. Scan to join!",
  },
];
