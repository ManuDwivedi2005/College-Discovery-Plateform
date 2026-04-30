"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

export default function QAPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const { user, token } = useAuth();

  const fetchQA = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qa`);
      const data = await res.json();
      setQuestions(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQA();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        await fetchQA();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleReply = async (e: React.FormEvent, questionId: number) => {
    e.preventDefault();
    if (!replyContent || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qa/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        setActiveQuestion(null);
        await fetchQA();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qa/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) await fetchQA();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnswer = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qa/answers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) await fetchQA();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-10 lg:px-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Discussion & Q&A</h1>
        <p className="mt-2 text-lg text-slate-600">Ask questions and get answers from the community.</p>
      </div>

      {user ? (
        <form onSubmit={handleAsk} className="mb-12 space-y-4 rounded-[2rem] bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] xl:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Ask a Question</h2>
          <div>
            <input required placeholder="What do you want to ask?" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
          </div>
          <div>
            <textarea required rows={3} placeholder="Add more details..." value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Posting..." : "Post Question"}
          </button>
        </form>
      ) : (
        <div className="mb-12 rounded-2xl bg-amber-50 p-6 text-center text-amber-800">
          <p className="text-sm font-medium">Please <Link href="/login" className="underline font-bold">log in</Link> to ask a question.</p>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <p className="text-slate-500">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-slate-500">No questions yet. Be the first to ask!</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{q.title}</h3>
                  <p className="mt-2 text-sm text-slate-700">{q.content}</p>
                  <p className="mt-3 text-xs font-medium text-slate-500">Asked by {q.authorName}</p>
                </div>
                {user && user.id === q.userId && (
                  <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {q.answers && q.answers.length > 0 && (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Answers ({q.answers.length})</h4>
                    {q.answers.map((a: any) => (
                      <div key={a.id} className="border-t border-slate-200 pt-3 first:border-0 first:pt-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-800">{a.content}</p>
                            <p className="mt-1 text-xs text-slate-500">— {a.authorName}</p>
                          </div>
                          {user && user.id === a.userId && (
                            <button onClick={() => handleDeleteAnswer(a.id)} className="text-xs font-semibold text-red-600 hover:underline">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {user && activeQuestion !== q.id && (
                  <button onClick={() => setActiveQuestion(q.id)} className="text-sm font-semibold text-amber-600 hover:text-amber-700">
                    Reply to this question
                  </button>
                )}

                {user && activeQuestion === q.id && (
                  <form onSubmit={(e) => handleReply(e, q.id)} className="mt-4 flex gap-3">
                    <input required autoFocus placeholder="Type your answer..." value={replyContent} onChange={e => setReplyContent(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20" />
                    <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Reply</button>
                    <button type="button" onClick={() => setActiveQuestion(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Cancel</button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
