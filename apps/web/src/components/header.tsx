"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";

export function Header() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          College<span className="text-amber-500">Discovery</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/colleges" className="hover:text-slate-900 transition">Colleges</Link>
          <Link href="/compare" className="hover:text-slate-900 transition">Compare</Link>
          <Link href="/predictor" className="hover:text-slate-900 transition">Predictor</Link>
          <Link href="/qa" className="hover:text-slate-900 transition">Q&A</Link>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-600">Hi, {user.name}</span>
                <button 
                  onClick={logout}
                  className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-slate-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                  Log in
                </Link>
                <Link href="/register" className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">
                  Sign up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
