"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/sections/auth-card";

export default function AiKeyPage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/ai-key", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not save key.");
    setDone(true);
  }

  return (
    <section className="dash" style={{ maxWidth: "40rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Add your AI key</h1>
      <p className="muted" style={{ marginTop: 8 }}>Your Gemini key powers the replies. Get one free at aistudio.google.com/apikey.</p>

      <div className="panel glass" style={{ marginTop: 32 }}>
        {done ? (
          <div className="auth-sent">
            <span className="auth-sent-icon" style={{ color: "var(--mint)" }}><CheckCircle2 size={26} /></span>
            <p style={{ fontSize: 16 }}>Key saved 🎉</p>
            <p className="muted" style={{ fontSize: 14 }}>It&apos;s stored encrypted. Your assistant can now reply. Message the account from another Telegram to test.</p>
            <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 8 }}>Back to dashboard</Link>
          </div>
        ) : (
          <form className="form" onSubmit={save}>
            <p className="panel-desc">Paste your Gemini API key. It&apos;s encrypted before storage and never shown again.</p>
            <Field label="Gemini API key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="AIza…" required />
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : "Save key"}</button>
          </form>
        )}
      </div>
    </section>
  );
}
