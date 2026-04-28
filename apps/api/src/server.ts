import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import { getCollegeBySlug, getCollegeComparison, listColleges } from "./lib/college-service.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigin = process.env.CORS_ORIGIN ?? true;

const searchSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  course: z.string().optional(),
  maxFees: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const compareSchema = z.object({
  slugs: z
    .string()
    .optional()
    .transform((value) => value?.split(",").filter(Boolean) ?? []),
});

app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "college-discovery-api" });
});

app.get("/colleges", async (request, response) => {
  const filters = searchSchema.parse(request.query);
  const result = await listColleges(filters);

  response.json({
    data: result.data,
    pagination: result.pagination,
    meta: result.meta,
  });
});

app.get("/colleges/:slug", async (request, response) => {
  const college = await getCollegeBySlug(request.params.slug);

  if (!college) {
    response.status(404).json({ error: "College not found" });
    return;
  }

  response.json({
    data: {
      ...college,
      feesLabel: college.feesLabel,
    },
  });
});

app.get("/compare", async (request, response) => {
  const { slugs } = compareSchema.parse(request.query);
  const data = await getCollegeComparison(slugs);

  response.json({
    data,
    columns: ["name", "feesAnnual", "placementRate", "rating", "location"],
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
