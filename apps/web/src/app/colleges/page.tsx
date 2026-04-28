import Link from "next/link";
import { colleges, formatINR } from "@college/shared";
import { fetchColleges } from "@/lib/college-api";

export const dynamic = "force-dynamic";

const locationOptions = ["", ...new Set(colleges.map((college) => college.location))];
const courseOptions = [
  "",
  "Computer Science",
  "Artificial Intelligence",
  "Information Technology",
  "Electronics",
  "Mechanical",
];

type SearchParams = Record<string, string | string[] | undefined>;

function toValue(input: string | string[] | undefined): string {
  return typeof input === "string" ? input : "";
}

export default async function CollegesPage({ searchParams }: { searchParams: SearchParams }) {
  const search = toValue(searchParams.search);
  const location = toValue(searchParams.location);
  const course = toValue(searchParams.course);
  const maxFees = toValue(searchParams.maxFees);
  const page = Number(toValue(searchParams.page) || "1");

  const response = await fetchColleges({
    search: search || undefined,
    location: location || undefined,
    course: course || undefined,
    maxFees: maxFees ? Number(maxFees) : undefined,
    page,
    limit: 6,
  });

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (course) params.set("course", course);
    if (maxFees) params.set("maxFees", maxFees);
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/colleges${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Search and shortlist
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Discover colleges with the right balance of fees, location, and outcomes.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Search by name, narrow by location or course, and use the pagination controls
                to move through the catalog without overwhelming the page.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-3xl bg-slate-950 p-4 text-white sm:min-w-[330px]">
              <div>
                <div className="text-xl font-semibold">{response.meta.availableColleges}</div>
                <div className="text-xs text-slate-300">Total colleges</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{response.meta.results}</div>
                <div className="text-xs text-slate-300">Matching results</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{response.pagination.totalPages}</div>
                <div className="text-xs text-slate-300">Pages</div>
              </div>
            </div>
          </div>

          <form className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]" method="get">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-500">Search</span>
              <input
                name="search"
                defaultValue={search}
                placeholder="Search by college name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</div>
              <select
                name="location"
                defaultValue={location}
                className="mt-1 w-full bg-transparent text-sm outline-none"
              >
                {locationOptions.map((option) => (
                  <option key={option || "all"} value={option}>
                    {option || "All locations"}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Course</div>
              <select
                name="course"
                defaultValue={course}
                className="mt-1 w-full bg-transparent text-sm outline-none"
              >
                {courseOptions.map((option) => (
                  <option key={option || "all"} value={option}>
                    {option || "All courses"}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Max fees</div>
              <select
                name="maxFees"
                defaultValue={maxFees}
                className="mt-1 w-full bg-transparent text-sm outline-none"
              >
                <option value="">All budgets</option>
                <option value="100000">Under ₹1L</option>
                <option value="250000">Under ₹2.5L</option>
                <option value="400000">Under ₹4L</option>
                <option value="600000">Under ₹6L</option>
              </select>
            </label>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
              Apply
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {response.data.map((college) => (
            <article
              key={college.slug}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
                    {college.ownership}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight text-slate-950">
                    {college.name}
                  </h2>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                  <div className="text-lg font-semibold text-emerald-700">{college.rating}</div>
                  <div className="text-xs text-emerald-600">Rating</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {college.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span>Location</span>
                  <span className="font-medium text-slate-900">
                    {college.location}, {college.state}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span>Fees</span>
                  <span className="font-medium text-slate-900">{formatINR(college.feesAnnual)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span>Placement</span>
                  <span className="font-medium text-slate-900">{college.placementRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Median package</span>
                  <span className="font-medium text-slate-900">{college.medianPackageLpa} LPA</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {college.exams[0]}
                </span>
                <Link
                  href={`/colleges/${college.slug}`}
                  className="text-sm font-semibold text-slate-950 underline decoration-amber-400 decoration-2 underline-offset-4 transition hover:text-amber-700"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          <span>
            Page {response.pagination.page} of {response.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Link
              aria-disabled={response.pagination.page === 1}
              className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-800 transition hover:border-amber-300 hover:text-amber-700"
              href={buildHref(Math.max(1, response.pagination.page - 1))}
            >
              Previous
            </Link>
            <Link
              aria-disabled={response.pagination.page === response.pagination.totalPages}
              className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-800 transition hover:border-amber-300 hover:text-amber-700"
              href={buildHref(Math.min(response.pagination.totalPages, response.pagination.page + 1))}
            >
              Next
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
