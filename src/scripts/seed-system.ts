import bcrypt from "bcryptjs";
import { pool } from "../db";
import { THEOG_COLLEGE_PPT_SLIDES } from "../data/theogDeck";
import { SANJAULI_COLLEGE_PPT_SLIDES } from "../data/sanjauliDeck";
import { UNISOLE_AI_CAMPUS_DECK_SLIDES } from "../data/aiCampusDeck";

/**
 * System Seeder — Sets up foundational, non-mock system data:
 * 1. Partner colleges (canonical GDC Theog, etc.) & official academic branches
 * 2. Flagship Presentation Decks (Theog College PPT, Unisole AI Campus Deck)
 *
 * Safe to run on fresh DBs or during staging/production initialization.
 * Idempotent with ON CONFLICT DO UPDATE / DO NOTHING.
 *
 * Usage: npm run db:seed:system
 */
export async function seedSystemData() {
  console.log("[Seed:System] Starting foundational system data sync...");

  try {
    // 0. Ensure Girish Super Admin exists with secure hashed credentials
    const adminPasswordRaw =
      process.env.SUPERADMIN_PASSWORD ||
      process.env.SUPERADMIN_INITIAL_PASSWORD;

    const girishCheck = await pool.query(
      "SELECT id, password FROM users WHERE LOWER(username) = 'girish' OR phone = '+910000000000' OR phone = '0000000000' LIMIT 1"
    );

    if (adminPasswordRaw) {
      const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10);
      if (girishCheck.rows && girishCheck.rows[0]) {
        await pool.query(
          "UPDATE users SET username = 'girish', password = $1, name = 'Girish Gaurav Sharma', role = 'SUPER_ADMIN', designation = 'Super Administrator', is_active = TRUE WHERE id = $2",
          [hashedPassword, girishCheck.rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO users (username, password, phone, name, role, designation, is_active) VALUES ('girish', $1, '+910000000000', 'Girish Gaurav Sharma', 'SUPER_ADMIN', 'Super Administrator', TRUE)",
          [hashedPassword]
        );
      }
      console.log("[Seed:System] Synchronized Super Admin account (girish) with secure hashed credentials.");
    } else if (girishCheck.rows && girishCheck.rows[0]) {
      console.log("[Seed:System] Synchronized Super Admin profile (existing password preserved).");
    } else {
      console.warn("[Seed:System] ⚠️ SUPERADMIN_PASSWORD environment variable not set. Please set SUPERADMIN_PASSWORD in .env.");
    }

    // 1. Sync Government Degree College Theog (gdc-theog)
    const theogClgRes = await pool.query(
      `INSERT INTO colleges (name, short_name, slug, description, is_active)
       VALUES ('Government Degree College Theog', 'GDC Theog', 'gdc-theog', 'Affiliated with Himachal Pradesh University, Shimla, offering undergraduate programs in Arts, Commerce, Science, Computer Applications, and Business Administration.', TRUE)
       ON CONFLICT (slug) DO UPDATE 
       SET name = EXCLUDED.name, short_name = EXCLUDED.short_name, description = EXCLUDED.description, is_active = TRUE
       RETURNING id, name`
    );

    const theogCollegeId = theogClgRes.rows[0]?.id;
    const theogCollegeName = theogClgRes.rows[0]?.name ?? "Government Degree College Theog";

    if (theogCollegeId) {
      const theogBranches = [
        { name: "BA", code: "BA", desc: "Bachelor of Arts with multidisciplinary electives." },
        { name: "BBA", code: "BBA", desc: "Bachelor of Business Administration." },
        { name: "BCOM", code: "BCOM", desc: "Bachelor of Commerce." },
        { name: "BCA", code: "BCA", desc: "Bachelor of Computer Applications." },
        { name: "BSC Non-Med", code: "BSC_NM", desc: "Bachelor of Science (Non-Medical)." },
        { name: "BSC Med", code: "BSC_MED", desc: "Bachelor of Science (Medical)." },
        { name: "Others", code: "OTHERS", desc: "Other / Multidisciplinary streams." },
      ];

      for (const br of theogBranches) {
        const brCheck = await pool.query(
          "SELECT id FROM branches WHERE college_id = $1 AND (name = $2 OR code = $3) LIMIT 1",
          [theogCollegeId, br.name, br.code]
        );
        if (brCheck.rows && brCheck.rows[0]) {
          await pool.query(
            "UPDATE branches SET name = $1, code = $2, description = $3, is_active = TRUE WHERE id = $4",
            [br.name, br.code, br.desc, brCheck.rows[0].id]
          );
        } else {
          await pool.query(
            "INSERT INTO branches (college_id, name, code, description, is_active) VALUES ($1, $2, $3, $4, TRUE)",
            [theogCollegeId, br.name, br.code, br.desc]
          );
        }
      }
      console.log(`[Seed:System] Synchronized GDC Theog branches.`);
    }

    // 1B. Sync Centre of Excellence Government College Sanjauli (gdc-sanjauli)
    const sanjauliClgRes = await pool.query(
      `INSERT INTO colleges (name, short_name, slug, description, is_active)
       VALUES ('Centre of Excellence Government College, Sanjauli', 'GDC Sanjauli', 'gdc-sanjauli', 'Premier Centre of Excellence institution in Shimla offering specialized BCA and undergraduate degrees affiliated with Himachal Pradesh University.', TRUE)
       ON CONFLICT (slug) DO UPDATE 
       SET name = EXCLUDED.name, short_name = EXCLUDED.short_name, description = EXCLUDED.description, is_active = TRUE
       RETURNING id, name`
    );

    const sanjauliCollegeId = sanjauliClgRes.rows[0]?.id;
    const sanjauliCollegeName = sanjauliClgRes.rows[0]?.name ?? "Centre of Excellence Government College, Sanjauli";

    if (sanjauliCollegeId) {
      const sanjauliBranches = [
        { name: "BCA", code: "BCA", desc: "Bachelor of Computer Applications." },
        { name: "Others", code: "OTHERS", desc: "Other / Multidisciplinary streams." },
      ];

      for (const br of sanjauliBranches) {
        const brCheck = await pool.query(
          "SELECT id FROM branches WHERE college_id = $1 AND (name = $2 OR code = $3) LIMIT 1",
          [sanjauliCollegeId, br.name, br.code]
        );
        if (brCheck.rows && brCheck.rows[0]) {
          await pool.query(
            "UPDATE branches SET name = $1, code = $2, description = $3, is_active = TRUE WHERE id = $4",
            [br.name, br.code, br.desc, brCheck.rows[0].id]
          );
        } else {
          await pool.query(
            "INSERT INTO branches (college_id, name, code, description, is_active) VALUES ($1, $2, $3, $4, TRUE)",
            [sanjauliCollegeId, br.name, br.code, br.desc]
          );
        }
      }
      console.log(`[Seed:System] Synchronized GDC Sanjauli branches.`);
    }

    // 2. Seed / Sync Flagship Deck: Theog College PPT
    const theogPresTitle = "Theog College PPT";
    await pool.query(
      `INSERT INTO presentations (id, college_id, college_name, title, description, theme, slides, is_active)
       VALUES ('pres_theog_college_ppt', $1, $2, $3, $4, 'dark', $5, TRUE)
       ON CONFLICT (id) DO UPDATE 
       SET slides = EXCLUDED.slides, 
           title = EXCLUDED.title, 
           college_id = COALESCE(EXCLUDED.college_id, presentations.college_id), 
           college_name = COALESCE(EXCLUDED.college_name, presentations.college_name)`,
      [
        theogCollegeId,
        theogCollegeName,
        theogPresTitle,
        "46-slide college student career awareness + industrial training presentation for Govt. Degree College Theog with 8 interactive live polls, stream-specific roadmaps, and career capital framework.",
        JSON.stringify(THEOG_COLLEGE_PPT_SLIDES),
      ]
    );
    console.log(`[Seed:System] Synchronized flagship deck: Theog College PPT (${THEOG_COLLEGE_PPT_SLIDES.length} slides)`);

    // 2B. Seed / Sync Flagship Deck: Sanjauli College PPT
    const sanjauliPresTitle = "Sanjauli College PPT";
    await pool.query(
      `INSERT INTO presentations (id, college_id, college_name, title, description, theme, slides, is_active)
       VALUES ('pres_sanjauli_college_ppt', $1, $2, $3, $4, 'dark', $5, TRUE)
       ON CONFLICT (id) DO UPDATE 
       SET slides = EXCLUDED.slides, 
           title = EXCLUDED.title, 
           college_id = COALESCE(EXCLUDED.college_id, presentations.college_id), 
           college_name = COALESCE(EXCLUDED.college_name, presentations.college_name)`,
      [
        sanjauliCollegeId,
        sanjauliCollegeName,
        sanjauliPresTitle,
        "27-slide high-energy BCA-oriented career awareness & industrial training presentation for Centre of Excellence Govt. College Sanjauli featuring the Post-Bubble Macro AI Landscape, 100-Candidate Drop-off Funnel, and 7-Step Strategic Action Playbook.",
        JSON.stringify(SANJAULI_COLLEGE_PPT_SLIDES),
      ]
    );
    console.log(`[Seed:System] Synchronized flagship deck: Sanjauli College PPT (${SANJAULI_COLLEGE_PPT_SLIDES.length} slides)`);

    // 3. Seed / Sync Flagship Deck: Unisole AI Campus Deck
    const aiDeckTitle = "UNISOLE AI Campus Program Presentation Deck";
    await pool.query(
      `INSERT INTO presentations (id, college_id, college_name, title, description, theme, slides, is_active)
       VALUES ('pres_ai_campus_deck', NULL, 'General / Independent Deck', $1, $2, 'dark', $3, TRUE)
       ON CONFLICT (id) DO UPDATE 
       SET slides = EXCLUDED.slides, 
           title = EXCLUDED.title`,
      [
        aiDeckTitle,
        "AI Campus Program interactive live presentation deck with real-time student engagement, skill pathways, and career tracks.",
        JSON.stringify(UNISOLE_AI_CAMPUS_DECK_SLIDES),
      ]
    );
    console.log(`[Seed:System] Synchronized flagship deck: AI Campus Deck (${UNISOLE_AI_CAMPUS_DECK_SLIDES.length} slides)`);

    // 4. Seed / Sync Foundational Courses (8 Canonical Academic Pathways + 1 AI Masterclass)
    // First, clean any legacy or old placeholder IDs, courses, modules, lessons, and old demo pathways
    await pool.query(`
      -- Clean legacy demo pathways (pwy_1, pwy_2, pwy_3)
      DELETE FROM pathway_categories WHERE pathway_id IN ('pwy_1', 'pwy_2', 'pwy_3');
      DELETE FROM pathway_colleges WHERE pathway_id IN ('pwy_1', 'pwy_2', 'pwy_3');
      DELETE FROM pathway_courses WHERE pathway_id IN ('pwy_1', 'pwy_2', 'pwy_3');
      UPDATE enrollments SET pathway_id = NULL WHERE pathway_id IN ('pwy_1', 'pwy_2', 'pwy_3');
      UPDATE payments SET pathway_id = NULL WHERE pathway_id IN ('pwy_1', 'pwy_2', 'pwy_3');
      DELETE FROM pathways WHERE id IN ('pwy_1', 'pwy_2', 'pwy_3');

      -- Clean deprecated courses, modules, and lessons
      DELETE FROM pathway_courses WHERE course_id IN ('crs_1', 'crs_2', 'crs_3', 'crs_4', 'crs_5', 'crs_6', 'crs_cs_ai', 'crs_sci_math', 'crs_commerce_mgmt', 'crs_humanities_arts', 'mgmt-p2', 'mgmt-p3', 'mgmt-common', 'cs-p2', 'cs-p3', 'crs_cs-genai', 'crs_cs-agentic', 'crs_cs-p1', 'crs_cs-common', 'crs_sci-p1', 'crs_sci-p2', 'crs_mgmt-p1', 'crs_arts-p1');
      DELETE FROM course_modules WHERE course_id IN ('crs_1', 'crs_2', 'crs_3', 'crs_4', 'crs_5', 'crs_6', 'crs_cs_ai', 'crs_sci_math', 'crs_commerce_mgmt', 'crs_humanities_arts', 'mgmt-p2', 'mgmt-p3', 'mgmt-common', 'cs-p2', 'cs-p3', 'crs_cs-genai', 'crs_cs-agentic', 'crs_cs-p1', 'crs_cs-common', 'crs_sci-p1', 'crs_sci-p2', 'crs_mgmt-p1', 'crs_arts-p1') OR module_id IN ('mod_1', 'mod_2', 'mod_3', 'mod_4', 'mod_5', 'mod_6', 'mod_7', 'mod_8');
      DELETE FROM module_lessons WHERE module_id IN ('mod_1', 'mod_2', 'mod_3', 'mod_4', 'mod_5', 'mod_6', 'mod_7', 'mod_8') OR lesson_id IN ('les_1', 'les_2', 'les_3', 'les_4', 'les_5', 'les_6', 'les_7', 'les_8');
      DELETE FROM lessons WHERE id IN ('les_1', 'les_2', 'les_3', 'les_4', 'les_5', 'les_6', 'les_7', 'les_8');
      DELETE FROM modules WHERE id IN ('mod_1', 'mod_2', 'mod_3', 'mod_4', 'mod_5', 'mod_6', 'mod_7', 'mod_8');
      DELETE FROM courses WHERE id IN ('crs_1', 'crs_2', 'crs_3', 'crs_4', 'crs_5', 'crs_6', 'crs_cs_ai', 'crs_sci_math', 'crs_commerce_mgmt', 'crs_humanities_arts', 'mgmt-p2', 'mgmt-p3', 'mgmt-common', 'cs-p2', 'cs-p3', 'crs_cs-genai', 'crs_cs-agentic', 'crs_cs-p1', 'crs_cs-common', 'crs_sci-p1', 'crs_sci-p2', 'crs_mgmt-p1', 'crs_arts-p1');
    `);

    const foundationalCourses = [
      // --- GROUP 01: Computer Science & IT (4 Courses) ---
      {
        id: "cs-genai",
        title: "Generative AI & LLM Systems Engineering",
        slug: "cs-genai",
        short_description: "Master enterprise-grade LLM architectures, production RAG pipelines, vector databases (Qdrant), PEFT/LoRA fine-tuning, and high-throughput vLLM serving.",
        price_paise: 299900,
        mrp_paise: 999900,
        status: "PUBLISHED",
        metadata: {
          group: "group-1",
          pathwayId: "cs-genai",
          badge: "GROUP 01 • PATHWAY 01",
          shortName: "CS & IT: Generative AI",
          target: "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT",
          duration: "3 Months",
          level: "Intermediate to Advanced",
          roles: ["Generative AI Engineer", "LLMOps Specialist", "AI Application Developer", "Prompt Systems Architect"],
          tools: ["Python", "PyTorch", "Hugging Face", "LangChain", "LlamaIndex", "Qdrant", "vLLM", "LoRA / PEFT"]
        }
      },
      {
        id: "cs-agentic",
        title: "Agentic AI & Autonomous Multi-Agent Systems",
        slug: "cs-agentic",
        short_description: "Design and deploy autonomous AI agents with reasoning loops, dynamic tool calling, stateful graphs in LangGraph, multi-agent swarms with CrewAI, and Model Context Protocol (MCP).",
        price_paise: 299900,
        mrp_paise: 999900,
        status: "PUBLISHED",
        metadata: {
          group: "group-1",
          pathwayId: "cs-agentic",
          badge: "GROUP 01 • PATHWAY 02",
          shortName: "CS & IT: Agentic AI",
          target: "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT",
          duration: "3 Months",
          level: "Intermediate to Advanced",
          roles: ["Agentic AI Engineer", "Autonomous Systems Developer", "AI Automation Architect", "Multi-Agent Systems Engineer"],
          tools: ["LangGraph", "CrewAI", "AutoGen", "MCP", "Docker Sandboxes", "LiteLLM", "Pydantic", "Phoenix"]
        }
      },
      {
        id: "cs-p1",
        title: "Machine Learning Engineering in Production",
        slug: "cs-p1",
        short_description: "End-to-end ML engineering: data pipelines, deep learning, FastAPI model serving, Docker MLOps, and Generative AI/RAG architectures.",
        price_paise: 299900,
        mrp_paise: 999900,
        status: "PUBLISHED",
        metadata: {
          group: "group-1",
          pathwayId: "cs-p1",
          badge: "GROUP 01 • PATHWAY 03",
          shortName: "CS & IT: ML Engineering",
          target: "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT",
          duration: "3 Months",
          level: "Intermediate",
          roles: ["ML Engineer", "AI Backend Developer", "MLOps Specialist"],
          tools: ["Python", "NumPy", "Pandas", "PyTorch", "FastAPI", "Docker", "RAG"]
        }
      },
      {
        id: "cs-common",
        title: "AI Entrepreneurship & Innovation",
        slug: "cs-common",
        short_description: "Structured incubator track teaching students how to convert AI technical capability into validated commercial products and startups.",
        price_paise: 59900,
        mrp_paise: 299900,
        status: "PUBLISHED",
        metadata: {
          group: "group-1",
          pathwayId: "cs-common",
          badge: "GROUP 01 • WEEKEND",
          shortName: "CS & IT: AI Entrepreneurship",
          target: "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT",
          duration: "Weekend Track",
          level: "All Students",
          roles: ["AI Product Manager", "Startup Founder", "Innovation Lead"],
          tools: ["MVP Prototyping", "Business Model Canvas", "Pitch Decks", "Unit Economics"]
        }
      },

      // --- GROUP 02: Science & Mathematics (2 Courses) ---
      {
        id: "sci-p1",
        title: "Scientific Machine Learning for Basic Sciences (BSc Physics | BSc Maths)",
        slug: "sci-p1",
        short_description: "Core progression: Mathematics → Python → Scientific Computing → Machine Learning → Deep Learning → Scientific AI → Capstone. Formulate differential equations as learning constraints, implement PINNs via PyTorch autograd, and solve forward/inverse problems.",
        price_paise: 299900,
        mrp_paise: 899900,
        status: "PUBLISHED",
        metadata: {
          group: "group-2",
          pathwayId: "sci-p1",
          badge: "GROUP 02 • PATHWAY 01",
          shortName: "Science & Math: SciML & AI",
          target: "Physics • Mathematics • Statistics • Chemistry • Engineering • Quantitative Science",
          duration: "6 Months",
          level: "Undergraduate → Early Professional",
          roles: ["Scientific AI Researcher", "Computational Data Scientist", "SciML / PINNs Engineer", "Simulation & Modeling Specialist", "Quantitative Analyst"],
          tools: ["Python", "PyTorch", "SciPy", "NumPy", "PINNs", "Autograd", "ODEs/PDEs", "DeepONet", "FNO", "Jupyter"]
        }
      },
      {
        id: "sci-p2",
        title: "Mathematics + AI / Computational Intelligence",
        slug: "sci-p2",
        short_description: "Rigorous mathematics-oriented pathway focusing on mathematical proofs, optimization theory, statistical learning, and computational algorithms.",
        price_paise: 150000,
        mrp_paise: 599900,
        status: "PUBLISHED",
        metadata: {
          group: "group-2",
          pathwayId: "sci-p2",
          badge: "GROUP 02 • PATHWAY 02",
          shortName: "Science & Math: Computational Math",
          target: "Mathematics & Statistics Majors",
          duration: "3 Months",
          level: "Mathematics & Statistics Majors",
          roles: ["Quantitative Analyst", "Statistical Model Engineer", "Algorithm Researcher"],
          tools: ["Python", "Linear Algebra", "Convex Optimization", "Monte Carlo", "SymPy"]
        }
      },

      // --- GROUP 03: Commerce, BBA & Management (1 Course) ---
      {
        id: "mgmt-p1",
        title: "Business Analytics & Data Engineering",
        slug: "mgmt-p1",
        short_description: "Equips business students with advanced Excel, SQL, modern data engineering (ETL, Parquet, DuckDB), Power BI, and Generative AI.",
        price_paise: 200000,
        mrp_paise: 699900,
        status: "PUBLISHED",
        metadata: {
          group: "group-3",
          pathwayId: "mgmt-p1",
          badge: "GROUP 03 • PATHWAY 01",
          shortName: "Commerce: Business Analytics",
          target: "B.Com • BBA • M.Com • MBA • Economics • Finance",
          duration: "3 Months",
          level: "Undergraduate / Postgraduate",
          roles: ["Business Intelligence Analyst", "Data Engineer for Analytics", "Corporate Strategist"],
          tools: ["Excel", "SQL", "DuckDB", "Power BI", "ETL", "Prompt Engineering"]
        }
      },

      // --- GROUP 04: BA, Humanities & Other Disciplines (1 Course) ---
      {
        id: "arts-p1",
        title: "Applied AI for Humanities, Research & Careers",
        slug: "arts-p1",
        short_description: "Elite professional program: prompt engineering, AI research methods, automated content, executive communication, and career mastery.",
        price_paise: 99900,
        mrp_paise: 399900,
        status: "PUBLISHED",
        metadata: {
          group: "group-4",
          pathwayId: "arts-p1",
          badge: "GROUP 04 • PATHWAY 01",
          shortName: "Humanities: Applied AI",
          target: "BA • Fine Arts • Education • Law • All Non-Tech Majors",
          duration: "3 Months",
          level: "All Students (No Coding Required)",
          roles: ["AI Operations Lead", "Prompt Design Consultant", "Technical Content Architect", "Executive Research Analyst"],
          tools: ["Claude 3.5", "ChatGPT Plus", "Midjourney", "Notion AI", "Perplexity", "Make/Zapier", "Prompt Engineering"]
        }
      },

      // --- WORKSHOP / MASTERCLASS (1 Course) ---
      {
        id: "ai-masterclass",
        title: "AI Revolution & Agentic Engineering Masterclass (2-Hour Intensive)",
        slug: "ai-masterclass",
        short_description: "Live 2-Hour Intensive Masterclass on Advanced AI Prompting & Context Engineering.",
        price_paise: 3900,
        mrp_paise: 99900,
        status: "PUBLISHED",
        metadata: {
          group: "workshop",
          pathwayId: "ai-masterclass",
          badge: "MASTERCLASS",
          shortName: "AI Masterclass",
          target: "All Disciplines & Enthusiasts",
          duration: "2 Hours Live",
          level: "All Disciplines",
          roles: ["Prompt Engineer", "AI Workflow Designer", "Power User"],
          tools: ["ChatGPT", "Claude 3.5", "Gemini", "Context Engineering"]
        }
      }
    ];

    for (const c of foundationalCourses) {
      await pool.query(
        `INSERT INTO courses (id, title, slug, short_description, price_paise, mrp_paise, status, metadata, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7::content_status, $8, TRUE)
         ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             short_description = EXCLUDED.short_description,
             price_paise = EXCLUDED.price_paise,
             mrp_paise = EXCLUDED.mrp_paise,
             status = EXCLUDED.status,
             metadata = EXCLUDED.metadata,
             is_active = TRUE`,
        [
          c.id,
          c.title,
          c.slug,
          c.short_description,
          c.price_paise,
          c.mrp_paise,
          c.status,
          JSON.stringify(c.metadata)
        ]
      );
    }
    console.log(`[Seed:System] Synchronized ${foundationalCourses.length} foundational courses across Groups 1-4 and AI Masterclass.`);

    // 5. Seed Starter Promotional Discount Coupons
    await pool.query(`
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_item_ids jsonb DEFAULT '[]'::jsonb NOT NULL;
    `);

    const starterCoupons = [
      {
        code: "UNISOLE20",
        description: "Official Campus Launch 20% Discount (All Courses)",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderPaise: 0,
        maxDiscountPaise: 200000,
        maxUses: 1000,
        applicableItemIds: [],
        isActive: true,
      },
      {
        code: "EARLYBIRD500",
        description: "Early Bird Flat ₹500 Discount on Flagship Engineering & Analytics Tracks",
        discountType: "FLAT",
        discountValue: 50000,
        minOrderPaise: 100000,
        maxDiscountPaise: null,
        maxUses: 500,
        applicableItemIds: ["cs-genai", "cs-agentic", "cs-p1", "mgmt-p1"],
        isActive: true,
      },
    ];

    for (const cp of starterCoupons) {
      await pool.query(
        `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_paise, max_discount_paise, max_uses, applicable_item_ids, is_active)
         VALUES ($1, $2, $3::discount_type, $4, $5, $6, $7, $8, TRUE)
         ON CONFLICT (code) DO UPDATE
         SET description = EXCLUDED.description,
             discount_type = EXCLUDED.discount_type,
             discount_value = EXCLUDED.discount_value,
             min_order_paise = EXCLUDED.min_order_paise,
             max_discount_paise = EXCLUDED.max_discount_paise,
             max_uses = EXCLUDED.max_uses,
             applicable_item_ids = EXCLUDED.applicable_item_ids,
             is_active = TRUE`,
        [
          cp.code,
          cp.description,
          cp.discountType,
          cp.discountValue,
          cp.minOrderPaise,
          cp.maxDiscountPaise,
          cp.maxUses,
          JSON.stringify(cp.applicableItemIds),
        ]
      );
    }
    console.log(`[Seed:System] Synchronized ${starterCoupons.length} promotional discount coupons.`);

    console.log("[Seed:System] Foundational system data synchronization completed successfully.");
  } catch (err) {
    console.error("[Seed:System] Error seeding system data:", err);
    throw err;
  }
}

if (require.main === module) {
  seedSystemData()
    .then(() => pool.end())
    .catch((err) => {
      console.error("[Seed:System] Fatal error:", err);
      pool.end().then(() => process.exit(1));
    });
}
