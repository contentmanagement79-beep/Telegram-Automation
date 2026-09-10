"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Rule = { id: string; name: string; delay_days: number; message: string | null; media_id: string | null; enabled: boolean };
type MediaOpt = { id: string; name: string };

export default function FollowupsPage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [media, setMedia] = useState<MediaOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  const [name, setName] = useState("");
  const [delay, setDelay] = useState(1);
  const [message, setMessage] = useState("");
  const [mediaId, setMediaId] = useState("");

  async function loadAll(userId: string) {
    const [r, m] = await Promise.all([
      supabase.from("followups").select("id,name,delay_days,message,media_id,enabled").eq("user_id", userId).order("delay_days"),
      supabase.from("media_items").select("id,name").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    setRules((r.data as Rule[]) ?? []);
    setMedia((m.data as MediaOpt[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUid(user.id);
      await loadAll(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setNote(null);
    if (!uid) return;
    if (!name.trim()) return setNote({ ok: false, msg: "Give the rule a name." });
    if (!message.trim() && !mediaId) return setNote({ ok: false, msg: "Add a message and/or a media." });
    const { error } = await supabase.from("followups").insert({
      user_id: uid, name: name.trim(), delay_days: Math.max(1, delay),
      message: message.trim() || null, media_id: mediaId || null, enabled: true,
    });
    if (error) return setNote({ ok: false, msg: error.message });
    setName(""); setDelay(1); setMessage(""); setMediaId("");
    setNote({ ok: true, msg: "Rule added." }); loadAll(uid);
  }

  async function toggle(r: Rule) {
    await supabase.from("followups").update({ enabled: !r.enabled }).eq("id", r.id);
    if (uid) loadAll(uid);
  }
  async function del(id: string) {
    await supabase.from("followups").delete().eq("id", id);
    if (uid) loadAll(uid);
  }

  const mediaName = (id: string | null) => media.find((m) => m.id === id)?.name;

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  return (
    <section className="dash" style={{ maxWidth: "44rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Follow-ups</h1>
      <p className="muted" style={{ marginTop: 8 }}>Auto-message customers who&apos;ve gone quiet. Make several rules for a drip (1 day, 3 days, 7 days…). Resets when the customer replies.</p>

      <div className="panel glass" style={{ marginTop: 28 }}>
        <p className="panel-title">Add a rule</p>
        <form className="form" onSubmit={add}>
          <div className="form-grid">
            <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Day 3 nudge" />
            <label style={{ display: "block" }}>
              <span className="field-label">Send after (days idle)</span>
              <input className="field-input" type="number" min={1} value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
            </label>
          </div>
          <label style={{ display: "block" }}>
            <span className="field-label">Message / caption</span>
            <textarea className="field-textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Still interested? Here's a fresh look 🙂" />
          </label>
          <label style={{ display: "block" }}>
            <span className="field-label">Attach media (optional)</span>
            <select className="field-select" value={mediaId} onChange={(e) => setMediaId(e.target.value)}>
              <option value="">— none —</option>
              {media.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          {note && <p className={cn(note.ok ? "save-note ok" : "form-error")}>{note.msg}</p>}
          <button className="btn btn-primary" style={{ width: "fit-content" }}><Plus size={16} /> Add rule</button>
        </form>
      </div>

      <div className="panel glass">
        <p className="panel-title">Your rules {rules.length > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {rules.length}</span>}</p>
        {rules.length === 0 ? <p className="empty">No rules yet.</p> : rules.map((r) => (
          <div key={r.id} className="key-row">
            <div>
              <div className="prod-name">{r.name} <span className="muted" style={{ fontWeight: 400 }}>· after {r.delay_days}d</span></div>
              <div className="prod-meta">
                {r.message ? `"${r.message.slice(0, 40)}${r.message.length > 40 ? "…" : ""}"` : "no text"}
                {r.media_id && ` · 📎 ${mediaName(r.media_id) || "media"}`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" className={cn("switch", r.enabled && "on")} onClick={() => toggle(r)} aria-pressed={r.enabled}><span className="switch-knob" /></button>
              <button className="icon-btn" onClick={() => del(r.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
        Note: follow-ups need the engine running around the clock. On a sleeping free host they may be delayed.
      </p>
    </section>
  );
}
