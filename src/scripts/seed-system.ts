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
