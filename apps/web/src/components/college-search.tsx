"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CollegeSearch({ colleges }: { colleges: any[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/colleges`);
    }
  };

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
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex gap-3">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm font-medium text-slate-500">Search</span>
          <input
            aria-label="Search colleges by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a college name"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </label>
        <button type="submit" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800">
          Search
        </button>
      </form>
    </section>
  );
}