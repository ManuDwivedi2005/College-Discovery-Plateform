import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { z } from "zod";
import { query } from "./db.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { authenticateToken, generateToken, AuthRequest } from "./auth.js";
import dns from "dns";

// Force IPv4 for external connections (Fixes Render ENETUNREACH IPv6 issue with Gmail SMTP)
dns.setDefaultResultOrder('ipv4first');

dotenv.config({ path: "./.env" });

const app = express();
app.use(helmet() as any);
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());
app.use(morgan("dev"));

const DEFAULT_LIMIT = 6;

function toCamel(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const map: Record<string, string> = {
    fees_annual: "feesAnnual",
    placement_rate: "placementRate",
    median_package_lpa: "medianPackageLpa",
    highest_package_lpa: "highestPackageLpa",
    established_year: "establishedYear",
    annual_fees: "annualFees",
  };
  const out: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    const camel = map[key] ?? key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = val;
  }
  return out;
}

const searchSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  course: z.string().optional(),
  maxFees: z.preprocess((v) => (v === undefined || v === "" ? undefined : Number(v)), z.number().optional()),
  page: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().optional()),
  limit: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().optional()),
});

const compareSchema = z.object({
  slugs: z.string().optional(),
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/colleges/options", async (_req, res) => {
  try {
    const r = await query("SELECT slug, name FROM colleges ORDER BY name");
    res.json({ data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});

app.get("/colleges/locations", async (_req, res) => {
  try {
    const r = await query("SELECT DISTINCT location FROM colleges ORDER BY location");
    const locations = r.rows.map((row: any) => row.location).filter(Boolean);
    res.json({ data: locations });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed" });
  }
});

app.get("/colleges", async (req, res) => {
  try {
    const parsed = searchSchema.parse(req.query as any);
    const pageNum = Math.max(1, Number(parsed.page || 1));
    const lim = Math.max(1, Number(parsed.limit || DEFAULT_LIMIT));
    const offset = (pageNum - 1) * lim;

    const clauses: string[] = [];
    const params: any[] = [];

    if (parsed.search) {
      params.push(`%${String(parsed.search)}%`);
      clauses.push(`name ILIKE $${params.length}`);
    }
    if (parsed.location) {
      params.push(parsed.location);
      clauses.push(`location = $${params.length}`);
    }
    if (parsed.course) {
      params.push(parsed.course);
      clauses.push(`tags @> ARRAY[$${params.length}]::text[]`);
    }
    if (parsed.maxFees !== undefined) {
      params.push(parsed.maxFees);
      clauses.push(`fees_annual <= $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const countSql = `SELECT COUNT(*)::int as total FROM colleges ${where}`;
    const listSql = `SELECT * FROM colleges ${where} ORDER BY rating DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(lim, offset);
    const countRes = await query(countSql, params.slice(0, params.length - 2));
    const listRes = await query(listSql, params);
    const total = Number(countRes.rows[0]?.total || 0);
    const totalPages = Math.ceil(total / lim);
    const allCollegesRes = await query(`SELECT COUNT(*)::int as total FROM colleges`);
    const availableColleges = Number(allCollegesRes.rows[0]?.total || 0);
    const rows = listRes.rows.map((r: any) => toCamel(r));
    res.json({ data: rows, meta: { results: listRes.rowCount, total, availableColleges }, pagination: { page: pageNum, limit: lim, total, totalPages } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: (err as any).message || "invalid request" });
  }
});

app.get("/colleges/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const colRes = await query(`SELECT * FROM colleges WHERE slug = $1`, [slug]);
    const college = colRes.rows[0];
    if (!college) return res.status(404).json({ error: "Not found" });

    const [coursesRes, reviewsRes] = await Promise.all([
      query(`SELECT id, name, duration, annual_fees FROM courses WHERE college_id = $1`, [college.id]),
      query(`SELECT id, user_id, author, role, rating, year, comment FROM reviews WHERE college_id = $1 ORDER BY created_at DESC`, [college.id]),
    ]);
    const mapped = toCamel(college);
    mapped.courses = coursesRes.rows.map((c: any) => toCamel(c));
    mapped.reviews = reviewsRes.rows;
    res.json({ data: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch college" });
  }
});

app.get("/compare", async (req, res) => {
  try {
    const parsed = compareSchema.parse(req.query as any);
    const slugsParam = parsed.slugs || String(req.query.slugs || req.query.slug || "");
    const slugs = String(slugsParam).split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length < 2) return res.status(400).json({ error: "Provide at least two slugs" });
    const placeholders = slugs.map((_, i) => `$${i + 1}`).join(",");
    const sql = `SELECT * FROM colleges WHERE slug IN (${placeholders})`;
    const resCols = await query(sql, slugs);
    const rows = resCols.rows.map((r: any) => toCamel(r));
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: (err as any).message || "invalid request" });
  }
});

// --- NEW ROUTES ---

// Auth Routes
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "college management", "alumni", "research scholar"]),
});

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userRes.rows.length > 0) {
      if (userRes.rows[0].is_verified) {
        return res.status(400).json({ error: "Email already exists and is verified." });
      } else {
        // Update unverified user
        await query(`UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE email = $4`, [name, hash, role, email]);
      }
    } else {
      await query(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, false)`, [name, email, hash, role]);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
    
    await query(`INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3`, [email, otp, expiresAt]);

    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        // Force IPv4 explicitly at the socket connection layer
        tls: { rejectUnauthorized: false },
        family: 4,
      } as any);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const info = await transporter.sendMail({
      from: '"College Discovery" <no-reply@collegediscovery.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    });

    if (!process.env.SMTP_USER) {
      console.log("OTP Email sent. Preview URL: %s", nodemailer.getTestMessageUrl(info as any));
    }

    res.json({ message: "OTP sent to email. Please verify." });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

app.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = z.object({ email: z.string().email(), otp: z.string() }).parse(req.body);
    const otpRes = await query(`SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expires_at > NOW()`, [email, otp]);
    if (otpRes.rows.length === 0) return res.status(400).json({ error: "Invalid or expired OTP" });

    await query(`UPDATE users SET is_verified = true WHERE email = $1`, [email]);
    await query(`DELETE FROM otps WHERE email = $1`, [email]);

    const userRes = await query(`SELECT id, name, email, role FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    const token = generateToken(user);
    res.json({ data: { user, token } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const r = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email via OTP before logging in." });
    }
    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    res.json({ data: { user: { id: user.id, name: user.name, email: user.email }, token } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

app.get("/auth/me", authenticateToken as any, (req: AuthRequest, res: any) => {
  res.json({ data: req.user });
});

// Predictor Route
app.get("/predict", async (req, res) => {
  try {
    const { exam, rank } = z.object({ exam: z.string(), rank: z.preprocess((v) => Number(v), z.number()) }).parse(req.query);
    // Simple rule-based logic
    let minRating = 0;
    if (rank <= 5000) minRating = 4.5;
    else if (rank <= 20000) minRating = 4.0;
    else if (rank <= 50000) minRating = 3.5;
    else minRating = 3.0;

    const r = await query(`SELECT slug, name, location, rating, exams FROM colleges WHERE $1 = ANY(exams) AND rating >= $2 ORDER BY rating DESC LIMIT 10`, [exam, minRating]);
    res.json({ data: r.rows.map(toCamel) });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

// Q&A Routes
app.get("/qa", async (req, res) => {
  try {
    const r = await query(`
      SELECT q.id, q.user_id, q.title, q.content, q.created_at, u.name as author_name
      FROM questions q
      JOIN users u ON q.user_id = u.id
      ORDER BY q.created_at DESC LIMIT 50
    `);
    const questions = r.rows.map(toCamel);
    
    // Fetch answers for these questions
    if (questions.length > 0) {
      const qIds = questions.map((q: any) => q.id);
      const placeholders = qIds.map((_, i) => `$${i + 1}`).join(",");
      const aRes = await query(`
        SELECT a.id, a.user_id, a.question_id, a.content, a.created_at, u.name as author_name
        FROM answers a
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id IN (${placeholders})
        ORDER BY a.created_at ASC
      `, qIds);
      
      const answers = aRes.rows.map(toCamel);
      for (const q of questions) {
        q.answers = answers.filter((a: any) => a.questionId === q.id);
      }
    }
    
    res.json({ data: questions });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch Q&A" });
  }
});

app.post("/qa", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const { title, content } = z.object({ title: z.string().min(5), content: z.string().min(10) }).parse(req.body);
    const r = await query(`INSERT INTO questions (user_id, title, content) VALUES ($1, $2, $3) RETURNING id`, [req.user!.id, title, content]);
    res.json({ data: r.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

app.post("/qa/:id/answers", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const questionId = Number(req.params.id);
    const { content } = z.object({ content: z.string().min(2) }).parse(req.body);
    const r = await query(`INSERT INTO answers (question_id, user_id, content) VALUES ($1, $2, $3) RETURNING id`, [questionId, req.user!.id, content]);
    res.json({ data: r.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

app.delete("/qa/:id", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const id = Number(req.params.id);
    const qRes = await query(`SELECT user_id FROM questions WHERE id = $1`, [id]);
    if (qRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
    if (qRes.rows[0].user_id !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
    await query(`DELETE FROM questions WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: "Invalid request" });
  }
});

app.delete("/qa/answers/:id", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const id = Number(req.params.id);
    const qRes = await query(`SELECT user_id FROM answers WHERE id = $1`, [id]);
    if (qRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
    if (qRes.rows[0].user_id !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
    await query(`DELETE FROM answers WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: "Invalid request" });
  }
});

// Reviews Route
app.post("/colleges/:slug/reviews", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const { slug } = req.params;
    const { rating, comment } = z.object({ rating: z.number().min(1).max(5), comment: z.string().min(5) }).parse(req.body);
    
    const colRes = await query("SELECT id FROM colleges WHERE slug = $1", [slug]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: "College not found" });
    const collegeId = colRes.rows[0].id;

    const r = await query(
      "INSERT INTO reviews (college_id, user_id, author, role, rating, year, comment) VALUES ($1, $2, $3, (SELECT role FROM users WHERE id = $2), $4, $5, $6) RETURNING id",
      [collegeId, req.user!.id, req.user!.name, rating, new Date().getFullYear(), comment]
    );
    
    res.json({ data: r.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

app.delete("/colleges/:slug/reviews/:id", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const id = Number(req.params.id);
    const rRes = await query("SELECT user_id FROM reviews WHERE id = $1", [id]);
    if (rRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
    if (rRes.rows[0].user_id !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
    await query("DELETE FROM reviews WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: "Invalid request" });
  }
});

// College Registration
app.post("/colleges", authenticateToken as any, async (req: AuthRequest, res: any) => {
  try {
    const userRes = await query("SELECT role FROM users WHERE id = $1", [req.user!.id]);
    if (userRes.rows[0].role !== "college management") {
      return res.status(403).json({ error: "Only college management can register colleges." });
    }

    const { name, location, state, ownership, feesAnnual, rating, websiteUrl, exams } = z.object({
      name: z.string().min(3),
      location: z.string(),
      state: z.string(),
      ownership: z.enum(["private", "gov", "other"]),
      feesAnnual: z.number().min(0),
      rating: z.number().min(0).max(5),
      websiteUrl: z.string().url(),
      exams: z.array(z.string()),
    }).parse(req.body);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const r = await query(
      "INSERT INTO colleges (slug, name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams, website_url) VALUES ($1, $2, $3, $4, $5, $6, $7, 85, 5, 10, 2000, 'Pending full details update', $8, $9) RETURNING id, slug",
      [slug, name, location, state, ownership, feesAnnual, rating, exams, websiteUrl]
    );

    res.json({ data: r.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Invalid input" });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
