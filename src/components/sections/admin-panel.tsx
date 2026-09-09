"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Flag = { key: string; tier: string };
type Row = { id: string; email: string | null; plan: string; expires_at: string | null };

const FEATURE_LABELS: Record<string, string> = {
  media: "Media library + smart send",
  voice: "Voice replies",
  followups: "Follow-up automation",
  integration: "Website / API integration",
  conversations: "Conversations viewer",
  customers: "Customers + summaries",
  business_hours: "Business hours",
  bot_mode: "Bot mode",
};

export function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [mon, setMon] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [note, setNote] = useState("");

  async function load() {
    const res = await fetch("/api/admin/data");
    if (!res.ok) { setNote("Not authorized."); setLoading(false); return; }
    const d = await res.json();
    setMon(d.monetization_on);
    setFlags(d.flags);
    setUsers(d.users);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(body: object, msg: string) {
    await fetch("/api/admin/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setNote(msg);
    setTimeout(() => setNote(""), 1500);
  }

  async function toggleMon() {
    const v = !mon; setMon(v);
    await save({ type: "settings", monetization_on: v }, "Saved.");
  }
  async function setFlag(key: string, tier: string) {
    setFlags((f) => f.map((x) => (x.key === key ? { ...x, tier } : x)));
    await save({ type: "flag", key, tier }, "Saved.");
  }
  async function setPlan(u: Row, plan: string) {
    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, plan } : x)));
    await save({ type: "plan", user_id: u.id, plan, expires_at: u.expires_at }, "Saved.");
  }

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  return (
    <section className="dash" style={{ maxWidth: "50rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <div className="dash-head">
        <h1 className="dash-title">Super-admin</h1>
        {note && <span className="save-note ok">{note}</span>}
      </div>

      <div className="panel glass" style={{ marginTop: 24 }}>
        <div className="switch-row" style={{ borderTop: 0 }}>
          <div>
            <div style={{ fontSize: 16 }}>Monetization</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {mon ? "ON — Pro features need a subscription." : "OFF — everything is free for everyone."}
            </div>
          </div>
          <button className={cn("switch", mon && "on")} onClick={toggleMon}><span className="switch-knob" /></button>
        </div>
      </div>

      <div className="panel glass">
        <p className="panel-title">Features</p>
        <p className="panel-desc">Free = everyone. Pro = subscribers only (when monetization is ON).</p>
        {flags.map((f) => (
          <div key={f.key} className="key-row">
            <div>{FEATURE_LABELS[f.key] || f.key}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["free", "pro"].map((t) => (
                <button key={t} onClick={() => setFlag(f.key, t)}
                  className={cn("btn btn-sm", f.tier === t ? "btn-primary" : "btn-outline")}
                  style={{ minWidth: 60 }}>{t}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="panel glass">
        <p className="panel-title">Users {users.length > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {users.length}</span>}</p>
        {users.map((u) => (
          <div key={u.id} className="key-row">
            <div>
              <div>{u.email || u.id.slice(0, 8)}</div>
              <div className="prod-meta">plan: {u.plan}{u.expires_at ? ` · until ${new Date(u.expires_at).toLocaleDateString()}` : ""}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["free", "pro"].map((p) => (
                <button key={p} onClick={() => setPlan(u, p)}
                  className={cn("btn btn-sm", u.plan === p ? "btn-primary" : "btn-outline")}
                  style={{ minWidth: 60 }}>{p}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
