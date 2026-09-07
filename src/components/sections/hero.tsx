import Link from "next/link";
import { ArrowRight, Play, Sparkles, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { ChatDemo } from "@/components/sections/chat-demo";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative px-6 pb-8 pt-36 text-center sm:pt-44">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-violet/10 px-4 py-1.5 text-sm text-violet-soft backdrop-blur-md transition-colors hover:bg-violet/20"
          >
            <Sparkles size={15} /> {site.brand} is live
            <span className="mx-1 h-4 w-px bg-violet/30" />
            <span className="flex items-center gap-1 text-cloud">See how it works <ChevronRight size={13} /></span>
          </Link>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mx-auto mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.03] sm:text-7xl">
            Your business, answered <span className="text-gradient">while you sleep.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            {site.brand} turns the Telegram you already use into an assistant that replies to
            customers in your voice — reading their photos, voice notes and files, and handing
            back to you whenever you want.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={site.links.signup}
              className="glow-border group inline-flex h-[3.25rem] items-center gap-2 px-8 text-base font-semibold text-white"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Start free <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-[3.25rem] items-center gap-2 rounded-full border border-line bg-white/5 px-8 text-base font-medium text-cloud backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <Play size={16} className="text-violet-soft" /> See how it works
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">No new number. No coding. Live in minutes.</p>
        </Reveal>
      </div>

      <Reveal delay={360}>
        <ChatDemo />
      </Reveal>
    </section>
  );
}
