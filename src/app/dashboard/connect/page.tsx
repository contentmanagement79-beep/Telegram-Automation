"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Bot, User } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Method = "bot" | "user";
type Step = "choose" | "bot" | "user-form" | "user-code" | "done";

export default function ConnectPage() {
  const [loadingState, setLoadingState] = useState(true);
  const [connected, setConnected] = useState<{ mode: string; label: string } | null>(null);

  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState("");

  // bot
  const [botToken, setBotToken] = useState("");
  // user
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
    const { data } = await supabase.from("telegram_accounts").select("status,mode,phone").eq("user_id", user.id).maybeSingle();
    setConnected(data?.status === "connected" ? { mode: data.mode || "user", label: data.phone || "" } : null);
    setLoadingState(false);
  }
  useEffect(() => { refresh(); }, []);

  async function disconnect() {
    if (!confirm("Disconnect? The bot will stop replying.")) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("telegram_accounts").update({ status: "disconnected", session_string_enc: null, bot_token_enc: null }).eq("user_id", user.id);
    setConnected(null); setStep("choose");
  }

  async function connectBot(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/telegram/connect-bot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bot_token: botToken }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setError(data.error || "Could not connect bot.");
    setDoneMsg(`Bot connected ${data.username || ""} 🎉`); setStep("done"); refresh();
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/telegram/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_id: apiId, api_hash: apiHash, phone }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setError(data.error || "Could not send code.");
    setToken(data.pending_token); setStep("user-code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/telegram/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pending_token: token, code, password: needsPassword ? password : undefined }) });
    const data = await res.json(); setLoading(false);
    if (data.needs_password) { setNeedsPassword(true); return; }
    if (!res.ok) return setError(data.error || "Verification failed.");
    setDoneMsg("Telegram connected 🎉"); setStep("done"); refresh();
  }

  return (
    <section className="dash" style={{ maxWidth: "42rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Connect Telegram</h1>
      <p className="muted" style={{ marginTop: 8 }}>Where the assistant will reply from.</p>

      <div className="panel glass" style={{ marginTop: 32 }}>
        {loadingState ? (
          <p className="muted">Loading…</p>
        ) : connected ? (
          <div>
            <span className="badge badge-ok" style={{ marginBottom: 16 }}><span className="dot" /> Connected</span>
            <p style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16 }}>
              {connected.mode === "bot" ? <Bot size={18} /> : <User size={18} />}
              {connected.mode === "bot" ? `Bot ${connected.label}` : (connected.label || "Personal account")}
            </p>
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={disconnect}>Disconnect</button>
          </div>
        ) : step === "choose" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <button className="glass glass-hover" style={{ textAlign: "left", padding: 20, borderRadius: 14, cursor: "pointer", background: "transparent", border: "1px solid var(--line)" }} onClick={() => setStep("bot")}>
              <span className="badge badge-ok" style={{ marginBottom: 8 }}>Recommended</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16 }}><Bot size={18} /> Connect a Bot (BotFather)</div>
              <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Safest — no ban risk, no phone code. Just paste a bot token. Customers chat your @bot.</p>
            </button>
            <button className="glass glass-hover" style={{ textAlign: "left", padding: 20, borderRadius: 14, cursor: "pointer", background: "transparent", border: "1px solid var(--line)" }} onClick={() => setStep("user-form")}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16 }}><User size={18} /> Connect your personal account</div>
              <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Replies from your own number. Carries some Telegram risk. Needs phone + login code.</p>
            </button>
          </div>
        ) : step === "bot" ? (
          <form className="form" onSubmit={connectBot}>
            <p className="panel-desc">Open <strong>@BotFather</strong> in Telegram → <code className="mono">/newbot</code> → copy the token, paste below.</p>
            <Field label="Bot token" value={botToken} onChange={(e) => setBotToken(e.target.value)} placeholder="123456:ABC-DEF…" required />
            {error && <p className="form-error">{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => { setStep("choose"); setError(null); }}>Back</button>
              <button className="btn btn-primary" disabled={loading}>{loading ? "Connecting…" : "Connect bot"}</button>
            </div>
          </form>
        ) : step === "user-form" ? (
          <form className="form" onSubmit={sendCode}>
            <p className="panel-desc">Get <strong>api_id</strong> and <strong>api_hash</strong> from my.telegram.org.</p>
            <div className="form-grid">
              <Field label="api_id" value={apiId} onChange={(e) => setApiId(e.target.value)} placeholder="123456" required />
              <Field label="api_hash" value={apiHash} onChange={(e) => setApiHash(e.target.value)} placeholder="abcdef…" required />
            </div>
            <Field label="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" required />
            {error && <p className="form-error">{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => { setStep("choose"); setError(null); }}>Back</button>
              <button className="btn btn-primary" disabled={loading}>{loading ? "Sending…" : "Send code"}</button>
            </div>
          </form>
        ) : step === "user-code" ? (
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
            <p style={{ fontSize: 16 }}>{doneMsg}</p>
            <Link href="/dashboard/ai-key" className="btn btn-primary" style={{ marginTop: 8 }}>Add AI key</Link>
          </div>
        )}
      </div>
    </section>
  );
}
