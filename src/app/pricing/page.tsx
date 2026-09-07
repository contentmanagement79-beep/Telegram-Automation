import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { pricing, site, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `Pricing — ${BRAND}` };

export default function PricingPage() {
  return (
    <section className="price">
      <Reveal className="price-head">
        <h1 className="h2 balance">Start free. <span className="gradient-text">Scale later.</span></h1>
        <p className="section-sub">Bring your own key and run it for free today, or wait for the fully managed plan.</p>
      </Reveal>

      <div className="price-grid">
        {pricing.map((t, i) => (
          <Reveal key={t.name} delay={i * 110} className={cn("tier glass", t.highlight && "pop")}>
            <div className="tier-head">
              <span className={cn("tier-tag", t.highlight && "pop")}>{t.name}</span>
              {t.highlight && <span className="badge badge-violet">Most popular</span>}
            </div>
            <div>
              <span className="tier-price">{t.price}</span>
              {t.cadence && <span className="tier-cadence">{t.cadence}</span>}
            </div>
            <p className="tier-blurb">{t.blurb}</p>
            <ul className="tier-list">
              {t.features.map((f) => (
                <li key={f} className={cn("tier-li", t.highlight && "pop")}><CheckCircle2 size={18} /> {f}</li>
              ))}
            </ul>
            <div className="tier-cta">
              {t.highlight ? (
                <Link href={site.links.signup} className="btn btn-glow btn-block"><span>{t.cta} <ArrowRight size={16} /></span></Link>
              ) : (
                <Link href={site.links.signup} className="btn btn-outline btn-block">{t.cta}</Link>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
