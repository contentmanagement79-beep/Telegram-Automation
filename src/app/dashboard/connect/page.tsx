"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { cn } from "@/lib/utils";

type Step = "form" | "code" | "done";

export default function ConnectPage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);

  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/telegram/send-code", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_id: apiId, api_hash: apiHash, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not send code.");
    setToken(data.pending_token);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/telegram/verify-code", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pending_token: token, code, password: needsPassword ? password : undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.needs_password) { setNeedsPassword(true); return; }
    if (!res.ok) return setError(data.error || "Verification failed.");
    setStep("done");
  }

  return (
    <section className="dash" style={{ maxWidth: "40rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Connect Telegram</h1>
      <p className="muted" style={{ marginTop: 8 }}>Link the account the assistant will reply from. One-time login.</p>

      <div className="panel glass" style={{ marginTop: 32 }}>
        {step === "form" && (
          <form className="form" onSubmit={sendCode}>
            <p className="panel-desc">Get your <strong>api_id</strong> and <strong>api_hash</strong> from my.telegram.org.</p>
            <div className="form-grid">
              <Field label="api_id" value={apiId} onChange={(e) => setApiId(e.target.value)} placeholder="123456" required />
              <Field label="api_hash" value={apiHash} onChange={(e) => setApiHash(e.target.value)} placeholder="abcdef…" required />
            </div>
            <Field label="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" required />
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" disabled={loading}>{loading ? "Sending code…" : "Send code"}</button>
          </form>
        )}

        {step === "code" && (
          <form className="form" onSubmit={verify}>
            <p className="panel-desc">Enter the code Telegram just sent to <strong>{phone}</strong>.</p>
            <Field label="Login code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="12345" required={!needsPassword} />
            {needsPassword && (
              <Field label="Two-step password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your 2FA password" required />
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" disabled={loading}>{loading ? "Verifying…" : needsPassword ? "Confirm password" : "Verify & connect"}</button>
          </form>
        )}

        {step === "done" && (
          <div className="auth-sent">
            <span className="auth-sent-icon" style={{ color: "var(--mint)" }}><CheckCircle2 size={26} /></span>
            <p style={{ fontSize: 16 }}>Telegram connected 🎉</p>
            <p className="muted" style={{ fontSize: 14 }}>Your assistant is starting up. Add your AI key next, then message the account from another Telegram to test.</p>
            <Link href="/dashboard/ai-key" className="btn btn-primary" style={{ marginTop: 8 }}>Add AI key</Link>
          </div>
        )}
      </div>
    </section>
  );
}
