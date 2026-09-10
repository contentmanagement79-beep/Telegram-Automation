"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Reveal } from "@/components/ui/reveal";
import { createClient } from "@/lib/supabase/client";

const LABELS: Record<string, string> = {
  media: "Media library + smart send", voice: "Voice replies", followups: "Follow-up automation",
  integration: "Website / API integration", conversations: "Conversations viewer",
  customers: "Customers + summaries", business_hours: "Business hours", bot_mode: "Bot mode",
};
const BASE = ["Connect Telegram (bot + personal)", "Persona & tone", "Products catalog"];

export default function PricingPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [mon, setMon] = useState(false);
  const [managedAi, setManagedAi] = useState(false);
  const [managedVoice, setManagedVoice] = useState(false);
  const [price, setPrice] = useState("");
  const [flags, setFlags] = useState<{ key: string; tier: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: u }, s, f] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("platform_settings").select("monetization_on,price_text,managed_ai_on,managed_voice_on").eq("id", 1).maybeSingle(),
        supabase.from("feature_flags").select("key,tier"),
      ]);
      setUser(u.user);
      setMon(s.data?.monetization_on ?? false);
      setManagedAi(s.data?.managed_ai_on ?? false);
      setManagedVoice(s.data?.managed_voice_on ?? false);
      setPrice(s.data?.price_text ?? "");
      setFlags(f.data ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const freeFeatures = flags.filter((f) => f.tier !== "pro").map((f) => LABELS[f.key] || f.key);
  const proFeatures = flags.filter((f) => f.tier === "pro").map((f) => LABELS[f.key] || f.key);

  if (loading) return <section className="price"><p className="muted center">Loading…</p></section>;

  return (
    <section className="price">
      <Reveal className="price-head">
        <h1 className="h2 balance">Start free. <span className="gradient-text">Scale later.</span></h1>
        <p className="section-sub">
          {mon ? "Run the essentials free. Unlock the Pro features with a subscription." : "Everything is free right now — connect and go live."}
        </p>
      </Reveal>

      <div className="price-grid">
        <Reveal className="tier glass">
          <div className="tier-head"><span className="tier-tag">Free</span></div>
          <div><span className="tier-price">৳0</span><span className="tier-cadence">/ forever</span></div>
          <p className="tier-blurb">Everything you need to start, with your own Gemini key.</p>
          <ul className="tier-list">
            <li className="tier-li"><CheckCircle2 size={18} /> Your own Gemini key</li>
            {[...BASE, ...(mon ? freeFeatures : [...freeFeatures, ...proFeatures])].map((f) => (
              <li key={f} className="tier-li"><CheckCircle2 size={18} /> {f}</li>
            ))}
          </ul>
          <div className="tier-cta">
            <Link href={user ? "/dashboard" : "/signup"} className="btn btn-outline btn-block">{user ? "Open dashboard" : "Start free"}</Link>
          </div>
        </Reveal>

        {mon && (
          <Reveal delay={110} className="tier glass pop">
            <div className="tier-head"><span className="tier-tag pop">Pro</span><span className="badge badge-violet">Most popular</span></div>
            <div><span className="tier-price">{price || "Pro"}</span></div>
            <p className="tier-blurb">Everything in Free, plus the Pro features.</p>
            <ul className="tier-list">
              {managedAi && <li className="tier-li pop"><CheckCircle2 size={18} /> AI key included — no Gemini key needed</li>}
              {managedVoice && <li className="tier-li pop"><CheckCircle2 size={18} /> Premium voice included</li>}
              {(proFeatures.length ? proFeatures : ["All premium features"]).map((f) => (
                <li key={f} className="tier-li pop"><CheckCircle2 size={18} /> {f}</li>
              ))}
            </ul>
            <div className="tier-cta">
              <Link href={user ? "/dashboard/upgrade" : "/signup"} className="btn btn-glow btn-block"><span>{user ? "Upgrade to Pro" : "Start free"}</span></Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
