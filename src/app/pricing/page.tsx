import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { pricing, site, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `Pricing — ${BRAND}` };

// PRICING — /pricing. Tier data lives in src/lib/site.ts.
export default function PricingPage() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-36 lg:px-8 sm:pt-44">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
          Start free. <span className="text-gradient">Scale later.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Bring your own key and run it for free today, or wait for the fully managed plan.
        </p>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
        {pricing.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 110} className="[&>*]:h-full">
            <div
              className={cn("glass flex flex-col rounded-3xl p-10", tier.highlight && "border-violet/40")}
              style={tier.highlight ? { boxShadow: "0 0 0 1px rgba(109,94,246,.35), 0 40px 80px -30px rgba(109,94,246,.5)" } : undefined}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className={cn("w-fit rounded-full border px-3 py-1 text-xs uppercase tracking-wider", tier.highlight ? "border-violet/30 bg-violet/15 text-violet-soft" : "border-line bg-white/5 text-muted")}>
                  {tier.name}
                </span>
                {tier.highlight && <span className="rounded-full bg-gradient-to-r from-violet to-iris px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
              </div>

              <div className="flex items-end gap-2">
                <span className="font-display text-5xl">{tier.price}</span>
                {tier.cadence && <span className="pb-1.5 text-lg text-muted">{tier.cadence}</span>}
              </div>
              <p className="mt-4 border-b border-line pb-8 text-muted">{tier.blurb}</p>

              <ul className="mt-8 flex-1 space-y-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-cloud/90">
                    <CheckCircle2 size={18} className={cn("shrink-0", tier.highlight ? "text-iris" : "text-violet-soft")} /> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                {tier.highlight ? (
                  <Link href={site.links.signup} className="glow-border group inline-flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-white">
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {tier.cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                ) : (
                  <Link href={site.links.signup} className="inline-flex h-12 w-full items-center justify-center rounded-full border border-line bg-white/5 text-sm font-semibold text-cloud transition-colors hover:bg-white/10">
                    {tier.cta}
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
