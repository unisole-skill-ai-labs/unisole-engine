import { getCanonicalPathway } from "./canonical-catalog";

export interface CanonicalOffering {
  itemType: "PATHWAY" | "COURSE" | "WORKSHOP" | "PROGRAM" | "BUNDLE";
  itemId: string;
  title: string;
  description: string;
  slug: string;
  pricePaise: number;
  mrpPaise: number;
  currency?: string;
  isFree?: boolean;
  isActive?: boolean;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

const RAW_CANONICAL_SEO_OFFERINGS: CanonicalOffering[] = [
  // ============================================================
  // GROUP 01: Computer Science & IT
  // ============================================================
  {
    itemType: "PATHWAY",
    itemId: "cs-genai",
    title: "Generative AI Engineering",
    description: "From data handling and backend engineering through classical NLP, sequence models, Transformers, and RAG into LLMOps and Agentic AI systems.",
    slug: "cs-genai",
    pricePaise: 299900,
    mrpPaise: 999900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-1",
      groupTitle: "Computer Science & IT",
      eyebrow: "PATHWAY 01",
      duration: "12 Weeks (132 Hours)",
      level: "Foundations to Agentic AI",
      handsOn: "Theory + Hands-on Labs + Capstone",
      syllabusLink: "/syllabi/cs-genai.pdf",
    },
  },
  {
    itemType: "PATHWAY",
    itemId: "cs-agentic",
    title: "AI Agent Engineering",
    description: "From fundamentals of AI agents to designing, building, evaluating, and deploying a production-grade multi-agent system through a single progressive build.",
    slug: "cs-agentic",
    pricePaise: 299900,
    mrpPaise: 999900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-1",
      groupTitle: "Computer Science & IT",
      eyebrow: "PATHWAY 02",
      duration: "12 Weeks (132 Hours)",
      level: "Fundamentals to Production",
      handsOn: "Theory + Hands-on Labs + Capstone",
      syllabusLink: "/syllabi/cs-agentic.pdf",
    },
  },
  {
    itemType: "PATHWAY",
    itemId: "cs-p1",
    title: "Machine Learning in Production: MLOps Engineering",
    description: "From data engineering fundamentals through experiment tracking, deployment, monitoring, and automated retraining into managed cloud ML platforms.",
    slug: "cs-p1",
    pricePaise: 299900,
    mrpPaise: 999900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-1",
      groupTitle: "Computer Science & IT",
      eyebrow: "PATHWAY 03",
      duration: "12 Weeks (132 Hours)",
      level: "Industry-Ready MLOps",
      handsOn: "Theory + Hands-on Labs + Capstone",
      syllabusLink: "/syllabi/cs-p1.pdf",
    },
  },
  {
    itemType: "PATHWAY",
    itemId: "cs-common",
    title: "AI Entrepreneurship & Business Innovation",
    description: "Structured incubator track teaching students how to convert AI technical capability into a validated commercial product and startup. Classes run on Saturdays and Sundays.",
    slug: "cs-common",
    pricePaise: 59900,
    mrpPaise: 299900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-common",
      groupTitle: "Incubator Track (CS & Commerce)",
      eyebrow: "WEEKEND INCUBATOR TRACK",
      duration: "3 Months (12 Weekends)",
      level: "All Students (Weekend Track)",
      handsOn: "Incubator Labs (Sat & Sun only)",
      syllabusLink: "/syllabi/cs-common.pdf",
    },
  },

  // ============================================================
  // GROUP 02: Science & Mathematics
  // ============================================================
  {
    itemType: "PATHWAY",
    itemId: "sci-p1",
    title: "Scientific Machine Learning for Basic Sciences (BSc Physics | BSc Maths)",
    description: "Core progression: Mathematics → Python → Scientific Computing → Machine Learning → Deep Learning → Scientific AI → Capstone. Formulate differential equations as learning constraints, implement PINNs via PyTorch autograd, and solve forward/inverse problems.",
    slug: "sci-p1",
    pricePaise: 299900,
    mrpPaise: 899900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-2",
      groupTitle: "Science & Mathematics",
      eyebrow: "PATHWAY 01",
      duration: "6 Months",
      level: "Undergraduate → Early Professional",
      handsOn: "100% Practical Labs",
      syllabusLink: "/syllabi/sci-p1.pdf",
    },
  },
  {
    itemType: "PATHWAY",
    itemId: "sci-p2",
    title: "Mathematics + AI / Computational Intelligence",
    description: "Rigorous mathematics-oriented pathway focusing on mathematical proofs, optimization theory, statistical learning, and computational algorithms.",
    slug: "sci-p2",
    pricePaise: 150000,
    mrpPaise: 599900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-2",
      groupTitle: "Science & Mathematics",
      eyebrow: "PATHWAY 02",
      duration: "3 Months",
      level: "Mathematics & Statistics Majors",
      handsOn: "100% Practical Labs",
      syllabusLink: "/syllabi/sci-p2.pdf",
    },
  },

  // ============================================================
  // GROUP 03: Commerce, BBA & Management
  // ============================================================
  {
    itemType: "PATHWAY",
    itemId: "mgmt-p1",
    title: "Business Analytics & Data Engineering",
    description: "Equips business students with advanced Excel, SQL, modern data engineering (ETL, Parquet, DuckDB), Power BI, and Generative AI.",
    slug: "mgmt-p1",
    pricePaise: 200000,
    mrpPaise: 699900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-3",
      groupTitle: "Commerce, BBA & Management",
      eyebrow: "PATHWAY 01",
      duration: "3 Months",
      level: "Undergraduate / Postgraduate",
      handsOn: "100% Practical Labs",
      syllabusLink: "/syllabi/mgmt-p1.pdf",
    },
  },

  // ============================================================
  // GROUP 04: BA, Humanities & Non-Tech Disciplines
  // ============================================================
  {
    itemType: "PATHWAY",
    itemId: "arts-p1",
    title: "Applied AI for Humanities, Research & Careers",
    description: "Elite professional program: prompt engineering, AI research methods, automated content, executive communication, and career mastery.",
    slug: "arts-p1",
    pricePaise: 99900,
    mrpPaise: 399900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      group: "group-4",
      groupTitle: "BA, Humanities & Other Disciplines",
      eyebrow: "AI-ENABLED PROFESSIONAL PROGRAM",
      duration: "3 Months",
      level: "All Students (No Coding Required)",
      handsOn: "100% Practical Labs",
      syllabusLink: "/syllabi/arts-p1.pdf",
    },
  },

  // ============================================================
  // WORKSHOP / MASTERCLASS
  // ============================================================
  {
    itemType: "WORKSHOP",
    itemId: "AI_MASTERCLASS_2026",
    title: "AI Revolution & Agentic Engineering Masterclass",
    description: "2-Hour Live Interactive Masterclass: Foundational Literacy, 2026 Model Landscapes, Prompt Engineering Mastery, and Personal AI Operating System.",
    slug: "ai-masterclass",
    pricePaise: 3900,
    mrpPaise: 99900,
    currency: "INR",
    isFree: false,
    isActive: true,
    isPublic: true,
    metadata: {
      category: "Masterclass",
      duration: "2-Hour Live Workshop",
    },
  },
];

export const CANONICAL_SEO_OFFERINGS: CanonicalOffering[] = RAW_CANONICAL_SEO_OFFERINGS.map(
  (offering) => {
    if (offering.itemType === "PATHWAY") {
      const canon = getCanonicalPathway(offering.itemId);
      if (canon) {
        return {
          ...offering,
          metadata: {
            ...offering.metadata,
            modules: canon.modules || [],
            capstone: canon.capstone,
            roles: canon.roles || [],
            tools: canon.tools || [],
            duration: canon.duration || offering.metadata?.duration,
            level: canon.level || offering.metadata?.level,
            handsOn: canon.handsOn || offering.metadata?.handsOn,
            syllabusLink: canon.syllabusLink || offering.metadata?.syllabusLink,
          },
        };
      }
    }
    return offering;
  }
);

