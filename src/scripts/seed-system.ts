import bcrypt from "bcryptjs";
import { pool } from "../db";
import { THEOG_COLLEGE_PPT_SLIDES } from "../data/theogDeck";
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

    // 4. Seed / Sync Foundational Courses (4 Stream Tracks + AI Masterclass)
    const foundationalCourses = [
      {
        id: "crs_cs_ai",
        title: "Computer Science & IT: Machine Learning & AI Engineering",
        slug: "cs-ai-engineering",
        short_description: "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT — Production AI engineering, full stack web systems, and MLOps deployment.",
        price_paise: 299900,
        mrp_paise: 999900,
        status: "PUBLISHED",
        metadata: {
          group: "group-1",
          badge: "GROUP 01",
          shortName: "CS & IT",
          target: "BCA • MCA • B.Sc CS/IT • B.Tech CSE/IT",
          duration: "3-6 Months",
          level: "Intermediate",
          roles: ["Machine Learning Engineer", "Full Stack AI Developer", "MLOps Engineer", "AI Solutions Architect"],
          tools: ["Python", "PyTorch", "FastAPI", "Docker", "React", "MongoDB", "LangChain", "DuckDB"]
        }
      },
      {
        id: "crs_sci_math",
        title: "Science & Mathematics: Scientific ML & Computational Intelligence",
        slug: "sciml-computational-math",
        short_description: "Physics • Mathematics • Chemistry • Biology • Applied Science — Scientific computing, PINNs, and computational research.",
        price_paise: 200000,
        mrp_paise: 699900,
        status: "PUBLISHED",
        metadata: {
          group: "group-2",
          badge: "GROUP 02",
          shortName: "Science & Math",
          target: "Physics • Mathematics • Chemistry • Biology • Applied Science",
          duration: "3 Months",
          level: "Undergraduate / Postgraduate",
          roles: ["Scientific Computing Specialist", "Computational Data Scientist", "SciML Researcher", "Quantitative Analyst"],
          tools: ["Python", "SciPy", "NumPy", "PINNs", "Differential Equations", "SymPy", "Matplotlib"]
        }
      },
      {
        id: "crs_commerce_mgmt",
        title: "Commerce, BBA & Management: Business Analytics & FinTech AI",
        slug: "business-analytics-fintech-ai",
        short_description: "B.Com • BBA • M.Com • MBA • Economics • Finance — Business analytics, SQL, modern data engineering, FinTech systems, and AI-driven decisions.",
        price_paise: 200000,
        mrp_paise: 699900,
        status: "PUBLISHED",
        metadata: {
          group: "group-3",
          badge: "GROUP 03",
          shortName: "Commerce & Finance",
          target: "B.Com • BBA • M.Com • MBA • Economics • Finance",
          duration: "3-6 Months",
          level: "Undergraduate / Postgraduate",
          roles: ["Financial AI Analyst", "Business Intelligence Developer", "FinTech Risk Specialist", "Commercial Strategist"],
          tools: ["Advanced Excel", "PostgreSQL", "DuckDB", "Power BI", "Python", "Credit Risk ML", "Tableau"]
        }
      },
      {
        id: "crs_humanities_arts",
        title: "BA & Humanities: Applied AI for Professional Careers",
        slug: "applied-ai-humanities-careers",
        short_description: "BA • Fine Arts • Education • Law • All Non-Tech Majors — Prompt engineering, AI research methods, automated content, executive communication.",
        price_paise: 99900,
        mrp_paise: 399900,
        status: "PUBLISHED",
        metadata: {
          group: "group-4",
          badge: "GROUP 04",
          shortName: "Humanities & Non-Tech",
          target: "BA • Fine Arts • Education • Law • All Non-Tech Majors",
          duration: "3 Months",
          level: "All Students (No Coding Required)",
          roles: ["AI Operations Lead", "Prompt Design Consultant", "Technical Content Architect", "Executive Research Analyst"],
          tools: ["Claude 3.5", "ChatGPT Plus", "Midjourney", "Notion AI", "Perplexity", "Make/Zapier", "Prompt Engineering"]
        }
      },
      {
        id: "crs_ai_masterclass",
        title: "AI Revolution & Agentic Engineering Masterclass (2-Hour Intensive)",
        slug: "ai-masterclass",
        short_description: "Live 2-Hour Intensive Masterclass on Advanced AI Prompting & Context Engineering.",
        price_paise: 3900,
        mrp_paise: 99900,
        status: "PUBLISHED",
        metadata: {
          group: "workshop",
          badge: "MASTERCLASS",
          shortName: "AI Masterclass",
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
    console.log(`[Seed:System] Synchronized ${foundationalCourses.length} foundational courses (4 tracks + AI Masterclass).`);

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
