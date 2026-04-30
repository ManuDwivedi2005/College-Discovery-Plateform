"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      login(data.data.user, data.data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600">Join to ask questions and review colleges</p>
        
        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select required value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none bg-white transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20">
              <option value="student">Student</option>
              <option value="college management">College Management</option>
              <option value="alumni">Alumni</option>
              <option value="research scholar">Research Scholar</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
            Sign up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-amber-600 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
