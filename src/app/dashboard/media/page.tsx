"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Plus, UploadCloud } from "lucide-react";
import { Field } from "@/components/sections/auth-card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Cloud = { id: string; cloud_name: string; upload_preset: string; status: string };
type Media = { id: string; name: string; keyword: string | null; kind: string; blur: boolean; spoiler: boolean; self_destruct: boolean; url: string };

export default function MediaPage() {
  const supabase = createClient();
  const [uid, setUid] = useState<string | null>(null);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [items, setItems] = useState<Media[]>([]);
  const [maxPhoto, setMaxPhoto] = useState(10);
  const [maxVideo, setMaxVideo] = useState(50);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  // add-cloud form
  const [cloudName, setCloudName] = useState("");
  const [preset, setPreset] = useState("");

  // upload form
  const [file, setFile] = useState<File | null>(null);
  const [mName, setMName] = useState("");
  const [mKeyword, setMKeyword] = useState("");
  const [mCaption, setMCaption] = useState("");
  const [blur, setBlur] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadAll(userId: string) {
    const [c, m, s] = await Promise.all([
      supabase.from("cloudinary_accounts").select("id,cloud_name,upload_preset,status").eq("user_id", userId).order("created_at"),
      supabase.from("media_items").select("id,name,keyword,kind,blur,spoiler,self_destruct,url").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("media_settings").select("max_photo_mb,max_video_mb").eq("user_id", userId).maybeSingle(),
    ]);
    setClouds((c.data as Cloud[]) ?? []);
    setItems((m.data as Media[]) ?? []);
    if (s.data) { setMaxPhoto(s.data.max_photo_mb); setMaxVideo(s.data.max_video_mb); }
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

  async function addCloud(e: React.FormEvent) {
    e.preventDefault(); setNote(null);
    if (!uid) return;
    if (!cloudName.trim() || !preset.trim()) return setNote({ ok: false, msg: "Cloud name and preset required." });
    const { error } = await supabase.from("cloudinary_accounts").insert({ user_id: uid, cloud_name: cloudName.trim(), upload_preset: preset.trim() });
    if (error) return setNote({ ok: false, msg: error.message });
    setCloudName(""); setPreset(""); loadAll(uid);
  }
  async function delCloud(id: string) { await supabase.from("cloudinary_accounts").delete().eq("id", id); if (uid) loadAll(uid); }

  async function saveLimits() {
    if (!uid) return;
    setNote(null);
    const { error } = await supabase.from("media_settings").upsert({ user_id: uid, max_photo_mb: maxPhoto, max_video_mb: maxVideo, updated_at: new Date().toISOString() });
    setNote(error ? { ok: false, msg: error.message } : { ok: true, msg: "Limits saved." });
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault(); setNote(null);
    if (!uid) return;
    if (!file) return setNote({ ok: false, msg: "Choose a file." });
    if (!mName.trim()) return setNote({ ok: false, msg: "Give the media a name." });
    const active = clouds.find((c) => c.status === "active");
    if (!active) return setNote({ ok: false, msg: "Add a Cloudinary account first." });

    const isVideo = file.type.startsWith("video/");
    const limit = (isVideo ? maxVideo : maxPhoto) * 1024 * 1024;
    if (file.size > limit) return setNote({ ok: false, msg: `File too big. Max ${isVideo ? maxVideo : maxPhoto} MB.` });

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", active.upload_preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${active.cloud_name}/auto/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        setUploading(false);
        return setNote({ ok: false, msg: data.error?.message || "Upload failed (check preset is UNSIGNED)." });
      }
      const kind = data.resource_type === "video" ? "video" : "image";
      const { error } = await supabase.from("media_items").insert({
        user_id: uid, name: mName.trim(), keyword: mKeyword.trim() || null, caption: mCaption.trim() || null,
        url: data.secure_url, public_id: data.public_id, kind, blur, spoiler, self_destruct: selfDestruct,
      });
      setUploading(false);
      if (error) return setNote({ ok: false, msg: error.message });
      setFile(null); setMName(""); setMKeyword(""); setMCaption(""); setBlur(false); setSpoiler(false); setSelfDestruct(false);
      setNote({ ok: true, msg: "Media added." });
      loadAll(uid);
    } catch (err) {
      setUploading(false);
      setNote({ ok: false, msg: "Upload error." });
    }
  }
  async function delMedia(id: string) { await supabase.from("media_items").delete().eq("id", id); if (uid) loadAll(uid); }

  if (loading) return <section className="dash"><p className="muted">Loading…</p></section>;

  return (
    <section className="dash" style={{ maxWidth: "46rem" }}>
      <Link href="/dashboard" className="back-link"><ChevronLeft size={16} /> Back to dashboard</Link>
      <h1 className="dash-title">Media library</h1>
      <p className="muted" style={{ marginTop: 8 }}>Upload photos/videos the assistant can send when a customer asks (matched by keyword).</p>

      {/* Cloudinary accounts */}
      <div className="panel glass" style={{ marginTop: 28 }}>
        <p className="panel-title">Cloudinary accounts</p>
        <p className="panel-desc">Free 25GB media hosting. In Cloudinary → Settings → Upload → add an <strong>unsigned</strong> upload preset. Add multiple accounts; when one fills up, disable it and the next is used.</p>
        <form className="form" onSubmit={addCloud}>
          <div className="form-grid">
            <Field label="Cloud name" value={cloudName} onChange={(e) => setCloudName(e.target.value)} placeholder="dxxxxx" />
            <Field label="Unsigned upload preset" value={preset} onChange={(e) => setPreset(e.target.value)} placeholder="autogram_unsigned" />
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: "fit-content" }}><Plus size={15} /> Add account</button>
        </form>
        <div style={{ marginTop: 16 }}>
          {clouds.length === 0 ? <p className="empty">No Cloudinary account yet.</p> : clouds.map((c) => (
            <div key={c.id} className="key-row">
              <div><div className="mono">{c.cloud_name}</div><div className="prod-meta">preset: {c.upload_preset} · {c.status}</div></div>
              <button className="icon-btn" onClick={() => delCloud(c.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* limits */}
      <div className="panel glass">
        <p className="panel-title">Size limits</p>
        <div className="form-grid">
          <label style={{ display: "block" }}><span className="field-label">Max photo (MB)</span><input className="field-input" type="number" value={maxPhoto} onChange={(e) => setMaxPhoto(Number(e.target.value))} /></label>
          <label style={{ display: "block" }}><span className="field-label">Max video (MB)</span><input className="field-input" type="number" value={maxVideo} onChange={(e) => setMaxVideo(Number(e.target.value))} /></label>
        </div>
        <div className="save-bar"><button className="btn btn-outline btn-sm" onClick={saveLimits}>Save limits</button></div>
      </div>

      {/* upload */}
      <div className="panel glass">
        <p className="panel-title">Add media</p>
        <form className="form" onSubmit={upload}>
          <label style={{ display: "block" }}>
            <span className="field-label">File (photo or video)</span>
            <input className="field-input" type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <div className="form-grid">
            <Field label="Name" value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Sample screenshot" />
            <Field label="Trigger keyword(s)" value={mKeyword} onChange={(e) => setMKeyword(e.target.value)} placeholder="sample, demo, preview" />
          </div>
          <Field label="Caption (sent with it)" value={mCaption} onChange={(e) => setMCaption(e.target.value)} placeholder="Here's a preview 🙂" />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 4 }}>
            <Toggle label="Blur" on={blur} set={setBlur} />
            <Toggle label="Spoiler" on={spoiler} set={setSpoiler} />
            <Toggle label="Self-destruct" on={selfDestruct} set={setSelfDestruct} />
          </div>
          {note && <p className={cn(note.ok ? "save-note ok" : "form-error")}>{note.msg}</p>}
          <button className="btn btn-primary" disabled={uploading}><UploadCloud size={16} /> {uploading ? "Uploading…" : "Upload & add"}</button>
        </form>
      </div>

      {/* list */}
      <div className="panel glass">
        <p className="panel-title">Your media {items.length > 0 && <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>· {items.length}</span>}</p>
        {items.length === 0 ? <p className="empty">No media yet.</p> : items.map((m) => (
          <div key={m.id} className="key-row">
            <div>
              <div className="prod-name">{m.name} <span className="muted" style={{ fontWeight: 400 }}>· {m.kind}</span></div>
              <div className="prod-meta">
                {m.keyword ? `keyword: ${m.keyword}` : "no keyword"}
                {m.blur && " · blur"}{m.spoiler && " · spoiler"}{m.self_destruct && " · self-destruct"}
              </div>
            </div>
            <button className="icon-btn" onClick={() => delMedia(m.id)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" className={cn("switch", on && "on")} onClick={() => set(!on)} aria-pressed={on}><span className="switch-knob" /></button>
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
