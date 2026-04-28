import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import {
  colleges,
  compareColleges,
  filterColleges,
  findCollegeBySlug,
  formatINR,
  paginateColleges,
} from "@college/shared";

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

app.get("/colleges", (request, response) => {
  const filters = searchSchema.parse(request.query);
  const filtered = filterColleges(filters);
  const pagination = paginateColleges(filtered, filters.page, filters.limit);

  response.json({
    data: pagination.items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
    },
    meta: {
      results: filtered.length,
      availableColleges: colleges.length,
    },
  });
});

app.get("/colleges/:slug", (request, response) => {
  const college = findCollegeBySlug(request.params.slug);

  if (!college) {
    response.status(404).json({ error: "College not found" });
    return;
  }

  response.json({
    data: {
      ...college,
      feesLabel: formatINR(college.feesAnnual),
    },
  });
});

app.get("/compare", (request, response) => {
  const { slugs } = compareSchema.parse(request.query);
  const data = compareColleges(slugs);

  response.json({
    data,
    columns: ["name", "feesAnnual", "placementRate", "rating", "location"],
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
