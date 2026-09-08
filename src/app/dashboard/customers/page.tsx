"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Bot, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Customer = { customer_id: number; last_msg_at: string; via: string };
type Profile = { customer_id: number; summary: string | null };

export default function CustomersPage() {
  const [rows, setRows] = useState<(Customer & { summary: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [cust, prof] = await Promise.all([
        supabase.from("customers").select("customer_id,last_msg_at,via").eq("user_id", user.id).order("last_msg_at", { ascending: false }).limit(200),
        supabase.from("customer_profiles").select("customer_id,summary").eq("user_id", user.id),
      ]);
      const summaries = new Map<number, string | null>();
      ((prof.data as Profile[]) ?? []).forEach((p) => summaries.set(p.customer_id, p.summary));
      const merged = ((cust.data as Customer[]) ?? []).map((c) => ({ ...c, summary: summaries.get(c.customer_id) ?? null }));
      setRows(merged);
      setLoading(false);
    })();
  }, []);

  function ago(iso: string) {
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  }

  return (
    <section className="dash">
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Customers</h1>
      <p className="muted" style={{ marginTop: 8 }}>Everyone who&apos;s messaged you, with a short summary of what they wanted. Summaries refresh daily.</p>

      <div style={{ marginTop: 28 }}>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="empty">No customers yet. They appear here once people message your assistant.</p>
        ) : (
          rows.map((c) => (
            <div key={c.customer_id} className="convo">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div className="convo-head" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  {c.via === "bot" ? <Bot size={15} /> : <User size={15} />}
                  Customer #{c.customer_id}
                  <span className={cn("badge", c.via === "bot" ? "badge-ok" : "badge-off")} style={{ fontSize: 11 }}>
                    {c.via === "bot" ? "bot" : "personal"}
                  </span>
                </div>
                <span className="muted" style={{ fontSize: 13 }}>{ago(c.last_msg_at)}</span>
              </div>
              <p className="muted" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5 }}>
                {c.summary || "No summary yet — will be generated after a few messages."}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
