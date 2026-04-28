import { Prisma } from "@prisma/client";
import type { College as SharedCollege, CollegeQuery } from "@college/shared";
import { formatINR } from "@college/shared";
import { prisma } from "./prisma.js";

type CollegeRecord = Prisma.CollegeGetPayload<{
  include: {
    courses: true;
    reviews: true;
  };
}>;

type CollegeListResult = {
  data: SharedCollege[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    results: number;
    availableColleges: number;
  };
};

function toCollegeDTO(record: CollegeRecord): SharedCollege {
  return {
    slug: record.slug,
    name: record.name,
    location: record.location,
    state: record.state,
    ownership: record.ownership as SharedCollege["ownership"],
    feesAnnual: record.feesAnnual,
    rating: record.rating,
    placementRate: record.placementRate,
    medianPackageLpa: record.medianPackageLpa,
    highestPackageLpa: record.highestPackageLpa,
    establishedYear: record.establishedYear,
    exams: record.exams,
    tags: record.tags,
    overview: record.overview,
    courses: record.courses.map((course: CollegeRecord["courses"][number]) => ({
      name: course.name,
      duration: course.duration,
      annualFees: course.annualFees,
    })),
    recruiters: record.recruiters,
    reviews: record.reviews.map((review: CollegeRecord["reviews"][number]) => ({
      author: review.author,
      role: review.role,
      rating: review.rating,
      year: review.year,
      comment: review.comment,
    })),
  };
}

function buildWhere(query: CollegeQuery): Prisma.CollegeWhereInput {
  const where: Prisma.CollegeWhereInput = {};

  if (query.search?.trim()) {
    where.name = {
      contains: query.search.trim(),
      mode: "insensitive",
    };
  }

  if (query.location?.trim()) {
    where.location = {
      equals: query.location.trim(),
      mode: "insensitive",
    };
  }

  if (query.course?.trim()) {
    where.courses = {
      some: {
        name: {
          contains: query.course.trim(),
          mode: "insensitive",
        },
      },
    };
  }

  if (typeof query.maxFees === "number") {
    where.feesAnnual = {
      lte: query.maxFees,
    };
  }

  return where;
}

export async function listColleges(query: CollegeQuery): Promise<CollegeListResult> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 6);
  const where = buildWhere(query);
  const skip = (page - 1) * limit;

  const [total, records] = await Promise.all([
    prisma.college.count({ where }),
    prisma.college.findMany({
      where,
      include: {
        courses: true,
        reviews: true,
      },
      orderBy: [{ rating: "desc" }, { placementRate: "desc" }],
      skip,
      take: limit,
    }),
  ]);

  return {
    data: records.map(toCollegeDTO),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    meta: {
      results: total,
      availableColleges: await prisma.college.count(),
    },
  };
}

export async function getCollegeBySlug(slug: string) {
  const record = await prisma.college.findUnique({
    where: { slug },
    include: {
      courses: true,
      reviews: true,
    },
  });

  if (!record) {
    return null;
  }

  const college = toCollegeDTO(record);

  return {
    ...college,
    feesLabel: formatINR(college.feesAnnual),
  };
}

export async function getCollegeComparison(slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs)].slice(0, 3);

  if (uniqueSlugs.length === 0) {
    return [] as SharedCollege[];
  }

  const records = await prisma.college.findMany({
    where: {
      slug: {
        in: uniqueSlugs,
      },
    },
    include: {
      courses: true,
      reviews: true,
    },
  });

  const recordMap = new Map(records.map((record: CollegeRecord) => [record.slug, toCollegeDTO(record)]));

  return uniqueSlugs.map((slug) => recordMap.get(slug)).filter(Boolean) as SharedCollege[];
}
