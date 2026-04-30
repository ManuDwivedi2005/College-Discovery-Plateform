import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { z } from "zod";
import { query } from "./db.js";
dotenv.config({ path: "./.env" });
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());
app.use(morgan("dev"));
const DEFAULT_LIMIT = 6;
function toCamel(obj) {
    if (!obj || typeof obj !== "object")
        return obj;
    const map = {
        fees_annual: "feesAnnual",
        placement_rate: "placementRate",
        median_package_lpa: "medianPackageLpa",
        highest_package_lpa: "highestPackageLpa",
        established_year: "establishedYear",
        annual_fees: "annualFees",
    };
    const out = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
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
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "failed" });
    }
});
app.get("/colleges/locations", async (_req, res) => {
    try {
        const r = await query("SELECT DISTINCT location FROM colleges ORDER BY location");
        const locations = r.rows.map((row) => row.location).filter(Boolean);
        res.json({ data: locations });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "failed" });
    }
});
app.get("/colleges", async (req, res) => {
    try {
        const parsed = searchSchema.parse(req.query);
        const pageNum = Math.max(1, Number(parsed.page || 1));
        const lim = Math.max(1, Number(parsed.limit || DEFAULT_LIMIT));
        const offset = (pageNum - 1) * lim;
        const clauses = [];
        const params = [];
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
        const rows = listRes.rows.map((r) => toCamel(r));
        res.json({ data: rows, meta: { results: listRes.rowCount, total, availableColleges }, pagination: { page: pageNum, limit: lim, total, totalPages } });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || "invalid request" });
    }
});
app.get("/colleges/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const colRes = await query(`SELECT * FROM colleges WHERE slug = $1`, [slug]);
        const college = colRes.rows[0];
        if (!college)
            return res.status(404).json({ error: "Not found" });
        const [coursesRes, reviewsRes] = await Promise.all([
            query(`SELECT id, name, duration, annual_fees FROM courses WHERE college_id = $1`, [college.id]),
            query(`SELECT author, role, rating, year, comment FROM reviews WHERE college_id = $1`, [college.id]),
        ]);
        const mapped = toCamel(college);
        mapped.courses = coursesRes.rows.map((c) => toCamel(c));
        mapped.reviews = reviewsRes.rows;
        res.json({ data: mapped });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch college" });
    }
});
app.get("/compare", async (req, res) => {
    try {
        const parsed = compareSchema.parse(req.query);
        const slugsParam = parsed.slugs || String(req.query.slugs || req.query.slug || "");
        const slugs = String(slugsParam).split(",").map((s) => s.trim()).filter(Boolean);
        if (slugs.length < 2)
            return res.status(400).json({ error: "Provide at least two slugs" });
        const placeholders = slugs.map((_, i) => `$${i + 1}`).join(",");
        const sql = `SELECT * FROM colleges WHERE slug IN (${placeholders})`;
        const resCols = await query(sql, slugs);
        const rows = resCols.rows.map((r) => toCamel(r));
        res.json({ data: rows });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || "invalid request" });
    }
});
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
//# sourceMappingURL=server.js.map