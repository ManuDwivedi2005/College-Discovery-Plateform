"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CollegeOption = {
  slug: string;
  name: string;
};

type CollegeSearchProps = {
  colleges: CollegeOption[];
};

export function CollegeSearch({ colleges }: CollegeSearchProps) {
  const [query, setQuery] = useState("");

  const filteredColleges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return colleges.slice(0, 12);
    }

    return colleges
      .filter((college) => college.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 12);
  }, [colleges, query]);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Search by college name
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Available colleges in the database
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          {filteredColleges.length} of {colleges.length} shown
        </p>
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-slate-500">Search</span>
        <input
          aria-label="Search colleges by name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a college name"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredColleges.length ? (
          filteredColleges.map((college) => (
            <Link
              key={college.slug}
              href={`/colleges/${college.slug}`}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
            >
              <div className="text-sm font-semibold text-slate-950">{college.name}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                View details
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600 sm:col-span-2 xl:col-span-3">
            No college matches your search.
          </div>
        )}
      </div>
    </section>
  );
}