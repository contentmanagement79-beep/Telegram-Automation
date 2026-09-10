"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: string | null;
  description: string | null;
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);
  const [draft, setDraft] = useState({ name: "", category: "", price: "", description: "" });

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("id,name,category,price,description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as Product[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    setNote(null);
    if (!draft.name.trim()) return setNote({ ok: false, msg: "Name is required." });
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return setNote({ ok: false, msg: "Not signed in." }); }
    const { error } = await supabase.from("products").insert({
      user_id: user.id,
      name: draft.name.trim(),
      category: draft.category.trim() || null,
      price: draft.price.trim() || null,
      description: draft.description.trim() || null,
    });
    setSaving(false);
    if (error) return setNote({ ok: false, msg: error.message });
    setDraft({ name: "", category: "", price: "", description: "" });
    setNote({ ok: true, msg: "Added." });
    load();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setItems((xs) => xs.filter((x) => x.id !== id));
  }

  return (
    <section className="dash">
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Products</h1>
      <p className="muted" style={{ marginTop: 8 }}>Your catalog. The assistant quotes prices only from here — so it never makes them up.</p>

      <div style={{ marginTop: 32 }}>
        <div className="panel glass">
          <p className="panel-title">Add a product</p>
          <p className="panel-desc">Name is required; the rest is optional.</p>
          <div className="form-grid">
            <Field label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Next.js SaaS template" />
            <Field label="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Source code" />
            <Field label="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="$49" />
            <Field label="Short description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Auth + Stripe + dashboard" />
          </div>
          <div className="save-bar">
            <button className="btn btn-primary" onClick={add} disabled={saving}><Plus size={16} /> {saving ? "Adding…" : "Add product"}</button>
            {note && <span className={cn("save-note", note.ok ? "ok" : "err")}>{note.msg}</span>}
          </div>
        </div>

        <div className="panel glass">
          <p className="panel-title">Your products {items.length > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {items.length}</span>}</p>
          {loading ? (
            <p className="empty">Loading…</p>
          ) : items.length === 0 ? (
            <p className="empty">No products yet. Add your first one above.</p>
          ) : (
            <div style={{ marginTop: 8 }}>
              {items.map((p) => (
                <div key={p.id} className="prod-item">
                  <div>
                    <div className="prod-name">{p.name}{p.price && <span className="muted" style={{ fontWeight: 400 }}> · {p.price}</span>}</div>
                    <div className="prod-meta">{[p.category, p.description].filter(Boolean).join(" — ") || "No details"}</div>
                  </div>
                  <button className="icon-btn" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
