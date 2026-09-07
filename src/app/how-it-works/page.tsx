import type { Metadata } from "next";
import { Shield, Cpu, Zap, CheckCircle2, Lock, Sparkles, Radio } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Cta } from "@/components/sections/cta";
import { steps, BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: `How it works — ${BRAND}` };

const icons = [Shield, Cpu, Zap];

export default function HowItWorksPage() {
  return (
    <>
      {/* Scoped CSS for the point and step animations */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(109, 94, 246, 0.7);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 28px 10px rgba(168, 85, 247, 0.4);
            opacity: 1;
          }
          100% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(109, 94, 246, 0.7);
            opacity: 0.9;
          }
        }

        @keyframes line-glow {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }

        @keyframes shimmer-wave {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .step-num-animated {
          position: relative;
          z-index: 2;
          width: 68px;
          height: 68px;
          flex-shrink: 0;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 30% 30%, #1f233a, #0d0f1a);
          border: 2px solid rgba(139, 124, 248, 0.5);
          font-family: var(--font-display, sans-serif);
          font-size: 22px;
          font-weight: 700;
          color: #f4f5fb;
          animation: pulse-ring 3.2s ease-in-out infinite;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .step-num-animated:hover {
          transform: scale(1.12);
          border-color: rgba(168, 85, 247, 0.8);
        }

        .step-num-aura {
          position: absolute;
          inset: -10px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(109, 94, 246, 0.35) 0%, transparent 70%);
          pointer-events: none;
          z-index: -1;
          animation: float 4s ease-in-out infinite;
        }

        .step-line-beam {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 90px;
          background: linear-gradient(180deg, transparent, var(--violet-soft), var(--iris), transparent);
          animation: line-glow 4.5s ease-in-out infinite;
        }

        .animated-bar {
          height: 10px;
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(139,124,248,0.28) 50%, rgba(255,255,255,0.06) 75%);
          background-size: 200% 100%;
          animation: shimmer-wave 2.6s linear infinite;
        }

        .step-mockup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line);
          backdrop-filter: blur(8px);
        }
      `}</style>

      <section className="how">
        <Reveal className="how-head">
          <h1 className="h2 balance">
            Three steps to <span className="gradient-text">automation.</span>
          </h1>
          <p className="section-sub">
            A guided setup that gets your assistant live without touching a single line of code.
          </p>
        </Reveal>

        <div className="steps">
          {/* Timeline Line with traveling light beam */}
          <div className="step-line" style={{ overflow: "hidden" }}>
            <div className="step-line-beam" />
          </div>

          {steps.map((s, i) => {
            const Icon = icons[i] ?? Shield;
            const right = i % 2 === 1;

            return (
              <Reveal key={s.num} delay={i * 120}>
                <div className={cn("step", right && "right")}>
                  {/* Text Description */}
                  <div className={cn("step-side", right ? "r" : "l")}>
                    <h3 className="step-title">
                      <span className="step-ico">
                        <Icon size={20} />
                      </span>
                      {s.title}
                    </h3>
                    <p className="step-body">{s.body}</p>
                  </div>

                  {/* Animated Point / Milestone Node */}
                  <div className="step-num-animated">
                    <div className="step-num-aura" />
                    <span>{s.num}</span>
                  </div>

                  {/* Visual Step Card with Animated Status Mockups */}
                  <div className="step-card glass glass-hover">
                    {i === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="step-mockup-badge" style={{ color: "var(--mint)" }}>
                            <span className="dot" style={{ background: "var(--mint)", boxShadow: "0 0 8px var(--mint)" }} />
                            Telegram Session Active
                          </span>
                          <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Lock size={12} /> AES-256 Encrypted
                          </span>
                        </div>
                        <div className="animated-bar" style={{ width: "45%" }} />
                        <div className="animated-bar" style={{ width: "95%" }} />
                        <div className="animated-bar" style={{ width: "70%", marginBottom: 0 }} />
                      </div>
                    )}

                    {i === 1 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="step-mockup-badge" style={{ color: "var(--violet-soft)" }}>
                            <Sparkles size={13} /> Gemini 1.5 Pro (BYOK)
                          </span>
                          <span className="step-mockup-badge" style={{ color: "var(--sky)" }}>
                            <CheckCircle2 size={13} /> Guardrails Locked
                          </span>
                        </div>
                        <div className="animated-bar" style={{ width: "60%" }} />
                        <div className="animated-bar" style={{ width: "100%" }} />
                        <div className="animated-bar" style={{ width: "80%", marginBottom: 0 }} />
                      </div>
                    )}

                    {i === 2 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="step-mockup-badge" style={{ color: "var(--mint)" }}>
                            <Radio size={13} className="rec-icon" /> 24/7 Live Monitoring
                          </span>
                          <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--iris)", background: "rgba(168,85,247,0.12)", padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(168,85,247,0.25)" }}>
                            //stop
                          </span>
                        </div>
                        <div className="animated-bar" style={{ width: "40%" }} />
                        <div className="animated-bar" style={{ width: "88%" }} />
                        <div className="animated-bar" style={{ width: "55%", marginBottom: 0 }} />
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Cta
        title="Set it up once."
        subtitle="From the account you already have to an assistant that never clocks out."
      />
    </>
  );
}
