import Link from "next/link";
import { Play, Sparkles, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { ChatDemo } from "@/components/sections/chat-demo";
import { AuthCta } from "@/components/sections/auth-cta";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <Reveal>
            <Link href="/how-it-works" className="eyebrow">
              <Sparkles size={15} /> {site.brand} is live
              <span className="eyebrow-sep" />
              <span className="eyebrow-more">See how it works <ChevronRight size={13} /></span>
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="hero-title balance">
              Your business, answered <span className="gradient-text">while you sleep.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="hero-sub">
              {site.brand} turns the Telegram you already use into an assistant that replies to
              customers in your voice — reading their photos, voice notes and files, and handing
              back to you whenever you want.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="hero-actions">
              <AuthCta className="btn btn-glow" />
              <Link href="/how-it-works" className="btn btn-outline">
                <Play size={16} /> See how it works
              </Link>
            </div>
            <p className="hero-note">No new number. No coding. Live in minutes.</p>
          </Reveal>
        </div>

        <Reveal delay={360}>
          <ChatDemo />
        </Reveal>
      </div>
    </section>
  );
}
