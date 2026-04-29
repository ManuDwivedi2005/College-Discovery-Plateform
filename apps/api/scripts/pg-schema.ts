import dotenv from "dotenv";
import { Pool } from "pg";

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
    console.log("Applying schema...");
    await client.query(`
      -- Create colleges table
      CREATE TABLE IF NOT EXISTS colleges (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        name text NOT NULL,
        location text NOT NULL,
        state text NOT NULL,
        ownership text NOT NULL,
        fees_annual integer NOT NULL,
        rating float NOT NULL,
        placement_rate float NOT NULL,
        median_package_lpa float NOT NULL,
        highest_package_lpa float NOT NULL,
        established_year integer NOT NULL,
        overview text NOT NULL,
        exams text[] NOT NULL DEFAULT '{}',
        tags text[] NOT NULL DEFAULT '{}',
        recruiters text[] NOT NULL DEFAULT '{}',
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_colleges_location ON colleges(location);
      CREATE INDEX IF NOT EXISTS idx_colleges_fees_annual ON colleges(fees_annual);
      CREATE INDEX IF NOT EXISTS idx_colleges_rating ON colleges(rating);

      CREATE TABLE IF NOT EXISTS courses (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        college_id bigint NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        name text NOT NULL,
        duration text NOT NULL,
        annual_fees integer NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);

      CREATE TABLE IF NOT EXISTS reviews (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        college_id bigint NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        author text NOT NULL,
        role text NOT NULL,
        rating float NOT NULL,
        year integer NOT NULL,
        comment text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_reviews_college_id ON reviews(college_id);
    `);

    console.log("Schema applied.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
