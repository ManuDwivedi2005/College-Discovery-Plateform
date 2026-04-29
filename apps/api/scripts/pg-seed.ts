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
    await client.query("TRUNCATE reviews, courses, colleges RESTART IDENTITY CASCADE");

    for (const college of baseColleges) {
      const slug = college.slug;
      const name = college.name;
      const location = college.location;
      const state = college.state;
      const ownership = college.ownership;
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

      const insertCollege = `
        INSERT INTO colleges (slug, name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams, tags, recruiters)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING id`;

      const vals = [slug, name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams, tags, recruiters];
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
          `INSERT INTO reviews (college_id, author, role, rating, year, comment) VALUES ($1,$2,$3,$4,$5,$6)`,
          [collegeId, r.author, r.role, r.rating, r.year, r.comment]
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
