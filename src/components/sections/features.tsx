import { ShieldCheck, Hand, Mic, Lock, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { features } from "@/lib/site";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  guardrails: ShieldCheck,
  takeover: Hand,
  media: Mic,
  isolation: Lock,
};

const glows: Record<string, string> = {
  guardrails: "rgba(109,94,246,.2)",
  takeover: "rgba(168,85,247,.2)",
  media: "rgba(56,189,248,.2)",
  isolation: "rgba(61,220,151,.15)",
};

export function Features() {
  return (
    <section className="features section container">
      <Reveal className="feat-head">
        <h2 className="h2">Architected for <span className="gradient-text">conversion.</span></h2>
        <p className="section-sub">Every part is built to turn your Telegram inbox into a calm, reliable sales desk.</p>
      </Reveal>

      <div className="bento">
        {features.map((f, i) => {
          const Icon = icons[f.key] ?? ShieldCheck;
          const lead = f.size === "lead";
          return (
            <Reveal key={f.key} delay={(i % 3) * 90} className={cn("feat glass glass-hover", f.size)}>
              <div className="feat-glow" style={{ background: glows[f.key] }} />
              <span className={cn("feat-icon", lead && "lead")}><Icon size={lead ? 22 : 20} /></span>
              <h3 className={cn("feat-title", lead && "lead")}>{f.title}</h3>
              <p className={cn("feat-body", lead && "lead")}>{f.body}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
