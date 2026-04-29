import type { College, CollegeQuery } from "@college/shared";

const apiBaseUrl =
  process.env.COLLEGE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

type CollegeListResponse = {
  data: College[];
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

type CollegeDetailResponse = {
  data: College & {
    feesLabel: string;
  };
};

type CompareResponse = {
  data: College[];
  columns: Array<keyof College>;
};

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}

function buildQuery(query: CollegeQuery): string {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.location) params.set("location", query.location);
  if (query.course) params.set("course", query.course);
  if (typeof query.maxFees === "number") params.set("maxFees", String(query.maxFees));
  if (typeof query.page === "number") params.set("page", String(query.page));
  if (typeof query.limit === "number") params.set("limit", String(query.limit));

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function fetchColleges(query: CollegeQuery) {
  return requestJson<CollegeListResponse>(`/colleges${buildQuery(query)}`);
}

export async function fetchCollege(slug: string) {
  return requestJson<CollegeDetailResponse>(`/colleges/${slug}`);
}

export async function fetchComparison(slugs: string[]) {
  return requestJson<CompareResponse>(`/compare?slugs=${encodeURIComponent(slugs.join(","))}`);
}

export async function fetchCollegeOptions() {
  return requestJson<{ data: Array<{ slug: string; name: string }> }>(`/colleges/options`);
}

export async function fetchCollegeLocations() {
  return requestJson<{ data: string[] }>(`/colleges/locations`);
}
