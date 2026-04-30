"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@college/shared";

export default function PredictorPage() {
  const [exam, setExam] = useState("JEE Main");
  const [rank, setRank] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/predict?exam=${exam}&rank=${rank}`);
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">College Predictor Tool</h1>
        <p className="mt-4 text-lg text-slate-600">Enter your competitive exam details to discover which colleges you are most likely to get into based on historical trends.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm h-fit">
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Exam</label>
              <select value={exam} onChange={e => setExam(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20">
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="BITSAT">BITSAT</option>
                <option value="State CET">State CET</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Your Rank</label>
              <input type="number" required value={rank} onChange={e => setRank(e.target.value)} placeholder="e.g., 4500" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Predicting..." : "Predict Colleges"}
            </button>
          </form>
        </div>

        <div>
          {results && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Your Recommended Colleges ({results.length})</h2>
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  No colleges found for this rank range.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.map(college => (
                    <article key={college.slug} className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-slate-900">{college.name}</h3>
                        <div className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          {college.rating} ★
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{college.location}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {college.exams?.slice(0, 2).map((ex: string) => (
                          <span key={ex} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{ex}</span>
                        ))}
                      </div>
                      <div className="mt-5">
                        <Link href={`/colleges/${college.slug}`} className="text-sm font-semibold text-amber-600 hover:text-amber-700">View details →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
