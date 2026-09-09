"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, X } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { cn } from "@/lib/utils";

type Flag = { key: string; tier: string };
type Row = { id: string; email: string | null; plan: string; expires_at: string | null };
type Req = { id: string; user_id: string; email: string; method: string; trx_id: string; status: string; created_at: string };
type Pay = { price_text: string; pay_number: string; pay_instructions: string; pro_days: number };

const FEATURE_LABELS: Record<string, string> = {
  media: "Media library + smart send", voice: "Voice replies", followups: "Follow-up automation",
  integration: "Website / API integration", conversations: "Conversations viewer",
  customers: "Customers + summaries", business_hours: "Business hours", bot_mode: "Bot mode",
};

export function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [mon, setMon] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [pay, setPay] = useState<Pay>({ price_text: "", pay_number: "", pay_instructions: "", pro_days: 30 });
  const [note, setNote] = useState("");

  async function load() {
    const res = await fetch("/api/admin/data");
    if (!res.ok) { setNote("Not authorized."); setLoading(false); return; }
    const d = await res.json();
    setMon(d.monetization_on); setFlags(d.flags); setUsers(d.users); setReqs(d.requests); setPay(d.paysettings);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function post(body: object, reload = false) {
    await fetch("/api/admin/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setNote("Saved."); setTimeout(() => setNote(""), 1500);
    if (reload) load();
  }

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  const pending = reqs.filter((r) => r.status === "pending");

  return (
    <section className="dash" style={{ maxWidth: "52rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <div className="dash-head"><h1 className="dash-title">Super-admin</h1>{note && <span className="save-note ok">{note}</span>}</div>

      <div className="panel glass" style={{ marginTop: 24 }}>
        <div className="switch-row" style={{ borderTop: 0 }}>
          <div>
            <div style={{ fontSize: 16 }}>Monetization</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{mon ? "ON — Pro features need a subscription." : "OFF — everything is free."}</div>
          </div>
          <button className={cn("switch", mon && "on")} onClick={() => { const v = !mon; setMon(v); post({ type: "settings", monetization_on: v }); }}><span className="switch-knob" /></button>
        </div>
      </div>

      {/* pending requests */}
      <div className="panel glass">
        <p className="panel-title">Pending payments {pending.length > 0 && <span className="badge badge-ok" style={{ fontSize: 11 }}>{pending.length}</span>}</p>
        {pending.length === 0 ? <p className="empty">No pending requests.</p> : pending.map((r) => (
          <div key={r.id} className="key-row">
            <div><div>{r.email}</div><div className="prod-meta">{r.method} · {r.trx_id} · {new Date(r.created_at).toLocaleString()}</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-primary btn-sm" onClick={() => post({ type: "request", action: "approve", request_id: r.id, user_id: r.user_id }, true)}><Check size={14} /> Approve</button>
              <button className="icon-btn" onClick={() => post({ type: "request", action: "reject", request_id: r.id }, true)}><X size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* pay settings */}
      <div className="panel glass">
        <p className="panel-title">Payment settings</p>
        <div className="form-grid">
          <Field label="Price text" value={pay.price_text} onChange={(e) => setPay({ ...pay, price_text: e.target.value })} placeholder="৳500 / month" />
          <Field label="Pay number (bKash/Nagad)" value={pay.pay_number} onChange={(e) => setPay({ ...pay, pay_number: e.target.value })} placeholder="01XXXXXXXXX" />
        </div>
        <label style={{ display: "block", marginTop: 16 }}>
          <span className="field-label">Instructions</span>
          <textarea className="field-textarea" value={pay.pay_instructions} onChange={(e) => setPay({ ...pay, pay_instructions: e.target.value })} placeholder="Send Money to 01XXXXXXXXX (bKash), then submit the TrxID." />
        </label>
        <label style={{ display: "block", marginTop: 16, maxWidth: 200 }}>
          <span className="field-label">Pro days per payment</span>
          <input className="field-input" type="number" value={pay.pro_days} onChange={(e) => setPay({ ...pay, pro_days: Number(e.target.value) })} />
        </label>
        <div className="save-bar"><button className="btn btn-outline btn-sm" onClick={() => post({ type: "paysettings", ...pay })}>Save payment settings</button></div>
      </div>

      {/* feature flags */}
      <div className="panel glass">
        <p className="panel-title">Features</p>
        <p className="panel-desc">Free = everyone. Pro = subscribers only (when monetization is ON).</p>
        {flags.map((f) => (
          <div key={f.key} className="key-row">
            <div>{FEATURE_LABELS[f.key] || f.key}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["free", "pro"].map((t) => (
                <button key={t} onClick={() => { setFlags((x) => x.map((y) => y.key === f.key ? { ...y, tier: t } : y)); post({ type: "flag", key: f.key, tier: t }); }}
                  className={cn("btn btn-sm", f.tier === t ? "btn-primary" : "btn-outline")} style={{ minWidth: 56 }}>{t}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* users */}
      <div className="panel glass">
        <p className="panel-title">Users {users.length > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {users.length}</span>}</p>
        {users.map((u) => (
          <div key={u.id} className="key-row">
            <div><div>{u.email || u.id.slice(0, 8)}</div><div className="prod-meta">plan: {u.plan}{u.expires_at ? ` · until ${new Date(u.expires_at).toLocaleDateString()}` : ""}</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              {["free", "pro"].map((p) => (
                <button key={p} onClick={() => { setUsers((x) => x.map((y) => y.id === u.id ? { ...y, plan: p } : y)); post({ type: "plan", user_id: u.id, plan: p, expires_at: u.expires_at }); }}
                  className={cn("btn btn-sm", u.plan === p ? "btn-primary" : "btn-outline")} style={{ minWidth: 56 }}>{p}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
