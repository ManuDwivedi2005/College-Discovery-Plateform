import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCollege } from "@/lib/college-api";
import { formatINR } from "@college/shared";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const response = await fetchCollege(slug).catch(() => null);

  if (!response) {
    return { title: "College not found" };
  }

  return {
    title: `${response.data.name} | College Discovery Platform`,
    description: response.data.overview,
  };
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const response = await fetchCollege(slug).catch(() => null);

  if (!response) {
    notFound();
  }

  const college = response.data;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
              College detail
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {college.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {college.overview}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {college.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Fees", response.data.feesLabel],
                ["Placement", `${college.placementRate}%`],
                ["Median package", `${college.medianPackageLpa} LPA`],
                ["Rating", college.rating.toFixed(1)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <section className="rounded-[1.5rem] border border-slate-200 p-5">
                <h2 className="text-xl font-semibold text-slate-950">Courses offered</h2>
                <div className="mt-4 space-y-3">
                  {college.courses.map((course) => (
                    <div
                      key={course.name}
                      className="rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <div className="font-medium text-slate-900">{course.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {course.duration} · {formatINR(course.annualFees)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-slate-200 p-5">
                <h2 className="text-xl font-semibold text-slate-950">Placements</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>Placement rate: <span className="font-semibold text-slate-950">{college.placementRate}%</span></p>
                  <p>Median package: <span className="font-semibold text-slate-950">{college.medianPackageLpa} LPA</span></p>
                  <p>Highest package: <span className="font-semibold text-slate-950">{college.highestPackageLpa} LPA</span></p>
                  <p>
                    Recruiters: <span className="font-semibold text-slate-950">{college.recruiters.join(", ")}</span>
                  </p>
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-[1.5rem] border border-slate-200 p-5">
              <h2 className="text-xl font-semibold text-slate-950">Reviews</h2>
              <ReviewList reviews={college.reviews} slug={college.slug} />
              <ReviewForm slug={college.slug} />
            </section>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.15)]">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">At a glance</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>Location: <span className="font-medium text-white">{college.location}, {college.state}</span></p>
                <p>Established: <span className="font-medium text-white">{college.establishedYear}</span></p>
                <p>Admissions exam: <span className="font-medium text-white">{college.exams.join(", ")}</span></p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {college.websiteUrl && (
                  <a href={college.websiteUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
                    Visit Official Website
                  </a>
                )}
                <Link href="/compare" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Compare colleges
                </Link>
                <Link href="/colleges" className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                  Back to listings
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Decision summary</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Strongest if you care about outcomes, reputation, and campus-level detail.</p>
                <p>Good shortlist candidate for applicants comparing ROI, prestige, and location.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
