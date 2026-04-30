import dotenv from "dotenv";
import { Pool } from "pg";
import { colleges as baseColleges } from "../../../packages/shared/src/index";

dotenv.config({ path: "./.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in apps/api/.env");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function run() {
  const client = await pool.connect();
  try {
    console.log("Seeding 50 colleges...");
    await client.query("BEGIN");

    // Clean existing data
    await client.query("TRUNCATE reviews, courses, colleges, users, questions, answers RESTART IDENTITY CASCADE");

    // Insert dummy user
    const dummyUserRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ["Dummy User", "dummy@example.com", "hashedpassword", "student", true]
    );
    const dummyUserId = dummyUserRes.rows[0].id;

    for (const college of baseColleges) {
      const slug = college.slug;
      const name = college.name;
      const location = college.location;
      const state = college.state;
      let ownership = "other";
      if (college.ownership.toLowerCase().includes("public") || college.ownership.toLowerCase().includes("gov")) {
        ownership = "gov";
      } else if (college.ownership.toLowerCase().includes("private")) {
        ownership = "private";
      }
      const fees_annual = college.feesAnnual;
      const rating = college.rating;
      const placement_rate = college.placementRate;
      const median_package_lpa = college.medianPackageLpa;
      const highest_package_lpa = college.highestPackageLpa;
      const established_year = college.establishedYear;
      const overview = college.overview;
      const exams = college.exams;
      const tags = college.tags;
      const recruiters = college.recruiters;
      const website_url = `https://www.${slug}.edu.in`;

      const insertCollege = `
        INSERT INTO colleges (slug, name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams, tags, recruiters, website_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING id`;

      const vals = [slug, name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams, tags, recruiters, website_url];
      const res = await client.query(insertCollege, vals);
      const collegeId = res.rows[0].id;

      // insert courses
      for (const c of college.courses) {
        await client.query(
          `INSERT INTO courses (college_id, name, duration, annual_fees) VALUES ($1,$2,$3,$4)`,
          [collegeId, c.name, c.duration, c.annualFees]
        );
      }

      // insert reviews
      for (const r of college.reviews) {
        await client.query(
          `INSERT INTO reviews (college_id, user_id, author, role, rating, year, comment) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [collegeId, dummyUserId, r.author, "student", r.rating, r.year, r.comment]
        );
      }
    }

    // Insert multiple users for varied Q&A
    const users = await Promise.all([
      client.query(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING id`, ["Rahul Sharma", "rahul@test.com", "hash", "student"]),
      client.query(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING id`, ["Priya Patel", "priya@test.com", "hash", "student"]),
      client.query(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING id`, ["Prof. Anand", "anand@test.com", "hash", "college management"]),
      client.query(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING id`, ["Sneha Gupta", "sneha@test.com", "hash", "alumni"]),
    ]);

    const userIds = users.map(u => u.rows[0].id);

    const realQA = [
      { title: "What is the difference between CSE and IT engineering?", content: "I am confused between choosing Computer Science and Information Technology. Which has better placement scope?", qUserId: userIds[0], ansContent: "CSE focuses more on hardware and algorithms, whereas IT focuses on networking, software, and databases. Both have almost identical placement opportunities in top tech companies.", ansUserId: userIds[3] },
      { title: "Is dropping a year for JEE Advanced worth it?", content: "I got 92 percentile in JEE Main but want IIT. Should I drop a year?", qUserId: userIds[1], ansContent: "Dropping a year is worth it if you are absolutely focused. However, with 92 percentile, you can still get into good NITs or state colleges. Consider your mental stamina before deciding.", ansUserId: userIds[2] },
      { title: "How are the placements at NIT Surathkal compared to Trichy?", content: "Getting ECE in Surathkal and Mech in Trichy. What should I prefer?", qUserId: userIds[0], ansContent: "Always prefer branches like ECE over Mech if you want IT jobs. Surathkal's ECE placements are fantastic, with median packages often crossing 15 LPA.", ansUserId: userIds[3] },
      { title: "Can I get an education loan without collateral?", content: "My annual fees will be around 12 Lakhs. Can I get a loan without any property collateral?", qUserId: userIds[1], ansContent: "Yes, under the Vidyalakshmi scheme and for premier institutes (like IITs/IIMs), banks offer up to 20 Lakhs without collateral. For other private colleges, the limit is usually 7.5 Lakhs.", ansUserId: userIds[2] },
      { title: "Are private colleges like BITS Pilani better than lower NITs?", content: "I am getting BITS Hyderabad EEE and NIT Silchar ECE. Which is a better choice?", qUserId: userIds[0], ansContent: "BITS Pilani (even Hyderabad campus) has unparalleled alumni network, zero attendance policy, and top-tier placements. It is generally considered better than lower NITs if fees are not an issue.", ansUserId: userIds[3] }
    ];

    for (const qa of realQA) {
      const q = await client.query(
        `INSERT INTO questions (user_id, title, content) VALUES ($1, $2, $3) RETURNING id`,
        [qa.qUserId, qa.title, qa.content]
      );
      await client.query(
        `INSERT INTO answers (question_id, user_id, content) VALUES ($1, $2, $3)`,
        [q.rows[0].id, qa.ansUserId, qa.ansContent]
      );
    }

    // Add more varied dummy Q&A to reach 25 items
    for (let i = 6; i <= 25; i++) {
      const qUserId = userIds[i % 4];
      const ansUserId = userIds[(i + 1) % 4];
      const title = `What is the admission process for B.Tech in Data Science (Batch ${i})?`;
      const content = `I am looking for genuine reviews about the Data Science curriculum and its industry relevance compared to traditional CS. Any insights would be appreciated.`;
      
      const q = await client.query(
        `INSERT INTO questions (user_id, title, content) VALUES ($1, $2, $3) RETURNING id`,
        [qUserId, title, content]
      );

      const answerCount = i % 2 === 0 ? 2 : 1; // 1 or 2 answers
      for (let j = 0; j < answerCount; j++) {
        const aUserId = userIds[(j + 2) % 4];
        const ansContent = `The curriculum is heavily focused on Statistics and Machine Learning. Highly recommended if you want to pursue AI. The demand is increasing exponentially. (Response ${j+1})`;
        await client.query(
          `INSERT INTO answers (question_id, user_id, content) VALUES ($1, $2, $3)`,
          [q.rows[0].id, aUserId, ansContent]
        );
      }
    }

    await client.query("COMMIT");
    console.log(`Seeded ${baseColleges.length} unique colleges.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
