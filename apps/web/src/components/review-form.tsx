"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ReviewForm({ slug }: { slug: string }) {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!user) {
    return (
      <div className="mt-6 rounded-2xl bg-amber-50 p-6 text-center text-amber-800">
        <p className="text-sm font-medium">Please <Link href="/login" className="underline font-bold">log in</Link> to write a review.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/colleges/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        setComment("");
        setRating(5);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Write a Review</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Rating (1-5)</label>
          <input type="number" min="1" max="5" value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Comment</label>
          <textarea required rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
        </div>
        <button type="submit" disabled={loading} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
