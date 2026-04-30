import Link from "next/link";
import { formatINR } from "@college/shared";
import { CollegeSearch } from "@/components/college-search";
import { fetchColleges, fetchCollegeOptions } from "@/lib/college-api";

const filters = ["Location", "Fees", "Course"];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredRes, optionsRes] = await Promise.all([
    fetchColleges({ limit: 3 }),
    fetchCollegeOptions(),
  ]);

  const colleges = featuredRes.data || [];
  const totalColleges = featuredRes.meta?.availableColleges || 0;
  const collegeOptions = optionsRes.data || [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_32%),linear-gradient(180deg,#fffaf6_0%,#ffffff_38%,#f8fafc_100%)] text-slate-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 sm:px-10 lg:px-12">
        <header className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                College Discovery Platform
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Compare colleges with clarity, not clutter.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Search, filter, compare, and shortlist institutions using a fast decision
                  experience built for real applicants, not a static directory.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-3xl bg-slate-950 p-4 text-white shadow-lg sm:min-w-[340px]">
              <div>
                <div className="text-2xl font-semibold">{totalColleges}</div>
                <div className="text-xs text-slate-300">Colleges</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">4.6</div>
                <div className="text-xs text-slate-300">Avg rating</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">91%</div>
                <div className="text-xs text-slate-300">Top placement</div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <CollegeSearch colleges={collegeOptions} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            {filters.map((filter) => (
              <a
                key={filter}
                href="/colleges"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Filter
                </div>
                <div>{filter}</div>
              </a>
            ))}
            <a
              href="/compare"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 text-center flex items-center justify-center"
            >
              Compare selected
            </a>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {colleges.map((college) => (
            <article
              key={college.name}
              className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
                    Featured
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight text-slate-950">
                    {college.name}
                  </h2>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                  <div className="text-lg font-semibold text-emerald-700">
                    {college.rating}
                  </div>
                  <div className="text-xs text-emerald-600">Rating</div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span>Location</span>
                  <span className="font-medium text-slate-900">{college.location}, {college.state}</span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span>Fees</span>
                  <span className="font-medium text-slate-900">{formatINR(college.feesAnnual)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Placement</span>
                  <span className="font-medium text-slate-900">{college.placementRate}%</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {college.tags?.[0] || "B.Tech"}
                </span>
                <Link
                  href={`/colleges/${college.slug}`}
                  className="text-sm font-semibold text-slate-950 underline decoration-amber-400 decoration-2 underline-offset-4 transition group-hover:text-amber-700"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Decision feature
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Compare two or three colleges side by side.</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Compare fees, placement percentage, rating, and location in a structured table
              designed to help applicants narrow choices quickly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Fees</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Placement %</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Rating</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Location</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Quick actions</p>
            <div className="mt-4 grid gap-3">
              <a href="/colleges" className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-amber-300 hover:text-amber-700">
                Explore colleges
              </a>
              <a href="/compare" className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-amber-300 hover:text-amber-700">
                Compare colleges
              </a>
              <a href="/colleges/nit-trichy" className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-amber-300 hover:text-amber-700">
                Open a detail page
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
