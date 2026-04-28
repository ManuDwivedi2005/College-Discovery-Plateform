import Link from "next/link";
import { colleges, formatINR, type College } from "@college/shared";
import { fetchComparison } from "@/lib/college-api";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type ComparisonMetric = {
  label: string;
  resolve: (college: College) => string;
};

function getValue(input: string | string[] | undefined): string {
  return typeof input === "string" ? input : "";
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const slugs = [
    getValue(searchParams.slug1),
    getValue(searchParams.slug2),
    getValue(searchParams.slug3),
  ].filter(Boolean);

  const comparison = slugs.length >= 2 ? await fetchComparison(slugs).catch(() => null) : null;
  const selected = comparison?.data ?? [];
  const metrics: ComparisonMetric[] = [
    { label: "Location", resolve: (college) => `${college.location}, ${college.state}` },
    { label: "Fees", resolve: (college) => formatINR(college.feesAnnual) },
    { label: "Placement %", resolve: (college) => `${college.placementRate}%` },
    { label: "Rating", resolve: (college) => college.rating.toFixed(1) },
    { label: "Median package", resolve: (college) => `${college.medianPackageLpa} LPA` },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
            Compare colleges
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Put 2 or 3 colleges side by side and make a faster decision.
              </h1>
              <p className="text-sm leading-7 text-slate-600 sm:text-base">
                Select colleges from the dropdowns below, then compare fees, placements, rating,
                and location in a clean decision table.
              </p>
            </div>
            <Link
              href="/colleges"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-300 hover:text-amber-700"
            >
              Browse colleges
            </Link>
          </div>

          <form className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]" method="get">
            {[1, 2, 3].map((index) => (
              <label key={index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  College {index}
                </div>
                <select
                  name={`slug${index}`}
                  defaultValue={slugs[index - 1] ?? ""}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  <option value="">Select college</option>
                  {colleges.map((college) => (
                    <option key={college.slug} value={college.slug}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
              Compare
            </button>
          </form>
        </div>

        {selected.length >= 2 ? (
          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-slate-950 text-white">
                    <th className="sticky left-0 z-10 bg-slate-950 px-6 py-4 text-sm font-semibold">Metric</th>
                    {selected.map((college) => (
                      <th key={college.slug} className="px-6 py-4 text-sm font-semibold">
                        {college.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.label} className="border-t border-slate-200 even:bg-slate-50">
                      <th className="sticky left-0 z-10 bg-inherit px-6 py-4 text-sm font-semibold text-slate-700">
                        {metric.label}
                      </th>
                      {selected.map((college) => (
                        <td key={college.slug} className="px-6 py-4 text-sm text-slate-600">
                          {metric.resolve(college)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            Select at least two colleges to unlock the comparison table.
          </div>
        )}
      </section>
    </main>
  );
}
