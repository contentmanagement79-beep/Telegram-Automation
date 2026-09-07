"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Bot } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";

type Step = "form" | "code" | "done";

export default function ConnectPage() {
  const [loadingState, setLoadingState] = useState(true);
  const [connected, setConnected] = useState<{ phone: string } | null>(null);

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

  async function refresh() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("telegram_accounts").select("status,phone").eq("user_id", user.id).maybeSingle();
    setConnected(data?.status === "connected" ? { phone: data.phone } : null);
    setLoadingState(false);
  }
  useEffect(() => { refresh(); }, []);

  async function disconnect() {
    if (!confirm("Disconnect this Telegram account? The bot will stop replying.")) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("telegram_accounts").update({ status: "disconnected", session_string_enc: null }).eq("user_id", user.id);
    setConnected(null);
    setStep("form");
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/telegram/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_id: apiId, api_hash: apiHash, phone }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setError(data.error || "Could not send code.");
    setToken(data.pending_token); setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/telegram/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pending_token: token, code, password: needsPassword ? password : undefined }) });
    const data = await res.json(); setLoading(false);
    if (data.needs_password) { setNeedsPassword(true); return; }
    if (!res.ok) return setError(data.error || "Verification failed.");
    setStep("done"); refresh();
  }

  return (
    <section className="dash" style={{ maxWidth: "40rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Connect Telegram</h1>
      <p className="muted" style={{ marginTop: 8 }}>The account the assistant replies from.</p>

      <div className="panel glass" style={{ marginTop: 32 }}>
        {loadingState ? (
          <p className="muted">Loading…</p>
        ) : connected ? (
          <div>
            <span className="badge badge-ok" style={{ marginBottom: 16 }}><span className="dot" /> Connected</span>
            <p style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16 }}>
              <Bot size={18} /> {connected.phone || "Telegram account"}
            </p>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>Your assistant is live on this account. To use a different account, disconnect first.</p>
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={disconnect}>Disconnect</button>
          </div>
        ) : step === "form" ? (
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
        ) : step === "code" ? (
          <form className="form" onSubmit={verify}>
            <p className="panel-desc">Enter the code Telegram sent to <strong>{phone}</strong>.</p>
            <Field label="Login code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="12345" required={!needsPassword} />
            {needsPassword && <Field label="Two-step password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your 2FA password" required />}
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" disabled={loading}>{loading ? "Verifying…" : needsPassword ? "Confirm password" : "Verify & connect"}</button>
          </form>
        ) : (
          <div className="auth-sent">
            <span className="auth-sent-icon" style={{ color: "var(--mint)" }}><CheckCircle2 size={26} /></span>
            <p style={{ fontSize: 16 }}>Telegram connected 🎉</p>
            <Link href="/dashboard/ai-key" className="btn btn-primary" style={{ marginTop: 8 }}>Add AI key</Link>
          </div>
        )}
      </div>
    </section>
  );
}
