import type { Metadata } from "next";
import { Shield, Cpu, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Cta } from "@/components/sections/cta";
import { steps, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `How it works — ${BRAND}` };

const icons = [Shield, Cpu, Zap];

export default function HowItWorksPage() {
  return (
    <>
      <section className="how">
        <Reveal className="how-head">
          <h1 className="h2 balance">Three steps to <span className="gradient-text">automation.</span></h1>
          <p className="section-sub">A guided setup that gets your assistant live without touching a single line of code.</p>
        </Reveal>

        <div className="steps">
          <div className="step-line" />
          {steps.map((s, i) => {
            const Icon = icons[i] ?? Shield;
            const right = i % 2 === 1;
            return (
              <Reveal key={s.num} delay={i * 120}>
                <div className={cn("step", right && "right")}>
                  <div className={cn("step-side", right ? "r" : "l")}>
                    <h3 className="step-title"><span className="step-ico"><Icon size={20} /></span>{s.title}</h3>
                    <p className="step-body">{s.body}</p>
                  </div>
                  <div className="step-num">{s.num}</div>
                  <div className="step-card glass">
                    <div className="step-bar" style={{ width: "33%" }} />
                    <div className="step-bar" style={{ width: "100%" }} />
                    <div className="step-bar" style={{ width: "83%" }} />
                    <div className="step-bar" style={{ width: "66%", marginBottom: 0 }} />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Cta title="Set it up once." subtitle="From the account you already have to an assistant that never clocks out." />
    </>
  );
}
