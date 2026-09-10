"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Prov = { id: string; name: string | null; endpoint: string; enabled: boolean };

const EL_HELP = "ElevenLabs example — Endpoint: https://api.elevenlabs.io/v1/text-to-speech/{voice} · Header name: xi-api-key · Header value: your key · Body: {\"text\":\"{text}\",\"model_id\":\"eleven_multilingual_v2\"} · Voice: <voice_id> · Response: audio";

export default function VoicePage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [list, setList] = useState<Prov[]>([]);
  const [managed, setManaged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  const [f, setF] = useState({ name: "", endpoint: "", header_name: "", header_value: "", body_template: '{"text":"{text}"}', voice: "", response_type: "audio", json_path: "" });

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUid(user.id);
    const [p, s, pl] = await Promise.all([
      supabase.from("voice_providers").select("id,name,endpoint,enabled").eq("user_id", user.id).order("created_at"),
      supabase.from("platform_settings").select("managed_voice_on").eq("id", 1).maybeSingle(),
      supabase.from("plans").select("plan,expires_at,suspended").eq("user_id", user.id).maybeSingle(),
    ]);
    setList((p.data as Prov[]) ?? []);
    const isPro = !!pl.data && !pl.data.suspended && pl.data.plan === "pro" && (!pl.data.expires_at || new Date(pl.data.expires_at) > new Date());
    setManaged(!!s.data?.managed_voice_on && isPro);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setNote(null);
    if (!f.endpoint.trim()) return setNote({ ok: false, msg: "Endpoint is required." });
    setSaving(true);
    const res = await fetch("/api/voice-provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json(); setSaving(false);
    if (!res.ok) return setNote({ ok: false, msg: data.error || "Could not save." });
    setF({ ...f, name: "", endpoint: "", header_value: "", voice: "" });
    setNote({ ok: true, msg: "Voice provider saved." }); load();
  }
  async function del(id: string) { await supabase.from("voice_providers").delete().eq("id", id); if (uid) load(); }

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  return (
    <section className="dash" style={{ maxWidth: "44rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Voice</h1>
      <p className="muted" style={{ marginTop: 8 }}>By default the bot uses free edge-tts. Add a provider (e.g. ElevenLabs) for premium voice.</p>

      {managed && (
        <div className="panel glass" style={{ marginTop: 20, borderColor: "var(--mint)" }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="dot" style={{ background: "var(--mint)" }} /> <strong>Pro:</strong> a platform premium voice is active for you. Add your own below only to use it instead.</p>
        </div>
      )}

      <div className="panel glass" style={{ marginTop: 20 }}>
        <p className="panel-title">Add a voice provider</p>
        <p className="panel-desc" style={{ whiteSpace: "pre-wrap" }}>{EL_HELP}</p>
        <form className="form" onSubmit={add}>
          <div className="form-grid">
            <Field label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="ElevenLabs" />
            <Field label="Voice id (→ {voice})" value={f.voice} onChange={(e) => setF({ ...f, voice: e.target.value })} placeholder="21m00Tcm4TlvDq8ikWAM" />
          </div>
          <Field label="Endpoint (may use {voice})" value={f.endpoint} onChange={(e) => setF({ ...f, endpoint: e.target.value })} placeholder="https://api.elevenlabs.io/v1/text-to-speech/{voice}" required />
          <div className="form-grid">
            <Field label="Auth header name" value={f.header_name} onChange={(e) => setF({ ...f, header_name: e.target.value })} placeholder="xi-api-key" />
            <Field label="Auth header value (secret)" type="password" value={f.header_value} onChange={(e) => setF({ ...f, header_value: e.target.value })} placeholder="your key (or 'Bearer …')" />
          </div>
          <label style={{ display: "block" }}>
            <span className="field-label">Body template (JSON, uses {"{text}"})</span>
            <textarea className="field-textarea" value={f.body_template} onChange={(e) => setF({ ...f, body_template: e.target.value })} />
          </label>
          <div className="form-grid">
            <label style={{ display: "block" }}>
              <span className="field-label">Response type</span>
              <select className="field-select" value={f.response_type} onChange={(e) => setF({ ...f, response_type: e.target.value })}>
                <option value="audio">audio (raw bytes)</option>
                <option value="base64">base64 (in JSON)</option>
                <option value="url">url (in JSON)</option>
              </select>
            </label>
            <Field label="JSON path (for base64/url)" value={f.json_path} onChange={(e) => setF({ ...f, json_path: e.target.value })} placeholder="e.g. data.audio" />
          </div>
          {note && <p className={cn(note.ok ? "save-note ok" : "form-error")}>{note.msg}</p>}
          <button className="btn btn-primary" disabled={saving}><Plus size={16} /> {saving ? "Saving…" : "Save provider"}</button>
        </form>
      </div>

      <div className="panel glass">
        <p className="panel-title">Your providers</p>
        {list.length === 0 ? <p className="empty">None — the bot uses free edge-tts.</p> : list.map((p) => (
          <div key={p.id} className="key-row">
            <div><div className="prod-name">{p.name || "Voice provider"}</div><div className="prod-meta">{p.endpoint}</div></div>
            <button className="icon-btn" onClick={() => del(p.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
