export const THEOG_COLLEGE_PPT_SLIDES = [
  // SLIDE 1 — HOOK
  {
    id: "theog_slide_1",
    type: "COVER",
    badge: "INDUSTRIAL TRAINING & INTERNSHIP PROGRAM",
    title: "UNISOLE",
    subtitle: "Industrial Training cum Internship Opportunity Program",
    org: "UNISOLE SKILL AI LABS",
    maxBuildSteps: 2,
    notes: "BUILD: UNISOLE → thin orange line → program name. Minimal dark navy background. No bullet points. No program explanation.",
  },

  // SLIDE 2 — THE HOOK QUESTION
  {
    id: "theog_slide_2",
    type: "BIG_QUESTION",
    badge: "THE HOOK QUESTION",
    title: "आगे क्या सोचा है?",
    subtitle: "Think honestly — what have you planned after graduation?",
    maxBuildSteps: 1,
    notes: "This is the ONLY Hindi slide. Nothing else. No English. No poll. No subtitle on screen. Pause and ask students verbally: 'Think honestly — what have you planned after graduation?'",
  },

  // SLIDE 3 — CAREER SURVEY
  {
    id: "theog_slide_3",
    type: "POLL",
    badge: "LIVE POLL 01",
    title: "What have you thought about your career?",
    question: "What is your current career plan?",
    options: [
      "Government Job",
      "Private Job",
      "Business / Startup",
      "Higher Studies",
      "Not Decided Yet",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 01. Large live-result area. Show percentages dynamically after students vote. Presenter transition: 'Interesting. Let\'s keep this result in mind and see what the actual career market looks like.'",
  },

  // SLIDE 4 — CREDIBILITY
  {
    id: "theog_slide_4",
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
      items: ["AI Education", "Industry Skills", "Career Awareness", "Practical Projects"],
    },
    maxBuildSteps: 3,
    notes: "Build trust before discussing the problem.",
  },

  // SLIDE 5 — OUR TEAM
  {
    id: "theog_slide_5",
    type: "TEAM_GRID",
    badge: "OUR TEAM",
    title: "Meet Our Team",
    subtitle: "Built by practitioners and engineers from top-tier institutions.",
    pillars: ["AI EDUCATION", "SYSTEMS ENGINEERING", "RESEARCH", "INDUSTRY MENTORSHIP"],
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
    notes: "Bring profiles one by one. Mentors from BlackRock, Tech Mahindra, NASA challenge, IIT & NIT.",
  },

  // SLIDE 6 — TRANSITION
  {
    id: "theog_slide_6",
    type: "TEXT_TRANSITION",
    badge: "A VITAL QUESTION",
    title: "But here is the real question...",
    subtitle: "If there are so many career opportunities, why don't most students know about them?",
    maxBuildSteps: 2,
    notes: "Dark slide. Use a dramatic pause.",
  },

  // SLIDE 7 — WHAT IS THE JOB MARKET?
  {
    id: "theog_slide_7",
    type: "ECOSYSTEM_HUB",
    badge: "THE LANDSCAPE",
    title: "What Does the Job Market Actually Look Like?",
    subtitle: "Your degree is a starting point — not the entire career map.",
    centerLabel: "JOB MARKET",
    items: [
      "Government",
      "Private Sector",
      "MNCs",
      "Startups",
      "GCCs",
      "Research",
      "Freelancing",
      "Consulting",
      "Business",
      "Remote / Global Work",
    ],
    punchline: "Your degree is a starting point — not the entire career map.",
    maxBuildSteps: 3,
    notes: "Build the ecosystem around 'JOB MARKET'. Key statement: 'Your degree is a starting point — not the entire career map.'",
  },

  // SLIDE 8 — WHY DON'T STUDENTS KNOW ABOUT IT?
  {
    id: "theog_slide_8",
    type: "THREE_CARDS",
    badge: "INFORMATION GAP",
    title: "Why Don't You Know About the Job Market?",
    subtitle: "The market changed faster than career advice.",
    cards: [
      {
        num: "01",
        title: "Career Advice",
        items: ["Parents", "Teachers", "Relatives", "Seniors"],
      },
      {
        num: "02",
        title: "Traditional Career Map",
        items: ["Government Jobs", "PSUs", "Traditional Professions", "Degree-Based Thinking"],
      },
      {
        num: "03",
        title: "New Career Market",
        items: ["IT & Cloud", "Data & Analytics", "AI & FinTech", "Startups & GCCs", "Remote Global Work"],
      },
    ],
    punchline: "The market changed faster than career advice.",
    maxBuildSteps: 3,
    notes: "Three large cards showing why advice lagged behind economic shifts.",
  },

  // SLIDE 9 — THE 1991 SHIFT
  {
    id: "theog_slide_9",
    type: "TIMELINE_EVOLUTION",
    badge: "MARKET EVOLUTION",
    title: "The Indian Job Market Changed",
    subtitle: "Private-sector scale and diversity expanded dramatically after 1991.",
    timeline: [
      {
        year: "BEFORE 1991",
        label: "Smaller private-sector ecosystem · Strong public-sector presence · Traditional pathways",
      },
      {
        year: "1991",
        label: "Economic Liberalisation & Market Reforms",
      },
      {
        year: "TODAY",
        label: "MNCs · Startups · IT · GCCs · FinTech · AI & Data · Digital Businesses · Global Work",
      },
    ],
    quote: "“Private-sector opportunities existed, but their scale and diversity expanded significantly after the 1991 economic reforms.”",
    maxBuildSteps: 3,
    notes: "Never say private jobs did not exist before 1991. Emphasize the dramatic expansion in scale and diversity.",
  },

  // SLIDE 10 — EDUCATION MARKET CHANGED TOO
  {
    id: "theog_slide_10",
    type: "EDUCATION_SHIFT",
    badge: "EDUCATION SHIFT",
    title: "The Education Market Changed Too",
    subtitle: "More Graduates → More Competition. Degree alone is no longer enough to differentiate yourself.",
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
    punchline: "More Graduates → More Competition. Degree alone is no longer enough to differentiate yourself.",
    maxBuildSteps: 3,
    notes: "Large visual comparison with animated bars. Highlight that degree alone is not enough to stand out.",
  },

  // SLIDE 11 — LIVE POLL 02
  {
    id: "theog_slide_11",
    type: "POLL",
    badge: "LIVE POLL 02",
    title: "What matters most in private hiring?",
    question: "What do you think matters most in a private-sector job?",
    options: [
      "Degree",
      "Skills",
      "College Brand",
      "Projects / Experience",
      "Communication",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 02. Show live result, then transition: 'Now let\'s see how private-sector hiring actually works.'",
  },

  // SLIDE 12 — GOVERNMENT VS PRIVATE
  {
    id: "theog_slide_12",
    type: "GOV_VS_PRIVATE",
    badge: "HIRING COMPARISON",
    title: "Government Job vs Private Job",
    subtitle: "Private hiring can be more role- and skill-oriented.",
    govFlow: [
      "Eligibility (Degree / Qualification)",
      "Selection (Exam / Recruitment Process)",
      "Job (Defined Post)",
    ],
    privFlow: [
      "Role (Target Position)",
      "Skills (Tools & Frameworks)",
      "Projects / Experience (Proof)",
      "Interview (Demonstration)",
      "Job (Offer & Growth)",
    ],
    punchline: "Private hiring can be more role- and skill-oriented.",
    disclaimer: "Degree requirements still vary by company and role.",
    maxBuildSteps: 3,
    notes: "Clean visual comparison. Highlight the skill and proof focus in private hiring.",
  },

  // SLIDE 13 — PRIVATE JOB MISCONCEPTIONS
  {
    id: "theog_slide_13",
    type: "MYTH_REALITY_PAIRS",
    badge: "MYTH VS REALITY",
    title: "Common Misconceptions About Private Jobs",
    subtitle: "Separating popular myths from real industry dynamics.",
    pairs: [
      {
        myth: "“My degree doesn't match the job.”",
        reality: "Many private roles prioritize proven practical skills and adjacent academic backgrounds over rigid degree names.",
      },
      {
        myth: "“Private jobs have no growth.”",
        reality: "Skills, performance, and taking responsibility create rapid, compounding career progression.",
      },
      {
        myth: "“Only engineering students get good private jobs.”",
        reality: "Business, finance, analytics, science, technology, and operations all have high-growth private-sector roles.",
      },
    ],
    maxBuildSteps: 3,
    notes: "Use 'Myth → Reality' cards to dispel common student hesitations.",
  },

  // SLIDE 14 — WHAT PRIVATE JOBS OFFER
  {
    id: "theog_slide_14",
    type: "BENEFITS_GRID",
    badge: "CAREER ADVANTAGES",
    title: "What Can a Private Job Offer You?",
    subtitle: "One skill → Multiple roles → Multiple companies.",
    benefits: [
      { title: "HYBRID & REMOTE WORK", value: "Global", sub: "Work anywhere in India" },
      { title: "COMPETITIVE PAY", value: "Compounding", sub: "Performance-driven upside" },
      { title: "PROFESSIONAL GROWTH", value: "Fast Track", sub: "Rapid promotions on merit" },
      { title: "CONTINUOUS LEARNING", value: "Modern Tech", sub: "Stay ahead with AI tools" },
      { title: "GLOBAL / MNC EXPOSURE", value: "2,100+ GCCs", sub: "Global teams from India" },
      { title: "CAREER MOBILITY", value: "Cross-Industry", sub: "Pivot across domains" },
    ],
    footer: "One skill → Multiple roles → Multiple companies",
    maxBuildSteps: 2,
    notes: "Six cards detailing modern career advantages.",
  },

  // SLIDE 15 — LIVE POLL 03
  {
    id: "theog_slide_15",
    type: "POLL",
    badge: "LIVE POLL 03",
    title: "Private Sector Attractions",
    question: "What attracts you most about a private-sector career?",
    options: [
      "Salary / Compensation",
      "Hybrid / Remote Work",
      "Career Growth",
      "Learning Opportunities",
      "MNC / Brand",
      "Global Opportunities",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 03. Capture student motivation.",
  },

  // SLIDE 16 — CAREER OPTIONS
  {
    id: "theog_slide_16",
    type: "CAREER_OPTIONS_HUB",
    badge: "CAREER HORIZONS",
    title: "How Many Career Options Do You Actually Have?",
    subtitle: "One degree can lead to multiple career paths.",
    hubLabel: "YOUR DEGREE",
    branches: [
      "Government",
      "Private Sector",
      "Startup",
      "Research",
      "Business",
      "Analytics",
      "Technology",
      "Higher Studies",
      "Freelancing",
      "Consulting",
    ],
    punchline: "One degree can lead to multiple career paths.",
    maxBuildSteps: 3,
    notes: "Central circle with radiating branches showing expansive career possibilities.",
  },

  // SLIDE 17 — COMMERCE / BBA
  {
    id: "theog_slide_17",
    type: "STREAM_ROLES",
    badge: "COMMERCE & BBA",
    stream: "Commerce / BBA",
    title: "Career Options — Commerce / BBA",
    subtitle: "Commerce / BBA → Applied Skills → High-Impact Roles",
    roles: [
      {
        num: "01",
        title: "Business Analyst",
        desc: "Process optimization, KPI dashboarding, business requirements & data modeling",
      },
      {
        num: "02",
        title: "FinTech Product Manager / Associate",
        desc: "Digital payments, lending workflows, customer journeys & tech coordination",
      },
      {
        num: "03",
        title: "AI Risk & Fraud Analyst",
        desc: "Automated risk scoring, anomaly detection, transaction audit & compliance AI",
      },
      {
        num: "04",
        title: "Strategic Financial Analyst (AI FP&A)",
        desc: "AI-Augmented financial planning, predictive cash flow & variance analysis",
      },
    ],
    maxBuildSteps: 4,
    notes: "Use exact roles from the roadmap: Commerce / BBA → Skills → Roles.",
  },

  // SLIDE 18 — COMPUTER / IT
  {
    id: "theog_slide_18",
    type: "STREAM_ROLES",
    badge: "COMPUTER & IT",
    stream: "Computer / IT",
    title: "Career Options — Computer / IT",
    subtitle: "BCA | MCA | B.Sc. Computer Science | Related Degrees",
    primaryRoles: [
      { category: "Data", role: "Data Scientist", desc: "Predictive models, statistical learning & data insight systems" },
      { category: "Cloud", role: "Cloud Engineer", desc: "AWS/Azure architecture, serverless pipelines & infrastructure as code" },
      { category: "Analytics", role: "Data Analyst", desc: "SQL, Power BI dashboards, KPI intelligence & reporting" },
      { category: "Development", role: "Full Stack Developer", desc: "Modern React/Next.js frontends & scalable backend APIs" },
    ],
    secondaryRoles: ["AI / ML", "GenAI & LLMs", "MLOps", "Cybersecurity", "Product / Tech Operations"],
    maxBuildSteps: 4,
    notes: "Four dominant career pillars with a secondary layer of AI/ML, GenAI, MLOps, Cybersecurity.",
  },

  // SLIDE 19 — PHYSICS
  {
    id: "theog_slide_19",
    type: "STREAM_ROLES",
    badge: "PHYSICS",
    stream: "B.Sc. Physics",
    title: "Career Options — B.Sc. Physics",
    subtitle: "Apply physical modeling and computational physics in modern AI.",
    rolesList: [
      "Physics-Informed Machine Learning Scientist / AI Specialist",
      "ML Simulation / Surrogate Modeling Engineer",
      "Lead — Physical AI / Cyber-Physical Systems Engineer",
      "Quantitative Researcher / Predictive Modeling Engineer",
      "R&D Data Scientist — Biotech, Materials & Pharma",
    ],
    maxBuildSteps: 3,
    notes: "Use roles directly from the physics roadmap.",
  },

  // SLIDE 20 — MATHEMATICS
  {
    id: "theog_slide_20",
    type: "STREAM_ROLES",
    badge: "MATHEMATICS",
    stream: "Mathematics",
    title: "Career Options — Mathematics",
    subtitle: "Mathematical foundations power generative AI and quant algorithms.",
    rolesList: [
      "AI Research Scientist / Research Engineer",
      "Quantitative Researcher / Modeler — Finance & Tech",
      "AI Optimization Engineer / Performance Engineer",
      "Machine Learning Core Infrastructure Engineer",
      "Advanced Data Scientist — Probabilistic & Generative Modeling",
    ],
    maxBuildSteps: 3,
    notes: "Highlight high-value mathematical roles in deep tech and quantitative finance.",
  },

  // SLIDE 21 — LIVE POLL 04
  {
    id: "theog_slide_21",
    type: "POLL",
    badge: "LIVE POLL 04",
    title: "Career Interest Check",
    question: "Which career path interests you the most right now?",
    options: [
      "Data / AI",
      "Software / Cloud",
      "Finance / Business",
      "Research / Quant",
      "Product / Management",
      "Still Exploring",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 04. Make students commit to a direction before introducing career capital.",
  },

  // SLIDE 22 — THE PROBLEM
  {
    id: "theog_slide_22",
    type: "TEXT_TRANSITION",
    badge: "THE CORE PROBLEM",
    title: "Knowing the career option is not enough.",
    subtitle: "You need to know how to reach it. This is where Career Capital matters.",
    maxBuildSteps: 2,
    notes: "Dark slide. Dramatic pause.",
  },

  // SLIDE 23 — CAREER CAPITAL
  {
    id: "theog_slide_23",
    type: "CAREER_CAPITAL_GRID",
    badge: "CAREER CAPITAL",
    title: "Build Career Capital",
    subtitle: "Invest 2 years deliberately → create compounding career advantage.",
    blocks: [
      { num: "01", label: "Skills", desc: "Production frameworks, Python, SQL, Cloud & AI tools" },
      { num: "02", label: "Projects", desc: "Real software & data systems solving tangible industry problems" },
      { num: "03", label: "Experience", desc: "Hands-on industrial training, internships & live deployments" },
      { num: "04", label: "Portfolio", desc: "Verified GitHub repositories, live demo links & technical writeups" },
      { num: "05", label: "Network", desc: "Mentors, tech leaders, peer builders & alumni connections" },
      { num: "06", label: "Interview Ability", desc: "System design, problem solving & confident project defense" },
    ],
    punchline: "Invest 2 years deliberately → create compounding career advantage.",
    maxBuildSteps: 3,
    notes: "Six connected blocks converging into Career Capital.",
  },

  // SLIDE 24 — LIVE POLL 05
  {
    id: "theog_slide_24",
    type: "POLL",
    badge: "LIVE POLL 05",
    title: "2-Year Investment Priority",
    question: "If you had the next 2 years to invest in your career, what would you prioritize?",
    options: [
      "Skills",
      "Projects",
      "Internship / Experience",
      "Resume / Portfolio",
      "Communication",
      "Competitive Exams",
      "Not Sure Yet",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 05. After the result: 'Now let\'s turn this into a practical roadmap.'",
  },

  // SLIDE 25 — HOW CAN YOU REACH THERE?
  {
    id: "theog_slide_25",
    type: "STAIRCASE_FLOW",
    badge: "THE STAIRCASE",
    title: "How Can You Reach There?",
    subtitle: "Learn → Build → Prove → Apply",
    steps: [
      "01. Choose a Role",
      "02. Understand Required Skills",
      "03. Learn Industry Tools",
      "04. Build Real Projects",
      "05. Create Proof of Work",
      "06. Gain Experience",
      "07. Prepare for Interviews",
      "08. Apply Strategically",
    ],
    punchline: "Learn → Build → Prove → Apply",
    maxBuildSteps: 4,
    notes: "Staircase progression from choosing a role to strategic applications.",
  },

  // SLIDE 26 — GENERALIZED ROADMAP
  {
    id: "theog_slide_26",
    type: "ROADMAP_FLOW",
    badge: "THE BLUEPRINT",
    title: "A Generalized Career Roadmap",
    subtitle: "From foundational concepts to career opportunity.",
    steps: [
      { num: "01", title: "FOUNDATION: Core Concepts" },
      { num: "02", title: "INDUSTRY SKILLS: Tools + Technologies" },
      { num: "03", title: "PROBLEM SOLVING: Real Problems" },
      { num: "04", title: "PROJECT: Build & Ship" },
      { num: "05", title: "PROOF: GitHub / Portfolio / Resume" },
      { num: "06", title: "EXPERIENCE: Internship / Freelance" },
      { num: "07", title: "OPPORTUNITY: Interview → Offer" },
    ],
    sideSection: {
      title: "Alongside Your Degree",
      items: [
        "Communication",
        "AI Productivity Tools",
        "Professional Writing",
        "Networking",
        "Interview Defense Skills",
      ],
    },
    maxBuildSteps: 4,
    notes: "Generalized roadmap with side section for soft capital and communication.",
  },

  // SLIDE 27 — TRANSITION TO DEDICATED ROADMAPS
  {
    id: "theog_slide_27",
    type: "TEXT_TRANSITION",
    badge: "STREAM SPECIALIZATION",
    title: "One generic roadmap is not enough.",
    subtitle: "Every stream needs a different roadmap.",
    cards: [
      "Computer / IT",
      "Physics / Maths / Chemistry",
      "Commerce / BBA",
      "Arts / Other",
    ],
    maxBuildSteps: 2,
    notes: "Dark slide showing stream divergence.",
  },

  // SLIDE 28 — COMPUTER / IT ROADMAP
  {
    id: "theog_slide_28",
    type: "DEDICATED_ROADMAP",
    badge: "DEDICATED ROADMAP",
    stream: "Computer / IT",
    title: "Computer / IT — Dedicated Roadmap",
    foundation: ["Python", "SQL", "Git / GitHub", "Data Structures", "Statistics"],
    industrySkills: ["Data Analytics", "Machine Learning", "Cloud (AWS/GCP)", "APIs", "GenAI", "Databases"],
    projects: "Industry-style full-stack applications, ML APIs, and live deployments",
    proof: "GitHub repositories, Deployed Portfolio, ATS-Optimized Resume, LinkedIn",
    opportunity: "Interview → Internship → Software / ML Engineer",
    maxBuildSteps: 4,
    notes: "Dedicated roadmap for CS/IT students.",
  },

  // SLIDE 29 — SCIENCE ROADMAP
  {
    id: "theog_slide_29",
    type: "DEDICATED_ROADMAP",
    badge: "DEDICATED ROADMAP",
    stream: "Physics / Maths / Chemistry",
    title: "Physics / Maths / Chemistry — Dedicated Roadmap",
    foundation: ["Python", "Statistics", "Linear Algebra", "Numerical Methods"],
    industrySkills: ["Data Science", "Machine Learning", "Scientific Computing", "Simulation", "AI Models"],
    projects: "Physics/Mathematics/Chemistry domain problem modeling & predictive simulations",
    proof: "Research Project write-ups, GitHub code, Technical Portfolio, Resume",
    opportunity: "Research / Industry / Data Science Internship",
    maxBuildSteps: 4,
    notes: "Dedicated roadmap for science students.",
  },

  // SLIDE 30 — COMMERCE / BBA ROADMAP
  {
    id: "theog_slide_30",
    type: "DEDICATED_ROADMAP",
    badge: "DEDICATED ROADMAP",
    stream: "Commerce / BBA",
    title: "Commerce / BBA — Dedicated Roadmap",
    foundation: ["Advanced Excel", "Business Fundamentals", "Statistics", "Financial Concepts"],
    industrySkills: ["SQL", "Power BI", "Business Analytics", "AI Tools", "Financial Analytics"],
    projects: "Business Case Studies, Interactive KPI Dashboards, Finance / Risk Projects",
    proof: "Interactive Dashboard Portfolio, Project Case Deck, Resume, LinkedIn",
    opportunity: "Business Analyst, FinTech Associate, Risk / Fraud Analyst",
    maxBuildSteps: 4,
    notes: "Dedicated roadmap for commerce and BBA students.",
  },

  // SLIDE 31 — ARTS / OTHER ROADMAP
  {
    id: "theog_slide_31",
    type: "DEDICATED_ROADMAP",
    badge: "DEDICATED ROADMAP",
    stream: "Arts / Other",
    title: "Arts / Other Backgrounds — Dedicated Roadmap",
    foundation: ["Communication", "Research", "Spreadsheets & Excel", "AI Productivity"],
    industrySkills: ["Digital Workflows", "Data Basics & Visuals", "Digital Marketing", "Research", "Presentation"],
    projects: "Real-world marketing campaigns, workflow automation, and research reports",
    proof: "Digital Portfolio, Writing Samples, Case Studies, Resume, LinkedIn",
    opportunity: "Operations, Marketing, Research, Digital Roles, Freelancing",
    maxBuildSteps: 4,
    notes: "Dedicated roadmap for arts and other non-technical streams.",
  },

  // SLIDE 32 — LIVE POLL 06
  {
    id: "theog_slide_32",
    type: "POLL",
    badge: "LIVE POLL 06",
    title: "Your Target Roadmap",
    question: "Which roadmap would you like to follow?",
    options: [
      "🔵 Computer / IT",
      "🟢 Physics / Maths / Chemistry",
      "🟠 Commerce / BBA",
      "🟣 Arts / Other",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 06. Reveal: 'This is exactly why a one-size-fits-all course doesn\'t work.'",
  },

  // SLIDE 33 — THE PROBLEM WITH NORMAL COURSES
  {
    id: "theog_slide_33",
    type: "COURSE_VS_CAREER",
    badge: "PARADIGM SHIFT",
    title: "A Course Is Not a Career",
    subtitle: "Certificate proves completion. Portfolio proves capability.",
    normalCourse: [
      "Watch Recorded Videos",
      "Complete Theory Syllabus",
      "Take Online Multiple Choice Test",
      "Get Generic Certificate",
    ],
    careerProgram: [
      "Learn Practical Industry Skills",
      "Build Production-Grade Projects",
      "Create Verified Proof of Work",
      "Build ATS-Optimized Resume",
      "Prepare for Technical Interviews",
      "Unlock Real Career Opportunities",
    ],
    punchline: "Certificate proves completion. Portfolio proves capability.",
    maxBuildSteps: 3,
    notes: "Two-column comparison between passive courses and active career-building programs.",
  },

  // SLIDE 34 — INTRODUCE UNISOLE
  {
    id: "theog_slide_34",
    type: "TEXT_TRANSITION",
    badge: "THE SOLUTION",
    title: "So who can help you execute this roadmap?",
    subtitle: "UNISOLE: Learn → Build → Prove → Prepare → Opportunity",
    maxBuildSteps: 2,
    notes: "Dark transition slide. First major appearance of UNISOLE as the solution.",
  },

  // SLIDE 35 — UNISOLE PROGRAM
  {
    id: "theog_slide_35",
    type: "PROGRAM_OVERVIEW",
    badge: "STRUCTURED PROGRAM",
    title: "UNISOLE Industrial Training cum Internship Opportunity Program",
    subtitle: "3-MONTH LIVE INDUSTRIAL TRAINING PROGRAM",
    pillars: [
      "Stream-Specific Dedicated Roadmap",
      "Live Weekend Learning & Problem Solving",
      "Industry-Grade Technical Skills",
      "Production Capstone Projects",
      "Resume & Portfolio Architecture",
      "Interview Defense & Mock Rounds",
      "Exclusive UNISOLE Talent Pool",
    ],
    maxBuildSteps: 3,
    notes: "Large visual highlight of the 3-Month Live Program structure.",
  },

  // SLIDE 36 — WHAT YOU GET
  {
    id: "theog_slide_36",
    type: "WHAT_YOU_GET",
    badge: "PROGRAM DELIVERABLES",
    title: "What You Get",
    subtitle: "Six core pillars engineered for tangible career outcomes.",
    cards: [
      { num: "01", title: "3-Month Live Course", desc: "Interactive weekend live sessions with hands-on labs and mentor access" },
      { num: "02", title: "Industry-Grade Projects", desc: "Shipped live with real data, unit tests, and production architectures" },
      { num: "03", title: "Stream-Specific Roadmap", desc: "Curriculum tailored to your exact degree: CS/IT, Science, Commerce, Arts" },
      { num: "04", title: "Resume + Portfolio Building", desc: "Build verified proof and deploy live code that recruiters can inspect" },
      { num: "05", title: "Interview Preparation", desc: "Technical mock rounds, system thinking, and project defense coaching" },
      { num: "06", title: "UNISOLE Talent Pool", desc: "Direct access to startup, GCC, and hiring partner opportunities" },
    ],
    maxBuildSteps: 3,
    notes: "Six cards corresponding directly with UNISOLE offerings.",
  },

  // SLIDE 37 — INDUSTRY PROJECTS
  {
    id: "theog_slide_37",
    type: "PIPELINE_FLOW",
    badge: "BUILDING METHODOLOGY",
    title: "You Don't Just Learn. You Build.",
    subtitle: "Your project becomes your proof of ability.",
    stages: [
      "Problem Definition",
      "Research & Data",
      "Build & Code",
      "Testing & Refinement",
      "Present / Deploy",
      "Live Portfolio",
    ],
    punchline: "Your project becomes your proof of ability.",
    maxBuildSteps: 3,
    notes: "Visual pipeline showing real project development lifecycle.",
  },

  // SLIDE 38 — PROJECT POLL
  {
    id: "theog_slide_38",
    type: "POLL",
    badge: "LIVE POLL 07",
    title: "Project Audit",
    question: "How many real projects do you currently have?",
    options: ["0", "1", "2", "3", "4+"],
    maxBuildSteps: 1,
    notes: "Live Poll 07. Presenter bridge: 'This is exactly the gap we want to solve.'",
  },

  // SLIDE 39 — RESUME + PORTFOLIO
  {
    id: "theog_slide_39",
    type: "PROOF_HIERARCHY",
    badge: "PROOF OF WORK",
    title: "Build Proof, Not Just a Resume",
    subtitle: "Degree + Skills + Proof = Unstoppable Profile",
    layers: [
      { label: "DEGREE", desc: "What you studied (Academic Foundation)" },
      { label: "SKILLS", desc: "What you can do (Tools & Frameworks)" },
      { label: "PROJECTS", desc: "What you have built (Working Software & Models)" },
      { label: "PORTFOLIO", desc: "What you can show (Live Demos & GitHub Repos)" },
      { label: "RESUME", desc: "What you communicate (Impact, Metrics & Defense)" },
    ],
    punchline: "Degree + Skills + Proof",
    maxBuildSteps: 3,
    notes: "Visual hierarchy showing how proof sits on top of degrees and skills.",
  },

  // SLIDE 40 — INTERVIEW PREPARATION
  {
    id: "theog_slide_40",
    type: "PIPELINE_FLOW",
    badge: "INTERVIEW DEFENSE",
    title: "Your Project Must Survive the Interview",
    subtitle: "Build it. Explain it. Defend it.",
    stages: [
      "Resume Shortlisting",
      "Technical Screening",
      "Project Discussion",
      "System Defense",
      "Communication / HR",
      "Final Selection",
    ],
    punchline: "Build it. Explain it. Defend it.",
    maxBuildSteps: 3,
    notes: "Interview pipeline highlighting the need to defend real project work.",
  },

  // SLIDE 41 — JOINT CERTIFICATE
  {
    id: "theog_slide_41",
    type: "CERTIFICATE_SHOWCASE",
    badge: "ACCREDITATION",
    title: "JOINT CERTIFICATE",
    subtitle: "NIT HAMIRPUR × IAPT × UNISOLE",
    note: "Awarded upon successful completion of the industrial training and milestone projects.",
    maxBuildSteps: 2,
    notes: "Extremely premium and minimal. NIT Hamirpur x IAPT x UNISOLE.",
  },

  // SLIDE 42 — UNISOLE TALENT POOL
  {
    id: "theog_slide_42",
    type: "TALENT_POOL_PIPELINE",
    badge: "TALENT POOL",
    title: "Perform Well → Get Noticed",
    subtitle: "Performance-Based Internship & Project Opportunities",
    steps: [
      "Program Performance",
      "Milestone Evaluation",
      "UNISOLE TALENT POOL",
      "Internship / Project Opportunities",
    ],
    disclaimer: "Opportunities are performance-based and subject to availability.",
    maxBuildSteps: 3,
    notes: "Dark navy pipeline showing progression into the UNISOLE Talent Pool.",
  },

  // SLIDE 43 — FINAL POLL
  {
    id: "theog_slide_43",
    type: "POLL",
    badge: "LIVE POLL 08",
    title: "Your Next Step",
    question: "What is your next step after today's session?",
    options: [
      "Government Job Preparation",
      "Private Job Roadmap",
      "Business / Startup",
      "Skill Building",
      "Higher Studies",
      "Still Exploring",
    ],
    maxBuildSteps: 1,
    notes: "Live Poll 08. Capture student decisions after experiencing the full presentation.",
  },

  // SLIDE 44 — BEFORE VS AFTER
  {
    id: "theog_slide_44",
    type: "BEFORE_AFTER_POLL",
    badge: "IMPACT ANALYSIS",
    title: "Did Your Thinking Change?",
    subtitle: "Awareness → Better Decisions",
    beforePollTitle: "BEFORE TODAY (Poll 01 Baseline)",
    afterPollTitle: "AFTER TODAY (Poll 08 Outcome)",
    punchline: "Awareness → Better Decisions",
    maxBuildSteps: 2,
    notes: "Comparison slide showing the shift from Poll 01 to Poll 08.",
  },

  // SLIDE 45 — ENROLLMENT
  {
    id: "theog_slide_45",
    type: "ENROLLMENT_CTA",
    badge: "ENROLLMENT",
    title: "Your Next Step Starts Here",
    subtitle: "3-Month Live Industrial Training cum Internship Opportunity Program",
    actions: [
      "Choose Your Stream",
      "Explore the Roadmap",
      "Register / Enquire",
    ],
    qrUrl: "https://unisole.org/programs",
    qrPrompt: "Scan QR Code to Explore Program & Register",
    maxBuildSteps: 3,
    notes: "Keep QR on screen for at least 30–60 seconds while students scan.",
  },

  // SLIDE 46 — FINAL MESSAGE
  {
    id: "theog_slide_46",
    type: "FINAL_MESSAGE",
    badge: "FINAL MESSAGE",
    title: "Your degree is not your destination.",
    subtitle: "Your skills + projects + proof + decisions build your career.",
    org: "UNISOLE Skill AI Labs",
    closingQuote: "“The question is no longer what your degree can give you. The question is what you are going to build with the next two years.”",
    maxBuildSteps: 2,
    notes: "Dark navy. Very minimal. Spoken closing line: 'The question is no longer what your degree can give you. The question is what you are going to build with the next two years.'",
  },
];
