import { pool } from "../db";

interface DummyBranch {
  name: string;
  code: string;
  description: string;
  students: Array<{
    name: string;
    phone: string;
  }>;
}

interface DummyCollege {
  name: string;
  shortName: string;
  slug: string;
  description: string;
  branches: DummyBranch[];
}

const DUMMY_COLLEGES: DummyCollege[] = [
  {
    name: "Government Degree College Theog",
    shortName: "GDC Theog",
    slug: "theog-college",
    description: "Affiliated with Himachal Pradesh University, Shimla, offering undergraduate programs in Arts, Commerce, Science, Computer Applications, and Business Administration.",
    branches: [
      {
        name: "BA",
        code: "BA",
        description: "Bachelor of Arts with multidisciplinary electives and skill development.",
        students: [],
      },
      {
        name: "BBA",
        code: "BBA",
        description: "Bachelor of Business Administration focusing on management and entrepreneurship.",
        students: [],
      },
      {
        name: "BCOM",
        code: "BCOM",
        description: "Bachelor of Commerce covering accounting, taxation, and financial markets.",
        students: [],
      },
      {
        name: "BCA",
        code: "BCA",
        description: "Bachelor of Computer Applications with modern software development and web technologies.",
        students: [],
      },
      {
        name: "BSC Non-Med",
        code: "BSC_NM",
        description: "Bachelor of Science (Non-Medical) in Physics, Chemistry, and Mathematics.",
        students: [],
      },
      {
        name: "BSC Med",
        code: "BSC_MED",
        description: "Bachelor of Science (Medical) in Zoology, Botany, and Chemistry.",
        students: [],
      },
      {
        name: "Others",
        code: "OTHERS",
        description: "Other / Multidisciplinary and vocational certificate streams.",
        students: [],
      },
    ],
  },
  {
    name: "Delhi Technological University",
    shortName: "DTU",
    slug: "delhi-technological-university",
    description: "Premier state engineering university located in Rohini, New Delhi, renowned for tech innovation and startup incubation.",
    branches: [
      {
        name: "Computer Science & Engineering",
        code: "CSE",
        description: "Focuses on algorithms, operating systems, cloud architecture, and full-stack software development.",
        students: [
          { name: "Aarav Sharma", phone: "+919811234501" },
          { name: "Priyanshu Verma", phone: "+919811234502" },
          { name: "Tanvi Saxena", phone: "+919811234509" },
          { name: "Riddhima Sethi", phone: "+919811234513" },
          { name: "Kabir Mathur", phone: "+919811234521" },
        ],
      },
      {
        name: "Artificial Intelligence & Data Science",
        code: "AIDS",
        description: "Specialization in deep learning, natural language processing, computer vision, and big data pipelines.",
        students: [
          { name: "Ananya Iyer", phone: "+919811234503" },
          { name: "Sneha Patel", phone: "+919811234505" },
          { name: "Kavya Menon", phone: "+919811234515" },
          { name: "Devansh Rastogi", phone: "+919811234522" },
        ],
      },
      {
        name: "Electronics & Communication Engineering",
        code: "ECE",
        description: "Covers VLSI design, embedded systems, IoT architecture, and high-frequency communication.",
        students: [
          { name: "Vikrant Malhotra", phone: "+919811234506" },
          { name: "Kunal Rao", phone: "+919811234510" },
          { name: "Ishani Mukherjee", phone: "+919811234523" },
        ],
      },
      {
        name: "Information Technology",
        code: "IT",
        description: "Enterprise software architecture, network security, devops pipelines, and web engineering.",
        students: [
          { name: "Rohan Gupta", phone: "+919811234504" },
          { name: "Shreya Sen", phone: "+919811234511" },
          { name: "Manav Joshi", phone: "+919811234524" },
        ],
      },
      {
        name: "Mechanical Engineering",
        code: "ME",
        description: "Thermodynamics, robotics, mechatronics, CAD/CAM design, and industrial manufacturing automation.",
        students: [
          { name: "Ayush Mehra", phone: "+919811234508" },
          { name: "Harsh Vardhan", phone: "+919811234512" },
        ],
      },
    ],
  },
  {
    name: "Indian Institute of Technology Delhi",
    shortName: "IIT Delhi",
    slug: "iit-delhi",
    description: "Apex national institute of engineering & research located in Hauz Khas, New Delhi.",
    branches: [
      {
        name: "Computer Science & Engineering",
        code: "CS",
        description: "Advanced computing, distributed systems, cryptographic proofs, and AI research.",
        students: [
          { name: "Siddharth Deshmukh", phone: "+919822345601" },
          { name: "Tushar Bansal", phone: "+919822345605" },
          { name: "Meera Krishnan", phone: "+919822345602" },
          { name: "Arjun Nambiar", phone: "+919822345610" },
        ],
      },
      {
        name: "Electrical & Electronics Engineering",
        code: "EEE",
        description: "Power grids, renewable energy automation, microelectronics, and signal processing.",
        students: [
          { name: "Aditya Joshi", phone: "+919822345603" },
          { name: "Nikhil Chawla", phone: "+919822345611" },
          { name: "Pranav Aggarwal", phone: "+919822345612" },
        ],
      },
      {
        name: "Data Science & Big Data Analytics",
        code: "DS",
        description: "Statistical learning, data engineering at scale, predictive modeling, and business intelligence.",
        students: [
          { name: "Riya Kapoor", phone: "+919822345604" },
          { name: "Ishaan Mathur", phone: "+919822345606" },
          { name: "Kritika Roy", phone: "+919822345613" },
        ],
      },
      {
        name: "Mechanical Engineering",
        code: "ME",
        description: "Autonomous robotics, fluid mechanics, precision manufacturing, and thermal systems.",
        students: [
          { name: "Sanya Chopra", phone: "+919822345607" },
          { name: "Raghav Suri", phone: "+919822345614" },
        ],
      },
    ],
  },
  {
    name: "BITS Pilani - Hyderabad Campus",
    shortName: "BITS-H",
    slug: "bits-pilani-hyderabad",
    description: "Premier private technical university known for interdisciplinary curriculum and zero-attendance policy.",
    branches: [
      {
        name: "Computer Science",
        code: "CS",
        description: "Core algorithms, compiler design, full-stack systems, and web3 architectures.",
        students: [
          { name: "Dhruv Singhania", phone: "+919844112201" },
          { name: "Tara Hegde", phone: "+919844112202" },
          { name: "Yashvardhan Jain", phone: "+919844112203" },
          { name: "Megha Sundaram", phone: "+919844112204" },
        ],
      },
      {
        name: "Electronics & Communication",
        code: "ECE",
        description: "Embedded microcontrollers, wireless communications, edge computing, and robotics.",
        students: [
          { name: "Karthik Reddy", phone: "+919844112205" },
          { name: "Samaira Varma", phone: "+919844112206" },
          { name: "Nitin Bhasin", phone: "+919844112207" },
        ],
      },
      {
        name: "Data Engineering & Analytics",
        code: "DEA",
        description: "Data warehousing, modern data stack, pipeline orchestration, and MLOps.",
        students: [
          { name: "Gautam Pillai", phone: "+919844112208" },
          { name: "Ananya Somani", phone: "+919844112209" },
        ],
      },
    ],
  },
  {
    name: "Vellore Institute of Technology",
    shortName: "VIT",
    slug: "vit-vellore",
    description: "Major technology university in Vellore, Tamil Nadu with high-placement international partnerships.",
    branches: [
      {
        name: "Computer Science & Engineering",
        code: "CSE",
        description: "Foundations of computing, cybersecurity, mobile app development, and cloud computing.",
        students: [
          { name: "Suresh Natarajan", phone: "+919855223301" },
          { name: "Pooja Hegde", phone: "+919855223302" },
          { name: "Akash Bhatia", phone: "+919855223303" },
          { name: "Ritika Sen", phone: "+919855223304" },
        ],
      },
      {
        name: "Cloud Computing & Cybersecurity",
        code: "CCC",
        description: "AWS/GCP architectures, vulnerability assessment, penetration testing, and zero trust security.",
        students: [
          { name: "Varun Nair", phone: "+919855223305" },
          { name: "Trisha Mukherjee", phone: "+919855223306" },
          { name: "Chirag Mittal", phone: "+919855223307" },
        ],
      },
      {
        name: "Robotics & Automation",
        code: "ROB",
        description: "Kinematics, sensor fusion, computer vision for robots, and industrial PLC control.",
        students: [
          { name: "Manoj Swaminathan", phone: "+919855223308" },
          { name: "Deepika Rao", phone: "+919855223309" },
        ],
      },
    ],
  },
  {
    name: "RV College of Engineering",
    shortName: "RVCE",
    slug: "rv-college-of-engineering",
    description: "Autonomous engineering college in Bengaluru with deep industry ties to Silicon Valley of India.",
    branches: [
      {
        name: "Artificial Intelligence & Machine Learning",
        code: "AIML",
        description: "Generative AI, reinforcement learning, LLM fine-tuning, and neural network engineering.",
        students: [
          { name: "Tejas Gowda", phone: "+919866334401" },
          { name: "Bhavana Shetty", phone: "+919866334402" },
          { name: "Chetan Kulkarni", phone: "+919866334403" },
        ],
      },
      {
        name: "Information Science & Engineering",
        code: "ISE",
        description: "Software engineering methodologies, distributed databases, cloud APIs, and web services.",
        students: [
          { name: "Harini Rao", phone: "+919866334404" },
          { name: "Kishore Kumar", phone: "+919866334405" },
        ],
      },
      {
        name: "Electronics & Telecommunication",
        code: "ETC",
        description: "5G networks, satellite communications, optical fiber networks, and RF design.",
        students: [
          { name: "Sanjay Prasad", phone: "+919866334406" },
          { name: "Nandini Murthy", phone: "+919866334407" },
        ],
      },
    ],
  },
];

export async function seedPartnerColleges() {
  console.log("[Seed] Starting partner colleges, branches, and students population...");

  try {
    for (const cData of DUMMY_COLLEGES) {
      // 1. Upsert College
      const clgRes = await pool.query(
        `INSERT INTO colleges (name, short_name, slug, description, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (slug) DO UPDATE 
         SET name = $1, short_name = $2, description = $4, is_active = TRUE
         RETURNING id, name`,
        [cData.name, cData.shortName, cData.slug, cData.description]
      );
      const collegeId = clgRes.rows[0].id;
      const collegeName = clgRes.rows[0].name;

      console.log(`[Seed] Synced college: ${collegeName} (${collegeId})`);

      // 2. Iterate Branches
      for (const bData of cData.branches) {
        let branchRes = await pool.query(
          `SELECT id FROM branches WHERE college_id = $1 AND (name = $2 OR code = $3) LIMIT 1`,
          [collegeId, bData.name, bData.code]
        );

        let branchId: string;
        if (branchRes.rows.length > 0) {
          branchId = branchRes.rows[0].id;
          await pool.query(
            `UPDATE branches 
             SET name = $1, code = $2, description = $3, is_active = TRUE, updated_at = NOW()
             WHERE id = $4`,
            [bData.name, bData.code, bData.description, branchId]
          );
        } else {
          const newBrn = await pool.query(
            `INSERT INTO branches (college_id, name, code, description, is_active)
             VALUES ($1, $2, $3, $4, TRUE)
             RETURNING id`,
            [collegeId, bData.name, bData.code, bData.description]
          );
          branchId = newBrn.rows[0].id;
        }

        // 3. Upsert Students
        for (const s of bData.students) {
          await pool.query(
            `INSERT INTO users (phone, name, role, college_id, college_name, branch, is_active)
             VALUES ($1, $2, 'STUDENT', $3, $4, $5, TRUE)
             ON CONFLICT (phone) DO UPDATE 
             SET name = $2, college_id = $3, college_name = $4, branch = $5, role = 'STUDENT', is_active = TRUE`,
            [s.phone, s.name, collegeId, collegeName, bData.name]
          );
        }
      }
    }

    console.log("[Seed] Partner colleges, branches, and students seeded successfully!");
  } catch (err) {
    console.error("[Seed] Error seeding partner colleges:", err);
    throw err;
  }
}

if (require.main === module) {
  seedPartnerColleges()
    .then(() => {
      console.log("[Seed] Completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed] Failed:", err);
      process.exit(1);
    });
}
