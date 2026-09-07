"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Key = { id: string; hint: string | null; status: string; created_at: string };

export default function AiKeyPage() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("ai_keys").select("id,hint,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setKeys((data as Key[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setNote(null);
    if (!key.trim()) return setNote({ ok: false, msg: "Key is required." });
    setSaving(true);
    const res = await fetch("/api/ai-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
    const data = await res.json(); setSaving(false);
    if (!res.ok) return setNote({ ok: false, msg: data.error || "Could not save key." });
    setKey(""); setNote({ ok: true, msg: "Key added." }); load();
  }

  async function del(id: string) {
    const supabase = createClient();
    await supabase.from("ai_keys").delete().eq("id", id);
    setKeys((xs) => xs.filter((x) => x.id !== id));
  }

  return (
    <section className="dash" style={{ maxWidth: "42rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">AI keys</h1>
      <p className="muted" style={{ marginTop: 8 }}>Add one or more Gemini keys — free at aistudio.google.com/apikey. If one hits its limit, the bot uses the next.</p>

      <div className="panel glass" style={{ marginTop: 32 }}>
        <p className="panel-title">Add a key</p>
        <p className="panel-desc">Encrypted before storage and never shown again.</p>
        <form className="form" onSubmit={add}>
          <Field label="Gemini API key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="AIza…" required />
          {note && <p className={cn(note.ok ? "save-note ok" : "form-error")}>{note.msg}</p>}
          <button className="btn btn-primary" disabled={saving}><Plus size={16} /> {saving ? "Adding…" : "Add key"}</button>
        </form>
      </div>

      <div className="panel glass">
        <p className="panel-title">Your keys {keys.length > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {keys.length}</span>}</p>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="empty">No keys yet. Add one above.</p>
        ) : (
          <div style={{ marginTop: 8 }}>
            {keys.map((k) => (
              <div key={k.id} className="key-row">
                <div>
                  <div className="mono">•••• {k.hint || "••••"}</div>
                  <div className="prod-meta">
                    <span className={cn("badge", k.status === "active" ? "badge-ok" : "badge-off")}>{k.status}</span>
                    <span style={{ marginLeft: 8 }}>added {new Date(k.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => del(k.id)} aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
