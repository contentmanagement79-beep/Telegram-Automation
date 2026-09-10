"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Bot, User } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Conn = { mode: string; status: string; phone: string | null };

export default function ConnectPage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [conns, setConns] = useState<Conn[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<null | "bot" | "user">(null);

  async function refresh(userId?: string) {
    const id = userId || uid;
    if (!id) return;
    const { data } = await supabase.from("telegram_accounts").select("mode,status,phone").eq("user_id", id);
    setConns((data as Conn[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUid(user.id);
      await refresh(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bot = conns.find((c) => c.mode === "bot" && c.status === "connected");
  const personal = conns.find((c) => c.mode === "user" && c.status === "connected");

  async function disconnect(mode: string) {
    if (!uid || !confirm("Disconnect this connection?")) return;
    await supabase.from("telegram_accounts").delete().eq("user_id", uid).eq("mode", mode);
    refresh();
  }

  return (
    <section className="dash" style={{ maxWidth: "44rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Connect Telegram</h1>
      <p className="muted" style={{ marginTop: 8 }}>Run a bot, a personal account, or both — they share the same assistant.</p>

      {loading ? (
        <p className="muted" style={{ marginTop: 24 }}>Loading…</p>
      ) : (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {/* BOT */}
          <div className="panel glass">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Bot size={18} /><strong>Bot (recommended)</strong>
                <span className="badge badge-ok" style={{ fontSize: 11 }}>ban-free</span>
              </div>
              {bot && <span className="badge badge-ok"><span className="dot" /> {bot.phone || "connected"}</span>}
            </div>
            <p className="panel-desc" style={{ marginTop: 8 }}>A BotFather bot. Just paste a token — no phone, no ban risk.</p>
            {bot ? (
              <button className="btn btn-outline btn-sm" onClick={() => disconnect("bot")}>Disconnect bot</button>
            ) : open === "bot" ? (
              <BotForm onDone={() => { setOpen(null); refresh(); }} onCancel={() => setOpen(null)} />
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setOpen("bot")}>Connect a bot</button>
            )}
          </div>

          {/* PERSONAL */}
          <div className="panel glass">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><User size={18} /><strong>Personal account</strong></div>
              {personal && <span className="badge badge-ok"><span className="dot" /> {personal.phone || "connected"}</span>}
            </div>
            <p className="panel-desc" style={{ marginTop: 8 }}>Replies from your own number. Some Telegram risk. Needs phone + code.</p>
            {personal ? (
              <button className="btn btn-outline btn-sm" onClick={() => disconnect("user")}>Disconnect account</button>
            ) : open === "user" ? (
              <UserForm onDone={() => { setOpen(null); refresh(); }} onCancel={() => setOpen(null)} />
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setOpen("user")}>Connect personal account</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function BotForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/telegram/connect-bot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bot_token: token }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setError(data.error || "Could not connect bot.");
    setDone(`Connected ${data.username || ""} 🎉`);
    setTimeout(onDone, 1200);
  }
  if (done) return <p className="save-note ok" style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={16} /> {done}</p>;
  return (
    <form className="form" onSubmit={submit}>
      <p className="panel-desc">@BotFather → <code className="mono">/newbot</code> → paste the token.</p>
      <Field label="Bot token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456:ABC…" required />
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Connecting…" : "Connect"}</button>
      </div>
    </form>
  );
}

function UserForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<"form" | "code">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [apiId, setApiId] = useState(""); const [apiHash, setApiHash] = useState(""); const [phone, setPhone] = useState("");
  const [code, setCode] = useState(""); const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

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
    setDone(true); setTimeout(onDone, 1200);
  }
  if (done) return <p className="save-note ok" style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={16} /> Connected 🎉</p>;
  return step === "form" ? (
    <form className="form" onSubmit={sendCode}>
      <p className="panel-desc">api_id / api_hash from my.telegram.org.</p>
      <div className="form-grid">
        <Field label="api_id" value={apiId} onChange={(e) => setApiId(e.target.value)} required />
        <Field label="api_hash" value={apiHash} onChange={(e) => setApiHash(e.target.value)} required />
      </div>
      <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" required />
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Sending…" : "Send code"}</button>
      </div>
    </form>
  ) : (
    <form className="form" onSubmit={verify}>
      <Field label="Login code" value={code} onChange={(e) => setCode(e.target.value)} required={!needsPassword} />
      {needsPassword && <Field label="Two-step password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Verifying…" : needsPassword ? "Confirm" : "Verify & connect"}</button>
    </form>
  );
}
