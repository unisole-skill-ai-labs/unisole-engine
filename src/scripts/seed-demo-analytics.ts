import { pool } from "../db";

async function seedRichDemoData() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_DEMO_SEED) {
    console.error("⛔ FATAL: Attempted to run mock demo seed script in PRODUCTION! Aborting.");
    process.exit(1);
  }

  try {
    console.log("[Seed:Demo] Populating rich demonstration data for universities...");

    // Get Colleges
    const collegesRes = await pool.query("SELECT id, name, slug FROM colleges");
    const collegesMap = new Map(collegesRes.rows.map((c) => [c.slug, c]));

    const pathwaysRes = await pool.query("SELECT id, title FROM pathways ORDER BY id ASC");
    const p1 = pathwaysRes.rows[0]?.id || "pwy_1";
    const p2 = pathwaysRes.rows[1]?.id || p1;
    const p3 = pathwaysRes.rows[2]?.id || p1;

    // DTU
    const dtu = collegesMap.get("delhi-technological-university");
    if (dtu) {
      await pool.query("DELETE FROM presentation_leads WHERE college_id = $1", [dtu.id]);
      
      const dtuLeads = [
        { name: "Aarav Sharma", phone: "9811234501", branch: "Computer Science & Engineering", year: "3rd Year", score: 980, rank: 1, session: "sess_dtu_1" },
        { name: "Priyanshu Verma", phone: "9811234502", branch: "Computer Science & Engineering", year: "3rd Year", score: 920, rank: 2, session: "sess_dtu_1" },
        { name: "Ananya Iyer", phone: "9811234503", branch: "Artificial Intelligence & Machine Learning", year: "2nd Year", score: 890, rank: 3, session: "sess_dtu_1" },
        { name: "Rohan Gupta", phone: "9811234504", branch: "Information Technology", year: "4th Year", score: 860, rank: 4, session: "sess_dtu_1" },
        { name: "Sneha Patel", phone: "9811234505", branch: "Artificial Intelligence & Machine Learning", year: "3rd Year", score: 830, rank: 5, session: "sess_dtu_1" },
        { name: "Vikrant Malhotra", phone: "9811234506", branch: "Electronics & Communication Engineering", year: "2nd Year", score: 790, rank: 6, session: "sess_dtu_1" },
        { name: "Divya Nair", phone: "9811234507", branch: "Data Science & Big Data Analytics", year: "3rd Year", score: 750, rank: 7, session: "sess_dtu_2" },
        { name: "Ayush Mehra", phone: "9811234508", branch: "Mechanical Engineering", year: "4th Year", score: 710, rank: 8, session: "sess_dtu_2" },
        { name: "Tanvi Saxena", phone: "9811234509", branch: "Computer Science & Engineering", year: "2nd Year", score: 670, rank: 9, session: "sess_dtu_2" },
        { name: "Kunal Rao", phone: "9811234510", branch: "Electronics & Communication Engineering", year: "3rd Year", score: 620, rank: 10, session: "sess_dtu_2" },
        { name: "Shreya Sen", phone: "9811234511", branch: "Information Technology", year: "3rd Year", score: 590, rank: 11, session: "sess_dtu_2" },
        { name: "Harsh Vardhan", phone: "9811234512", branch: "Mechanical Engineering", year: "4th Year", score: 540, rank: 12, session: "sess_dtu_2" },
        { name: "Riddhima Sethi", phone: "9811234513", branch: "Computer Science & Engineering", year: "1st Year", score: 510, rank: 13, session: "sess_dtu_1" },
        { name: "Nikhil Joshi", phone: "9811234514", branch: "Electrical & Electronics Engineering", year: "2nd Year", score: 480, rank: 14, session: "sess_dtu_1" },
        { name: "Kavya Menon", phone: "9811234515", branch: "Artificial Intelligence & Machine Learning", year: "2nd Year", score: 450, rank: 15, session: "sess_dtu_1" },
      ];

      for (const l of dtuLeads) {
        await pool.query(
          `INSERT INTO presentation_leads (session_id, college_id, name, phone, branch, year_of_study, total_score, rank)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [l.session, dtu.id, l.name, l.phone, l.branch, l.year, l.score, l.rank]
        );

        const userRes = await pool.query(
          `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
           VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
           ON CONFLICT (phone) DO UPDATE SET college_id = $3, college_name = $4, branch = $5
           RETURNING id`,
          [l.phone, l.name, dtu.id, dtu.name, l.branch]
        );

        if (userRes.rows.length > 0 && l.rank <= 8) {
          const uid = userRes.rows[0].id;
          const assignedPwy = l.rank % 3 === 0 ? p3 : l.rank % 2 === 0 ? p2 : p1;
          await pool.query(
            `INSERT INTO enrollments (user_id, pathway_id, status, enrolled_at)
             VALUES ($1, $2, 'ACTIVE', NOW() - INTERVAL '2 days')
             ON CONFLICT DO NOTHING`,
            [uid, assignedPwy]
          );
        }
      }
      console.log("[Seed] DTU leads and enrollments populated.");
    }

    // IIT Delhi
    const iitd = collegesMap.get("iit-delhi");
    if (iitd) {
      await pool.query("DELETE FROM presentation_leads WHERE college_id = $1", [iitd.id]);
      
      const iitdLeads = [
        { name: "Siddharth Deshmukh", phone: "9822345601", branch: "Computer Science & Engineering", year: "4th Year", score: 990, rank: 1 },
        { name: "Meera Krishnan", phone: "9822345602", branch: "Artificial Intelligence & Machine Learning", year: "3rd Year", score: 950, rank: 2 },
        { name: "Aditya Joshi", phone: "9822345603", branch: "Electronics & Communication Engineering", year: "3rd Year", score: 900, rank: 3 },
        { name: "Riya Kapoor", phone: "9822345604", branch: "Data Science & Big Data Analytics", year: "2nd Year", score: 850, rank: 4 },
        { name: "Tushar Bansal", phone: "9822345605", branch: "Computer Science & Engineering", year: "3rd Year", score: 810, rank: 5 },
        { name: "Ishaan Mathur", phone: "9822345606", branch: "Information Technology", year: "2nd Year", score: 770, rank: 6 },
        { name: "Sanya Chopra", phone: "9822345607", branch: "Mechanical Engineering", year: "3rd Year", score: 720, rank: 7 },
      ];

      for (const l of iitdLeads) {
        await pool.query(
          `INSERT INTO presentation_leads (session_id, college_id, name, phone, branch, year_of_study, total_score, rank)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          ["sess_iitd_1", iitd.id, l.name, l.phone, l.branch, l.year, l.score, l.rank]
        );

        const userRes = await pool.query(
          `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
           VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
           ON CONFLICT (phone) DO UPDATE SET college_id = $3, college_name = $4, branch = $5
           RETURNING id`,
          [l.phone, l.name, iitd.id, iitd.name, l.branch]
        );

        if (userRes.rows.length > 0 && l.rank <= 5) {
          const uid = userRes.rows[0].id;
          await pool.query(
            `INSERT INTO enrollments (user_id, pathway_id, status, enrolled_at)
             VALUES ($1, $2, 'ACTIVE', NOW() - INTERVAL '3 days')
             ON CONFLICT DO NOTHING`,
            [uid, p2]
          );
        }
      }
      console.log("[Seed] IIT Delhi leads and enrollments populated.");
    }

    // NSUT
    const nsut = collegesMap.get("nsut-delhi");
    if (nsut) {
      await pool.query("DELETE FROM presentation_leads WHERE college_id = $1", [nsut.id]);
      
      const nsutLeads = [
        { name: "Varun Singhal", phone: "9833456701", branch: "Computer Science & Engineering", year: "3rd Year", score: 940, rank: 1 },
        { name: "Neha Aggarwal", phone: "9833456702", branch: "Information Technology", year: "3rd Year", score: 890, rank: 2 },
        { name: "Abhinav Kaushik", phone: "9833456703", branch: "Electronics & Communication Engineering", year: "2nd Year", score: 820, rank: 3 },
        { name: "Pooja Hegde", phone: "9833456704", branch: "Artificial Intelligence & Machine Learning", year: "1st Year", score: 760, rank: 4 },
        { name: "Dhruv Rawat", phone: "9833456705", branch: "Mechanical Engineering", year: "4th Year", score: 680, rank: 5 },
      ];

      for (const l of nsutLeads) {
        await pool.query(
          `INSERT INTO presentation_leads (session_id, college_id, name, phone, branch, year_of_study, total_score, rank)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          ["sess_nsut_1", nsut.id, l.name, l.phone, l.branch, l.year, l.score, l.rank]
        );

        const userRes = await pool.query(
          `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
           VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
           ON CONFLICT (phone) DO UPDATE SET college_id = $3, college_name = $4, branch = $5
           RETURNING id`,
          [l.phone, l.name, nsut.id, nsut.name, l.branch]
        );

        if (userRes.rows.length > 0 && l.rank <= 3) {
          const uid = userRes.rows[0].id;
          await pool.query(
            `INSERT INTO enrollments (user_id, pathway_id, status, enrolled_at)
             VALUES ($1, $2, 'ACTIVE', NOW() - INTERVAL '5 days')
             ON CONFLICT DO NOTHING`,
            [uid, p1]
          );
        }
      }
      console.log("[Seed] NSUT leads and enrollments populated.");
    }

    console.log("[Seed] All university analytics data successfully seeded!");
  } catch (err) {
    console.error("[Seed] Error:", err);
  } finally {
    await pool.end();
  }
}

seedRichDemoData();
