"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Crown } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Req = { id: string; method: string; trx_id: string; status: string; created_at: string };

export default function UpgradePage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mon, setMon] = useState(false);
  const [pay, setPay] = useState({ price_text: "", pay_number: "", pay_instructions: "" });
  const [plan, setPlan] = useState<{ plan: string; expires_at: string | null } | null>(null);
  const [reqs, setReqs] = useState<Req[]>([]);

  const [method, setMethod] = useState("bkash");
  const [trx, setTrx] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function load(userId: string) {
    const [s, p, r] = await Promise.all([
      supabase.from("platform_settings").select("monetization_on,price_text,pay_number,pay_instructions").eq("id", 1).maybeSingle(),
      supabase.from("plans").select("plan,expires_at").eq("user_id", userId).maybeSingle(),
      supabase.from("subscription_requests").select("id,method,trx_id,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);
    setMon(s.data?.monetization_on ?? false);
    if (s.data) setPay({ price_text: s.data.price_text || "", pay_number: s.data.pay_number || "", pay_instructions: s.data.pay_instructions || "" });
    setPlan(p.data);
    setReqs((r.data as Req[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUid(user.id);
      await load(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPro = !!plan && plan.plan === "pro" && (!plan.expires_at || new Date(plan.expires_at) > new Date());

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setNote(null);
    if (!uid) return;
    if (!trx.trim()) return setNote({ ok: false, msg: "Enter your transaction ID." });
    setSaving(true);
    const { error } = await supabase.from("subscription_requests").insert({ user_id: uid, method, trx_id: trx.trim() });
    setSaving(false);
    if (error) return setNote({ ok: false, msg: error.message });
    setTrx(""); setNote({ ok: true, msg: "Submitted! We'll activate Pro after we verify the payment." });
    load(uid);
  }

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  return (
    <section className="dash" style={{ maxWidth: "40rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Upgrade to Pro</h1>

      {!mon ? (
        <div className="panel glass" style={{ marginTop: 24 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={18} className="mint" /> Everything is free right now — no upgrade needed 🎉</p>
        </div>
      ) : isPro ? (
        <div className="panel glass" style={{ marginTop: 24 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}><Crown size={18} style={{ color: "var(--iris)" }} /> You&apos;re on <strong>Pro</strong>{plan?.expires_at ? ` until ${new Date(plan.expires_at).toLocaleDateString()}` : ""}.</p>
        </div>
      ) : (
        <>
          <div className="panel glass" style={{ marginTop: 24 }}>
            <p className="panel-title">Pro plan {pay.price_text && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {pay.price_text}</span>}</p>
            <p className="panel-desc">Unlocks all Pro features for your assistant.</p>
            <div style={{ background: "var(--white-05)", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 14 }}><strong>How to pay:</strong></p>
              <p className="muted" style={{ fontSize: 14, marginTop: 6, whiteSpace: "pre-wrap" }}>
                {pay.pay_instructions || `Send the amount to our number, then submit the transaction ID below.`}
              </p>
              {pay.pay_number && <p style={{ marginTop: 10 }}>Number: <span className="mono" style={{ color: "var(--violet-soft)" }}>{pay.pay_number}</span></p>}
            </div>
          </div>

          <div className="panel glass">
            <p className="panel-title">Submit your payment</p>
            <form className="form" onSubmit={submit}>
              <label style={{ display: "block" }}>
                <span className="field-label">Method</span>
                <select className="field-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <Field label="Transaction ID (TrxID)" value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="e.g. 9AB7CDE2FG" required />
              {note && <p className={cn(note.ok ? "save-note ok" : "form-error")}>{note.msg}</p>}
              <button className="btn btn-primary" disabled={saving}>{saving ? "Submitting…" : "Submit for review"}</button>
            </form>
          </div>
        </>
      )}

      {reqs.length > 0 && (
        <div className="panel glass">
          <p className="panel-title">Your requests</p>
          {reqs.map((r) => (
            <div key={r.id} className="key-row">
              <div><div className="mono">{r.method} · {r.trx_id}</div><div className="prod-meta">{new Date(r.created_at).toLocaleString()}</div></div>
              <span className={cn("badge", r.status === "approved" ? "badge-ok" : "badge-off")}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
