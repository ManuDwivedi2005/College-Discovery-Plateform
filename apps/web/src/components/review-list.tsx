"use client";

import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";

export function ReviewList({ reviews, slug }: { reviews: any[], slug: string }) {
  const { user, token } = useAuth();
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/colleges/${slug}/reviews/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {reviews.map((review) => (
        <article key={review.id || `${review.author}-${review.year}`} className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-slate-950">{review.author}</div>
              <div className="text-sm text-slate-500">{review.role} · {review.year}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                {review.rating.toFixed(1)}
              </div>
              {user && user.id != null && review.userId != null && Number(user.id) === Number(review.userId) && review.id && (
                <button onClick={() => handleDelete(review.id)} className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}
