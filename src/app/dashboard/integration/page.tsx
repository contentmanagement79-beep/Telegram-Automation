"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function IntegrationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  const [apiUrl, setApiUrl] = useState("");
  const [headerName, setHeaderName] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [desc, setDesc] = useState("");
  const [hasSecret, setHasSecret] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("integrations")
        .select("api_url,header_name,enabled,note,header_value_enc")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setApiUrl(data.api_url ?? "");
        setHeaderName(data.header_name ?? "");
        setEnabled(!!data.enabled);
        setDesc(data.note ?? "");
        setHasSecret(!!data.header_value_enc);
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setNote(null); setSaving(true);
    const res = await fetch("/api/integration", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_url: apiUrl, header_name: headerName, header_value: headerValue, enabled, note: desc }),
    });
    const data = await res.json(); setSaving(false);
    if (!res.ok) return setNote({ ok: false, msg: data.error || "Could not save." });
    if (headerValue) setHasSecret(true);
    setHeaderValue("");
    setNote({ ok: true, msg: "Saved." });
  }

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  return (
    <section className="dash" style={{ maxWidth: "42rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Website / API integration</h1>
      <p className="muted" style={{ marginTop: 8 }}>Optional. Let the assistant pull live data (stock, prices, order status) from your own site.</p>

      <div className="panel glass" style={{ marginTop: 32 }}>
        <p className="panel-title">How it works</p>
        <p className="panel-desc">
          For each customer message, the assistant will <strong>POST</strong> to your URL with
          <code className="mono"> {"{ \"query\": \"customer message\" }"} </code> and use whatever text you return
          (ideally <code className="mono">{"{ \"context\": \"...\" }"}</code>) to answer. Keep your endpoint fast (≤8s).
        </p>
      </div>

      <div className="panel glass">
        <p className="panel-title">Settings</p>
        <label style={{ display: "block", marginBottom: 16 }}>
          <span className="field-label">Your API URL</span>
          <input className="field-input" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://yourstore.com/api/assistant" />
        </label>
        <div className="form-grid">
          <Field label="Auth header name (optional)" value={headerName} onChange={(e) => setHeaderName(e.target.value)} placeholder="x-api-key" />
          <Field
            label={hasSecret ? "Auth header value (leave blank to keep)" : "Auth header value (optional)"}
            type="password" value={headerValue} onChange={(e) => setHeaderValue(e.target.value)}
            placeholder={hasSecret ? "•••••• saved" : "your-secret"}
          />
        </div>
        <label style={{ display: "block", marginTop: 16 }}>
          <span className="field-label">Note (what your API returns)</span>
          <textarea className="field-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Returns current stock and price for a product name." />
        </label>

        <div className="switch-row" style={{ marginTop: 8 }}>
          <div>
            <div>Enable integration</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>When on, the bot calls your API on every customer message.</div>
          </div>
          <button type="button" className={cn("switch", enabled && "on")} onClick={() => setEnabled(!enabled)} aria-pressed={enabled}>
            <span className="switch-knob" />
          </button>
        </div>

        <div className="save-bar">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          {note && <span className={cn("save-note", note.ok ? "ok" : "err")}>{note.msg}</span>}
        </div>
      </div>
    </section>
  );
}
