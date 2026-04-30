"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterCollegePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    state: "",
    ownership: "private",
    feesAnnual: 100000,
    rating: 4.0,
    websiteUrl: "",
    exams: "JEE Main",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role !== "college management") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-600">Only College Management can register colleges.</p>
          <Link href="/" className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/colleges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          exams: formData.exams.split(",").map(e => e.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register college");
      router.push(`/colleges/${data.data.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "feesAnnual" || name === "rating" ? Number(value) : value }));
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 sm:px-10">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-12">
        <h1 className="text-3xl font-bold text-slate-900">Register a College</h1>
        <p className="mt-2 text-sm text-slate-600">Add your institution to the College Discovery Platform.</p>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">College Name</label>
              <input name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">City/Location</label>
              <input name="location" required value={formData.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">State</label>
              <input name="state" required value={formData.state} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ownership Type</label>
              <select name="ownership" value={formData.ownership} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none bg-white transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20">
                <option value="private">Private</option>
                <option value="gov">Government/Public</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Annual Fees (INR)</label>
              <input type="number" name="feesAnnual" required value={formData.feesAnnual} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Official Website URL</label>
              <input type="url" name="websiteUrl" placeholder="https://" required value={formData.websiteUrl} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Accepted Exams (comma separated)</label>
              <input name="exams" required value={formData.exams} onChange={handleChange} placeholder="JEE Main, MHT CET" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Registering..." : "Register College"}
          </button>
        </form>
      </div>
    </main>
  );
}
